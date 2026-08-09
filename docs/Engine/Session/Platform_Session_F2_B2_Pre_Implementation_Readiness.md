# Platform Session F2 — Batch B2 Pre-Implementation Readiness

**Status:** `APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`  
**Date:** 2026-08-08  
**Owner approval date:** 2026-08-09  
**Scope:** Documentation / readiness only — Batch B2 (testimony, plan, intention/context, certification eligibility)  
**Depends on:** F2 design baseline v1.2 (`d65f879`); B1 core + grants hardening applied/reconciled in Development  
**Does not authorize:** SQL, migrations, Supabase writes, UI, services, tests, methodology behaviour, B3+, commit, push, or deploy

---

## 1. Executive verdict

B2 is the next **persistence** unit after B1. It should materialize **session testimony**, **session plan items**, **certification-gated methodology eligibility** against `radionics_specialties` / `therapist_specialty_certifications`, and clarify how **intention/context** on `platform_sessions` interacts with draft → start.

**Canonical product rule (OD-F2-6):** a Specialty is a certifiable methodology. There is **no** `platform_methodologies` table. UI/product language says **Methodology**; persistence anchors on `specialty_id → radionics_specialties`. A therapist may only plan/start with a methodology when certification status is **`approved`** for that specialty.

B1 already provides therapist-owned `platform_clients`, `platform_sessions` (including `intention` and lifecycle/timer fields), and `platform_command_idempotency`, with RLS that blocks direct lifecycle mutation. B2 must **extend** that graph with immutable testimony snapshots and cert-gated plan items, and is the earliest batch that can correctly introduce **`start_session`** (because start requires a testimony snapshot).

**B2 write posture (APPROVED — OD-B2-3 / OD-B2-4):** all B2 writes are **RPC-only** via authorized `SECURITY DEFINER` commands — testimony insert, plan mutations, draft context patch, and `start_session`. Authenticated clients receive **SELECT only** on B2 tables; no direct INSERT/UPDATE/DELETE grants for testimony or plan items.

This document is the **approved B2 design baseline**. It is **not** authorization to implement. Separate local-implementation and Supabase-apply authorizations remain required (OD-B2-10 / OD-F2-5). No SQL, application code, migrations, Supabase writes, UI, services, or tests are authorized by this approval.

**Label:** `B2 READINESS APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`

---

## 2. Inspected files / authorities

| Authority | Role for B2 |
|-----------|-------------|
| `docs/AGENTS.md` | Platform vs methodology boundaries; session domain must stay methodology-neutral |
| `docs/Product/00_Product_Vision_&_Experience_Constitution.md` | Experience constitution |
| `docs/Product/01_Platform_UX_Backlog.md` | UX backlog context |
| `docs/Product/02_Product_Decisions.md` | PD-002 primary methodology; PD-007 platform before methodology; PD-009 archive/report separation |
| `docs/Product/03_Platform_Session_Experience.md` | Testimony-ready identity; draft vs start; intention; Methodology presentation vs certification eligibility |
| `docs/Product/04_Platform_Session_Implementation_Readiness.md` | Persistence targets; E1 creation/start gates |
| `src/platform/session/**` | F0/F1 contracts: lifecycle, `ClientIdentityProfile`, `ClientTestimonySnapshot`, `SessionPlan` / `SessionPlanItem` |
| `docs/Engine/Session/Platform_Session_F2_Supabase_Persistence_Pre_Implementation_Readiness.md` | Approved F2 design (§6.3–6.4, OD-F2-6, batch B2) |
| `docs/Engine/Session/Platform_Session_F2_B1_Local_Implementation_Report.md` | B1 applied state, grants matrix, deferred RPCs |
| `supabase/migrations/20260807120000_radionics_platform_session_b1_core.sql` | Live B1 structure (clients/sessions/idempotency) |
| `supabase/migrations/20260807124000_radionics_platform_session_b1_grants_hardening.sql` | Authenticated grant matrix for B1 tables |
| Existing helpers | `has_approved_specialty_certification(uuid)`, `auth.uid()` ownership, `platform_guard_mutable_owned_row()`, cert table statuses |

**Not modified:** Product 00–04, AGENTS, F2 v1.2 baseline, B1 migrations, F0/F1 contracts, UI, services.

---

## 3. B2 scope and explicit exclusions

### 3.1 In scope (proposed)

