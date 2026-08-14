-- =============================================================================
-- RADIONICS — Therapist Setup governance (local)
-- Authorization: RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01
-- Baseline: docs/Engine/Therapist/Platform_Therapist_Setup_Pre_Implementation_Readiness.md
--
-- Additive only. Reuses Phase-1 specialties / certifications / requests.
-- Does NOT create platform_methodologies.
-- Does NOT create therapist-owned / private methodology tables.
-- Does NOT implement methodology configuration.
-- Does NOT alter F2 platform_session tables/RPCs.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- OD-TS-7: read-time expiry enforcement in eligibility helper
-- Past expires_at must not unlock session/resource gates even if status
-- remains 'approved' until a future job sets status = 'expired'.
-- ---------------------------------------------------------------------------
create or replace function public.has_approved_specialty_certification(p_specialty_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.therapist_specialty_certifications c
    where c.therapist_id = auth.uid()
      and c.specialty_id = p_specialty_id
      and c.status = 'approved'
      and (c.expires_at is null or c.expires_at > now())
  );
$$;

comment on function public.has_approved_specialty_certification(uuid) is
  'True when the current user has an approved, non-expired certification for the specialty (OD-TS-7).';

revoke all on function public.has_approved_specialty_certification(uuid) from public;
grant execute on function public.has_approved_specialty_certification(uuid) to authenticated;
grant execute on function public.has_approved_specialty_certification(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- OD-TS-5: ≥1 proof document required before status may become pending
-- ---------------------------------------------------------------------------
create or replace function public.enforce_certification_pending_requires_document()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'pending' then
    if not exists (
      select 1
      from public.therapist_specialty_documents d
      where d.certification_id = new.id
    ) then
      raise exception
        'therapist_specialty_certifications: at least one document required before status pending (OD-TS-5)';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.enforce_certification_pending_requires_document() is
  'OD-TS-5: certification status pending requires ≥1 linked therapist_specialty_documents row.';

drop trigger if exists trg_therapist_specialty_certifications_pending_requires_document
  on public.therapist_specialty_certifications;

create trigger trg_therapist_specialty_certifications_pending_requires_document
  before insert or update of status
  on public.therapist_specialty_certifications
  for each row
  execute function public.enforce_certification_pending_requires_document();

-- ---------------------------------------------------------------------------
-- Governance comments (Flow 1 / Flow 2; no private methodologies)
-- ---------------------------------------------------------------------------
comment on table public.radionics_specialties is
  'Platform methodology/specialty catalog (admin-managed). Catalogue authority for Therapist Setup Flow 1. No platform_methodologies; no therapist-owned private catalog.';

comment on table public.radionics_specialty_requests is
  'Therapist Setup Flow 2: request a specialty not yet in the platform catalog. Approval admits/activates a radionics_specialties row only — never auto-creates therapist certification (OD-TS-9). Usable only after catalog entry + Flow 1 certification.';

comment on table public.therapist_specialty_certifications is
  'Therapist × specialty eligibility (Flow 1). UNIQUE (therapist_id, specialty_id). Not methodology configuration. Not a private methodology store.';

comment on table public.therapist_specialty_documents is
  'Certification proof artifacts for Therapist Setup Flow 1. Bucket radionics-certifications. Required before pending (OD-TS-5).';
