-- =============================================================================
-- RADIONICS — Platform Session F2 Batch B1 grants hardening (additive)
-- Authorization: RADIONICS-F2-B1-DEV-GRANTS-CORRECTION-20260807-01
-- Environment: RADIONICS-ENV-DESIGNATION-20260807-01 (Development)
--
-- Purpose:
--   After B1 core apply, Supabase default table grants exposed excessive
--   privileges to anon/authenticated (including TRUNCATE). This additive
--   migration reconciles the repository with the authorized corrective
--   grants matrix already verified in Development.
--
-- Does NOT:
--   - alter table structures, RLS policies, constraints, or triggers
--   - revoke or modify service_role privileges
--   - introduce B2+ objects or lifecycle RPCs
--
-- Depends on: 20260807120000_radionics_platform_session_b1_core.sql
-- =============================================================================

revoke all privileges
  on table public.platform_clients
  from public, anon, authenticated;

revoke all privileges
  on table public.platform_sessions
  from public, anon, authenticated;

revoke all privileges
  on table public.platform_command_idempotency
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.platform_clients
  to authenticated;

grant select, insert
  on table public.platform_sessions
  to authenticated;

grant select
  on table public.platform_command_idempotency
  to authenticated;
