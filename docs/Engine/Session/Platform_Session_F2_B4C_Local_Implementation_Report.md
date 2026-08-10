# Platform Session F2 — Batch B4C Local Implementation Report

**Authorization consumed (local):** `RADIONICS-F2-B4C-LOCAL-AUTH-20260810-01`
**Apply authorization:** `RADIONICS-F2-B4C-DEV-APPLY-AUTH-20260810-01`
**Environment designation:** `RADIONICS-ENV-DESIGNATION-20260807-01` (Development)
**Design baseline:** `docs/Engine/Session/Platform_Session_F2_B4C_Pre_Implementation_Readiness.md` (OD-B4C-1…17 APPROVED)
**Status:** `DEV APPLY AUTHORIZED — AGENT CLI BLOCKED (403) — AWAITING OWNER MANUAL APPLY`
**Date:** 2026-08-10
**Scope:** Local B4C + authorized Development apply (agent cannot execute DDL on Dev project)
**Committed artifact:** `f5963b0`

---

## 1. Executive verdict

B4C local implementation prepared under `RADIONICS-F2-B4C-LOCAL-AUTH-20260810-01` and committed as `f5963b0`.

Development apply was authorized under `RADIONICS-F2-B4C-DEV-APPLY-AUTH-20260810-01`. Agent attempted Supabase CLI link to Development project `yayemzevflcnvxlfbrlf` and received **403 privileges** (same pattern as B2/B3/B4A/B4B). **No DDL was applied by the agent.** Owner manual SQL apply in the Development SQL Editor is required.

- Table: `platform_report_contributions`
- Narrow RPCs only: create-only (`structured_value` create-once), set inclusion, update display, attach provenance refs
- **No** `platform_upsert_report_contribution`; **no** general `structured_value` patch
- Same-session FKs to executions / notes / timeline / transcript capture / segment
- Additive `UNIQUE (id, therapist_id, session_id)` on notes, timeline, segments (FK targets; B4A/B4B files untouched)
- Optional `specialty_id` → `radionics_specialties`; **no** `platform_methodologies`
- Authenticated **SELECT-only**; RPC EXECUTE only for `authenticated`
- No archive/seal/templates/PDF/UI/services
- **No Production apply; no push/deploy**

**Label:** `DEV APPLY AUTHORIZED — AGENT CLI BLOCKED (403) — AWAITING OWNER MANUAL APPLY`

---

## 2. Files created / modified

| Path | Action |
|------|--------|
| `supabase/migrations/20260810160000_radionics_platform_session_b4c_report_contributions.sql` | **Created**; **committed** in `f5963b0` |
| `scripts/validate-platform-session-f2-b4c.mjs` | **Created**; **committed** in `f5963b0` |
| `docs/Engine/Session/Platform_Session_F2_B4C_Local_Implementation_Report.md` | **Created** / updated (this file) — Dev apply block record |
| `package.json` | **Modified** — `validate:platform-session-f2-b4c`; **committed** in `f5963b0` |

**Not modified by this apply attempt:** SQL body, Product, AGENTS, UI, services, B1–B4B migrations.

---

## 3. Migration summary

### 3.1 Additive parent unique targets

- `platform_session_notes_id_therapist_session_unique`
- `platform_timeline_events_id_therapist_session_unique`
- `platform_transcript_segments_id_therapist_session_unique`

### 3.2 `platform_report_contributions`

- Kinds / inclusion CHECKs; opaque `structured_value` + `provenance`
- Same-session provenance FKs; optional specialty catalogue FK
- `system_context` cannot be `included`
- RLS SELECT-only; guard trigger

### 3.3 RPCs

| RPC | Purpose |
|-----|---------|
| `platform_create_report_contribution` | Create-only; stores initial opaque `structured_value` |
| `platform_set_report_contribution_inclusion` | Inclusion only |
| `platform_update_report_contribution_display` | `human_readable_value` only |
| `platform_attach_report_contribution_provenance_refs` | Same-session refs only |

