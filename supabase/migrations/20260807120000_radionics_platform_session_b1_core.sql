-- =============================================================================
-- RADIONICS — Platform Session F2 Batch B1 (local preparation)
-- Authorization: RADIONICS-F2-B1-LOCAL-AUTH-20260807-01
--
-- Tables:
--   platform_clients
--   platform_sessions
--   platform_command_idempotency
--
-- Scope: additive structure, CHECK constraints, composite ownership FKs,
--        indexes, RLS. No lifecycle RPCs. No B2/B3 tables.
--
-- DEFERRED TO B3 (deliberate — do not add here):
--   - platform_sessions.active_execution_id
--   - FK to platform_methodology_executions
--   - platform_methodology_executions itself
--   - partial unique active-execution index
--   - activate_execution RPC
-- Justification: executions belong to B3; adding the FK in B1 would reference
-- a table that does not exist yet. Additive ALTER in B3 is the physical order.
--
-- DEFERRED TO B2+ (lifecycle commands need testimony / plan / cert gates):
--   - start_session, pause/resume, enter_closing, complete, cancel RPCs
--   - seal/archive/report RPCs
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Helpers (B1-local; reuse set_updated_at pattern without altering legacy)
-- ---------------------------------------------------------------------------

create or replace function public.platform_guard_mutable_owned_row()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    -- Immutable identity / provenance columns (fail-closed).
    if new.id is distinct from old.id then
      raise exception 'id is immutable on %', tg_table_name
        using errcode = 'check_violation';
    end if;
    if new.therapist_id is distinct from old.therapist_id then
      raise exception 'therapist_id is immutable on %', tg_table_name
        using errcode = 'check_violation';
    end if;
    if new.created_at is distinct from old.created_at then
      raise exception 'created_at is immutable on %', tg_table_name
        using errcode = 'check_violation';
    end if;
    -- Server-owned concurrency / timestamp; ignore client-supplied values.
    new.row_revision := old.row_revision + 1;
    new.updated_at := now();
  elsif tg_op = 'INSERT' then
    -- Browser cannot choose created_at, updated_at, or row_revision.
    new.row_revision := 1;
    new.created_at := now();
    new.updated_at := now();
  end if;
  return new;
end;
$$;

comment on function public.platform_guard_mutable_owned_row() is
  'B1: immutable id/therapist_id/created_at; server-owned row_revision and timestamps on platform_clients / platform_sessions.';

revoke all on function public.platform_guard_mutable_owned_row() from public;

-- ---------------------------------------------------------------------------
-- 1. platform_clients
-- ---------------------------------------------------------------------------

create table public.platform_clients (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  display_name text not null,
  full_name text not null,
  date_of_birth date not null,
  address text not null,
  locality text not null,
  country text not null,
  postal_code text null,
  phone text null,
  whatsapp text null,
  email text null,
  legacy_name text null,
  row_revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint platform_clients_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_clients_display_name_not_empty
    check (char_length(trim(display_name)) > 0),
  constraint platform_clients_full_name_not_empty
    check (char_length(trim(full_name)) > 0),
  constraint platform_clients_address_not_empty
    check (char_length(trim(address)) > 0),
  constraint platform_clients_locality_not_empty
    check (char_length(trim(locality)) > 0),
  constraint platform_clients_country_not_empty
    check (char_length(trim(country)) > 0),

  constraint platform_clients_row_revision_positive
    check (row_revision >= 1),

  -- Conservative optional-text rules (no rigid international normalization).
  constraint platform_clients_postal_code_trim
    check (postal_code is null or char_length(trim(postal_code)) > 0),
  constraint platform_clients_phone_trim
    check (phone is null or char_length(trim(phone)) > 0),
  constraint platform_clients_whatsapp_trim
    check (whatsapp is null or char_length(trim(whatsapp)) > 0),
  constraint platform_clients_email_trim
    check (email is null or char_length(trim(email)) > 0),
  constraint platform_clients_email_basic_shape
    check (
      email is null
      or (
        position('@' in trim(email)) > 1
        and position('@' in trim(email)) < char_length(trim(email))
      )
    ),
  constraint platform_clients_legacy_name_trim
    check (legacy_name is null or char_length(trim(legacy_name)) > 0)
);

