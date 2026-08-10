-- =============================================================================
-- RADIONICS — Platform Session F2 Batch B4B (local preparation)
-- Authorization: RADIONICS-F2-B4B-LOCAL-AUTH-20260810-01
-- Design baseline: Platform_Session_F2_B4B_Pre_Implementation_Readiness.md
-- OD defaults applied: OD-B4B-2…14 proposed defaults (consent required; no draft;
--   one active full_session; inclusion-only edits; no provisional persistence)
--
-- Creates:
--   platform_transcript_captures
--   platform_transcript_segments
--   RPCs: platform_start_transcript_capture
--         platform_pause_transcript_capture
--         platform_resume_transcript_capture
--         platform_stop_transcript_capture
--         platform_append_transcript_segment
--         platform_update_transcript_segment_inclusion
--
-- Write posture: RPC-only. Authenticated: SELECT only on B4B tables.
-- RPC EXECUTE: authenticated only (revoke from public, anon, authenticated).
-- Confirmed text segments only. No raw audio / STT / live bar / provisional rows.
-- Append to stopped captures allowed for post-capture confirmation while session
-- remains in_progress|paused|closing (not a provisional-text store).
-- Segment→capture FK is same-session: (capture_id, therapist_id, session_id).
-- No contributions/archive/report. No platform_methodologies.
-- Optional same-session execution_id → platform_methodology_executions.
-- Depends on: B1–B4A; reuses platform_b2_* idempotency helpers.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. platform_transcript_captures
-- ---------------------------------------------------------------------------

create table public.platform_transcript_captures (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  session_id uuid not null,
  execution_id uuid null,
  capture_mode text not null,
  status text not null,
  started_at timestamptz null,
  stopped_at timestamptz null,
  consent_recorded boolean not null default false,
  privacy_label text null,
  schema_version text not null default 'platform.session.transcriptCapture.v1',
  row_revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint platform_transcript_captures_id_therapist_unique
    unique (id, therapist_id),

  -- Same-session capture target for segment ownership FK (capture_id, therapist_id, session_id).
  constraint platform_transcript_captures_id_therapist_session_unique
    unique (id, therapist_id, session_id),

  constraint platform_transcript_captures_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  constraint platform_transcript_captures_execution_fk
    foreign key (session_id, therapist_id, execution_id)
    references public.platform_methodology_executions (session_id, therapist_id, id)
    on delete restrict,

  constraint platform_transcript_captures_mode_check
    check (capture_mode in ('full_session', 'point_in_time')),

  constraint platform_transcript_captures_status_check
    check (status in ('idle', 'listening', 'paused', 'stopped')),

  constraint platform_transcript_captures_schema_version_not_empty
    check (char_length(trim(schema_version)) > 0),

  constraint platform_transcript_captures_row_revision_positive
    check (row_revision >= 1),

  constraint platform_transcript_captures_privacy_label_trim
    check (privacy_label is null or char_length(trim(privacy_label)) > 0)
);

comment on table public.platform_transcript_captures is
  'F2 B4B: transcript capture metadata (full_session|point_in_time). No audio. RPC writes only.';

-- At most one non-stopped full_session capture per session/therapist (OD-B4B-11).
create unique index idx_platform_transcript_one_active_full_session
  on public.platform_transcript_captures (session_id, therapist_id)
  where capture_mode = 'full_session'
    and status in ('listening', 'paused', 'idle');

create index idx_platform_transcript_captures_session_therapist
  on public.platform_transcript_captures (session_id, therapist_id);

create index idx_platform_transcript_captures_therapist_id
  on public.platform_transcript_captures (therapist_id);

create index idx_platform_transcript_captures_execution_id
  on public.platform_transcript_captures (execution_id)
  where execution_id is not null;

create index idx_platform_transcript_captures_session_mode_status
  on public.platform_transcript_captures (session_id, capture_mode, status);

create trigger trg_platform_transcript_captures_guard_mutable
  before insert or update on public.platform_transcript_captures
  for each row execute function public.platform_guard_mutable_owned_row();

alter table public.platform_transcript_captures enable row level security;

create policy "platform_transcript_captures_select_own"
  on public.platform_transcript_captures
  for select
  to authenticated
  using (therapist_id = auth.uid());

revoke all privileges
  on table public.platform_transcript_captures
  from public, anon, authenticated;

grant select
  on table public.platform_transcript_captures
  to authenticated;

-- ---------------------------------------------------------------------------
-- 2. platform_transcript_segments (confirmed text only)
-- ---------------------------------------------------------------------------

