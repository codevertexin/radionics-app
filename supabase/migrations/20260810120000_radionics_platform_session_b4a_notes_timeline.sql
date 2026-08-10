-- =============================================================================
-- RADIONICS — Platform Session F2 Batch B4A (local preparation)
-- Authorization: RADIONICS-F2-B4A-LOCAL-AUTH-20260810-01
-- Design baseline: Platform_Session_F2_B4A_Pre_Implementation_Readiness.md
--
-- Creates:
--   platform_session_notes
--   platform_timeline_events
--   RPCs: platform_create_session_note
--         platform_update_session_note
--         platform_append_timeline_event
--
-- Write posture: RPC-only. Authenticated: SELECT only on B4A tables.
-- RPC EXECUTE: authenticated only (revoke from public, anon, authenticated).
-- No transcript/audio/contributions/archive/report. No platform_methodologies.
-- Optional same-session execution_id → platform_methodology_executions.
-- Depends on: B1–B3; reuses platform_b2_* idempotency helpers.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. platform_session_notes
-- ---------------------------------------------------------------------------

create table public.platform_session_notes (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  session_id uuid not null,
  execution_id uuid null,
  kind text not null,
  body text not null,
  disposition text not null,
  provenance jsonb not null,
  context jsonb null,
  schema_version text not null default 'platform.session.note.v1',
  row_revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint platform_session_notes_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_session_notes_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  -- Same-session optional execution reference (B3 UNIQUE (session_id, therapist_id, id)).
  constraint platform_session_notes_execution_fk
    foreign key (session_id, therapist_id, execution_id)
    references public.platform_methodology_executions (session_id, therapist_id, id)
    on delete restrict,

  constraint platform_session_notes_kind_check
    check (kind in ('written', 'dictated', 'transcript_excerpt')),

  constraint platform_session_notes_disposition_check
    check (disposition in ('private', 'review_for_report', 'included_in_report')),

  constraint platform_session_notes_body_not_empty
    check (char_length(trim(body)) > 0),

  constraint platform_session_notes_provenance_is_object
    check (jsonb_typeof(provenance) = 'object'),

  constraint platform_session_notes_context_is_object_or_null
    check (context is null or jsonb_typeof(context) = 'object'),

  constraint platform_session_notes_schema_version_not_empty
    check (char_length(trim(schema_version)) > 0),

  constraint platform_session_notes_row_revision_positive
    check (row_revision >= 1)
);

comment on table public.platform_session_notes is
  'F2 B4A: platform session notes. Opaque body/context; disposition for future report projection. RPC writes only.';

create index idx_platform_session_notes_session_therapist
  on public.platform_session_notes (session_id, therapist_id);

create index idx_platform_session_notes_therapist_id
  on public.platform_session_notes (therapist_id);

create index idx_platform_session_notes_execution_id
  on public.platform_session_notes (execution_id)
  where execution_id is not null;

create index idx_platform_session_notes_disposition
  on public.platform_session_notes (session_id, disposition);

create trigger trg_platform_session_notes_guard_mutable
  before insert or update on public.platform_session_notes
  for each row execute function public.platform_guard_mutable_owned_row();

alter table public.platform_session_notes enable row level security;

create policy "platform_session_notes_select_own"
  on public.platform_session_notes
  for select
  to authenticated
  using (therapist_id = auth.uid());

revoke all privileges
  on table public.platform_session_notes
  from public, anon, authenticated;

grant select
  on table public.platform_session_notes
  to authenticated;

-- ---------------------------------------------------------------------------
-- 2. platform_timeline_events (append-only)
-- ---------------------------------------------------------------------------