1. **`platform_client_testimony_snapshots`** — immutable identity capture at explicit start (insert via `start_session` RPC only).  
2. **`platform_session_plan_items`** — intended methodologies before/around start, with `specialty_id NOT NULL` (mutations via plan RPCs only).  
3. **Certification eligibility** — server-side gates inside RPCs using `therapist_specialty_certifications` / `has_approved_specialty_certification` (or equivalent).  
4. **Intention / session context** — draft patches to B1 columns (`intention`, `scheduled_at`, `scheduling_timezone`, `session_mode`) via **RPC-only** draft context patch; no new methodology-specific context columns.  
5. **Therapist-scoped ownership / RLS / grants** for the new tables: owner **SELECT**; writes only through authorized `SECURITY DEFINER` RPCs.  
6. **Lifecycle interaction with B1** — especially `draft → in_progress` via authorized `start_session` (proposed for B2 because testimony is a start precondition).  
7. **Idempotency** — `start_session`, plan-mutating commands, and draft context patch must use `platform_command_idempotency`.

### 3.2 Explicitly out of scope (B3+)

| Deferred | Batch |
|----------|-------|
| `platform_methodology_executions`, `active_execution_id`, activate RPC, partial unique active execution | **B3** |
| Notes, transcript captures/segments, timeline, contributions | **B4** |
| Archive assembly / sealed archives / seal RPC | **B5** |
| Report templates / projections / approved renditions | **B6** |
| Generated types, broad index/grant sweeps beyond B2 tables | **B7** / later |
| UI wizard/workspace, `clientsService` / `sessionsService` Supabase wiring, methodology adapters | **F3 / Experience units** |
| `platform_methodologies` | **Never** (OD-F2-6) |
| Methodology-specific therapeutic columns (Hawkins, chakras, graphs, angels, etc.) | **Forbidden on platform tables** |
| Altering Product 00–04 or F2 v1.2 text except via Owner decision | Out of this readiness task |

---

## 4. Proposed persistence boundaries

```text
radionics_specialties  ←── specialty_id (NOT NULL) ──  platform_session_plan_items
        ↑                                                      │
        │ approved cert                                       │ composite FK
therapist_specialty_certifications                            │ (session_id, therapist_id)
        │                                                      ▼
        └── eligibility gate (inside RPCs) ── start / plan writes ──  platform_sessions (B1)
                                                      │         │
                                                      │         ├── intention / schedule / mode (B1; draft patch RPC)
                                                      │         └── lifecycle + timer (B1; mutated by start_session RPC)
                                                      ▼
                                    platform_client_testimony_snapshots
                                      composite FKs → sessions + clients
                                      insert only via start_session RPC
                                      authenticated: SELECT only

platform_session_plan_items
  mutations only via plan RPCs
  authenticated: SELECT only
```

**Boundary rules:**

- Platform tables store **neutral** session facts and snapshots only.  
- Methodology catalogue = `radionics_specialties`; product language = **Methodology**.  
- Plan items are **intentions to use** methodologies — not executions, workflows, or report templates.  
- Testimony is a **point-in-time identity seal** at start — not a live view of `platform_clients`.  
- Client profile remains mutable on `platform_clients` (B1); edits after start must not rewrite the snapshot.  
- Certification is **eligibility context**, not a second methodology entity (Product 03 + OD-F2-6).  
- **Write posture:** testimony, plan mutations, draft context patch, and `start_session` are **RPC-only**.

---

## 5. Proposed tables / columns

### 5.1 `platform_client_testimony_snapshots` (new in B2)

Aligned with F2 §6.3 and F1 `ClientTestimonySnapshot`:

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | PK; domain `snapshotId` |
| `therapist_id` | `uuid` | NO | Owner; `REFERENCES auth.users(id)` |
| `session_id` | `uuid` | NO | One snapshot per session |
| `client_id` | `uuid` | NO | Client at capture time |
| `captured_at` | `timestamptz` | NO | Server-owned at start |
| `identity` | `jsonb` | NO | Full `ClientIdentityProfile` |
| `schema_version` | `text` | NO | e.g. `platform.session.testimony.v1` |
| `created_at` | `timestamptz` | NO | Server-owned |

**Constraints (proposed):**

- `UNIQUE (id, therapist_id)`  
- `UNIQUE (session_id)` — at most one testimony per session  
- Composite FK `(session_id, therapist_id) → platform_sessions(id, therapist_id) ON DELETE RESTRICT`  
- Composite FK `(client_id, therapist_id) → platform_clients(id, therapist_id) ON DELETE RESTRICT`  
- `identity` must contain required keys (enforce in `start_session` RPC)

