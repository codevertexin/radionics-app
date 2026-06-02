-- =============================================================================
-- RADIONICS — Phase V2.4: Methodology asset media (additive)
-- Contextual images/files per asset × specialty × tool scope.
-- methodology_assets.image_url remains legacy fallback (not removed).
-- =============================================================================

-- Sentinel UUID for NULL specialty_id / tool_id in unique primary index
-- (00000000-0000-0000-0000-000000000000 must never be a real FK value)

create table public.methodology_asset_media (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.methodology_assets (id) on delete cascade,
  specialty_id uuid references public.radionics_specialties (id) on delete cascade,
  tool_id uuid references public.methodology_tools (id) on delete cascade,
  media_type text not null default 'image',
  url text not null,
  storage_provider text not null default 'external',
  source_type text not null default 'app_default',
  source_name text,
  alt_text text,
  caption text,
  quality_status text not null default 'approved',
  is_primary boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint methodology_asset_media_url_not_empty check (char_length(trim(url)) > 0),
  constraint methodology_asset_media_media_type_check check (
    media_type in ('image', 'pdf', 'audio', 'video', 'document', 'other')
  ),
  constraint methodology_asset_media_storage_provider_check check (
    storage_provider in ('bunny', 'supabase', 'external', 'app_public', 'other')
  ),
  constraint methodology_asset_media_source_type_check check (
    source_type in (
      'app_default', 'teacher_original', 'course_material',
      'generated', 'custom_upload', 'fallback'
    )
  ),
  constraint methodology_asset_media_quality_status_check check (
    quality_status in ('approved', 'needs_review', 'low_quality', 'replaced', 'deprecated')
  )
);

comment on table public.methodology_asset_media is
  'Contextual media for methodology assets (per specialty/tool/teacher). '
  'methodology_assets.image_url is legacy fallback only.';

create index idx_methodology_asset_media_asset_id
  on public.methodology_asset_media (asset_id);

create index idx_methodology_asset_media_specialty_id
  on public.methodology_asset_media (specialty_id);

create index idx_methodology_asset_media_tool_id
  on public.methodology_asset_media (tool_id);

create index idx_methodology_asset_media_media_type
  on public.methodology_asset_media (media_type);

create index idx_methodology_asset_media_is_primary
  on public.methodology_asset_media (is_primary)
  where is_primary = true;

create index idx_methodology_asset_media_source_type
  on public.methodology_asset_media (source_type);

create index idx_methodology_asset_media_quality_status
  on public.methodology_asset_media (quality_status);

-- One primary row per (asset, specialty scope, tool scope, media_type)
create unique index idx_methodology_asset_media_primary_scope
  on public.methodology_asset_media (
    asset_id,
    coalesce(specialty_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(tool_id, '00000000-0000-0000-0000-000000000000'::uuid),
    media_type
  )
  where is_primary = true;

create trigger trg_methodology_asset_media_updated_at
  before update on public.methodology_asset_media
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.methodology_asset_media enable row level security;

create policy "asset_media_select_app_default_approved"
  on public.methodology_asset_media
  for select
  to authenticated
  using (
    source_type = 'app_default'
    and quality_status = 'approved'
  );

create policy "asset_media_select_certified_specialty"
  on public.methodology_asset_media
  for select
  to authenticated
  using (
    specialty_id is not null
    and public.has_approved_specialty_certification(specialty_id)
  );

create policy "asset_media_select_certified_via_tool"
  on public.methodology_asset_media
  for select
  to authenticated
  using (
    tool_id is not null
    and specialty_id is null
    and exists (
      select 1
      from public.specialty_tools st
      where st.tool_id = methodology_asset_media.tool_id
        and public.has_approved_specialty_certification(st.specialty_id)
    )
  );

create policy "asset_media_admin_select_all"
  on public.methodology_asset_media
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "asset_media_admin_insert"
  on public.methodology_asset_media
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "asset_media_admin_update"
  on public.methodology_asset_media
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "asset_media_admin_delete"
  on public.methodology_asset_media
  for delete
  to authenticated
  using (public.is_radionics_admin());
