-- Web push: subscriptions, and a "today's problems are ready" notification at 00:00 UTC.
-- pg_cron calls the daily-push Edge Function (supabase/functions/daily-push), which claims each
-- subscription at most once per UTC day, so extra calls to the function send nothing.
-- Needs a Vault secret named project_url (https://<ref>.supabase.co), created outside migrations:
--   select vault.create_secret('https://<ref>.supabase.co', 'project_url');

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Subscriptions -------------------------------------------------------------

-- One row per browser. The endpoint is the push service URL, unique to that browser.
create table public.push_subscriptions (
  endpoint text primary key check (endpoint ~ '^https://' and char_length(endpoint) <= 1024),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  p256dh text not null check (char_length(p256dh) between 1 and 256),
  auth text not null check (char_length(auth) between 1 and 256),
  last_notified_on date,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;
grant select, delete on public.push_subscriptions to authenticated;

create policy "Users can read their own push subscriptions" on public.push_subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users can delete their own push subscriptions" on public.push_subscriptions
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Saves the caller's subscription. Security definer because a browser's endpoint can still belong to
-- the account that used it before; holding the endpoint is proof of owning that browser, so it moves
-- to the caller.
create function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth)
  values (p_endpoint, (select auth.uid()), p_p256dh, p_auth)
  on conflict (endpoint) do update set
    user_id = excluded.user_id,
    p256dh = excluded.p256dh,
    auth = excluded.auth;
end;
$$;

revoke execute on function public.save_push_subscription(text, text, text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text) to authenticated;

-- Daily send ----------------------------------------------------------------

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Marks every subscription not yet notified today (UTC) as notified and returns it. Called by the
-- daily-push Edge Function over its direct database connection.
create function private.claim_daily_push()
returns table (endpoint text, p256dh text, auth text)
language sql
set search_path = ''
as $$
  update public.push_subscriptions s
  set last_notified_on = (now() at time zone 'utc')::date
  where s.last_notified_on is distinct from (now() at time zone 'utc')::date
  returning s.endpoint, s.p256dh, s.auth;
$$;

revoke execute on function private.claim_daily_push() from public, anon, authenticated;

select cron.schedule(
  'daily-push',
  '0 0 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/daily-push',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
