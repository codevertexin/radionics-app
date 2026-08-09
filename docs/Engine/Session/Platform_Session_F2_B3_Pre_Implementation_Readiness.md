# Platform Session F2 — Batch B3 Pre-Implementation Readiness

**Status:** `APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`  
**Date:** 2026-08-09  
**Scope:** Documentation / readiness only — Batch B3 (methodology executions, one-active invariant, activation RPCs, `active_execution_id`)  
**Depends on:** F2 design baseline v1.2 (`d65f879`); B1 core + grants hardening applied/reconciled in Development; B2 core + RPC grants hardening applied/reconciled in Development (OD-B2-1…10)  
**Does not authorize:** SQL, migrations, Supabase writes, UI, services, tests, methodology behaviour, B4+, commit, push, or deploy

---

## 1. Executive verdict

B3 is the next **persistence** unit after B2. It should materialize **methodology executions** as methodology-neutral platform rows, enforce **exactly one active execution per session**, wire **`platform_sessions.active_execution_id`** (deferred from B1), and provide **RPC-only** activation / deactivation / switching that re-checks **approved** specialty certification at transaction time.

**Canonical product rule (OD-F2-6):** Specialty = Methodology catalogue. There is **no** `platform_methodologies` table. Persistence anchors on `specialty_id → radionics_specialties`. UI/product language says **Methodology**. A therapist may only **create or activate** an execution when certification is currently **`approved`** for that specialty. Later expiry must **not** rewrite historical execution rows or snapshots.

**B2 already delivered** testimony, plan items, draft context patch, and `start_session` (RPC-only; SELECT-only table grants; RPC EXECUTE hardened to `authenticated`). B2 deliberately did **not** create executions or `active_execution_id`. Session start does **not** require an execution row — the session clock can run with a primary **plan** item; B3 owns the execution graph and the active-execution pointer.

**B3 focus (proposed):** methodology **execution lifecycle only** — create, activate/switch, deactivate, complete, abandon — plus `active_execution_id` and the one-active invariant. An initial opaque `state_payload` envelope (typically `{}`) may be stored at create time as a snapshot placeholder. **Arbitrary state patching is out of B3** (deferred to F3/B3.1): even opaque envelope updates are adapter/workspace integration territory and should wait until UI/services/adapters are authorized.

**Recommended write posture (proposed, mirrors OD-B2-3/4):** authenticated clients receive **SELECT only** on `platform_methodology_executions`; create / activate / deactivate / switch / complete / abandon go through **SECURITY DEFINER** RPCs with idempotency. Direct browser writes must not be able to create dual actives or bypass cert gates.

This document is **proposed**, not approved for implementation. No SQL, application code, migrations, Supabase writes, UI, services, or tests were implemented in producing it.

**Label:** `B3 READINESS PROPOSED — NOT AUTHORIZED FOR IMPLEMENTATION`

---

## 2. Inspected files / authorities

| Authority | Role for B3 |
|-----------|-------------|
| `docs/AGENTS.md` | Platform session domain is methodology-neutral; multiple executions allowed; ≤1 active per session |
| `docs/Product/00_Product_Vision_&_Experience_Constitution.md` | Experience constitution |
| `docs/Product/01_Platform_UX_Backlog.md` | UX backlog context (PX-402/403 out of B3 implementation) |
| `docs/Product/02_Product_Decisions.md` | PD-002 one primary methodology; complementary allowed; PD-007 platform before methodology |
| `docs/Product/03_Platform_Session_Experience.md` | Active methodology owns centre; only one execution active; preserve each execution state; complementary extension boundary |
| `docs/Product/04_Platform_Session_Implementation_Readiness.md` | Split Session vs executions; exactly one active; methodology-neutral platform records |
| `src/platform/session/**` | F1 `MethodologyExecutionRecord`, statuses, `activateExecution`, `assertAtMostOneActiveExecution`, `activeExecutionId` on session facts |
| `docs/Engine/Session/Platform_Session_F2_Supabase_Persistence_Pre_Implementation_Readiness.md` | Approved F2 §6.5 executions, §8 one-active enforcement, OD-F2-6, batch B3 row |
| `docs/Engine/Session/Platform_Session_F2_B1_Local_Implementation_Report.md` | `active_execution_id` deferred to B3; B1 grants pattern |
| `docs/Engine/Session/Platform_Session_F2_B2_Pre_Implementation_Readiness.md` | APPROVED B2 baseline; executions explicitly out of B2 |
| `docs/Engine/Session/Platform_Session_F2_B2_Local_Implementation_Report.md` | B2 applied in Dev + RPC grants hardening verified |
| `supabase/migrations/20260807120000_radionics_platform_session_b1_core.sql` | Sessions without `active_execution_id` |
| `supabase/migrations/20260807124000_radionics_platform_session_b1_grants_hardening.sql` | B1 table grants matrix |
| `supabase/migrations/20260809170000_radionics_platform_session_b2_testimony_plan_rpcs.sql` | Plan items + start_session; no executions |
| `supabase/migrations/20260809173000_radionics_platform_session_b2_rpc_grants_hardening.sql` | B2 RPC EXECUTE matrix (authenticated only) |
| Existing helpers | `has_approved_specialty_certification(uuid)`, `platform_guard_mutable_owned_row()`, `platform_command_idempotency`, B2 claim/replay pattern |

