-- =============================================================================
-- RADIONICS — Phase V2.7: Resources Library RLS for activation scripts
-- Certified therapists can read activation_scripts linked to their specialty content.
-- =============================================================================

create policy "activation_scripts_select_certified_or_admin"
  on public.activation_scripts
  for select
  to authenticated
  using (
    public.is_radionics_admin()
    or (
      status = 'active'
      and coalesce(is_active, true) = true
      and exists (
        select 1
        from public.activation_script_links asl
        inner join public.specialty_asset_content sac
          on sac.id = asl.target_id
          and asl.target_type = 'specialty_asset_content'
        where asl.activation_script_id = activation_scripts.id
          and sac.is_active = true
          and public.has_approved_specialty_certification(sac.specialty_id)
      )
    )
  );

create policy "activation_script_links_select_certified_or_admin"
  on public.activation_script_links
  for select
  to authenticated
  using (
    public.is_radionics_admin()
    or (
      target_type = 'specialty_asset_content'
      and exists (
        select 1
        from public.specialty_asset_content sac
        where sac.id = activation_script_links.target_id
          and sac.is_active = true
          and public.has_approved_specialty_certification(sac.specialty_id)
      )
    )
  );

comment on policy "activation_scripts_select_certified_or_admin"
  on public.activation_scripts is
  'V2.7 Resources: certified therapists read scripts linked to specialty_asset_content.';

comment on policy "activation_script_links_select_certified_or_admin"
  on public.activation_script_links is
  'V2.7 Resources: certified therapists read script links for their specialty content.';
