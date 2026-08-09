-- =============================================================================
-- RADIONICS — Platform Session F2 Batch B2 (local preparation)
-- Authorization: RADIONICS-F2-B2-LOCAL-AUTH-20260809-01
-- Design baseline: Platform_Session_F2_B2_Pre_Implementation_Readiness.md
--   (APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION as design; this file is
--    the separately authorized local implementation artifact)
--
-- Creates:
--   platform_client_testimony_snapshots
--   platform_session_plan_items
--   RPCs: platform_patch_session_draft_context
--         platform_upsert_session_plan_item
--         platform_delete_session_plan_item
--         platform_start_session
--
-- Write posture: RPC-only for testimony/plan/draft-context/start.
-- Authenticated: SELECT only on B2 tables.
-- No platform_methodologies. No B3+ tables. No active_execution_id.
-- Depends on: B1 core + B1 grants hardening; has_approved_specialty_certification()
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. platform_client_testimony_snapshots
-- ---------------------------------------------------------------------------

create table public.platform_client_testimony_snapshots (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  session_id uuid not null,
  client_id uuid not null,
  captured_at timestamptz not null,
  identity jsonb not null,
  schema_version text not null default 'platform.session.testimony.v1',
  created_at timestamptz not null default now(),

  constraint platform_client_testimony_snapshots_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_client_testimony_snapshots_session_unique
    unique (session_id),

  constraint platform_client_testimony_snapshots_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  constraint platform_client_testimony_snapshots_client_fk
    foreign key (client_id, therapist_id)
    references public.platform_clients (id, therapist_id)
    on delete restrict,

  constraint platform_client_testimony_snapshots_schema_version_not_empty
    check (char_length(trim(schema_version)) > 0),

  constraint platform_client_testimony_snapshots_identity_is_object
    check (jsonb_typeof(identity) = 'object')
);

comment on table public.platform_client_testimony_snapshots is
  'F2 B2: immutable client identity testimony captured at explicit start_session. RPC insert only.';

create index idx_platform_client_testimony_snapshots_therapist_id
  on public.platform_client_testimony_snapshots (therapist_id);

create index idx_platform_client_testimony_snapshots_client_therapist
  on public.platform_client_testimony_snapshots (client_id, therapist_id);

alter table public.platform_client_testimony_snapshots enable row level security;

