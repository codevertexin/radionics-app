---
title: Platform Session F2 — Supabase Persistence Pre-Implementation Readiness
document_id: RADIONICS-PLATFORM-SESSION-F2-PERSISTENCE-READINESS
version: 1.2
status: APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION
classification: Technical Pre-Implementation Readiness
scope: F2 only
owner: Product Owner
author: CodeVertex Innovations, LLC
last_updated: 2026-08-06
revision_note: >-
  v1.2 consolidates Owner Decisions OD-F2-1…6 as APPROVED — platform_* prefix;
  Product 03/04 + F0/F1 as persistence authority; mandatory platform_report_templates;
  dual transcript capture modes without raw audio; specialty_id NOT NULL FK to
  radionics_specialties (Option A with Specialty↔Methodology terminology reconciliation);
  no platform_methodologies; design approved but implementation/SQL/Dev/Production still unauthorized.
depends_on:
  - RADIONICS-PRODUCT-CONSTITUTION
  - RADIONICS-PLATFORM-UX-BACKLOG
  - RADIONICS-PRODUCT-DECISIONS
  - RADIONICS-PLATFORM-SESSION-EXPERIENCE
  - RADIONICS-PLATFORM-SESSION-IMPLEMENTATION-READINESS
  - Platform Session F0-F1 Contract Baseline
authority_checkpoints:
  - 401b5b8 feat(platform-session): establish F0-F1 domain contracts
  - c273306b0e3af82ccb87a11358165e8759f09c4d docs(platform-session): freeze approved product governance
implementation_authorization: none — design approved; no migrations, SQL, Dev writes, RPCs, RLS changes, or Production
language: English
---

# Platform Session F2 — Supabase Persistence Pre-Implementation Readiness

## 1. Executive Verdict

**APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION**

Owner Decisions **OD-F2-1 … OD-F2-6** are consolidated in this v1.2 document. The persistence architecture for Platform Session is **approved as design**.

This approval does **not** authorize SQL, migrations, RLS changes, RPCs, Supabase Development writes, type regeneration, repository wiring, UI work or Production.

Local Supabase migrations today contain specialties, certifications, methodology/knowledge/materials libraries and workflow templates. They contain **no** Platform Session persistence tables yet.

Historical docs that describe methodology-coupled session tables (`radionics_session_details`, therapeutic embedded snapshots, etc.) remain in the repository for history but are **not authoritative** for Platform Session persistence (OD-F2-1). Product 03/04, AGENTS Architecture Boundaries and F0/F1 contracts prevail.

F2 is **not** implemented. Batch B1 is the next possible implementation unit and remains **NOT AUTHORIZED**.

---

## 2. Evidence Baseline

### 2.1 Authority (frozen, read-only)

| Source | Role |
|--------|------|
| `docs/AGENTS.md` | Authority hierarchy; Platform Session Architecture Boundaries |
| `docs/Product/00`–`04` | Constitution, UX backlog, decisions (incl. PD-009), experience, readiness |
| `docs/Engine/Session/Platform_Session_F0_F1_…Report.md` | Contract baseline; persistence deferred |
| Commits `401b5b8`, `c273306` | Approved code + governance checkpoints |

### 2.2 Platform contracts inspected

`src/platform/session/**` — lifecycle, testimony, plan, executions, notes, transcript, timeline, contributions, archive assembly/seal, report projection/rendition, repository interfaces (no Supabase imports).

### 2.3 Application / mock reality

| Area | Path | Finding |
|------|------|---------|
| Legacy types | `src/types/index.ts` | `Client.name`; `SessionStatus` includes `reported` |
| Clients | `src/services/clientsService.ts` | In-memory for all `VITE_DATA_MODE` values |
| Sessions | `src/services/sessionsService.ts` | In-memory; not wired to Supabase |
| Data mode | `src/lib/dataMode.ts` | Default mock; credentials alone do not persist sessions |
| Auth | `src/lib/supabase/auth.ts`, Phase1 SQL | `therapist_id = auth.uid()` |
| Workflow | `src/lib/workflow-adapter/**`, workflow migrations | Template/step catalogue exists; no session rows |
| Package | `package.json` | No `supabase gen types` script |

### 2.4 Local migration baseline (19 files under `supabase/migrations/`)

**Public tables present (19):**  
`radionics_admin_allowlist`, `radionics_specialties`, `radionics_specialty_requests`, `therapist_specialty_certifications`, `therapist_specialty_documents`, `methodology_tools`, `methodology_assets`, `specialty_tools`, `specialty_asset_content`, `activation_scripts`, `activation_script_links`, `methodology_asset_media`, `methodology_protocols`, `protocol_assets`, `protocol_steps`, `library_materials`, `library_material_links`, `workflow_templates`, `workflow_steps`

**RLS / ownership helpers present:**  
`is_radionics_admin()`, `has_approved_specialty_certification(uuid)`, `can_read_library_material(uuid)`, `can_read_workflow_template(uuid)`, `set_updated_at()`, cert storage path helpers, `radionics_admin_requester_profiles`

**Ownership pattern already proven:** therapist rows use `therapist_id uuid REFERENCES auth.users(id)` with RLS `therapist_id = auth.uid()`; admin via allowlist/JWT claim helper.

**Absent from migrations:** clients, sessions, testimony, plan items, methodology executions, session notes, transcripts, timeline, report contributions, archives, report projections, approved renditions, generated `Database` types.

### 2.5 Dirty worktree note

Unrelated dirty files (docs moves, wizard/workspace/services/diagnostics) were **not** modified for this analysis and do **not** alter the migration baseline under `supabase/migrations/`.

---

## 3. Implemented / Documented / Absent Matrix