create table public.platform_timeline_events (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  session_id uuid not null,
  execution_id uuid null,
  source text not null,
  event_type text not null,
  occurred_at timestamptz not null,
  payload_schema_version text not null,
  payload jsonb not null default '{}'::jsonb,
  schema_version text not null default 'platform.session.timeline.v1',
  created_at timestamptz not null default now(),

  constraint platform_timeline_events_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_timeline_events_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  constraint platform_timeline_events_execution_fk
    foreign key (session_id, therapist_id, execution_id)
    references public.platform_methodology_executions (session_id, therapist_id, id)
    on delete restrict,

  constraint platform_timeline_events_source_check
    check (source in ('platform', 'methodology', 'therapist')),

  constraint platform_timeline_events_event_type_not_empty
    check (char_length(trim(event_type)) > 0),

  constraint platform_timeline_events_payload_schema_version_not_empty
    check (char_length(trim(payload_schema_version)) > 0),

  constraint platform_timeline_events_payload_is_object
    check (jsonb_typeof(payload) = 'object'),

  constraint platform_timeline_events_schema_version_not_empty
    check (char_length(trim(schema_version)) > 0)
);

comment on table public.platform_timeline_events is
  'F2 B4A: append-only meaningful timeline events. Opaque payload. RPC append only; no therapist UPDATE/DELETE.';

create index idx_platform_timeline_events_session_occurred
  on public.platform_timeline_events (session_id, occurred_at);

create index idx_platform_timeline_events_session_therapist
  on public.platform_timeline_events (session_id, therapist_id);

create index idx_platform_timeline_events_therapist_id
  on public.platform_timeline_events (therapist_id);

create index idx_platform_timeline_events_execution_id
  on public.platform_timeline_events (execution_id)
  where execution_id is not null;

alter table public.platform_timeline_events enable row level security;