**Not modified:** Product 00–04, AGENTS, F2 v1.2 baseline, B1/B2 migrations, F0/F1 contracts, UI, services.

---

## 3. B3 scope and explicit exclusions

### 3.1 In scope (proposed)

1. **`platform_methodology_executions`** — therapist-owned, session-scoped execution rows with `specialty_id NOT NULL`, methodology snapshots, methodology-neutral lifecycle status, and an **initial** opaque `state_payload` envelope (default `{}`) stored at create — **not** updated by a B3 state-patch RPC.  
2. **`platform_sessions.active_execution_id`** — nullable pointer added to B1 sessions; composite FK `(active_execution_id, therapist_id) → platform_methodology_executions (id, therapist_id)`.  
3. **One-active enforcement** — partial unique index `UNIQUE (session_id) WHERE status = 'active'`, plus RPC transactional switching.  
4. **RPC-only execution lifecycle** — create; activate/switch; deactivate; complete; abandon — preserving the initial opaque envelope across status transitions.  
5. **Certification eligibility** — create/activate requires `has_approved_specialty_certification(specialty_id)` **at transaction time**; blocked statuses: `pending`, `rejected`, `expired`, `not_certified`.  
6. **Relationship to B2 plan items** — executions use the same catalogue (`radionics_specialties`); may originate from planned items or from in-session complementary invoke (Product 03); historical plan/execution rows survive later cert expiry.  
7. **Therapist-scoped ownership / RLS / grants** — authenticated **SELECT only** on executions (proposed); writes via SECURITY DEFINER RPCs; follow B1/B2 grants-hardening lessons (no anon EXECUTE; no TRUNCATE defaults).  
8. **Idempotency** — mutating lifecycle RPCs use `platform_command_idempotency` with the B2 pending-claim / `FOR UPDATE` / finalize pattern.

### 3.2 Explicitly out of scope

| Deferred / forbidden | Batch / rule |
|----------------------|--------------|
| **`platform_patch_methodology_execution_state`** (even opaque envelope / progress / completion_awareness updates) | **F3 / B3.1** — adapter/workspace integration; requires authorized UI/services/adapters |
| Notes, transcript captures/segments, timeline, contributions | **B4** |
| Archive assembly / sealed archives / seal RPC | **B5** |
| Report templates / projections / approved renditions | **B6** |
| MAP / 35 Graphs / 49 Angels / Hawkins / Chakras resources, activations, therapeutic workflow adapters | **Methodology Experience / later F3** — not platform B3 |
| Interpreting or validating methodology `state_payload` contents | **Forbidden** for platform (opaque envelope only) |
| Session lifecycle RPCs beyond what B2 already shipped (`pause_session`, `resume_session`, `enter_closing`, `complete_session`, `cancel_session`) | **Later** — not required to ship B3 one-active graph |
| UI wizard/workspace, services wiring, methodology host chrome (PX-402/403) | **F3 / Experience units** |
| `platform_methodologies` | **Never** (OD-F2-6) |
| Methodology-specific therapeutic columns on platform tables | **Forbidden** |
| Execution state history / event sourcing of payload versions | Deferred (F2: state history deferred) |
| Altering Product 00–04 or F2 v1.2 text except via Owner decision | Out of this readiness task |

---

## 4. Proposed persistence boundaries

