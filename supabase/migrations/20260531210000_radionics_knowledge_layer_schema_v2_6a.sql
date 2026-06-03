-- =============================================================================
-- RADIONICS — Phase V2.6A: Knowledge Layer schema (additive)
-- Protocols, protocol assets/steps, provenance columns on existing content tables.
-- No content import in this migration.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. methodology_protocols
-- ---------------------------------------------------------------------------
create table public.methodology_protocols (
  id uuid primary key default gen_random_uuid(),
  specialty_id uuid not null references public.radionics_specialties (id) on delete cascade,
  code text not null,
  name text not null,
  slug text not null,
  description text,
  why_activate text,
  source_name text,
  source_type text not null default 'app_adapted',
  source_reference text,
  content_version text not null default 'v1',
  is_app_adapted boolean not null default true,
  status text not null default 'active',
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint methodology_protocols_specialty_slug_unique unique (specialty_id, slug),
  constraint methodology_protocols_code_not_empty check (char_length(trim(code)) > 0),
  constraint methodology_protocols_name_not_empty check (char_length(trim(name)) > 0),
  constraint methodology_protocols_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint methodology_protocols_source_type_check check (
    source_type in (
      'teacher_original', 'course_material', 'app_adapted',
      'generated', 'custom', 'imported'
    )
  ),
  constraint methodology_protocols_status_check check (
    status in ('active', 'inactive', 'draft', 'archived')
  )
);

comment on table public.methodology_protocols is
  'Per-specialty therapeutic protocols (knowledge layer). Content import in V2.6E+.';

create index idx_methodology_protocols_specialty_id
  on public.methodology_protocols (specialty_id);

create index idx_methodology_protocols_slug
  on public.methodology_protocols (slug);

create index idx_methodology_protocols_status
  on public.methodology_protocols (status);

create index idx_methodology_protocols_source_type
  on public.methodology_protocols (source_type);

create trigger trg_methodology_protocols_updated_at
  before update on public.methodology_protocols
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. protocol_assets
-- ---------------------------------------------------------------------------
create table public.protocol_assets (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.methodology_protocols (id) on delete cascade,
  asset_id uuid not null references public.methodology_assets (id) on delete cascade,
  asset_role text not null,
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),

  constraint protocol_assets_protocol_asset_unique unique (protocol_id, asset_id),
  constraint protocol_assets_asset_role_check check (
    asset_role in (
      'graph', 'angel', 'archangel', 'chakra', 'hawkins',
      'selector', 'crystal', 'master', 'ray', 'other'
    )
  )
);

comment on table public.protocol_assets is
  'Links methodology assets to a protocol with a role in the workflow.';

create index idx_protocol_assets_protocol_id
  on public.protocol_assets (protocol_id);

create index idx_protocol_assets_asset_id
  on public.protocol_assets (asset_id);

create index idx_protocol_assets_asset_role
  on public.protocol_assets (asset_role);

-- ---------------------------------------------------------------------------
-- 3. protocol_steps
-- ---------------------------------------------------------------------------
create table public.protocol_steps (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.methodology_protocols (id) on delete cascade,
  step_number integer not null,
  title text not null,
  instructions text,
  activation_text text,
  source_name text,
  source_type text not null default 'app_adapted',
  source_reference text,
  content_version text not null default 'v1',
  is_app_adapted boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint protocol_steps_protocol_step_unique unique (protocol_id, step_number),
  constraint protocol_steps_title_not_empty check (char_length(trim(title)) > 0),
  constraint protocol_steps_step_number_positive check (step_number > 0),
  constraint protocol_steps_source_type_check check (
    source_type in (
      'teacher_original', 'course_material', 'app_adapted',
      'generated', 'custom', 'imported'
    )
  )
);

comment on table public.protocol_steps is
  'Ordered steps within a methodology protocol.';

create index idx_protocol_steps_protocol_id
  on public.protocol_steps (protocol_id);

create index idx_protocol_steps_step_number
  on public.protocol_steps (step_number);

