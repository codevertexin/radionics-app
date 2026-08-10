# Platform Session F2 — Batch B4B Pre-Implementation Readiness

**Status:** `APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`  
**Date:** 2026-08-10  
**Scope:** Documentation / readiness only — Batch **B4B** (transcript / text-capture persistence)  
**Depends on:** F2 design baseline v1.2; B1–B3 applied/reconciled in Development; B4A (notes + timeline) local + Dev apply verified  
**Does not authorize:** SQL, migrations, Supabase writes, UI, services, tests, methodology behaviour, STT/audio pipelines, B4C+/B5+/B6+, commit, push, or deploy

---

## 1. Executive verdict

B4B is the next **persistence** unit after B4A. It should materialize **therapist-owned transcript capture metadata** and **confirmed text segments only**, under the two Product/F2 capture modes:

1. **`full_session`** — explicit therapist-controlled continuous session transcription (pause/resume/stop).  
2. **`point_in_time`** — bounded capture of a requested interval; does **not** start or auto-merge into a continuous full-session transcript.

**Product framing (Product 03 §8, Product 05 listening/transcript, OD-F2-4, AGENTS):**

- Transcript is a **private working artifact**, distinct from Timeline, Notes, and Report.  
- Capture **never starts automatically**; consent confirmation is part of the activation boundary when another person may be captured.  
- Persist **metadata + confirmed text segments only** — **no raw audio** (OD-F2-4).  
- **Provisional / live spoken text** is **text-derived transient state** until confirmed; it is **not** a persisted row and is **not** UI implementation in B4B.  
- Full transcript never auto-enters sealed archive or report; editorial include/exclude ≠ physical delete.  
- Methodology context may appear only as **opaque provenance / optional same-session `execution_id`** — never as therapeutic schema.  
- Catalogue authority remains **`radionics_specialties`** (OD-F2-6). **No** `platform_methodologies`.

**Why B4B (not residual “full B4”):** F2 originally bundled notes, transcript, timeline, and contributions. Owner split: **B4A = notes + timeline** (done); **B4B = transcript/text capture persistence only**. Report contributions, archive/seal/report, STT engines, audio blobs, and live spoken chrome remain **out of B4B**.

**Recommended write posture (proposed, mirrors B2/B3/B4A):** authenticated **SELECT only** on B4B tables; capture lifecycle + confirmed-segment append via **SECURITY DEFINER** RPCs with `platform_command_idempotency` (B2 pending-claim); grants hardening (no anon EXECUTE; no dangerous table grants). Optional `execution_id` must be **same-session** (B3 lesson).

This document is **proposed for Owner review**, not approved for implementation. No SQL, application code, migrations, Supabase writes, UI, services, or tests were implemented in producing it.

**Label:** `PROPOSED FOR OWNER REVIEW / NOT AUTHORIZED FOR IMPLEMENTATION`

---

## 2. Inspected files / authorities