| Capability | Migrations | Frontend / mock | Docs | F0/F1 contracts |
|------------|------------|-----------------|------|-----------------|
| Therapist auth + `auth.uid()` | Implemented | Implemented | Documented | N/A (reuse) |
| Specialty / certification RLS | Implemented | Wired (supabase mode) | Documented | N/A |
| Methodology / knowledge / materials | Implemented | Wired | Documented | Must not leak into platform session columns |
| Workflow templates / steps | Implemented | Adapter + mock | Documented | Referenced only as opaque adapter/workflow identity |
| Therapist-scoped clients | **Absent** | Mock `Client` | Planned (Product 04, HUB plan, old DB decisions) | `ClientIdentityProfile` |
| Platform sessions | **Absent** | Mock `Session` | Product 03/04 | `PlatformSessionFacts` |
| Testimony snapshots | **Absent** | Absent | Product 03/04 | `ClientTestimonySnapshot` |
| Session Plan items | **Absent** | Wizard templates ≠ plan | Product 03/04 | `SessionPlan` |
| Methodology executions | **Absent** | One methodology on `Session` | Product 03/04 | `MethodologyExecutionRecord` |
| Execution state | **Absent** | `workflowState` on session | Product 04 | Opaque envelope |
| Notes / transcript / timeline / contributions | **Absent** | Partial UI/mock only | Product 03/04 | Contracts present |
| Archive assembly / seal | **Absent** | Domain-only helpers | Product 03/04 | Assembly vs sealed |
| Report projection / approved rendition | **Absent** | Legacy snapshot/report path | Product 03/04 + PD-009 | Contracts present |
| Old `radionics_session_details` + methodology JSONB | **Absent** | Legacy session shape | Historical docs — **superseded for Platform Session (OD-F2-1)** | Platform model prevails |

---

## 4. Owner Decisions OD-F2-1 … OD-F2-6 (APPROVED)

All six decisions are **APPROVED**. Design is frozen for F2. Implementation remains unauthorized (OD-F2-5).

### 4.1 Background resolutions (unchanged)

| Topic | Resolution | Evidence |
|-------|------------|----------|
| Client ownership | **RADIONICS owns therapist-scoped therapeutic client profiles** | Product 04 §8; HUB plan §5.2 |
| Clients vs HUB users | Clients are **therapeutic contacts**, not authenticated HUB users | HUB owns therapist global profile/auth |
| Therapist identity | `therapist_id = auth.uid()` | Phase1 SQL + `requireAuthUserId` + HUB plan |
| Client sharing between therapists | **Out of scope for F2** | Solo RLS; `therapist_clients` deferred |
| `reported` on session | Outside platform lifecycle | Product 03/04; F0/F1 |
| Archive ≠ report template | Canonical | PD-009; AGENTS boundaries |

### 4.2 Approved decisions

| ID | Status | Decision |
|----|--------|----------|
| **OD-F2-1** | **APPROVED** | Product 03/04 and F0/F1 contracts are the persistence authority for Platform Session. Prior methodology-specific session structures (including `radionics_session_details` and snapshots with embedded therapeutic fields) are **superseded for F2**. Historical documents are retained but **not authoritative** for Platform Session. |
| **OD-F2-2** | **APPROVED** | Canonical Platform Session tables use the prefix **`platform_*`**, distinguishing permanent session infrastructure from methodology, resource, workflow and legacy tables. |
| **OD-F2-3** | **APPROVED** | F2 **includes** the mandatory minimal catalogue **`platform_report_templates`** (official + therapist-owned; stable identity; versioning; status; configuration). Out of F2: visual editor, full composition engine, personalization UI. Canonical session data remains separate from templates, projections and approved renditions. |
| **OD-F2-4** | **APPROVED** | F2 persists transcript **metadata and confirmed text segments only** — **no raw audio**. Two capture modes: (1) **full-session transcription** — explicit start; provisional text transient; only confirmed segments persisted; pause/resume/stop; forms the integral session transcript; (2) **point-in-time voice capture** — requested interval only; does not start or auto-merge into continuous transcript; may relate to session, execution or active context. Transcription is private work material; not auto-included in sealed archive or report; editorial include/exclude ≠ physical delete; automatic retention/definitive purge are later policy. Live transcription bar is future UI, not F2 persistence. |
| **OD-F2-5** | **APPROVED** | Design approval does **not** authorize SQL, migrations, Supabase Development writes, RLS changes, RPCs or Production. Each local batch implementation and each Development apply require **separate explicit authorizations**. |
| **OD-F2-6** | **APPROVED — Option A with terminology reconciliation** | A Specialty represents a certifiable methodology. `radionics_specialties` remains the sole canonical catalogue. UI presents each record as a **Methodology**. **Do not** create `platform_methodologies` or a duplicate catalogue. `specialty_id uuid NOT NULL` on plan items and executions, FK → `radionics_specialties(id)`. Snapshots `methodology_id` / `methodology_slug` / `methodology_name` reconciled from the specialty at creation; optional `specialty_slug` / `specialty_name` historical snapshots. Server-side eligibility requires **approved** certification for create/start session and complementary invocation. `pending` / `rejected` / `expired` / `not_certified` block new use; later expiry does not alter historical sessions. MAP, 35 Graphs, 49 Angels and future methodologies share this catalogue. Workflows/adapters remain separate technical identities. Product 03 “eligibility context” is a **presentation/language** rule (UI says Methodology, not “certification as the methodology”), not a mandate for a second persistent entity. |

---

## 5. Approved Persistence Architecture

### 5.1 Principles

1. Methodology-neutral columns only on `platform_*` session tables (OD-F2-2).
2. Therapist ownership on every root row; **composite ownership integrity** via `UNIQUE (id, therapist_id)` and composite FKs (see §5.4).
3. Opaque JSONB for methodology execution state and sealed archive payload.
4. Relational rows for queryable platform facts, lifecycle, executions, notes, timeline, contributions.
5. Fail-closed lifecycle and one-active-execution invariants in the database.
6. Immutable sealed archives and approved renditions (no UPDATE/DELETE for owning therapist).
7. Additive migrations only when separately authorized; do not alter specialty/resource/workflow catalogues except grants if required.
8. No service-role in the browser.
9. Active therapeutic duration uses `accumulated_active_duration_ms` plus `active_timer_started_at` (see §6.2 / §7.3).
10. Certifiable methodologies are anchored by `specialty_id NOT NULL` → `radionics_specialties` (OD-F2-6). No `platform_methodologies` table.
11. Transcript persistence supports full-session and point-in-time modes; no raw audio (OD-F2-4).

### 5.2 Capability groups

