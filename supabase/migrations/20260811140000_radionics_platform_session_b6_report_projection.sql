-- =============================================================================
-- RADIONICS — Platform Session F2 Batch B6 (local preparation)
-- Authorization: RADIONICS-F2-B6-LOCAL-AUTH-20260811-01
-- Design baseline: Platform_Session_F2_B6_Pre_Implementation_Readiness.md
-- OD-B6-1…18 APPROVED defaults
--
-- Creates:
--   platform_report_templates
--   platform_report_projections
--   platform_approved_report_renditions
--   Additive UNIQUE (id, therapist_id, session_id) on sealed archives
--     (same-session FK target; does not alter B5 migration file body)
--   RPCs: platform_create_report_projection
--         platform_update_report_projection_draft
--         platform_set_report_projection_status
--         platform_approve_report_rendition
--         platform_upsert_report_template (therapist-owned)
--         platform_set_report_template_status (therapist-owned)
--
-- Write posture: RPC-only. Authenticated: SELECT only on B6 tables.
-- No archive mutation / re-seal / unseal. No PDF / sharing / B7.
-- No platform_methodologies. No therapeutic columns.
-- Depends on: B1–B5; reuses platform_b2_* idempotency helpers; pgcrypto.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Additive same-session unique target on sealed archives (for FKs)
-- ---------------------------------------------------------------------------

alter table public.platform_sealed_session_archives
  add constraint platform_sealed_session_archives_id_therapist_session_unique
  unique (id, therapist_id, session_id);

-- ---------------------------------------------------------------------------
-- 1. platform_report_templates
-- ---------------------------------------------------------------------------

create table public.platform_report_templates (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid null references auth.users (id),
  name text not null,
  version text not null,
  status text not null default 'draft',
  configuration jsonb not null default '{}'::jsonb,
  specialty_id uuid null references public.radionics_specialties (id),
  schema_version text not null default 'platform.report.template.v1',
  row_revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint platform_report_templates_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_report_templates_status_check
    check (status in ('draft', 'active', 'inactive')),

  constraint platform_report_templates_name_not_empty
    check (char_length(trim(name)) > 0),

  constraint platform_report_templates_version_not_empty
    check (char_length(trim(version)) > 0),

  constraint platform_report_templates_configuration_is_object
    check (jsonb_typeof(configuration) = 'object'),

  constraint platform_report_templates_schema_version_not_empty
    check (char_length(trim(schema_version)) > 0),

  constraint platform_report_templates_row_revision_positive
    check (row_revision >= 1)
);

comment on table public.platform_report_templates is
  'F2 B6: mandatory report template catalogue (OD-F2-3). Official therapist_id NULL; owned otherwise. Opaque configuration. RPC writes for owned rows.';

-- Therapist-owned name+version uniqueness (official rows excluded).
create unique index idx_platform_report_templates_owned_name_version
  on public.platform_report_templates (therapist_id, name, version)
  where therapist_id is not null;

create index idx_platform_report_templates_therapist_id
  on public.platform_report_templates (therapist_id)
  where therapist_id is not null;

create index idx_platform_report_templates_specialty_id
  on public.platform_report_templates (specialty_id)
  where specialty_id is not null;

create index idx_platform_report_templates_status
  on public.platform_report_templates (status);

create trigger trg_platform_report_templates_guard_mutable
  before insert or update on public.platform_report_templates
  for each row execute function public.platform_guard_mutable_owned_row();

alter table public.platform_report_templates enable row level security;

-- Official (NULL) readable by authenticated; owned readable by owner.
create policy "platform_report_templates_select_official_or_own"
  on public.platform_report_templates
  for select
  to authenticated
  using (therapist_id is null or therapist_id = auth.uid());

revoke all privileges
  on table public.platform_report_templates
  from public, anon, authenticated;

grant select
  on table public.platform_report_templates
  to authenticated;

-- ---------------------------------------------------------------------------
-- 2. platform_report_projections
-- ---------------------------------------------------------------------------

