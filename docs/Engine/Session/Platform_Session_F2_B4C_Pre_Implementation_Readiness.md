# Platform Session F2 — Batch B4C Pre-Implementation Readiness

**Status:** `APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`  
**Date:** 2026-08-10  
**Scope:** Documentation / readiness only — Batch **B4C** (platform-neutral report contributions / structured session record inputs)  
**Depends on:** F2 design baseline v1.2; B1–B4B applied/verified in Development  
**Does not authorize:** SQL, migrations, Supabase writes, UI, services, tests, methodology behaviour, archive/seal, report templates/rendering/PDF, B5+/B6+, commit, push, or deploy

---

## 1. Executive verdict

**Owner has approved this B4C readiness baseline (OD-B4C-1…17).** Local B4C implementation (SQL/migrations/validators/apply), UI/services, archive/seal, and report templates/projections/PDF remain **not authorized**.

B4C is the next **persistence** unit after B4B. It should materialize a **platform-neutral reportable contribution pool**: structured session-record inputs that later feed archive assembly (B5) and report projection/approval (B6) — **without** implementing seal, templates, rendering, PDF, Live Report UI, or therapeutic methodology behaviour.

**Product framing (Product 03 §§9–10, Product 04, PD-009, AGENTS, F1 `ReportContributionRecord`):**

- The platform accumulates **truthful, reportable contributions** during the session; the therapist remains author, editor and final approver of any client-facing report.  
- Contributions are **candidates**, not approved report sections.  
- Private notes, the complete transcript, transient results and technical noise **never enter automatically**.  
- Methodologies (via adapters) may **emit** possible contributions; the platform **stores and composes** them without interpreting therapeutic meaning.  
- Each contribution preserves stable identity, opaque structured value, optional display fallback, source, methodology/execution context, therapist visibility decision, and time.  
- Catalogue authority remains **`radionics_specialties`** (OD-F2-6). **No** `platform_methodologies`.  
- Contribution payloads/provenance are **opaque jsonb** — no Hawkins / chakras / graphs / angels / MAP-specific columns.

**Why B4C (not residual “full B4” / not B6):** F2 originally bundled notes, transcript, timeline, and contributions. Owner split: **B4A = notes + timeline**, **B4B = transcript**, **B4C = report contributions only**. Archive seal and report templates/projections/renditions remain **B5/B6**.

**Approved write posture (mirrors B2–B4B):** authenticated **SELECT only** on B4C tables; **narrow SECURITY DEFINER RPCs** with `platform_command_idempotency` (B2 pending-claim) — `platform_create_report_contribution` create-only (`structured_value` create-once), then editorial inclusion / optional display / optional provenance-ref updates only; **no** `platform_upsert_report_contribution`; **no** general `structured_value` patch RPC; grants hardening (no anon EXECUTE; no dangerous table grants). Optional references to executions/notes/timeline/transcript must be **same-session**.

This document is the **approved design baseline** for B4C. It does **not** authorize local implementation, Development apply, SQL, migrations, Supabase writes, UI, services, or tests.

**Label:** `APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`

---

## 2. Inspected files / authorities

| Authority | Role for B4C |
|-----------|--------------|
| `docs/AGENTS.md` | Platform session domain methodology-neutral; report contributions are platform session assets |
| `docs/Product/00_Product_Vision_&_Experience_Constitution.md` | Experience constitution |
| `docs/Product/01_Platform_UX_Backlog.md` | Live report / contribution UX deferred to Experience |
| `docs/Product/02_Product_Decisions.md` | PD-007 platform before methodology; **PD-009** archive/report separation |
| `docs/Product/03_Platform_Session_Experience.md` | §9 Live Report; §10.3 Reportable Contribution Pool; projection sequence |
| `docs/Product/04_Platform_Session_Implementation_Readiness.md` | Contribution contracts; candidates ≠ approved sections |
| `docs/Product/05_Unified_Methodology_Workspace_UX_Architecture.md` | Methodology emissions remain attributable; not auto-included in Live Report |
| `src/platform/session/**` | F1 `ReportContributionRecord`, `ContributionInclusion`, `createReportContribution` |
| `docs/Engine/Session/Platform_Session_F2_Supabase_Persistence_Pre_Implementation_Readiness.md` | §6.9 contributions; batch split; OD-F2-1…6 |
| B1–B4B local/Dev reports | Ownership, RPC-only, same-session FK lessons, SELECT-only grants |

