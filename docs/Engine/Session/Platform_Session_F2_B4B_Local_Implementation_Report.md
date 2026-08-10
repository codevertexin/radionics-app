# Platform Session F2 — Batch B4B Local Implementation Report

**Authorization consumed (local):** `RADIONICS-F2-B4B-LOCAL-AUTH-20260810-01`
**Apply authorization:** `RADIONICS-F2-B4B-DEV-APPLY-AUTH-20260810-01`
**Environment designation:** `RADIONICS-ENV-DESIGNATION-20260807-01` (Development)
**Design baseline:** `docs/Engine/Session/Platform_Session_F2_B4B_Pre_Implementation_Readiness.md`
**Status:** `DEV APPLY AUTHORIZED — AGENT CLI BLOCKED (403) — AWAITING OWNER MANUAL APPLY`
**Date:** 2026-08-10
**Scope:** Local B4B + authorized Development apply (agent cannot execute DDL on Dev project)
**Committed artifact:** `5786c89`

---

## 1. Executive verdict

B4B local implementation prepared under `RADIONICS-F2-B4B-LOCAL-AUTH-20260810-01` (same-session capture FK correction included) and committed as `5786c89`.

Development apply was authorized under `RADIONICS-F2-B4B-DEV-APPLY-AUTH-20260810-01`. Agent attempted Supabase CLI link to Development project `yayemzevflcnvxlfbrlf` and received **403 privileges** (same pattern as B2/B3/B4A). **No DDL was applied by the agent.** Owner manual SQL apply in the Development SQL Editor is required.

- Tables: `platform_transcript_captures`, `platform_transcript_segments`
- Modes: `full_session` \| `point_in_time` (no auto-merge)
- Confirmed text segments only; provisional/live spoken text **not** persisted
- Same-session capture→segment FK: `(capture_id, therapist_id, session_id) → captures(id, therapist_id, session_id)`
- Append to `listening` \| `paused` \| `stopped` (stopped = post-capture confirmation); session must be `in_progress` \| `paused` \| `closing`
- Six SECURITY DEFINER RPCs; B2 idempotency; SELECT-only authenticated table grants
- No raw audio / STT / live bar / contributions / archive / report / `platform_methodologies`
- **No Production apply; no push/deploy**

**Label:** `DEV APPLY AUTHORIZED — AGENT CLI BLOCKED (403) — AWAITING OWNER MANUAL APPLY`

---

## 2. Files created / modified

| Path | Action |
|------|--------|
| `supabase/migrations/20260810140000_radionics_platform_session_b4b_transcript_captures.sql` | **Created** / corrected; **committed** in `5786c89` |
| `scripts/validate-platform-session-f2-b4b.mjs` | **Created** / updated; **committed** in `5786c89` |
| `docs/Engine/Session/Platform_Session_F2_B4B_Local_Implementation_Report.md` | **Created** / updated (this file) — Dev apply block record |
| `package.json` | **Modified** earlier — `validate:platform-session-f2-b4b`; **committed** in `5786c89` |

**Not modified by this apply attempt:** SQL body, Product, AGENTS, UI, services, B1–B4A migrations.

---

## 3. Migration summary

### 3.1 `platform_transcript_captures`

- `capture_mode` / `status` CHECKs; consent flag; optional privacy label
- Composite session FK; optional same-session execution FK
- `UNIQUE (id, therapist_id)` and `UNIQUE (id, therapist_id, session_id)` (segment same-session FK target)
- Partial unique: one active `full_session` per session/therapist
- RLS SELECT-only; guard trigger; no audio columns

### 3.2 `platform_transcript_segments`

- Confirmed non-empty `text` only; inclusion editorial set
- **Same-session capture FK:** `(capture_id, therapist_id, session_id) → platform_transcript_captures(id, therapist_id, session_id)`
- Session FK; optional same-session execution FK
- Opaque provenance (RPC rejects audio URI keys)
- RLS SELECT-only; no hard-delete RPC

### 3.3 RPCs

| RPC | Purpose |
|-----|---------|
| `platform_start_transcript_capture` | Start listening capture (consent required) |
| `platform_pause_transcript_capture` | listening → paused |
| `platform_resume_transcript_capture` | paused → listening (same capture only) |
| `platform_stop_transcript_capture` | → stopped + `stopped_at` |
| `platform_append_transcript_segment` | Append confirmed text to `listening`\|`paused`\|`stopped` (stopped = post-capture confirmation); session must be `in_progress`\|`paused`\|`closing` |
| `platform_update_transcript_segment_inclusion` | Editorial inclusion only |

