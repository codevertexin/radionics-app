-- =============================================================================
-- RADIONICS — Phase V2.1: Methodology Engine core schema (additive)
-- New tables only. Does not alter Phase 1 specialties/certifications.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: approved certification for RLS (reuses existing cert table)
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
  );
$$;

comment on function public.has_approved_specialty_certification(uuid) is
  'True when the current user has an approved certification for the given specialty.';

revoke all on function public.has_approved_specialty_certification(uuid) from public;
grant execute on function public.has_approved_specialty_certification(uuid) to authenticated;
grant execute on function public.has_approved_specialty_certification(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 1. methodology_tools
-- ---------------------------------------------------------------------------
create table public.methodology_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  tool_type text not null,
  usage_mode text not null default 'reference',
  status text not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint methodology_tools_slug_unique unique (slug),
  constraint methodology_tools_name_not_empty check (char_length(trim(name)) > 0),
  constraint methodology_tools_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint methodology_tools_tool_type_check check (
    tool_type in (
      'graph_set', 'symbol_set', 'angel_set', 'archangel_set', 'chakra_set',
      'hawkins_scale', 'radionic_clock', 'decagon', 'selector', 'crystal_set',
      'ray_set', 'master_set', 'protocol_set', 'reference_set', 'other'
    )
  ),
  constraint methodology_tools_usage_mode_check check (
    usage_mode in ('activation', 'measurement', 'analysis', 'support', 'reference', 'mixed')
  ),
  constraint methodology_tools_status_check check (
    status in ('active', 'inactive', 'draft')
  )
);

create index idx_methodology_tools_slug on public.methodology_tools (slug);
create index idx_methodology_tools_status on public.methodology_tools (status);

create trigger trg_methodology_tools_updated_at
  before update on public.methodology_tools
  for each row execute function public.set_updated_at();

comment on table public.methodology_tools is
  'Reusable methodology tool definitions (graph sets, scales, selectors, etc.).';

-- ---------------------------------------------------------------------------
-- 2. methodology_assets
-- ---------------------------------------------------------------------------
create table public.methodology_assets (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.methodology_tools (id) on delete cascade,
  name text not null,
  slug text not null,
  code text,
  asset_type text not null,
  usage_mode text not null default 'reference',
  base_description text,
  image_url text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint methodology_assets_tool_slug_unique unique (tool_id, slug),
  constraint methodology_assets_name_not_empty check (char_length(trim(name)) > 0),
  constraint methodology_assets_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint methodology_assets_asset_type_check check (
    asset_type in (
      'graph', 'symbol', 'angel', 'archangel', 'chakra', 'hawkins_level',
      'clock_item', 'decagon', 'selector_option', 'crystal', 'ray', 'master',
      'cause', 'body', 'organ', 'protocol_component', 'reference', 'other'
    )
  ),
  constraint methodology_assets_usage_mode_check check (
    usage_mode in ('activation', 'measurement', 'analysis', 'support', 'reference', 'mixed')
  ),
  constraint methodology_assets_status_check check (
    status in ('active', 'inactive', 'draft')
  )
);

create index idx_methodology_assets_tool_id on public.methodology_assets (tool_id);
create index idx_methodology_assets_asset_type on public.methodology_assets (asset_type);
create index idx_methodology_assets_slug on public.methodology_assets (slug);

create trigger trg_methodology_assets_updated_at
  before update on public.methodology_assets
  for each row execute function public.set_updated_at();

comment on table public.methodology_assets is
  'Individual assets belonging to a methodology tool (graphs, symbols, levels, etc.).';

-- ---------------------------------------------------------------------------
-- 3. specialty_tools
-- ---------------------------------------------------------------------------
create table public.specialty_tools (
  id uuid primary key default gen_random_uuid(),
  specialty_id uuid not null references public.radionics_specialties (id) on delete cascade,
  tool_id uuid not null references public.methodology_tools (id) on delete cascade,
  is_required boolean not null default false,
  is_visible_in_workspace boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint specialty_tools_specialty_tool_unique unique (specialty_id, tool_id)
);

create index idx_specialty_tools_specialty_id on public.specialty_tools (specialty_id);
create index idx_specialty_tools_tool_id on public.specialty_tools (tool_id);

create trigger trg_specialty_tools_updated_at
  before update on public.specialty_tools
  for each row execute function public.set_updated_at();

comment on table public.specialty_tools is
  'Links certified specialties to methodology tools available in workspace.';

-- ---------------------------------------------------------------------------
-- 4. specialty_asset_content
-- ---------------------------------------------------------------------------
create table public.specialty_asset_content (
  id uuid primary key default gen_random_uuid(),
  specialty_id uuid not null references public.radionics_specialties (id) on delete cascade,
  asset_id uuid not null references public.methodology_assets (id) on delete cascade,
  title text,
  therapist_explanation text,
  client_explanation text,
  activation_text text,
  interpretation text,
  recommended_use text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint specialty_asset_content_specialty_asset_unique unique (specialty_id, asset_id)
);

create index idx_specialty_asset_content_specialty_id on public.specialty_asset_content (specialty_id);
create index idx_specialty_asset_content_asset_id on public.specialty_asset_content (asset_id);

create trigger trg_specialty_asset_content_updated_at
  before update on public.specialty_asset_content
  for each row execute function public.set_updated_at();

comment on table public.specialty_asset_content is
  'Per-specialty editorial content overlay for methodology assets.';

