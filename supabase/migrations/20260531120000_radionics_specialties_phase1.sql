-- =============================================================================
-- RADIONICS — Phase 1: Specialties & Certifications schema
-- Tables: radionics_specialties, radionics_specialty_requests,
--         therapist_specialty_certifications, therapist_specialty_documents
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admin placeholder (replace with HUB/Auth Core integration later)
-- ---------------------------------------------------------------------------
create table if not exists public.radionics_admin_allowlist (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

comment on table public.radionics_admin_allowlist is
  'Bootstrap admin list until HUB/Auth Core provides radionics_role claims.';

alter table public.radionics_admin_allowlist enable row level security;

-- No policies: only service_role / migrations manage this table.

create or replace function public.is_radionics_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.radionics_admin_allowlist a
      where a.user_id = auth.uid()
    )
    or coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'radionics_role') = 'admin',
      false
    )
    or coalesce(
      (auth.jwt() -> 'user_metadata' ->> 'radionics_admin')::boolean,
      false
    );
$$;

comment on function public.is_radionics_admin() is
  'Placeholder admin check: allowlist table + JWT claims. Replace when Auth Core/HUB is wired.';

revoke all on function public.is_radionics_admin() from public;
grant execute on function public.is_radionics_admin() to authenticated;
grant execute on function public.is_radionics_admin() to service_role;

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- radionics_specialties
-- ---------------------------------------------------------------------------
create table public.radionics_specialties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  category text,
  image_url text,
  color text,
  requires_certification boolean not null default true,
  tool_count integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint radionics_specialties_slug_unique unique (slug),
  constraint radionics_specialties_name_not_empty check (char_length(trim(name)) > 0),
  constraint radionics_specialties_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint radionics_specialties_status_check check (status in ('active', 'inactive'))
);

create index idx_radionics_specialties_status on public.radionics_specialties (status);
create index idx_radionics_specialties_created_at on public.radionics_specialties (created_at desc);

create trigger trg_radionics_specialties_updated_at
  before update on public.radionics_specialties
  for each row execute function public.set_updated_at();

comment on table public.radionics_specialties is 'Official specialty catalog (admin-managed).';

-- ---------------------------------------------------------------------------
-- radionics_specialty_requests
-- ---------------------------------------------------------------------------
create table public.radionics_specialty_requests (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id) on delete cascade,
  proposed_name text not null,
  proposed_slug text,
  description text,
  category text,
  notes text,
  status text not null default 'pending_review',
  admin_notes text,
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint radionics_specialty_requests_proposed_name_not_empty
    check (char_length(trim(proposed_name)) > 0),
  constraint radionics_specialty_requests_status_check
    check (status in ('pending_review', 'approved', 'rejected'))
);

create index idx_radionics_specialty_requests_therapist_id
  on public.radionics_specialty_requests (therapist_id);
create index idx_radionics_specialty_requests_status
  on public.radionics_specialty_requests (status);
create index idx_radionics_specialty_requests_created_at
  on public.radionics_specialty_requests (created_at desc);

comment on table public.radionics_specialty_requests is 'Therapist-proposed specialties awaiting admin review.';

-- ---------------------------------------------------------------------------
-- therapist_specialty_certifications
-- ---------------------------------------------------------------------------
create table public.therapist_specialty_certifications (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id) on delete cascade,
  specialty_id uuid not null references public.radionics_specialties (id) on delete restrict,
  status text not null default 'not_certified',
  years_of_experience integer not null default 0,
  experience_description text,
  training_institution text,
  training_completed_date date,
  certificate_number text,
  certified_by text,
  admin_notes text,
  notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint therapist_specialty_certifications_therapist_specialty_unique
    unique (therapist_id, specialty_id),
  constraint therapist_specialty_certifications_status_check
    check (status in ('not_certified', 'pending', 'approved', 'rejected', 'expired')),
  constraint therapist_specialty_certifications_years_non_negative
    check (years_of_experience >= 0),
  constraint therapist_specialty_certifications_years_required_on_submit
    check (
      status in ('not_certified')
      or years_of_experience > 0
    )
);

create index idx_therapist_specialty_certifications_therapist_id
  on public.therapist_specialty_certifications (therapist_id);
create index idx_therapist_specialty_certifications_specialty_id
  on public.therapist_specialty_certifications (specialty_id);
create index idx_therapist_specialty_certifications_status
  on public.therapist_specialty_certifications (status);
create index idx_therapist_specialty_certifications_created_at
  on public.therapist_specialty_certifications (created_at desc);

create trigger trg_therapist_specialty_certifications_updated_at
  before update on public.therapist_specialty_certifications
  for each row execute function public.set_updated_at();

comment on table public.therapist_specialty_certifications is
  'One certification row per therapist × specialty.';

-- ---------------------------------------------------------------------------
-- therapist_specialty_documents
-- ---------------------------------------------------------------------------
create table public.therapist_specialty_documents (
  id uuid primary key default gen_random_uuid(),
  certification_id uuid not null
    references public.therapist_specialty_certifications (id) on delete cascade,
  storage_path text,
  file_url text,
  file_name text not null,
  mime_type text not null,
  file_type text not null,
  file_size bigint,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint therapist_specialty_documents_file_name_not_empty
    check (char_length(trim(file_name)) > 0),
  constraint therapist_specialty_documents_mime_type_check
    check (mime_type in ('application/pdf', 'image/jpeg', 'image/png')),
  constraint therapist_specialty_documents_file_type_check
    check (file_type in ('pdf', 'jpg', 'jpeg', 'png'))
);