create trigger trg_protocol_steps_updated_at
  before update on public.protocol_steps
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. specialty_asset_content — provenance columns
-- ---------------------------------------------------------------------------
alter table public.specialty_asset_content
  add column if not exists source_name text,
  add column if not exists source_type text not null default 'app_adapted',
  add column if not exists source_reference text,
  add column if not exists content_version text not null default 'v1',
  add column if not exists is_app_adapted boolean not null default true,
  add column if not exists is_active boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'specialty_asset_content_source_type_check'
      and conrelid = 'public.specialty_asset_content'::regclass
  ) then
    alter table public.specialty_asset_content
      add constraint specialty_asset_content_source_type_check check (
        source_type in (
          'teacher_original', 'course_material', 'app_adapted',
          'generated', 'custom', 'imported'
        )
      );
  end if;
end $$;

create index if not exists idx_specialty_asset_content_source_type
  on public.specialty_asset_content (source_type);

create index if not exists idx_specialty_asset_content_is_active
  on public.specialty_asset_content (is_active);

-- ---------------------------------------------------------------------------
-- 5. activation_scripts — provenance columns
-- ---------------------------------------------------------------------------
alter table public.activation_scripts
  add column if not exists source_name text,
  add column if not exists source_type text not null default 'app_adapted',
  add column if not exists source_reference text,
  add column if not exists content_version text not null default 'v1',
  add column if not exists is_app_adapted boolean not null default true,
  add column if not exists is_active boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'activation_scripts_source_type_check'
      and conrelid = 'public.activation_scripts'::regclass
  ) then
    alter table public.activation_scripts
      add constraint activation_scripts_source_type_check check (
        source_type in (
          'teacher_original', 'course_material', 'app_adapted',
          'generated', 'custom', 'imported'
        )
      );
  end if;
end $$;

create index if not exists idx_activation_scripts_source_type
  on public.activation_scripts (source_type);

create index if not exists idx_activation_scripts_is_active
  on public.activation_scripts (is_active);

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.methodology_protocols enable row level security;
alter table public.protocol_assets enable row level security;
alter table public.protocol_steps enable row level security;

-- methodology_protocols
create policy "methodology_protocols_select_certified_or_admin"
  on public.methodology_protocols
  for select
  to authenticated
  using (
    public.is_radionics_admin()
    or public.has_approved_specialty_certification(specialty_id)
  );

create policy "methodology_protocols_admin_insert"
  on public.methodology_protocols
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "methodology_protocols_admin_update"
  on public.methodology_protocols
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "methodology_protocols_admin_delete"
  on public.methodology_protocols
  for delete
  to authenticated
  using (public.is_radionics_admin());

-- protocol_assets (parent protocol must be readable)
create policy "protocol_assets_select_certified_or_admin"
  on public.protocol_assets
  for select
  to authenticated
  using (
    public.is_radionics_admin()
    or exists (
      select 1
      from public.methodology_protocols mp
      where mp.id = protocol_assets.protocol_id
        and public.has_approved_specialty_certification(mp.specialty_id)
    )
  );

create policy "protocol_assets_admin_insert"
  on public.protocol_assets
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "protocol_assets_admin_update"
  on public.protocol_assets
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "protocol_assets_admin_delete"
  on public.protocol_assets
  for delete
  to authenticated
  using (public.is_radionics_admin());

-- protocol_steps (parent protocol must be readable)
create policy "protocol_steps_select_certified_or_admin"
  on public.protocol_steps
  for select
  to authenticated
  using (
    public.is_radionics_admin()
    or exists (
      select 1
      from public.methodology_protocols mp
      where mp.id = protocol_steps.protocol_id
        and public.has_approved_specialty_certification(mp.specialty_id)
    )
  );

create policy "protocol_steps_admin_insert"
  on public.protocol_steps
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "protocol_steps_admin_update"
  on public.protocol_steps
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "protocol_steps_admin_delete"
  on public.protocol_steps
  for delete
  to authenticated
  using (public.is_radionics_admin());
