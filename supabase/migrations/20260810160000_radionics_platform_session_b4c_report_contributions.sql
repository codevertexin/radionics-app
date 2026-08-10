-- =============================================================================
-- RADIONICS — Platform Session F2 Batch B4C (local preparation)
-- Authorization: RADIONICS-F2-B4C-LOCAL-AUTH-20260810-01
-- Design baseline: Platform_Session_F2_B4C_Pre_Implementation_Readiness.md
-- OD-B4C-1…17 APPROVED defaults (narrow RPCs; structured_value create-once)
--
-- Creates:
--   platform_report_contributions
--   Additive UNIQUE (id, therapist_id, session_id) on notes/timeline/segments
--     (same-session FK targets; does not alter B4A/B4B migration files)
--   RPCs: platform_create_report_contribution (create-only)
--         platform_set_report_contribution_inclusion
--         platform_update_report_contribution_display
--         platform_attach_report_contribution_provenance_refs
--
-- Write posture: RPC-only. Authenticated: SELECT only on B4C table.
-- No upsert / general structured_value patch.
-- No archive/seal/templates/PDF. No platform_methodologies.
-- Depends on: B1–B4B; reuses platform_b2_* idempotency helpers.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Additive same-session unique targets on B4A/B4B parents (for FKs)
-- ---------------------------------------------------------------------------

alter table public.platform_session_notes
  add constraint platform_session_notes_id_therapist_session_unique
  unique (id, therapist_id, session_id);

alter table public.platform_timeline_events
  add constraint platform_timeline_events_id_therapist_session_unique
  unique (id, therapist_id, session_id);

alter table public.platform_transcript_segments
  add constraint platform_transcript_segments_id_therapist_session_unique
  unique (id, therapist_id, session_id);

-- ---------------------------------------------------------------------------
-- 1. platform_report_contributions
-- ---------------------------------------------------------------------------

create table public.platform_report_contributions (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  session_id uuid not null,
  execution_id uuid null,
  specialty_id uuid null references public.radionics_specialties (id),
  methodology_slug text null,
  methodology_name text null,
  contribution_kind text not null,
  source text not null,
  structured_value jsonb not null,
  human_readable_value text null,
  inclusion text not null,
  provenance jsonb not null,
  note_id uuid null,
  timeline_event_id uuid null,
  transcript_capture_id uuid null,
  transcript_segment_id uuid null,
  schema_version text not null default 'platform.session.reportContribution.v1',
  row_revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint platform_report_contributions_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_report_contributions_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  constraint platform_report_contributions_execution_fk
    foreign key (session_id, therapist_id, execution_id)
    references public.platform_methodology_executions (session_id, therapist_id, id)
    on delete restrict,

  constraint platform_report_contributions_note_fk
    foreign key (note_id, therapist_id, session_id)
    references public.platform_session_notes (id, therapist_id, session_id)
    on delete restrict,

  constraint platform_report_contributions_timeline_event_fk
    foreign key (timeline_event_id, therapist_id, session_id)
    references public.platform_timeline_events (id, therapist_id, session_id)
    on delete restrict,

  constraint platform_report_contributions_transcript_capture_fk
    foreign key (transcript_capture_id, therapist_id, session_id)
    references public.platform_transcript_captures (id, therapist_id, session_id)
    on delete restrict,

  constraint platform_report_contributions_transcript_segment_fk
    foreign key (transcript_segment_id, therapist_id, session_id)
    references public.platform_transcript_segments (id, therapist_id, session_id)
    on delete restrict,

  constraint platform_report_contributions_kind_check
    check (contribution_kind in (
      'session_fact',
      'methodology_emission',
      'note_excerpt',
      'timeline_event',
      'transcript_excerpt',
      'therapist_authored',
      'system_context'
    )),

  constraint platform_report_contributions_inclusion_check
    check (inclusion in ('candidate', 'pending_review', 'included', 'excluded')),

  constraint platform_report_contributions_source_not_empty
    check (char_length(trim(source)) > 0),

  constraint platform_report_contributions_structured_value_is_object
    check (jsonb_typeof(structured_value) = 'object'),

  constraint platform_report_contributions_provenance_is_object
    check (jsonb_typeof(provenance) = 'object'),

  constraint platform_report_contributions_schema_version_not_empty
    check (char_length(trim(schema_version)) > 0),

  constraint platform_report_contributions_row_revision_positive
    check (row_revision >= 1),

  constraint platform_report_contributions_methodology_slug_trim
    check (methodology_slug is null or char_length(trim(methodology_slug)) > 0),

  constraint platform_report_contributions_methodology_name_trim
    check (methodology_name is null or char_length(trim(methodology_name)) > 0),

  constraint platform_report_contributions_human_readable_trim
    check (human_readable_value is null or char_length(trim(human_readable_value)) > 0),

  -- system_context must never be silently client-selected
  constraint platform_report_contributions_system_context_not_included
    check (
      contribution_kind <> 'system_context'
      or inclusion <> 'included'
    )
);