**Required testimony identity fields — exact Product 03 / F1 match:**

| Product 03 | F1 `ClientIdentityProfile` | Persistence in `identity` jsonb |
|------------|----------------------------|----------------------------------|
| display name (required) | `displayName` | required non-empty string |
| full name (required) | `fullName` | required non-empty string |
| date of birth (required) | `dateOfBirth` | required non-empty string |
| address (required) | `address` | required non-empty string |
| locality (required) | `locality` | required non-empty string |
| country (required) | `country` | required non-empty string |
| postal code when applicable | `postalCode?` | optional |
| telephone (optional contact) | `phone?` | optional — never blocks start |
| WhatsApp (optional contact) | `whatsapp?` | optional — never blocks start |
| email (optional contact) | `email?` | optional — never blocks start |

Contacts remain optional. Absence of contact information never blocks client creation or session start (Product 03).

**Mutability:** immutable after insert. No therapist INSERT/UPDATE/DELETE policies or grants. Capture **only** inside authorized `start_session` RPC. Governed in-session testimony correction remains out of B2 (OD-B2-7).

### 5.2 `platform_session_plan_items` (new in B2)

Aligned with F2 §6.4; persistence extends F1 `SessionPlanItem` with **`specialty_id`**:

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | PK |
| `therapist_id` | `uuid` | NO | Owner |
| `session_id` | `uuid` | NO | |
| `specialty_id` | `uuid` | **NO** | FK → `radionics_specialties(id)` ON DELETE RESTRICT |
| `methodology_id` | `text` | NO | Snapshot reconciled from specialty |
| `methodology_slug` | `text` | NO | Snapshot |
| `methodology_name` | `text` | NO | UI “Methodology” snapshot |
| `specialty_slug` | `text` | YES | Optional historical snapshot |
| `specialty_name` | `text` | YES | Optional historical snapshot |
| `role` | `text` | NO | `primary` \| `complementary` |
| `sequence_order` | `integer` | NO | |
| `schema_version` | `text` | NO | e.g. `platform.session.plan.v1` |
| `row_revision` | `integer` | NO | default 1; bumped by plan RPCs |
| `created_at` / `updated_at` | `timestamptz` | NO | Server-owned |

**Constraints (proposed):**

- `UNIQUE (id, therapist_id)`  
- `UNIQUE (session_id, sequence_order)`  
- Composite FK `(session_id, therapist_id) → platform_sessions`  
- `role IN ('primary','complementary')`  
- `sequence_order >= 1`  
- **Proposed:** at most one `primary` per session (partial unique index) — **Owner confirm** (supports PD-002)

**Eligibility / writes:** all plan INSERT/UPDATE/DELETE happen inside authorized plan RPCs. Each mutating RPC must enforce `has_approved_specialty_certification(specialty_id)` (or equivalent) fail-closed. Blocked cert statuses: `pending`, `rejected`, `expired`, `not_certified`. **No** direct authenticated INSERT/UPDATE/DELETE grants on this table.

### 5.3 Intention / context (existing B1 columns — no new table)

On `platform_sessions` (already present):

| Column | B2 readiness stance |
|--------|---------------------|
| `intention` | Platform session fact; may be empty; draft edits via **RPC-only** draft context patch; revisable later per Product 03 through authorized RPCs only |
| `scheduled_at` / `scheduling_timezone` | Draft scheduling context; same RPC-only draft patch |
| `session_mode` | Required at session create (`presential` \| `online` \| `distance`); draft changes via RPC-only patch |

**Do not** add methodology therapeutic context columns in B2. **Do not** grant authenticated UPDATE on `platform_sessions` for these fields.

### 5.4 Tables B2 must not create

- `platform_methodologies`  
- `platform_methodology_executions`  
- Any B4–B6 tables  
- Duplicate specialty catalogues

---

## 6. RLS / grants expectations

### 6.1 Shared ownership model

Reuse B1 patterns:

- `therapist_id = auth.uid()` for owner **SELECT**  
- `UNIQUE (id, therapist_id)` + composite child FKs  
- Immutable `id` / `therapist_id` / `created_at` via trigger guard where rows are mutable under RPCs  
- No silent admin cross-write unless Owner explicitly adds admin SELECT later  
- Explicit grants after create (B1 taught that Supabase defaults include dangerous privileges such as `TRUNCATE`)  
- Do **not** revoke/modify `service_role` casually  
- **B2 write posture:** authenticated never receives INSERT/UPDATE/DELETE on B2 tables; writes only through authorized `SECURITY DEFINER` RPCs that enforce ownership, cert eligibility, and idempotency

