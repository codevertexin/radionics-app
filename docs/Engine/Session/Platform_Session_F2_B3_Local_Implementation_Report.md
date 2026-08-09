# Platform Session F2 — Batch B3 Local Implementation Report

**Authorization consumed:** `RADIONICS-F2-B3-LOCAL-AUTH-20260809-01`
**Design baseline:** `docs/Engine/Session/Platform_Session_F2_B3_Pre_Implementation_Readiness.md` (OD-B3-1…15 APPROVED as design)
**Status:** `READY FOR OWNER REVIEW — NOT APPLIED TO SUPABASE`
**Date:** 2026-08-09
**Scope:** Local additive B3 migration + static validator + this report

---

## 1. Executive verdict

B3 local implementation prepared under `RADIONICS-F2-B3-LOCAL-AUTH-20260809-01`:

- Table: `platform_methodology_executions` (`specialty_id` → `radionics_specialties`; optional `plan_item_id`)
- Column: `platform_sessions.active_execution_id` + same-session composite FK `(id, therapist_id, active_execution_id) → executions(session_id, therapist_id, id)`
- Partial unique: one `active` execution per session; one `primary` execution per session
- OD-B3-13 deferred coherence trigger: pointer NULL iff no `status=active`; otherwise pointer equals that unique active id
- RPCs (SECURITY DEFINER, idempotent via B2 claim/replay): create, activate, deactivate, complete, abandon
- Cert re-check at create/activate transaction time
- Authenticated **SELECT-only** on executions; RPC EXECUTE only after revoke from `public`/`anon`/`authenticated`
- Initial opaque `state_payload = {}`; **no** `platform_patch_methodology_execution_state`
- No `platform_methodologies`; no B4+; no UI/services
- Migration **not applied** to Supabase by this task

**Label:** `B3 LOCAL IMPLEMENTATION COMPLETE — READY FOR OWNER REVIEW — NOT APPLIED`

---

## 2. Files created / modified

| Path | Action |
|------|--------|
| `supabase/migrations/20260809180000_radionics_platform_session_b3_methodology_executions.sql` | **Created** / corrected (same-session FK + coherence trigger) |
| `scripts/validate-platform-session-f2-b3.mjs` | **Created** / updated for same-session FK + coherence assertions |
| `docs/Engine/Session/Platform_Session_F2_B3_Local_Implementation_Report.md` | **Created** / updated (this file) |
| `package.json` | **Modified** — added `validate:platform-session-f2-b3` |

**Not modified:** B1/B2 migrations, Product 00–05, AGENTS, F2 v1.2, B3 readiness design doc, UI, services, F0/F1 contracts.

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

## 4. Validator

- **Command:** `npm run validate:platform-session-f2-b3`
- **Assertions:** **78** passed / 0 failed
- Static SQL only — not a live PostgreSQL test
- Asserts: table + same-session `active_execution_id` FK; UNIQUE `(session_id, therapist_id, id)`; OD-B3-13 coherence trigger; one-active + one-primary indexes; SELECT-only; five lifecycle RPCs; grants hardening; no state-patch; no `platform_methodologies`; B2 idempotency reuse; cert re-check on activate

### Correction note (same-session pointer)

Initial B3 draft used FK `(active_execution_id, therapist_id) → executions(id, therapist_id)`, which allowed a therapist to point a session at an execution belonging to a **different** session. Corrected to triple composite FK via `UNIQUE (session_id, therapist_id, id)` plus deferred OD-B3-13 coherence trigger before Owner apply.

---

## 5. Commands executed and results

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

**Not executed:** any Supabase apply/write, commit, push, deploy.

---

## 6. Confirmations

- Zero Supabase connections/writes from this task
- No UI / services / B4+ / Product / AGENTS edits
- No commit / push / deploy
- Dirty unrelated worktree left intact

---

## 7. Stop line

**B3 LOCAL IMPLEMENTATION COMPLETE — READY FOR OWNER REVIEW — NOT APPLIED**