comment on table public.platform_clients is
  'F2 B1: therapist-owned client identity profile (mutable). Testimony snapshots are B2.';

create index idx_platform_clients_therapist_id
  on public.platform_clients (therapist_id);

create index idx_platform_clients_therapist_display_name
  on public.platform_clients (therapist_id, display_name);

create trigger trg_platform_clients_guard_mutable
  before insert or update on public.platform_clients
  for each row execute function public.platform_guard_mutable_owned_row();

alter table public.platform_clients enable row level security;

create policy "platform_clients_select_own"
  on public.platform_clients
  for select
  to authenticated
  using (therapist_id = auth.uid());

create policy "platform_clients_insert_own"
  on public.platform_clients
  for insert
  to authenticated
  with check (therapist_id = auth.uid());

create policy "platform_clients_update_own"
  on public.platform_clients
  for update
  to authenticated
  using (therapist_id = auth.uid())
  with check (therapist_id = auth.uid());

create policy "platform_clients_delete_own"
  on public.platform_clients
  for delete
  to authenticated
  using (therapist_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. platform_sessions
--    NOTE: active_execution_id deliberately absent until B3.
-- ---------------------------------------------------------------------------

create table public.platform_sessions (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  client_id uuid not null,
  lifecycle_status text not null default 'draft',
  session_mode text not null,
  intention text null,
  scheduled_at timestamptz null,
  scheduling_timezone text null,
  accumulated_active_duration_ms bigint not null default 0,
  active_timer_started_at timestamptz null,
  started_at timestamptz null,
  closing_entered_at timestamptz null,
  completed_at timestamptz null,
  cancelled_at timestamptz null,
  cancellation_reason text null,
  row_revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint platform_sessions_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_sessions_client_therapist_fk
    foreign key (client_id, therapist_id)
    references public.platform_clients (id, therapist_id)
    on delete restrict,

  -- Exact F0/F1 lifecycle set; 'reported' is legacy-only and forbidden here.
  constraint platform_sessions_lifecycle_status_check
    check (
      lifecycle_status in (
        'draft',
        'in_progress',
        'paused',
        'closing',
        'completed',
        'cancelled'
      )
    ),

  -- Exact SessionMode from src/platform/session/types.ts
  constraint platform_sessions_session_mode_check
    check (session_mode in ('presential', 'online', 'distance')),

  constraint platform_sessions_accumulated_non_negative
    check (accumulated_active_duration_ms >= 0),

  constraint platform_sessions_row_revision_positive
    check (row_revision >= 1),

  constraint platform_sessions_intention_trim
    check (intention is null or char_length(trim(intention)) > 0),

  constraint platform_sessions_scheduling_timezone_trim
    check (
      scheduling_timezone is null
      or char_length(trim(scheduling_timezone)) > 0
    ),

  constraint platform_sessions_cancellation_reason_trim
    check (
      cancellation_reason is null
      or char_length(trim(cancellation_reason)) > 0
    ),

  -- Lifecycle + timer + terminal timestamp coherence (F0/F1 transitions only).
  -- cancelled may retain closing_entered_at after closing → in_progress → cancelled.
  constraint platform_sessions_lifecycle_timer_coherence
    check (
      (
        lifecycle_status = 'draft'
        and started_at is null
        and active_timer_started_at is null
        and closing_entered_at is null
        and completed_at is null
        and cancelled_at is null
        and cancellation_reason is null
      )
      or (
        lifecycle_status = 'in_progress'
        and started_at is not null
        and active_timer_started_at is not null
        and completed_at is null
        and cancelled_at is null
        and cancellation_reason is null
      )
      or (
        lifecycle_status = 'paused'
        and started_at is not null
        and active_timer_started_at is null
        and completed_at is null
        and cancelled_at is null
        and cancellation_reason is null
      )
      or (
        lifecycle_status = 'closing'
        and started_at is not null
        and closing_entered_at is not null
        and active_timer_started_at is null
        and completed_at is null
        and cancelled_at is null
        and cancellation_reason is null
      )
      or (
        lifecycle_status = 'completed'
        and started_at is not null
        and closing_entered_at is not null
        and completed_at is not null
        and cancelled_at is null
        and active_timer_started_at is null
        and cancellation_reason is null
      )
      or (
        lifecycle_status = 'cancelled'
        and cancelled_at is not null
        and completed_at is null
        and active_timer_started_at is null
        and (
          closing_entered_at is null
          or started_at is not null
        )
      )
    )
);

comment on table public.platform_sessions is
  'F2 B1: therapist-owned platform session core. active_execution_id deferred to B3. Lifecycle mutations via future authorized RPCs only.';

comment on column public.platform_sessions.active_timer_started_at is
  'Start of the current open therapeutic active interval; null when clock is stopped. Non-null only while lifecycle_status = in_progress.';

comment on column public.platform_sessions.accumulated_active_duration_ms is
  'Closed therapeutic active intervals sum (ms). Server-owned; not writable by browser policies.';

create index idx_platform_sessions_therapist_updated_at
  on public.platform_sessions (therapist_id, updated_at desc);

create index idx_platform_sessions_client_therapist
  on public.platform_sessions (client_id, therapist_id);

create index idx_platform_sessions_lifecycle_status
  on public.platform_sessions (lifecycle_status);

create trigger trg_platform_sessions_guard_mutable
  before insert or update on public.platform_sessions
  for each row execute function public.platform_guard_mutable_owned_row();

alter table public.platform_sessions enable row level security;

-- Read own sessions.
create policy "platform_sessions_select_own"
  on public.platform_sessions
  for select
  to authenticated
  using (therapist_id = auth.uid());

-- Create draft only; therapeutic timestamps / timer / duration forced empty.
-- Composite FK already requires client ownership match.
create policy "platform_sessions_insert_own_draft"
  on public.platform_sessions
  for insert
  to authenticated
  with check (
    therapist_id = auth.uid()
    and lifecycle_status = 'draft'
    and accumulated_active_duration_ms = 0
    and active_timer_started_at is null
    and started_at is null
    and closing_entered_at is null
    and completed_at is null
    and cancelled_at is null
    and cancellation_reason is null
    and row_revision = 1
  );

-- No therapist UPDATE/DELETE policies:
-- lifecycle, timer, timestamps and row_revision must change only via future
-- authorized SECURITY DEFINER RPCs (B2+). Direct browser mutation denied.

-- ---------------------------------------------------------------------------
-- 3. platform_command_idempotency
-- ---------------------------------------------------------------------------

create table public.platform_command_idempotency (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references auth.users (id),
  idempotency_key text not null,
  command_type text not null,
  session_id uuid null,
  request_fingerprint text null,
  response_status text not null,
  response_body jsonb null,
  row_revision_seen integer null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),

  constraint platform_command_idempotency_id_therapist_unique
    unique (id, therapist_id),

  constraint platform_command_idempotency_therapist_key_unique
    unique (therapist_id, idempotency_key),

  constraint platform_command_idempotency_session_fk
    foreign key (session_id, therapist_id)
    references public.platform_sessions (id, therapist_id)
    on delete restrict,

  constraint platform_command_idempotency_key_not_empty
    check (char_length(trim(idempotency_key)) > 0),
  constraint platform_command_idempotency_command_type_not_empty
    check (char_length(trim(command_type)) > 0),

  constraint platform_command_idempotency_response_status_check
    check (response_status in ('accepted', 'conflict', 'failed')),

  constraint platform_command_idempotency_expires_after_created
    check (expires_at > created_at),

  constraint platform_command_idempotency_row_revision_seen_ok
    check (row_revision_seen is null or row_revision_seen >= 1),

  constraint platform_command_idempotency_fingerprint_trim
    check (
      request_fingerprint is null
      or char_length(trim(request_fingerprint)) > 0
    )
);

comment on table public.platform_command_idempotency is
  'F2 B1: command deduplication store. Therapist SELECT only; writes via future authorized RPCs. No purge job in B1.';

create index idx_platform_command_idempotency_expires_at
  on public.platform_command_idempotency (expires_at);

create index idx_platform_command_idempotency_therapist_created_at
  on public.platform_command_idempotency (therapist_id, created_at desc);

alter table public.platform_command_idempotency enable row level security;

create policy "platform_command_idempotency_select_own"
  on public.platform_command_idempotency
  for select
  to authenticated
  using (therapist_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies for authenticated therapists.
-- No admin cross-write policies (silent admin mutation forbidden in B1).
-- Future writes: authorized SECURITY DEFINER RPCs only.
