-- Local-time pushes, replacing the single 00:00 UTC send from 20261003001221_daily_push.sql.
-- A problem set is live for one UTC day. pg_cron now calls daily-push every hour, and
-- private.claim_due_pushes() decides per subscription in its saved time zone:
--   morning  once per set, 08:00–11:59 local: "today's problems are ready", or a rank drop since the
--            last morning push.
--   evening  once per set, for players who haven't solved both problems: at 19:00 local, or 2 hours
--            before the set changes if that comes first, between 08:00 and 21:59 local and at least
--            2 hours after the morning push. Carries the streak when nothing is solved yet today.
-- Claimed rows are marked, so extra calls to the function send nothing.

alter table public.push_subscriptions rename column last_notified_on to morning_on;

alter table public.push_subscriptions
  add column time_zone text not null default 'UTC',
  add column morning_sent_at timestamptz,
  add column evening_on date,
  add column last_rank bigint;

-- Saving now takes the browser's IANA time zone. Unknown names fall back to UTC, so
-- claim_due_pushes() never fails on a bad zone.
drop function public.save_push_subscription(text, text, text);

create function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text, p_time_zone text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  tz text := case
    when exists (select 1 from pg_catalog.pg_timezone_names where name = p_time_zone) then p_time_zone
    else 'UTC'
  end;
begin
  if (select auth.uid()) is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth, time_zone)
  values (p_endpoint, (select auth.uid()), p_p256dh, p_auth, tz)
  on conflict (endpoint) do update set
    user_id = excluded.user_id,
    p256dh = excluded.p256dh,
    auth = excluded.auth,
    time_zone = excluded.time_zone;
end;
$$;

revoke execute on function public.save_push_subscription(text, text, text, text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text, text) to authenticated;

drop function private.claim_daily_push();

-- Returns the pushes due now and marks them sent. Called by the daily-push Edge Function over its
-- direct database connection. rank uses the all-time ordering of public.leaderboard().
create function private.claim_due_pushes()
returns table (
  endpoint text,
  p256dh text,
  auth text,
  kind text,
  time_zone text,
  rank bigint,
  previous_rank bigint,
  streak integer,
  solved_today integer
)
language sql
set search_path = ''
as $$
  with clock as (
    select now() as now, (now() at time zone 'utc')::date as today
  ),
  ranks as (
    select t.user_id, row_number() over (order by t.solved desc, t.wrong_attempts, t.last_solved_at) as rank
    from (
      select r.user_id, count(r.solved_at) as solved, sum(r.wrong_attempts) as wrong_attempts, max(r.solved_at) as last_solved_at
      from public.results r
      group by r.user_id
      having count(r.solved_at) > 0
    ) t
  ),
  state as (
    select
      s.endpoint,
      s.user_id,
      s.last_rank as previous_rank,
      extract(hour from c.now at time zone s.time_zone)::int as local_hour,
      ((c.today + 1)::timestamp at time zone 'utc') - c.now as time_left,
      (select count(*) from public.results r
        where r.user_id = s.user_id and r.day = c.today and r.solved_at is not null)::int as solved_today,
      -- Consecutive days up to yesterday with at least one problem solved.
      (select count(*) from (
          select r.day, row_number() over (order by r.day desc) as n
          from public.results r
          where r.user_id = s.user_id and r.solved_at is not null and r.day < c.today
          group by r.day
        ) d
        where c.today - d.day = d.n)::int as streak,
      case
        when s.morning_on is distinct from c.today then 'morning'
        when s.evening_on is distinct from c.today and s.morning_sent_at <= c.now - interval '2 hours' then 'evening'
      end as candidate
    from public.push_subscriptions s
    cross join clock c
  ),
  due as (
    select st.*, st.candidate as kind
    from state st
    where (st.candidate = 'morning' and st.local_hour between 8 and 11)
      or (st.candidate = 'evening'
        and st.solved_today < 2
        and st.local_hour between 8 and 21
        and (st.local_hour >= 19 or st.time_left <= interval '2 hours'))
  )
  update public.push_subscriptions s set
    morning_on = case when d.kind = 'morning' then c.today else s.morning_on end,
    morning_sent_at = case when d.kind = 'morning' then c.now else s.morning_sent_at end,
    evening_on = case when d.kind = 'evening' then c.today else s.evening_on end,
    last_rank = case when d.kind = 'morning' then rk.rank else s.last_rank end
  from due d
  cross join clock c
  left join ranks rk on rk.user_id = d.user_id
  where s.endpoint = d.endpoint
    -- Re-checked against the latest row, so overlapping runs can't claim the same push twice.
    and (d.kind <> 'morning' or s.morning_on is distinct from c.today)
    and (d.kind <> 'evening' or s.evening_on is distinct from c.today)
  returning s.endpoint, s.p256dh, s.auth, d.kind, s.time_zone, rk.rank, d.previous_rank, d.streak, d.solved_today;
$$;

revoke execute on function private.claim_due_pushes() from public, anon, authenticated;

-- Same job name, so this replaces the 00:00 UTC schedule.
select cron.schedule(
  'daily-push',
  '0 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/daily-push',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