create table public.platform_report_projections (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  session_id uuid not null,
  archive_id uuid not null,
  template_id uuid not null,
  template_version text not null,
  template_name text null,
  status text not null default 'draft',
  therapist_edits jsonb not null default '{}'::jsonb,
  inclusion_overrides jsonb not null default '{}'::jsonb,
  schema_version text not null default 'platform.report.projection.v1',
  row_revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint platform_report_projections_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_report_projections_id_therapist_session_unique
    unique (id, therapist_id, session_id),

  constraint platform_report_projections_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  constraint platform_report_projections_archive_fk
    foreign key (archive_id, therapist_id, session_id)
    references public.platform_sealed_session_archives (id, therapist_id, session_id)
    on delete restrict,

  constraint platform_report_projections_template_fk
    foreign key (template_id)
    references public.platform_report_templates (id)
    on delete restrict,

  constraint platform_report_projections_status_check
    check (status in ('draft', 'in_review', 'approved')),

  constraint platform_report_projections_template_version_not_empty
    check (char_length(trim(template_version)) > 0),

  constraint platform_report_projections_template_name_trim
    check (template_name is null or char_length(trim(template_name)) > 0),

  constraint platform_report_projections_therapist_edits_is_object
    check (jsonb_typeof(therapist_edits) = 'object'),

  constraint platform_report_projections_inclusion_overrides_is_object
    check (jsonb_typeof(inclusion_overrides) = 'object'),

  constraint platform_report_projections_schema_version_not_empty
    check (char_length(trim(schema_version)) > 0),

  constraint platform_report_projections_row_revision_positive
    check (row_revision >= 1)
);

comment on table public.platform_report_projections is
  'F2 B6: mutable report projection draft/in_review; approved marks after rendition. Reads sealed archive; never mutates it.';

create index idx_platform_report_projections_session
  on public.platform_report_projections (session_id, therapist_id);

create index idx_platform_report_projections_archive
  on public.platform_report_projections (archive_id);

create index idx_platform_report_projections_template
  on public.platform_report_projections (template_id);

create index idx_platform_report_projections_status
  on public.platform_report_projections (session_id, status);

create trigger trg_platform_report_projections_guard_mutable
  before insert or update on public.platform_report_projections
  for each row execute function public.platform_guard_mutable_owned_row();

alter table public.platform_report_projections enable row level security;

create policy "platform_report_projections_select_own"
  on public.platform_report_projections
  for select
  to authenticated
  using (therapist_id = auth.uid());

revoke all privileges
  on table public.platform_report_projections
  from public, anon, authenticated;

grant select
  on table public.platform_report_projections
  to authenticated;

-- ---------------------------------------------------------------------------
-- 3. platform_approved_report_renditions (immutable)
-- ---------------------------------------------------------------------------

create table public.platform_approved_report_renditions (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  session_id uuid not null,
  archive_id uuid not null,
  projection_id uuid not null,
  template_id uuid not null,
  template_version text not null,
  template_name text null,
  version integer not null,
  approved_at timestamptz not null,
  approved_by_therapist_id uuid not null,
  sealed_content jsonb not null,
  content_sha256 text not null,
  schema_version text not null default 'platform.report.rendition.v1',
  created_at timestamptz not null default now(),

  constraint platform_approved_report_renditions_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_approved_report_renditions_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  constraint platform_approved_report_renditions_archive_fk
    foreign key (archive_id, therapist_id, session_id)
    references public.platform_sealed_session_archives (id, therapist_id, session_id)
    on delete restrict,

  constraint platform_approved_report_renditions_projection_fk
    foreign key (projection_id, therapist_id, session_id)
    references public.platform_report_projections (id, therapist_id, session_id)
    on delete restrict,

  constraint platform_approved_report_renditions_template_fk
    foreign key (template_id)
    references public.platform_report_templates (id)
    on delete restrict,

  constraint platform_approved_report_renditions_version_positive
    check (version >= 1),

  constraint platform_approved_report_renditions_session_version_unique
    unique (session_id, version),

  constraint platform_approved_report_renditions_approved_by_owner
    check (approved_by_therapist_id = therapist_id),

  constraint platform_approved_report_renditions_sealed_content_is_object
    check (jsonb_typeof(sealed_content) = 'object'),

  constraint platform_approved_report_renditions_content_sha256_hex
    check (content_sha256 ~ '^[0-9a-f]{64}$'),

  constraint platform_approved_report_renditions_template_version_not_empty
    check (char_length(trim(template_version)) > 0),

  constraint platform_approved_report_renditions_schema_version_not_empty
    check (char_length(trim(schema_version)) > 0)
);

comment on table public.platform_approved_report_renditions is
  'F2 B6: immutable approved report rendition. Provenance to sealed archive + template. No PDF. Insert via approve RPC only.';

