# Platform Session F2 — Batch B2 Local Implementation Report

**Authorization consumed:** `RADIONICS-F2-B2-LOCAL-AUTH-20260809-01`
**Apply authorization:** `RADIONICS-F2-B2-DEV-APPLY-AUTH-20260809-01`
**Environment designation:** `RADIONICS-ENV-DESIGNATION-20260807-01` (Development)
**Design baseline:** `docs/Engine/Session/Platform_Session_F2_B2_Pre_Implementation_Readiness.md` (APPROVED design; OD-B2-1…10)
**Status:** `B2 DEV APPLIED + RPC GRANTS HARDENING RECONCILED LOCALLY — NOT PUSHED / NOT DEPLOYED`
**Date:** 2026-08-09
**Scope:** B2 core (committed + Owner-applied in Dev) + additive RPC grants-hardening migration reconciled in repo

---

## 1. Executive verdict

B2 core was prepared locally, committed, and **manually applied by Owner** to the designated RADIONICS Development project. Post-apply read-only verification detected **anon EXECUTE** on the four public B2 RPCs. Owner then applied a corrective hardening transaction; final read-only verification passed (`b2_exact_rpc_execute_grants` — missing=0, unexpected=0).

This repository reconciliation adds the matching additive RPC grants-hardening migration and validator/report updates **without** modifying the already-applied core B2 migration file and **without** opening a Supabase connection from this task.

- Core: tables + SECURITY DEFINER RPCs + SELECT-only table grants
- Hardening: revoke EXECUTE from `public`/`anon`/`authenticated`, then grant EXECUTE only to `authenticated` on the four B2 RPCs
- No `platform_methodologies`; no B3+; no UI/services
- No Production apply; no push/deploy

**Label:** `B2 DEV APPLY VERIFIED AFTER RPC GRANTS HARDENING — LOCAL RECONCILIATION COMPLETE`

---

## 2. Files created / modified

| Path | Action |
|------|--------|
| `supabase/migrations/20260809170000_radionics_platform_session_b2_testimony_plan_rpcs.sql` | **Created** earlier; **committed**; **applied in Dev by Owner**; **not modified** by grants reconciliation |
| `supabase/migrations/20260809173000_radionics_platform_session_b2_rpc_grants_hardening.sql` | **Created** (RPC grants reconciliation) |
| `scripts/validate-platform-session-f2-b2.mjs` | **Updated** — validates core + RPC grants migrations |
| `docs/Engine/Session/Platform_Session_F2_B2_Local_Implementation_Report.md` | **Updated** — Dev apply + RPC grants hardening record |
| `package.json` | **Modified** earlier — `validate:platform-session-f2-b2` script only |

**Not modified:** B1 migrations, Product 00–04, AGENTS, F2 v1.2, B2 readiness (design doc), UI, services, F0/F1 contracts.

---

## 3. Migration summary

### 3.1 `platform_client_testimony_snapshots`

- Immutable testimony; `UNIQUE (session_id)`; composite FKs to sessions + clients
- `identity` jsonb (Product 03 / F1 camelCase fields)
- RLS: owner SELECT only; no write policies
- Grants: SELECT to authenticated only

### 3.2 `platform_session_plan_items`

- `specialty_id NOT NULL` → `radionics_specialties`
- Snapshot fields reconciled from specialty in upsert RPC
- Partial unique: one `primary` per session (OD-B2-5)
- RLS: owner SELECT only; no write policies
- Grants: SELECT to authenticated only
- Trigger: `platform_guard_mutable_owned_row`

### 3.3 RPCs

| RPC | Purpose |
|-----|---------|
| `platform_patch_session_draft_context` | Draft-only intention / schedule / mode patch |
| `platform_upsert_session_plan_item` | Create/update plan item; cert-gated; draft-only |
| `platform_delete_session_plan_item` | Delete plan item; draft-only |
| `platform_start_session` | `draft → in_progress`; insert testimony; set timer fields; **re-check primary cert at transaction time** |

All use concurrency-safe idempotency:
1. `INSERT … pending` under `UNIQUE (therapist_id, idempotency_key)` (`ON CONFLICT DO NOTHING`)
2. Contenders `SELECT … FOR UPDATE` and replay finalized bodies (fingerprint mismatch fail-closed)
3. Abandoned `pending` claims may be taken over after lock wait
4. Winner `UPDATE`s pending → `accepted` via `platform_b2_finalize_idempotency`
5. Exceptions mark the claim `failed` via `platform_b2_fail_idempotency_claim`