**Not modified:** Product 00–05, AGENTS, F2 v1.2 baseline, B1–B4B migrations/reports, F0/F1 contracts, UI, services — this task creates **only** this readiness file.

---

## 3. Scope and exclusions

### 3.1 In scope (proposed)

1. **`platform_report_contributions`** — therapist-owned, session-scoped structured contribution rows.  
2. **Platform-neutral contribution kinds** covering how session facts, notes, timeline events, transcript segments, methodology executions, and therapist-selected excerpts can become structured inputs.  
3. **Provenance model** — opaque envelope plus optional same-session references to session / execution / note / timeline event / transcript capture / segment.  
4. **Inclusion / visibility model** — therapist (and system) decisions over candidates without approving a report.  
5. **Mutability boundary** — B4C is **mutable working contribution data** for inclusion / optional display / optional provenance-ref decisions; `structured_value` is **create-once**; seal and approved renditions are later.  
6. **RLS / grants** — SELECT-only for authenticated; RPC-only writes; B2–B4B hardening.  
7. **Idempotent mutating RPCs** via `platform_command_idempotency` (narrow create / inclusion / display / provenance-ref RPCs — **no** broad upsert/patch of `structured_value`).  
8. **Future B5/B6 readiness** — contributions must be sealable/projectable later without B4C implementing seal/template/PDF.

### 3.2 Explicitly out of scope

| Deferred / forbidden | Batch / rule |
|----------------------|--------------|
| Archive assembly / sealed archives / seal RPC | **B5** |
| Report templates / projections / approved renditions | **B6** |
| PDF / Live Report UI / report composition engine | **B6 / Experience / F3** |
| Auto-inventing missing findings or therapeutic conclusions | **Forbidden** (Product 03) |
| Altering B1–B4B tables beyond optional FKs **from** B4C → those tables | **Preserve B1–B4B** |
| Creating notes/timeline/transcript RPCs | **B4A/B4B** — do not reopen |
| Raw audio / STT / live spoken bar | **Out of B4C** (OD-F2-4 / B4B boundary) |
| `platform_methodologies` | **Never** (OD-F2-6) |
| Therapeutic first-class columns (Hawkins, chakras, graphs, angels, MAP stages as typed schema) | **Forbidden** |
| UI / services wiring | **F3 / Experience** |
| SQL / migrations / Supabase writes | **Require separate OD-F2-5 authorizations** |

---

## 4. Relationship to B1 / B2 / B3 / B4A / B4B

```text
platform_sessions (B1)
  ├── testimony / plan (B2) ────────── may seed session-fact contributions (opaque)
  ├── platform_methodology_executions (B3)
  │     optional execution_id on contributions (same-session)
  │     specialty_id → radionics_specialties (catalogue; no platform_methodologies)
  ├── platform_session_notes (B4A)
  │     optional note_id provenance when disposition/review warrants a contribution
  ├── platform_timeline_events (B4A)
  │     optional timeline_event_id provenance for meaningful moments
  ├── platform_transcript_captures / segments (B4B)
  │     optional capture_id / segment_id when therapist selects an excerpt
  └── platform_report_contributions (B4C)  ← this batch
        working mutable pool → later B5 seal reads → later B6 projects
```

| Prior asset | B4C interaction |
|-------------|-----------------|
| `platform_sessions` | Parent; every contribution belongs to one session |
| B2 testimony / plan | Unchanged; may be **referenced** as opaque session-fact contributions, not copied as therapeutic schema |
| B3 executions | Optional same-session `execution_id`; optional specialty snapshot fields reconciled from `radionics_specialties` at emit time |
| B4A notes | Optional same-session `note_id`; private notes never auto-emit |
| B4A timeline | Optional same-session `timeline_event_id`; noise events never become contributions |
| B4B transcript | Optional same-session `capture_id` / `segment_id`; full transcript never auto-emits; therapist-selected excerpts only |
| `platform_command_idempotency` | Dedup for B4C RPCs |
| B5 / B6 | Consumers of the contribution pool; **not** implemented here |

**Boundary:** Contribution ≠ note ≠ timeline ≠ transcript ≠ sealed archive ≠ approved report section.

---

## 5. Proposed data model

### 5.1 `platform_report_contributions` (new in B4C)

