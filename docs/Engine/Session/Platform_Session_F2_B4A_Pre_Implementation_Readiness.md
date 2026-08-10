# Platform Session F2 — Batch B4A Pre-Implementation Readiness

**Status:** `APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`  
**Date:** 2026-08-10  
**Scope:** Documentation / readiness only — Batch **B4A** (platform session notes + timeline events)  
**Depends on:** F2 design baseline v1.2 (`d65f879`); B1–B3 applied/reconciled in Development  
**Does not authorize:** SQL, migrations, Supabase writes, UI, services, tests, methodology behaviour, B4B+/B5+/B6+, commit, push, or deploy

---

## 1. Executive verdict

B4A is the next **persistence** unit after B3. It should materialize **platform session notes** and **meaningful timeline events** as methodology-neutral, therapist-owned rows that can later feed archive/report projection — **without** implementing transcript capture, speech-to-text, live spoken chrome, report contributions, or seal/archive/report pipelines.

**Product framing (Product 03 / AGENTS):**

- **Notes** are platform session artifacts (therapist observations) with inclusion disposition (`private` / `review_for_report` / `included_in_report`).  
- **Timeline** is the meaningful chronological memory of the session — not a click/autosave log.  
- Platform may record platform events; methodologies may later emit meaningful events; therapists may create moments. The platform **preserves** payload without interpreting therapeutic meaning.  
- Methodology-specific content may appear only as **opaque** therapist-entered text or opaque timeline payload — B4A must **not** define therapeutic schema columns.

**Why B4A (not full F2 “B4”):** F2 batch B4 bundled notes, transcript modes, timeline, and contributions. Product and Owner direction now require splitting: **B4A = notes + timeline only**. Full-session transcript, speech/audio, live spoken bottom bar, and report contributions remain **out of B4A** (later B4B/B4C or named batches).

**Recommended write posture (proposed, mirrors B2/B3):** authenticated **SELECT only** on B4A tables; create/update note + append timeline via **SECURITY DEFINER** RPCs with idempotency; follow grants-hardening (no anon EXECUTE; no dangerous table grants). Optional `execution_id` must be **same-session** (reuse B3 `(session_id, therapist_id, id)` uniqueness pattern).

This document is **proposed**, not approved for implementation. No SQL, application code, migrations, Supabase writes, UI, services, or tests were implemented in producing it.

**Label:** `B4A READINESS APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`

---

## 2. Inspected files / authorities

| Authority | Role for B4A |
|-----------|--------------|
| `docs/AGENTS.md` | Platform session domain is methodology-neutral; notes + timeline are platform session assets |
| `docs/Product/00_Product_Vision_&_Experience_Constitution.md` | Experience constitution |
| `docs/Product/01_Platform_UX_Backlog.md` | UX backlog context (PX-005 timeline; PX-101/304 transcript out of B4A) |
| `docs/Product/02_Product_Decisions.md` | PD-007 platform before methodology; PD-009 archive/report separation |
| `docs/Product/03_Platform_Session_Experience.md` | Timeline purpose/events/noise; notes visibility/disposition/context; transcript separation |
| `docs/Product/04_Platform_Session_Implementation_Readiness.md` | Independent notes; append-only meaningful timeline; no click noise |
| `src/platform/session/**` | F1 `SessionNoteRecord`, `TimelineEventRecord`, notes/timeline helpers, repositories |
| `docs/Engine/Session/Platform_Session_F2_Supabase_Persistence_Pre_Implementation_Readiness.md` | §6.6 notes, §6.8 timeline, RLS matrix, batch B4 row (to be split as B4A) |
| `docs/Engine/Session/Platform_Session_F2_B1_Local_Implementation_Report.md` | Sessions ownership / grants patterns |
| `docs/Engine/Session/Platform_Session_F2_B2_Local_Implementation_Report.md` | Testimony/plan; RPC-only + grants hardening |
| `docs/Engine/Session/Platform_Session_F2_B3_Local_Implementation_Report.md` | Executions; same-session FK lesson; Dev apply verified |
| Latest B1/B2/B3 migrations | Live parent graph for composite FKs / idempotency helpers |

**Not modified:** Product 00–05, AGENTS, F2 v1.2 baseline, B1–B3 migrations, F0/F1 contracts, UI, services.

---

## 3. B4A scope and explicit exclusions

### 3.1 In scope (proposed)