```text
radionics_specialties  ←── specialty_id (NOT NULL) ──  platform_methodology_executions
        ↑                                                      │
        │ approved cert at create/activate                    │ composite FK
therapist_specialty_certifications                            │ (session_id, therapist_id)
        │                                                      ▼
        └── eligibility gate (inside RPCs) ────────────  platform_sessions (B1)
                                                              │
                                                              ├── active_execution_id (B3; nullable)
                                                              │     composite FK → executions
                                                              ├── plan items (B2; intention, not execution)
                                                              └── testimony (B2; independent of executions)

platform_session_plan_items (B2)
  └── optional provenance link to executions (Owner decision OD-B3-*)
      same specialty catalogue; plan ≠ execution ≠ workflow template
```

**Boundary rules:**

- Platform stores **neutral** execution facts + opaque state envelope.  
- Catalogue = `radionics_specialties`; product language = **Methodology**.  
- Plan items (B2) = **intention to use**; executions (B3) = **invoked runtime instances**.  
- At most one execution with `status = 'active'` per `session_id`.  
- Cross-session concurrent actives are allowed (invariant is per-session).  
- Primary vs complementary is a **role column**, not the activity constraint.  
- Certification gates **new** create/activate only; historical rows remain readable after expiry.  
- No methodology therapeutic columns; no `platform_methodologies`.

---

## 5. Proposed tables / columns / RPCs

### 5.1 `platform_methodology_executions` (new in B3)

Aligned with F2 §6.5 and F1 `MethodologyExecutionRecord`:

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | PK; domain `executionId` |
| `therapist_id` | `uuid` | NO | Owner; `REFERENCES auth.users(id)` |
| `session_id` | `uuid` | NO | Parent session |
| `specialty_id` | `uuid` | **NO** | FK → `radionics_specialties(id)` ON DELETE RESTRICT |
| `methodology_id` | `text` | NO | Snapshot reconciled from specialty |
| `methodology_slug` | `text` | NO | Snapshot |
| `methodology_name` | `text` | NO | UI “Methodology” snapshot |
| `specialty_slug` / `specialty_name` | `text` | YES | Optional historical snapshots |
| `role` | `text` | NO | `primary` \| `complementary` |
| `sequence_order` | `integer` | NO | Invocation order within session |
| `status` | `text` | NO | `not_started` \| `active` \| `paused` \| `completed` \| `abandoned` |
| `adapter_id` / `adapter_version` | `text` | YES | Technical adapter identity (opaque) |
| `workflow_template_id` / `workflow_version` | `text` | YES | Technical workflow identity (opaque) |
| `state_schema_version` | `text` | NO | Initial envelope version only (set at create) |
| `state_payload` | `jsonb` | NO | Default `{}` — **opaque** initial envelope/snapshot; platform must not interpret; **no B3 RPC mutates it** |
| `progress` / `completion_awareness` | `jsonb` | YES | Optional placeholders; **no B3 RPC patches them** (F3/B3.1) |
| `started_at` / `paused_at` / `resumed_at` / `completed_at` | `timestamptz` | YES | Execution-level clocks — **not** session timer |
| `plan_item_id` | `uuid` | YES | **Proposed optional** provenance → `platform_session_plan_items` (Owner confirm) |
| `row_revision` | `integer` | NO | default 1 |
| `created_at` / `updated_at` | `timestamptz` | NO | Server-owned |

**Constraints (proposed):**

- `UNIQUE (id, therapist_id)`  
- Composite FK `(session_id, therapist_id) → platform_sessions(id, therapist_id)` ON DELETE RESTRICT  
- `role IN ('primary','complementary')`  
- `status IN ('not_started','active','paused','completed','abandoned')`  
- `sequence_order >= 1`; recommend `UNIQUE (session_id, sequence_order)`  
- **Partial unique:** `UNIQUE (session_id) WHERE status = 'active'`  
- Optional: at most one `role = 'primary'` execution per session (Owner confirm — aligns PD-002; plan already enforces one primary **plan** item)  
- Optional composite FK `(plan_item_id, therapist_id) → platform_session_plan_items` when `plan_item_id` present  

**Mutability:** therapist has no direct INSERT/UPDATE/DELETE grants (proposed). Mutations only via RPCs. Guard identity / timestamps / `row_revision` with `platform_guard_mutable_owned_row` (or B3 equivalent) where rows are updated by definer RPCs.

### 5.2 `platform_sessions.active_execution_id` (additive column on B1 table)

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `active_execution_id` | `uuid` | YES | NULL when no active execution |

