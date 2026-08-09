-- =============================================================================
-- RADIONICS — Platform Session F2 Batch B2 RPC grants hardening (additive)
-- Environment: RADIONICS-ENV-DESIGNATION-20260807-01 (Development)
-- Apply auth: RADIONICS-F2-B2-DEV-APPLY-AUTH-20260809-01 (core B2 already applied)
--
-- Purpose:
--   After B2 core apply, Supabase default function grants left EXECUTE on the
--   four public B2 RPCs for anon. This additive migration reconciles the
--   repository with the Owner-applied corrective matrix already verified in
--   Development (b2_exact_rpc_execute_grants PASS: missing=0, unexpected=0).
--
-- Does NOT:
--   - create/alter/drop tables, policies, constraints, or triggers
--   - insert/update/delete row data
--   - revoke or modify service_role privileges
--   - introduce B3+ objects, UI, or services
--
-- Depends on: 20260809170000_radionics_platform_session_b2_testimony_plan_rpcs.sql
-- =============================================================================

begin;

revoke all on function public.platform_patch_session_draft_context(uuid, text, text, timestamptz, text, text, boolean, boolean, boolean)
  from public, anon, authenticated;

revoke all on function public.platform_upsert_session_plan_item(uuid, uuid, text, integer, text, uuid)
  from public, anon, authenticated;

revoke all on function public.platform_delete_session_plan_item(uuid, uuid, text)
  from public, anon, authenticated;

revoke all on function public.platform_start_session(uuid, text)
  from public, anon, authenticated;

grant execute on function public.platform_patch_session_draft_context(uuid, text, text, timestamptz, text, text, boolean, boolean, boolean)
  to authenticated;

grant execute on function public.platform_upsert_session_plan_item(uuid, uuid, text, integer, text, uuid)
  to authenticated;

grant execute on function public.platform_delete_session_plan_item(uuid, uuid, text)
  to authenticated;

grant execute on function public.platform_start_session(uuid, text)
  to authenticated;

commit;