create index idx_platform_approved_report_renditions_session
  on public.platform_approved_report_renditions (session_id, therapist_id);

create index idx_platform_approved_report_renditions_archive
  on public.platform_approved_report_renditions (archive_id);

create index idx_platform_approved_report_renditions_projection
  on public.platform_approved_report_renditions (projection_id);

create or replace function public.platform_b6_reject_rendition_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'platform_approved_report_renditions is immutable'
    using errcode = '23514';
end;
$$;

comment on function public.platform_b6_reject_rendition_mutation() is
  'B6: reject UPDATE/DELETE on approved report renditions.';

revoke all on function public.platform_b6_reject_rendition_mutation() from public;

create trigger trg_platform_approved_report_renditions_immutable
  before update or delete on public.platform_approved_report_renditions
  for each row execute function public.platform_b6_reject_rendition_mutation();

alter table public.platform_approved_report_renditions enable row level security;

create policy "platform_approved_report_renditions_select_own"
  on public.platform_approved_report_renditions
  for select
  to authenticated
  using (therapist_id = auth.uid());

revoke all privileges
  on table public.platform_approved_report_renditions
  from public, anon, authenticated;

grant select
  on table public.platform_approved_report_renditions
  to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Internal helpers
-- ---------------------------------------------------------------------------

create or replace function public.platform_b6_projection_status_transition_ok(
  p_from text,
  p_to text
)
returns boolean
language sql
immutable
as $$
  select
    (p_from = 'draft' and p_to = 'in_review')
    or (p_from = 'in_review' and p_to = 'draft');
$$;

comment on function public.platform_b6_projection_status_transition_ok(text, text) is
  'B6: narrow draft↔in_review transitions (approve path separate).';

revoke all on function public.platform_b6_projection_status_transition_ok(text, text) from public;

create or replace function public.platform_b6_content_sha256(p_content jsonb)
returns text
language sql
immutable
as $$
  select encode(digest(convert_to(p_content::text, 'UTF8'), 'sha256'), 'hex');
$$;

revoke all on function public.platform_b6_content_sha256(jsonb) from public;

create or replace function public.platform_b6_projection_json(
  p_row public.platform_report_projections
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'projectionId', p_row.id,
    'sessionId', p_row.session_id,
    'archiveId', p_row.archive_id,
    'templateId', p_row.template_id,
    'templateVersion', p_row.template_version,
    'templateName', p_row.template_name,
    'status', p_row.status,
    'therapistEdits', p_row.therapist_edits,
    'inclusionOverrides', p_row.inclusion_overrides,
    'schemaVersion', p_row.schema_version,
    'rowRevision', p_row.row_revision,
    'createdAt', p_row.created_at,
    'updatedAt', p_row.updated_at
  );
$$;

revoke all on function public.platform_b6_projection_json(public.platform_report_projections) from public;

create or replace function public.platform_b6_rendition_json(
  p_row public.platform_approved_report_renditions
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'renditionId', p_row.id,
    'sessionId', p_row.session_id,
    'archiveId', p_row.archive_id,
    'projectionId', p_row.projection_id,
    'templateId', p_row.template_id,
    'templateVersion', p_row.template_version,
    'templateName', p_row.template_name,
    'version', p_row.version,
    'approvedAt', p_row.approved_at,
    'approvedByTherapistId', p_row.approved_by_therapist_id,
    'contentSha256', p_row.content_sha256,
    'schemaVersion', p_row.schema_version,
    'createdAt', p_row.created_at
  );
$$;

revoke all on function public.platform_b6_rendition_json(public.platform_approved_report_renditions) from public;

create or replace function public.platform_b6_template_json(
  p_row public.platform_report_templates
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'templateId', p_row.id,
    'therapistId', p_row.therapist_id,
    'name', p_row.name,
    'version', p_row.version,
    'status', p_row.status,
    'configuration', p_row.configuration,
    'specialtyId', p_row.specialty_id,
    'schemaVersion', p_row.schema_version,
    'rowRevision', p_row.row_revision,
    'createdAt', p_row.created_at,
    'updatedAt', p_row.updated_at
  );
$$;

revoke all on function public.platform_b6_template_json(public.platform_report_templates) from public;

create or replace function public.platform_b6_build_sealed_content(
  p_archive public.platform_sealed_session_archives,
  p_projection public.platform_report_projections,
  p_approved_at timestamptz
)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  v_content jsonb;
  v_size integer;