1. **`platform_session_notes`** — therapist-authored session notes with kind, body, disposition, provenance, optional `execution_id`.  
2. **`platform_timeline_events`** — append-only meaningful events with source, event type, opaque payload, optional `execution_id`.  
3. **Session-scoped ownership** — composite FKs to `platform_sessions (id, therapist_id)`.  
4. **Optional execution-scoped references** — nullable `execution_id` with **same-session** composite FK to `platform_methodology_executions`.  
5. **RLS / grants** — therapist-scoped SELECT; writes via proposed RPCs; B1/B2/B3 hardening lessons.  
6. **RPC-only mutations** (proposed) — note create/update (body/disposition), timeline append; idempotent via `platform_command_idempotency`.  
7. **Future archive/report readiness** — dispositions and timeline payloads must be sealable later without B4A implementing seal/report.

### 3.2 Explicitly out of scope

| Deferred / forbidden | Batch / rule |
|----------------------|--------------|
| Full-session transcript capture / segments | **B4B+** (or named transcript batch) |
| Speech-to-text / audio storage / retention policy | **Out of B4A** (OD-F2-4: no raw audio in F2 core; STT later) |
| Live spoken bottom bar / collapsible live chrome | **UX / later** — not persistence B4A |
| Point-in-time capture tables as first-class transcript infrastructure | **B4B+** (notes may still be `dictated` / `transcript_excerpt` as opaque text without transcript tables) |
| `platform_report_contributions` | **B4C+ / B6 adjacency** — not B4A |
| Archive assembly / sealed archives / seal RPC | **B5** |
| Report templates / projections / approved renditions | **B6** |
| Session lifecycle RPCs (`pause_session`, etc.) beyond emitting timeline events when those RPCs later exist | **Later** |
| Methodology adapters emitting timeline events from UI | **F3 / Experience** — B4A only provides append persistence contract |
| `platform_methodologies` | **Never** (OD-F2-6) |
| Methodology-specific therapeutic columns (Hawkins, chakras, graphs, angels, stages as typed schema) | **Forbidden** on platform tables |
| UI / services wiring | **F3 / Experience** |
| Altering Product 00–05 or F2 v1.2 except via Owner decision | Out of this readiness task |

---

## 4. Proposed persistence boundaries

```text
platform_sessions (B1)
        │
        ├── platform_session_notes (B4A)
        │     optional execution_id ──► platform_methodology_executions (B3)
        │     same-session composite FK when set
        │
        └── platform_timeline_events (B4A)
              optional execution_id ──► platform_methodology_executions (B3)
              append-only; opaque payload

B2 testimony / plan ── independent; may be referenced by timeline event_type
                       but B4A does not alter B2 tables

Future B5 seal ── reads notes + timeline (and other batches); not implemented here
Future B6 report ── may project notes with disposition ∈ {review_for_report, included_in_report}
```

**Boundary rules:**

- Notes ≠ timeline ≠ transcript ≠ report contribution ≠ methodology state.  
- Timeline payload is opaque; platform validates envelope/`payload_schema_version` presence only.  
- Note `body` is therapist text (or opaque excerpt text); platform does not parse therapeutic structure.  
- Optional stage/resource context, if stored, is **opaque jsonb** — not typed MAP/35/49 fields.  
- `execution_id` optional; when present must belong to the **same session and therapist**.  
- No automatic inclusion of private notes into reports.  
- No `platform_methodologies`.

---

## 5. Proposed tables / columns / RPCs

### 5.1 `platform_session_notes` (new in B4A)

Aligned with F1 `SessionNoteRecord` and Product 03 §7:

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | PK; domain `noteId` |
| `therapist_id` | `uuid` | NO | Owner |
| `session_id` | `uuid` | NO | Parent session |
| `execution_id` | `uuid` | YES | Optional methodology execution context |
| `kind` | `text` | NO | `written` \| `dictated` \| `transcript_excerpt` |
| `body` | `text` | NO | Therapist-visible content (opaque to platform semantics) |
| `disposition` | `text` | NO | `private` \| `review_for_report` \| `included_in_report` |
| `provenance` | `jsonb` | NO | F1 provenance (`source`, optional `captureMethod`, etc.) |
| `context` | `jsonb` | YES | Optional opaque stage/resource/moment context — **not** therapeutic schema |
| `schema_version` | `text` | NO | e.g. `platform.session.note.v1` |
| `row_revision` | `integer` | NO | default 1 |
| `created_at` / `updated_at` | `timestamptz` | NO | Server-owned |