| Group | Tables |
|-------|--------|
| A. Identity | `platform_clients` |
| B. Session core | `platform_sessions`, `platform_client_testimony_snapshots`, `platform_session_plan_items` |
| C. Executions | `platform_methodology_executions` (state JSONB on row; history deferred) |
| D. Session records | `platform_session_notes`, `platform_transcript_captures`, `platform_transcript_segments`, `platform_timeline_events`, `platform_report_contributions` |
| E. Archive | `platform_session_archive_assemblies`, `platform_sealed_session_archives` |
| F. Reports | `platform_report_templates` (**mandatory**), `platform_report_projections`, `platform_approved_report_renditions` |
| G. Commands | `platform_command_idempotency` |

**Table count:** **16 tables** — 15 session-domain tables + mandatory `platform_report_templates`.  
**Not in F2:** `platform_methodologies` (forbidden duplicate catalogue); execution-state revision history; `therapist_clients`; raw audio objects; client portal links; legacy `radionics_session_details`.

### 5.3 Normalization vs embedding

| Data | Choice | Justification |
|------|--------|---------------|
| Session facts | Relational | Lifecycle queries, RLS, concurrency |
| Plan items | Relational rows | Distinct from executions; order/role queryable |
| Executions | Relational + state JSONB | Multiple per session; one-active index; opaque state |
| Methodology catalogue | Existing `radionics_specialties` | OD-F2-6; no duplicate registry |
| Execution state history | **Defer** | Optimistic `row_revision` sufficient for F2 |
| Notes / timeline / contributions | Relational | Disposition, append semantics, RLS |
| Transcript | Capture row + segment rows; two modes | OD-F2-4; confirmed text only |
| Live assembly | Relational source-of-truth; optional assembly snapshot JSONB | Projection of live rows |
| Sealed archive | Immutable metadata + **JSONB envelope** | Atomic seal; template independence |
| Report templates | Relational catalogue | OD-F2-3 mandatory |
| Report projection | Relational + JSONB edits/overrides | Editable until approval |
| Approved rendition | Immutable metadata + JSONB sealed content | PD-009 immutability |
| Command idempotency | Relational table | Dedup retries |

### 5.4 Composite ownership integrity

Every owned `platform_*` table carries `therapist_id uuid NOT NULL` and:

```text
PRIMARY KEY (id)
UNIQUE (id, therapist_id)
```

Parent → child FKs are **composite** so a child cannot point at a parent owned by a different therapist:

| Child | Composite FK |
|-------|----------------|
| `platform_sessions` | `(client_id, therapist_id)` → `platform_clients (id, therapist_id)` |
| All session-scoped children | `(session_id, therapist_id)` → `platform_sessions (id, therapist_id)` |
| Testimony (also client) | `(client_id, therapist_id)` → `platform_clients (id, therapist_id)` and `(session_id, therapist_id)` → sessions |
| Segments | `(capture_id, therapist_id)` → `platform_transcript_captures (id, therapist_id)` |
| Sealed archives | `(session_id, therapist_id)` → sessions; `(testimony_snapshot_id, therapist_id)` → testimony |
| Projections / renditions | `(session_id, therapist_id)`, `(archive_id, therapist_id)` as applicable |
| `active_execution_id` on sessions | `(active_execution_id, therapist_id)` → executions (nullable) |
| Optional note/timeline/contribution `execution_id` | `(execution_id, therapist_id)` → executions when not null |

`ON DELETE` default: `RESTRICT` for completed/sealed graphs.  
Triggers/RPCs **deny** reassignment of `therapist_id` or cross-owner `session_id` / `client_id` changes.

### 5.5 Specialty ↔ Methodology reconciliation (OD-F2-6 APPROVED)

**Canonical rule:** *A Specialty represents a certifiable methodology.*

| Concern | Decision |
|---------|----------|
| Catalogue | `radionics_specialties` only |
| UI language | Present catalogue rows as **Methodologies** |
| Duplicate registry | **Forbidden** — no `platform_methodologies` in F2 |
| Plan items / executions | `specialty_id uuid NOT NULL REFERENCES radionics_specialties(id) ON DELETE RESTRICT` |
| Product snapshots | `methodology_id`, `methodology_slug`, `methodology_name` required; reconciled from specialty at create/invoke time |
| Historical specialty snapshots | `specialty_slug`, `specialty_name` may be stored |
| Technical identities | `adapter_*` and `workflow_*` remain separate opaque/technical fields |
| Eligibility | Server-side: therapist must have certification status **`approved`** for that `specialty_id` to create/start a session using it or to invoke it as complementary |
| Blocked statuses | `pending`, `rejected`, `expired`, `not_certified` — no **new** uses |
| Historical sessions | Later certification expiry does **not** alter or delete past sessions/executions |
| Scope | MAP, 35 Graphs, 49 Angels and future methodologies use the same catalogue and certification process |

**Product 03 interpretation:** “Specialty or certification is eligibility context” governs **presentation** (do not present “certification” as if it were the methodology itself). It does **not** authorize a second persistent methodology entity.

**F0/F1 note:** Domain contract `specialtyId?` remains a TypeScript optional for host neutrality; **persistence** requires `specialty_id NOT NULL` per OD-F2-6. Adapters must supply a reconciled specialty UUID when persisting.

---

## 6. Table-by-Table Conceptual Schema

> PostgreSQL types are proposed. No SQL files are created by this document.  
> Delete behaviour default: child rows `ON DELETE RESTRICT` from sealed/completed sessions; soft-cancel preserves rows.  
> `therapist_id` always `uuid NOT NULL REFERENCES auth.users(id)`.  
> Every owned table: `PRIMARY KEY (id)` **and** `UNIQUE (id, therapist_id)` for composite FK targets.

### 6.1 `platform_clients` — mutable profile

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `therapist_id` | `uuid` | NO | — | Owner |
| `display_name` | `text` | NO | — | Distinct from full name |
| `full_name` | `text` | NO | — | Testimony-ready |
| `date_of_birth` | `date` | NO | — | Required for testimony-ready profile before start |
| `address` | `text` | NO | — | |
| `locality` | `text` | NO | — | |
| `country` | `text` | NO | — | |
| `postal_code` | `text` | YES | NULL | When applicable |
| `phone` | `text` | YES | NULL | Optional contact |
| `whatsapp` | `text` | YES | NULL | Optional |
| `email` | `text` | YES | NULL | Optional |
| `legacy_name` | `text` | YES | NULL | Migration aid from `Client.name` |
| `row_revision` | `integer` | NO | `1` | Optimistic concurrency |
| `created_at` / `updated_at` | `timestamptz` | NO | `now()` | |

