-- =============================================================================
-- RADIONICS — Resubmit: tighten therapist certification update policy
-- Therapists may update own certs in editable statuses; cannot set approved.
-- =============================================================================

drop policy if exists "certifications_therapist_update_own_not_approved"
  on public.therapist_specialty_certifications;

create policy "certifications_therapist_update_own_editable"
  on public.therapist_specialty_certifications
  for update
  to authenticated
  using (
    therapist_id = auth.uid()
    and status in ('not_certified', 'pending', 'rejected', 'expired')
  )
  with check (
    therapist_id = auth.uid()
    and status in ('not_certified', 'pending', 'rejected', 'expired')
  );

comment on policy "certifications_therapist_update_own_editable"
  on public.therapist_specialty_certifications is
  'Therapist may edit/resubmit own certification; status cannot become approved (admin only).';