create table public.platform_transcript_segments (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  session_id uuid not null,
  capture_id uuid not null,
  execution_id uuid null,
  text text not null,
  started_at timestamptz not null,
  ended_at timestamptz null,
  inclusion text not null,
  provenance jsonb not null,
  schema_version text not null default 'platform.session.transcriptSegment.v1',
  row_revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint platform_transcript_segments_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_transcript_segments_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  -- Same-session integrity: segment session_id must match parent capture session_id.
  constraint platform_transcript_segments_capture_fk
    foreign key (capture_id, therapist_id, session_id)
    references public.platform_transcript_captures (id, therapist_id, session_id)
    on delete restrict,

  constraint platform_transcript_segments_execution_fk
    foreign key (session_id, therapist_id, execution_id)
    references public.platform_methodology_executions (session_id, therapist_id, id)
    on delete restrict,

  constraint platform_transcript_segments_text_not_empty
    check (char_length(trim(text)) > 0),

  constraint platform_transcript_segments_inclusion_check
    check (inclusion in ('retained', 'excluded', 'pending_review')),

  constraint platform_transcript_segments_provenance_is_object
    check (jsonb_typeof(provenance) = 'object'),

  constraint platform_transcript_segments_schema_version_not_empty
    check (char_length(trim(schema_version)) > 0),

  constraint platform_transcript_segments_row_revision_positive
    check (row_revision >= 1),

  constraint platform_transcript_segments_ended_after_started
    check (ended_at is null or ended_at >= started_at)
);

comment on table public.platform_transcript_segments is
  'F2 B4B: confirmed transcript text segments only. Same-session capture FK. No provisional/live text. No audio. RPC writes only.';

create index idx_platform_transcript_segments_session_started
  on public.platform_transcript_segments (session_id, started_at);

create index idx_platform_transcript_segments_capture_started
  on public.platform_transcript_segments (capture_id, started_at);

create index idx_platform_transcript_segments_session_therapist
  on public.platform_transcript_segments (session_id, therapist_id);

create index idx_platform_transcript_segments_therapist_id
  on public.platform_transcript_segments (therapist_id);

create index idx_platform_transcript_segments_execution_id
  on public.platform_transcript_segments (execution_id)
  where execution_id is not null;

create trigger trg_platform_transcript_segments_guard_mutable
  before insert or update on public.platform_transcript_segments
  for each row execute function public.platform_guard_mutable_owned_row();

alter table public.platform_transcript_segments enable row level security;

create policy "platform_transcript_segments_select_own"
  on public.platform_transcript_segments
  for select
  to authenticated
  using (therapist_id = auth.uid());

revoke all privileges
  on table public.platform_transcript_segments
  from public, anon, authenticated;

grant select
  on table public.platform_transcript_segments
  to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Internal helpers (B4B)
-- ---------------------------------------------------------------------------

create or replace function public.platform_b4b_session_allows_transcript(
  p_lifecycle_status text
)
returns boolean
language sql
immutable
as $$
  select p_lifecycle_status in ('in_progress', 'paused', 'closing');
$$;

comment on function public.platform_b4b_session_allows_transcript(text) is
  'B4B: transcript writes allowed only for in_progress|paused|closing (not draft/terminal).';

revoke all on function public.platform_b4b_session_allows_transcript(text) from public;

create or replace function public.platform_b4b_capture_json(
  p_capture public.platform_transcript_captures
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'capture_id', p_capture.id,
    'session_id', p_capture.session_id,
    'execution_id', p_capture.execution_id,
    'capture_mode', p_capture.capture_mode,
    'status', p_capture.status,
    'started_at', p_capture.started_at,
    'stopped_at', p_capture.stopped_at,
    'consent_recorded', p_capture.consent_recorded,
    'privacy_label', p_capture.privacy_label,
    'row_revision', p_capture.row_revision,
    'created_at', p_capture.created_at,
    'updated_at', p_capture.updated_at
  );
$$;

revoke all on function public.platform_b4b_capture_json(public.platform_transcript_captures) from public;

-- ---------------------------------------------------------------------------
-- 4. RPC: platform_start_transcript_capture
-- ---------------------------------------------------------------------------