- **Constraints:** `UNIQUE (id, therapist_id)`; display/full name non-empty CHECKs.  
- **Immutable:** no (profile editable; testimony is separate).  
- **Indexes:** `(therapist_id)`, `(therapist_id, display_name)`.  
- **RLS:** owner CRUD where `therapist_id = auth.uid()`; no cross-therapist share in F2; deny `therapist_id` reassignment.

### 6.2 `platform_sessions` — mutable until terminal

| Column | Type | Null | Default |
|--------|------|------|---------|
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `therapist_id` | `uuid` | NO | — |
| `client_id` | `uuid` | NO | — |
| `lifecycle_status` | `text` | NO | `'draft'` |
| `session_mode` | `text` | NO | — |
| `intention` | `text` | YES | NULL |
| `scheduled_at` | `timestamptz` | YES | NULL |
| `scheduling_timezone` | `text` | YES | NULL |
| `active_execution_id` | `uuid` | YES | NULL |
| `accumulated_active_duration_ms` | `bigint` | NO | `0` |
| `active_timer_started_at` | `timestamptz` | YES | NULL |
| `started_at` / `closing_entered_at` / `completed_at` / `cancelled_at` | `timestamptz` | YES | NULL |
| `cancellation_reason` | `text` | YES | NULL |
| `row_revision` | `integer` | NO | `1` |
| `created_at` / `updated_at` | `timestamptz` | NO | `now()` |

- **Constraints:** `UNIQUE (id, therapist_id)`; lifecycle/session_mode CHECKs; **forbid** `'reported'`.  
- **Composite FK:** `(client_id, therapist_id)` → `platform_clients (id, therapist_id)` RESTRICT.  
- **Composite FK (nullable):** `(active_execution_id, therapist_id)` → `platform_methodology_executions (id, therapist_id)`.  
- **`active_timer_started_at`:** start of the **current open** therapeutic active interval. Non-null only while the session is therapeutically “clock running” (typically `lifecycle_status = 'in_progress'` after start/resume). Null while `draft`, `paused`, `closing`, `completed`, `cancelled`, or whenever the active clock is stopped.  
- **Indexes:** `(therapist_id, updated_at DESC)`, `(client_id, therapist_id)`, `(lifecycle_status)`.  
- **RLS:** owner via `therapist_id`; terminal rows not updated except controlled RPCs (prefer none).  
- Duration semantics: see §7.3 (multi-cycle).

### 6.3 `platform_client_testimony_snapshots` — immutable after insert

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | PK |
| `session_id` | `uuid` | NO | One snapshot per session |
| `therapist_id` | `uuid` | NO | |
| `client_id` | `uuid` | NO | |
| `captured_at` | `timestamptz` | NO | Explicit start |
| `identity` | `jsonb` | NO | Full `ClientIdentityProfile` |
| `schema_version` | `text` | NO | e.g. `platform.session.testimony.v1` |
| `created_at` | `timestamptz` | NO | |

- **Constraints:** `UNIQUE (id, therapist_id)`; `UNIQUE (session_id)`; composite FKs to sessions and clients on `(…, therapist_id)`.  
- **Mutable:** no. Capture only via start-session RPC (`draft → in_progress`).

### 6.4 `platform_session_plan_items`

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | PK |
| `session_id` | `uuid` | NO | |
| `therapist_id` | `uuid` | NO | |
| `specialty_id` | `uuid` | **NO** | FK → `radionics_specialties(id)` ON DELETE RESTRICT |
| `methodology_id` | `text` | NO | Product snapshot; reconciled from specialty at create |
| `methodology_slug` | `text` | NO | Snapshot |
| `methodology_name` | `text` | NO | Snapshot (UI “Methodology”) |
| `specialty_slug` / `specialty_name` | `text` | YES | Optional historical/technical snapshots |
| `role` | `text` | NO | `primary` \| `complementary` |
| `sequence_order` | `integer` | NO | |
| `schema_version` | `text` | NO | |
| `created_at` / `updated_at` | `timestamptz` | NO | |

- **Constraints:** `UNIQUE (id, therapist_id)`; `UNIQUE (session_id, sequence_order)`; composite FK `(session_id, therapist_id)` → sessions.  
- **Eligibility (server-side):** inserting/updating a plan item that will be used requires therapist certification **`approved`** for `specialty_id`. Blocked: `pending`, `rejected`, `expired`, `not_certified`.  
- Not a workflow or report template.

### 6.5 `platform_methodology_executions`

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | PK |
| `session_id` | `uuid` | NO | |
| `therapist_id` | `uuid` | NO | |
| `specialty_id` | `uuid` | **NO** | FK → `radionics_specialties(id)` ON DELETE RESTRICT |
| `methodology_id` / `methodology_slug` / `methodology_name` | `text` | NO | Snapshots reconciled from specialty |
| `specialty_slug` / `specialty_name` | `text` | YES | Optional historical snapshots |
| `role` | `text` | NO | primary/complementary |
| `sequence_order` | `integer` | NO | Invocation order |
| `status` | `text` | NO | not_started/active/paused/completed/abandoned |
| `adapter_id` / `adapter_version` | `text` | YES | Technical adapter identity |
| `workflow_template_id` / `workflow_version` | `text` | YES | Technical workflow identity (opaque) |
| `state_schema_version` | `text` | NO | |
| `state_payload` | `jsonb` | NO | `{}` — **opaque** |
| `progress` / `completion_awareness` | `jsonb` | YES | Optional |
| `started_at` / `paused_at` / `resumed_at` / `completed_at` | `timestamptz` | YES | Execution-level, not session clock |
| `row_revision` | `integer` | NO | `1` |
| `created_at` / `updated_at` | `timestamptz` | NO | |

- **Constraints:** `UNIQUE (id, therapist_id)`; composite FK to sessions; partial unique `UNIQUE (session_id) WHERE status = 'active'`.  
- **Eligibility (server-side):** creating/activating an execution (primary or complementary) requires certification **`approved`** for `specialty_id` at invoke time. Later expiry does not mutate historical execution rows.  
- No Hawkins/chakra/graph columns. No `platform_methodologies`. State history deferred.

### 6.6 `platform_session_notes` — mutable dispositions

