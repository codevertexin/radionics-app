# Platform Session F2 — Batch B3 Local Implementation Report

**Authorization consumed:** `RADIONICS-F2-B3-LOCAL-AUTH-20260809-01`
**Apply authorization:** `RADIONICS-F2-B3-DEV-APPLY-AUTH-20260809-01`
**Environment designation:** `RADIONICS-ENV-DESIGNATION-20260807-01` (Development)
**Design baseline:** `docs/Engine/Session/Platform_Session_F2_B3_Pre_Implementation_Readiness.md` (OD-B3-1…15 APPROVED as design)
**Status:** `B3 DEV APPLY VERIFIED — READY FOR OWNER ACCEPTANCE`
**Date:** 2026-08-09
**Scope:** B3 core (committed + Owner-applied in Dev) + local validator/report
**Committed artifact:** `1964abb`

---

## 1. Executive verdict

B3 local implementation was prepared under `RADIONICS-F2-B3-LOCAL-AUTH-20260809-01`, committed as `1964abb`, and **manually applied by Owner** to the designated RADIONICS Development project under `RADIONICS-F2-B3-DEV-APPLY-AUTH-20260809-01`. Post-apply read-only verification **PASSED**.

- Table: `platform_methodology_executions` (`specialty_id` → `radionics_specialties`; optional `plan_item_id`)
- Column: `platform_sessions.active_execution_id` + same-session composite FK `(id, therapist_id, active_execution_id) → executions(session_id, therapist_id, id)`
- Partial unique: one `active` execution per session; one `primary` execution per session
- OD-B3-13 deferred coherence trigger: pointer NULL iff no `status=active`; otherwise pointer equals that unique active id
- RPCs (SECURITY DEFINER, idempotent via B2 claim/replay): create, activate, deactivate, complete, abandon
- Cert re-check at create/activate transaction time
- Authenticated **SELECT-only** on executions; RPC EXECUTE only for `authenticated`
- Initial opaque `state_payload = {}`; **no** `platform_patch_methodology_execution_state`
- No `platform_methodologies`; no B4+; no UI/services
- No Production apply; no data rows; no push/deploy

**Label:** `B3 DEV APPLY VERIFIED — READY FOR OWNER ACCEPTANCE`

---

## 2. Files created / modified

| Path | Action |
|------|--------|
| `supabase/migrations/20260809180000_radionics_platform_session_b3_methodology_executions.sql` | **Created** / corrected; **committed** in `1964abb`; **applied in Dev by Owner** |
| `scripts/validate-platform-session-f2-b3.mjs` | **Created** / updated; **committed** in `1964abb` |
| `docs/Engine/Session/Platform_Session_F2_B3_Local_Implementation_Report.md` | **Created** / updated (this file) — Dev apply verification record |
| `package.json` | **Modified** earlier — `validate:platform-session-f2-b3`; **committed** in `1964abb` |

**Not modified by this report update:** SQL, migrations, scripts, Product, AGENTS, UI, services, package.json.

---

## 3. Migration summary

### 3.1 `platform_methodology_executions`

- Methodology-neutral execution rows; `specialty_id NOT NULL`
- Snapshots reconciled from `radionics_specialties` at create
- Optional `plan_item_id` provenance FK → `platform_session_plan_items`
- Status: `not_started` \| `active` \| `paused` \| `completed` \| `abandoned`
- Initial `state_payload` jsonb default `{}` (opaque; not patched in B3)
- `UNIQUE (id, therapist_id)` and `UNIQUE (session_id, therapist_id, id)` (same-session pointer target)
- RLS: owner SELECT only; no write policies
- Grants: SELECT to authenticated only
- Trigger: `platform_guard_mutable_owned_row`

### 3.2 `platform_sessions.active_execution_id`

- Nullable uuid
- **Same-session FK:** `(id, therapist_id, active_execution_id) → platform_methodology_executions(session_id, therapist_id, id)`
- Guarantees pointer cannot reference another session’s execution (therapist-only FK was insufficient)
- Mutated only by lifecycle RPCs (no therapist UPDATE policy on sessions)

### 3.3 OD-B3-13 coherence

Deferred constraint triggers (`platform_b3_assert_active_execution_coherence`):

- `active_execution_id IS NULL` ⇒ zero rows with `status = 'active'` for that session
- `active_execution_id IS NOT NULL` ⇒ exactly one `active` row and its `id` equals the pointer
- Activate sets target `active` then pointer; deactivate/complete/abandon clear pointer
- Deferred so mid-transaction pause→activate→pointer updates remain valid

### 3.4 RPCs