create or replace function public.platform_start_transcript_capture(
  p_session_id uuid,
  p_capture_mode text,
  p_consent_recorded boolean,
  p_idempotency_key text,
  p_execution_id uuid default null,
  p_privacy_label text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'start_transcript_capture';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_capture public.platform_transcript_captures%rowtype;
  v_now timestamptz := now();
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_capture_mode, '') || '|' ||
    coalesce(p_consent_recorded::text, '') || '|' ||
    coalesce(p_execution_id::text, '') || '|' ||
    coalesce(p_privacy_label, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, null
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if p_capture_mode is null
     or p_capture_mode not in ('full_session', 'point_in_time') then
    raise exception 'capture_mode must be full_session or point_in_time'
      using errcode = '23514';
  end if;

  if coalesce(p_consent_recorded, false) is not true then
    raise exception 'consent_recorded must be true before listening'
      using errcode = '23514';
  end if;

  if p_privacy_label is not null and char_length(trim(p_privacy_label)) = 0 then
    raise exception 'privacy_label must be non-empty when provided'
      using errcode = '23514';
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

  if not public.platform_b4b_session_allows_transcript(v_session.lifecycle_status) then
    raise exception 'transcript start requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  if p_execution_id is not null then
    if not exists (
      select 1
      from public.platform_methodology_executions e
      where e.id = p_execution_id
        and e.session_id = p_session_id
        and e.therapist_id = v_uid
    ) then
      raise exception 'execution not found for session'
        using errcode = 'P0002';
    end if;
  end if;

  -- Mode separation: starting point_in_time must not resume/mutate full_session.
  -- Concurrent non-stopped full_session blocked by partial unique index + explicit check.
  if p_capture_mode = 'full_session' then
    if exists (
      select 1
      from public.platform_transcript_captures c
      where c.session_id = p_session_id
        and c.therapist_id = v_uid
        and c.capture_mode = 'full_session'
        and c.status in ('listening', 'paused', 'idle')
    ) then
      raise exception 'session already has an active full_session transcript capture'
        using errcode = '23505';
    end if;
  end if;

  insert into public.platform_transcript_captures (
    therapist_id,
    session_id,
    execution_id,
    capture_mode,
    status,
    started_at,
    stopped_at,
    consent_recorded,
    privacy_label
  ) values (
    v_uid,
    p_session_id,
    p_execution_id,
    p_capture_mode,
    'listening',
    v_now,
    null,
    true,
    case when p_privacy_label is null then null else trim(p_privacy_label) end
  )
  returning * into v_capture;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b4b_capture_json(v_capture);

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_capture.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_start_transcript_capture(uuid, text, boolean, text, uuid, text) is
  'B4B: start transcript capture in listening; consent required; modes full_session|point_in_time; no audio.';

-- ---------------------------------------------------------------------------
-- 5. RPC: platform_pause_transcript_capture
-- ---------------------------------------------------------------------------

create or replace function public.platform_pause_transcript_capture(
  p_session_id uuid,
  p_capture_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'pause_transcript_capture';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_capture public.platform_transcript_captures%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_capture_id::text, '')
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

  if not public.platform_b4b_session_allows_transcript(v_session.lifecycle_status) then
    raise exception 'transcript pause requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  select * into v_capture
  from public.platform_transcript_captures
  where id = p_capture_id
    and session_id = p_session_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'transcript capture not found'
      using errcode = 'P0002';
  end if;

  if v_capture.status <> 'listening' then
    raise exception 'transcript capture must be listening to pause'
      using errcode = '23514';
  end if;

  update public.platform_transcript_captures
  set status = 'paused'
  where id = p_capture_id
    and therapist_id = v_uid
  returning * into v_capture;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b4b_capture_json(v_capture);

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_capture.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_pause_transcript_capture(uuid, uuid, text) is
  'B4B: pause listening transcript capture (listening → paused).';

-- ---------------------------------------------------------------------------
-- 6. RPC: platform_resume_transcript_capture
-- ---------------------------------------------------------------------------

create or replace function public.platform_resume_transcript_capture(
  p_session_id uuid,
  p_capture_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'resume_transcript_capture';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_capture public.platform_transcript_captures%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_capture_id::text, '')
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

  if not public.platform_b4b_session_allows_transcript(v_session.lifecycle_status) then
    raise exception 'transcript resume requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  select * into v_capture
  from public.platform_transcript_captures
  where id = p_capture_id
    and session_id = p_session_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'transcript capture not found'
      using errcode = 'P0002';
  end if;

  if v_capture.status <> 'paused' then
    raise exception 'transcript capture must be paused to resume'
      using errcode = '23514';
  end if;

  -- Resume only the same capture — never silently promote point_in_time into full_session.
  if not coalesce(v_capture.consent_recorded, false) then
    raise exception 'consent_recorded must be true before listening'
      using errcode = '23514';
  end if;

  update public.platform_transcript_captures
  set status = 'listening'
  where id = p_capture_id
    and therapist_id = v_uid
  returning * into v_capture;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b4b_capture_json(v_capture);

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_capture.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_resume_transcript_capture(uuid, uuid, text) is
  'B4B: resume paused transcript capture (paused → listening); no cross-mode merge.';

-- ---------------------------------------------------------------------------
-- 7. RPC: platform_stop_transcript_capture
-- ---------------------------------------------------------------------------

create or replace function public.platform_stop_transcript_capture(
  p_session_id uuid,
  p_capture_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'stop_transcript_capture';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_capture public.platform_transcript_captures%rowtype;
  v_now timestamptz := now();
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_capture_id::text, '')
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

  -- Allow stop while session is writable; also allow stop when terminal so captures can be finalized.
  if v_session.lifecycle_status = 'draft' then
    raise exception 'transcript stop not allowed in draft'
      using errcode = '23514';
  end if;

  select * into v_capture
  from public.platform_transcript_captures
  where id = p_capture_id
    and session_id = p_session_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'transcript capture not found'
      using errcode = 'P0002';
  end if;

  if v_capture.status = 'stopped' then
    raise exception 'transcript capture already stopped'
      using errcode = '23514';
  end if;

  if v_capture.status not in ('listening', 'paused', 'idle') then
    raise exception 'transcript capture cannot be stopped from current status'
      using errcode = '23514';
  end if;

  update public.platform_transcript_captures
  set
    status = 'stopped',
    stopped_at = v_now
  where id = p_capture_id
    and therapist_id = v_uid
  returning * into v_capture;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b4b_capture_json(v_capture);

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_capture.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_stop_transcript_capture(uuid, uuid, text) is
  'B4B: stop transcript capture; sets stopped_at; no audio.';

-- ---------------------------------------------------------------------------
-- 8. RPC: platform_append_transcript_segment
-- ---------------------------------------------------------------------------

create or replace function public.platform_append_transcript_segment(
  p_session_id uuid,
  p_capture_id uuid,
  p_text text,
  p_started_at timestamptz,
  p_inclusion text,
  p_provenance jsonb,
  p_idempotency_key text,
  p_ended_at timestamptz default null,
  p_execution_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'append_transcript_segment';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_capture public.platform_transcript_captures%rowtype;
  v_segment public.platform_transcript_segments%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_capture_id::text, '') || '|' ||
    coalesce(p_text, '') || '|' ||
    coalesce(p_started_at::text, '') || '|' ||
    coalesce(p_ended_at::text, '') || '|' ||
    coalesce(p_inclusion, '') || '|' ||
    coalesce(p_provenance::text, '') || '|' ||
    coalesce(p_execution_id::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, null
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if p_text is null or char_length(trim(p_text)) = 0 then
    raise exception 'confirmed segment text is required'
      using errcode = '23514';
  end if;

  if p_started_at is null then
    raise exception 'segment started_at is required'
      using errcode = '23514';
  end if;

  if p_ended_at is not null and p_ended_at < p_started_at then
    raise exception 'segment ended_at must be >= started_at'
      using errcode = '23514';
  end if;

  if p_inclusion is null
     or p_inclusion not in ('retained', 'excluded', 'pending_review') then
    raise exception 'inclusion must be retained, excluded, or pending_review'
      using errcode = '23514';
  end if;

  if p_provenance is null or jsonb_typeof(p_provenance) <> 'object' then
    raise exception 'provenance must be a jsonb object'
      using errcode = '23514';
  end if;

  -- Reject obvious audio URI keys in opaque provenance (OD-F2-4).
  if p_provenance ? 'audio_url'
     or p_provenance ? 'audioUrl'
     or p_provenance ? 'audio_path'
     or p_provenance ? 'raw_audio'
     or p_provenance ? 'media_url' then
    raise exception 'provenance must not contain audio storage references'
      using errcode = '23514';
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

  if not public.platform_b4b_session_allows_transcript(v_session.lifecycle_status) then
    raise exception 'transcript segment append requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  select * into v_capture
  from public.platform_transcript_captures
  where id = p_capture_id
    and session_id = p_session_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'transcript capture not found'
      using errcode = 'P0002';
  end if;

  -- Append allowed for listening|paused|stopped on the same capture.
  -- stopped: post-capture confirmation/editing of confirmed text only (provisional never persisted),
  -- while session lifecycle remains in_progress|paused|closing (enforced above).
  -- Never invent a full_session merge from point_in_time.
  if v_capture.status = 'idle' then
    raise exception 'cannot append segments to idle capture'
      using errcode = '23514';
  end if;

  if v_capture.status not in ('listening', 'paused', 'stopped') then
    raise exception 'confirmed segments may only be appended to listening|paused|stopped captures'
      using errcode = '23514';
  end if;

  if p_execution_id is not null then
    if not exists (
      select 1
      from public.platform_methodology_executions e
      where e.id = p_execution_id
        and e.session_id = p_session_id
        and e.therapist_id = v_uid
    ) then
      raise exception 'execution not found for session'
        using errcode = 'P0002';
    end if;
  end if;

  insert into public.platform_transcript_segments (
    therapist_id,
    session_id,
    capture_id,
    execution_id,
    text,
    started_at,
    ended_at,
    inclusion,
    provenance
  ) values (
    v_uid,
    p_session_id,
    p_capture_id,
    p_execution_id,
    trim(p_text),
    p_started_at,
    p_ended_at,
    p_inclusion,
    p_provenance
  )
  returning * into v_segment;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'segment_id', v_segment.id,
    'capture_id', v_segment.capture_id,
    'session_id', v_segment.session_id,
    'execution_id', v_segment.execution_id,
    'inclusion', v_segment.inclusion,
    'started_at', v_segment.started_at,
    'ended_at', v_segment.ended_at,
    'row_revision', v_segment.row_revision,
    'capture_mode', v_capture.capture_mode,
    'created_at', v_segment.created_at,
    'updated_at', v_segment.updated_at
  );

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_segment.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_append_transcript_segment(uuid, uuid, text, timestamptz, text, jsonb, text, timestamptz, uuid) is
  'B4B: append confirmed segment text to listening|paused|stopped captures (stopped = post-capture confirmation only); session must be in_progress|paused|closing; rejects empty text and audio provenance keys.';

-- ---------------------------------------------------------------------------
-- 9. RPC: platform_update_transcript_segment_inclusion
-- ---------------------------------------------------------------------------

create or replace function public.platform_update_transcript_segment_inclusion(
  p_session_id uuid,
  p_segment_id uuid,
  p_inclusion text,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'update_transcript_segment_inclusion';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_segment public.platform_transcript_segments%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_segment_id::text, '') || '|' ||
    coalesce(p_inclusion, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, null
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if p_inclusion is null
     or p_inclusion not in ('retained', 'excluded', 'pending_review') then
    raise exception 'inclusion must be retained, excluded, or pending_review'
      using errcode = '23514';
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

  if not public.platform_b4b_session_allows_transcript(v_session.lifecycle_status) then
    raise exception 'segment inclusion update requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  select * into v_segment
  from public.platform_transcript_segments
  where id = p_segment_id
    and session_id = p_session_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'transcript segment not found'
      using errcode = 'P0002';
  end if;

  update public.platform_transcript_segments
  set inclusion = p_inclusion
  where id = p_segment_id
    and therapist_id = v_uid
  returning * into v_segment;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'segment_id', v_segment.id,
    'capture_id', v_segment.capture_id,
    'session_id', v_segment.session_id,
    'inclusion', v_segment.inclusion,
    'row_revision', v_segment.row_revision,
    'updated_at', v_segment.updated_at
  );

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_segment.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_update_transcript_segment_inclusion(uuid, uuid, text, text) is
  'B4B: editorial inclusion update only (retained|excluded|pending_review); no hard delete.';

-- ---------------------------------------------------------------------------
-- 10. RPC grants hardening (authenticated EXECUTE only; no anon)
-- ---------------------------------------------------------------------------

revoke all on function public.platform_start_transcript_capture(uuid, text, boolean, text, uuid, text)
  from public, anon, authenticated;
grant execute on function public.platform_start_transcript_capture(uuid, text, boolean, text, uuid, text)
  to authenticated;

revoke all on function public.platform_pause_transcript_capture(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.platform_pause_transcript_capture(uuid, uuid, text)
  to authenticated;

revoke all on function public.platform_resume_transcript_capture(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.platform_resume_transcript_capture(uuid, uuid, text)
  to authenticated;

revoke all on function public.platform_stop_transcript_capture(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.platform_stop_transcript_capture(uuid, uuid, text)
  to authenticated;

revoke all on function public.platform_append_transcript_segment(uuid, uuid, text, timestamptz, text, jsonb, text, timestamptz, uuid)
  from public, anon, authenticated;
grant execute on function public.platform_append_transcript_segment(uuid, uuid, text, timestamptz, text, jsonb, text, timestamptz, uuid)
  to authenticated;

revoke all on function public.platform_update_transcript_segment_inclusion(uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.platform_update_transcript_segment_inclusion(uuid, uuid, text, text)
  to authenticated;