Same columns as before, plus `UNIQUE (id, therapist_id)` and composite FKs `(session_id, therapist_id)` and optional `(execution_id, therapist_id)`.

### 6.7 `platform_transcript_captures` / `platform_transcript_segments`

**Captures** (no raw audio — OD-F2-4):

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | |
| `session_id` | `uuid` | NO | |
| `therapist_id` | `uuid` | NO | |
| `capture_mode` | `text` | NO | `full_session` \| `point_in_time` |
| `execution_id` | `uuid` | YES | Optional active-execution context |
| `status` | `text` | NO | idle/listening/paused/stopped |
| `started_at` / `stopped_at` | `timestamptz` | YES | |
| `consent_recorded` | `boolean` | NO | default false |
| `privacy_label` | `text` | YES | |
| `schema_version` | `text` | NO | |
| timestamps | | | |

**Modes:**

1. **`full_session`** — explicit therapist start of integral session transcription; supports pause/resume/stop; provisional live text is **transient** (not a persisted row until confirmed); only **confirmed** segments are inserted; forms the integral session transcript. Does not imply UI chrome (collapsible live bar is future UX).  
2. **`point_in_time`** — capture for a voice note or detailed analysis interval only; does **not** start or automatically merge into a continuous full-session transcript; may reference session, execution or active context.

**Segments:** `id`, `capture_id`, `session_id`, `therapist_id`, `execution_id?`, `text` (confirmed only), `started_at`, `ended_at?`, `inclusion` (`retained` / `excluded` / `pending_review`), `provenance jsonb`, `schema_version`.

**Privacy / archive / report:**

- Transcript is **private work material**.  
- Not automatically copied into sealed archive or report projection.  
- Editorial include/exclude ≠ physical delete.  
- Automatic retention / definitive purge = later policy (not F2).

Each table: `UNIQUE (id, therapist_id)`; composite FKs as in §5.4.

### 6.8 `platform_timeline_events` — append-only

Same columns; `UNIQUE (id, therapist_id)`; composite session FK; no UPDATE/DELETE for therapist.

### 6.9 `platform_report_contributions`

Same columns; composite ownership FKs; candidates ≠ approved sections.

### 6.10 `platform_session_archive_assemblies`

Same columns; `UNIQUE (id, therapist_id)`; composite session FK; retain read-only after seal as `superseded_by_seal` recommended.

### 6.11 `platform_sealed_session_archives` — immutable

Same columns; `UNIQUE (id, therapist_id)`; `UNIQUE (session_id)`; composite FKs to session and testimony; `report_template_authority IS NULL`; no UPDATE/DELETE for therapist.

### 6.12 `platform_report_projections` — mutable draft

Same columns; composite FKs to session and sealed archive with `therapist_id`.

### 6.13 `platform_approved_report_renditions` — immutable

Same columns; composite ownership FKs; sharing must not mutate `sealed_content`.

### 6.14 `platform_report_templates` — mandatory catalogue (OD-F2-3)

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | Stable identity |
| `therapist_id` | `uuid` | YES | NULL = official/platform template; non-null = therapist-owned |
| `name` | `text` | NO | |
| `version` | `text` | NO | Versioning |
| `status` | `text` | NO | e.g. active/inactive/draft |
| `configuration` | `jsonb` | NO | Template configuration payload |
| `schema_version` | `text` | NO | |
| `created_at` / `updated_at` | `timestamptz` | NO | |

- **Constraints:** `UNIQUE (id)` always; for therapist-owned rows also `UNIQUE (id, therapist_id)` when `therapist_id` not null (official rows use `therapist_id IS NULL` and are readable by certified therapists per RLS design).  
- **In F2:** identity, versioning, status, configuration persistence only.  
- **Out of F2:** visual editor, full composition engine, personalization UI.  
- Canonical session archive remains independent of any selected template (PD-009).

### 6.15 `platform_command_idempotency` — command deduplication

Materializes idempotent retries for lifecycle, activate, seal and approve commands.

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `therapist_id` | `uuid` | NO | — | Owner |
| `idempotency_key` | `text` | NO | — | Client-supplied key |
| `command_type` | `text` | NO | — | e.g. `start_session`, `pause_session`, `resume_session`, `enter_closing`, `return_from_closing`, `complete_session`, `cancel_session`, `activate_execution`, `seal_archive`, `approve_rendition` |
| `session_id` | `uuid` | YES | NULL | When command is session-scoped |
| `request_fingerprint` | `text` | YES | NULL | Hash of normalized request payload |
| `response_status` | `text` | NO | — | `accepted` \| `conflict` \| `failed` |
| `response_body` | `jsonb` | YES | NULL | Cached safe response for replay |
| `row_revision_seen` | `integer` | YES | NULL | Optional revision observed |
| `created_at` | `timestamptz` | NO | `now()` | |
| `expires_at` | `timestamptz` | NO | — | Retention horizon |

- **Constraints:** `UNIQUE (id, therapist_id)`; **`UNIQUE (therapist_id, idempotency_key)`**; optional composite FK `(session_id, therapist_id)` → sessions when `session_id` not null.  
- **RLS:** SELECT/INSERT own rows (`therapist_id = auth.uid()`); **no UPDATE/DELETE** for therapist (append/replay only via RPC). Admin purge only via authorized maintenance.  
- **Retention:** `expires_at` default e.g. `now() + interval '7 days'` (Owner-confirmable); batch purge job later — not in F2 browser.  
- **Batch:** created in **B1** alongside sessions so lifecycle RPCs can use it from first writable commands; indexes `(expires_at)`, `(therapist_id, created_at DESC)`.  
- **Behaviour:** first successful command inserts row + returns result; retry with same key returns cached `response_body` without re-applying side effects; same key with different fingerprint → fail closed.

---

## 7. Lifecycle and Command Boundaries

### 7.1 Allowed transitions (database-enforced)

Mirror F0/F1:

- `draft → in_progress | cancelled`
- `in_progress → paused | closing | cancelled`
- `paused → in_progress | closing | cancelled`
- `closing → in_progress | completed`
- `completed` / `cancelled` → ∅

### 7.2 Recommended RPCs (design only; not implemented)