create policy "platform_timeline_events_select_own"
  on public.platform_timeline_events
  for select
  to authenticated
  using (therapist_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies — append RPC only.

revoke all privileges
  on table public.platform_timeline_events
  from public, anon, authenticated;

grant select
  on table public.platform_timeline_events
  to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Internal helpers (B4A)
-- ---------------------------------------------------------------------------

create or replace function public.platform_b4a_session_allows_note_timeline(
  p_lifecycle_status text
)
returns boolean
language sql
immutable
as $$
  select p_lifecycle_status in ('in_progress', 'paused', 'closing');
$$;

comment on function public.platform_b4a_session_allows_note_timeline(text) is
  'B4A: note/timeline writes allowed only for in_progress|paused|closing (not draft/terminal).';

revoke all on function public.platform_b4a_session_allows_note_timeline(text) from public;

create or replace function public.platform_b4a_is_noise_event_type(p_event_type text)
returns boolean
language sql
immutable
as $$
  select lower(trim(coalesce(p_event_type, ''))) in (
    'autosave',
    'click',
    'hover',
    'panel_open',
    'panel_close',
    'panel_opened',
    'panel_closed',
    'search',
    'navigation',
    'nav',
    'focus',
    'blur',
    'scroll',
    'mousemove',
    'keydown',
    'keyup'
  );
$$;

comment on function public.platform_b4a_is_noise_event_type(text) is
  'B4A: Product 03 noise denylist for timeline event_type (expandable later).';

revoke all on function public.platform_b4a_is_noise_event_type(text) from public;

-- ---------------------------------------------------------------------------
-- 4. RPC: platform_create_session_note
-- ---------------------------------------------------------------------------

create or replace function public.platform_create_session_note(
  p_session_id uuid,
  p_kind text,
  p_body text,
  p_disposition text,
  p_provenance jsonb,
  p_idempotency_key text,
  p_execution_id uuid default null,
  p_context jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'create_session_note';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_note public.platform_session_notes%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_kind, '') || '|' ||
    coalesce(p_body, '') || '|' ||
    coalesce(p_disposition, '') || '|' ||
    coalesce(p_provenance::text, '') || '|' ||
    coalesce(p_execution_id::text, '') || '|' ||
    coalesce(p_context::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, null
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if p_kind is null or p_kind not in ('written', 'dictated', 'transcript_excerpt') then
    raise exception 'kind must be written, dictated, or transcript_excerpt'
      using errcode = '23514';
  end if;

  if p_disposition is null
     or p_disposition not in ('private', 'review_for_report', 'included_in_report') then
    raise exception 'disposition must be private, review_for_report, or included_in_report'
      using errcode = '23514';
  end if;

  if p_body is null or char_length(trim(p_body)) = 0 then
    raise exception 'note body is required'
      using errcode = '23514';
  end if;

  if p_provenance is null or jsonb_typeof(p_provenance) <> 'object' then
    raise exception 'provenance must be a jsonb object'
      using errcode = '23514';
  end if;

  if p_context is not null and jsonb_typeof(p_context) <> 'object' then
    raise exception 'context must be a jsonb object when provided'
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

  if not public.platform_b4a_session_allows_note_timeline(v_session.lifecycle_status) then
    raise exception 'note create requires session lifecycle in_progress|paused|closing'
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

  insert into public.platform_session_notes (
    therapist_id,
    session_id,
    execution_id,
    kind,
    body,
    disposition,
    provenance,
    context
  ) values (
    v_uid,
    p_session_id,
    p_execution_id,
    p_kind,
    trim(p_body),
    p_disposition,
    p_provenance,
    p_context
  )
  returning * into v_note;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'note_id', v_note.id,
    'session_id', v_note.session_id,
    'execution_id', v_note.execution_id,
    'kind', v_note.kind,
    'disposition', v_note.disposition,
    'row_revision', v_note.row_revision,
    'created_at', v_note.created_at,
    'updated_at', v_note.updated_at
  );

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_note.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_create_session_note(uuid, text, text, text, jsonb, text, uuid, jsonb) is
  'B4A: create session note; optional same-session execution_id; opaque body/context.';

-- ---------------------------------------------------------------------------
-- 5. RPC: platform_update_session_note
-- ---------------------------------------------------------------------------

create or replace function public.platform_update_session_note(
  p_session_id uuid,
  p_note_id uuid,
  p_idempotency_key text,
  p_body text default null,
  p_disposition text default null,
  p_context jsonb default null,
  p_clear_context boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'update_session_note';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_note public.platform_session_notes%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_note_id::text, '') || '|' ||
    coalesce(p_body, '') || '|' ||
    coalesce(p_disposition, '') || '|' ||
    coalesce(p_context::text, '') || '|' ||
    coalesce(p_clear_context::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, null
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if p_disposition is not null
     and p_disposition not in ('private', 'review_for_report', 'included_in_report') then
    raise exception 'disposition must be private, review_for_report, or included_in_report'
      using errcode = '23514';
  end if;

  if p_body is not null and char_length(trim(p_body)) = 0 then
    raise exception 'note body cannot be empty when provided'
      using errcode = '23514';
  end if;

  if p_context is not null and jsonb_typeof(p_context) <> 'object' then
    raise exception 'context must be a jsonb object when provided'
      using errcode = '23514';
  end if;

  if p_body is null and p_disposition is null and p_context is null and not p_clear_context then
    raise exception 'update_session_note requires at least one field change'
      using errcode = '22023';
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

  if not public.platform_b4a_session_allows_note_timeline(v_session.lifecycle_status) then
    raise exception 'note update requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  update public.platform_session_notes n
  set
    body = case when p_body is not null then trim(p_body) else n.body end,
    disposition = case when p_disposition is not null then p_disposition else n.disposition end,
    context = case
      when p_clear_context then null
      when p_context is not null then p_context
      else n.context
    end
  where n.id = p_note_id
    and n.therapist_id = v_uid
    and n.session_id = p_session_id
  returning * into v_note;

  if not found then
    raise exception 'note not found'
      using errcode = 'P0002';
  end if;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'note_id', v_note.id,
    'session_id', v_note.session_id,
    'execution_id', v_note.execution_id,
    'kind', v_note.kind,
    'disposition', v_note.disposition,
    'row_revision', v_note.row_revision,
    'updated_at', v_note.updated_at
  );

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_note.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_update_session_note(uuid, uuid, text, text, text, jsonb, boolean) is
  'B4A: update note body/disposition/context; no hard delete; RPC only.';

-- ---------------------------------------------------------------------------
-- 6. RPC: platform_append_timeline_event
-- ---------------------------------------------------------------------------

create or replace function public.platform_append_timeline_event(
  p_session_id uuid,
  p_source text,
  p_event_type text,
  p_occurred_at timestamptz,
  p_payload_schema_version text,
  p_idempotency_key text,
  p_payload jsonb default '{}'::jsonb,
  p_execution_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'append_timeline_event';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_event public.platform_timeline_events%rowtype;
  v_now timestamptz := now();
  v_payload jsonb;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_source, '') || '|' ||
    coalesce(p_event_type, '') || '|' ||
    coalesce(p_occurred_at::text, '') || '|' ||
    coalesce(p_payload_schema_version, '') || '|' ||
    coalesce(p_payload::text, '') || '|' ||
    coalesce(p_execution_id::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, null
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if p_source is null or p_source not in ('platform', 'methodology', 'therapist') then
    raise exception 'source must be platform, methodology, or therapist'
      using errcode = '23514';
  end if;

  if p_event_type is null or char_length(trim(p_event_type)) = 0 then
    raise exception 'event_type is required'
      using errcode = '23514';
  end if;

  if public.platform_b4a_is_noise_event_type(p_event_type) then
    raise exception 'event_type is excluded noise (not a meaningful timeline event)'
      using errcode = '23514';
  end if;

  if p_payload_schema_version is null
     or char_length(trim(p_payload_schema_version)) = 0 then
    raise exception 'payload_schema_version is required'
      using errcode = '23514';
  end if;

  v_payload := coalesce(p_payload, '{}'::jsonb);
  if jsonb_typeof(v_payload) <> 'object' then
    raise exception 'payload must be a jsonb object'
      using errcode = '23514';
  end if;

  if p_occurred_at is null then
    raise exception 'occurred_at is required'
      using errcode = '22023';
  end if;

  -- Bound far-future clocks (allow modest skew).
  if p_occurred_at > v_now + interval '1 hour' then
    raise exception 'occurred_at cannot be more than 1 hour in the future'
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

  if not public.platform_b4a_session_allows_note_timeline(v_session.lifecycle_status) then
    raise exception 'timeline append requires session lifecycle in_progress|paused|closing'
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

  insert into public.platform_timeline_events (
    therapist_id,
    session_id,
    execution_id,
    source,
    event_type,
    occurred_at,
    payload_schema_version,
    payload,
    created_at
  ) values (
    v_uid,
    p_session_id,
    p_execution_id,
    p_source,
    trim(p_event_type),
    p_occurred_at,
    trim(p_payload_schema_version),
    v_payload,
    v_now
  )
  returning * into v_event;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'event_id', v_event.id,
    'session_id', v_event.session_id,
    'execution_id', v_event.execution_id,
    'source', v_event.source,
    'event_type', v_event.event_type,
    'occurred_at', v_event.occurred_at,
    'payload_schema_version', v_event.payload_schema_version,
    'created_at', v_event.created_at
  );

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, null
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_append_timeline_event(uuid, text, text, timestamptz, text, text, jsonb, uuid) is
  'B4A: append-only meaningful timeline event; opaque payload; noise event_type rejected.';

-- ---------------------------------------------------------------------------
-- 7. RPC grants hardening (authenticated EXECUTE only; no anon)
-- ---------------------------------------------------------------------------

revoke all on function public.platform_create_session_note(uuid, text, text, text, jsonb, text, uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.platform_create_session_note(uuid, text, text, text, jsonb, text, uuid, jsonb)
  to authenticated;

revoke all on function public.platform_update_session_note(uuid, uuid, text, text, text, jsonb, boolean)
  from public, anon, authenticated;
grant execute on function public.platform_update_session_note(uuid, uuid, text, text, text, jsonb, boolean)
  to authenticated;

revoke all on function public.platform_append_timeline_event(uuid, text, text, timestamptz, text, text, jsonb, uuid)
  from public, anon, authenticated;
grant execute on function public.platform_append_timeline_event(uuid, text, text, timestamptz, text, text, jsonb, uuid)
  to authenticated;
