# Platform Session F2 — Batch B1 Local Implementation Report

**Authorization consumed:** `RADIONICS-F2-B1-LOCAL-AUTH-20260807-01`  
**Apply authorization:** `RADIONICS-F2-B1-DEV-APPLY-20260807-01`  
**Grants correction authorization:** `RADIONICS-F2-B1-DEV-GRANTS-CORRECTION-20260807-01`  
**Environment designation:** `RADIONICS-ENV-DESIGNATION-20260807-01` (Development)  
**Status:** `B1 DEV APPLIED + GRANTS HARDENING RECONCILED LOCALLY — NOT PUSHED / NOT DEPLOYED`  
**Date:** 2026-08-07  
**Scope:** B1 core (committed + applied in Dev) + additive grants-hardening migration reconciled in repo  
**Correction pass:** identity immutability, server-owned timestamps/`row_revision`, reinforced lifecycle coherence, permanent guard function name  
**Final correction:** cancelled after closing cycle; `cancellation_reason` exclusive to cancelled; canonical B2+ validator list  
**Grants reconciliation:** additive migration mirrors authorized Dev corrective transaction

---

## 1. Executive verdict

Batch B1 core was prepared locally, committed, and **manually applied** to the designated RADIONICS Development project. Supabase default grants were then corrected under a separate grants-correction authorization. This repository reconciliation adds the matching additive migration and validator/report updates **without** modifying the already-applied core migration file.

- Original core migration **unchanged** in git and matches applied SHA-256 `410a5ca0130dac8e364c017fa02b3185fafa1c2fc3d9af07d0e5e06228a36835`.
- Additive grants-hardening migration prepared locally for history/replay alignment.
- This agent task made **no** Supabase connection or write.
- No B2+, UI, methodology behavior, push, or deploy.

**Label:** `B1 GRANTS HARDENING RECONCILIATION COMPLETE — READY FOR OWNER REVIEW — NO SUPABASE WRITE FROM THIS TASK`

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

## 3. Files created / modified (B1 scope)

| Path | Action |
|------|--------|
| `supabase/migrations/20260807120000_radionics_platform_session_b1_core.sql` | **Created** earlier; **committed**; **applied in Dev**; **not modified** by grants reconciliation |
| `supabase/migrations/20260807124000_radionics_platform_session_b1_grants_hardening.sql` | **Created** (grants reconciliation) |
| `scripts/validate-platform-session-f2-b1.mjs` | **Updated** — validates core + grants migrations |
| `docs/Engine/Session/Platform_Session_F2_B1_Local_Implementation_Report.md` | **Updated** — Dev apply + grants correction record |
| `package.json` | **Modified** earlier — `validate:platform-session-f2-b1` script only (unchanged in grants pass) |

**Not modified:** Product 00–04, AGENTS, F2 readiness v1.2, F0/F1 contracts, UI, WorkspacePage, wizard, app services, MAP/35/49, resources/workflows, prior migrations (except additive grants file), remote Supabase from this task.

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
5. No `service_role` usage in B1 core migration.
6. No incomplete lifecycle RPCs created.
7. Admin does not receive silent cross-write on B1 tables.

### 4.6 Grants hardening (additive)

**File:** `supabase/migrations/20260807124000_radionics_platform_session_b1_grants_hardening.sql`

Operational matrix (matches authorized Dev corrective transaction):

1. `REVOKE ALL` on each B1 table from `public`, `anon`, `authenticated`
2. `GRANT SELECT, INSERT, UPDATE, DELETE` on `platform_clients` → `authenticated`
3. `GRANT SELECT, INSERT` on `platform_sessions` → `authenticated`
4. `GRANT SELECT` on `platform_command_idempotency` → `authenticated`
5. **No** revoke/modify of `service_role`
6. **No** `GRANT` to `anon`
7. **No** `TRUNCATE` / `TRIGGER` / `REFERENCES` granted to `authenticated`

---

## 5. Development apply + grants correction record