Aligned with F1 `ReportContributionRecord` and Product 03 §10.3, extended for explicit source-entity provenance (same-session FKs):

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | PK; domain `contributionId` |
| `therapist_id` | `uuid` | NO | Owner |
| `session_id` | `uuid` | NO | Parent session |
| `execution_id` | `uuid` | YES | Optional same-session methodology execution |
| `specialty_id` | `uuid` | YES | Optional FK → `radionics_specialties(id)` when methodology identity is known |
| `methodology_slug` | `text` | YES | Historical snapshot (reconciled); not a catalogue table |
| `methodology_name` | `text` | YES | Historical snapshot |
| `contribution_kind` | `text` | NO | See §5.2 |
| `source` | `text` | NO | Emitter label (e.g. `platform`, `methodology_adapter`, `therapist`) — non-empty |
| `structured_value` | `jsonb` | NO | **Opaque** structured payload; set at **create only**; platform does not interpret therapeutic fields; **not** generally patched by B4C RPCs |
| `human_readable_value` | `text` | YES | Optional display fallback |
| `inclusion` | `text` | NO | See §6 |
| `provenance` | `jsonb` | NO | Opaque provenance envelope (required object) |
| `note_id` | `uuid` | YES | Optional same-session note reference |
| `timeline_event_id` | `uuid` | YES | Optional same-session timeline event reference |
| `transcript_capture_id` | `uuid` | YES | Optional same-session capture reference |
| `transcript_segment_id` | `uuid` | YES | Optional same-session segment reference |
| `schema_version` | `text` | NO | e.g. `platform.session.reportContribution.v1` |
| `row_revision` | `integer` | NO | default 1 |
| `created_at` / `updated_at` | `timestamptz` | NO | Server-owned |

**Constraints (proposed):**

- `UNIQUE (id, therapist_id)`  
- Composite FK `(session_id, therapist_id) → platform_sessions` ON DELETE RESTRICT  
- Optional same-session execution FK `(session_id, therapist_id, execution_id) → platform_methodology_executions(session_id, therapist_id, id)`  
- Optional same-session note FK via `UNIQUE (id, therapist_id, session_id)` on notes (add target unique if missing) or equivalent triple pattern used in B4B  
- Optional same-session timeline / capture / segment FKs with the same lesson: **session_id must match**  
- Optional `specialty_id → radionics_specialties(id)` (catalogue only; **no** `platform_methodologies`)  
- `contribution_kind` / `inclusion` CHECKs  
- `structured_value` and `provenance` must be jsonb objects  
- `source` trim non-empty  
- Guard via `platform_guard_mutable_owned_row`  
- Prefer **no hard DELETE**; use `inclusion = excluded` (or later soft-delete)  

**Indexes (proposed):** `(session_id, created_at)`, `(session_id, inclusion)`, `(session_id, contribution_kind)`, optional `(execution_id)` where not null.

### 5.2 `contribution_kind` (proposed)

| Kind | Meaning |
|------|---------|
| `session_fact` | Platform session-level structured input (identity/intention/schedule facts as opaque values) |
| `methodology_emission` | Adapter-emitted reportable contribution from an execution |
| `note_excerpt` | Contribution derived from a therapist note (typically disposition review/included) |
| `timeline_event` | Contribution derived from a meaningful timeline event |
| `transcript_excerpt` | Therapist-selected transcript segment excerpt |
| `therapist_authored` | Therapist-written reportable text/structure not tied to another artifact |
| `system_context` | Non-client-facing system/context marker; **never** auto-selected for client report |

Kinds describe **what the row is**; they do not approve report sections.

### 5.3 Tables B4C must not create

- B5 archive / sealed archive tables  
- B6 report templates / projections / approved renditions  
- Transcript/note/timeline recreations  
- `platform_methodologies`  
- Any therapeutic methodology tables or audio tables  

---

## 6. Provenance model

Provenance separates **opaque envelopes** from **optional relational pointers**.

### 6.1 Opaque `provenance` jsonb (required)

Minimum conceptual fields (not enforced as typed columns):

- `emittedBy` — adapter id, `platform`, or `therapist`  
- `emittedAt` — emission timestamp (also mirrored in row times)  
- Optional opaque keys: `adapterVersion`, `payloadSchemaHint`, confirmation flags — **no audio URIs**, no therapeutic typed schema  

Platform validates **object shape only**, not therapeutic semantics.

### 6.2 Optional same-session source references

| Reference | Points to | Rule |
|-----------|-----------|------|
| `session_id` | `platform_sessions` | Always required (parent) |
| `execution_id` | `platform_methodology_executions` | Same session + therapist; historical executions allowed by default |
| `note_id` | `platform_session_notes` | Same session; never auto-create from `private` notes |
| `timeline_event_id` | `platform_timeline_events` | Same session; meaningful events only (emitter responsibility) |
| `transcript_capture_id` | `platform_transcript_captures` | Same session |
| `transcript_segment_id` | `platform_transcript_segments` | Same session; therapist-selected excerpt semantics |
| `specialty_id` | `radionics_specialties` | Catalogue identity when known |