### 6.2 Proposed RLS matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `platform_client_testimony_snapshots` | owner | **deny** (RPC `start_session` only) | **deny** | **deny** |
| `platform_session_plan_items` | owner | **deny** (plan RPCs only) | **deny** (plan RPCs only) | **deny** (plan RPCs only) |

Certification and lifecycle rules are enforced **inside RPCs**, not via permissive authenticated write policies. Direct browser writes must fail closed.

### 6.3 Proposed grants (authenticated)

| Table | Proposed privileges |
|-------|---------------------|
| `platform_client_testimony_snapshots` | **`SELECT` only** |
| `platform_session_plan_items` | **`SELECT` only** |

No authenticated `INSERT`, `UPDATE`, or `DELETE` on either B2 table. Writes occur only inside authorized `SECURITY DEFINER` RPCs.

Always: `REVOKE ALL … FROM public, anon, authenticated` then re-grant **SELECT** only to `authenticated` (B1 grants-hardening pattern). Do not grant `TRUNCATE`, `TRIGGER`, or `REFERENCES`.

### 6.4 B1 session mutation interaction

B1 already denies therapist UPDATE/DELETE on `platform_sessions`. B2 keeps that posture and adds:

| Command | Mechanism |
|---------|-----------|
| Draft intention / schedule / mode patch | **RPC-only** draft context patch (OD-B2-3) |
| Plan item create/update/delete | **RPC-only** plan commands (OD-B2-4) |
| Testimony capture + `draft → in_progress` | **`start_session` RPC** (OD-B2-2) |

All three use `platform_command_idempotency`. No limited UPDATE policy on `platform_sessions` for draft fields.

---

## 7. Invariants

1. No `platform_methodologies`; catalogue = `radionics_specialties`.  
2. Every plan item has `specialty_id NOT NULL` FK → `radionics_specialties`.  
3. Snapshots `methodology_*` are reconciled from specialty at write time; they are historical labels, not a second catalogue.  
4. Therapist may create/use a plan item only with certification **`approved`** for that specialty.  
5. Later cert expiry does **not** rewrite historical plan rows or sessions.  
6. At most one testimony snapshot per `session_id`.  
7. Testimony `identity` includes exactly the Product 03 / F1 required fields at capture; contacts remain optional and never block start.  
8. Testimony is not updated when `platform_clients` changes after start.  
9. Plan ≠ workflow template ≠ report template ≠ execution.  
10. At most one **primary** plan item per session (proposed; aligns PD-002) — Owner confirm.  
11. Complementary plan items allowed; complementary **execution** remains B3.  
12. `start_session` requires: session `draft`; testimony-ready identity (Product 03 / F1 required fields); exactly one primary plan item; **validates primary specialty certification as `approved` at transaction time**; then atomically inserts testimony + sets `started_at` / `active_timer_started_at` / `lifecycle_status = in_progress` per B1 CHECKs.  
13. `reported` never appears on `platform_sessions`.  
14. No methodology-specific therapeutic columns on B2 tables.  
15. Composite ownership always matches parent session/client `therapist_id`.  
16. Idempotent `start_session`, plan commands, and draft context patch use `platform_command_idempotency`.  
17. Authenticated role has **SELECT only** on B2 tables; testimony, plan, draft context, and start writes are **RPC-only**.  
18. No `platform_methodologies`; no B3+ objects in B2.

---

## 8. Lifecycle interaction with B1

### 8.1 What B1 already enforces

- Lifecycle set: `draft | in_progress | paused | closing | completed | cancelled`  
- Timer/timestamp coherence CHECKs (including cancelled after closing cycle)  
- Therapist INSERT only as `draft` with null therapeutic timestamps / zero duration  
- No therapist UPDATE/DELETE on sessions  
- Idempotency table present; therapist SELECT only

### 8.2 What B2 must add without breaking B1 CHECKs

| Transition | B2 responsibility |
|------------|-------------------|
| Remain in `draft` | Plan mutations via plan RPCs; intention/context via draft context patch RPC — without setting `started_at` / timer |
| `draft → in_progress` | **`start_session` RPC**: validate Product 03 / F1 required identity; require primary plan item; **re-check primary `specialty_id` certification = `approved` at transaction time**; insert testimony; set `started_at`, `active_timer_started_at`, `lifecycle_status = in_progress`; bump `row_revision` server-side |
| `draft → cancelled` | No testimony required; keep B1 cancelled arm (nullable `started_at`) |
| After `in_progress` | Any further plan mutation only via authorized RPCs with cert re-check; prefer freeze primary specialty or Owner-defined rules — still no direct table grants |