begin
  -- Compute-on-approve: freeze archive envelope + projection edits (no invention).
  v_content := jsonb_build_object(
    'schemaVersion', 'platform.report.rendition.v1',
    'archiveId', p_archive.id,
    'sessionId', p_archive.session_id,
    'projectionId', p_projection.id,
    'template', jsonb_build_object(
      'templateId', p_projection.template_id,
      'templateVersion', p_projection.template_version,
      'name', p_projection.template_name
    ),
    'therapistEdits', p_projection.therapist_edits,
    'inclusionOverrides', p_projection.inclusion_overrides,
    'sourceArchiveContentSha256', p_archive.content_sha256,
    'sourceArchiveEnvelope', p_archive.envelope,
    'approvedAt', p_approved_at,
    -- Explicit non-auto-include policy markers (presentation consumers).
    'policy', jsonb_build_object(
      'privateNotesAutoInclude', false,
      'fullTranscriptAutoInclude', false,
      'reportTemplateAuthority', null
    )
  );

  v_size := octet_length(convert_to(v_content::text, 'UTF8'));
  if v_size > 2097152 then
    raise exception 'approved rendition sealed_content exceeds soft size limit (2 MiB)'
      using errcode = '22001';
  end if;

  return v_content;
end;
$$;

comment on function public.platform_b6_build_sealed_content(public.platform_sealed_session_archives, public.platform_report_projections, timestamptz) is
  'B6: build immutable sealed_content from sealed archive + projection edits at approve time.';

revoke all on function public.platform_b6_build_sealed_content(public.platform_sealed_session_archives, public.platform_report_projections, timestamptz)
  from public;

-- ---------------------------------------------------------------------------
-- 5. RPC: platform_upsert_report_template (therapist-owned only)
-- ---------------------------------------------------------------------------