| Authority | Role for B4B |
|-----------|--------------|
| `docs/AGENTS.md` | Platform session domain methodology-neutral; transcript boundaries are platform session assets |
| `docs/Product/00_Product_Vision_&_Experience_Constitution.md` | Experience constitution |
| `docs/Product/01_Platform_UX_Backlog.md` | UX backlog (PX-101 / PX-304 listening & transcript — UX deferred; persistence contract here) |
| `docs/Product/02_Product_Decisions.md` | PD-007 platform before methodology; PD-009 archive/report separation |
| `docs/Product/03_Platform_Session_Experience.md` | §8 Session Transcript — separation, modes, private artifact, no auto-report |
| `docs/Product/04_Platform_Session_Implementation_Readiness.md` | Transcript independence; confirmation ≠ therapeutic truth |
| `docs/Product/05_Unified_Methodology_Workspace_UX_Architecture.md` | `full_session` / `point_in_time`; provisional vs confirmed; live surface as future UX |
| `src/platform/session/**` | F1 `TranscriptCaptureSession`, `TranscriptSegment`, capture helpers (contracts only; no STT/audio) |
| `docs/Engine/Session/Platform_Session_F2_Supabase_Persistence_Pre_Implementation_Readiness.md` | §6.7 transcript tables; OD-F2-4; batch B4 row (split → B4B) |
| `docs/Engine/Session/Platform_Session_F2_B1_Local_Implementation_Report.md` | Sessions ownership / grants |
| `docs/Engine/Session/Platform_Session_F2_B2_Local_Implementation_Report.md` | RPC-only + idempotency claim/replay + grants hardening |
| `docs/Engine/Session/Platform_Session_F2_B3_Local_Implementation_Report.md` | Same-session execution FK lesson |
| `docs/Engine/Session/Platform_Session_F2_B4A_Pre_Implementation_Readiness.md` | Notes/timeline split; transcript deferred to B4B |
| `docs/Engine/Session/Platform_Session_F2_B4A_Local_Implementation_Report.md` | B4A applied/verified without transcript tables |

**Not modified:** Product 00–05, AGENTS, F2 v1.2 baseline, B1–B4A migrations/reports, F0/F1 contracts, UI, services — this task creates **only** this readiness file.

---

## 3. B4B scope and explicit exclusions

### 3.1 In scope (proposed)

1. **`platform_transcript_captures`** — capture envelope: mode, status, consent flag, optional same-session `execution_id`, start/stop timestamps.  
2. **`platform_transcript_segments`** — **confirmed text only** segments linked to a capture; inclusion disposition; opaque provenance.  
3. **Capture modes** — `full_session` \| `point_in_time` as first-class CHECK on captures.  
4. **Mode separation rules** — no auto-merge; point-in-time must not silently start/resume full-session.  
5. **Provisional / live spoken text** — documented as **transient text-derived state** (not persisted until confirmed); **no** live-bar UI in B4B.  
6. **Session-scoped ownership** — composite FKs to `platform_sessions (id, therapist_id)`.  
7. **Optional execution-scoped references** — nullable `execution_id` with **same-session** composite FK to `platform_methodology_executions`.  
8. **RLS / grants** — therapist-scoped SELECT; writes via proposed RPCs; B2/B3/B4A hardening lessons.  
9. **RPC-only mutations** (proposed) — start/pause/resume/stop capture; append confirmed segment; update segment inclusion (editorial); idempotent via `platform_command_idempotency`.  
10. **Privacy defaults** — transcript private; not auto-copied to archive/report (those batches later consume selectively).

### 3.2 Explicitly out of scope

| Deferred / forbidden | Batch / rule |
|----------------------|--------------|
| Raw audio / media blobs / object-storage audio | **Forbidden in F2 core** (OD-F2-4) |
| Speech-to-text engine, vendor SDK, browser MediaRecorder wiring | **Out of B4B** — STT later; B4B stores confirmed text supplied by a future caller |
| Live spoken bottom bar / collapsible live chrome | **UX / F3 / Experience** — Product 05; not persistence B4B |
| Persisting provisional/live text as durable rows | **Forbidden** — only confirmed segments persist |
| `platform_session_notes` / `platform_timeline_events` changes | **B4A** — do not reopen |
| Note `kind = transcript_excerpt` body authorship | Remains B4A note RPC; B4B may later be *referenced* by note provenance, not implemented here |
| `platform_report_contributions` | **B4C+ / B6 adjacency** |
| Archive assembly / sealed archives / seal RPC | **B5** |
| Report templates / projections / approved renditions | **B6** |
| Automatic retention / definitive purge policy | **Later policy** (OD-F2-4) |
| Methodology-owned independent transcripts per specialty | **Forbidden** — one Platform Session transcript boundary (Product 05) |
| `platform_methodologies` | **Never** (OD-F2-6) |
| Methodology-specific therapeutic columns | **Forbidden** on platform tables |
| UI / services wiring | **F3 / Experience** |
| SQL / migrations / Supabase writes | **Require separate OD-F2-5 authorizations** |

