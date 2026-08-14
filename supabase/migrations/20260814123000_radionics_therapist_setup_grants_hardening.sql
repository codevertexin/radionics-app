-- =============================================================================
-- RADIONICS — Therapist Setup grants hardening (additive reconciliation)
-- Authorization: RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01
-- Baseline: docs/Engine/Therapist/Platform_Therapist_Setup_Pre_Implementation_Readiness.md
-- Depends on: 20260814120000_radionics_therapist_setup_governance.sql
--             (+ Phase-1 specialties / certifications tables)
--
-- Purpose:
--   After Therapist Setup / Phase-1 specialty tables exist, Supabase default
--   table grants can expose unsafe privileges to public/anon/authenticated
--   (including TRUNCATE / TRIGGER / REFERENCES). This additive migration
--   reconciles the repository to the intended client grants matrix.
--
-- Does NOT:
--   - alter table structures, RLS policies, constraints, or triggers
--   - modify 20260814120000_radionics_therapist_setup_governance.sql
--   - revoke or modify service_role privileges
--   - create RPCs or platform_methodologies
--   - introduce methodology configuration or private methodology tables
-- =============================================================================

begin;

revoke all privileges
  on table public.radionics_specialties
  from public, anon, authenticated;

revoke all privileges
  on table public.radionics_specialty_requests
  from public, anon, authenticated;

revoke all privileges
  on table public.therapist_specialty_certifications
  from public, anon, authenticated;

revoke all privileges
  on table public.therapist_specialty_documents
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.radionics_specialties
  to authenticated;

grant select, insert, update
  on table public.radionics_specialty_requests
  to authenticated;

grant select, insert, update
  on table public.therapist_specialty_certifications
  to authenticated;

grant select, insert, delete
  on table public.therapist_specialty_documents
  to authenticated;

commit;