### 3.4 Explicit exclusions

No upsert/payload patch; no B5/B6; no UI/services; no therapeutic columns; no `platform_methodologies`.

---

## 4. Development apply attempt

| Item | Value |
|------|--------|
| Environment designation | `RADIONICS-ENV-DESIGNATION-20260807-01` → **Development** |
| Apply authorization | `RADIONICS-F2-B4C-DEV-APPLY-AUTH-20260810-01` |
| Authorized artifact | `20260810160000_radionics_platform_session_b4c_report_contributions.sql` |
| Local commit | `f5963b0` |
| Agent application method | Supabase CLI `link --project-ref yayemzevflcnvxlfbrlf` |
| Agent result | **BLOCKED** — `403` privileges on Management API |
| Production apply | **No** |
| Data rows inserted by agent | **No** |
| UI / services / B5 / B6 | **No** |
| `platform_methodologies` | **Absent** (local artifact) |
| Push / deploy | **No** |

### Owner apply steps (required)

1. Open Development project SQL Editor (`yayemzevflcnvxlfbrlf`).
2. Run the full contents of `supabase/migrations/20260810160000_radionics_platform_session_b4c_report_contributions.sql` as one transaction.
3. Run the post-apply verification pack below (read-only).
4. Paste results back so this report can be marked `B4C DEV APPLY VERIFIED`.

### Post-apply read-only verification pack (Owner)

```sql
-- b4c_table_exists_and_rls_enabled
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'platform_report_contributions';

-- b4c_select_policy_present
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'platform_report_contributions'
order by 1, 2, 3;

-- b4c_functions_present
select p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'platform_b4c_session_allows_contribution',
    'platform_b4c_contribution_json',
    'platform_create_report_contribution',
    'platform_set_report_contribution_inclusion',
    'platform_update_report_contribution_display',
    'platform_attach_report_contribution_provenance_refs'
  )
order by 1, 2;

-- no_platform_methodologies
select to_regclass('public.platform_methodologies') is null as no_platform_methodologies;

-- no_b5_b6_tables
select
  to_regclass('public.platform_session_archive_assemblies') is null
  and to_regclass('public.platform_sealed_session_archives') is null
  and to_regclass('public.platform_report_templates') is null
  and to_regclass('public.platform_report_projections') is null
  and to_regclass('public.platform_approved_report_renditions') is null
  as no_b5_b6_tables;

-- no_forbidden_rpcs
select count(*) = 0 as no_forbidden_rpcs
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'platform_upsert_report_contribution',
    'platform_patch_report_contribution',
    'platform_update_report_contribution_structured_value'
  );

-- b4c_rows_empty
select count(*)::bigint as row_count
from public.platform_report_contributions;

-- b4c_parent_unique_targets_present
select conname, conrelid::regclass::text as table_name
from pg_constraint
where conname in (
  'platform_session_notes_id_therapist_session_unique',
  'platform_timeline_events_id_therapist_session_unique',
  'platform_transcript_segments_id_therapist_session_unique'
)
order by 1;

-- b4c_expected_named_constraints
select conname
from pg_constraint
where conrelid = 'public.platform_report_contributions'::regclass
  and conname like 'platform_report_contributions_%'
order by 1;

-- b4c_same_session_fks_present
select conname, pg_get_constraintdef(oid) as def
from pg_constraint
where conrelid = 'public.platform_report_contributions'::regclass
  and contype = 'f'
  and conname in (
    'platform_report_contributions_execution_fk',
    'platform_report_contributions_note_fk',
    'platform_report_contributions_timeline_event_fk',
    'platform_report_contributions_transcript_capture_fk',
    'platform_report_contributions_transcript_segment_fk'
  )
order by 1;

-- b4c_specialty_fk_to_radionics_specialties
select
  c.conname,
  confrelid::regclass::text as referenced_table
from pg_constraint c
join pg_attribute a
  on a.attrelid = c.conrelid
 and a.attnum = any (c.conkey)
where c.conrelid = 'public.platform_report_contributions'::regclass
  and c.contype = 'f'
  and a.attname = 'specialty_id';

-- b4c_guard_trigger_present
select tgrelid::regclass::text as table_name, tgname
from pg_trigger
where not tgisinternal
  and tgname = 'trg_platform_report_contributions_guard_mutable';

-- b4c_rpc_execute_grants_authenticated
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
    'platform_create_report_contribution',
    'platform_set_report_contribution_inclusion',
    'platform_update_report_contribution_display',
    'platform_attach_report_contribution_provenance_refs'
  )
order by p.proname, r.rolname;

-- b4c_no_client_dangerous_table_grants
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'platform_report_contributions'
  and grantee in ('anon', 'authenticated', 'public')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
order by 1, 2, 3;

-- b4c_table_select_grants_authenticated
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'platform_report_contributions'
  and grantee in ('anon', 'authenticated', 'public')
  and privilege_type = 'SELECT'
order by 1, 2;
```