B1 CHECK for `in_progress` already requires `started_at` and `active_timer_started_at` NOT NULL — `start_session` must set both in one transaction.

**Certification at start:** approval checked earlier when the plan item was created is **not** sufficient alone. `start_session` must validate the primary specialty certification again inside the start transaction so a cert that expired (or was revoked) between planning and start cannot start the session.

### 8.3 Why start belongs with B2 (not earlier)

B1 deliberately deferred lifecycle RPCs because start needs a testimony snapshot. Implementing a partial start without testimony would violate Product 03 / F1. B3 executions are **not** required to start the session clock, but a **primary planned methodology with approved cert** is required for a meaningful start under Product 03 §3.5 and F2 B2 gate.

---

## 9. Certification eligibility rules

### 9.1 Source of truth

| Object | Role |
|--------|------|
| `radionics_specialties` | Canonical Methodology catalogue |
| `therapist_specialty_certifications` | Per-therapist eligibility rows |
| `has_approved_specialty_certification(specialty_id)` | Existing helper: `therapist_id = auth.uid()` AND `status = 'approved'` |

### 9.2 Allowed / blocked

| Cert status | Plan RPC create/update using that specialty | `start_session` for primary specialty |
|-------------|---------------------------------------------|----------------------------------------|
| `approved` | Allowed | Allowed (must still be `approved` **at transaction time**) |
| `pending` | Blocked | Blocked |
| `rejected` | Blocked | Blocked |
| `expired` | Blocked | Blocked |
| `not_certified` | Blocked | Blocked |

`start_session` validates primary specialty certification **inside the start transaction**, not only at plan-create time.

### 9.3 Historical behaviour

- Existing sessions/plan items remain readable after later expiry.  
- New plan items and new starts for that specialty are blocked.  
- Do not delete or rewrite historical snapshots when cert status changes.

### 9.4 Presentation

UI must show **Methodology** (name/slug from specialty). Certification is eligibility context only — not presented as if it were the methodology itself (Product 03).

### 9.5 F0/F1 adapter note

F1 `SessionPlanItem` uses `methodologyId` / slug / name and does **not** yet require `specialtyId`. Persistence **requires** `specialty_id` UUID. Adapters/RPCs must resolve specialty UUID before insert. This is an implementation contract bridge, not a Product contradiction — already noted in F2 OD-F2-6.

---

## 10. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Creating `platform_methodologies` by habit | Explicit forbid; validator assertion; Owner reject any PR that adds it |
| Plan without approved cert | Plan RPCs fail-closed via `has_approved_specialty_certification` |
| Start with stale plan-time cert | `start_session` re-validates primary specialty certification at transaction time |
| Start without testimony-ready identity | Enforce exact Product 03 / F1 required fields in `start_session`; contacts optional |
| Profile edit rewriting history | Immutable testimony; client UPDATE never cascades to snapshot |
| Direct browser writes on B2 tables | SELECT-only grants; deny INSERT/UPDATE/DELETE policies; RPC-only writes |
| Broad session UPDATE reopening lifecycle holes | No authenticated UPDATE on `platform_sessions`; draft patch + start via RPC only |
| Default Supabase grants (TRUNCATE etc.) | Follow B1 grants-hardening pattern for every new table |
| Primary methodology ambiguity | Partial unique on `role = 'primary'` (Owner confirm) |
| Premature B3 coupling | No executions / `active_execution_id` in B2 |
| Counting / apply history gaps | Record authorizations; note `schema_migrations` may be unavailable (B1 experience) |
| Treating readiness as implementation auth | OD-F2-5: separate local + Dev apply authorizations required |

---

## 11. Validation plan (when B2 is later authorized)

Static / local (no remote write required for docs; live tests only after apply auth):

