-- =============================================================================
-- RADIONICS — Platform Session F2 Batch B5 (local preparation)
-- Authorization: RADIONICS-F2-B5-LOCAL-AUTH-20260811-01
-- Design baseline: Platform_Session_F2_B5_Pre_Implementation_Readiness.md
-- OD-B5 proposed defaults treated as local implementation baseline:
--   seal completed-only; explicit seal (no auto-seal); testimony required;
--   prepare optional; private notes archived; transcript captures metadata always;
--   segments inclusion in (retained, pending_review); full B4C pool snapshot;
--   report_template_authority always NULL; content_sha256; one sealed per session
--
-- Creates:
--   platform_session_archive_assemblies
--   platform_sealed_session_archives
--   RPCs: platform_prepare_session_archive_assembly (optional helper)
--         platform_seal_session_archive (required atomic seal)
--
-- Write posture: RPC-only. Authenticated: SELECT only on B5 tables.
-- No post-seal UPDATE/DELETE/patch. No report generation / B6 tables.
-- No platform_methodologies. No therapeutic columns. No audio/STT.
-- Depends on: B1–B4C; reuses platform_b2_* idempotency helpers; pgcrypto.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. platform_session_archive_assemblies (WIP; mutable while in_assembly)
-- ---------------------------------------------------------------------------

create table public.platform_session_archive_assemblies (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  session_id uuid not null,
  assembly_status text not null default 'in_assembly',
  envelope_draft jsonb null,
  schema_version text not null default 'platform.session.archive.v1',
  superseded_by_archive_id uuid null,
  row_revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint platform_session_archive_assemblies_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_session_archive_assemblies_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  constraint platform_session_archive_assemblies_status_check
    check (assembly_status in ('in_assembly', 'superseded_by_seal')),

  constraint platform_session_archive_assemblies_envelope_draft_object
    check (envelope_draft is null or jsonb_typeof(envelope_draft) = 'object'),

  constraint platform_session_archive_assemblies_schema_version_not_empty
    check (char_length(trim(schema_version)) > 0),

  constraint platform_session_archive_assemblies_row_revision_positive
    check (row_revision >= 1),

  constraint platform_session_archive_assemblies_superseded_coherence
    check (
      (assembly_status = 'in_assembly' and superseded_by_archive_id is null)
      or (assembly_status = 'superseded_by_seal' and superseded_by_archive_id is not null)
    )
);

comment on table public.platform_session_archive_assemblies is
  'F2 B5: optional WIP archive assembly. Mutable only while in_assembly. RPC writes only.';

-- At most one active in_assembly row per session.
create unique index idx_platform_archive_one_in_assembly_per_session
  on public.platform_session_archive_assemblies (session_id)
  where assembly_status = 'in_assembly';

create index idx_platform_session_archive_assemblies_session
  on public.platform_session_archive_assemblies (session_id, therapist_id);

create index idx_platform_session_archive_assemblies_therapist_id
  on public.platform_session_archive_assemblies (therapist_id);

create trigger trg_platform_session_archive_assemblies_guard_mutable
  before insert or update on public.platform_session_archive_assemblies
  for each row execute function public.platform_guard_mutable_owned_row();

alter table public.platform_session_archive_assemblies enable row level security;

create policy "platform_session_archive_assemblies_select_own"
  on public.platform_session_archive_assemblies
  for select
  to authenticated
  using (therapist_id = auth.uid());

revoke all privileges
  on table public.platform_session_archive_assemblies
  from public, anon, authenticated;

grant select
  on table public.platform_session_archive_assemblies
  to authenticated;

-- ---------------------------------------------------------------------------
-- 2. platform_sealed_session_archives (immutable)
-- ---------------------------------------------------------------------------