create policy "platform_client_testimony_snapshots_select_own"
  on public.platform_client_testimony_snapshots
  for select
  to authenticated
  using (therapist_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies for authenticated — start_session RPC only.

revoke all privileges
  on table public.platform_client_testimony_snapshots
  from public, anon, authenticated;

grant select
  on table public.platform_client_testimony_snapshots
  to authenticated;

-- ---------------------------------------------------------------------------
-- 2. platform_session_plan_items
-- ---------------------------------------------------------------------------

create table public.platform_session_plan_items (
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
  schema_version text not null default 'platform.session.plan.v1',
  row_revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint platform_session_plan_items_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_session_plan_items_session_sequence_unique
    unique (session_id, sequence_order),

  constraint platform_session_plan_items_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  constraint platform_session_plan_items_role_check
    check (role in ('primary', 'complementary')),

  constraint platform_session_plan_items_sequence_order_positive
    check (sequence_order >= 1),

  constraint platform_session_plan_items_row_revision_positive
    check (row_revision >= 1),

  constraint platform_session_plan_items_methodology_id_not_empty
    check (char_length(trim(methodology_id)) > 0),
  constraint platform_session_plan_items_methodology_slug_not_empty
    check (char_length(trim(methodology_slug)) > 0),
  constraint platform_session_plan_items_methodology_name_not_empty
    check (char_length(trim(methodology_name)) > 0),
  constraint platform_session_plan_items_schema_version_not_empty
    check (char_length(trim(schema_version)) > 0),
  constraint platform_session_plan_items_specialty_slug_trim
    check (specialty_slug is null or char_length(trim(specialty_slug)) > 0),
  constraint platform_session_plan_items_specialty_name_trim
    check (specialty_name is null or char_length(trim(specialty_name)) > 0)
);

comment on table public.platform_session_plan_items is
  'F2 B2: intended methodologies for a session. specialty_id anchors radionics_specialties. RPC writes only.';

-- Exactly one primary plan item per session (OD-B2-5).
create unique index idx_platform_session_plan_items_one_primary_per_session
  on public.platform_session_plan_items (session_id)
  where role = 'primary';

create index idx_platform_session_plan_items_session_therapist
  on public.platform_session_plan_items (session_id, therapist_id);

create index idx_platform_session_plan_items_specialty_id
  on public.platform_session_plan_items (specialty_id);

create index idx_platform_session_plan_items_therapist_id
  on public.platform_session_plan_items (therapist_id);

create trigger trg_platform_session_plan_items_guard_mutable
  before insert or update on public.platform_session_plan_items
  for each row execute function public.platform_guard_mutable_owned_row();

alter table public.platform_session_plan_items enable row level security;

create policy "platform_session_plan_items_select_own"
  on public.platform_session_plan_items
  for select
  to authenticated
  using (therapist_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies for authenticated — plan RPCs only.

revoke all privileges
  on table public.platform_session_plan_items
  from public, anon, authenticated;

grant select
  on table public.platform_session_plan_items
  to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Internal helpers (B2 RPCs)
-- ---------------------------------------------------------------------------

create or replace function public.platform_b2_require_uid()
returns uuid
language plpgsql
stable
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'authentication required'
      using errcode = '42501';
  end if;
  return v_uid;
end;
$$;

revoke all on function public.platform_b2_require_uid() from public;

-- Allow in-flight claim rows for concurrency-safe idempotency (B1 had accepted|conflict|failed only).
alter table public.platform_command_idempotency
  drop constraint platform_command_idempotency_response_status_check;

alter table public.platform_command_idempotency
  add constraint platform_command_idempotency_response_status_check
  check (response_status in ('accepted', 'conflict', 'failed', 'pending'));

-- Concurrency-safe claim: INSERT pending under UNIQUE (therapist_id, idempotency_key).
-- Contenders SELECT … FOR UPDATE and either replay the finalized body or take over an
-- abandoned pending claim after the winner commits/rolls back.
create or replace function public.platform_b2_replay_or_claim_idempotency(
  p_therapist_id uuid,
  p_idempotency_key text,
  p_command_type text,
  p_session_id uuid,
  p_fingerprint text,
  p_row_revision_seen integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
  v_claimed_id uuid;
  v_existing public.platform_command_idempotency%rowtype;
begin
  if p_idempotency_key is null or char_length(trim(p_idempotency_key)) = 0 then
    raise exception 'idempotency_key is required'
      using errcode = '22023';
  end if;

  v_key := trim(p_idempotency_key);

  insert into public.platform_command_idempotency (
    therapist_id,
    idempotency_key,
    command_type,
    session_id,
    request_fingerprint,
    response_status,
    response_body,
    row_revision_seen
  ) values (
    p_therapist_id,
    v_key,
    p_command_type,
    p_session_id,
    p_fingerprint,
    'pending',
    null,
    p_row_revision_seen
  )
  on conflict (therapist_id, idempotency_key) do nothing
  returning id into v_claimed_id;

  if v_claimed_id is not null then
    return jsonb_build_object('replay', false, 'claimed', true);
  end if;

  -- Another transaction holds or held this key — wait on row lock.
  select *
    into v_existing
  from public.platform_command_idempotency
  where therapist_id = p_therapist_id
    and idempotency_key = v_key
  for update;

  if not found then
    -- Extremely rare: row vanished between conflict and select; try claim once more.
    insert into public.platform_command_idempotency (
      therapist_id,
      idempotency_key,
      command_type,
      session_id,
      request_fingerprint,
      response_status,
      response_body,
      row_revision_seen
    ) values (
      p_therapist_id,
      v_key,
      p_command_type,
      p_session_id,
      p_fingerprint,
      'pending',
      null,
      p_row_revision_seen
    )
    returning id into v_claimed_id;

    if v_claimed_id is null then
      raise exception 'idempotency claim failed'
        using errcode = '40001';
    end if;

    return jsonb_build_object('replay', false, 'claimed', true);
  end if;

  if v_existing.request_fingerprint is distinct from p_fingerprint
     or v_existing.command_type is distinct from p_command_type then
    raise exception 'idempotency key reuse with different request'
      using errcode = '23505';
  end if;

  if v_existing.response_status = 'pending' then
    -- Previous claimer aborted; we hold the lock — take over the claim.
    update public.platform_command_idempotency
    set
      session_id = p_session_id,
      request_fingerprint = p_fingerprint,
      row_revision_seen = p_row_revision_seen,
      expires_at = now() + interval '7 days'
    where id = v_existing.id
      and therapist_id = p_therapist_id;

    return jsonb_build_object('replay', false, 'claimed', true);
  end if;

  -- Finalized response — safe replay.
  return jsonb_build_object(
    'replay', true,
    'response_status', v_existing.response_status,
    'response_body', v_existing.response_body
  );
end;
$$;

revoke all on function public.platform_b2_replay_or_claim_idempotency(uuid, text, text, uuid, text, integer) from public;

create or replace function public.platform_b2_finalize_idempotency(
  p_therapist_id uuid,
  p_idempotency_key text,
  p_response_status text,
  p_response_body jsonb,
  p_row_revision_seen integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.platform_command_idempotency
  set
    response_status = p_response_status,
    response_body = p_response_body,
    row_revision_seen = p_row_revision_seen
  where therapist_id = p_therapist_id
    and idempotency_key = trim(p_idempotency_key)
    and response_status = 'pending';

  if not found then
    raise exception 'idempotency finalize failed: pending claim missing'
      using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.platform_b2_finalize_idempotency(uuid, text, text, jsonb, integer) from public;

create or replace function public.platform_b2_fail_idempotency_claim(
  p_therapist_id uuid,
  p_idempotency_key text,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.platform_command_idempotency
  set
    response_status = 'failed',
    response_body = jsonb_build_object(
      'status', 'failed',
      'error', left(coalesce(p_error, 'unknown'), 500)
    )
  where therapist_id = p_therapist_id
    and idempotency_key = trim(p_idempotency_key)
    and response_status = 'pending';
end;
$$;

revoke all on function public.platform_b2_fail_idempotency_claim(uuid, text, text) from public;

create or replace function public.platform_b2_build_client_identity(p_client public.platform_clients)
returns jsonb
language plpgsql
stable
as $$
declare
  v_identity jsonb;
begin
  if char_length(trim(p_client.display_name)) = 0
     or char_length(trim(p_client.full_name)) = 0
     or p_client.date_of_birth is null
     or char_length(trim(p_client.address)) = 0
     or char_length(trim(p_client.locality)) = 0
     or char_length(trim(p_client.country)) = 0 then
    raise exception 'client identity is not testimony-ready'
      using errcode = '23514';
  end if;

  v_identity := jsonb_build_object(
    'displayName', trim(p_client.display_name),
    'fullName', trim(p_client.full_name),
    'dateOfBirth', to_char(p_client.date_of_birth, 'YYYY-MM-DD'),
    'address', trim(p_client.address),
    'locality', trim(p_client.locality),
    'country', trim(p_client.country)
  );

  if p_client.postal_code is not null and char_length(trim(p_client.postal_code)) > 0 then
    v_identity := v_identity || jsonb_build_object('postalCode', trim(p_client.postal_code));
  end if;
  if p_client.phone is not null and char_length(trim(p_client.phone)) > 0 then
    v_identity := v_identity || jsonb_build_object('phone', trim(p_client.phone));
  end if;
  if p_client.whatsapp is not null and char_length(trim(p_client.whatsapp)) > 0 then
    v_identity := v_identity || jsonb_build_object('whatsapp', trim(p_client.whatsapp));
  end if;
  if p_client.email is not null and char_length(trim(p_client.email)) > 0 then
    v_identity := v_identity || jsonb_build_object('email', trim(p_client.email));
  end if;

  return v_identity;
end;
$$;

revoke all on function public.platform_b2_build_client_identity(public.platform_clients) from public;

-- ---------------------------------------------------------------------------
-- 4. RPC: platform_patch_session_draft_context (OD-B2-3)
-- ---------------------------------------------------------------------------

create or replace function public.platform_patch_session_draft_context(
  p_session_id uuid,
  p_idempotency_key text,
  p_intention text default null,
  p_scheduled_at timestamptz default null,
  p_scheduling_timezone text default null,
  p_session_mode text default null,
  p_clear_intention boolean default false,
  p_clear_scheduled_at boolean default false,
  p_clear_scheduling_timezone boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'patch_session_draft_context';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_body jsonb;
begin
  v_fp := md5(
    coalesce(p_session_id::text, '') || '|' ||
    coalesce(p_intention, '') || '|' ||
    coalesce(p_scheduled_at::text, '') || '|' ||
    coalesce(p_scheduling_timezone, '') || '|' ||
    coalesce(p_session_mode, '') || '|' ||
    coalesce(p_clear_intention::text, 'f') || '|' ||
    coalesce(p_clear_scheduled_at::text, 'f') || '|' ||
    coalesce(p_clear_scheduling_timezone::text, 'f')
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

  if v_session.lifecycle_status <> 'draft' then
    raise exception 'draft context patch allowed only while lifecycle_status = draft'
      using errcode = '23514';
  end if;

  if p_session_mode is not null
     and p_session_mode not in ('presential', 'online', 'distance') then
    raise exception 'invalid session_mode'
      using errcode = '23514';
  end if;

  if p_scheduling_timezone is not null
     and char_length(trim(p_scheduling_timezone)) = 0 then
    raise exception 'scheduling_timezone must be null or non-empty'
      using errcode = '23514';
  end if;

  update public.platform_sessions s
  set
    intention = case
      when p_clear_intention then null
      when p_intention is not null then nullif(trim(p_intention), '')
      else s.intention
    end,
    scheduled_at = case
      when p_clear_scheduled_at then null
      when p_scheduled_at is not null then p_scheduled_at
      else s.scheduled_at
    end,
    scheduling_timezone = case
      when p_clear_scheduling_timezone then null
      when p_scheduling_timezone is not null then trim(p_scheduling_timezone)
      else s.scheduling_timezone
    end,
    session_mode = coalesce(p_session_mode, s.session_mode)
  where s.id = p_session_id
    and s.therapist_id = v_uid
  returning * into v_session;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'session_id', v_session.id,
    'row_revision', v_session.row_revision,
    'intention', to_jsonb(v_session.intention),
    'scheduled_at', to_jsonb(v_session.scheduled_at),
    'scheduling_timezone', to_jsonb(v_session.scheduling_timezone),
    'session_mode', to_jsonb(v_session.session_mode)
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

comment on function public.platform_patch_session_draft_context(uuid, text, text, timestamptz, text, text, boolean, boolean, boolean) is
  'B2: RPC-only draft intention/schedule/mode patch. Idempotent.';

revoke all on function public.platform_patch_session_draft_context(uuid, text, text, timestamptz, text, text, boolean, boolean, boolean) from public;
grant execute on function public.platform_patch_session_draft_context(uuid, text, text, timestamptz, text, text, boolean, boolean, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. RPC: platform_upsert_session_plan_item (OD-B2-4 / OD-B2-8)
-- ---------------------------------------------------------------------------

create or replace function public.platform_upsert_session_plan_item(
  p_session_id uuid,
  p_specialty_id uuid,
  p_role text,
  p_sequence_order integer,
  p_idempotency_key text,
  p_plan_item_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'upsert_session_plan_item';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_specialty public.radionics_specialties%rowtype;
  v_item public.platform_session_plan_items%rowtype;
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

  if p_sequence_order is null or p_sequence_order < 1 then
    raise exception 'sequence_order must be >= 1'
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

  if v_session.lifecycle_status <> 'draft' then
    raise exception 'plan mutations allowed only while lifecycle_status = draft'
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

  if p_plan_item_id is null then
    insert into public.platform_session_plan_items (
      therapist_id,
      session_id,
      specialty_id,
      methodology_id,
      methodology_slug,
      methodology_name,
      specialty_slug,
      specialty_name,
      role,
      sequence_order
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
      p_sequence_order
    )
    returning * into v_item;
  else
    update public.platform_session_plan_items i
    set
      specialty_id = p_specialty_id,
      methodology_id = v_specialty.id::text,
      methodology_slug = v_specialty.slug,
      methodology_name = v_specialty.name,
      specialty_slug = v_specialty.slug,
      specialty_name = v_specialty.name,
      role = p_role,
      sequence_order = p_sequence_order
    where i.id = p_plan_item_id
      and i.therapist_id = v_uid
      and i.session_id = p_session_id
    returning * into v_item;

    if not found then
      raise exception 'plan item not found'
        using errcode = 'P0002';
    end if;
  end if;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'session_id', p_session_id,
    'plan_item_id', v_item.id,
    'specialty_id', v_item.specialty_id,
    'role', v_item.role,
    'sequence_order', v_item.sequence_order,
    'row_revision', v_item.row_revision,
    'methodology_id', v_item.methodology_id,
    'methodology_slug', v_item.methodology_slug,
    'methodology_name', v_item.methodology_name
  );

  perform public.platform_b2_finalize_idempotency(
    v_uid, p_idempotency_key, 'accepted', v_body, v_item.row_revision
  );

  return v_body;
exception
  when others then
    perform public.platform_b2_fail_idempotency_claim(v_uid, p_idempotency_key, SQLERRM);
    raise;
end;
$$;

comment on function public.platform_upsert_session_plan_item(uuid, uuid, text, integer, text, uuid) is
  'B2: RPC-only plan item create/update. Caller passes specialty_id; server reconciles snapshots. Cert-gated.';

revoke all on function public.platform_upsert_session_plan_item(uuid, uuid, text, integer, text, uuid) from public;
grant execute on function public.platform_upsert_session_plan_item(uuid, uuid, text, integer, text, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. RPC: platform_delete_session_plan_item
-- ---------------------------------------------------------------------------

create or replace function public.platform_delete_session_plan_item(
  p_session_id uuid,
  p_plan_item_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := public.platform_b2_require_uid();
  v_cmd text := 'delete_session_plan_item';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_body jsonb;
  v_deleted uuid;
begin
  v_fp := md5(coalesce(p_session_id::text, '') || '|' || coalesce(p_plan_item_id::text, ''));

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

  if v_session.lifecycle_status <> 'draft' then
    raise exception 'plan mutations allowed only while lifecycle_status = draft'
      using errcode = '23514';
  end if;

  delete from public.platform_session_plan_items i
  where i.id = p_plan_item_id
    and i.therapist_id = v_uid
    and i.session_id = p_session_id
  returning i.id into v_deleted;

  if v_deleted is null then
    raise exception 'plan item not found'
      using errcode = 'P0002';
  end if;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'session_id', p_session_id,
    'plan_item_id', v_deleted,
    'deleted', true
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

comment on function public.platform_delete_session_plan_item(uuid, uuid, text) is
  'B2: RPC-only plan item delete while session is draft. Idempotent.';

revoke all on function public.platform_delete_session_plan_item(uuid, uuid, text) from public;
grant execute on function public.platform_delete_session_plan_item(uuid, uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. RPC: platform_start_session (OD-B2-2)
-- ---------------------------------------------------------------------------

create or replace function public.platform_start_session(
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
  v_cmd text := 'start_session';
  v_fp text;
  v_gate jsonb;
  v_session public.platform_sessions%rowtype;
  v_client public.platform_clients%rowtype;
  v_primary public.platform_session_plan_items%rowtype;
  v_identity jsonb;
  v_snapshot_id uuid;
  v_captured_at timestamptz;
  v_body jsonb;
begin
  v_fp := md5('start_session|' || coalesce(p_session_id::text, ''));

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

  if v_session.lifecycle_status <> 'draft' then
    raise exception 'start_session requires lifecycle_status = draft'
      using errcode = '23514';
  end if;

  select * into v_client
  from public.platform_clients
  where id = v_session.client_id
    and therapist_id = v_uid;

  if not found then
    raise exception 'client not found'
      using errcode = 'P0002';
  end if;

  v_identity := public.platform_b2_build_client_identity(v_client);

  select * into v_primary
  from public.platform_session_plan_items
  where session_id = p_session_id
    and therapist_id = v_uid
    and role = 'primary';

  if not found then
    raise exception 'primary plan item is required before start'
      using errcode = '23514';
  end if;

  -- Re-validate certification at transaction time (not only at plan create).
  if not public.has_approved_specialty_certification(v_primary.specialty_id) then
    raise exception 'approved certification for primary specialty required at start'
      using errcode = '42501';
  end if;

  v_captured_at := now();
  v_snapshot_id := gen_random_uuid();

  insert into public.platform_client_testimony_snapshots (
    id,
    therapist_id,
    session_id,
    client_id,
    captured_at,
    identity,
    schema_version,
    created_at
  ) values (
    v_snapshot_id,
    v_uid,
    p_session_id,
    v_client.id,
    v_captured_at,
    v_identity,
    'platform.session.testimony.v1',
    v_captured_at
  );

  update public.platform_sessions s
  set
    lifecycle_status = 'in_progress',
    started_at = v_captured_at,
    active_timer_started_at = v_captured_at
  where s.id = p_session_id
    and s.therapist_id = v_uid
  returning * into v_session;

  v_body := jsonb_build_object(
    'status', 'accepted',
    'command_type', v_cmd,
    'session_id', v_session.id,
    'lifecycle_status', v_session.lifecycle_status,
    'started_at', v_session.started_at,
    'active_timer_started_at', v_session.active_timer_started_at,
    'row_revision', v_session.row_revision,
    'testimony_snapshot_id', v_snapshot_id,
    'primary_specialty_id', v_primary.specialty_id
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

comment on function public.platform_start_session(uuid, text) is
  'B2: draft→in_progress with immutable testimony snapshot; primary specialty cert checked at transaction time.';

revoke all on function public.platform_start_session(uuid, text) from public;
grant execute on function public.platform_start_session(uuid, text) to authenticated;