- **Composite FK (nullable):** `(active_execution_id, therapist_id) → platform_methodology_executions(id, therapist_id)`  
- Must stay coherent with partial unique: if an execution is `active`, session pointer should reference it; if none active, pointer NULL (Owner confirm strict coupling).  
- Circular dependency: create executions table first; add session column + FK in same migration after both exist (standard Postgres pattern).  
- Do **not** change B1 lifecycle CHECKs or session timer semantics.

### 5.3 Proposed RPCs (SECURITY DEFINER, idempotent)

| RPC (proposed names) | Purpose |
|----------------------|---------|
| `platform_create_methodology_execution` | Create execution row (`not_started` or as Owner-approved initial status); cert-gated; reconcile specialty snapshots; optional `plan_item_id`; store **initial** opaque `state_payload` (typically `{}`) |
| `platform_activate_execution` | Switch active within session: previous `active` → `paused`; target → `active`; set `active_execution_id`; cert re-check at TX time; **preserve** existing `state_payload` unchanged |
| `platform_deactivate_execution` | Clear active without activating another: current `active` → `paused`; `active_execution_id = NULL` |
| `platform_complete_methodology_execution` | Set `completed`; clear `active_execution_id` if this row was active |
| `platform_abandon_methodology_execution` | Set `abandoned`; clear `active_execution_id` if this row was active |

F2 §8 names `platform_activate_execution` explicitly. B3 RPCs cover **execution lifecycle only**.

**Explicitly not in B3:** `platform_patch_methodology_execution_state` (and any arbitrary progress/completion_awareness writers). Even opaque state patching is adapter/workspace integration and belongs in **F3/B3.1** after UI/services/adapters are authorized.

**Also not in B3:** full session lifecycle pause/resume/closing/complete/cancel RPCs (session clock), unless Owner expands scope.

### 5.4 Tables B3 must not create

- `platform_methodologies`  
- B4–B6 tables (notes, transcript, timeline, contributions, archives, reports)  
- Any methodology-specific therapeutic tables under `public` platform session schema

---

## 6. RLS / grants expectations

### 6.1 Shared ownership model

Reuse B1/B2 patterns:

- `therapist_id = auth.uid()` for owner reads  
- `UNIQUE (id, therapist_id)` + composite child FKs  
- Server-owned `created_at` / `updated_at` / `row_revision`  
- No silent admin cross-write unless Owner adds admin SELECT later  
- Explicit grants after create (B1/B2 taught that Supabase defaults include dangerous privileges and anon EXECUTE on functions)  
- Do **not** revoke/modify `service_role` casually

### 6.2 Proposed RLS matrix

| Table / column | SELECT | INSERT | UPDATE | DELETE |
|----------------|--------|--------|--------|--------|
| `platform_methodology_executions` | owner | **deny** (RPC only) | **deny** (RPC only) | **deny** |
| `platform_sessions.active_execution_id` | via existing session SELECT | n/a | **deny** direct therapist UPDATE (still no session UPDATE policy); mutated only inside activation RPCs | n/a |

### 6.3 Proposed grants (authenticated)

| Object | Proposed privileges |
|--------|---------------------|
| `platform_methodology_executions` | `SELECT` only |
| New B3 RPCs | `EXECUTE` to `authenticated` only; `REVOKE ALL … FROM public, anon, authenticated` then re-grant (B2 RPC hardening pattern) |
| `anon` | **none** |

Always: revoke default excess privileges; never grant `TRUNCATE` / `TRIGGER` / `REFERENCES` to authenticated.

---

## 7. Invariants

