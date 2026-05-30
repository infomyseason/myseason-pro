-- Globally unique display names (case-insensitive, trimmed), same rules as login_name.
-- Pre-signup checks + auth.users email check for clearer errors before signUp.

-- Existing profiles can predate this uniqueness rule. Keep the earliest row for
-- each normalized display name and suffix later duplicates before creating the
-- index, otherwise the migration aborts on production data.
with ranked_profiles as (
  select
    id,
    row_number() over (
      partition by lower(trim(display_name))
      order by updated_at nulls last, id
    ) as display_name_rank
  from public.profiles
  where display_name is not null and trim(display_name) <> ''
)
update public.profiles p
set
  display_name = concat(trim(p.display_name), ' ', p.id::text),
  updated_at = now()
from ranked_profiles r
where p.id = r.id
  and r.display_name_rank > 1;

create unique index if not exists profiles_display_name_lower_unique
  on public.profiles (lower(trim(display_name)))
  where display_name is not null and trim(display_name) <> '';

-- One round-trip: login, public display name, and auth email availability.
create or replace function public.signup_identity_available(
  p_login text,
  p_display text,
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
stable
as $$
declare
  v_login_ok boolean;
  v_display_ok boolean;
  v_email_ok boolean;
begin
  v_login_ok := not exists (
    select 1
    from public.profiles p
    where p.login_name is not null
      and trim(p.login_name) <> ''
      and lower(trim(p.login_name)) = lower(trim(p_login))
  );

  v_display_ok := not exists (
    select 1
    from public.profiles p
    where p.display_name is not null
      and trim(p.display_name) <> ''
      and lower(trim(p.display_name)) = lower(trim(p_display))
  );

  v_email_ok := not exists (
    select 1
    from auth.users u
    where u.email is not null
      and trim(u.email) <> ''
      and lower(trim(u.email)) = lower(trim(p_email))
  );

  return jsonb_build_object(
    'login_available', v_login_ok,
    'display_available', v_display_ok,
    'email_available', v_email_ok
  );
end;
$$;

grant execute on function public.signup_identity_available(text, text, text) to anon, authenticated;