---

## 4. Proposed persistence boundaries

```text
platform_sessions (B1)
        │
        ├── platform_transcript_captures (B4B)
        │     capture_mode: full_session | point_in_time
        │     status: idle | listening | paused | stopped
        │     optional execution_id ──► platform_methodology_executions (B3)
        │     same-session composite FK when set
        │
        └── platform_transcript_segments (B4B)
              FK (capture_id, therapist_id) → captures
              confirmed text only; inclusion retained|excluded|pending_review
              optional same-session execution_id

Transient (NOT persisted in B4B):
  provisional / live spoken text-derived state
  (future UX may display; confirmation creates segment via RPC)

B4A notes / timeline ── independent; may later cite segment ids in opaque provenance
B2 / B3 ── unchanged by B4B
Future B5 seal ── may read permitted captures/segments; never auto-include full transcript
Future B6 report ── may use therapist-selected excerpts only; never full auto-insert
```

**Boundary rules:**

- Transcript ≠ notes ≠ timeline ≠ report contribution ≠ methodology state.  
- Segment `text` is confirmed therapist-visible text (or STT-confirmed text supplied later) — platform does **not** interpret therapeutic meaning.  
- Provenance may record opaque engine/confidence metadata — **not** audio URIs.  
- `execution_id` optional; when present must belong to the **same session and therapist**.  
- Methodology transitions must **not** split one Platform Session transcript into methodology-owned transcripts (Product 05).  
- No `platform_methodologies`; specialty/methodology catalogue = `radionics_specialties` when any catalogue FK is ever needed (B4B itself typically does not require a specialty FK on transcript rows).

---

## 5. Capture modes and live spoken text (design)

### 5.1 `full_session`

Aligned with OD-F2-4, Product 03 §8.2, Product 05 full-session listening:

- Explicit therapist start required.  
- Supports **pause / resume / stop** on the capture row.  
- Forms the **integral session transcript** for that capture.  
- Provisional live text is **transient** until confirmed into segments.  
- Does **not** imply UI chrome (collapsible live bar is future UX).  
- Listening context is Platform Session–owned across methodology transitions; B4B must not invent per-methodology capture rows solely because the active execution changed.

### 5.2 `point_in_time`

- Explicit therapist start of a **bounded** interval.  
- Must **not** silently start `full_session`, resume a paused `full_session`, or auto-merge segments into another capture’s continuous stream.  
- May relate to session, optional execution, or opaque active context via provenance/`execution_id`.  
- Useful for dictation-like or analysis intervals without becoming continuous session listening.

### 5.3 Live spoken text = text-derived state only

| Concept | Persistence in B4B? | Notes |
|---------|---------------------|-------|
| Capture listening/paused/stopped | **Yes** (capture row) | Metadata only |
| Provisional / live spoken text | **No** | Transient text-derived state; never a durable row until confirmation |
| Confirmed transcript segment text | **Yes** (segment row) | Confirmed only |
| Raw audio / PCM / blobs | **No** | OD-F2-4 forbidden |
| STT engine implementation | **No** | Out of B4B |
| Live spoken bottom bar UI | **No** | Product 05 / F3 |

**Confirmation rule:** only content recognized as confirmed under the transcript contract may be inserted as `platform_transcript_segments`. Confirmation of text **does not** constitute therapeutic confirmation of meaning (Product 04 / Product 05).

### 5.4 Consent

- `consent_recorded` (boolean) on capture; default `false`.  
- Product 03: where another person may be captured, explicit therapist confirmation of required consent is part of the activation boundary.  
- B4B proposes RPC validation may **require** `consent_recorded = true` before transition to `listening` when Owner so decides (OD-B4B below). Default proposal: **require true before listening** for both modes.

---