create or replace function public.platform_upsert_report_template(
  p_idempotency_key text,
  p_name text,
  p_version text,
  p_configuration jsonb,
  p_template_id uuid default null,
  p_specialty_id uuid default null,
  p_status text default 'draft'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'upsert_report_template';
  v_fp text;
  v_gate jsonb;
  v_row public.platform_report_templates%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_template_id::text, '') || '|' ||
    coalesce(p_name, '') || '|' ||
    coalesce(p_version, '') || '|' ||
    coalesce(p_status, '') || '|' ||
    coalesce(p_specialty_id::text, '') || '|' ||
    coalesce(p_configuration::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, null, v_fp, null
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if p_name is null or char_length(trim(p_name)) = 0 then
    raise exception 'template name required'
      using errcode = '23514';
  end if;
  if p_version is null or char_length(trim(p_version)) = 0 then
    raise exception 'template version required'
      using errcode = '23514';
  end if;
  if p_configuration is null or jsonb_typeof(p_configuration) <> 'object' then
    raise exception 'template configuration must be a jsonb object'
      using errcode = '23514';
  end if;
  if p_status is null or p_status not in ('draft', 'active', 'inactive') then
    raise exception 'template status must be draft, active, or inactive'
      using errcode = '23514';
  end if;

  if p_specialty_id is not null then
    if not exists (
      select 1 from public.radionics_specialties s where s.id = p_specialty_id
    ) then
      raise exception 'specialty not found'
        using errcode = 'P0002';
    end if;
  end if;

  if p_template_id is null then
    insert into public.platform_report_templates (
      therapist_id,
      name,
      version,
      status,
      configuration,
      specialty_id
    ) values (
      v_uid,
      trim(p_name),
      trim(p_version),
      p_status,
      p_configuration,
      p_specialty_id
    )
    returning * into v_row;
  else
    select * into v_row
    from public.platform_report_templates
    where id = p_template_id
      and therapist_id = v_uid
    for update;

    if not found then
      raise exception 'owned report template not found'
        using errcode = 'P0002';
    end if;

    update public.platform_report_templates
    set name = trim(p_name),
        version = trim(p_version),
        status = p_status,
        configuration = p_configuration,
        specialty_id = p_specialty_id
    where id = p_template_id
      and therapist_id = v_uid
    returning * into v_row;
  end if;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b6_template_json(v_row);

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_row.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_upsert_report_template(text, text, text, jsonb, uuid, uuid, text) is
  'B6: create/update therapist-owned report template only; opaque configuration; no official catalogue writes.';

-- ---------------------------------------------------------------------------
-- 6. RPC: platform_set_report_template_status
-- ---------------------------------------------------------------------------

create or replace function public.platform_set_report_template_status(
  p_template_id uuid,
  p_status text,
  p_idempotency_key text,
  p_expected_row_revision integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'set_report_template_status';
  v_fp text;
  v_gate jsonb;
  v_row public.platform_report_templates%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_template_id::text, '') || '|' ||
    coalesce(p_status, '') || '|' ||
    coalesce(p_expected_row_revision::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, null, v_fp, p_expected_row_revision
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if p_status is null or p_status not in ('draft', 'active', 'inactive') then
    raise exception 'template status must be draft, active, or inactive'
      using errcode = '23514';
  end if;

  select * into v_row
  from public.platform_report_templates
  where id = p_template_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'owned report template not found'
      using errcode = 'P0002';
  end if;

  if p_expected_row_revision is not null
     and v_row.row_revision is distinct from p_expected_row_revision then
    raise exception 'template row_revision conflict'
      using errcode = '40001';
  end if;

  update public.platform_report_templates
  set status = p_status
  where id = p_template_id
    and therapist_id = v_uid
  returning * into v_row;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b6_template_json(v_row);

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_row.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_set_report_template_status(uuid, text, text, integer) is
  'B6: set status on therapist-owned template only.';

-- ---------------------------------------------------------------------------
-- 7. RPC: platform_create_report_projection
-- ---------------------------------------------------------------------------

create or replace function public.platform_create_report_projection(
  p_session_id uuid,
  p_archive_id uuid,
  p_template_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'create_report_projection';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_archive public.platform_sealed_session_archives%rowtype;
  v_template public.platform_report_templates%rowtype;
  v_row public.platform_report_projections%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_archive_id::text, '') || '|' ||
    coalesce(p_template_id::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, null
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  select * into v_session
  from public.platform_sessions
  where id = p_session_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'session not found'
      using errcode = 'P0002';
  end if;

  select * into v_archive
  from public.platform_sealed_session_archives
  where id = p_archive_id
    and session_id = p_session_id
    and therapist_id = v_uid;

  if not found then
    raise exception 'sealed archive not found for session'
      using errcode = 'P0002';
  end if;

  select * into v_template
  from public.platform_report_templates
  where id = p_template_id
    and (therapist_id is null or therapist_id = v_uid);

  if not found then
    raise exception 'report template not found'
      using errcode = 'P0002';
  end if;

  if v_template.status <> 'active' then
    raise exception 'report template must be active'
      using errcode = '23514';
  end if;

  insert into public.platform_report_projections (
    therapist_id,
    session_id,
    archive_id,
    template_id,
    template_version,
    template_name,
    status,
    therapist_edits,
    inclusion_overrides
  ) values (
    v_uid,
    p_session_id,
    p_archive_id,
    v_template.id,
    v_template.version,
    v_template.name,
    'draft',
    '{}'::jsonb,
    '{}'::jsonb
  )
  returning * into v_row;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b6_projection_json(v_row);

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_row.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_create_report_projection(uuid, uuid, uuid, text) is
  'B6: create draft projection from sealed archive + active template; does not mutate archive.';

-- ---------------------------------------------------------------------------
-- 8. RPC: platform_update_report_projection_draft
-- ---------------------------------------------------------------------------

create or replace function public.platform_update_report_projection_draft(
  p_session_id uuid,
  p_projection_id uuid,
  p_idempotency_key text,
  p_therapist_edits jsonb default null,
  p_inclusion_overrides jsonb default null,
  p_clear_therapist_edits boolean default false,
  p_clear_inclusion_overrides boolean default false,
  p_expected_row_revision integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'update_report_projection_draft';
  v_fp text;
  v_gate jsonb;
  v_row public.platform_report_projections%rowtype;
  v_edits jsonb;
  v_overrides jsonb;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_projection_id::text, '') || '|' ||
    coalesce(p_therapist_edits::text, '') || '|' ||
    coalesce(p_inclusion_overrides::text, '') || '|' ||
    coalesce(p_clear_therapist_edits::text, '') || '|' ||
    coalesce(p_clear_inclusion_overrides::text, '') || '|' ||
    coalesce(p_expected_row_revision::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, p_expected_row_revision
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  select * into v_row
  from public.platform_report_projections
  where id = p_projection_id
    and session_id = p_session_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'report projection not found'
      using errcode = 'P0002';
  end if;

  if p_expected_row_revision is not null
     and v_row.row_revision is distinct from p_expected_row_revision then
    raise exception 'projection row_revision conflict'
      using errcode = '40001';
  end if;

  if v_row.status not in ('draft', 'in_review') then
    raise exception 'projection draft update requires status draft|in_review'
      using errcode = '23514';
  end if;

  if not p_clear_therapist_edits
     and p_therapist_edits is null
     and not p_clear_inclusion_overrides
     and p_inclusion_overrides is null then
    raise exception 'no draft fields to update'
      using errcode = '23514';
  end if;

  if p_clear_therapist_edits then
    v_edits := '{}'::jsonb;
  elsif p_therapist_edits is not null then
    if jsonb_typeof(p_therapist_edits) <> 'object' then
      raise exception 'therapist_edits must be a jsonb object'
        using errcode = '23514';
    end if;
    v_edits := p_therapist_edits;
  else
    v_edits := v_row.therapist_edits;
  end if;

  if p_clear_inclusion_overrides then
    v_overrides := '{}'::jsonb;
  elsif p_inclusion_overrides is not null then
    if jsonb_typeof(p_inclusion_overrides) <> 'object' then
      raise exception 'inclusion_overrides must be a jsonb object'
        using errcode = '23514';
    end if;
    v_overrides := p_inclusion_overrides;
  else
    v_overrides := v_row.inclusion_overrides;
  end if;

  update public.platform_report_projections
  set therapist_edits = v_edits,
      inclusion_overrides = v_overrides
  where id = p_projection_id
    and therapist_id = v_uid
  returning * into v_row;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b6_projection_json(v_row);

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_row.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_update_report_projection_draft(uuid, uuid, text, jsonb, jsonb, boolean, boolean, integer) is
  'B6: update therapist_edits / inclusion_overrides only; never mutates sealed archive.';

-- ---------------------------------------------------------------------------
-- 9. RPC: platform_set_report_projection_status
-- ---------------------------------------------------------------------------

create or replace function public.platform_set_report_projection_status(
  p_session_id uuid,
  p_projection_id uuid,
  p_status text,
  p_idempotency_key text,
  p_expected_row_revision integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'set_report_projection_status';
  v_fp text;
  v_gate jsonb;
  v_row public.platform_report_projections%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_projection_id::text, '') || '|' ||
    coalesce(p_status, '') || '|' ||
    coalesce(p_expected_row_revision::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, p_expected_row_revision
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if p_status is null or p_status not in ('draft', 'in_review') then
    raise exception 'projection status RPC allows only draft|in_review'
      using errcode = '23514';
  end if;

  select * into v_row
  from public.platform_report_projections
  where id = p_projection_id
    and session_id = p_session_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'report projection not found'
      using errcode = 'P0002';
  end if;

  if p_expected_row_revision is not null
     and v_row.row_revision is distinct from p_expected_row_revision then
    raise exception 'projection row_revision conflict'
      using errcode = '40001';
  end if;

  if v_row.status = 'approved' then
    raise exception 'approved projection status is immutable via set status RPC'
      using errcode = '23514';
  end if;

  if v_row.status is not distinct from p_status then
    null; -- no-op update still bumps revision via guard — skip if same
  elsif not public.platform_b6_projection_status_transition_ok(v_row.status, p_status) then
    raise exception 'invalid projection status transition'
      using errcode = '23514';
  end if;

  if v_row.status is distinct from p_status then
    update public.platform_report_projections
    set status = p_status
    where id = p_projection_id
      and therapist_id = v_uid
    returning * into v_row;
  end if;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b6_projection_json(v_row);

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_row.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_set_report_projection_status(uuid, uuid, text, text, integer) is
  'B6: narrow draft↔in_review status transitions; approve via platform_approve_report_rendition.';

-- ---------------------------------------------------------------------------
-- 10. RPC: platform_approve_report_rendition
-- ---------------------------------------------------------------------------

create or replace function public.platform_approve_report_rendition(
  p_session_id uuid,
  p_projection_id uuid,
  p_idempotency_key text,
  p_expected_row_revision integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'approve_rendition';
  v_fp text;
  v_gate jsonb;
  v_projection public.platform_report_projections%rowtype;
  v_archive public.platform_sealed_session_archives%rowtype;
  v_existing public.platform_approved_report_renditions%rowtype;
  v_rendition public.platform_approved_report_renditions%rowtype;
  v_content jsonb;
  v_hash text;
  v_version integer;
  v_now timestamptz := clock_timestamp();
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_projection_id::text, '') || '|' ||
    coalesce(p_expected_row_revision::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, p_expected_row_revision
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  select * into v_projection
  from public.platform_report_projections
  where id = p_projection_id
    and session_id = p_session_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'report projection not found'
      using errcode = 'P0002';
  end if;

  if p_expected_row_revision is not null
     and v_projection.row_revision is distinct from p_expected_row_revision then
    raise exception 'projection row_revision conflict'
      using errcode = '40001';
  end if;

  -- Idempotent: if already approved and rendition exists for this projection, return it.
  if v_projection.status = 'approved' then
    select * into v_existing
    from public.platform_approved_report_renditions
    where projection_id = p_projection_id
      and therapist_id = v_uid
    order by version desc
    limit 1;

    if found then
      v_body := jsonb_build_object(
        'status', 'accepted',
        'command_type', v_cmd,
        'replay', true
      ) || public.platform_b6_rendition_json(v_existing);

      perform public.platform_b2_finalize_idempotency(
        v_uid, p_idempotency_key, 'accepted', v_body, v_projection.row_revision
      );
      return v_body;
    end if;
  end if;

  if v_projection.status not in ('draft', 'in_review') then
    raise exception 'approve requires projection status draft|in_review'
      using errcode = '23514';
  end if;

  select * into v_archive
  from public.platform_sealed_session_archives
  where id = v_projection.archive_id
    and session_id = p_session_id
    and therapist_id = v_uid;

  if not found then
    raise exception 'sealed archive not found for projection'
      using errcode = 'P0002';
  end if;

  v_content := public.platform_b6_build_sealed_content(v_archive, v_projection, v_now);
  v_hash := public.platform_b6_content_sha256(v_content);

  select coalesce(max(r.version), 0) + 1
  into v_version
  from public.platform_approved_report_renditions r
  where r.session_id = p_session_id
    and r.therapist_id = v_uid;

  insert into public.platform_approved_report_renditions (
    therapist_id,
    session_id,
    archive_id,
    projection_id,
    template_id,
    template_version,
    template_name,
    version,
    approved_at,
    approved_by_therapist_id,
    sealed_content,
    content_sha256
  ) values (
    v_uid,
    p_session_id,
    v_projection.archive_id,
    v_projection.id,
    v_projection.template_id,
    v_projection.template_version,
    v_projection.template_name,
    v_version,
    v_now,
    v_uid,
    v_content,
    v_hash
  )
  returning * into v_rendition;

  update public.platform_report_projections
  set status = 'approved'
  where id = p_projection_id
    and therapist_id = v_uid
  returning * into v_projection;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'replay', false,
    'projectionStatus', v_projection.status
  ) || public.platform_b6_rendition_json(v_rendition);

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_projection.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_approve_report_rendition(uuid, uuid, text, integer) is
  'B6: approve immutable rendition from projection + sealed archive; no PDF; no archive mutation.';

-- ---------------------------------------------------------------------------
-- 11. RPC grants hardening
-- ---------------------------------------------------------------------------

revoke all on function public.platform_upsert_report_template(text, text, text, jsonb, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.platform_upsert_report_template(text, text, text, jsonb, uuid, uuid, text)
  to authenticated;

revoke all on function public.platform_set_report_template_status(uuid, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.platform_set_report_template_status(uuid, text, text, integer)
  to authenticated;

revoke all on function public.platform_create_report_projection(uuid, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.platform_create_report_projection(uuid, uuid, uuid, text)
  to authenticated;

revoke all on function public.platform_update_report_projection_draft(uuid, uuid, text, jsonb, jsonb, boolean, boolean, integer)
  from public, anon, authenticated;
grant execute on function public.platform_update_report_projection_draft(uuid, uuid, text, jsonb, jsonb, boolean, boolean, integer)
  to authenticated;

revoke all on function public.platform_set_report_projection_status(uuid, uuid, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.platform_set_report_projection_status(uuid, uuid, text, text, integer)
  to authenticated;

revoke all on function public.platform_approve_report_rendition(uuid, uuid, text, integer)
  from public, anon, authenticated;
grant execute on function public.platform_approve_report_rendition(uuid, uuid, text, integer)
  to authenticated;
