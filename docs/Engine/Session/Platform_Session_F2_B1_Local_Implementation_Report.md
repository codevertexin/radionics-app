# Platform Session F2 — Batch B1 Local Implementation Report

**Authorization consumed:** `RADIONICS-F2-B1-LOCAL-AUTH-20260807-01`  
**Status:** `READY FOR OWNER REVIEW — NOT APPLIED TO SUPABASE`  
**Date:** 2026-08-07  
**Scope:** Local additive migration preparation + static validator only  
**Correction pass:** identity immutability, server-owned timestamps/`row_revision`, reinforced lifecycle coherence, permanent guard function name  
**Final correction:** cancelled after closing cycle; `cancellation_reason` exclusive to cancelled; canonical B2+ validator list

---

## 1. Executive verdict

Batch B1 remains **local only**: one additive migration for `platform_clients`, `platform_sessions`, and `platform_command_idempotency`, plus a static validator and this report.

- Migration **not applied** to any Supabase project (Development or Production).
- No `supabase db push` / `migration up` / `db reset` / remote SQL.
- No B2+ tables, RPCs, UI, or application services.
- No commit / push / deploy.

**Label:** `B1 LOCAL FINAL CORRECTION COMPLETE — READY FOR OWNER REVIEW — NOT APPLIED`

---

## 2. Pre-implementation inventory

### 2.1 Worktree (not cleaned)

Unrelated dirty changes were left untouched (docs moves, wizard/workspace/services). B1 work did not modify, stage, restore, or format those files.

### 2.2 Latest migration convention

- Path: `supabase/migrations/`
- Naming: `YYYYMMDDHHMMSS_radionics_*.sql`
- Most recent prior migration: `20260615000000_radionics_workflow_engine_schema_v3_0b.sql`
- B1 migration timestamp chosen: `20260807120000` (after latest; no collision)

### 2.3 Existing helpers (reused / not duplicated)

| Helper | Source | B1 usage |
|--------|--------|----------|
| `is_radionics_admin()` | `20260531120000_radionics_specialties_phase1.sql` | **Not** used for cross-write on B1 tables (no silent admin mutation) |
| `auth.uid()` ownership | certifications / specialty patterns | RLS `therapist_id = auth.uid()` |
| `set_updated_at()` | same phase1 migration | **Not** altered; B1 uses permanent `platform_guard_mutable_owned_row()` |
| Cert helpers (`has_approved_specialty_certification`) | methodology migrations | Deferred — start/cert gates need B2 |
| Grants pattern | function-level `revoke`/`grant execute` | Table grants follow existing repo pattern (RLS policies; no new `service_role` table grants) |

### 2.4 B1 tables prior existence

Static search of `supabase/migrations/*.sql`: **no** prior `platform_clients`, `platform_sessions`, or `platform_command_idempotency`.

### 2.5 Concurrent migration name/timestamp

`20260807120000_radionics_platform_session_b1_core.sql` did not exist before this batch.

### 2.6 F0/F1 enum confirmation (code)

From `src/platform/session/types.ts` / `lifecycle.ts`:

- **Lifecycle:** `draft | in_progress | paused | closing | completed | cancelled`
- **Forbidden on platform session:** `reported` (legacy-only)
- **SessionMode:** `presential | online | distance`

CHECK constraints mirror these exact values. No new transitions invented.

---

## 3. Files created / modified (B1 scope only)

| Path | Action |
|------|--------|
| `supabase/migrations/20260807120000_radionics_platform_session_b1_core.sql` | **Created** (then corrected in-place; never applied) |
| `scripts/validate-platform-session-f2-b1.mjs` | **Created** / updated for correction assertions |
| `docs/Engine/Session/Platform_Session_F2_B1_Local_Implementation_Report.md` | **Created** / updated for correction pass |
| `package.json` | **Modified** earlier — `validate:platform-session-f2-b1` script only (unchanged in correction) |

**Not modified:** Product 00–04, AGENTS, F2 readiness v1.2, F0/F1 contracts, UI, WorkspacePage, wizard, app services, MAP/35/49, resources/workflows, prior migrations, remote Supabase.

---

## 4. Migration prepared

**File:** `supabase/migrations/20260807120000_radionics_platform_session_b1_core.sql`