**Constraints (proposed):**

- `UNIQUE (id, therapist_id)`  
- Composite FK `(session_id, therapist_id) → platform_sessions` ON DELETE RESTRICT  
- Optional composite FK `(session_id, therapist_id, execution_id) → platform_methodology_executions(session_id, therapist_id, id)` when `execution_id` present (same-session; OD-B3 lesson)  
- `kind` / `disposition` CHECKs as above  
- `body` trim length rules: required non-empty for `written`/`dictated`; `transcript_excerpt` may allow empty only if Owner rejects — **default: non-empty for all kinds in B4A**  
- Guard via `platform_guard_mutable_owned_row` on mutable rows  

**Mutability:** disposition and body may update under RPC rules while session is non-terminal (Owner confirm). Prefer soft-delete / disposition over hard DELETE.

### 5.2 `platform_timeline_events` (new in B4A)

Aligned with F1 `TimelineEventRecord` and Product 03 §6:

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | PK; domain `eventId` |
| `therapist_id` | `uuid` | NO | Owner |
| `session_id` | `uuid` | NO | Parent session |
| `execution_id` | `uuid` | YES | Optional execution context |
| `source` | `text` | NO | `platform` \| `methodology` \| `therapist` |
| `event_type` | `text` | NO | Meaningful type string (not click/hover/autosave) |
| `occurred_at` | `timestamptz` | NO | Event time |
| `payload_schema_version` | `text` | NO | Envelope version |
| `payload` | `jsonb` | NO | Default `{}` — **opaque** |
| `schema_version` | `text` | NO | Row contract version |
| `created_at` | `timestamptz` | NO | Append time (server) |

**Constraints (proposed):**

- `UNIQUE (id, therapist_id)`  
- Composite FK to sessions; optional same-session execution FK  
- `source` CHECK; `event_type` non-empty  
- `payload` must be jsonb object  
- **Append-only:** no therapist UPDATE/DELETE policies or grants; no generic update RPC in B4A  

**Indexes (proposed):** `(session_id, occurred_at)`, `(session_id, therapist_id)`, optional `(execution_id)` where not null.

### 5.3 Proposed RPCs (SECURITY DEFINER, idempotent)

| RPC (proposed names) | Purpose |
|----------------------|---------|
| `platform_create_session_note` | Create note; optional `execution_id`; server timestamps |
| `platform_update_session_note` | Update `body` and/or `disposition` (+ optional opaque `context`); bump `row_revision` |
| `platform_append_timeline_event` | Append one meaningful event; optional `execution_id`; reject noise types if Owner supplies denylist |

**Explicitly not in B4A:** transcript RPCs, contribution RPCs, seal/report RPCs, methodology state-patch RPCs.

### 5.4 Tables B4A must not create

- `platform_transcript_captures` / `platform_transcript_segments`  
- `platform_report_contributions`  
- B5/B6 archive/report tables  
- `platform_methodologies`  
- Any methodology therapeutic tables

---

## 6. RLS / grants expectations

### 6.1 Shared ownership model

Reuse B1–B3 patterns:

- `therapist_id = auth.uid()` for owner reads  
- `UNIQUE (id, therapist_id)` + composite session FKs  
- Same-session execution FKs when `execution_id` set  
- Server-owned timestamps / `row_revision` on notes  
- Explicit grants after create; **no** casual `service_role` revoke  
- RPC EXECUTE: `REVOKE ALL FROM public, anon, authenticated` then `GRANT EXECUTE TO authenticated`

### 6.2 Proposed RLS matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `platform_session_notes` | owner | **deny** (RPC) | **deny** (RPC) | **deny** (prefer no hard delete) |
| `platform_timeline_events` | owner | **deny** (RPC append only) | **deny** | **deny** |

### 6.3 Proposed grants (authenticated)

| Object | Privileges |
|--------|------------|
| `platform_session_notes` | `SELECT` only |
| `platform_timeline_events` | `SELECT` only |
| B4A RPCs | `EXECUTE` to `authenticated` only |
| `anon` | **none** |

Never grant `TRUNCATE` / `TRIGGER` / `REFERENCES` to authenticated.

---

## 7. Invariants

