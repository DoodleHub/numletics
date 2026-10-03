-- Display names are unique, ignoring case: "Chao" and "chao" can't both exist.

create unique index profiles_display_name_key on public.profiles (lower(display_name));

-- Lets the sign-up form say "that name is taken" before creating the account.
-- Names are already public on the leaderboard, so this reveals nothing new.
create function public.display_name_available(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (select 1 from public.profiles where lower(display_name) = lower(btrim(p_name)));
$$;

revoke execute on function public.display_name_available(text) from public;
grant execute on function public.display_name_available(text) to anon, authenticated;

-- A taken name from the app now fails the insert, which fails the sign-up (the action re-checks and reports it).
-- Fallback names like "cha•••" can repeat, so they get a short id suffix when taken.
create or replace function public.handle_new_user()
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
    if exists (select 1 from public.profiles where lower(display_name) = lower(name)) then
      name := name || left(replace(new.id::text, '-', ''), 6);
    end if;
  end if;
  insert into public.profiles (id, display_name) values (new.id, name);
  return new;
end;
$$;