| Check | Expected |
|-------|----------|
| `b4c_table_exists_and_rls_enabled` | 1 row, `rls_enabled = true` |
| `b4c_select_policy_present` | 1 SELECT policy (`platform_report_contributions_select_own`) |
| `b4c_functions_present` | 6 functions (4 public RPCs + 2 helpers) |
| `no_platform_methodologies` | `true` |
| `no_b5_b6_tables` | `true` |
| `no_forbidden_rpcs` | `true` |
| `b4c_rows_empty` | `row_count = 0` |
| `b4c_parent_unique_targets_present` | 3 named UNIQUE constraints |
| `b4c_expected_named_constraints` | named `platform_report_contributions_*` constraints present |
| `b4c_same_session_fks_present` | 5 provenance FKs |
| `b4c_specialty_fk_to_radionics_specialties` | FK → `radionics_specialties` |
| `b4c_guard_trigger_present` | 1 trigger |
| `b4c_rpc_execute_grants_authenticated` | `authenticated=true`; `anon`/`public` = false (4 RPCs) |
| `b4c_no_client_dangerous_table_grants` | 0 rows |
| `b4c_table_select_grants_authenticated` | SELECT only for `authenticated` |

---

## 5. Validator (local static)

- **Command:** `npm run validate:platform-session-f2-b4c`
- **Assertions:** **69** passed / 0 failed (pre-apply local suite)
- Static SQL only — not a live PostgreSQL test

---

## 6. Local commands executed and results (pre-apply)

| Command | Result |
|---------|--------|
| `npm run validate:platform-session-f2-b4c` | PASSED (**69** assertions) |
| `npm run validate:platform-session-f2-b4b` | PASSED (92 assertions) |
| `npm run validate:platform-session-f2-b4a` | PASSED (61 assertions) |
| `npm run validate:platform-session-f2-b3` | PASSED (78 assertions) |
| `npm run validate:platform-session-f2-b2` | PASSED (82 assertions) |
| `npm run validate:platform-session-f2-b1` | PASSED (105 assertions) |
| `npm run validate:platform-session-f0-f1` | PASSED (151 assertions) |
| `npm run typecheck` | PASSED |
| `npm run lint` | PASSED |
| `npm run build` | PASSED |
| `node scripts/validate-v30d2-workflow-adapter.mjs` | PASSED (`ok: true`) |
| `git diff --check` (B4C paths) | PASSED |
| `npx supabase link --project-ref yayemzevflcnvxlfbrlf` | **FAILED** — 403 privileges |

---

## 7. Confirmations

- Dev apply **authorized** but **not executed by agent** (CLI 403)
- **No** Production apply
- **No** data rows inserted by agent
- **No** UI / services / B5 / B6
- **No** `platform_methodologies`
- **No** push / deploy
- Local code/migration already committed in `f5963b0`

---

## 8. Stop line

**DEV APPLY AUTHORIZED — AGENT CLI BLOCKED (403) — AWAITING OWNER MANUAL APPLY**