## 6. Proposed tables / columns / RPCs

### 6.1 `platform_transcript_captures` (new in B4B)

Aligned with F1 `TranscriptCaptureSession` + F2 §6.7 `capture_mode` (F1 contract today omits mode; **persistence adds** `capture_mode` per OD-F2-4 / Product 05):

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | PK; domain `captureId` |
| `therapist_id` | `uuid` | NO | Owner |
| `session_id` | `uuid` | NO | Parent session |
| `execution_id` | `uuid` | YES | Optional same-session methodology execution context |
| `capture_mode` | `text` | NO | `full_session` \| `point_in_time` |
| `status` | `text` | NO | `idle` \| `listening` \| `paused` \| `stopped` |
| `started_at` | `timestamptz` | YES | Set when entering `listening` the first time |
| `stopped_at` | `timestamptz` | YES | Set when entering `stopped` |
| `consent_recorded` | `boolean` | NO | default `false` |
| `privacy_label` | `text` | YES | Optional opaque label |
| `schema_version` | `text` | NO | e.g. `platform.session.transcriptCapture.v1` |
| `row_revision` | `integer` | NO | default 1 (mutable status machine) |
| `created_at` / `updated_at` | `timestamptz` | NO | Server-owned |

**Constraints (proposed):**

- `UNIQUE (id, therapist_id)`  
- Composite FK `(session_id, therapist_id) → platform_sessions` ON DELETE RESTRICT  
- Optional composite FK `(session_id, therapist_id, execution_id) → platform_methodology_executions(session_id, therapist_id, id)` when `execution_id` present  
- `capture_mode` / `status` CHECKs as above  
- Guard via `platform_guard_mutable_owned_row` on mutable capture rows  
- **No audio / bytea / storage path columns**

**Concurrency (proposed default):** at most **one** non-`stopped` `full_session` capture per session at a time; multiple `point_in_time` captures allowed historically; a `point_in_time` capture must not mutate a sibling `full_session` row — **Owner confirm** (OD-B4B).

### 6.2 `platform_transcript_segments` (new in B4B)

Aligned with F1 `TranscriptSegment` + F2 §6.7:

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | PK; domain `segmentId` |
| `therapist_id` | `uuid` | NO | Owner |
| `session_id` | `uuid` | NO | Denormalized parent for RLS/query |
| `capture_id` | `uuid` | NO | Parent capture |
| `execution_id` | `uuid` | YES | Optional same-session context |
| `text` | `text` | NO | **Confirmed** text only; non-empty trim |
| `started_at` | `timestamptz` | NO | Segment time range start |
| `ended_at` | `timestamptz` | YES | Optional end |
| `inclusion` | `text` | NO | `retained` \| `excluded` \| `pending_review` |
| `provenance` | `jsonb` | NO | Opaque (e.g. engine/confidence) — **no audio URI** |
| `schema_version` | `text` | NO | e.g. `platform.session.transcriptSegment.v1` |
| `row_revision` | `integer` | NO | default 1 (inclusion edits) |
| `created_at` / `updated_at` | `timestamptz` | NO | Server-owned |

**Constraints (proposed):**

- `UNIQUE (id, therapist_id)`  
- Composite FK `(capture_id, therapist_id) → platform_transcript_captures (id, therapist_id)`  
- Composite FK `(session_id, therapist_id) → platform_sessions`  
- Optional same-session execution FK  
- `inclusion` CHECK; `text` non-empty  
- `provenance` jsonb object  
- Prefer **no hard DELETE**; editorial exclusion via `inclusion`  
- **No audio columns**

**Indexes (proposed):** `(session_id, started_at)`, `(capture_id, started_at)`, `(session_id, therapist_id)`, optional `(execution_id)` where not null.

### 6.3 Proposed RPCs (SECURITY DEFINER, idempotent)