1. No `platform_methodologies`; catalogue = `radionics_specialties` (OD-F2-6).  
2. Every execution has `specialty_id NOT NULL` FK → `radionics_specialties`.  
3. Snapshots `methodology_*` reconciled from specialty at create time; historical labels, not a second catalogue.  
4. Therapist may create/activate an execution only with certification **`approved`** for that specialty **at transaction time**.  
5. Later cert expiry does **not** rewrite historical execution rows, plan items, or sessions.  
6. At most one execution with `status = 'active'` per `session_id` (partial unique + RPC).  
7. Cross-session active executions do not conflict.  
8. `active_execution_id` (when set) must reference an execution in the **same** session and therapist, and that row should be the sole `active` (Owner confirm fail-closed coherence checks).  
9. Primary vs complementary is role metadata; activity is independent (F2 §8.4).  
10. `state_payload` is an **opaque initial envelope** set at create (typically `{}`); B3 lifecycle RPCs must **not** patch payload/progress/completion_awareness; platform never interprets methodology fields as first-class columns.  
11. Plan ≠ execution ≠ workflow template ≠ report template.  
12. Session lifecycle timer fields remain B1/B2-owned; execution timestamps are separate.  
13. `reported` never appears on `platform_sessions`.  
14. Composite ownership always matches parent session `therapist_id`.  
15. Idempotent **lifecycle** RPCs use `platform_command_idempotency` (B2 claim/replay pattern).  
16. Authenticated role has **SELECT only** on executions; writes are **RPC-only** (proposed).  
17. No B4+ objects in B3; no state-patch RPC in B3.

---

## 8. Lifecycle interaction with B1 / B2

### 8.1 What B1/B2 already enforce

| Asset | B3 interaction |
|-------|----------------|
| `platform_sessions` lifecycle + timer CHECKs | Unchanged; activation must not break B1 CHECKs |
| No therapist UPDATE on sessions | `active_execution_id` updates only via SECURITY DEFINER RPCs |
| `platform_session_plan_items` | Source of intended specialties; one primary plan item |
| `platform_start_session` | Starts session **without** requiring an execution row today |
| Testimony snapshot | Independent of executions |
| Idempotency table + B2 helpers | Reuse for B3 commands |
| RPC grants hardening | Copy pattern for new B3 functions |

### 8.2 Session status vs execution status

| Session `lifecycle_status` | Executions allowed? (proposed) |
|----------------------------|--------------------------------|
| `draft` | **No** create/activate (OD-B3-12) |
| `in_progress` | Create / activate / switch / deactivate / complete / abandon allowed if cert OK |
| `paused` / `closing` | Prefer allow switch only if Owner needs return-to-methodology during closing chrome — **Owner confirm**; default: allow activate/switch while non-terminal |
| `completed` / `cancelled` | No new create/activate; existing rows readable |

### 8.3 Start session vs first execution

B2 `start_session` does **not** insert an execution. Proposed options for Owner:

| Option | Behaviour |
|--------|-----------|
| **A (recommended)** | Separate `platform_create_methodology_execution` (+ activate) after start; UI/F3 wires primary plan → first execution |
| **B** | Extend `start_session` later to optionally create+activate primary execution atomically — **out of B3 unless Owner expands** |
| **C** | Auto-create primary `not_started` execution inside B3 migration backfill — **rejected** (no data inserts in schema batch; no historical sessions assumed) |

### 8.4 Complementary invoke without prior plan item

Product 03 allows additional unplanned methodologies during an active session. B3 should allow creating a complementary execution from `specialty_id` **without** a pre-existing plan item (cert-gated). Optionally also upsert a plan item — **Owner confirm**; default recommendation: execution create does **not** silently mutate plan.

---

## 9. Active execution rules

1. **Partial unique index** on `platform_methodology_executions (session_id) WHERE status = 'active'`.  
2. **`platform_activate_execution`** (F2 §8):  
   - Auth: `therapist_id = auth.uid()`  
   - Lock session row + relevant execution rows (`SELECT … FOR UPDATE`)  
   - Reject if session terminal (per OD-B3 lifecycle matrix)  
   - Re-check `has_approved_specialty_certification(target.specialty_id)` at TX time  
   - Set any current `active` in that session → `paused` (preserve payload)  
   - Set target → `active`; set timestamps (`resumed_at` / `started_at`) server-side as appropriate  
   - Set `platform_sessions.active_execution_id = target.id`; bump session `row_revision`  
   - Idempotent replay via command key  
3. **Deactivate** (if approved): pause current active; NULL pointer; no other execution becomes active automatically.  
4. Dual-active attempts fail closed at unique index even if RPC buggy.  
5. Do not encode PX-402/PX-403 UX in SQL.

---

## 10. Certification eligibility rules

### 10.1 Source of truth

| Object | Role |
|--------|------|
| `radionics_specialties` | Canonical Methodology catalogue |
| `therapist_specialty_certifications` | Per-therapist eligibility |
| `has_approved_specialty_certification(specialty_id)` | Helper: `therapist_id = auth.uid()` AND `status = 'approved'` |

### 10.2 Allowed / blocked