| RPC | Purpose |
|-----|---------|
| `platform_create_methodology_execution` | Create `not_started`; cert-gated; optional plan_item_id; initial `{}` payload |
| `platform_activate_execution` | Switch active; pause previous; set pointer; cert re-check; preserve payload |
| `platform_deactivate_execution` | Pause active; clear pointer; no replacement |
| `platform_complete_methodology_execution` | Terminal `completed`; clear pointer if was active |
| `platform_abandon_methodology_execution` | Terminal `abandoned`; clear pointer if was active |

Session lifecycle gate: `in_progress` \| `paused` \| `closing` only (no draft / terminal).

Idempotency: reuses `platform_b2_replay_or_claim_idempotency` / finalize / fail.

RPC grants: `REVOKE ALL … FROM public, anon, authenticated` then `GRANT EXECUTE TO authenticated`.

### 3.5 Explicit exclusions

No state-patch RPC; no notes/transcript/timeline/archive/reports; no MAP/35/49/Hawkins/Chakras behaviour; no `platform_methodologies`; no auto-create inside `start_session`.

---

## 4. Development apply + post-apply verification record

| Item | Value |
|------|--------|
| Environment designation | `RADIONICS-ENV-DESIGNATION-20260807-01` → **Development** |
| Apply authorization | `RADIONICS-F2-B3-DEV-APPLY-AUTH-20260809-01` |
| Applied artifact | `20260809180000_radionics_platform_session_b3_methodology_executions.sql` |
| Local commit | `1964abb` |
| Application method | **Manual** SQL transaction by Owner (succeeded) |
| Production apply | **No** |
| Data rows inserted | **No** (tables empty) |
| UI / services / B4+ | **No** |
| `platform_methodologies` | **Absent** |
| State-patch RPC | **Absent** |
| Push / deploy | **No** |

### Post-apply read-only verification (Owner)

| Check | Result |
|-------|--------|
| `b3_table_exists_and_rls_enabled` | **PASS** |
| `b3_select_policy_present` | **PASS** |
| `b3_functions_present` | **PASS** |
| `active_execution_id_column_present` | **PASS** |
| `no_platform_methodologies` | **PASS** |
| `no_state_patch_rpc` | **PASS** |
| `b3_rows_empty` | **PASS** |
| `b3_expected_constraints` | **PASS** — constraints=21 |
| `b3_same_session_active_fk_present` | **PASS** |
| `b3_partial_unique_indexes_present` | **PASS** — indexes=2 |
| `b3_rpc_execute_grants_authenticated` | **PASS** — functions=5 |
| `b3_no_client_dangerous_table_grants` | **PASS** — dangerous=0 |
| `b3_no_unexpected_client_rpc_execute` | **PASS** — unexpected=0 |
| `b3_coherence_trigger_present` | **PASS** — triggers=1 |

---

## 5. Validator (local static)

- **Command:** `npm run validate:platform-session-f2-b3`
- **Assertions:** **78** passed / 0 failed (pre-apply local suite)
- Static SQL only — not a live PostgreSQL test
- Asserts: table + same-session `active_execution_id` FK; UNIQUE `(session_id, therapist_id, id)`; OD-B3-13 coherence trigger; one-active + one-primary indexes; SELECT-only; five lifecycle RPCs; grants hardening; no state-patch; no `platform_methodologies`; B2 idempotency reuse; cert re-check on activate

### Correction note (same-session pointer)

Initial B3 draft used FK `(active_execution_id, therapist_id) → executions(id, therapist_id)`, which allowed a therapist to point a session at an execution belonging to a **different** session. Corrected to triple composite FK via `UNIQUE (session_id, therapist_id, id)` plus deferred OD-B3-13 coherence trigger before Owner apply.

---

## 6. Local commands executed and results (pre-apply)

| Command | Result |
|---------|--------|
| `npm run validate:platform-session-f2-b3` | **PASSED** — **78** |
| `npm run validate:platform-session-f2-b2` | **PASSED** — 82 |
| `npm run validate:platform-session-f2-b1` | **PASSED** — 105 |
| `npm run validate:platform-session-f0-f1` | **PASSED** — 151 |
| `npm run typecheck` | **PASSED** |
| `npm run lint` | **PASSED** |
| `npm run build` | **PASSED** |
| `node scripts/validate-v30d2-workflow-adapter.mjs` | **PASSED** (`ok: true`) |
| `git diff --check` (B3 paths) | **PASSED** |

---

## 7. Confirmations

- Development apply executed **manually by Owner** under `RADIONICS-F2-B3-DEV-APPLY-AUTH-20260809-01`
- Post-apply read-only verification **PASS** (all listed checks)
- **No** Production apply
- **No** data rows inserted
- **No** UI / services / B4+
- **No** `platform_methodologies`
- **No** state-patch RPC
- **No** push / deploy
- Local code/migration already committed in `1964abb`
- This report update does not modify SQL, migrations, scripts, Product, AGENTS, UI, services, or package.json

---

## 8. Stop line

**B3 DEV APPLY VERIFIED — READY FOR OWNER ACCEPTANCE**