| Command | Behaviour |
|---------|-----------|
| `platform_transition_session(...)` | Generic fail-closed dispatcher; prefer typed commands below |
| `platform_start_session` | See §7.3 Start |
| `platform_pause_session` | See §7.3 Pause |
| `platform_resume_session` | See §7.3 Resume |
| `platform_enter_closing` | See §7.3 Closing |
| `platform_return_from_closing` | See §7.3 Return from closing |
| `platform_complete_session` | See §7.3 Completion |
| `platform_cancel_session` | See §7.3 Cancellation |
| `platform_seal_session_archive` | See §10 |
| `platform_activate_execution` | See §8 |

All mutating commands require `idempotency_key` and consult `platform_command_idempotency` (§6.15).

### 7.3 Active therapeutic timer — multi-cycle semantics

Fields:

- `accumulated_active_duration_ms` — sum of **closed** active intervals (never decreases).  
- `active_timer_started_at` — timestamp when the **current** open interval began; **NULL** when the clock is not running.  
- `started_at` — first transition into therapeutic start (`draft → in_progress`); set once.  
- `closing_entered_at` — last entry into `closing` (may be overwritten on re-entry if Owner prefers; recommend set on each enter-closing).  
- `completed_at` / `cancelled_at` — terminal once.

Helper (conceptual): when stopping an open interval at time `t`:

```text
IF active_timer_started_at IS NOT NULL THEN
  accumulated_active_duration_ms += (t - active_timer_started_at) in ms
  active_timer_started_at := NULL
END IF
```

| Command | From → To | Timer / duration effects |
|---------|-----------|--------------------------|
| **Start** | `draft → in_progress` | Insert testimony; set `started_at = now()` if null; set `active_timer_started_at = now()`; `accumulated` unchanged (still 0). |
| **Pause** | `in_progress → paused` | Close open interval (add elapsed to `accumulated`); clear `active_timer_started_at`. May pause active execution separately. |
| **Resume** | `paused → in_progress` | Set `active_timer_started_at = now()`; do **not** reset `accumulated`. Supports unlimited pause/resume cycles. |
| **Enter closing** | `in_progress \| paused → closing` | If coming from `in_progress` with open timer, close interval into `accumulated` and clear `active_timer_started_at`. From `paused`, timer already null. Set `closing_entered_at = now()`. Clock does **not** run in `closing`. |
| **Return from closing** | `closing → in_progress` | Set `active_timer_started_at = now()`; resume therapeutic clock for further work; `accumulated` preserved. Supports multiple closing↔in_progress cycles before completion. |
| **Completion** | `closing → completed` | Ensure timer null (close if any stray open interval); set `completed_at`; terminal; no further timer changes. |
| **Cancellation** | `draft \| in_progress \| paused → cancelled` | If open timer (`in_progress`), close into `accumulated` then clear; set `cancelled_at` (+ reason); terminal. From `draft`/`paused`, timer already null. |

**Invariants:**

- At most one open interval: `active_timer_started_at` is either null or a single start instant.  
- Displayed live duration ≈ `accumulated_active_duration_ms + (now() - active_timer_started_at)` when timer non-null.  
- Client-supplied timestamps rejected; use server `now()` / `clock_timestamp()`.  
- Invalid transitions: no partial timer writes.

**Why `reported` is excluded:** reporting is independent (PD-009 / Product 03).

**Legacy compatibility:** adapters map platform statuses ↔ legacy without writing `reported` to `platform_sessions`.

### 7.4 Concurrency inside lifecycle RPCs

Valid patterns only:

1. `SELECT … FROM platform_sessions WHERE id = $1 AND therapist_id = $uid FOR UPDATE;` then compute; then `UPDATE … WHERE id = $1 AND row_revision = $expected;`  
2. Or single-statement optimistic: `UPDATE … WHERE id = $1 AND therapist_id = $uid AND row_revision = $expected RETURNING *;` (no row → conflict).

**Invalid / forbidden formulation:** `UPDATE … FOR UPDATE` (PostgreSQL does not support `FOR UPDATE` on `UPDATE`).

On revision mismatch → `409 conflict`; do not apply transition or timer mutation.

---

## 8. One-Active-Execution Enforcement

1. **Partial unique index** on `platform_methodology_executions (session_id) WHERE status = 'active'`.  
2. **RPC** `platform_activate_execution(session_id, execution_id, expected_revisions…)`:  
   - `SELECT … FOR UPDATE` on the session row and the session’s execution rows (same `therapist_id`);  
   - then `UPDATE` previous active → `paused` and target → `active`;  
   - update `platform_sessions.active_execution_id` with composite ownership;  
   - preserve `state_payload`.  
3. Cross-session actives allowed by index scope.  
4. Primary vs complementary is a column, not an activity constraint.  
5. Sequence_order unique per session recommended.  
6. Idempotency via `platform_command_idempotency`.

Do not encode PX-402/PX-403 UX here.

---

## 9. JSONB / Normalization Decisions

| Field | Storage | Validation owner |
|-------|---------|------------------|
| Execution `state_payload` | JSONB opaque | Methodology adapter; platform checks `state_schema_version` presence only |
| Progress / completion awareness | Optional JSONB | Methodology optional |
| Testimony `identity` | JSONB snapshot | Platform required-field check at start |
| Timeline / contribution payloads | JSONB + schema_version | Emitter |
| Sealed archive envelope | JSONB | Seal RPC assembles from relational sources |
| Projection edits / overrides | JSONB | Therapist / report UI later |
| Rendition `sealed_content` | JSONB | Approval RPC |

**Payload size:** practical soft limit e.g. 1–2 MB per execution state and per sealed envelope; exact limit Owner-confirmable. Prefer not to store binary audio in JSONB.

**Revisions:** integer `row_revision` on mutable tables; history table deferred.

**Platform must never** SELECT/interpret methodology therapeutic keys inside `state_payload` for generic behaviour.

---

## 10. Archive-Sealing Design

### Flow

`Live relational session → (optional) Archive Assembly row → Sealed Canonical Archive`

1. **Assembly begins** when entering `closing` or explicitly before complete (Product closing flow).  
2. **Seal input:** read session facts, testimony, plan items, all executions (+ state), notes, permitted transcript captures/segments, timeline, contributions.  
3. **Preconditions:** `lifecycle_status = 'completed'`; testimony row exists; sealing metadata present.  
4. **Atomic RPC** `platform_seal_session_archive`:  
   - lock session;  
   - build envelope JSONB;  
   - `content_sha256`;  
   - insert sealed row;  
   - mark assembly superseded;  
   - commit.  
