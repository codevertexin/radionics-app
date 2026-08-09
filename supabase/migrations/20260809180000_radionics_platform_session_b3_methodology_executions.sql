-- =============================================================================
-- RADIONICS — Platform Session F2 Batch B3 (local preparation)
-- Authorization: RADIONICS-F2-B3-LOCAL-AUTH-20260809-01
-- Design baseline: Platform_Session_F2_B3_Pre_Implementation_Readiness.md
--   (OD-B3-1…15 APPROVED as design; this file is the separately authorized
--    local implementation artifact)
--
-- Creates:
--   platform_methodology_executions
--   platform_sessions.active_execution_id (+ composite FK)
--   RPCs: platform_create_methodology_execution
--         platform_activate_execution
--         platform_deactivate_execution
--         platform_complete_methodology_execution
--         platform_abandon_methodology_execution
--
-- Write posture: RPC-only lifecycle. Authenticated: SELECT only on executions.
-- RPC EXECUTE: authenticated only (revoke from public, anon, authenticated first).
-- No platform_patch_methodology_execution_state. No platform_methodologies.
-- No B4+. No methodology therapeutic columns.
-- Depends on: B1 + B2 (+ B2 RPC grants hardening); has_approved_specialty_certification()
-- Reuses: platform_b2_require_uid / replay_or_claim / finalize / fail helpers
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. platform_methodology_executions
-- ---------------------------------------------------------------------------

create table public.platform_methodology_executions (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  session_id uuid not null,
  specialty_id uuid not null
    references public.radionics_specialties (id) on delete restrict,
  methodology_id text not null,
  methodology_slug text not null,
  methodology_name text not null,
  specialty_slug text null,
  specialty_name text null,
  role text not null,
  sequence_order integer not null,
  status text not null default 'not_started',
  adapter_id text null,
  adapter_version text null,
  workflow_template_id text null,
  workflow_version text null,
  state_schema_version text not null default 'platform.session.execution.v1',
  state_payload jsonb not null default '{}'::jsonb,
  progress jsonb null,
  completion_awareness jsonb null,
  started_at timestamptz null,
  paused_at timestamptz null,
  resumed_at timestamptz null,
  completed_at timestamptz null,
  plan_item_id uuid null,
  row_revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint platform_methodology_executions_id_therapist_unique
    unique (id, therapist_id),

  -- Supports same-session active_execution_id FK on platform_sessions
  -- (id, therapist_id, active_execution_id) → (session_id, therapist_id, id).
  constraint platform_methodology_executions_session_therapist_id_unique
    unique (session_id, therapist_id, id),

  constraint platform_methodology_executions_session_sequence_unique
    unique (session_id, sequence_order),

  constraint platform_methodology_executions_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  constraint platform_methodology_executions_plan_item_fk
    foreign key (plan_item_id, therapist_id)
    references public.platform_session_plan_items (id, therapist_id)
    on delete restrict,

  constraint platform_methodology_executions_role_check
    check (role in ('primary', 'complementary')),

  constraint platform_methodology_executions_status_check
    check (status in ('not_started', 'active', 'paused', 'completed', 'abandoned')),

  constraint platform_methodology_executions_sequence_order_positive
    check (sequence_order >= 1),

  constraint platform_methodology_executions_row_revision_positive
    check (row_revision >= 1),

  constraint platform_methodology_executions_methodology_id_not_empty
    check (char_length(trim(methodology_id)) > 0),
  constraint platform_methodology_executions_methodology_slug_not_empty
    check (char_length(trim(methodology_slug)) > 0),
  constraint platform_methodology_executions_methodology_name_not_empty
    check (char_length(trim(methodology_name)) > 0),
  constraint platform_methodology_executions_state_schema_version_not_empty
    check (char_length(trim(state_schema_version)) > 0),
  constraint platform_methodology_executions_state_payload_is_object
    check (jsonb_typeof(state_payload) = 'object'),
  constraint platform_methodology_executions_specialty_slug_trim
    check (specialty_slug is null or char_length(trim(specialty_slug)) > 0),
  constraint platform_methodology_executions_specialty_name_trim
    check (specialty_name is null or char_length(trim(specialty_name)) > 0)
);