create index idx_therapist_specialty_documents_certification_id
  on public.therapist_specialty_documents (certification_id);
create index idx_therapist_specialty_documents_created_at
  on public.therapist_specialty_documents (created_at desc);

comment on column public.therapist_specialty_documents.storage_path is
  'Object path in bucket radionics-certifications: radionics/certifications/{therapist_id}/{certification_id}/{filename}';
comment on column public.therapist_specialty_documents.file_url is
  'Optional public/signed URL cache; canonical source is storage_path.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.radionics_specialties enable row level security;
alter table public.radionics_specialty_requests enable row level security;
alter table public.therapist_specialty_certifications enable row level security;
alter table public.therapist_specialty_documents enable row level security;

-- ── radionics_specialties ───────────────────────────────────────────────────

create policy "specialties_select_active_for_authenticated"
  on public.radionics_specialties
  for select
  to authenticated
  using (status = 'active');

create policy "specialties_admin_select_all"
  on public.radionics_specialties
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "specialties_admin_insert"
  on public.radionics_specialties
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "specialties_admin_update"
  on public.radionics_specialties
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "specialties_admin_delete"
  on public.radionics_specialties
  for delete
  to authenticated
  using (public.is_radionics_admin());

-- ── radionics_specialty_requests ────────────────────────────────────────────

create policy "specialty_requests_therapist_select_own"
  on public.radionics_specialty_requests
  for select
  to authenticated
  using (therapist_id = auth.uid());

create policy "specialty_requests_therapist_insert_own"
  on public.radionics_specialty_requests
  for insert
  to authenticated
  with check (
    therapist_id = auth.uid()
    and status = 'pending_review'
  );

create policy "specialty_requests_admin_select_all"
  on public.radionics_specialty_requests
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "specialty_requests_admin_update_review"
  on public.radionics_specialty_requests
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

-- ── therapist_specialty_certifications ────────────────────────────────────

create policy "certifications_therapist_select_own"
  on public.therapist_specialty_certifications
  for select
  to authenticated
  using (therapist_id = auth.uid());

create policy "certifications_therapist_insert_own"
  on public.therapist_specialty_certifications
  for insert
  to authenticated
  with check (
    therapist_id = auth.uid()
    and status in ('not_certified', 'pending', 'rejected', 'expired')
  );

create policy "certifications_therapist_update_own_not_approved"
  on public.therapist_specialty_certifications
  for update
  to authenticated
  using (
    therapist_id = auth.uid()
    and status <> 'approved'
  )
  with check (
    therapist_id = auth.uid()
    and status <> 'approved'
  );

create policy "certifications_admin_select_all"
  on public.therapist_specialty_certifications
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "certifications_admin_update_review"
  on public.therapist_specialty_certifications
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

-- ── therapist_specialty_documents ───────────────────────────────────────────

create policy "cert_documents_therapist_select_own"
  on public.therapist_specialty_documents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.therapist_specialty_certifications c
      where c.id = certification_id
        and c.therapist_id = auth.uid()
    )
  );

create policy "cert_documents_therapist_insert_own_not_approved"
  on public.therapist_specialty_documents
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.therapist_specialty_certifications c
      where c.id = certification_id
        and c.therapist_id = auth.uid()
        and c.status <> 'approved'
    )
  );

create policy "cert_documents_therapist_delete_own_not_approved"
  on public.therapist_specialty_documents
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.therapist_specialty_certifications c
      where c.id = certification_id
        and c.therapist_id = auth.uid()
        and c.status <> 'approved'
    )
  );

create policy "cert_documents_admin_select_all"
  on public.therapist_specialty_documents
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "cert_documents_admin_delete"
  on public.therapist_specialty_documents
  for delete
  to authenticated
  using (public.is_radionics_admin());

-- ---------------------------------------------------------------------------
-- Seed: initial specialty catalog
-- ---------------------------------------------------------------------------
insert into public.radionics_specialties (
  name,
  slug,
  description,
  category,
  requires_certification,
  tool_count,
  status
) values
  (
    'MAP',
    'map',
    'Metodologia de Alta Performance energética. Sistema radiônico de harmonização multidimensional.',
    'Radiônica',
    true,
    8,
    'active'
  ),
  (
    'Mesa dos 35 Gráficos',
    'mesa-35',
    'Sistema de 35 gráficos radiônicos para harmonização energética profunda.',
    'Radiônica',
    true,
    35,
    'active'
  ),
  (
    'Mesa dos 49 Símbolos Angelicais',
    'mesa-49',
    'Sistema avançado de 49 símbolos com trabalho angélico e arquetípico.',
    'Radiônica Avançada',
    true,
    49,
    'active'
  ),
  (
    'Apometria',
    'apometria',
    'Técnica de desobsessão e harmonização espiritual canalizada.',
    'Espiritual',
    true,
    0,
    'active'
  ),
  (
    'Terapia Floral',
    'terapia-floral',
    'Uso terapêutico de sistemas florais para reequilíbrio emocional e vibracional.',
    'Terapias Florais',
    true,
    0,
    'active'
  ),
  (
    'Mesa Estelar',
    'mesa-estelar',
    'Trabalho radiônico com geometrias e frequências estelares para alinhamento vibracional.',
    'Radiônica Avançada',
    true,
    0,
    'active'
  )
on conflict (slug) do nothing;