create table public.platform_sealed_session_archives (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  session_id uuid not null,
  testimony_snapshot_id uuid not null,
  envelope jsonb not null,
  content_sha256 text not null,
  assembly_status text not null default 'sealed',
  sealed_at timestamptz not null,
  sealed_by_therapist_id uuid not null,
  archive_schema_version text not null default 'platform.session.archive.v1',
  schema_version text not null default 'platform.session.sealedArchive.v1',
  report_template_authority text null,
  created_at timestamptz not null default now(),

  constraint platform_sealed_session_archives_id_therapist_unique
    unique (id, therapist_id),

  -- One sealed archive per session (fail closed on divergent re-seal).
  constraint platform_sealed_session_archives_session_unique
    unique (session_id),

  constraint platform_sealed_session_archives_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  constraint platform_sealed_session_archives_testimony_fk
    foreign key (testimony_snapshot_id, therapist_id)
    references public.platform_client_testimony_snapshots (id, therapist_id)
    on delete restrict,

  constraint platform_sealed_session_archives_assembly_status_sealed
    check (assembly_status = 'sealed'),

  constraint platform_sealed_session_archives_envelope_is_object
    check (jsonb_typeof(envelope) = 'object'),

  constraint platform_sealed_session_archives_content_sha256_hex
    check (content_sha256 ~ '^[0-9a-f]{64}$'),

  constraint platform_sealed_session_archives_report_template_authority_null
    check (report_template_authority is null),

  constraint platform_sealed_session_archives_archive_schema_not_empty
    check (char_length(trim(archive_schema_version)) > 0),

  constraint platform_sealed_session_archives_schema_version_not_empty
    check (char_length(trim(schema_version)) > 0),

  constraint platform_sealed_session_archives_sealed_by_matches_owner
    check (sealed_by_therapist_id = therapist_id)
);

comment on table public.platform_sealed_session_archives is
  'F2 B5: immutable sealed canonical session archive. Insert via seal RPC only. Archive ≠ report.';

-- Assembly supersession FK (additive; assemblies created first).
alter table public.platform_session_archive_assemblies
  add constraint platform_session_archive_assemblies_superseded_by_fk
  foreign key (superseded_by_archive_id, therapist_id)
  references public.platform_sealed_session_archives (id, therapist_id)
  on delete restrict;

create index idx_platform_sealed_session_archives_therapist_id
  on public.platform_sealed_session_archives (therapist_id);

create index idx_platform_sealed_session_archives_testimony
  on public.platform_sealed_session_archives (testimony_snapshot_id);

create or replace function public.platform_b5_reject_sealed_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'platform_sealed_session_archives is immutable'
    using errcode = '23514';
end;
$$;

comment on function public.platform_b5_reject_sealed_mutation() is
  'B5: reject UPDATE/DELETE on sealed session archives.';

revoke all on function public.platform_b5_reject_sealed_mutation() from public;

create trigger trg_platform_sealed_session_archives_immutable
  before update or delete on public.platform_sealed_session_archives
  for each row execute function public.platform_b5_reject_sealed_mutation();

alter table public.platform_sealed_session_archives enable row level security;

create policy "platform_sealed_session_archives_select_own"
  on public.platform_sealed_session_archives
  for select
  to authenticated
  using (therapist_id = auth.uid());

revoke all privileges
  on table public.platform_sealed_session_archives
  from public, anon, authenticated;

grant select
  on table public.platform_sealed_session_archives
  to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Internal helpers
-- ---------------------------------------------------------------------------

create or replace function public.platform_b5_session_allows_seal(p_lifecycle text)
returns boolean
language sql
immutable
as $$
  select p_lifecycle = 'completed';
$$;

comment on function public.platform_b5_session_allows_seal(text) is
  'B5: seal allowed only when lifecycle_status = completed.';

revoke all on function public.platform_b5_session_allows_seal(text) from public;

create or replace function public.platform_b5_session_allows_prepare(p_lifecycle text)
returns boolean
language sql
immutable
as $$
  select p_lifecycle in ('closing', 'completed');
$$;

comment on function public.platform_b5_session_allows_prepare(text) is
  'B5: prepare assembly allowed in closing|completed.';

revoke all on function public.platform_b5_session_allows_prepare(text) from public;

create or replace function public.platform_b5_envelope_sha256(p_envelope jsonb)
returns text
language sql
immutable
as $$
  select encode(digest(convert_to(p_envelope::text, 'UTF8'), 'sha256'), 'hex');
$$;

comment on function public.platform_b5_envelope_sha256(jsonb) is
  'B5: content_sha256 of canonical jsonb::text UTF-8 bytes (pgcrypto).';