comment on table public.platform_methodology_executions is
  'F2 B3: methodology-neutral execution rows. specialty_id → radionics_specialties. RPC lifecycle only; opaque state_payload set at create.';

-- Exactly one active execution per session (F2 §8 / OD-B3).
create unique index idx_platform_methodology_executions_one_active_per_session
  on public.platform_methodology_executions (session_id)
  where status = 'active';

-- Exactly one primary execution per session (OD-B3-10).
create unique index idx_platform_methodology_executions_one_primary_per_session
  on public.platform_methodology_executions (session_id)
  where role = 'primary';

create index idx_platform_methodology_executions_session_therapist
  on public.platform_methodology_executions (session_id, therapist_id);

create index idx_platform_methodology_executions_specialty_id
  on public.platform_methodology_executions (specialty_id);

create index idx_platform_methodology_executions_therapist_id
  on public.platform_methodology_executions (therapist_id);

create index idx_platform_methodology_executions_plan_item_id
  on public.platform_methodology_executions (plan_item_id)
  where plan_item_id is not null;

create trigger trg_platform_methodology_executions_guard_mutable
  before insert or update on public.platform_methodology_executions
  for each row execute function public.platform_guard_mutable_owned_row();

alter table public.platform_methodology_executions enable row level security;

create policy "platform_methodology_executions_select_own"
  on public.platform_methodology_executions
  for select
  to authenticated
  using (therapist_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies for authenticated — lifecycle RPCs only.

revoke all privileges
  on table public.platform_methodology_executions
  from public, anon, authenticated;

grant select
  on table public.platform_methodology_executions
  to authenticated;

-- ---------------------------------------------------------------------------
-- 2. platform_sessions.active_execution_id (B1 deferral resolved)
-- ---------------------------------------------------------------------------

alter table public.platform_sessions
  add column active_execution_id uuid null;

comment on column public.platform_sessions.active_execution_id is
  'F2 B3: nullable pointer to the sole active methodology execution for this session; must match same session+therapist; mutated by lifecycle RPCs only.';

-- Same-session + same-therapist pointer (OD-B3-13 structural half).
alter table public.platform_sessions
  add constraint platform_sessions_active_execution_fk
  foreign key (id, therapist_id, active_execution_id)
  references public.platform_methodology_executions (session_id, therapist_id, id)
  on delete restrict;

create index idx_platform_sessions_active_execution_id
  on public.platform_sessions (active_execution_id)
  where active_execution_id is not null;

-- ---------------------------------------------------------------------------
-- 2b. OD-B3-13 coherence: pointer ↔ unique active status (deferred trigger)
-- ---------------------------------------------------------------------------

create or replace function public.platform_b3_assert_active_execution_coherence()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
  v_therapist_id uuid;
  v_pointer uuid;
  v_active_count integer;
  v_active_id uuid;
begin
  if tg_table_name = 'platform_sessions' then
    v_session_id := new.id;
    v_therapist_id := new.therapist_id;
    v_pointer := new.active_execution_id;
  else
    v_session_id := coalesce(new.session_id, old.session_id);
    v_therapist_id := coalesce(new.therapist_id, old.therapist_id);
    select s.active_execution_id
      into v_pointer
    from public.platform_sessions s
    where s.id = v_session_id
      and s.therapist_id = v_therapist_id;
  end if;

  select count(*)::integer, max(e.id)
    into v_active_count, v_active_id
  from public.platform_methodology_executions e
  where e.session_id = v_session_id
    and e.therapist_id = v_therapist_id
    and e.status = 'active';

  if v_pointer is null then
    if v_active_count <> 0 then
      raise exception
        'active_execution_id coherence: pointer is null but % active execution(s) exist for session %',
        v_active_count, v_session_id
        using errcode = '23514';
    end if;
  else
    if v_active_count <> 1 or v_active_id is distinct from v_pointer then
      raise exception
        'active_execution_id coherence: pointer % must equal the unique active execution (found count=%, id=%)',
        v_pointer, v_active_count, v_active_id
        using errcode = '23514';
    end if;
  end if;

  return null;
end;
$$;

comment on function public.platform_b3_assert_active_execution_coherence() is
  'B3 OD-B3-13: deferred check — active_execution_id NULL iff no status=active row; otherwise pointer equals that unique active id.';

revoke all on function public.platform_b3_assert_active_execution_coherence() from public;

create constraint trigger trg_platform_sessions_active_execution_coherence
  after insert or update of active_execution_id
  on public.platform_sessions
  deferrable initially deferred
  for each row
  execute function public.platform_b3_assert_active_execution_coherence();

create constraint trigger trg_platform_methodology_executions_active_coherence
  after insert or update of status or delete
  on public.platform_methodology_executions
  deferrable initially deferred
  for each row
  execute function public.platform_b3_assert_active_execution_coherence();

-- ---------------------------------------------------------------------------
-- 3. Internal helpers (B3)
-- ---------------------------------------------------------------------------

create or replace function public.platform_b3_session_allows_execution_lifecycle(
  p_lifecycle_status text
)
returns boolean
language sql
immutable
as $$
  select p_lifecycle_status in ('in_progress', 'paused', 'closing');
$$;

comment on function public.platform_b3_session_allows_execution_lifecycle(text) is
  'B3: execution lifecycle RPCs allowed only for non-draft, non-terminal session statuses.';

revoke all on function public.platform_b3_session_allows_execution_lifecycle(text) from public;

create or replace function public.platform_b3_execution_to_jsonb(
  p_exec public.platform_methodology_executions
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'execution_id', p_exec.id,
    'session_id', p_exec.session_id,
    'specialty_id', p_exec.specialty_id,
    'role', p_exec.role,
    'sequence_order', p_exec.sequence_order,
    'status', p_exec.status,
    'methodology_id', p_exec.methodology_id,
    'methodology_slug', p_exec.methodology_slug,
    'methodology_name', p_exec.methodology_name,
    'plan_item_id', p_exec.plan_item_id,
    'row_revision', p_exec.row_revision,
    'started_at', p_exec.started_at,
    'paused_at', p_exec.paused_at,
    'resumed_at', p_exec.resumed_at,
    'completed_at', p_exec.completed_at,
    'state_schema_version', p_exec.state_schema_version
  );
$$;

revoke all on function public.platform_b3_execution_to_jsonb(public.platform_methodology_executions) from public;

-- ---------------------------------------------------------------------------
-- 4. RPC: platform_create_methodology_execution
-- ---------------------------------------------------------------------------

create or replace function public.platform_create_methodology_execution(
  p_session_id uuid,
  p_specialty_id uuid,
  p_role text,
  p_idempotency_key text,
  p_sequence_order integer default null,
  p_plan_item_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'create_methodology_execution';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_specialty public.radionics_specialties%rowtype;
  v_plan public.platform_session_plan_items%rowtype;
  v_exec public.platform_methodology_executions%rowtype;
  v_seq integer;
  v_now timestamptz := now();
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_specialty_id::text, '') || '|' ||
    coalesce(p_role, '') || '|' ||
    coalesce(p_sequence_order::text, '') || '|' ||
    coalesce(p_plan_item_id::text, '')
  );

  v_gate := public.platform_b2_replay_or_claim_idempotency(
    v_uid, p_idempotency_key, v_cmd, p_session_id, v_fp, null
  );
  if (v_gate->>'replay')::boolean then
    return coalesce(v_gate->'response_body', jsonb_build_object('status', v_gate->>'response_status'));
  end if;

  if p_role is null or p_role not in ('primary', 'complementary') then
    raise exception 'role must be primary or complementary'
      using errcode = '23514';
  end if;

  if p_specialty_id is null then
    raise exception 'specialty_id is required'
      using errcode = '22023';
  end if;

  if not public.has_approved_specialty_certification(p_specialty_id) then
    raise exception 'approved specialty certification required'
      using errcode = '42501';
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

  if not public.platform_b3_session_allows_execution_lifecycle(v_session.lifecycle_status) then
    raise exception 'execution create requires session lifecycle in_progress|paused|closing (not draft/terminal)'
      using errcode = '23514';
  end if;

  select * into v_specialty
  from public.radionics_specialties
  where id = p_specialty_id
    and status = 'active';

  if not found then
    raise exception 'specialty not found or inactive'
      using errcode = 'P0002';
  end if;

  if p_plan_item_id is not null then
    select * into v_plan
    from public.platform_session_plan_items
    where id = p_plan_item_id
      and therapist_id = v_uid
      and session_id = p_session_id;

    if not found then
      raise exception 'plan item not found for session'
        using errcode = 'P0002';
    end if;

    if v_plan.specialty_id is distinct from p_specialty_id then
      raise exception 'plan_item_id specialty_id mismatch'
        using errcode = '23514';
    end if;
  end if;

  if p_sequence_order is null then
    select coalesce(max(sequence_order), 0) + 1
      into v_seq
    from public.platform_methodology_executions
    where session_id = p_session_id
      and therapist_id = v_uid;
  else
    if p_sequence_order < 1 then
      raise exception 'sequence_order must be >= 1'
        using errcode = '23514';
    end if;
    v_seq := p_sequence_order;
  end if;

  insert into public.platform_methodology_executions (
    therapist_id,
    session_id,
    specialty_id,
    methodology_id,
    methodology_slug,
    methodology_name,
    specialty_slug,
    specialty_name,
    role,
    sequence_order,
    status,
    state_schema_version,
    state_payload,
    plan_item_id,
    created_at,
    updated_at
  ) values (
    v_uid,
    p_session_id,
    p_specialty_id,
    v_specialty.id::text,
    v_specialty.slug,
    v_specialty.name,
    v_specialty.slug,
    v_specialty.name,
    p_role,
    v_seq,
    'not_started',
    'platform.session.execution.v1',
    '{}'::jsonb,
    p_plan_item_id,
    v_now,
    v_now
  )
  returning * into v_exec;

  v_body := public.platform_b3_execution_to_jsonb(v_exec)
    || jsonb_build_object(
      'status', 'accepted',
      'command_type', v_cmd,
      'active_execution_id', v_session.active_execution_id
    );

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_exec.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_create_methodology_execution(uuid, uuid, text, text, integer, uuid) is
  'B3: create not_started execution; cert-gated; initial opaque state_payload={}; optional plan_item_id provenance.';