5. **Idempotent retry:** if sealed row exists for `session_id` with same hash → return existing; if different hash → fail closed.  
6. **Immutability:** RLS deny UPDATE/DELETE; revoke grants; optional trigger rejecting updates.  
7. **`report_template_authority` always NULL**; templates never written into envelope as authority.  
8. Seal does **not** create a report projection.

---

## 11. Report-Projection Design

| Concept | Persistence |
|---------|-------------|
| Report template | Mandatory `platform_report_templates` catalogue (OD-F2-3) |
| Projection/draft | `platform_report_projections` |
| Therapist edits / inclusion | JSONB on projection |
| Approved rendition | `platform_approved_report_renditions` immutable |
| Sharing | Deferred separate mutable state; must not alter rendition content |

- New template selection → new projection from same `archive_id`.  
- Multiple reports per archive allowed.  
- Source-trace preserved in contribution provenance and projection overrides.  
- Report lifecycle statuses stored on projection; independent from session lifecycle.

---

## 12. RLS Matrix

Predicate base: `therapist_id = auth.uid()` for therapist-owned rows.  
Ownership integrity: composite `UNIQUE (id, therapist_id)` + composite FKs (§5.4).  
Certification eligibility for plan/execution writes is enforced in **server RPCs / commands**, not only RLS (reuse `has_approved_specialty_certification` or equivalent).  
Admin: `is_radionics_admin()` read (and break-glass write only where already patterned); **no** browser service-role.

| Table | SELECT | INSERT | UPDATE | DELETE | Special |
|-------|--------|--------|--------|--------|---------|
| `platform_clients` | owner | owner | owner | owner (restrict if sessions exist) | No `therapist_id` reassignment |
| `platform_sessions` | owner | owner | owner if non-terminal via RPC | deny if terminal | Composite FK to client; timer RPC-only; start requires approved cert for primary methodology |
| `platform_client_testimony_snapshots` | owner | via start RPC | **deny** | **deny** | Immutable |
| `platform_session_plan_items` | owner | owner + approved cert for `specialty_id` | owner if non-terminal + cert rules | owner if non-terminal | `specialty_id NOT NULL` |
| `platform_methodology_executions` | owner | owner + approved cert | owner if non-terminal | deny if sealed/completed policy | Activate via RPC; `specialty_id NOT NULL` |
| `platform_session_notes` | owner | owner | owner | soft prefer | |
| `platform_transcript_*` | owner | owner | limited | limited | Modes full_session / point_in_time; no audio; private |
| `platform_timeline_events` | owner | owner (append) | **deny** | **deny** | Append-only |
| `platform_report_contributions` | owner | owner | owner (inclusion) | soft | |
| `platform_session_archive_assemblies` | owner | owner/RPC | owner while in_assembly | deny after seal | |
| `platform_sealed_session_archives` | owner | seal RPC only | **deny** | **deny** | Immutable; transcript not auto-copied |
| `platform_report_templates` | official: certified/authenticated read; own: owner | owner for therapist-owned; admin for official | owner/admin per ownership | soft | Mandatory catalogue |
| `platform_report_projections` | owner | owner | owner if not approved chain | owner if draft | FK template by id/version |
| `platform_approved_report_renditions` | owner | approve RPC | **deny** | **deny** | Immutable |
| `platform_command_idempotency` | owner | via RPC | **deny** | **deny** (therapist) | Replay cached response |

### Validation plan (post-implementation; not now)

1. Therapist A creates client/session/notes/archive → full access.  
2. Therapist B cannot SELECT/UPDATE/DELETE A’s rows.  
3. Unauthenticated: all denied.  
4. Admin allowlist: read where policy allows; no silent cross-write in F2.  
5. Attempt second `active` execution same session → unique violation.  
6. Attempt UPDATE sealed archive → denied.  
7. Attempt session status `reported` → check constraint failure.  
8. Attempt child `session_id` of therapist A with `therapist_id` of B → composite FK failure.  
9. Multi-cycle pause/resume/closing/return timer correctness.  
10. Idempotent retry does not double-count duration.  
11. Therapist without **approved** certification cannot create plan item / execution for that `specialty_id`.  
12. After certification expires, historical sessions/executions remain readable and unchanged; new invocations blocked.  
13. Full-session vs point-in-time captures do not auto-merge; no audio columns.  
14. Sealed archive creation does not automatically include transcript segments.

---

## 13. Concurrency and Autosave Design

| Concern | Design |
|---------|--------|
| Version column | `row_revision integer` on all mutable hot tables |
| Pessimistic section | `SELECT … FOR UPDATE` on the target row(s), **then** `UPDATE` |
| Optimistic section | `UPDATE … WHERE id = $1 AND therapist_id = $uid AND row_revision = $expected RETURNING *`; zero rows → `409 conflict` |
| Forbidden | `UPDATE … FOR UPDATE` (invalid SQL) |
| Autosave granularity | Execution state + notes + session header separately; not full-session blob |
| Idempotency | Required keys persisted in `platform_command_idempotency` (§6.15) |
| Timeline/contributions | Append with client-stable ids unique → safe retry |
| Refresh recovery | Reload session + executions by id; conflict merge UI in F3 |
| Transactions | Activate execution + session pointer one TX; seal one TX; timer close+status one TX |
| Prevent silent LWW | No unconditional upsert without revision or idempotency row |

F3 owns client orchestration; F2 must provide DB primitives above.

---

## 14. Additive Migration Batches (no SQL written; not authorized)