revoke all on function public.platform_b5_envelope_sha256(jsonb) from public;

create or replace function public.platform_b5_build_envelope(
  p_session public.platform_sessions,
  p_testimony public.platform_client_testimony_snapshots,
  p_sealed_at timestamptz,
  p_include_sealing boolean
)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  v_plan jsonb;
  v_executions jsonb;
  v_notes jsonb;
  v_timeline jsonb;
  v_captures jsonb;
  v_segments jsonb;
  v_contributions jsonb;
  v_envelope jsonb;
  v_size integer;
begin
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'specialtyId', p.specialty_id,
      'methodologyId', p.methodology_id,
      'methodologySlug', p.methodology_slug,
      'methodologyName', p.methodology_name,
      'specialtySlug', p.specialty_slug,
      'specialtyName', p.specialty_name,
      'role', p.role,
      'sequenceOrder', p.sequence_order,
      'schemaVersion', p.schema_version,
      'rowRevision', p.row_revision,
      'createdAt', p.created_at,
      'updatedAt', p.updated_at
    )
    order by p.sequence_order
  ), '[]'::jsonb)
  into v_plan
  from public.platform_session_plan_items p
  where p.session_id = p_session.id
    and p.therapist_id = p_session.therapist_id;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', e.id,
      'specialtyId', e.specialty_id,
      'methodologyId', e.methodology_id,
      'methodologySlug', e.methodology_slug,
      'methodologyName', e.methodology_name,
      'specialtySlug', e.specialty_slug,
      'specialtyName', e.specialty_name,
      'role', e.role,
      'sequenceOrder', e.sequence_order,
      'status', e.status,
      'adapterId', e.adapter_id,
      'adapterVersion', e.adapter_version,
      'workflowTemplateId', e.workflow_template_id,
      'workflowVersion', e.workflow_version,
      'stateSchemaVersion', e.state_schema_version,
      'statePayload', e.state_payload,
      'progress', e.progress,
      'completionAwareness', e.completion_awareness,
      'startedAt', e.started_at,
      'pausedAt', e.paused_at,
      'resumedAt', e.resumed_at,
      'completedAt', e.completed_at,
      'planItemId', e.plan_item_id,
      'rowRevision', e.row_revision,
      'createdAt', e.created_at,
      'updatedAt', e.updated_at
    )
    order by e.sequence_order
  ), '[]'::jsonb)
  into v_executions
  from public.platform_methodology_executions e
  where e.session_id = p_session.id
    and e.therapist_id = p_session.therapist_id;

  -- All notes including private (disposition retained; not auto-report).
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', n.id,
      'executionId', n.execution_id,
      'kind', n.kind,
      'body', n.body,
      'disposition', n.disposition,
      'provenance', n.provenance,
      'context', n.context,
      'schemaVersion', n.schema_version,
      'rowRevision', n.row_revision,
      'createdAt', n.created_at,
      'updatedAt', n.updated_at
    )
    order by n.created_at, n.id
  ), '[]'::jsonb)
  into v_notes
  from public.platform_session_notes n
  where n.session_id = p_session.id
    and n.therapist_id = p_session.therapist_id;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', t.id,
      'executionId', t.execution_id,
      'source', t.source,
      'eventType', t.event_type,
      'occurredAt', t.occurred_at,
      'payloadSchemaVersion', t.payload_schema_version,
      'payload', t.payload,
      'schemaVersion', t.schema_version,
      'createdAt', t.created_at
    )
    order by t.occurred_at, t.id
  ), '[]'::jsonb)
  into v_timeline
  from public.platform_timeline_events t
  where t.session_id = p_session.id
    and t.therapist_id = p_session.therapist_id;

  -- Capture metadata always (no audio).
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'executionId', c.execution_id,
      'captureMode', c.capture_mode,
      'status', c.status,
      'startedAt', c.started_at,
      'stoppedAt', c.stopped_at,
      'consentRecorded', c.consent_recorded,
      'privacyLabel', c.privacy_label,
      'schemaVersion', c.schema_version,
      'rowRevision', c.row_revision,
      'createdAt', c.created_at,
      'updatedAt', c.updated_at
    )
    order by c.created_at, c.id
  ), '[]'::jsonb)
  into v_captures
  from public.platform_transcript_captures c
  where c.session_id = p_session.id
    and c.therapist_id = p_session.therapist_id;

  -- Segments: retained + pending_review only (exclude excluded).
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'captureId', s.capture_id,
      'executionId', s.execution_id,
      'text', s.text,
      'startedAt', s.started_at,
      'endedAt', s.ended_at,
      'inclusion', s.inclusion,
      'provenance', s.provenance,
      'schemaVersion', s.schema_version,
      'rowRevision', s.row_revision,
      'createdAt', s.created_at,
      'updatedAt', s.updated_at
    )
    order by s.started_at, s.id
  ), '[]'::jsonb)
  into v_segments
  from public.platform_transcript_segments s
  where s.session_id = p_session.id
    and s.therapist_id = p_session.therapist_id
    and s.inclusion in ('retained', 'pending_review');

  -- Entire B4C contribution pool with inclusion states.
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'executionId', r.execution_id,
      'specialtyId', r.specialty_id,
      'methodologySlug', r.methodology_slug,
      'methodologyName', r.methodology_name,
      'contributionKind', r.contribution_kind,
      'source', r.source,
      'structuredValue', r.structured_value,
      'humanReadableValue', r.human_readable_value,
      'inclusion', r.inclusion,
      'provenance', r.provenance,
      'noteId', r.note_id,
      'timelineEventId', r.timeline_event_id,
      'transcriptCaptureId', r.transcript_capture_id,
      'transcriptSegmentId', r.transcript_segment_id,
      'schemaVersion', r.schema_version,
      'rowRevision', r.row_revision,
      'createdAt', r.created_at,
      'updatedAt', r.updated_at
    )
    order by r.created_at, r.id
  ), '[]'::jsonb)
  into v_contributions
  from public.platform_report_contributions r
  where r.session_id = p_session.id
    and r.therapist_id = p_session.therapist_id;

  v_envelope := jsonb_build_object(
    'sessionId', p_session.id,
    'schemaVersion', 'platform.session.archive.v1',
    'platformFacts', jsonb_build_object(
      'sessionId', p_session.id,
      'therapistId', p_session.therapist_id,
      'clientId', p_session.client_id,
      'lifecycleStatus', p_session.lifecycle_status,
      'sessionMode', p_session.session_mode,
      'intention', p_session.intention,
      'scheduledAt', p_session.scheduled_at,
      'schedulingTimezone', p_session.scheduling_timezone,
      'accumulatedActiveDurationMs', p_session.accumulated_active_duration_ms,
      'activeTimerStartedAt', p_session.active_timer_started_at,
      'startedAt', p_session.started_at,
      'closingEnteredAt', p_session.closing_entered_at,
      'completedAt', p_session.completed_at,
      'cancelledAt', p_session.cancelled_at,
      'cancellationReason', p_session.cancellation_reason,
      'activeExecutionId', p_session.active_execution_id,
      'rowRevision', p_session.row_revision,
      'createdAt', p_session.created_at,
      'updatedAt', p_session.updated_at
    ),
    'testimonySnapshot', jsonb_build_object(
      'id', p_testimony.id,
      'sessionId', p_testimony.session_id,
      'clientId', p_testimony.client_id,
      'capturedAt', p_testimony.captured_at,
      'identity', p_testimony.identity,
      'schemaVersion', p_testimony.schema_version,
      'createdAt', p_testimony.created_at
    ),
    'sessionPlan', v_plan,
    'methodologyExecutions', v_executions,
    'notes', v_notes,
    'timeline', v_timeline,
    'transcriptCaptures', v_captures,
    'transcriptSegments', v_segments,
    'reportContributions', v_contributions,
    'provenance', jsonb_build_object(
      'assembledAt', coalesce(p_sealed_at, now()),
      'assembledBy', 'platform_b5_build_envelope'
    ),
    'reportTemplateAuthority', null
  );

  if p_include_sealing then
    v_envelope := v_envelope || jsonb_build_object(
      'sealing', jsonb_build_object(
        'sealedAt', p_sealed_at,
        'sealedByTherapistId', p_session.therapist_id,
        'archiveSchemaVersion', 'platform.session.archive.v1'
      )
    );
  end if;

  -- Soft size limit ~2 MiB (F2 guidance); fail closed if exceeded.
  v_size := octet_length(convert_to(v_envelope::text, 'UTF8'));
  if v_size > 2097152 then
    raise exception 'archive envelope exceeds soft size limit (2 MiB)'
      using errcode = '22001';
  end if;

  return v_envelope;
