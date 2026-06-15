-- =============================================================================
-- RADIONICS — Phase V2.8B: Materials Library schema + RLS
-- Educational/support resources (library_materials) separate from methodology assets.
-- V1: therapist access requires explicit specialty link + approved certification.
-- No seeds, storage, upload, or UI in this migration.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. library_materials
-- ---------------------------------------------------------------------------
create table public.library_materials (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  description text,
  material_type text not null,
  file_url text,
  external_url text,
  thumbnail_url text,
  duration_seconds integer,
  file_size_bytes bigint,
  language text not null default 'pt-PT',
  source_name text,
  source_type text not null default 'app_created',
  source_reference text,
  content_version text not null default 'v1',
  is_app_adapted boolean not null default true,
  visibility text not null default 'certified_only',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint library_materials_slug_unique unique (slug),
  constraint library_materials_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint library_materials_title_not_empty check (char_length(trim(title)) > 0),
  constraint library_materials_material_type_check check (
    material_type in ('pdf', 'image', 'video', 'audio', 'link', 'document', 'other')
  ),
  constraint library_materials_source_type_check check (
    source_type in (
      'teacher', 'official', 'app_created', 'external', 'course_material', 'imported'
    )
  ),
  constraint library_materials_visibility_check check (
    visibility in ('certified_only', 'admin_only')
  ),
  constraint library_materials_status_check check (
    status in ('active', 'inactive', 'draft', 'archived')
  ),
  constraint library_materials_duration_non_negative check (
    duration_seconds is null or duration_seconds >= 0
  ),
  constraint library_materials_file_size_non_negative check (
    file_size_bytes is null or file_size_bytes >= 0
  )
);

comment on table public.library_materials is
  'Materials Library: educational/support resources (PDFs, videos, links). Not methodology_assets.';

comment on column public.library_materials.slug is
  'Globally unique URL-safe identifier.';

comment on column public.library_materials.file_url is
  'CDN URL for file-based materials. Distinct from methodology_assets.image_url.';

create index idx_library_materials_slug on public.library_materials (slug);
create index idx_library_materials_material_type on public.library_materials (material_type);
create index idx_library_materials_visibility on public.library_materials (visibility);
create index idx_library_materials_status on public.library_materials (status);

create trigger trg_library_materials_updated_at
  before update on public.library_materials
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. library_material_links
-- ---------------------------------------------------------------------------
create table public.library_material_links (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.library_materials (id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint library_material_links_material_target_unique
    unique (material_id, target_type, target_id),
  constraint library_material_links_target_type_check check (
    target_type in ('specialty', 'asset', 'protocol')
  ),
  constraint library_material_links_status_check check (
    status in ('active', 'inactive')
  )
);

comment on table public.library_material_links is
  'Associates library_materials to specialties, assets, or protocols. V1 access: specialty links only.';

comment on column public.library_material_links.target_type is
  'specialty = authorization grant (v1). asset/protocol = contextual navigation only.';

create index idx_library_material_links_material_id
  on public.library_material_links (material_id);

create index idx_library_material_links_target
  on public.library_material_links (target_type, target_id);

create index idx_library_material_links_status
  on public.library_material_links (status);

create index idx_library_material_links_specialty_grant
  on public.library_material_links (material_id, target_id)
  where target_type = 'specialty' and status = 'active';

create trigger trg_library_material_links_updated_at
  before update on public.library_material_links
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. RLS helper
-- ---------------------------------------------------------------------------
create or replace function public.can_read_library_material(p_material_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_radionics_admin()
    or (
      exists (
        select 1
        from public.library_materials m
        where m.id = p_material_id
          and m.status = 'active'
          and m.visibility = 'certified_only'
      )
      and exists (
        select 1
        from public.library_material_links l
        where l.material_id = p_material_id
          and l.target_type = 'specialty'
          and l.status = 'active'
          and public.has_approved_specialty_certification(l.target_id)
      )
    );
$$;

comment on function public.can_read_library_material(uuid) is
  'V2.8B: therapist reads material when active, certified_only, and linked to an approved specialty.';

revoke all on function public.can_read_library_material(uuid) from public;
grant execute on function public.can_read_library_material(uuid) to authenticated;
grant execute on function public.can_read_library_material(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 4. RLS — library_materials
-- ---------------------------------------------------------------------------
alter table public.library_materials enable row level security;

create policy "library_materials_admin_select"
  on public.library_materials
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "library_materials_admin_insert"
  on public.library_materials
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "library_materials_admin_update"
  on public.library_materials
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "library_materials_admin_delete"
  on public.library_materials
  for delete
  to authenticated
  using (public.is_radionics_admin());

create policy "library_materials_select_certified_or_admin"
  on public.library_materials
  for select
  to authenticated
  using (public.can_read_library_material(id));

-- ---------------------------------------------------------------------------
-- 5. RLS — library_material_links
-- ---------------------------------------------------------------------------
alter table public.library_material_links enable row level security;

create policy "library_material_links_admin_select"
  on public.library_material_links
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "library_material_links_admin_insert"
  on public.library_material_links
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "library_material_links_admin_update"
  on public.library_material_links
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "library_material_links_admin_delete"
  on public.library_material_links
  for delete
  to authenticated
  using (public.is_radionics_admin());

create policy "library_material_links_select_certified_or_admin"
  on public.library_material_links
  for select
  to authenticated
  using (public.can_read_library_material(material_id));