1. Notes and timeline are platform session facts — methodology-neutral.  
2. No `platform_methodologies`; no therapeutic first-class columns.  
3. Every note/event belongs to exactly one session via composite ownership.  
4. Optional `execution_id` must reference an execution in the **same** session and therapist (or be null).  
5. Timeline is **append-only** for therapists.  
6. Timeline excludes click/hover/autosave/panel-open noise (enforce in RPC validation / documented denylist).  
7. Note dispositions are exactly `private` \| `review_for_report` \| `included_in_report`.  
8. Private notes never auto-enter client-facing reports (report batch responsibility later).  
9. Timeline `payload` and note `context` are opaque; platform does not interpret therapeutic meaning.  
10. `kind = transcript_excerpt` does **not** require transcript tables in B4A — body is opaque text only.  
11. Creating notes/timeline does not mutate B1 lifecycle, B2 testimony/plan, or B3 execution status.  
12. Authenticated role has **SELECT only** on B4A tables; writes are **RPC-only** (proposed).  
13. Idempotent mutating RPCs use `platform_command_idempotency` (B2 claim/replay pattern).  
14. B4A supports future seal/report reads but does not implement them.  
15. No B4B+/B5+/B6+ objects in B4A.

---

## 8. Lifecycle interaction with B1 / B2 / B3

| Prior asset | B4A interaction |
|-------------|-----------------|
| `platform_sessions` | Parent; notes/events require existing session |
| Session lifecycle | Propose: allow note/timeline writes while session is non-terminal (`in_progress` \| `paused` \| `closing`); **block or read-only after** `completed`/`cancelled` except Owner-approved post-session note addenda — **Owner confirm** |
| `draft` | Prefer **no** clinical notes/timeline until start (aligns Product 03: notes enabled at start) — **Owner confirm** |
| B2 testimony / plan | Unchanged; platform timeline may later record start/plan events when lifecycle RPCs emit them |
| B3 executions | Optional `execution_id` context; B4A must not activate/switch executions |
| Idempotency helpers | Reuse B2 claim/replay |
| Grants hardening | Copy B2/B3 RPC pattern |

**Emission of platform lifecycle timeline events** (`session_started`, `paused`, etc.) may be added inside future lifecycle RPCs or as separate appends; B4A must at least provide `platform_append_timeline_event` so those emitters have a persistence target.

---

## 9. Execution reference rules

1. `execution_id` is optional on notes and timeline events.  
2. When set, FK must enforce **same session + same therapist** (triple composite via B3 unique `(session_id, therapist_id, id)`).  
3. Execution may be non-active (paused/completed/abandoned) for historical association — **Owner confirm**; default **allow** historical reference.  
4. Clearing `active_execution_id` on the session does not cascade-delete notes/events.  
5. B4A does not require an active execution to create a session-scoped note/event.

---

## 10. Append-only / event rules

1. Timeline: INSERT (via RPC) only; no UPDATE/DELETE for authenticated.  
2. Meaningful sources only: `platform` \| `methodology` \| `therapist`.  
3. `event_type` required non-empty; reject known noise types if Owner supplies a denylist (or start allowlist of platform types).  
4. `occurred_at` may be caller-supplied for therapist moments but should be bounded (e.g. not far future); server `created_at` always `now()`.  
5. Payload schema version required; payload opaque object.  
6. Notes are **mutable** (disposition/body), not append-only — distinct from timeline.  
7. Prefer no hard DELETE on notes in B4A; use disposition or later soft-delete flag if Owner requires.

---

## 11. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Pulling full B4 transcript into B4A | Explicit B4A split; validator forbids transcript tables |
| Therapeutic schema creep on notes/timeline | Opaque `body`/`payload`/`context` only; forbid methodology columns |
| Cross-session `execution_id` | Same-session composite FK (B3 lesson) |
| Timeline becomes click log | RPC validation + Product 03 noise exclusions |
| Direct browser writes | SELECT-only grants; RPC-only writes |
| Private notes leaking to reports | Disposition gates; report batch later |
| Treating readiness as implementation auth | Separate local + Dev apply authorizations (OD-F2-5) |
| Default Supabase grants / anon EXECUTE | Follow B2/B3 hardening in same or additive migration |
| Premature contribution/archive coupling | No B4C/B5/B6 tables |
| `transcript_excerpt` kind implying transcript infra | Document as opaque text only until B4B |

---

## 12. Validation plan (when B4A is later authorized)