end;
$$;

comment on function public.platform_b5_build_envelope(public.platform_sessions, public.platform_client_testimony_snapshots, timestamptz, boolean) is
  'B5: assemble canonical archive envelope from live B1–B4C sources.';

revoke all on function public.platform_b5_build_envelope(public.platform_sessions, public.platform_client_testimony_snapshots, timestamptz, boolean)
  from public;

create or replace function public.platform_b5_sealed_json(
  p_row public.platform_sealed_session_archives
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'archiveId', p_row.id,
    'sessionId', p_row.session_id,
    'testimonySnapshotId', p_row.testimony_snapshot_id,
    'assemblyStatus', p_row.assembly_status,
    'contentSha256', p_row.content_sha256,
    'sealedAt', p_row.sealed_at,
    'sealedByTherapistId', p_row.sealed_by_therapist_id,
    'archiveSchemaVersion', p_row.archive_schema_version,
    'schemaVersion', p_row.schema_version,
    'reportTemplateAuthority', p_row.report_template_authority,
    'createdAt', p_row.created_at
  );
$$;

comment on function public.platform_b5_sealed_json(public.platform_sealed_session_archives) is
  'B5: safe sealed-archive response metadata (envelope omitted from default response).';

revoke all on function public.platform_b5_sealed_json(public.platform_sealed_session_archives) from public;

