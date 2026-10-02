-- Leaderboard: display names, per-day results, and the RPCs the app calls.
-- Ranking: problems solved (all-time), then fewer wrong attempts, then who reached that total first.

-- Profiles ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null
    check (char_length(display_name) between 2 and 24 and display_name = btrim(display_name) and display_name !~ '[[:cntrl:]]'),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon;

-- Others' names are only exposed through public.leaderboard().
create policy "Users can read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "Users can update their own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Fallback name for users without a valid display_name: "cha•••" from "chaochen@…".
create function public.masked_email_name(email text)
returns text
language sql
immutable
set search_path = ''
as $$
  select coalesce(nullif(left(split_part(email, '@', 1), 3), '') || '•••', 'Player');
$$;

-- The app passes display_name in sign-up metadata (validated by the signUp action).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  name text := btrim(coalesce(new.raw_user_meta_data ->> 'display_name', ''));
begin
  if char_length(name) not between 2 and 24 or name ~ '[[:cntrl:]]' then
    name := public.masked_email_name(new.email);
  end if;
  insert into public.profiles (id, display_name) values (new.id, name);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill users who signed up before this migration.
insert into public.profiles (id, display_name)
select id, public.masked_email_name(email) from auth.users
on conflict (id) do nothing;

-- Results -------------------------------------------------------------------

-- One row per user, UTC day and mode. Rows are written only through public.record_attempt().
create table public.results (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null default (now() at time zone 'utc')::date,
  mode text not null check (mode in ('read', 'listen')),
  problem_id text not null,
  wrong_attempts integer not null default 0 check (wrong_attempts >= 0),
  solved_at timestamptz,
  primary key (user_id, day, mode)
);

alter table public.results enable row level security;
revoke all on public.results from anon;

create policy "Users can read their own results" on public.results
  for select to authenticated using ((select auth.uid()) = user_id);

-- Only today's row (UTC) can be written, which caps a user at 2 points per day.
create policy "Users can add today's result" on public.results
  for insert to authenticated
  with check ((select auth.uid()) = user_id and day = (now() at time zone 'utc')::date);

create policy "Users can update today's result" on public.results
  for update to authenticated
  using ((select auth.uid()) = user_id and day = (now() at time zone 'utc')::date)
  with check ((select auth.uid()) = user_id and day = (now() at time zone 'utc')::date);

-- Records one checked answer. Runs as the caller, so the RLS policies above apply.
-- Wrong attempts after the problem is solved don't count.
create function public.record_attempt(p_mode text, p_problem_id text, p_correct boolean)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.results as r (user_id, day, mode, problem_id, wrong_attempts, solved_at)
  values (
    (select auth.uid()),
    (now() at time zone 'utc')::date,
    p_mode,
    p_problem_id,
    case when p_correct then 0 else 1 end,
    case when p_correct then now() end
  )
  on conflict (user_id, day, mode) do update set
    wrong_attempts = r.wrong_attempts + case when r.solved_at is null and not p_correct then 1 else 0 end,
    solved_at = coalesce(r.solved_at, excluded.solved_at)
  where r.problem_id = excluded.problem_id;
$$;

revoke execute on function public.record_attempt(text, text, boolean) from public, anon;
grant execute on function public.record_attempt(text, text, boolean) to authenticated;

-- Leaderboard ---------------------------------------------------------------

-- Top p_limit players plus the caller's own row. Returns aggregates and display names only.
create function public.leaderboard(p_limit integer default 20)
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

revoke execute on function public.leaderboard(integer) from public, anon;
grant execute on function public.leaderboard(integer) to authenticated;