| RPC (proposed names) | Purpose |
|----------------------|---------|
| `platform_start_transcript_capture` | Create or transition to `listening`; require mode + consent rule; optional `execution_id` |
| `platform_pause_transcript_capture` | `listening` → `paused` (primarily `full_session`) |
| `platform_resume_transcript_capture` | `paused` → `listening` |
| `platform_stop_transcript_capture` | → `stopped`; set `stopped_at` |
| `platform_append_transcript_segment` | Insert **confirmed** segment for an owned capture; reject empty text |
| `platform_update_transcript_segment_inclusion` | Editorial `retained` / `excluded` / `pending_review` only |

**Explicitly not in B4B:** STT RPCs, audio upload RPCs, note/timeline RPCs (B4A), contribution RPCs, seal/report RPCs, methodology state-patch RPCs, live-provisional upsert RPCs.

### 6.4 Tables B4B must not create

- `platform_session_notes` / `platform_timeline_events` (already B4A)  
- `platform_report_contributions`  
- B5/B6 archive/report tables  
- `platform_methodologies`  
- Any audio/media tables or storage buckets for session voice  
- Any methodology therapeutic tables

---

## 7. RLS / grants expectations

### 7.1 Shared ownership model

Reuse B1–B4A patterns:

- `therapist_id = auth.uid()` for owner reads  
- `UNIQUE (id, therapist_id)` + composite session FKs  
- Same-session execution FKs when `execution_id` set  
- Server-owned timestamps / `row_revision`  
- Explicit grants after create; **no** casual `service_role` revoke  
- RPC EXECUTE: `REVOKE ALL FROM public, anon, authenticated` then `GRANT EXECUTE TO authenticated`

### 7.2 Proposed RLS matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `platform_transcript_captures` | owner | **deny** (RPC) | **deny** (RPC) | **deny** |
| `platform_transcript_segments` | owner | **deny** (RPC) | **deny** (RPC inclusion only) | **deny** |

### 7.3 Proposed grants (authenticated)

| Object | Privileges |
|--------|------------|
| `platform_transcript_captures` | `SELECT` only |
| `platform_transcript_segments` | `SELECT` only |
| B4B RPCs | `EXECUTE` to `authenticated` only |
| `anon` | **none** |

Never grant `TRUNCATE` / `TRIGGER` / `REFERENCES` to authenticated.

---

## 8. Invariants

1. Transcript captures/segments are platform session facts — methodology-neutral.  
2. No `platform_methodologies`; no therapeutic first-class columns; no raw audio columns.  
3. Every capture/segment belongs to exactly one session via composite ownership.  
4. Optional `execution_id` must reference an execution in the **same** session and therapist (or be null).  
5. `capture_mode` is exactly `full_session` \| `point_in_time`.  
6. `point_in_time` never auto-starts, auto-resumes, or auto-merges into `full_session`.  
7. Only **confirmed** text is persisted as segments; provisional/live spoken text is non-durable.  
8. Segment `inclusion` is exactly `retained` \| `excluded` \| `pending_review`; exclude ≠ physical delete.  
9. Transcript is private by default; not auto-included in sealed archive or report (B5/B6 responsibility).  
10. Confirmation of transcript text ≠ therapeutic confirmation of spoken meaning.  
11. Creating captures/segments does not mutate B1 lifecycle, B2 testimony/plan, B3 execution status, or B4A notes/timeline.  
12. Authenticated role has **SELECT only** on B4B tables; writes are **RPC-only** (proposed).  
13. Idempotent mutating RPCs use `platform_command_idempotency` (B2 claim/replay pattern).  
14. B4B supports future selective seal/report reads but does not implement them.  
15. No B4C+/B5+/B6+ objects; no UI/services/STT in B4B.

---

## 9. Lifecycle interaction with B1 / B2 / B3 / B4A