-- ---------------------------------------------------------------------------
-- 4. RPC: platform_prepare_session_archive_assembly
-- ---------------------------------------------------------------------------

create or replace function public.platform_prepare_session_archive_assembly(
  p_session_id uuid,
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
  v_cmd text := 'prepare_session_archive_assembly';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_testimony public.platform_client_testimony_snapshots%rowtype;
  v_assembly public.platform_session_archive_assemblies%rowtype;
  v_sealed public.platform_sealed_session_archives%rowtype;
  v_draft jsonb;
  v_body jsonb;
  v_now timestamptz := clock_timestamp();
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_expected_row_revision::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, p_expected_row_revision
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

  if p_expected_row_revision is not null
     and v_session.row_revision is distinct from p_expected_row_revision then
    raise exception 'session row_revision conflict'
      using errcode = '40001';
  end if;

  if not public.platform_b5_session_allows_prepare(v_session.lifecycle_status) then
    raise exception 'archive assembly prepare requires session lifecycle closing|completed'
      using errcode = '23514';
  end if;

  select * into v_sealed
  from public.platform_sealed_session_archives
  where session_id = p_session_id
    and therapist_id = v_uid;

  if found then
    raise exception 'session archive already sealed'
      using errcode = '23505';
  end if;

  select * into v_testimony
  from public.platform_client_testimony_snapshots
  where session_id = p_session_id
    and therapist_id = v_uid;

  if not found then
    raise exception 'testimony snapshot required for archive assembly'
      using errcode = 'P0002';
  end if;

  v_draft := public.platform_b5_build_envelope(v_session, v_testimony, v_now, false);

  select * into v_assembly
  from public.platform_session_archive_assemblies
  where session_id = p_session_id
    and therapist_id = v_uid
    and assembly_status = 'in_assembly'
  for update;

  if found then
    update public.platform_session_archive_assemblies
    set envelope_draft = v_draft,
        schema_version = 'platform.session.archive.v1'
    where id = v_assembly.id
      and therapist_id = v_uid
    returning * into v_assembly;
  else
    insert into public.platform_session_archive_assemblies (
      therapist_id,
      session_id,
      assembly_status,
      envelope_draft,
      schema_version
    ) values (
      v_uid,
      p_session_id,
      'in_assembly',
      v_draft,
      'platform.session.archive.v1'
    )
    returning * into v_assembly;
  end if;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'archiveId', v_assembly.id,
    'sessionId', v_assembly.session_id,
    'assemblyStatus', v_assembly.assembly_status,
    'schemaVersion', v_assembly.schema_version,
    'rowRevision', v_assembly.row_revision,
    'createdAt', v_assembly.created_at,
    'updatedAt', v_assembly.updated_at
  );

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_assembly.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_prepare_session_archive_assembly(uuid, text, integer) is
  'B5: optional WIP archive assembly create/refresh; seal remains atomic authority.';