| Cert status | Create execution | Activate / switch to execution |
|-------------|------------------|--------------------------------|
| `approved` | Allowed | Allowed (**must still be approved at TX time**) |
| `pending` / `rejected` / `expired` / `not_certified` | Blocked | Blocked |

Plan-time approval (B2) is **not** sufficient for later activation if cert expired between plan/start and activate.

### 10.3 Historical behaviour

- Existing executions remain readable after later expiry.  
- New create/activate for that specialty blocked.  
- Do not delete or rewrite snapshots when cert status changes.  
- Session/archive/report later batches must still see historical methodology identity via snapshots.

---

## 11. Concurrency / idempotency expectations

1. Mutating B3 **lifecycle** RPCs accept an idempotency key and use `platform_command_idempotency` with the **B2** pattern:  
   - `INSERT … pending` + `ON CONFLICT DO NOTHING`  
   - Contenders `SELECT … FOR UPDATE`  
   - Fingerprint mismatch fail-closed  
   - Finalize `accepted` / mark `failed`  
2. Inside activate: lock session + executions before status flips to avoid dual-active races.  
3. Use `row_revision` optimistic checks where useful; never `UPDATE … FOR UPDATE`.  
4. B3 does **not** ship state-patch commands; concurrency for payload writers is an F3/B3.1 concern.  
5. Command types proposed: `create_methodology_execution`, `activate_execution`, `deactivate_execution`, `complete_methodology_execution`, `abandon_methodology_execution`.

---

## 12. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Creating `platform_methodologies` | Explicit forbid; validator assertion; Owner reject |
| Dual active executions | Partial unique index + RPC locks |
| Activate with stale plan-time cert | Re-check approved cert at activate TX time |
| Direct browser writes flipping status | SELECT-only grants; RPC-only writes; no session UPDATE policy |
| Circular FK sessions ↔ executions | Ordered DDL in one migration; nullable pointer |
| Interpreting methodology payload in platform | Opaque JSONB only; no therapeutic columns |
| Premature adapter state wiring in B3 | No `platform_patch_methodology_execution_state`; defer to F3/B3.1 |
| Premature B4 coupling (`execution_id` on notes/transcript) | Do not create B4 tables; FK targets can exist later |
| Expanding into MAP/35/49/Hawkins behaviour | Explicit exclusion; stop line |
| Default Supabase grants / anon EXECUTE | Follow B1 table + B2 RPC hardening patterns in same or immediate additive migration |
| Treating readiness as implementation auth | OD-F2-5: separate local + Dev apply authorizations required |
| Auto-creating executions on start without Owner approval | Keep create/activate explicit (Option A) unless Owner chooses otherwise |
| Primary execution ambiguity | Optional partial unique on `role = 'primary'` — Owner confirm |

---

## 13. Validation plan (when B3 is later authorized)

Static / local (no remote write required for docs; live tests only after apply auth):

1. Additive migration(s) only; B1/B2 core files untouched (except additive column on `platform_sessions` via new migration).  
2. Exactly `platform_methodology_executions` + `active_execution_id`; B4+ absent; no `platform_methodologies`.  
3. `specialty_id NOT NULL` + FK to `radionics_specialties`.  
4. Partial unique one active per session.  
5. Composite FKs and nullable `active_execution_id` FK.  
6. RLS + grants: authenticated SELECT only on executions; anon none; RPC EXECUTE authenticated only after hardening.  
7. Activate allow/deny matrix: unapproved cert, wrong therapist, terminal session, missing execution, dual-active attempt.  
8. Cross-session actives allowed.  
9. Idempotent activate replay.  
10. Cert expiry after activate does not mutate execution snapshots; new activate blocked.  
11. B1 lifecycle CHECKs still hold; session timer fields unchanged by activation.  
12. F0/F1 validator remains green; new static B3 validator.  
13. Static validator asserts **absence** of `platform_patch_methodology_execution_state` (and any state-patch GRANT).  
14. No Product/AGENTS edits unless Owner-directed.  
15. No methodology therapeutic terms/columns in SQL.

---

## 14. Owner decisions required before implementation