**Integrity lesson (B3/B4B):** all optional artifact FKs must enforce **same-session** (and therapist) — never therapist-only pairs that allow cross-session linkage.

### 6.3 How sources become contributions (conceptual)

| Source | How it contributes | Auto-include in client report? |
|--------|--------------------|--------------------------------|
| Session facts (B1/B2) | Explicit platform emit as `session_fact` / `system_context` | **No** auto client include |
| Methodology execution (B3) | Adapter emit as `methodology_emission` | **No** — candidate until therapist includes |
| Note (B4A) | Therapist or platform helper creates `note_excerpt` when disposition warrants | Private notes: **never** |
| Timeline event (B4A) | Optional emit as `timeline_event` | **No** automatic |
| Transcript segment (B4B) | Therapist selection → `transcript_excerpt` | Full transcript: **never**; excerpts only when selected |
| Therapist authored | Direct `therapist_authored` row | Still requires inclusion decision |

---

## 7. Inclusion model

F1 `ContributionInclusion`: `candidate` \| `included` \| `excluded` \| `pending_review`.

**Proposed B4C CHECK (aligned with F1, mapped to Owner vocabulary):**

| `inclusion` | Owner-facing meaning | Notes |
|-------------|----------------------|-------|
| `candidate` | **report_candidate** | Emitted / accumulated; awaiting therapist decision |
| `pending_review` | Awaiting explicit therapist review | Useful for system-suggested items |
| `included` | **therapist_selected** (or confirmed include) | Eligible for later projection — **not** an approved report section |
| `excluded` | Explicitly out of client-facing report path | Editorial; ≠ physical delete; archive may still retain the row |

**`system_context`:** prefer as **`contribution_kind`**, not as `inclusion`. System context rows default to `candidate` or `excluded` and must **never** silently become `included`.

**Rules:**

1. Creating a contribution does **not** approve a report.  
2. `included` means “selected for future projection consideration,” not “shared with client.”  
3. Completing a session does not approve or share a report (Product 03).  
4. B6 projection reads the pool; B4C does not render.

---

## 8. Immutability boundary

| Layer | Mutability | Batch |
|-------|------------|-------|
| `platform_report_contributions` | **Working mutable** for editorial **inclusion**, optional **display** (`human_readable_value`), optional **provenance refs** only; `structured_value` is **create-once** (not generally rewritable in B4C) | **B4C** |
| Sealed session archive | Immutable snapshot including contribution copies/refs as designed | **B5** |
| Report projection draft | Mutable composition over sealed/canonical inputs | **B6** |
| Approved report rendition | Immutable approved artifact | **B6** |

**B4C mutability clarification:**

- B4C remains mutable working data only for **editorial inclusion / display / provenance-reference decisions**.  
- It is **not** a surface for arbitrary therapeutic / structured payload rewriting.  
- Broad contribution `structured_value` patching is **deferred** unless explicitly authorized later.  
- B4C must not seal archives, freeze contributions globally on session complete (unless Owner later requires a soft freeze RPC), or treat template identity as data authority (PD-009).

Default proposal: allow contribution create + inclusion (+ optional display/provenance-ref) updates while session is `in_progress` \| `paused` \| `closing`; **Owner confirm** post-terminal addenda (OD-B4C).

---

## 9. RLS / grants posture

### 9.1 Shared ownership model

Reuse B1–B4B:

- `therapist_id = auth.uid()` for owner reads  
- `UNIQUE (id, therapist_id)` + composite session FKs  
- Same-session optional artifact FKs  
- Server-owned timestamps / `row_revision`  
- RPC EXECUTE: `REVOKE ALL FROM public, anon, authenticated` then `GRANT EXECUTE TO authenticated`

### 9.2 Proposed RLS matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `platform_report_contributions` | owner | **deny** (RPC) | **deny** (RPC) | **deny** (prefer inclusion exclude) |

### 9.3 Proposed grants (authenticated)

| Object | Privileges |
|--------|------------|
| `platform_report_contributions` | `SELECT` only |
| B4C RPCs | `EXECUTE` to `authenticated` only |
| `anon` | **none** |

Never grant `TRUNCATE` / `TRIGGER` / `REFERENCES` to authenticated.

---

