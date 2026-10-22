-- One push a day, sent when the problems reset at 00:00 UTC, replacing the local-time morning and
-- evening pushes from 20261003002329_local_time_push.sql. The push says today's problems are
-- ready, or mentions a rank drop since the last one.

drop function private.claim_due_pushes();

alter table public.push_subscriptions rename column morning_on to notified_on;

alter table public.push_subscriptions
  drop column evening_on,
  drop column morning_sent_at;

-- Returns the pushes due now and marks them sent. Called by the daily-push Edge Function over its
-- direct database connection. rank uses the all-time ordering of public.leaderboard().
create function private.claim_due_pushes()
returns table (
  endpoint text,
  p256dh text,
  auth text,
  rank bigint,
  previous_rank bigint
)
language sql
set search_path = ''
as $$
  with clock as (
    select (now() at time zone 'utc')::date as today
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
  due as (
    select s.endpoint, s.user_id, s.last_rank as previous_rank
    from public.push_subscriptions s
    cross join clock c
    where s.notified_on is distinct from c.today
  )
  update public.push_subscriptions s set
    notified_on = c.today,
    last_rank = rk.rank
  from due d
  cross join clock c
  left join ranks rk on rk.user_id = d.user_id
  where s.endpoint = d.endpoint
    -- Re-checked against the latest row, so overlapping runs can't claim the same push twice.
    and s.notified_on is distinct from c.today
  returning s.endpoint, s.p256dh, s.auth, rk.rank, d.previous_rank;
$$;

revoke execute on function private.claim_due_pushes() from public, anon, authenticated;

-- Same job name, so this replaces the hourly schedule.
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
