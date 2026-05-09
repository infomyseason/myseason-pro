-- Profiles (1:1 with auth.users), favourites, and calendar / season data.
-- Run via Supabase CLI or paste into SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  login_name text,
  display_name text,
  avatar_url text not null default '',
  bio text not null default '',
  location_line text not null default '',
  favourite_sport_keys text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_login_name_lower_unique
  on public.profiles (lower(trim(login_name)))
  where login_name is not null and trim(login_name) <> '';

create table if not exists public.user_season_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  planned_race_ids text[] not null default '{}',
  completed_race_ids text[] not null default '{}',
  calendar_entries jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_favourite_races (
  user_id uuid not null references auth.users (id) on delete cascade,
  race_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, race_id)
);

create index if not exists user_favourite_races_user_id_idx on public.user_favourite_races (user_id);

-- New auth user: seed profile + season row from signup metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_login text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'login_name', '')), '');
  v_display text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '');
begin
  insert into public.profiles (id, display_name, login_name)
  values (
    new.id,
    coalesce(v_display, split_part(coalesce(new.email, ''), '@', 1), 'Athlete'),
    v_login
  );

  insert into public.user_season_data (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Anonymous signup UX: check login name before signUp (security definer bypasses RLS).
create or replace function public.login_name_available(p_login text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1
    from public.profiles p
    where p.login_name is not null
      and trim(p.login_name) <> ''
      and lower(trim(p.login_name)) = lower(trim(p_login))
  );
$$;

grant execute on function public.login_name_available(text) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.user_season_data enable row level security;
alter table public.user_favourite_races enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "season_select_own" on public.user_season_data;
create policy "season_select_own" on public.user_season_data for select using (auth.uid() = user_id);

drop policy if exists "season_insert_own" on public.user_season_data;
create policy "season_insert_own" on public.user_season_data for insert with check (auth.uid() = user_id);

drop policy if exists "season_update_own" on public.user_season_data;
create policy "season_update_own" on public.user_season_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "season_delete_own" on public.user_season_data;
create policy "season_delete_own" on public.user_season_data for delete using (auth.uid() = user_id);

drop policy if exists "favourites_select_own" on public.user_favourite_races;
create policy "favourites_select_own" on public.user_favourite_races for select using (auth.uid() = user_id);

drop policy if exists "favourites_insert_own" on public.user_favourite_races;
create policy "favourites_insert_own" on public.user_favourite_races for insert with check (auth.uid() = user_id);

drop policy if exists "favourites_delete_own" on public.user_favourite_races;
create policy "favourites_delete_own" on public.user_favourite_races for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_season_data to authenticated;
grant select, insert, delete on public.user_favourite_races to authenticated;