1. Additive migration(s) only; B1 files untouched.  
2. Exactly the B2 tables present; B3+ absent; no `platform_methodologies`.  
3. Composite FKs to `platform_sessions` / `platform_clients`.  
4. `specialty_id NOT NULL` + FK to `radionics_specialties`.  
5. Testimony `UNIQUE (session_id)`; no therapist INSERT/UPDATE/DELETE policies or grants.  
6. RLS + grants: authenticated **SELECT only** on B2 tables; anon none; no TRUNCATE/TRIGGER/REFERENCES; writes only via SECURITY DEFINER RPCs.  
7. `start_session` allow/deny matrix: incomplete identity (missing any Product 03 / F1 required field), unapproved/expired primary cert **at transaction time**, non-draft session, missing primary plan.  
8. A/B therapist isolation.  
9. Idempotent start / plan / draft-context replay via `platform_command_idempotency`.  
10. After start, client profile change does not alter testimony JSON.  
11. Cert expiry after start does not mutate plan/testimony rows; new starts for that specialty blocked.  
12. B1 lifecycle CHECKs still hold after start.  
13. F0/F1 validator remains green; optional new static B2 validator asserts RPC-only write posture and no `platform_methodologies`.  
14. No Product/AGENTS edits unless Owner-directed contradiction fix.  
15. No B3+ tables or `active_execution_id` introduced.

---

## 12. Owner decisions — APPROVED

| ID | Decision | Status | Approved resolution |
|----|----------|--------|---------------------|
| **OD-B2-1** | Approve this readiness as design baseline for B2? | **APPROVED** | B2 readiness becomes the design baseline |
| **OD-B2-2** | Include `start_session` RPC in B2? | **APPROVED** | `start_session` belongs in B2 |
| **OD-B2-3** | Draft intention / schedule / mode mutation path? | **APPROVED** | Draft intention/context patch via **RPC-only** |
| **OD-B2-4** | Plan item write path? | **APPROVED** | Plan writes via **RPC-only**; B2 tables **SELECT-only** for authenticated users |
| **OD-B2-5** | Enforce exactly one `primary` plan item per session? | **APPROVED** | Exactly one primary plan item per session |
| **OD-B2-6** | May complementary plan items exist before executions (B3)? | **APPROVED** | Complementary plan items may exist before B3 executions |
| **OD-B2-7** | Governed in-session testimony correction in B2? | **APPROVED** | Testimony correction out of B2; snapshot immutable |
| **OD-B2-8** | Specialty resolution at write time? | **APPROVED** | Caller passes `specialty_id`; server reconciles snapshots |
| **OD-B2-9** | B1 grants hardening before B2 apply? | **APPROVED** | B1 grants hardening applied/confirmed before B2 apply |
| **OD-B2-10** | Separate implementation vs apply authorizations? | **APPROVED** | Local implementation and Supabase apply require **separate** authorizations |

**No Product document contradiction requiring Product edits was found** for B2 scope: OD-F2-6 already reconciles “specialty = methodology catalogue” with Product 03 eligibility language.

**Important:** Approval of OD-B2-1…10 freezes the B2 design baseline. It does **not** authorize local SQL/code implementation or any Supabase apply.

---

## 13. Relationship to B1 (checklist)

| B1 asset | B2 use |
|----------|--------|
| `platform_clients` | Source profile for testimony capture; composite FK target |
| `platform_sessions` | Parent of testimony + plan; holds intention/context; start mutates lifecycle |
| `platform_command_idempotency` | Dedup for start / plan commands |
| `platform_guard_mutable_owned_row` | Reuse or extend for mutable plan rows |
| Grants hardening pattern | Copy for new tables |
| Deferred `active_execution_id` | Remains deferred to B3 |

---

## 14. Implementation posture (when later authorized)

Suggested physical order (still **not authorized** by this document):

1. Additive migration: testimony + plan tables, constraints, indexes, RLS, **SELECT-only** grants (no INSERT/UPDATE/DELETE for authenticated).  
2. Same batch or follow-on: SECURITY DEFINER RPCs — plan commands, draft context patch, `start_session` (with primary-cert check at transaction time) — all idempotent.  
3. Local static validator for B2 (RPC-only posture; no `platform_methodologies`; no B3+).  
4. Local report.  
5. Separate Owner auth for Development apply (after OD-B2-9 grants-hardening confirmation).  
6. No UI/services until F3/Experience authorization.

---

## 15. Confirmation — nothing implemented in this task

This readiness pass produced **documentation only**.

- **No** SQL objects created or altered  
- **No** migrations added or modified  
- **No** Supabase connections or writes  
- **No** UI, services, tests, or methodology behaviour changes  
- **No** Product / AGENTS / F2 v1.2 / F0–F1 contract edits  
- **No** B2 implementation started  
- **No** commit / push / deploy

---

## 16. Stop line

**B2 READINESS APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION**