-- ---------------------------------------------------------------------------
-- 5. activation_scripts
-- ---------------------------------------------------------------------------
create table public.activation_scripts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  script_type text not null,
  content text not null,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint activation_scripts_slug_unique unique (slug),
  constraint activation_scripts_name_not_empty check (char_length(trim(name)) > 0),
  constraint activation_scripts_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint activation_scripts_content_not_empty check (char_length(trim(content)) > 0),
  constraint activation_scripts_script_type_check check (
    script_type in (
      'activation', 'deactivation', 'prayer', 'decree', 'visualization',
      'instruction', 'opening', 'closing', 'protection', 'other'
    )
  ),
  constraint activation_scripts_status_check check (
    status in ('active', 'inactive', 'draft')
  )
);

create index idx_activation_scripts_slug on public.activation_scripts (slug);

create trigger trg_activation_scripts_updated_at
  before update on public.activation_scripts
  for each row execute function public.set_updated_at();

comment on table public.activation_scripts is
  'Reusable activation / prayer / instruction scripts for methodology engine.';

-- ---------------------------------------------------------------------------
-- 6. activation_script_links
-- ---------------------------------------------------------------------------
create table public.activation_script_links (
  id uuid primary key default gen_random_uuid(),
  activation_script_id uuid not null references public.activation_scripts (id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),

  constraint activation_script_links_target_type_check check (
    target_type in (
      'specialty', 'tool', 'asset', 'specialty_asset_content',
      'protocol', 'protocol_step', 'selector'
    )
  )
);

create index idx_activation_script_links_script_id
  on public.activation_script_links (activation_script_id);
create index idx_activation_script_links_target
  on public.activation_script_links (target_type, target_id);

comment on table public.activation_script_links is
  'Polymorphic links from activation scripts to specialties, tools, assets, etc.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.methodology_tools enable row level security;
alter table public.methodology_assets enable row level security;
alter table public.specialty_tools enable row level security;
alter table public.specialty_asset_content enable row level security;
alter table public.activation_scripts enable row level security;
alter table public.activation_script_links enable row level security;

-- ── methodology_tools ───────────────────────────────────────────────────────

create policy "methodology_tools_select_active"
  on public.methodology_tools
  for select
  to authenticated
  using (status = 'active');

create policy "methodology_tools_admin_select_all"
  on public.methodology_tools
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "methodology_tools_admin_insert"
  on public.methodology_tools
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "methodology_tools_admin_update"
  on public.methodology_tools
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "methodology_tools_admin_delete"
  on public.methodology_tools
  for delete
  to authenticated
  using (public.is_radionics_admin());

-- ── methodology_assets ────────────────────────────────────────────────────

create policy "methodology_assets_select_active"
  on public.methodology_assets
  for select
  to authenticated
  using (status = 'active');

create policy "methodology_assets_admin_select_all"
  on public.methodology_assets
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "methodology_assets_admin_insert"
  on public.methodology_assets
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "methodology_assets_admin_update"
  on public.methodology_assets
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "methodology_assets_admin_delete"
  on public.methodology_assets
  for delete
  to authenticated
  using (public.is_radionics_admin());

-- ── specialty_tools ─────────────────────────────────────────────────────────

create policy "specialty_tools_select_certified_or_admin"
  on public.specialty_tools
  for select
  to authenticated
  using (
    public.is_radionics_admin()
    or public.has_approved_specialty_certification(specialty_id)
  );

create policy "specialty_tools_admin_insert"
  on public.specialty_tools
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "specialty_tools_admin_update"
  on public.specialty_tools
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "specialty_tools_admin_delete"
  on public.specialty_tools
  for delete
  to authenticated
  using (public.is_radionics_admin());

-- ── specialty_asset_content ─────────────────────────────────────────────────

create policy "specialty_asset_content_select_certified_or_admin"
  on public.specialty_asset_content
  for select
  to authenticated
  using (
    public.is_radionics_admin()
    or public.has_approved_specialty_certification(specialty_id)
  );

create policy "specialty_asset_content_admin_insert"
  on public.specialty_asset_content
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "specialty_asset_content_admin_update"
  on public.specialty_asset_content
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "specialty_asset_content_admin_delete"
  on public.specialty_asset_content
  for delete
  to authenticated
  using (public.is_radionics_admin());

-- ── activation_scripts (V2.1: admin-only read — link-based RLS deferred) ───

create policy "activation_scripts_admin_select"
  on public.activation_scripts
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "activation_scripts_admin_insert"
  on public.activation_scripts
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "activation_scripts_admin_update"
  on public.activation_scripts
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "activation_scripts_admin_delete"
  on public.activation_scripts
  for delete
  to authenticated
  using (public.is_radionics_admin());

-- ── activation_script_links (V2.1: admin-only) ──────────────────────────────

create policy "activation_script_links_admin_select"
  on public.activation_script_links
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "activation_script_links_admin_insert"
  on public.activation_script_links
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "activation_script_links_admin_update"
  on public.activation_script_links
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "activation_script_links_admin_delete"
  on public.activation_script_links
  for delete
  to authenticated
  using (public.is_radionics_admin());

-- ---------------------------------------------------------------------------
-- Minimal seed: three reusable tools (no assets, no specialty links yet)
-- ---------------------------------------------------------------------------
insert into public.methodology_tools (
  name,
  slug,
  description,
  tool_type,
  usage_mode,
  status,
  sort_order
) values
  (
    '35 Gráficos',
    'graph-set-35',
    'Conjunto de 35 gráficos radiônicos para diagnóstico e harmonização.',
    'graph_set',
    'mixed',
    'active',
    10
  ),
  (
    'Escala de Hawkins',
    'hawkins-scale',
    'Escala de consciência de David R. Hawkins para medição vibracional.',
    'hawkins_scale',
    'measurement',
    'active',
    20
  ),
  (
    'Chakras',
    'chakra-set',
    'Conjunto de chakras para análise e equilíbrio energético.',
    'chakra_set',
    'analysis',
    'active',
    30
  )
on conflict (slug) do nothing;