| Prior asset | B4B interaction |
|-------------|-----------------|
| `platform_sessions` | Parent; captures require existing session |
| Session lifecycle | Propose: allow capture start while `in_progress` \| `paused` \| `closing`; on terminal `completed`/`cancelled`, force-stop any active capture (or reject new starts) — **Owner confirm** |
| `draft` | Prefer **no** listening until start — **Owner confirm** (align Product 03: transcript controls enabled at start) |
| Pause / exit / closing | Product 03: pausing/exiting/closing safely ends or suspends capture — B4B RPCs must support pause/stop; auto-emit from lifecycle RPCs when those RPCs are later authorized |
| B2 testimony / plan | Unchanged |
| B3 executions | Optional same-session `execution_id`; B4B must not activate/switch executions |
| B4A notes / timeline | Unchanged; notes may remain `transcript_excerpt` opaque text without requiring B4B FK in this batch |
| Idempotency helpers | Reuse B2 claim/replay |
| Grants hardening | Copy B2/B3/B4A RPC pattern |

---

## 10. Execution reference rules

1. `execution_id` is optional on captures and segments.  
2. When set, FK must enforce **same session + same therapist** (triple composite via B3 unique `(session_id, therapist_id, id)`).  
3. Default **allow** historical (non-active) execution references — **Owner confirm**.  
4. Clearing session `active_execution_id` does not cascade-delete captures/segments.  
5. Methodology transition must not invent a new capture solely for presentation convenience.  
6. B4B does not require an active execution to start a session-scoped capture.

---

## 11. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Accidental raw audio / STT in B4B | Explicit OD-F2-4; validator forbids audio columns, storage buckets, STT RPCs |
| Persisting provisional live text | Invariant: segments = confirmed only; no provisional table |
| Mode confusion / auto-merge | Distinct `capture_mode`; RPC rules forbid cross-mode merge |
| Pulling contributions/archive into B4B | Explicit exclusions; validator forbids those tables |
| Cross-session `execution_id` | Same-session composite FK (B3 lesson) |
| Direct browser writes | SELECT-only grants; RPC-only writes |
| Full transcript leaking to report/archive | Privacy defaults; B5/B6 must not auto-include |
| Treating readiness as implementation auth | Separate local + Dev apply authorizations (OD-F2-5) |
| Default Supabase grants / anon EXECUTE | Follow B2/B3/B4A hardening |
| Duplicate methodology catalogue | OD-F2-6; no `platform_methodologies` |
| Collapsing transcript into notes/timeline | Keep tables separate; B4A unchanged |
| Building live spoken UI under persistence auth | Document text-derived state only; UI out of scope |

---

## 12. Validation plan (when B4B is later authorized)

1. Additive migration(s) only; B1–B4A files untouched.  
2. Exactly captures + segments tables; no notes/timeline recreation; no contribution/archive/report tables; no `platform_methodologies`; **no audio columns**.  
3. Composite session FKs; capture→segment ownership FK; same-session optional execution FKs.  
4. `capture_mode` CHECK (`full_session` \| `point_in_time`); status CHECK.  
5. SELECT-only table grants; RPC EXECUTE authenticated only after hardening.  
6. Static validator asserts absence of STT/audio/contribution/seal/report RPCs/tables and of provisional-live persistence tables.  
7. Cross-therapist isolation; cross-session execution_id rejected.  
8. Idempotent start/pause/resume/stop/append/inclusion replay.  
9. Mode separation tests (logical/static): point-in-time cannot mutate full-session merge semantics.  
10. F0/F1 validator remains green; new static B4B validator.  
11. No Product/AGENTS edits unless Owner-directed.  
12. No methodology therapeutic terms as columns.

---

## 13. Owner decisions required before implementation