| Batch | Status | Prerequisites | Creates | Validation gate | Auth required |
|-------|--------|---------------|---------|-----------------|---------------|
| **B0** | **Complete (documentary)** | OD-F2-1…6 APPROVED in this v1.2 | Design freeze; naming `platform_*`; specialty FK Option A; templates mandatory; transcript modes | This document | None (docs only) |
| **B1** | **Next possible — NOT AUTHORIZED** | Separate local implementation auth + separate Dev apply auth | `platform_clients`, `platform_sessions` (`active_timer_started_at`), `platform_command_idempotency`, composite ownership, lifecycle CHECKs, RLS | A/B isolation; composite FK; idempotency unique | Explicit local + Dev |
| **B2** | Not authorized | B1 applied | Testimony, plan items with `specialty_id NOT NULL` + cert eligibility checks | Start-session + approved-cert gate | Explicit |
| **B3** | Not authorized | B2 | Executions + partial unique active + activate RPC + cert gate | Cross-session active OK; dual active fails; unapproved cert blocked | Explicit |
| **B4** | Not authorized | B3 | Notes, transcript (modes), timeline, contributions | Mode separation; no audio | Explicit |
| **B5** | Not authorized | B4 | Assembly + sealed archives + seal RPC | Seal ≠ auto-include transcript | Explicit |
| **B6** | Not authorized | B5 | **`platform_report_templates`** + projections + approved renditions | Template change ≠ archive mutation | Explicit |
| **B7** | Not authorized | B6 | Indexes, grants, generated types | Compile | Explicit |
| **B8** | Out of F2 | B7 | F3 repositories/mock parity | Separate task | Separate |

Design approval (this document) **never** substitutes for batch authorizations (OD-F2-5).

---

## 15. Legacy Compatibility Strategy

| Legacy | Later migration approach |
|--------|--------------------------|
| `clientsService` in-memory | F3: Supabase repo behind same interface; mock adapter parity |
| `sessionsService` in-memory | Map to `platform_sessions` + executions; keep UI until E1/E2 |
| `SessionStatus.reported` | Remains legacy UI; never persist on `platform_sessions` |
| `Client.name` | Load into `legacy_name`; require `display_name`/`full_name` before start |
| One methodology on `Session` | Become primary `platform_methodology_executions` row |
| `workflowState` embedded | Become `state_payload` for that execution |
| Legacy report snapshot | Adapter from sealed envelope / contributions; do not make snapshot the archive authority |

**Do not modify services in F2 analysis phase.** Preserve current UI until authorized experience units.

---

## 16. Validation Gates (before calling F2 “implemented”)

1. Migrations apply on empty local DB after existing baseline — only after explicit auth.  
2. RLS matrix tests (A/B/anon/admin), including templates and idempotency.  
3. Lifecycle RPC allow/deny matrix matches F0/F1.  
4. Multi-cycle timer tests.  
5. Partial unique active execution tests.  
6. Composite ownership FK tests.  
7. **Approved-certification** required for plan/execution create and complementary invoke; unapproved statuses blocked.  
8. Historical sessions unchanged after later certification expiry.  
9. Seal preconditions and immutability; transcript not auto-included.  
10. Full-session vs point-in-time capture separation; no audio storage.  
11. Projection cannot update archive; templates mandatory catalogue present.  
12. No `platform_methodologies`; no methodology-specific therapeutic columns on platform tables.  
13. Generated types compile (when authorized) — F3.  
14. Explicit local + Development authorizations recorded per batch.  
15. Production write still forbidden without separate authorization.

---

## 17. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Cross-therapist exposure | `therapist_id` RLS + composite FKs + A/B tests |
| Ownership graph spoofing | `UNIQUE (id, therapist_id)` + child composite FKs |
| Use without approved certification | Server-side eligibility on create/start/complementary invoke |
| Expiry rewriting history | Eligibility gates new use only; historical rows immutable w.r.t. cert status |
| Duplicate methodology catalogue | OD-F2-6 forbids `platform_methodologies` |
| Timer double-count | Single `active_timer_started_at`; close-before-clear; idempotency |
| Archive mutability | Deny UPDATE/DELETE; seal RPC only insert |
| Report-template coupling | `report_template_authority IS NULL`; separate `platform_report_templates` |
| Transcript privacy / auto-publish | Private by default; not auto-sealed or auto-reported |
| Full vs point capture confusion | Distinct `capture_mode`; no auto-merge |
| Autosave loss | `SELECT FOR UPDATE` then `UPDATE`, or revision-conditioned `UPDATE` |
| Duplicate actives | Partial unique index + activate RPC |
| Premature implementation | OD-F2-5; B1 NOT AUTHORIZED until separate auth |
| Obsolete DB Decisions | OD-F2-1 — historical docs non-authoritative for Platform Session |
| Dirty worktree interference | Touch only authorized migration paths when authorized |

---

## 18. Explicit Non-Goals

- Creating or applying migrations / SQL  
- Supabase connection or writes (local/Dev/Production) without separate auth  
- Regenerating database types  
- Implementing repositories, RPCs, UI, PX-402/403  
- Live transcription UI bar  
- Audio recording, STT engines, consent UI, retention jobs  
- Report PDF/rendering/sharing; visual template editor  
- Creating `platform_methodologies`  
- Methodology therapeutic implementation (MAP / 35 Graphs / 49 Angels content)  
- Modifying Product docs, AGENTS, F0/F1 contracts  
- Committing, pushing, deploying  
- Starting Batch B1 without new authorization  

---

## 19. Readiness / Authorization Gate

| Gate | Status |
|------|--------|
| Product 00–04 approved | Met |
| F0/F1 contracts frozen | Met |
| Migration baseline inventoried | Met |
| OD-F2-1 … OD-F2-6 | **APPROVED** (this v1.2) |
| Documentary B0 | **Complete** |
| Design review | **Approved** |
| Implementation authorization | **Not granted** |
| Batch B1 local implementation auth | **Not granted** |
| Supabase Development apply auth | **Not granted** |
| Production write authorization | **Not granted** |

---

## 20. Recommended Next Action

1. Treat this v1.2 document as the **approved F2 design baseline**.  
2. Do **not** start B1 until a **separate** explicit authorization for local implementation (and, if applying, Development) is issued (OD-F2-5).  
3. When authorized, begin with Batch B1 only (`platform_clients`, `platform_sessions`, `platform_command_idempotency`, composite ownership, RLS).  
4. Do not invent `platform_methodologies`; use `radionics_specialties` + UI “Methodology” language (OD-F2-6).  
5. Leave unrelated dirty worktree changes untouched.

---

## Document Control

| Field | Value |
|-------|-------|
| Classification | Technical Pre-Implementation Readiness |
| Status | `APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION` |
| Scope | F2 only |
| Version | 1.2 |
| Owner decisions | OD-F2-1…6 **APPROVED** |
| Table count | **16** (15 session-domain + mandatory `platform_report_templates`) |
| Duplicate methodology catalogue | **Forbidden** |
| Implementation authorization implied | **No** |
| Verdict | **APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION** |