### 4.1 Guard function (permanent name)

`public.platform_guard_mutable_owned_row()` — temporary name `platform_b1_guard_mutable_owned_row` **removed** (never applied; no alias kept).

**INSERT (server-owned):**

```sql
new.row_revision := 1;
new.created_at := now();
new.updated_at := now();
```

No `coalesce` with client-supplied values.

**UPDATE (fail-closed immutable identity):**

- Reject changes to `id`, `therapist_id`, `created_at` (`check_violation`)
- Always: `new.row_revision := old.row_revision + 1;`
- Always: `new.updated_at := now();`
- Client-supplied `row_revision` / `updated_at` ignored

### 4.2 `platform_clients`

- Therapist-owned identity profile columns as authorized.
- `UNIQUE (id, therapist_id)` for composite ownership.
- Non-empty trim CHECKs on required text fields; conservative optional contact CHECKs.
- Indexes: `(therapist_id)`, `(therapist_id, display_name)`.
- Trigger uses `platform_guard_mutable_owned_row`.
- RLS: owner SELECT/INSERT/UPDATE/DELETE; `WITH CHECK` keeps `therapist_id = auth.uid()`.
- DELETE naturally blocked when sessions exist via sessions FK `ON DELETE RESTRICT`.

### 4.3 `platform_sessions`

- Session core columns including `active_timer_started_at` and `accumulated_active_duration_ms`.
- **`active_execution_id` absent** (deferred to B3 — see §6).
- Composite FK `(client_id, therapist_id) → platform_clients(id, therapist_id) ON DELETE RESTRICT`.
- Lifecycle / session_mode CHECKs exact to F0/F1; `'reported'` not allowed.
- **Reinforced coherence CHECK** (`platform_sessions_lifecycle_timer_coherence`):

| Status | Requirements |
|--------|----------------|
| `draft` | `started_at`, timer, `closing_entered_at`, terminals, `cancellation_reason` all NULL |
| `in_progress` | `started_at` NOT NULL; timer NOT NULL; terminals NULL; `cancellation_reason` NULL (`closing_entered_at` optional after return from closing) |
| `paused` | `started_at` NOT NULL; timer NULL; terminals NULL; `cancellation_reason` NULL (`closing_entered_at` may remain) |
| `closing` | `started_at` + `closing_entered_at` NOT NULL; timer NULL; terminals NULL; `cancellation_reason` NULL |
| `completed` | `started_at` + `closing_entered_at` + `completed_at` NOT NULL; `cancelled_at` NULL; timer NULL; `cancellation_reason` NULL |
| `cancelled` | `cancelled_at` NOT NULL; `completed_at` NULL; timer NULL; `cancellation_reason` optional; `closing_entered_at` may remain after `closing → in_progress → cancelled`; if `closing_entered_at` is set then `started_at` must be set; `started_at` may be NULL when cancelled directly from `draft` |

**Final correction note:** The F0/F1 matrix allows `in_progress → closing → in_progress → cancelled`. Therefore `closing_entered_at` is historical and may stay populated on cancelled rows. It is **not** forced NULL on cancelled. Transition matrix unchanged (`closing → cancelled` still forbidden).

- Indexes: `(therapist_id, updated_at DESC)`, `(client_id, therapist_id)`, `(lifecycle_status)`.
- RLS: owner SELECT; INSERT only as owned `draft` with zero duration and null therapeutic timestamps / timer; **no** therapist UPDATE/DELETE policies.

### 4.4 `platform_command_idempotency`

- Dedup store with `UNIQUE (therapist_id, idempotency_key)` and `UNIQUE (id, therapist_id)`.
- Optional composite FK `(session_id, therapist_id) → platform_sessions` (`MATCH SIMPLE` allows null `session_id`).
- `response_status ∈ {accepted, conflict, failed}`; `expires_at > created_at`; default retention `now() + 7 days`.
- Indexes: `(expires_at)`, `(therapist_id, created_at DESC)`.
- RLS: owner SELECT only; **no** therapist INSERT/UPDATE/DELETE; **no** admin cross-write policies.

### 4.5 Security decisions