1. Additive migration(s) only; B1–B3 files untouched.  
2. Exactly notes + timeline tables; no transcript/contribution/archive/report tables; no `platform_methodologies`.  
3. Composite session FKs; same-session optional execution FKs.  
4. Timeline append-only (no UPDATE/DELETE policies/grants).  
5. Notes SELECT-only table grants; RPC EXECUTE authenticated only after hardening.  
6. Disposition/kind CHECKs match F1/Product 03.  
7. Cross-therapist isolation; cross-session execution_id rejected.  
8. Idempotent create/update/append replay.  
9. Static validator asserts absence of state-patch, transcript, contribution, seal RPCs/tables.  
10. F0/F1 validator remains green; new static B4A validator.  
11. No Product/AGENTS edits unless Owner-directed.  
12. No methodology therapeutic terms as columns.

---

## 13. Owner decisions required before implementation

| ID | Decision | Proposed default |
|----|----------|------------------|
| **OD-B4A-1** | Approve this readiness as design baseline for B4A (notes + timeline only)? | Pending Owner |
| **OD-B4A-2** | Confirm split: transcript + contributions out of B4A? | **Yes** — B4A = notes + timeline only |
| **OD-B4A-3** | Write posture for notes/timeline? | **RPC-only**; authenticated **SELECT only** |
| **OD-B4A-4** | Include `platform_create_session_note` + `platform_update_session_note`? | **Yes** |
| **OD-B4A-5** | Include `platform_append_timeline_event`? | **Yes** |
| **OD-B4A-6** | Allow note/timeline writes in `draft`? | **No** — only after start (`in_progress`\|`paused`\|`closing`) |
| **OD-B4A-7** | Post-session note addenda after `completed`/`cancelled`? | **Defer** — read-only after terminal in B4A; addenda later if needed |
| **OD-B4A-8** | Hard DELETE notes in B4A? | **No** — disposition/update only |
| **OD-B4A-9** | Allow `execution_id` referencing non-active executions? | **Yes** (historical context) |
| **OD-B4A-10** | Store optional opaque `context` jsonb on notes? | **Yes** — opaque only |
| **OD-B4A-11** | Timeline noise control: allowlist vs denylist? | **Start with source CHECK + non-empty event_type**; expand denylist as needed |
| **OD-B4A-12** | Should lifecycle RPCs (future) auto-append platform timeline events, or only explicit append RPC in B4A? | **B4A ships append RPC**; auto-emit from lifecycle RPCs when those RPCs are authorized |
| **OD-B4A-13** | `transcript_excerpt` kind without transcript tables? | **Allowed** as opaque text body only |
| **OD-B4A-14** | Separate authorizations for (a) local B4A implementation and (b) Development apply | **Required** (OD-F2-5) |

**No Product document contradiction requiring Product edits was found** for B4A scope: notes/timeline separation from transcript/report matches Product 03 §§6–8 and PD-009.

---

## 14. Relationship to B1 / B2 / B3 (checklist)

| Prior asset | B4A use |
|-------------|---------|
| `platform_sessions` | Parent of notes/events |
| `platform_client_testimony_snapshots` / plan items | Unchanged; timeline may reference via event_type later |
| `platform_methodology_executions` | Optional same-session `execution_id` |
| `platform_command_idempotency` | Dedup for B4A RPCs |
| `platform_guard_mutable_owned_row` | Notes mutability guard |
| B2/B3 RPC grants hardening pattern | Copy for B4A functions |

---

## 15. Implementation posture (when later authorized)

Suggested physical order (still **not authorized**):

1. Additive migration: `platform_session_notes` + `platform_timeline_events`, constraints, indexes, RLS, SELECT-only grants.  
2. Same-session optional execution FKs.  
3. SECURITY DEFINER RPCs: create/update note, append timeline — B2-style idempotency.  
4. Immediate RPC grants hardening (`public`/`anon`/`authenticated` revoke → `authenticated` execute).  
5. Local static B4A validator + report.  
6. Separate Owner auth for Development apply.  
7. No UI/services/transcript/contributions until separately authorized.

---

## 16. Confirmation — nothing implemented in this task

This readiness pass produced **documentation only**.

- **No** SQL objects created or altered  
- **No** migrations added or modified  
- **No** Supabase connections or writes  
- **No** UI, services, tests, or methodology behaviour changes  
- **No** Product / AGENTS / F2 v1.2 / F0–F1 contract edits  
- **No** B4A implementation started  
- **No** commit / push / deploy

---

## 17. Stop line

**B4A READINESS APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION**