## 10. Idempotency posture for mutating RPCs

Reuse **B2 pending-claim** pattern via `platform_b2_replay_or_claim_idempotency` / `finalize` / `fail`.

**Do not propose** a broad `platform_upsert_report_contribution` (or any general `structured_value` patch RPC): that would imply arbitrary rewrites of opaque therapeutic/structured payloads.

| RPC (proposed names) | Purpose |
|----------------------|---------|
| `platform_create_report_contribution` | **Idempotent create only**; stores initial opaque `structured_value` + `provenance` (+ kind/source/optional same-session refs at create) |
| `platform_set_report_contribution_inclusion` | Updates **`inclusion` only** (`candidate` \| `pending_review` \| `included` \| `excluded`) |
| `platform_update_report_contribution_display` | **Optional** (Owner-approved): updates **`human_readable_value` only** |
| `platform_attach_report_contribution_provenance_refs` | **Optional**: updates same-session provenance **references only** (note/timeline/capture/segment/execution pointers); does **not** rewrite `structured_value` |

**Create-once rule for `structured_value`:**

1. `structured_value` is written by `platform_create_report_contribution` and then treated as **immutable within B4C RPC surface**.  
2. Editorial mutability in B4C is limited to inclusion, optional display text, and optional same-session provenance refs.  
3. Any broad contribution payload patching is **out of B4C** unless a later explicit authorization introduces a dedicated, narrowly scoped RPC.

**Explicitly not in B4C:** `platform_upsert_report_contribution`; general `structured_value` update/patch RPCs; seal RPCs; template/projection/rendition RPCs; note/timeline/transcript RPCs; methodology state-patch RPCs; PDF generators.

Fingerprint + claim/replay required on all mutating RPCs. No fire-and-forget idempotency inserts.

---

## 11. Validation expectations (when B4C is later authorized)

1. Additive migration(s) only; B1–B4B migration files untouched (except if a prior table needs `UNIQUE (id, therapist_id, session_id)` targets for FKs — prefer additive unique constraints, not behaviour changes).  
2. Exactly contribution table(s) in scope; no archive/report/template tables; no `platform_methodologies`; no therapeutic columns; no audio columns.  
3. Composite session FK; same-session optional execution/note/timeline/transcript FKs.  
4. SELECT-only table grants; RPC EXECUTE authenticated only after hardening.  
5. `inclusion` / `contribution_kind` CHECKs match approved OD defaults.  
6. Opaque `structured_value` / `provenance` object CHECKs.  
7. Static validator forbids seal/template/PDF/STT/audio/`platform_methodologies`/Hawkins-chakra-angel-MAP column names.  
8. Idempotent create / inclusion / optional display / optional provenance-ref replay; assert **absence** of upsert/general `structured_value` patch RPCs.  
9. Cross-therapist isolation; cross-session artifact refs rejected.  
10. F0/F1 validator remains green; new static B4C validator.  
11. No Product/AGENTS edits unless Owner-directed.

---

## 12. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Treating contributions as approved report sections | Document candidates ≠ sections; B6 owns approval |
| Auto-including private notes / full transcript | Explicit kind + inclusion rules; no auto-emit from private/full transcript |
| Therapeutic schema creep | Opaque jsonb only; forbid methodology columns |
| Cross-session provenance refs | Same-session composite FKs (B3/B4B lesson) |
| Pulling B5/B6 into B4C | Explicit exclusions; validator forbids archive/template tables |
| Direct browser writes | SELECT-only grants; RPC-only writes |
| Duplicate methodology catalogue | OD-F2-6; `radionics_specialties` only |
| Treating readiness as implementation auth | Separate local + Dev apply authorizations (OD-F2-5) |
| Broad upsert / `structured_value` rewrite RPC | Narrow create-only + inclusion/display/provenance-ref RPCs; validator forbids upsert/patch |
| Collapsing Live Report UI into persistence | No UI in B4C |
| System context leaking to client report | `system_context` kind never auto-`included` |

---

## 13. Owner decisions (APPROVED)