-- ---------------------------------------------------------------------------
-- 5. RPC: platform_activate_execution
-- ---------------------------------------------------------------------------

create or replace function public.platform_activate_execution(
  p_session_id uuid,
  p_execution_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'activate_execution';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_target public.platform_methodology_executions%rowtype;
  v_now timestamptz := now();
  v_body jsonb;
begin
  v_fp := md5(
    'activate_execution|' ||
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_execution_id::text, '')
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

  if not public.platform_b3_session_allows_execution_lifecycle(v_session.lifecycle_status) then
    raise exception 'execution activate requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  -- Lock all session executions to serialize one-active transitions.
  perform 1
  from public.platform_methodology_executions
  where session_id = p_session_id
    and therapist_id = v_uid
  for update;

  select * into v_target
  from public.platform_methodology_executions
  where id = p_execution_id
    and therapist_id = v_uid
    and session_id = p_session_id;

  if not found then
    raise exception 'execution not found'
      using errcode = 'P0002';
  end if;

  if v_target.status in ('completed', 'abandoned') then
    raise exception 'cannot activate a completed or abandoned execution'
      using errcode = '23514';
  end if;

  -- Re-check certification at transaction time.
  if not public.has_approved_specialty_certification(v_target.specialty_id) then
    raise exception 'approved specialty certification required at activate'
      using errcode = '42501';
  end if;

  -- Pause any other active execution in this session (preserve state_payload).
  update public.platform_methodology_executions e
  set
    status = 'paused',
    paused_at = v_now
  where e.session_id = p_session_id
    and e.therapist_id = v_uid
    and e.status = 'active'
    and e.id is distinct from p_execution_id;

  if v_target.status = 'active'
     and v_session.active_execution_id is not distinct from p_execution_id then
    -- Already active — coherent no-op; still finalize idempotency.
    null;
  else
    update public.platform_methodology_executions e
    set
      status = 'active',
      started_at = coalesce(e.started_at, v_now),
      resumed_at = case
        when e.status = 'paused' then v_now
        when e.status = 'not_started' then null
        else e.resumed_at
      end,
      paused_at = case when e.status = 'paused' then null else e.paused_at end
    where e.id = p_execution_id
      and e.therapist_id = v_uid
    returning * into v_target;
  end if;

  update public.platform_sessions s
  set active_execution_id = p_execution_id
  where s.id = p_session_id
    and s.therapist_id = v_uid
  returning * into v_session;

  select * into v_target
  from public.platform_methodology_executions
  where id = p_execution_id
    and therapist_id = v_uid;

  v_body := public.platform_b3_execution_to_jsonb(v_target)
    || jsonb_build_object(
      'status', 'accepted',
      'command_type', v_cmd,
      'active_execution_id', v_session.active_execution_id,
      'session_row_revision', v_session.row_revision
    );

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_target.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_activate_execution(uuid, uuid, text) is
  'B3: switch active execution within session; pause previous; cert re-check; preserve state_payload.';

-- ---------------------------------------------------------------------------
-- 6. RPC: platform_deactivate_execution
-- ---------------------------------------------------------------------------

create or replace function public.platform_deactivate_execution(
  p_session_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'deactivate_execution';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_prev public.platform_methodology_executions%rowtype;
  v_now timestamptz := now();
  v_body jsonb;
begin
  v_fp := md5('deactivate_execution|' || coalesce(p_session_id::text, ''));

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

  if not public.platform_b3_session_allows_execution_lifecycle(v_session.lifecycle_status) then
    raise exception 'execution deactivate requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  perform 1
  from public.platform_methodology_executions
  where session_id = p_session_id
    and therapist_id = v_uid
  for update;

  if v_session.active_execution_id is not null then
    update public.platform_methodology_executions e
    set
      status = 'paused',
      paused_at = v_now
    where e.id = v_session.active_execution_id
      and e.therapist_id = v_uid
      and e.session_id = p_session_id
      and e.status = 'active'
    returning * into v_prev;
  end if;

  -- Also pause any stray active rows (coherence fail-closed).
  update public.platform_methodology_executions e
  set
    status = 'paused',
    paused_at = coalesce(e.paused_at, v_now)
  where e.session_id = p_session_id
    and e.therapist_id = v_uid
    and e.status = 'active';

  update public.platform_sessions s
  set active_execution_id = null
  where s.id = p_session_id
    and s.therapist_id = v_uid
  returning * into v_session;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'session_id', p_session_id,
    'active_execution_id', null,
    'deactivated_execution_id', v_prev.id,
    'session_row_revision', v_session.row_revision
  );

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

comment on function public.platform_deactivate_execution(uuid, text) is
  'B3: clear active execution pointer; pause previous active; no automatic replacement.';

-- ---------------------------------------------------------------------------
-- 7. RPC: platform_complete_methodology_execution
-- ---------------------------------------------------------------------------

create or replace function public.platform_complete_methodology_execution(
  p_session_id uuid,
  p_execution_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'complete_methodology_execution';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_exec public.platform_methodology_executions%rowtype;
  v_now timestamptz := now();
  v_body jsonb;
begin
  v_fp := md5(
    'complete_methodology_execution|' ||
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_execution_id::text, '')
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

  if not public.platform_b3_session_allows_execution_lifecycle(v_session.lifecycle_status) then
    raise exception 'execution complete requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  perform 1
  from public.platform_methodology_executions
  where session_id = p_session_id
    and therapist_id = v_uid
  for update;

  select * into v_exec
  from public.platform_methodology_executions
  where id = p_execution_id
    and therapist_id = v_uid
    and session_id = p_session_id;

  if not found then
    raise exception 'execution not found'
      using errcode = 'P0002';
  end if;

  if v_exec.status = 'abandoned' then
    raise exception 'cannot complete an abandoned execution'
      using errcode = '23514';
  end if;

  if v_exec.status = 'completed' then
    -- Idempotent complete.
    null;
  else
    update public.platform_methodology_executions e
    set
      status = 'completed',
      completed_at = coalesce(e.completed_at, v_now),
      paused_at = case when e.status = 'active' then v_now else e.paused_at end
    where e.id = p_execution_id
      and e.therapist_id = v_uid
    returning * into v_exec;
  end if;

  if v_session.active_execution_id is not distinct from p_execution_id then
    update public.platform_sessions s
    set active_execution_id = null
    where s.id = p_session_id
      and s.therapist_id = v_uid
    returning * into v_session;
  end if;

  select * into v_exec
  from public.platform_methodology_executions
  where id = p_execution_id
    and therapist_id = v_uid;

  v_body := public.platform_b3_execution_to_jsonb(v_exec)
    || jsonb_build_object(
      'status', 'accepted',
      'command_type', v_cmd,
      'active_execution_id', v_session.active_execution_id,
      'session_row_revision', v_session.row_revision
    );

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_exec.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_complete_methodology_execution(uuid, uuid, text) is
  'B3: mark execution completed; clear active_execution_id if this row was active.';

-- ---------------------------------------------------------------------------
-- 8. RPC: platform_abandon_methodology_execution
-- ---------------------------------------------------------------------------

create or replace function public.platform_abandon_methodology_execution(
  p_session_id uuid,
  p_execution_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'abandon_methodology_execution';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_exec public.platform_methodology_executions%rowtype;
  v_now timestamptz := now();
  v_body jsonb;
begin
  v_fp := md5(
    'abandon_methodology_execution|' ||
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_execution_id::text, '')
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

  if not public.platform_b3_session_allows_execution_lifecycle(v_session.lifecycle_status) then
    raise exception 'execution abandon requires session lifecycle in_progress|paused|closing'
      using errcode = '23514';
  end if;

  perform 1
  from public.platform_methodology_executions
  where session_id = p_session_id
    and therapist_id = v_uid
  for update;

  select * into v_exec
  from public.platform_methodology_executions
  where id = p_execution_id
    and therapist_id = v_uid
    and session_id = p_session_id;

  if not found then
    raise exception 'execution not found'
      using errcode = 'P0002';
  end if;

  if v_exec.status = 'completed' then
    raise exception 'cannot abandon a completed execution'
      using errcode = '23514';
  end if;

  if v_exec.status = 'abandoned' then
    null;
  else
    update public.platform_methodology_executions e
    set
      status = 'abandoned',
      paused_at = case when e.status = 'active' then v_now else e.paused_at end
    where e.id = p_execution_id
      and e.therapist_id = v_uid
    returning * into v_exec;
  end if;

  if v_session.active_execution_id is not distinct from p_execution_id then
    update public.platform_sessions s
    set active_execution_id = null
    where s.id = p_session_id
      and s.therapist_id = v_uid
    returning * into v_session;
  end if;

  select * into v_exec
  from public.platform_methodology_executions
  where id = p_execution_id
    and therapist_id = v_uid;

  v_body := public.platform_b3_execution_to_jsonb(v_exec)
    || jsonb_build_object(
      'status', 'accepted',
      'command_type', v_cmd,
      'active_execution_id', v_session.active_execution_id,
      'session_row_revision', v_session.row_revision
    );

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_exec.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_abandon_methodology_execution(uuid, uuid, text) is
  'B3: mark execution abandoned; clear active_execution_id if this row was active.';

-- ---------------------------------------------------------------------------
-- 9. RPC grants hardening (authenticated EXECUTE only; no anon)
-- ---------------------------------------------------------------------------

revoke all on function public.platform_create_methodology_execution(uuid, uuid, text, text, integer, uuid)
  from public, anon, authenticated;
grant execute on function public.platform_create_methodology_execution(uuid, uuid, text, text, integer, uuid)
  to authenticated;

revoke all on function public.platform_activate_execution(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.platform_activate_execution(uuid, uuid, text)
  to authenticated;

revoke all on function public.platform_deactivate_execution(uuid, text)
  from public, anon, authenticated;
grant execute on function public.platform_deactivate_execution(uuid, text)
  to authenticated;

revoke all on function public.platform_complete_methodology_execution(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.platform_complete_methodology_execution(uuid, uuid, text)
  to authenticated;

revoke all on function public.platform_abandon_methodology_execution(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.platform_abandon_methodology_execution(uuid, uuid, text)
  to authenticated;