comment on table public.platform_report_contributions is
  'F2 B4C: platform-neutral reportable contribution pool. structured_value create-once. RPC writes only. Not approved report sections.';

create index idx_platform_report_contributions_session_created
  on public.platform_report_contributions (session_id, created_at);

create index idx_platform_report_contributions_session_inclusion
  on public.platform_report_contributions (session_id, inclusion);

create index idx_platform_report_contributions_session_kind
  on public.platform_report_contributions (session_id, contribution_kind);

create index idx_platform_report_contributions_therapist_id
  on public.platform_report_contributions (therapist_id);

create index idx_platform_report_contributions_execution_id
  on public.platform_report_contributions (execution_id)
  where execution_id is not null;

create trigger trg_platform_report_contributions_guard_mutable
  before insert or update on public.platform_report_contributions
  for each row execute function public.platform_guard_mutable_owned_row();

alter table public.platform_report_contributions enable row level security;

create policy "platform_report_contributions_select_own"
  on public.platform_report_contributions
  for select
  to authenticated
  using (therapist_id = auth.uid());

revoke all privileges
  on table public.platform_report_contributions
  from public, anon, authenticated;

grant select
  on table public.platform_report_contributions
  to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Internal helpers (B4C)
-- ---------------------------------------------------------------------------

create or replace function public.platform_b4c_session_allows_contribution(
  p_lifecycle_status text
)
returns boolean
language sql
immutable
as $$
  select p_lifecycle_status in ('in_progress', 'paused', 'closing');
$$;

comment on function public.platform_b4c_session_allows_contribution(text) is
  'B4C: contribution writes allowed only for in_progress|paused|closing (not draft/terminal).';

revoke all on function public.platform_b4c_session_allows_contribution(text) from public;

create or replace function public.platform_b4c_contribution_json(
  p_row public.platform_report_contributions
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'contribution_id', p_row.id,
    'session_id', p_row.session_id,
    'execution_id', p_row.execution_id,
    'specialty_id', p_row.specialty_id,
    'methodology_slug', p_row.methodology_slug,
    'methodology_name', p_row.methodology_name,
    'contribution_kind', p_row.contribution_kind,
    'source', p_row.source,
    'inclusion', p_row.inclusion,
    'human_readable_value', p_row.human_readable_value,
    'note_id', p_row.note_id,
    'timeline_event_id', p_row.timeline_event_id,
    'transcript_capture_id', p_row.transcript_capture_id,
    'transcript_segment_id', p_row.transcript_segment_id,
    'row_revision', p_row.row_revision,
    'created_at', p_row.created_at,
    'updated_at', p_row.updated_at
  );
$$;

revoke all on function public.platform_b4c_contribution_json(public.platform_report_contributions) from public;

-- ---------------------------------------------------------------------------
-- 3. RPC: platform_create_report_contribution (create-only; structured_value once)
-- ---------------------------------------------------------------------------