| ID | Decision | Approved default | Status |
|----|----------|------------------|--------|
| **OD-B4C-1** | Approve this readiness as design baseline for B4C (report contributions only)? | **Yes** — this document is the B4C design baseline | **APPROVED** |
| **OD-B4C-2** | Confirm B4C excludes archive/seal, templates, projections, PDF, UI, STT/audio, therapeutic columns, `platform_methodologies`? | **Yes** | **APPROVED** |
| **OD-B4C-3** | Write posture? | **RPC-only**; authenticated **SELECT only**; **no** broad upsert/`structured_value` patch | **APPROVED** |
| **OD-B4C-4** | Inclusion enum? | **F1-aligned:** `candidate` \| `pending_review` \| `included` \| `excluded` (`included` ≈ therapist_selected) | **APPROVED** |
| **OD-B4C-5** | Contribution kinds as listed in §5.2? | **Yes** (incl. `system_context`) | **APPROVED** |
| **OD-B4C-6** | Allow create/inclusion updates in `draft`? | **No** — only `in_progress`\|`paused`\|`closing` | **APPROVED** |
| **OD-B4C-7** | Post-terminal contribution addenda after `completed`/`cancelled`? | **Defer** — read-only after terminal in B4C | **APPROVED** |
| **OD-B4C-8** | Hard DELETE contributions? | **No** — set `excluded` | **APPROVED** |
| **OD-B4C-9** | Auto-emit contributions from private notes or full transcript? | **No** | **APPROVED** |
| **OD-B4C-10** | Auto-set `included` on methodology emission? | **No** — emit as `candidate` | **APPROVED** |
| **OD-B4C-11** | Require same-session FKs for note/timeline/segment refs? | **Yes** | **APPROVED** |
| **OD-B4C-12** | Allow `specialty_id` → `radionics_specialties` + snapshot slug/name? | **Yes** — optional | **APPROVED** |
| **OD-B4C-13** | Create identity strategy? | **Server uuid PK** + idempotency key on `platform_create_report_contribution`; optional `client_contribution_key` unique per therapist/session if Owner wants stable retries — **default: idempotency key only** | **APPROVED** |
| **OD-B4C-14** | Is `structured_value` create-once in B4C (no general patch RPC)? | **Yes** — create-only via `platform_create_report_contribution`; broad payload patching deferred; **no** `platform_upsert_report_contribution` | **APPROVED** |
| **OD-B4C-15** | Include optional `platform_update_report_contribution_display` (`human_readable_value` only)? | **Yes** — optional display RPC | **APPROVED** |
| **OD-B4C-16** | Include optional `platform_attach_report_contribution_provenance_refs`? | **Yes** — same-session refs only; no `structured_value` rewrite | **APPROVED** |
| **OD-B4C-17** | Separate authorizations for (a) local B4C implementation and (b) Development apply | **Required** (OD-F2-5) | **APPROVED** |

**No Product document contradiction requiring Product edits was found** for B4C scope: contribution pool independent of templates, candidates ≠ approved sections, and PD-009 archive/report separation match Product 03 §§9–10 and Product 04.

---

## 14. Implementation posture (when later authorized) — NOT AUTHORIZED

Suggested physical order (**still not authorized**):

1. Additive migration: `platform_report_contributions`, constraints, indexes, RLS, SELECT-only grants.  
2. Same-session optional FKs to executions / notes / timeline / transcript (+ additive unique targets on parents if required).  
3. SECURITY DEFINER RPCs: `platform_create_report_contribution` (create-once `structured_value`), `platform_set_report_contribution_inclusion`, optional display + provenance-ref RPCs — B2-style idempotency; **no** upsert/general payload patch.  
4. Immediate RPC grants hardening (`public`/`anon`/`authenticated` revoke → `authenticated` execute).  
5. Local static B4C validator + report (forbid archive/template/PDF/audio/`platform_methodologies`/therapeutic columns; forbid upsert/`structured_value` patch RPCs).  
6. Separate Owner auth for Development apply.  
7. No UI/services/seal/template/PDF until separately authorized.

**Batches clearly marked:**

| Step | Status |
|------|--------|
| B4C readiness (this document) | **APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION** |
| B4C local SQL + validator + report | **NOT AUTHORIZED** |
| B4C Development apply | **NOT AUTHORIZED** |
| B5 archive/seal | **NOT AUTHORIZED** |
| B6 templates/projections/renditions | **NOT AUTHORIZED** |

---

## 15. Confirmation — nothing implemented by this approval update

This Owner-approval update modifies **documentation only** (this readiness file).

- **No** SQL objects created or altered  
- **No** migrations added or modified  
- **No** code changes  
- **No** Supabase connections or writes  
- **No** UI, services, tests, or methodology behaviour changes  
- **No** Product / AGENTS / F2 v1.2 / F0–F1 contract edits  
- **No** B4C implementation started  
- **No** commit / push / deploy  

---

## 16. Stop line

**B4C READINESS APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION**
