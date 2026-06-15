-- =============================================================================
-- RADIONICS — Phase V3.0B: Workflow Engine schema + RLS
-- Versioned workflow templates and ordered steps for session orchestration.
-- No session columns, workflow seeds, workspace, or service layer in this migration.
-- Depends on: radionics_specialties, is_radionics_admin(),
--   has_approved_specialty_certification(), set_updated_at()
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. workflow_templates
-- ---------------------------------------------------------------------------
create table public.workflow_templates (
  id uuid primary key default gen_random_uuid(),
  specialty_id uuid not null references public.radionics_specialties (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  version text not null default 'v1',
  status text not null default 'draft',
  is_default boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint workflow_templates_specialty_slug_version_unique
    unique (specialty_id, slug, version),
  constraint workflow_templates_status_check check (
    status in ('active', 'inactive', 'draft', 'archived')
  )
);

comment on table public.workflow_templates is
  'V3.0B: versioned session workflow definitions per specialty. Coexists with legacy TEMPLATES mock.';

comment on column public.workflow_templates.version is
  'Immutable version label (e.g. v1, v1.1). New structural changes create a new row.';

comment on column public.workflow_templates.is_default is
  'Wizard default for the specialty when status = active. At most one per specialty enforced via partial unique index.';

create index idx_workflow_templates_specialty_id
  on public.workflow_templates (specialty_id);

create index idx_workflow_templates_slug
  on public.workflow_templates (slug);

create index idx_workflow_templates_status
  on public.workflow_templates (status);

create index idx_workflow_templates_is_default
  on public.workflow_templates (is_default);

create index idx_workflow_templates_specialty_status
  on public.workflow_templates (specialty_id, status);

create index idx_workflow_templates_specialty_is_default
  on public.workflow_templates (specialty_id, is_default);

-- At most one active default workflow per specialty (safe on empty catalog).
create unique index idx_workflow_templates_one_active_default_per_specialty
  on public.workflow_templates (specialty_id)
  where is_default = true and status = 'active';

create trigger trg_workflow_templates_updated_at
  before update on public.workflow_templates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. workflow_steps
-- ---------------------------------------------------------------------------
create table public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_template_id uuid not null references public.workflow_templates (id) on delete cascade,
  step_order integer not null,
  step_code text not null,
  step_type text not null,
  label text not null,
  instructions text,
  config jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint workflow_steps_template_step_code_unique
    unique (workflow_template_id, step_code),
  constraint workflow_steps_template_step_order_unique
    unique (workflow_template_id, step_order),
  constraint workflow_steps_step_order_positive check (step_order > 0),
  constraint workflow_steps_step_type_check check (
    step_type in (
      'preparation',
      'connection',
      'measurement',
      'diagnosis',
      'selection',
      'activation',
      'protocol',
      'closing',
      'report'
    )
  ),
  constraint workflow_steps_status_check check (
    status in ('active', 'inactive')
  )
);

comment on table public.workflow_steps is
  'V3.0B: ordered steps within a workflow template. config JSONB holds measurement, condition, protocol, etc.';

comment on column public.workflow_steps.step_code is
  'Stable slug within template (e.g. hawkins_initial). Used as key in workflow_state.';

comment on column public.workflow_steps.config is
  'Step configuration: measurement, asset_picker, protocol, condition, output_schema. Evaluated by V3.0C+ runtime.';

create index idx_workflow_steps_workflow_template_id
  on public.workflow_steps (workflow_template_id);

create index idx_workflow_steps_step_type
  on public.workflow_steps (step_type);

create index idx_workflow_steps_status
  on public.workflow_steps (status);

create index idx_workflow_steps_step_order
  on public.workflow_steps (step_order);

create trigger trg_workflow_steps_updated_at
  before update on public.workflow_steps
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. RLS helper
-- ---------------------------------------------------------------------------
create or replace function public.can_read_workflow_template(p_template_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_radionics_admin()
    or exists (
      select 1
      from public.workflow_templates wt
      where wt.id = p_template_id
        and wt.status = 'active'
        and public.has_approved_specialty_certification(wt.specialty_id)
    );
$$;

comment on function public.can_read_workflow_template(uuid) is
  'V3.0B: therapist reads workflow when status = active and certified for template specialty.';

revoke all on function public.can_read_workflow_template(uuid) from public;
grant execute on function public.can_read_workflow_template(uuid) to authenticated;
grant execute on function public.can_read_workflow_template(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 4. RLS — workflow_templates
-- ---------------------------------------------------------------------------
alter table public.workflow_templates enable row level security;

create policy "workflow_templates_admin_select"
  on public.workflow_templates
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "workflow_templates_admin_insert"
  on public.workflow_templates
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "workflow_templates_admin_update"
  on public.workflow_templates
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "workflow_templates_admin_delete"
  on public.workflow_templates
  for delete
  to authenticated
  using (public.is_radionics_admin());

create policy "workflow_templates_select_certified_or_admin"
  on public.workflow_templates
  for select
  to authenticated
  using (public.can_read_workflow_template(id));

-- ---------------------------------------------------------------------------
-- 5. RLS — workflow_steps
-- ---------------------------------------------------------------------------
alter table public.workflow_steps enable row level security;

create policy "workflow_steps_admin_select"
  on public.workflow_steps
  for select
  to authenticated
  using (public.is_radionics_admin());

create policy "workflow_steps_admin_insert"
  on public.workflow_steps
  for insert
  to authenticated
  with check (public.is_radionics_admin());

create policy "workflow_steps_admin_update"
  on public.workflow_steps
  for update
  to authenticated
  using (public.is_radionics_admin())
  with check (public.is_radionics_admin());

create policy "workflow_steps_admin_delete"
  on public.workflow_steps
  for delete
  to authenticated
  using (public.is_radionics_admin());

create policy "workflow_steps_select_certified_or_admin"
  on public.workflow_steps
  for select
  to authenticated
  using (public.can_read_workflow_template(workflow_template_id));