| ID | Decision | Proposed default |
|----|----------|------------------|
| **OD-B3-1** | Approve this readiness as design baseline for B3? | **APPROVED** — B3 readiness becomes design baseline |
| **OD-B3-2** | Add `platform_sessions.active_execution_id` in B3 (F2 baseline)? | **APPROVED** — **Yes** |
| **OD-B3-3** | Write posture for executions? | **APPROVED** — **RPC-only**; authenticated **SELECT only** |
| **OD-B3-4** | Include `platform_create_methodology_execution` in B3? | **APPROVED** — **Yes** |
| **OD-B3-5** | Include `platform_activate_execution` (switch + pause previous) in B3? | **APPROVED** — **Yes** (F2 §8) |
| **OD-B3-6** | Include explicit `platform_deactivate_execution` (clear active, no replacement)? | **APPROVED** — **Yes** (minimal) |
| **OD-B3-7** | Include complete/abandon execution RPCs in B3? | **APPROVED** — **Yes** for `completed` / `abandoned`; keep simple |
| **OD-B3-8** | Include opaque `platform_patch_methodology_execution_state` in B3? | **APPROVED** — **Defer to F3/B3.1**; B3 only stores initial opaque state envelope and lifecycle status |
| **OD-B3-9** | Optional `plan_item_id` provenance FK on executions? | **APPROVED** — **Optional nullable FK** — recommended |
| **OD-B3-10** | Enforce at most one `role = 'primary'` **execution** per session? | **APPROVED** — **Yes** (aligns PD-002; independent of plan primary) |
| **OD-B3-11** | Allow complementary execution create without prior plan item? | **APPROVED** — **Yes** (Product 03 unplanned complementary) |
| **OD-B3-12** | May executions be created/activated while session is `draft`? | **APPROVED** — **No** — only after `in_progress` (non-terminal) |
| **OD-B3-13** | Strict coherence: `active_execution_id` must equal the unique `status = 'active'` row (or both null)? | **APPROVED** — **Yes** — enforce inside RPCs (+ CHECK/trigger if practical) |
| **OD-B3-14** | Auto-create primary execution inside `start_session`? | **APPROVED** — **No** in B3 — keep Option A (explicit create/activate) |
| **OD-B3-15** | Separate authorizations for (a) local B3 implementation and (b) Development apply — never treat this doc as auth | **APPROVED** — **Required** (OD-F2-5) |

**No Product document contradiction requiring Product edits was found** for B3 scope: OD-F2-6, PD-002, Product 03 one-active rules, and F1 `activateExecution` align.

**B3 READINESS APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION**

---

## 15. Relationship to B1 / B2 (checklist)

| Prior asset | B3 use |
|-------------|--------|
| `platform_sessions` | Parent; gains `active_execution_id` |
| `platform_session_plan_items` | Optional provenance; same specialty catalogue |
| `platform_client_testimony_snapshots` | Unchanged; independent |
| `platform_command_idempotency` | Dedup for B3 RPCs |
| `platform_guard_mutable_owned_row` | Reuse for mutable execution rows |
| `has_approved_specialty_certification` | Create/activate gate |
| B2 RPC grants hardening pattern | Copy for B3 functions |
| B2 `start_session` | Remains without auto-execution unless OD-B3-14 changes |

---

## 16. Implementation posture (when later authorized)

Suggested physical order (still **not authorized**):

1. Additive migration: `platform_methodology_executions` + constraints + partial unique + RLS + SELECT-only grants (including initial opaque `state_payload` column).  
2. Same migration: add `platform_sessions.active_execution_id` + composite FK.  
3. SECURITY DEFINER **lifecycle** RPCs only: create / activate / deactivate / complete / abandon — with B2-style idempotency + cert checks; **no** state-patch RPC.  
4. Immediate RPC grants hardening (`REVOKE` from `public, anon, authenticated`; `GRANT EXECUTE` to `authenticated` only).  
5. Local static validator for B3 (asserts no state-patch RPC).  
6. Local report.  
7. Separate Owner auth for Development apply.  
8. No UI/services/methodology adapters / state-patch RPC until F3/B3.1 authorization.

---

## 17. Confirmation — nothing implemented in this task

This readiness pass produced **documentation only**.

- **No** SQL objects created or altered  
- **No** migrations added or modified  
- **No** Supabase connections or writes  
- **No** UI, services, tests, or methodology behaviour changes  
- **No** Product / AGENTS / F2 v1.2 / F0–F1 contract edits  
- **No** B3 implementation started  
- **No** commit / push / deploy

---

## 18. Stop line

**B3 READINESS PROPOSED FOR OWNER REVIEW — NOT AUTHORIZED FOR IMPLEMENTATION**
