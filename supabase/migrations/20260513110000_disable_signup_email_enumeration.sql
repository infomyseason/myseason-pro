-- Keep anonymous signup checks limited to public identity fields.
-- The p_email argument is retained for client compatibility but is intentionally
-- not inspected; Supabase Auth owns email uniqueness without exposing auth.users.

create or replace function public.signup_identity_available(
  p_login text,
  p_display text,
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_login_ok boolean;
  v_display_ok boolean;
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

  return jsonb_build_object(
    'login_available', v_login_ok,
    'display_available', v_display_ok,
    'email_available', true
  );
end;
$$;

grant execute on function public.signup_identity_available(text, text, text) to anon, authenticated;