create or replace function public.platform_create_report_contribution(
  p_session_id uuid,
  p_contribution_kind text,
  p_source text,
  p_structured_value jsonb,
  p_provenance jsonb,
  p_idempotency_key text,
  p_inclusion text default 'candidate',
  p_human_readable_value text default null,
  p_execution_id uuid default null,
  p_specialty_id uuid default null,
  p_methodology_slug text default null,
  p_methodology_name text default null,
  p_note_id uuid default null,
  p_timeline_event_id uuid default null,
  p_transcript_capture_id uuid default null,
  p_transcript_segment_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'create_report_contribution';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_row public.platform_report_contributions%rowtype;
  v_note public.platform_session_notes%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_contribution_kind, '') || '|' ||
    coalesce(p_source, '') || '|' ||
    coalesce(p_structured_value::text, '') || '|' ||
    coalesce(p_provenance::text, '') || '|' ||
    coalesce(p_inclusion, '') || '|' ||
    coalesce(p_human_readable_value, '') || '|' ||
    coalesce(p_execution_id::text, '') || '|' ||
    coalesce(p_specialty_id::text, '') || '|' ||
    coalesce(p_methodology_slug, '') || '|' ||
    coalesce(p_methodology_name, '') || '|' ||
    coalesce(p_note_id::text, '') || '|' ||
    coalesce(p_timeline_event_id::text, '') || '|' ||
    coalesce(p_transcript_capture_id::text, '') || '|' ||
    coalesce(p_transcript_segment_id::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, null
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if p_contribution_kind is null or p_contribution_kind not in (
    'session_fact', 'methodology_emission', 'note_excerpt', 'timeline_event',
    'transcript_excerpt', 'therapist_authored', 'system_context'
  ) then
    raise exception 'contribution_kind is invalid'
      using errcode = '23514';
  end if;

  if p_inclusion is null
     or p_inclusion not in ('candidate', 'pending_review', 'included', 'excluded') then
    raise exception 'inclusion must be candidate, pending_review, included, or excluded'
      using errcode = '23514';
  end if;

  if p_contribution_kind = 'system_context' and p_inclusion = 'included' then
    raise exception 'system_context contributions cannot be included'
      using errcode = '23514';
  end if;

  if p_source is null or char_length(trim(p_source)) = 0 then
    raise exception 'source is required'
      using errcode = '23514';
  end if;

  if p_structured_value is null or jsonb_typeof(p_structured_value) <> 'object' then
    raise exception 'structured_value must be a jsonb object'
      using errcode = '23514';
  end if;

  if p_provenance is null or jsonb_typeof(p_provenance) <> 'object' then
    raise exception 'provenance must be a jsonb object'
      using errcode = '23514';
  end if;

  if p_human_readable_value is not null
     and char_length(trim(p_human_readable_value)) = 0 then
    raise exception 'human_readable_value must be non-empty when provided'
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

  if not public.platform_b4c_session_allows_contribution(v_session.lifecycle_status) then
    raise exception 'contribution create requires session lifecycle in_progress|paused|closing'
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

  if p_note_id is not null then
    select * into v_note
    from public.platform_session_notes n
    where n.id = p_note_id
      and n.session_id = p_session_id
      and n.therapist_id = v_uid;

    if not found then
      raise exception 'note not found for session'
        using errcode = 'P0002';
    end if;

    if v_note.disposition = 'private' then
      raise exception 'private notes cannot seed report contributions'
        using errcode = '23514';
    end if;
  end if;

  if p_timeline_event_id is not null then
    if not exists (
      select 1
      from public.platform_timeline_events t
      where t.id = p_timeline_event_id
        and t.session_id = p_session_id
        and t.therapist_id = v_uid
    ) then
      raise exception 'timeline event not found for session'
        using errcode = 'P0002';
    end if;
  end if;

  if p_transcript_capture_id is not null then
    if not exists (
      select 1
      from public.platform_transcript_captures c
      where c.id = p_transcript_capture_id
        and c.session_id = p_session_id
        and c.therapist_id = v_uid
    ) then
      raise exception 'transcript capture not found for session'
        using errcode = 'P0002';
    end if;
  end if;

  if p_transcript_segment_id is not null then
    if not exists (
      select 1
      from public.platform_transcript_segments s
      where s.id = p_transcript_segment_id
        and s.session_id = p_session_id
        and s.therapist_id = v_uid
    ) then
      raise exception 'transcript segment not found for session'
        using errcode = 'P0002';
    end if;
  end if;

  insert into public.platform_report_contributions (
    therapist_id,
    session_id,
    execution_id,
    specialty_id,
    methodology_slug,
    methodology_name,
    contribution_kind,
    source,
    structured_value,
    human_readable_value,
    inclusion,
    provenance,
    note_id,
    timeline_event_id,
    transcript_capture_id,
    transcript_segment_id
  ) values (
    v_uid,
    p_session_id,
    p_execution_id,
    p_specialty_id,
    case when p_methodology_slug is null then null else trim(p_methodology_slug) end,
    case when p_methodology_name is null then null else trim(p_methodology_name) end,
    p_contribution_kind,
    trim(p_source),
    p_structured_value,
    case when p_human_readable_value is null then null else trim(p_human_readable_value) end,
    p_inclusion,
    p_provenance,
    p_note_id,
    p_timeline_event_id,
    p_transcript_capture_id,
    p_transcript_segment_id
  )
  returning * into v_row;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b4c_contribution_json(v_row);

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

comment on function public.platform_create_report_contribution(uuid, text, text, jsonb, jsonb, text, text, text, uuid, uuid, text, text, uuid, uuid, uuid, uuid) is
  'B4C: create-only report contribution; structured_value set once; no upsert/patch.';

-- ---------------------------------------------------------------------------
-- 4. RPC: platform_set_report_contribution_inclusion
-- ---------------------------------------------------------------------------

create or replace function public.platform_set_report_contribution_inclusion(
  p_session_id uuid,
  p_contribution_id uuid,
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
  v_cmd text := 'set_report_contribution_inclusion';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_row public.platform_report_contributions%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_contribution_id::text, '') || '|' ||
    coalesce(p_inclusion, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, null
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if p_inclusion is null
     or p_inclusion not in ('candidate', 'pending_review', 'included', 'excluded') then
    raise exception 'inclusion must be candidate, pending_review, included, or excluded'
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

  if not public.platform_b4c_session_allows_contribution(v_session.lifecycle_status) then
    raise exception 'contribution inclusion update requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  select * into v_row
  from public.platform_report_contributions
  where id = p_contribution_id
    and session_id = p_session_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'report contribution not found'
      using errcode = 'P0002';
  end if;

  if v_row.contribution_kind = 'system_context' and p_inclusion = 'included' then
    raise exception 'system_context contributions cannot be included'
      using errcode = '23514';
  end if;

  update public.platform_report_contributions
  set inclusion = p_inclusion
  where id = p_contribution_id
    and therapist_id = v_uid
  returning * into v_row;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b4c_contribution_json(v_row);

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

comment on function public.platform_set_report_contribution_inclusion(uuid, uuid, text, text) is
  'B4C: update inclusion only; does not rewrite structured_value.';

-- ---------------------------------------------------------------------------
-- 5. RPC: platform_update_report_contribution_display (human_readable_value only)
-- ---------------------------------------------------------------------------

create or replace function public.platform_update_report_contribution_display(
  p_session_id uuid,
  p_contribution_id uuid,
  p_idempotency_key text,
  p_human_readable_value text default null,
  p_clear_human_readable_value boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'update_report_contribution_display';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_row public.platform_report_contributions%rowtype;
  v_body jsonb;
  v_display text;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_contribution_id::text, '') || '|' ||
    coalesce(p_human_readable_value, '') || '|' ||
    coalesce(p_clear_human_readable_value::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, null
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if not coalesce(p_clear_human_readable_value, false)
     and p_human_readable_value is null then
    raise exception 'human_readable_value or clear flag is required'
      using errcode = '23514';
  end if;

  if not coalesce(p_clear_human_readable_value, false)
     and char_length(trim(p_human_readable_value)) = 0 then
    raise exception 'human_readable_value must be non-empty when provided'
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

  if not public.platform_b4c_session_allows_contribution(v_session.lifecycle_status) then
    raise exception 'contribution display update requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  select * into v_row
  from public.platform_report_contributions
  where id = p_contribution_id
    and session_id = p_session_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'report contribution not found'
      using errcode = 'P0002';
  end if;

  if coalesce(p_clear_human_readable_value, false) then
    v_display := null;
  else
    v_display := trim(p_human_readable_value);
  end if;

  update public.platform_report_contributions
  set human_readable_value = v_display
  where id = p_contribution_id
    and therapist_id = v_uid
  returning * into v_row;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b4c_contribution_json(v_row);

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

comment on function public.platform_update_report_contribution_display(uuid, uuid, text, text, boolean) is
  'B4C: update human_readable_value only; never patches structured_value.';

-- ---------------------------------------------------------------------------
-- 6. RPC: platform_attach_report_contribution_provenance_refs
-- ---------------------------------------------------------------------------

create or replace function public.platform_attach_report_contribution_provenance_refs(
  p_session_id uuid,
  p_contribution_id uuid,
  p_idempotency_key text,
  p_execution_id uuid default null,
  p_clear_execution_id boolean default false,
  p_note_id uuid default null,
  p_clear_note_id boolean default false,
  p_timeline_event_id uuid default null,
  p_clear_timeline_event_id boolean default false,
  p_transcript_capture_id uuid default null,
  p_clear_transcript_capture_id boolean default false,
  p_transcript_segment_id uuid default null,
  p_clear_transcript_segment_id boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'attach_report_contribution_provenance_refs';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_row public.platform_report_contributions%rowtype;
  v_note public.platform_session_notes%rowtype;
  v_body jsonb;
  v_execution_id uuid;
  v_note_id uuid;
  v_timeline_event_id uuid;
  v_transcript_capture_id uuid;
  v_transcript_segment_id uuid;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_contribution_id::text, '') || '|' ||
    coalesce(p_execution_id::text, '') || '|' ||
    coalesce(p_clear_execution_id::text, '') || '|' ||
    coalesce(p_note_id::text, '') || '|' ||
    coalesce(p_clear_note_id::text, '') || '|' ||
    coalesce(p_timeline_event_id::text, '') || '|' ||
    coalesce(p_clear_timeline_event_id::text, '') || '|' ||
    coalesce(p_transcript_capture_id::text, '') || '|' ||
    coalesce(p_clear_transcript_capture_id::text, '') || '|' ||
    coalesce(p_transcript_segment_id::text, '') || '|' ||
    coalesce(p_clear_transcript_segment_id::text, '')
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

  if not public.platform_b4c_session_allows_contribution(v_session.lifecycle_status) then
    raise exception 'contribution provenance-ref update requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  select * into v_row
  from public.platform_report_contributions
  where id = p_contribution_id
    and session_id = p_session_id
    and therapist_id = v_uid
  for update;

  if not found then
    raise exception 'report contribution not found'
      using errcode = 'P0002';
  end if;

  v_execution_id := v_row.execution_id;
  v_note_id := v_row.note_id;
  v_timeline_event_id := v_row.timeline_event_id;
  v_transcript_capture_id := v_row.transcript_capture_id;
  v_transcript_segment_id := v_row.transcript_segment_id;

  if coalesce(p_clear_execution_id, false) then
    v_execution_id := null;
  elsif p_execution_id is not null then
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
    v_execution_id := p_execution_id;
  end if;

  if coalesce(p_clear_note_id, false) then
    v_note_id := null;
  elsif p_note_id is not null then
    select * into v_note
    from public.platform_session_notes n
    where n.id = p_note_id
      and n.session_id = p_session_id
      and n.therapist_id = v_uid;

    if not found then
      raise exception 'note not found for session'
        using errcode = 'P0002';
    end if;

    if v_note.disposition = 'private' then
      raise exception 'private notes cannot be attached as report contribution provenance'
        using errcode = '23514';
    end if;

    v_note_id := p_note_id;
  end if;

  if coalesce(p_clear_timeline_event_id, false) then
    v_timeline_event_id := null;
  elsif p_timeline_event_id is not null then
    if not exists (
      select 1
      from public.platform_timeline_events t
      where t.id = p_timeline_event_id
        and t.session_id = p_session_id
        and t.therapist_id = v_uid
    ) then
      raise exception 'timeline event not found for session'
        using errcode = 'P0002';
    end if;
    v_timeline_event_id := p_timeline_event_id;
  end if;

  if coalesce(p_clear_transcript_capture_id, false) then
    v_transcript_capture_id := null;
  elsif p_transcript_capture_id is not null then
    if not exists (
      select 1
      from public.platform_transcript_captures c
      where c.id = p_transcript_capture_id
        and c.session_id = p_session_id
        and c.therapist_id = v_uid
    ) then
      raise exception 'transcript capture not found for session'
        using errcode = 'P0002';
    end if;
    v_transcript_capture_id := p_transcript_capture_id;
  end if;

  if coalesce(p_clear_transcript_segment_id, false) then
    v_transcript_segment_id := null;
  elsif p_transcript_segment_id is not null then
    if not exists (
      select 1
      from public.platform_transcript_segments s
      where s.id = p_transcript_segment_id
        and s.session_id = p_session_id
        and s.therapist_id = v_uid
    ) then
      raise exception 'transcript segment not found for session'
        using errcode = 'P0002';
    end if;
    v_transcript_segment_id := p_transcript_segment_id;
  end if;

  update public.platform_report_contributions
  set
    execution_id = v_execution_id,
    note_id = v_note_id,
    timeline_event_id = v_timeline_event_id,
    transcript_capture_id = v_transcript_capture_id,
    transcript_segment_id = v_transcript_segment_id
  where id = p_contribution_id
    and therapist_id = v_uid
  returning * into v_row;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd
  ) || public.platform_b4c_contribution_json(v_row);

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

comment on function public.platform_attach_report_contribution_provenance_refs(uuid, uuid, text, uuid, boolean, uuid, boolean, uuid, boolean, uuid, boolean, uuid, boolean) is
  'B4C: attach/clear same-session provenance refs only; never rewrites structured_value.';

-- ---------------------------------------------------------------------------
-- 7. RPC grants hardening (authenticated EXECUTE only; no anon)
-- ---------------------------------------------------------------------------

revoke all on function public.platform_create_report_contribution(uuid, text, text, jsonb, jsonb, text, text, text, uuid, uuid, text, text, uuid, uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.platform_create_report_contribution(uuid, text, text, jsonb, jsonb, text, text, text, uuid, uuid, text, text, uuid, uuid, uuid, uuid)
  to authenticated;

revoke all on function public.platform_set_report_contribution_inclusion(uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.platform_set_report_contribution_inclusion(uuid, uuid, text, text)
  to authenticated;

revoke all on function public.platform_update_report_contribution_display(uuid, uuid, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.platform_update_report_contribution_display(uuid, uuid, text, text, boolean)
  to authenticated;

revoke all on function public.platform_attach_report_contribution_provenance_refs(uuid, uuid, text, uuid, boolean, uuid, boolean, uuid, boolean, uuid, boolean, uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.platform_attach_report_contribution_provenance_refs(uuid, uuid, text, uuid, boolean, uuid, boolean, uuid, boolean, uuid, boolean, uuid, boolean)
  to authenticated;