### 3.4 Append-to-stopped clarification

**Intended:** append of **confirmed** text to a `stopped` capture is allowed for post-capture confirmation/editing only. Provisional/live spoken text is never persisted. Session lifecycle must still be `in_progress` \| `paused` \| `closing`.

### 3.5 Explicit exclusions

No provisional/live text tables; no STT/audio/live bar; no notes/timeline changes; no contributions/archive/report; no `platform_methodologies`.

---

## 4. Development apply attempt

| Item | Value |
|------|--------|
| Environment designation | `RADIONICS-ENV-DESIGNATION-20260807-01` → **Development** |
| Apply authorization | `RADIONICS-F2-B4B-DEV-APPLY-AUTH-20260810-01` |
| Authorized artifact | `20260810140000_radionics_platform_session_b4b_transcript_captures.sql` |
| Local commit | `5786c89` |
| Agent application method | Supabase CLI `link --project-ref yayemzevflcnvxlfbrlf` |
| Agent result | **BLOCKED** — `403` privileges on Management API |
| Production apply | **No** |
| Data rows inserted by agent | **No** |
| UI / services / STT / audio / live bar / B4C+ | **No** |
| `platform_methodologies` | **Absent** (local artifact) |
| Push / deploy | **No** |

### Owner apply steps (required)

1. Open Development project SQL Editor (`yayemzevflcnvxlfbrlf`).
2. Run the full contents of `supabase/migrations/20260810140000_radionics_platform_session_b4b_transcript_captures.sql` as one transaction.
3. Run the post-apply verification pack below (read-only).
4. Paste results back so this report can be marked `B4B DEV APPLY VERIFIED`.

### Post-apply read-only verification pack (Owner)

```sql
-- b4b_tables_exist_and_rls_enabled
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('platform_transcript_captures', 'platform_transcript_segments')
order by 1;

-- b4b_select_policies_present
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('platform_transcript_captures', 'platform_transcript_segments')
order by tablename, policyname;

-- b4b_functions_present
select p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'platform_start_transcript_capture',
    'platform_pause_transcript_capture',
    'platform_resume_transcript_capture',
    'platform_stop_transcript_capture',
    'platform_append_transcript_segment',
    'platform_update_transcript_segment_inclusion',
    'platform_b4b_session_allows_transcript'
  )
order by 1, 2;

-- no_platform_methodologies
select to_regclass('public.platform_methodologies') is null as platform_methodologies_absent;

-- no_b4c_plus_or_audio_tables
select
  to_regclass('public.platform_report_contributions') is null
  and to_regclass('public.platform_session_archive_assemblies') is null
  and to_regclass('public.platform_sealed_session_archives') is null
  and to_regclass('public.platform_transcript_provisional') is null
  and to_regclass('public.platform_live_spoken_text') is null
  and to_regclass('public.platform_audio_blobs') is null
  as b4c_plus_and_audio_tables_absent;

-- no_audio_columns_on_b4b_tables
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('platform_transcript_captures', 'platform_transcript_segments')
  and (
    data_type = 'bytea'
    or column_name ilike '%audio%'
    or column_name ilike '%media_url%'
  )
order by 1, 2;

-- b4b_rows_empty
select 'platform_transcript_captures' as table_name, count(*)::int as row_count
from public.platform_transcript_captures
union all
select 'platform_transcript_segments', count(*)::int
from public.platform_transcript_segments;

-- b4b_expected_named_constraints
select conname
from pg_constraint
where conrelid in (
  'public.platform_transcript_captures'::regclass,
  'public.platform_transcript_segments'::regclass
)
  and conname like 'platform_transcript_%'
order by 1;

-- b4b_same_session_capture_fk_present
select conname, pg_get_constraintdef(oid) as def
from pg_constraint
where conname = 'platform_transcript_segments_capture_fk';

-- b4b_captures_id_therapist_session_unique_present
select conname, pg_get_constraintdef(oid) as def
from pg_constraint
where conname = 'platform_transcript_captures_id_therapist_session_unique';

-- b4b_same_session_execution_fks_present
select conname, pg_get_constraintdef(oid) as def
from pg_constraint
where conname in (
  'platform_transcript_captures_execution_fk',
  'platform_transcript_segments_execution_fk'
)
order by 1;

-- b4b_one_active_full_session_index_present
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and indexname = 'idx_platform_transcript_one_active_full_session';

-- b4b_guard_triggers_present
select tgrelid::regclass::text as table_name, tgname
from pg_trigger
where not tgisinternal
  and tgname in (
    'trg_platform_transcript_captures_guard_mutable',
    'trg_platform_transcript_segments_guard_mutable'
  )
order by 1;

-- b4b_rpc_execute_grants_authenticated
select
  p.proname,
  r.rolname,
  has_function_privilege(r.oid, p.oid, 'EXECUTE') as can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
cross join (values ('anon'), ('authenticated'), ('public')) as roles(rolname)
join pg_roles r on r.rolname = roles.rolname
where n.nspname = 'public'
  and p.proname in (
    'platform_start_transcript_capture',
    'platform_pause_transcript_capture',
    'platform_resume_transcript_capture',
    'platform_stop_transcript_capture',
    'platform_append_transcript_segment',
    'platform_update_transcript_segment_inclusion'
  )
order by p.proname, r.rolname;

-- b4b_no_client_dangerous_table_grants
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('platform_transcript_captures', 'platform_transcript_segments')
  and grantee in ('anon', 'authenticated', 'public')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
order by 1, 2, 3;

-- b4b_table_select_grants_authenticated
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('platform_transcript_captures', 'platform_transcript_segments')
  and grantee in ('anon', 'authenticated', 'public')
  and privilege_type = 'SELECT'
order by 1, 2;
```