| Item | Value |
|------|--------|
| Environment designation | `RADIONICS-ENV-DESIGNATION-20260807-01` → **Development** |
| Apply authorization | `RADIONICS-F2-B1-DEV-APPLY-20260807-01` |
| Grants correction authorization | `RADIONICS-F2-B1-DEV-GRANTS-CORRECTION-20260807-01` |
| Applied core artifact | `20260807120000_radionics_platform_session_b1_core.sql` |
| Applied SHA-256 | `410a5ca0130dac8e364c017fa02b3185fafa1c2fc3d9af07d0e5e06228a36835` |
| Application method | Manual authorized SQL transaction (succeeded) |
| `supabase_migrations.schema_migrations` | **Unavailable** — not used for history tracking |
| auth / realtime / storage migration tables | Internal Supabase tables — **not used** |
| Post-apply structural verification | tables/columns PASS; RLS 3/3 PASS; policies 7 PASS; constraints **38** PASS; indexes 14 PASS; triggers 2 PASS; rows 0/0/0 PASS |
| Constraint count note | Initial expectation **37** was a validator-query counting error; **correct total is 38** |
| Default grants issue | Supabase defaults exposed excessive privileges to `anon`/`authenticated` (incl. `TRUNCATE`) |
| Grants correction | Authorized corrective transaction applied successfully in Development |
| Exact-grant verification | **42 checks, 0 mismatches** PASS |
| Row counts after correction | still **0 / 0 / 0** |
| Out of scope | No B2+, UI, methodology behavior, push, or deploy |

---

## 6. Deferrals (B2 / B3)

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

## 7. Validator

- **Script:** `scripts/validate-platform-session-f2-b1.mjs`
- **Command:** `npm run validate:platform-session-f2-b1`
- **Assertions:** **105** passed / 0 failed
- Validates **both**:
  - `20260807120000_radionics_platform_session_b1_core.sql`
  - `20260807124000_radionics_platform_session_b1_grants_hardening.sql`
- Grants assertions: anon receives no grants; exact authenticated matrix; no TRUNCATE/TRIGGER/REFERENCES grants; `service_role` not referenced by REVOKE; constraint composition totals **38** (32 named + 3 PK + 3 `auth.users` FK).
- Remains static/local — **no** Supabase connection.

### Limitation (mandatory)

The local validator performs static SQL inspection only and does not replace live PostgreSQL tests. PostgreSQL runtime behaviour is evidenced separately by the authorized Development apply and the recorded read-only post-apply catalogue and grants verifications; no database connection was opened by this local reconciliation task.

---

## 8. Commands executed and results (grants reconciliation pass)

| Command | Result |
|---------|--------|
| `npm run validate:platform-session-f2-b1` | **PASSED** — 105 assertions |
| `npm run validate:platform-session-f0-f1` | **PASSED** — 151 assertions |
| `npm run typecheck` | **PASSED** |
| `npm run lint` | **PASSED** |
| `npm run build` | **PASSED** |
| `node scripts/validate-v30d2-workflow-adapter.mjs` | **PASSED** (`ok: true`) |
| `git diff --check` (grants-reconciliation paths) | **exit 0** — markdown hard-break trailing-space notices on report header lines only |

**Not executed by this task:** any Supabase CLI/API connection, `db push`, `migration up`, `db reset`, remote `psql`, commit, push, deploy.

---

## 9. Confirmations

- Original applied core migration file **not modified**.
- This reconciliation task: zero Supabase connections / writes.
- B2+ not started; no UI / methodology / Product / AGENTS edits.
- No commit / push / deploy in this task.
- Checkpoints preserved: `401b5b8`, `c273306`, `d65f879`, plus B1 commit `d0b9f02`.

---

## 10. Dirty worktree separation

### Grants reconciliation scope

```
M  scripts/validate-platform-session-f2-b1.mjs
M  docs/Engine/Session/Platform_Session_F2_B1_Local_Implementation_Report.md
?? supabase/migrations/20260807124000_radionics_platform_session_b1_grants_hardening.sql
```

### Unrelated dirty (pre-existing; not part of this task)

Docs relocation and wizard/workspace/service changes. Left as-is.

---

## 11. Stop line

**B1 GRANTS HARDENING RECONCILIATION COMPLETE — READY FOR OWNER REVIEW — NO SUPABASE WRITE FROM THIS TASK**