| ID | Decision | Proposed default |
|----|----------|------------------|
| **OD-B4B-1** | Approve this readiness as design baseline for B4B (transcript/text capture persistence only)? | Pending Owner |
| **OD-B4B-2** | Confirm B4B excludes notes/timeline (B4A), contributions, archive/report, UI, STT, raw audio? | **Yes** |
| **OD-B4B-3** | Write posture for transcript tables? | **RPC-only**; authenticated **SELECT only** |
| **OD-B4B-4** | Persist provisional/live spoken text? | **No** — transient text-derived state only until confirmed |
| **OD-B4B-5** | Include both `full_session` and `point_in_time` in first B4B migration? | **Yes** |
| **OD-B4B-6** | Require `consent_recorded = true` before `listening`? | **Yes** |
| **OD-B4B-7** | Allow capture start in `draft`? | **No** — only after start (`in_progress`\|`paused`\|`closing`) |
| **OD-B4B-8** | On session `completed`/`cancelled`, auto-stop active captures? | **Yes** (via lifecycle RPC later or B4B stop rule when those RPCs exist); until then reject new starts on terminal |
| **OD-B4B-9** | Hard DELETE segments in B4B? | **No** — inclusion editorial only |
| **OD-B4B-10** | Allow `execution_id` referencing non-active executions? | **Yes** (historical context) |
| **OD-B4B-11** | Max concurrent non-stopped `full_session` captures per session? | **One** |
| **OD-B4B-12** | May multiple historical `point_in_time` captures exist per session? | **Yes** |
| **OD-B4B-13** | FK from B4A notes to B4B segments in this batch? | **No** — defer; notes stay opaque `transcript_excerpt` until a later linking auth |
| **OD-B4B-14** | Separate authorizations for (a) local B4B implementation and (b) Development apply | **Required** (OD-F2-5) |

**No Product document contradiction requiring Product edits was found** for B4B scope: dual modes, confirmed-text-only, no raw audio, private transcript, and separation from notes/timeline/report match Product 03 §8, Product 05 listening/transcript, and OD-F2-4.

---

## 14. Relationship to B1 / B2 / B3 / B4A (checklist)

| Prior asset | B4B use |
|-------------|---------|
| `platform_sessions` | Parent of captures/segments |
| `platform_client_testimony_snapshots` / plan items | Unchanged |
| `platform_methodology_executions` | Optional same-session `execution_id` |
| `platform_session_notes` / `platform_timeline_events` | Unchanged (B4A); no reopen |
| `platform_command_idempotency` | Dedup for B4B RPCs |
| `platform_guard_mutable_owned_row` | Capture + segment mutability guard |
| `radionics_specialties` | Catalogue authority if specialty context ever needed; **no** `platform_methodologies` |
| B2/B3/B4A RPC grants hardening pattern | Copy for B4B functions |

---

## 15. Implementation posture (when later authorized)

Suggested physical order (still **not authorized**):

1. Additive migration: `platform_transcript_captures` + `platform_transcript_segments`, constraints, indexes, RLS, SELECT-only grants.  
2. Same-session optional execution FKs; capture↔segment ownership FK.  
3. SECURITY DEFINER RPCs: start/pause/resume/stop capture; append confirmed segment; update inclusion — B2-style idempotency.  
4. Immediate RPC grants hardening (`public`/`anon`/`authenticated` revoke → `authenticated` execute).  
5. Local static B4B validator + report (forbid audio/STT/contribution/archive/report/`platform_methodologies`).  
6. Separate Owner auth for Development apply.  
7. No UI/services/STT/audio/live spoken chrome until separately authorized.

---

## 16. Confirmation — nothing implemented in this task

This readiness pass produced **documentation only** — exactly one new file.

- **No** SQL objects created or altered  
- **No** migrations added or modified  
- **No** Supabase connections or writes  
- **No** UI, services, tests, STT, audio, or methodology behaviour changes  
- **No** Product / AGENTS / F2 v1.2 / F0–F1 contract edits  
- **No** B4B implementation started  
- **No** commit / push / deploy  
- **No** other files modified

---

## 17. Stop line

**PROPOSED FOR OWNER REVIEW / NOT AUTHORIZED FOR IMPLEMENTATION**
