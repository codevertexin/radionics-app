-- =============================================================================
-- RADIONICS — Admin-only requester display (email/name from auth.users)
-- Not persisted in RADIONICS; for admin UI until HUB/Auth Core integration.
-- =============================================================================

create or replace function public.radionics_admin_requester_profiles(p_user_ids uuid[])
returns table (
  user_id uuid,
  email text,
  display_name text
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_radionics_admin() then
    return;
  end if;

  return query
  select
    u.id,
    u.email::text,
    coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
      split_part(u.email::text, '@', 1)
    )::text
  from auth.users u
  where u.id = any(p_user_ids);
end;
$$;

comment on function public.radionics_admin_requester_profiles(uuid[]) is
  'Admin-only: resolve submitter email/display name from auth.users for review UI.';

revoke all on function public.radionics_admin_requester_profiles(uuid[]) from public;
grant execute on function public.radionics_admin_requester_profiles(uuid[]) to authenticated;