`response_status` CHECK extended additively to include `pending`.

### 3.4 Explicit exclusions

No executions, `active_execution_id`, notes, transcript, timeline, archive, reports, `platform_methodologies`.

### 3.5 RPC grants hardening (additive)

**File:** `supabase/migrations/20260809173000_radionics_platform_session_b2_rpc_grants_hardening.sql`

Operational matrix (matches Owner-applied Dev corrective transaction):

1. `BEGIN` / `COMMIT` wrapper
2. `REVOKE ALL` on each of the four exact B2 RPC signatures from `public`, `anon`, `authenticated`
3. `GRANT EXECUTE` on each of the four exact B2 RPC signatures → `authenticated`
4. **No** table create/alter/drop
5. **No** row data changes
6. **No** revoke/modify of `service_role`
7. **No** `GRANT` to `anon`

Exact signatures:

- `platform_patch_session_draft_context(uuid, text, text, timestamptz, text, text, boolean, boolean, boolean)`
- `platform_upsert_session_plan_item(uuid, uuid, text, integer, text, uuid)`
- `platform_delete_session_plan_item(uuid, uuid, text)`
- `platform_start_session(uuid, text)`

---

## 4. Development apply + RPC grants correction record

| Item | Value |
|------|--------|
| Environment designation | `RADIONICS-ENV-DESIGNATION-20260807-01` → **Development** |
| Apply authorization | `RADIONICS-F2-B2-DEV-APPLY-AUTH-20260809-01` |
| Applied core artifact | `20260809170000_radionics_platform_session_b2_testimony_plan_rpcs.sql` |
| Application method | **Manual** SQL transaction by Owner (succeeded) |
| Post-apply finding | **anon EXECUTE** present on the four B2 public RPCs |
| Hardening method | Manual corrective SQL by Owner (succeeded) |
| Final read-only verification | `b2_exact_rpc_execute_grants` **PASS** — missing=0, unexpected=0 |
| Repo reconciliation | Additive migration mirrors Dev hardening; **no** Supabase connection from this task |
| Out of scope | No Production; no UI/services/B3+; no push/deploy |

---

## 5. Validator

- **Command:** `npm run validate:platform-session-f2-b2`
- **Assertions:** **82** passed / 0 failed
- Validates **both**:
  - `20260809170000_radionics_platform_session_b2_testimony_plan_rpcs.sql`
  - `20260809173000_radionics_platform_session_b2_rpc_grants_hardening.sql`
- RPC grants assertions: migration exists; BEGIN/COMMIT; revoke from `public`/`anon`/`authenticated`; grant EXECUTE only to `authenticated`; no create/drop/alter tables; references only the four B2 public RPCs
- Static SQL only — not a live PostgreSQL test

### Correction note (idempotency concurrency)

Initial B2 local draft checked for an existing idempotency row without claiming the key. Concurrent same-key calls could both pass and race. Corrected to pending-claim + `FOR UPDATE` + finalize/fail before Owner apply.

---

## 6. Commands executed and results (RPC grants reconciliation pass)

| Command | Result |
|---------|--------|
| `npm run validate:platform-session-f2-b2` | **PASSED** — **82** assertions |
| `npm run validate:platform-session-f2-b1` | **PASSED** — 105 |
| `npm run validate:platform-session-f0-f1` | **PASSED** — 151 |
| `npm run typecheck` | **PASSED** |
| `npm run lint` | **PASSED** |
| `npm run build` | **PASSED** |
| `node scripts/validate-v30d2-workflow-adapter.mjs` | **PASSED** (`ok: true`) |
| `git diff --check` (B2 paths) | **PASSED** |

**Not executed by this task:** any Supabase connection/write, commit, push, deploy.

---

## 7. Confirmations

- This task only reconciled **local files** with the manual Dev hardening already applied by Owner
- Zero Supabase connections/writes from this task
- Original applied core B2 migration **not modified**
- No UI / services / B3+ / Product / AGENTS edits
- No Production apply; no push / deploy
- Dirty unrelated worktree left intact

---

## 8. Stop line

**B2 DEV APPLY VERIFIED AFTER RPC GRANTS HARDENING — LOCAL RECONCILIATION COMPLETE — NO SUPABASE WRITE FROM THIS TASK**