| Check | Expected |
|-------|----------|
| `b4b_tables_exist_and_rls_enabled` | 2 rows, `rls_enabled = true` |
| `b4b_select_policies_present` | 2 SELECT policies (`*_select_own`) |
| `b4b_functions_present` | 7 functions (6 public RPCs + helper) |
| `no_platform_methodologies` | `true` |
| `no_b4c_plus_or_audio_tables` | `true` |
| `no_audio_columns_on_b4b_tables` | 0 rows |
| `b4b_rows_empty` | both `row_count = 0` |
| `b4b_expected_named_constraints` | 19 named `platform_transcript_*` constraints |
| `b4b_same_session_capture_fk_present` | FK `(capture_id, therapist_id, session_id) → …(id, therapist_id, session_id)` |
| `b4b_captures_id_therapist_session_unique_present` | `UNIQUE (id, therapist_id, session_id)` |
| `b4b_same_session_execution_fks_present` | 2 FKs |
| `b4b_one_active_full_session_index_present` | 1 partial unique index |
| `b4b_guard_triggers_present` | 2 triggers |
| `b4b_rpc_execute_grants_authenticated` | `authenticated=true`; `anon`/`public` = false (6 RPCs) |
| `b4b_no_client_dangerous_table_grants` | 0 rows |
| `b4b_table_select_grants_authenticated` | SELECT only for `authenticated` (2 tables) |

---

## 5. Validator (local static)

- **Command:** `npm run validate:platform-session-f2-b4b`
- **Assertions:** **92** passed / 0 failed (pre-apply local suite)
- Static SQL only — not a live PostgreSQL test

---

## 6. Local commands executed and results (pre-apply)

| Command | Result |
|---------|--------|
| `npm run validate:platform-session-f2-b4b` | PASSED (**92** assertions) |
| `npm run validate:platform-session-f2-b4a` | PASSED (61 assertions) |
| `npm run validate:platform-session-f2-b3` | PASSED (78 assertions) |
| `npm run validate:platform-session-f2-b2` | PASSED (82 assertions) |
| `npm run validate:platform-session-f2-b1` | PASSED (105 assertions) |
| `npm run validate:platform-session-f0-f1` | PASSED (151 assertions) |
| `npm run typecheck` | PASSED |
| `npm run lint` | PASSED |
| `npm run build` | PASSED |
| `node scripts/validate-v30d2-workflow-adapter.mjs` | PASSED (`ok: true`) |
| `git diff --check` (B4B paths) | PASSED |
| `npx supabase link --project-ref yayemzevflcnvxlfbrlf` | **FAILED** — 403 privileges |

---

## 7. Confirmations

- Dev apply **authorized** but **not executed by agent** (CLI 403)
- **No** Production apply
- **No** data rows inserted by agent
- **No** UI / services / STT / audio / live bar / B4C+
- **No** `platform_methodologies`
- **No** push / deploy
- Local code/migration already committed in `5786c89`

---

## 8. Stop line

**DEV APPLY AUTHORIZED — AGENT CLI BLOCKED (403) — AWAITING OWNER MANUAL APPLY**
