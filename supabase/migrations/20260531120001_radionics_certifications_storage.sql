-- =============================================================================
-- RADIONICS — Phase 1: Storage bucket for certification documents
-- Bucket: radionics-certifications
-- Path:   radionics/certifications/{therapist_id}/{certification_id}/{filename}
-- =============================================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'radionics-certifications',
  'radionics-certifications',
  false,
  10485760, -- 10 MB
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Helper: extract therapist_id from storage path
-- Path segments: [1]=radionics [2]=certifications [3]=therapist_id [4]=certification_id [5]=filename
create or replace function public.radionics_cert_storage_therapist_id(object_name text)
returns text
language sql
immutable
as $$
  select (string_to_array(object_name, '/'))[3];
$$;

create or replace function public.radionics_cert_storage_certification_id(object_name text)
returns text
language sql
immutable
as $$
  select (string_to_array(object_name, '/'))[4];
$$;

-- Therapist: read own files
create policy "radionics_cert_storage_therapist_select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'radionics-certifications'
    and (storage.foldername(name))[1] = 'radionics'
    and (storage.foldername(name))[2] = 'certifications'
    and public.radionics_cert_storage_therapist_id(name) = auth.uid()::text
  );

-- Therapist: upload to own path only
create policy "radionics_cert_storage_therapist_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'radionics-certifications'
    and (storage.foldername(name))[1] = 'radionics'
    and (storage.foldername(name))[2] = 'certifications'
    and public.radionics_cert_storage_therapist_id(name) = auth.uid()::text
    and exists (
      select 1
      from public.therapist_specialty_certifications c
      where c.id::text = public.radionics_cert_storage_certification_id(name)
        and c.therapist_id = auth.uid()
        and c.status <> 'approved'
    )
  );

-- Therapist: update own files (replace)
create policy "radionics_cert_storage_therapist_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'radionics-certifications'
    and public.radionics_cert_storage_therapist_id(name) = auth.uid()::text
  )
  with check (
    bucket_id = 'radionics-certifications'
    and public.radionics_cert_storage_therapist_id(name) = auth.uid()::text
  );

-- Therapist: delete own files while cert not approved
create policy "radionics_cert_storage_therapist_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'radionics-certifications'
    and public.radionics_cert_storage_therapist_id(name) = auth.uid()::text
    and exists (
      select 1
      from public.therapist_specialty_certifications c
      where c.id::text = public.radionics_cert_storage_certification_id(name)
        and c.therapist_id = auth.uid()
        and c.status <> 'approved'
    )
  );

-- Admin: full read
create policy "radionics_cert_storage_admin_select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'radionics-certifications'
    and public.is_radionics_admin()
  );

-- Admin: full delete (moderation)
create policy "radionics_cert_storage_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'radionics-certifications'
    and public.is_radionics_admin()
  );