-- ---------------------------------------------------------------------------
-- 5. RPC: platform_seal_session_archive
-- ---------------------------------------------------------------------------

create or replace function public.platform_seal_session_archive(
  p_session_id uuid,
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
  v_cmd text := 'seal_archive';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_testimony public.platform_client_testimony_snapshots%rowtype;
  v_existing public.platform_sealed_session_archives%rowtype;
  v_sealed public.platform_sealed_session_archives%rowtype;
  v_envelope jsonb;
  v_hash text;
  v_archive_id uuid := gen_random_uuid();
  v_now timestamptz := clock_timestamp();
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_expected_row_revision::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, p_expected_row_revision
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

  if p_expected_row_revision is not null
     and v_session.row_revision is distinct from p_expected_row_revision then
    raise exception 'session row_revision conflict'
      using errcode = '40001';
  end if;

  if not public.platform_b5_session_allows_seal(v_session.lifecycle_status) then
    raise exception 'archive seal requires session lifecycle completed'
      using errcode = '23514';
  end if;

  -- One sealed archive per session: return existing (no overwrite / no divergent re-seal).
  select * into v_existing
  from public.platform_sealed_session_archives
  where session_id = p_session_id
    and therapist_id = v_uid;

  if found then
    v_body := jsonb_build_object(
      'status', 'accepted',
      'command_type', v_cmd,
      'replay', true
    ) || public.platform_b5_sealed_json(v_existing);

    perform public.platform_b2_finalize_idempotency(
      v_uid, p_idempotency_key, 'accepted', v_body, v_session.row_revision
    );
    return v_body;
  end if;

  select * into v_testimony
  from public.platform_client_testimony_snapshots
  where session_id = p_session_id
    and therapist_id = v_uid;

  if not found then
    raise exception 'testimony snapshot required to seal archive'
      using errcode = 'P0002';
  end if;

  v_envelope := public.platform_b5_build_envelope(v_session, v_testimony, v_now, true);
  v_envelope := jsonb_set(v_envelope, '{archiveId}', to_jsonb(v_archive_id), true);
  v_hash := public.platform_b5_envelope_sha256(v_envelope);

  insert into public.platform_sealed_session_archives (
    id,
    therapist_id,
    session_id,
    testimony_snapshot_id,
    envelope,
    content_sha256,
    assembly_status,
    sealed_at,
    sealed_by_therapist_id,
    archive_schema_version,
    schema_version,
    report_template_authority
  ) values (
    v_archive_id,
    v_uid,
    p_session_id,
    v_testimony.id,
    v_envelope,
    v_hash,
    'sealed',
    v_now,
    v_uid,
    'platform.session.archive.v1',
    'platform.session.sealedArchive.v1',
    null
  )
  returning * into v_sealed;

  update public.platform_session_archive_assemblies
  set assembly_status = 'superseded_by_seal',
      superseded_by_archive_id = v_sealed.id
  where session_id = p_session_id
    and therapist_id = v_uid
    and assembly_status = 'in_assembly';

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'replay', false
  ) || public.platform_b5_sealed_json(v_sealed);

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_session.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_seal_session_archive(uuid, text, integer) is
  'B5: atomic seal of canonical session archive from live B1–B4C sources; no report generation.';

-- ---------------------------------------------------------------------------
-- 6. RPC grants hardening
-- ---------------------------------------------------------------------------

revoke all on function public.platform_prepare_session_archive_assembly(uuid, text, integer)
  from public, anon, authenticated;
grant execute on function public.platform_prepare_session_archive_assembly(uuid, text, integer)
  to authenticated;

revoke all on function public.platform_seal_session_archive(uuid, text, integer)
  from public, anon, authenticated;
grant execute on function public.platform_seal_session_archive(uuid, text, integer)
  to authenticated;