1. Browser cannot choose `created_at` / `updated_at` / `row_revision` on guarded tables.
2. `id` / `therapist_id` / `created_at` immutable on UPDATE.
3. Browser cannot mutate session lifecycle, timer, or therapeutic timestamps directly.
4. Idempotency writes deferred to authorized RPCs.
5. No `service_role` usage in this migration.
6. No incomplete lifecycle RPCs created.
7. Admin does not receive silent cross-write on B1 tables.

---

## 5. Deferrals (B2 / B3)

| Item | Deferred to | Reason |
|------|-------------|--------|
| `platform_sessions.active_execution_id` + FK | **B3** | `platform_methodology_executions` does not exist until B3 |
| `platform_methodology_executions`, active-execution unique index, `activate_execution` | **B3** | Execution domain batch |
| Testimony snapshots, plan items, cert eligibility on start | **B2** | Start-session requires testimony + plan |
| Lifecycle RPCs | **B2+** | Would be incomplete without B2 artefacts |
| Seal / archive / report RPCs | Later batches | Out of B1 |
| Idempotency purge job | Later | Explicitly out of B1 |
| F2 readiness v1.2 text edits | **Not done** | Baseline checkpoint `d65f879` untouched |

---

## 6. Validator

- **Script:** `scripts/validate-platform-session-f2-b1.mjs`
- **Command:** `npm run validate:platform-session-f2-b1`
- **Assertions:** **88** passed / 0 failed
- Includes original B1 coverage plus correction checks:
  1. INSERT forces `created_at = now()`
  2. INSERT forces `updated_at = now()`
  3. INSERT forces `row_revision = 1`
  4. UPDATE rejects `id` changes
  5. UPDATE rejects `therapist_id` changes
  6. UPDATE rejects `created_at` changes
  7. UPDATE forces `row_revision` increment
  8. UPDATE forces `updated_at = now()`
  9–14. Reinforced per-status lifecycle coherence (incl. cancelled after closing cycle)
  15. Old `platform_b1_guard_mutable_owned_row` absent
  16. Permanent `platform_guard_mutable_owned_row` present
  17. Exactly three `CREATE TABLE` declarations
  18. Canonical B2+ table names absent (testimony, plan, executions, notes, transcript captures/segments, timeline events, contributions, archive assemblies, sealed archives, report templates/projections/approved renditions, `platform_methodologies`)
  19. `cancellation_reason` NULL on all non-cancelled states; optional on cancelled
  20. Cancelled allows historical `closing_entered_at` when `started_at` is set

### Limitation (mandatory)

Static SQL inspection **does not** replace live PostgreSQL tests. No database connection was opened.

---

## 7. Commands executed and results (final correction pass)

| Command | Result |
|---------|--------|
| `npm run validate:platform-session-f2-b1` | **PASSED** — 88 assertions |
| `npm run validate:platform-session-f0-f1` | **PASSED** — 151 assertions |
| `npm run typecheck` | **PASSED** |
| `npm run lint` | **PASSED** |
| `npm run build` | **PASSED** |
| `node scripts/validate-v30d2-workflow-adapter.mjs` | **PASSED** (`ok: true`) |
| `git diff --check` (B1 paths only) | **PASSED** |

**Not executed (forbidden):** `supabase db push`, `migration up`, `db reset`, `supabase start`, remote `psql`, remote type generation, remote smoke, deploy, commit, push.

---

## 8. Confirmations

- Zero Supabase connections from this batch / correction.
- Zero Development / Production writes.
- B2+ not started.
- No UI / methodology / Product / AGENTS / F2 v1.2 / F0–F1 contract edits.
- No commit / push / deploy.
- Checkpoints preserved: `401b5b8` (F0/F1), `c273306` (Product governance), `d65f879` (F2 v1.2).

---

## 9. Dirty worktree separation

### B1 scope (this authorization)

```
M  package.json
?? scripts/validate-platform-session-f2-b1.mjs
?? supabase/migrations/20260807120000_radionics_platform_session_b1_core.sql
?? docs/Engine/Session/Platform_Session_F2_B1_Local_Implementation_Report.md
```

### Unrelated dirty (pre-existing; not part of B1)

Includes relocated docs and wizard/workspace/service changes. Left as-is.

---

## 10. Stop line

**B1 LOCAL FINAL CORRECTION COMPLETE — READY FOR OWNER REVIEW — NOT APPLIED**
