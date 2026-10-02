-- Monthly leaderboard: the same ranking as all-time, counting only the current UTC calendar month.
-- p_period is 'all' or 'month'. The app always passes both arguments.
-- The old public.leaderboard(integer) is left in place (dropping it needs a destructive-statement
-- confirmation). It has no callers and can be dropped later.

create function public.leaderboard(p_limit integer, p_period text)
returns table (rank bigint, display_name text, solved bigint, wrong_attempts bigint, is_me boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with totals as (
    select
      r.user_id,
      count(r.solved_at) as solved,
      sum(r.wrong_attempts)::bigint as wrong_attempts,
      max(r.solved_at) as last_solved_at
    from public.results r
    where p_period = 'all'
      or (p_period = 'month' and r.day >= date_trunc('month', now() at time zone 'utc')::date)
    group by r.user_id
    having count(r.solved_at) > 0
  ),
  ranked as (
    select t.*, row_number() over (order by t.solved desc, t.wrong_attempts, t.last_solved_at) as rank
    from totals t
  )
  select rk.rank, p.display_name, rk.solved, rk.wrong_attempts, rk.user_id = (select auth.uid())
  from ranked rk
  join public.profiles p on p.id = rk.user_id
  where (select auth.uid()) is not null
    and (rk.rank <= least(greatest(p_limit, 1), 100) or rk.user_id = (select auth.uid()))
  order by rk.rank;
$$;

revoke execute on function public.leaderboard(integer, text) from public, anon;
grant execute on function public.leaderboard(integer, text) to authenticated;

-- The primary key leads with user_id, so the monthly filter needs its own index on day.
create index results_day_idx on public.results (day);
