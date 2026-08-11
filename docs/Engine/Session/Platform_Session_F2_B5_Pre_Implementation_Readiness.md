# Platform Session F2 — Batch B5 Pre-Implementation Readiness

**Status:** `PROPOSED FOR OWNER REVIEW / NOT AUTHORIZED FOR IMPLEMENTATION`  
**Date:** 2026-08-11  
**Scope:** Documentation / readiness only — Batch **B5** (platform session **archive assembly** and **sealing** only)  
**Depends on:** F2 design baseline v1.2; B1–B4C completed / applied / verified / published  
**Does not authorize:** SQL, migrations, Supabase writes, UI, services, tests, methodology behaviour, report templates/projections/renditions/PDF, B6+, commit, push, Production/apply, or deploy

---

## 1. Executive verdict

B5 is the next **persistence** unit after B4C. It should materialize how **live session data from B1–B4C** is assembled into a **canonical immutable session archive** — **without** implementing report templates, projections, approved renditions, PDF, Live Report UI, or therapeutic methodology behaviour.

**Product framing (Product 03 §10, Product 04, PD-009, AGENTS, F1 archive contracts):**

- **Archive ≠ report.** The sealed archive preserves the complete therapeutic session record independently of any Report Template.  
- **Archive sealing ≠ session completion** unless the Owner explicitly equates them (proposed default: seal is a **separate** command after `completed`, not an automatic side-effect of completion).  
- **Sealed archive is immutable canonical evidence.** Later B6 projections/renditions **reference** the sealed archive; they **never mutate** it.  
- Sealing must **not** depend on report template authority (`reportTemplateAuthority` / `report_template_authority` always **NULL**).  
- Live mutable rows (B1–B4C) remain live operational records; the sealed envelope is the **historical freeze** of what was assembled at seal time.  
- Catalogue authority remains **`radionics_specialties`** (OD-F2-6). **No** `platform_methodologies`.  
- Opaque envelopes only — no Hawkins / chakras / graphs / angels / MAP-specific columns.

**Why B5 (not B6):** F2 batch map places **assembly + sealed archives + seal RPC** in B5; **templates / projections / approved renditions** in B6. B5 must not create or approve client-facing report content.

**Proposed write posture (mirrors B2–B4C):** authenticated **SELECT only** on B5 tables; **narrow SECURITY DEFINER RPCs** with `platform_command_idempotency` (B2 pending-claim); **no** archive update/patch after seal; **no** report-generation RPC; grants hardening (no anon EXECUTE; no dangerous table grants).

This document is a **proposed design baseline** for Owner review. It does **not** authorize local implementation, Development apply, SQL, migrations, Supabase writes, UI, services, or tests.

**Label:** `PROPOSED FOR OWNER REVIEW / NOT AUTHORIZED FOR IMPLEMENTATION`

---

## 2. Inspected files / authorities

| Authority | Role for B5 |
|-----------|-------------|
| `docs/AGENTS.md` | Platform session domain methodology-neutral; archive is a platform session asset |
| `docs/Product/02_Product_Decisions.md` | **PD-009** session record / report projection separation |
| `docs/Product/03_Platform_Session_Experience.md` | §10 Session Archive and Report Projection; closing flow |
| `docs/Product/04_Platform_Session_Implementation_Readiness.md` | Archive assembly independent of templates; seal at completion |
| `src/platform/session/archive.ts` + `types.ts` | F1 `SessionArchiveAssembly`, `SealedCanonicalSessionArchive`, seal preconditions |
| `docs/Engine/Session/Platform_Session_F2_Supabase_Persistence_Pre_Implementation_Readiness.md` | §6.10–6.11 assemblies/sealed; §10 seal design; OD-F2-1…6 |
| B1–B4C local/Dev reports | Ownership, RPC-only, same-session FK lessons, SELECT-only grants, contribution/transcript/note disposition rules |

**Not modified:** Product 00–05, AGENTS, F2 v1.2 baseline, B1–B4C migrations/reports, F0/F1 contracts, UI, services — this task creates **only** this readiness file.

---

## 3. Scope and exclusions

### 3.1 In scope (proposed)

1. **`platform_session_archive_assemblies`** — optional work-in-progress assembly row (or equivalent) while preparing seal.  
2. **`platform_sealed_session_archives`** — immutable sealed artifact: metadata + **canonical envelope JSONB**.  
3. **Canonical envelope** assembled from B1–B4C live sources (facts, testimony, plan, executions, notes, timeline, transcript per rules, contributions).  
4. **Source row references / snapshots** inside the envelope (clone-at-seal semantics).  
5. **Sealing rules** — lifecycle preconditions, testimony/client identity, idempotency, transaction boundaries, concurrency / `row_revision`, fail-closed.  
6. **Immutability** — no UPDATE/DELETE on sealed archives; no post-seal patch RPC.  
7. **RLS / grants** — SELECT-only for authenticated (own rows); RPC-only writes.  
8. **Narrow RPCs** — prepare assembly (if needed) + seal only; **no** report generation.  
9. **Future B6 readiness** — sealed archive must be projectable later without B5 implementing templates/PDF.

### 3.2 Explicitly out of scope

| Deferred / forbidden | Batch / rule |
|----------------------|--------------|
| Report templates / projections / approved renditions | **B6** |
| PDF / Live Report UI / report composition engine | **B6 / Experience / F3** |
| Creating or approving client-facing report content | **Forbidden in B5** |
| Auto-inventing missing findings or therapeutic conclusions | **Forbidden** (Product 03) |
| Altering B1–B4C behaviour beyond optional FKs **from** B5 → those tables | **Preserve B1–B4C** |
| Raw audio / STT / provisional / live spoken text | **Out of B5** (OD-F2-4 / B4B) |
| `platform_methodologies` | **Never** (OD-F2-6) |
| Therapeutic first-class columns | **Forbidden** |
| Archive UPDATE / DELETE / patch after seal | **Forbidden** |
| UI / services wiring | **F3 / Experience** |
| SQL / migrations / Supabase writes / Production apply | **Require separate OD-F2-5 authorizations** |

---

## 4. Relationship to B1 / B2 / B3 / B4A / B4B / B4C

```text
platform_sessions (B1)
  ├── testimony / plan (B2) ────────── required testimony snapshot at seal (completed)
  ├── platform_methodology_executions (B3)
  │     metadata + opaque state_payload envelopes (not interpreted)
  │     specialty_id → radionics_specialties (catalogue; no platform_methodologies)
  ├── platform_session_notes (B4A) ── disposition rules at assembly
  ├── platform_timeline_events (B4A)
  ├── platform_transcript_captures / segments (B4B)
  │     private work material; retention/inclusion rules — not auto-report
  ├── platform_report_contributions (B4C)
  │     working pool copied/snapshotted into envelope
  └── B5 archive
        platform_session_archive_assemblies (optional WIP)
        platform_sealed_session_archives (immutable envelope)
              └── later B6 projections/renditions reference archive_id only
```

| Prior asset | B5 interaction |
|-------------|----------------|
| `platform_sessions` | Parent; seal locks/reads session facts + lifecycle; composite ownership |
| B2 testimony | **Required** for sealing a **completed** session; identity snapshot cloned into envelope |
| B2 plan items | Included as plan snapshot in envelope |
| B3 executions | All session executions (metadata + opaque `state_payload` / schema version) snapshotted; no therapeutic interpretation |
| B4A notes | Included per disposition rules (§6); private notes: archive vs report clarified in OD-B5 |
| B4A timeline | Meaningful events included; technical noise not required |
| B4B transcript | Per OD-F2-4 / B4B: private work material; **not automatically** copied unless Owner rule includes selected/retained segments |
| B4C contributions | Full working pool snapshotted (inclusion states preserved); candidates ≠ approved report sections |
| `platform_command_idempotency` | Dedup for prepare/seal RPCs (`seal_archive` command type already anticipated in F2) |
| B6 | Consumer of sealed archive; **not** implemented here |

**Boundary:** Live row ≠ sealed envelope ≠ report projection ≠ approved rendition.

---

## 5. Proposed archive model

Aligned with F1 `SessionArchiveAssembly` / `SealedCanonicalSessionArchive` and F2 §§6.10–6.11 / §10.

### 5.1 `platform_session_archive_assemblies` (optional WIP)

Purpose: hold assembly bookkeeping while the therapist is in closing / pre-seal review, **without** claiming immutability.

| Column (conceptual) | Notes |
|---------------------|-------|
| `id` | PK; domain `archiveId` while in assembly |
| `therapist_id` / `session_id` | Owner + parent |
| `assembly_status` | e.g. `in_assembly` \| `superseded_by_seal` |
| `envelope_draft` | Optional jsonb working draft (may be rebuilt at seal) |
| `schema_version` | e.g. `platform.session.archive.v1` |
| `row_revision` | Optimistic concurrency while in assembly |
| `created_at` / `updated_at` | Server-owned |
| `superseded_by_archive_id` | Set when seal succeeds (points at sealed row) |

**Constraints (proposed):**

- `UNIQUE (id, therapist_id)`  
- Composite FK `(session_id, therapist_id) → platform_sessions` ON DELETE RESTRICT  
- Prefer **at most one active `in_assembly`** row per session (partial unique)  
- After seal: retain read-only as `superseded_by_seal` (F2 recommendation) — **no** further edits via RPC  

**Owner decision:** whether prepare-assembly is mandatory or seal may assemble ephemerally in one transaction (OD-B5).

### 5.2 `platform_sealed_session_archives` — immutable artifact

| Column (conceptual) | Notes |
|---------------------|-------|
| `id` | PK; sealed `archiveId` (may equal assembly id or new uuid — OD-B5) |
| `therapist_id` / `session_id` | Owner + parent |
| `testimony_snapshot_id` | FK to B2 testimony (same therapist/session) when available |
| `envelope` | **Canonical JSONB** — frozen clone of archive payload |
| `content_sha256` | Hash of canonical envelope bytes (idempotency / integrity) |
| `assembly_status` | Always `sealed` |
| `sealed_at` / `sealed_by_therapist_id` | Sealing metadata |
| `archive_schema_version` | e.g. `platform.session.archive.v1` |
| `report_template_authority` | **Always NULL** (PD-009 / F1) |
| `schema_version` | Row/meta schema if distinct from archive schema |
| `created_at` | Insert-once |

**Constraints (proposed):**

- `UNIQUE (id, therapist_id)`  
- **`UNIQUE (session_id)`** or `UNIQUE (session_id, therapist_id)` — **one sealed archive per session** (fail closed on second distinct seal)  
- Composite session FK; composite testimony FK when required  
- **No** UPDATE/DELETE grants; reject-update trigger recommended  
- Soft limit on envelope size (F2 soft guidance ~1–2 MB; Owner-confirmable)

### 5.3 Canonical envelope JSONB (proposed shape)

Mirror F1 `SessionArchiveBase` (opaque where methodology-specific):

```text
{
  archiveId,
  sessionId,
  schemaVersion: "platform.session.archive.v1",
  platformFacts: { … session header / lifecycle / timer / mode / intention … },
  testimonySnapshot: { … client identity at session time … },
  sessionPlan: { items… },
  methodologyExecutions: [ { id, specialty/snapshot, status, order, state_payload opaque, … } ],
  notes: [ … per §6 disposition rules … ],
  timeline: [ … meaningful events … ],
  transcriptCaptures: [ … per §6 retention rules … ],
  transcriptSegments: [ … per §6 inclusion rules … ],
  reportContributions: [ … B4C pool snapshot with inclusion states … ],
  provenance: { assembledAt, assembledBy },
  reportTemplateAuthority: null,
  sealing: { sealedAt, sealedByTherapistId, archiveSchemaVersion }  // on sealed only
}
```

### 5.4 Source row references / snapshots

| Approach | Use in B5 |
|----------|-----------|
| **Snapshot clone** | Primary: seal RPC deep-clones current live row fields into envelope sections |
| **Stable source ids** | Preserve `id` of source rows inside each cloned object for audit/traceability |
| **Live rows after seal** | Remain mutable operationally only as prior batch rules allow; **do not** rewrite sealed envelope |
| **Relational FKs on sealed table** | Session + testimony (+ optional assembly) only — not FK-per-note inside envelope |

Database equivalent of F1 `immutableClone` / freeze: **insert-once sealed row + deny UPDATE/DELETE + content hash**.

### 5.5 Tables B5 must not create

- B6 `platform_report_templates` / `platform_report_projections` / `platform_approved_report_renditions`  
- Notes / timeline / transcript / contributions recreations  
- `platform_methodologies`  
- Audio / STT / therapeutic methodology tables  

---

## 6. What must be included in the archive

At seal time, assemble **where available** (Product 03 §10.2), without inventing missing values:

| Section | Source | Inclusion rule (proposed) |
|---------|--------|---------------------------|
| **Session facts** | B1 `platform_sessions` | Always — lifecycle, mode, schedule, timer fields, intention, active_execution pointer snapshot, etc. |
| **Client testimony snapshot** | B2 testimony | **Required** when sealing a **completed** session; identity/contacts as recorded at start |
| **Plan items** | B2 plan | All plan items for the session |
| **Methodology executions** | B3 | All executions: identity via `specialty_id` / slug-name snapshots, order, status history fields, **opaque** `state_payload` + `state_schema_version` — **no** platform interpretation |
| **Notes** | B4A | See §6.1 disposition |
| **Timeline events** | B4A | Meaningful events; emitter already filtered noise — archive all persisted timeline rows by default |
| **Transcript captures / segments** | B4B | See §6.2 retention/inclusion |
| **Report contributions pool** | B4C | Snapshot **entire pool** with current `inclusion` values (candidates/excluded included as historical evidence of editorial state) |

### 6.1 Notes — disposition rules

| Disposition | Archive? | Later B6 client report projection? |
|-------------|----------|------------------------------------|
| `private` | **Yes, as private archive material** (proposed default) — preserved in sealed envelope under notes with disposition retained | **No** — never auto-project |
| `review_for_report` | Yes | Eligible for therapist review in B6; not auto-approved |
| `included_in_report` | Yes | Eligible for projection consideration; still not an approved rendition |

**Clarification (OD-B5):** Private notes are **not** omitted from the canonical archive by default. They are **archived privately** (historical therapist work product) but remain **excluded from automatic report projection**. Alternative Owner option: exclude private notes from envelope entirely (narrower archive; higher risk of lost evidence).

### 6.2 Transcript — retention / inclusion rules

Per OD-F2-4 / B4B / Product:

- Transcript is **private work material**.  
- **Not automatically** copied into sealed archive **or** report projection unless Owner opts into an inclusion rule.  
- Proposed default for B5:  
  - **Captures:** include capture **metadata** (mode, status, times, consent flags) always.  
  - **Segments:** include only segments with `inclusion ∈ {retained}` (or Owner-approved set); exclude `excluded`; treat `pending_review` as **include in archive as pending** (historical) but not auto-report.  
- Provisional / live spoken text: **never** (not persisted in B4B).  
- Raw audio / STT artifacts: **never**.

### 6.3 Contributions

- Snapshot all B4C rows for the session.  
- Preserve `inclusion` (`candidate` \| `pending_review` \| `included` \| `excluded`) and kinds (incl. `system_context`).  
- `included` in the pool still means **projection candidate**, not approved report section.  
- Sealing does **not** promote candidates to approved report content.

---

## 7. What must not be included automatically

| Excluded / not automatic | Reason |
|--------------------------|--------|
| Private notes **into client-facing report path** | Disposition + PD-009 / Product 03; archive may still retain privately (OD-B5) |
| Full transcript auto-copy into report projection | OD-F2-4; private work material |
| Raw audio / STT / provisional text | Never persisted / out of F2 |
| B6 templates / projections / approved renditions | Separate batch; not archive inputs |
| Therapeutic generated conclusions **not** already recorded in live B1–B4C data | Forbidden invention |
| Report template identity as authority | `report_template_authority` always NULL |
| Live UI chrome / technical click spam beyond persisted timeline | Product 03: max relevant info ≠ every click |
| Cross-session artifacts | Same-session only |

---

## 8. Sealing rules

### 8.1 Allowed lifecycle status (proposed)

| Rule | Proposed default |
|------|------------------|
| Seal allowed when | `lifecycle_status = 'completed'` |
| Seal while `closing` | **No** (assembly may prepare; seal waits for complete) — aligns with F1 `sealCompletedSessionArchive` |
| Seal for `cancelled` | **No** by default (OD-B5); cancelled sessions may remain without sealed archive unless Owner later authorizes a distinct “cancel archive” |
| Seal equals completion? | **No** — `platform_complete_session` does **not** auto-seal; therapist (or later F3 flow) calls seal separately |

### 8.2 Required testimony / client identity

- Completed-session seal **requires** a same-session testimony snapshot (F1 + F2 §10).  
- Testimony `session_id` must match archive/session.  
- Client identity fields are those **already sealed at start** in B2 — B5 does not re-collect identity.

### 8.3 Idempotency

- All mutating B5 RPCs require `idempotency_key` via B2 pending-claim helpers.  
- If sealed row already exists for session:  
  - same `content_sha256` / fingerprint → return existing sealed archive (replay).  
  - different hash → **fail closed** (do not overwrite).  
- Prepare-assembly retries must not create duplicate active assemblies (partial unique / claim).

### 8.4 Transaction boundaries

Single atomic seal transaction (F2 §10):

1. Lock session (`SELECT … FOR UPDATE` or optimistic `row_revision`).  
2. Re-validate sealability (lifecycle, testimony, ownership).  
3. Read live B1–B4C sources.  
4. Build envelope JSONB; compute `content_sha256`.  
5. Insert sealed row; mark assembly `superseded_by_seal` if present.  
6. Finalize idempotency; commit.  

**No** partial seal: failure rolls back insert and assembly supersession.

### 8.5 `row_revision` / concurrency

- Session `row_revision` (and optional assembly revision) checked in seal RPC.  
- Mismatch → conflict / fail closed; no sealed insert.  
- Sealed table has **no** therapist-driven revision updates after insert.

### 8.6 Fail-closed if not sealable

Fail closed (no insert) when any of:

- Session not owned by caller  
- Lifecycle not sealable  
- Testimony missing / mismatched  
- Active assembly conflict / already sealed with different hash  
- Envelope build exceeds approved size policy (if enforced)  
- Idempotency fingerprint mismatch  

---

## 9. Immutability

| Layer | Mutability | Batch |
|-------|------------|-------|
| B1–B4C live tables | Per prior batch rules | B1–B4C |
| `platform_session_archive_assemblies` | Mutable only while `in_assembly`; read-only after supersession | **B5** |
| `platform_sealed_session_archives` | **Immutable** — insert via seal RPC only | **B5** |
| Report projection draft | Mutable composition over sealed inputs | **B6** |
| Approved report rendition | Immutable; references archive | **B6** |

**Database terms for clone/freeze:**

- Seal RPC performs **deep clone** of selected live fields into `envelope` jsonb.  
- `content_sha256` binds integrity.  
- RLS + grants + trigger deny UPDATE/DELETE.  
- **No** `platform_update_sealed_session_archive` / patch / re-seal overwrite RPCs.  
- B6 approved report **references** `archive_id`; changing templates or live rows **never** mutates sealed envelope (PD-009).

---

## 10. RLS / grants posture

### 10.1 Shared ownership model

Reuse B1–B4C:

- `therapist_id = auth.uid()` for owner reads  
- `UNIQUE (id, therapist_id)` + composite session FKs  
- Server-owned timestamps  
- RPC EXECUTE: `REVOKE ALL FROM public, anon, authenticated` then `GRANT EXECUTE TO authenticated`

### 10.2 Proposed RLS matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `platform_session_archive_assemblies` | owner | **deny** (RPC) | **deny** (RPC) | **deny** |
| `platform_sealed_session_archives` | owner | **deny** (RPC) | **deny** | **deny** |

### 10.3 Proposed grants (authenticated)

| Object | Privileges |
|--------|------------|
| Assembly + sealed tables | `SELECT` only |
| B5 RPCs | `EXECUTE` to `authenticated` only |
| `anon` | **none** |

Never grant `TRUNCATE` / `TRIGGER` / `REFERENCES` to authenticated.

---

## 11. Proposed RPCs

| RPC (proposed) | Purpose |
|----------------|---------|
| `platform_prepare_session_archive_assembly` | **Optional / if needed** — create or refresh `in_assembly` row; may store draft envelope or only bookkeeping; idempotent; allowed in `closing` and/or `completed` (OD-B5) |
| `platform_seal_session_archive` | **Required** — atomic seal from live sources (+ optional assembly); insert immutable sealed row; supersede assembly |

**Explicitly not in B5:**

- Any report generation / projection / approve-rendition / PDF RPC  
- Archive UPDATE / patch / unseal / re-seal overwrite  
- Note / timeline / transcript / contribution / methodology state-patch RPCs (already owned by prior batches)  
- `platform_methodologies` catalogue RPCs  

Fingerprint + claim/replay required on all mutating RPCs.

---

## 12. Validation expectations (when B5 is later authorized)

1. Additive migration(s) only; B1–B4C migration files untouched (except additive unique/FK targets if strictly required).  
2. Exactly assembly + sealed tables in scope; **no** B6 template/projection/rendition tables; no `platform_methodologies`; no therapeutic columns; no audio columns.  
3. Composite session (+ testimony) FKs; one sealed archive per session.  
4. `report_template_authority` always NULL (CHECK or constant).  
5. SELECT-only table grants; RPC EXECUTE authenticated only after hardening.  
6. Seal fails closed without testimony / wrong lifecycle / revision conflict.  
7. Idempotent seal replay returns same archive; conflicting hash fails.  
8. No UPDATE/DELETE path on sealed table (grants + trigger).  
9. Static validator forbids B6 tables/RPCs, PDF, STT/audio, `platform_methodologies`, therapeutic column names, post-seal patch RPCs.  
10. Assert transcript **not** auto-included beyond approved OD-B5 rules; private notes follow approved archive disposition.  
11. F0/F1 validator remains green; new static B5 validator.  
12. No Product/AGENTS edits unless Owner-directed.

---

## 13. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Archive treated as client report | Document Archive ≠ report; no B6 objects/RPCs in B5 |
| Seal coupled to template choice | `report_template_authority IS NULL`; validator asserts |
| Auto-publishing private notes / full transcript | Disposition + transcript inclusion ODs; fail-closed defaults |
| Mutating sealed evidence later | Deny UPDATE/DELETE; no patch RPC; hash check |
| Silent re-seal with different content | Fail closed on hash mismatch |
| Completing session without clear seal step | Separate RPCs; OD on auto-seal vs explicit seal |
| Envelope size / performance | Soft size limit; no binary audio; opaque payloads only |
| Therapeutic schema creep | Opaque jsonb; forbid methodology columns |
| Pulling B6 into B5 | Explicit exclusions; validator forbids template/projection/rendition |
| Direct browser writes | SELECT-only grants; RPC-only writes |
| Duplicate methodology catalogue | OD-F2-6; `radionics_specialties` only |
| Treating readiness as implementation auth | Separate local + Dev apply authorizations (OD-F2-5) |
| Live rows diverging after seal confusing therapists | Product/UX later: sealed is canonical historical; live is operational |

---

## 14. Owner decisions (PROPOSED defaults — awaiting Owner)

| ID | Decision | Proposed default | Status |
|----|----------|------------------|--------|
| **OD-B5-1** | Approve this readiness as design baseline for B5 (archive assembly + sealing only)? | **Yes** — this document becomes the B5 design baseline when Owner approves | **PROPOSED** |
| **OD-B5-2** | Confirm B5 excludes templates, projections, renditions, PDF, UI, STT/audio, therapeutic columns, `platform_methodologies`? | **Yes** | **PROPOSED** |
| **OD-B5-3** | Write posture? | **RPC-only**; authenticated **SELECT only**; **no** post-seal update/patch | **PROPOSED** |
| **OD-B5-4** | Require `platform_prepare_session_archive_assembly`? | **Optional** — allow seal-only atomic assembly; prepare RPC available for closing WIP | **PROPOSED** |
| **OD-B5-5** | Seal allowed lifecycle? | **`completed` only** | **PROPOSED** |
| **OD-B5-6** | Does completion auto-seal? | **No** — explicit `platform_seal_session_archive` | **PROPOSED** |
| **OD-B5-7** | Seal cancelled sessions? | **No** in B5 | **PROPOSED** |
| **OD-B5-8** | Testimony required at seal? | **Yes** for completed-session seal | **PROPOSED** |
| **OD-B5-9** | One sealed archive per session? | **Yes** — unique session; conflict on divergent re-seal | **PROPOSED** |
| **OD-B5-10** | Private notes in sealed envelope? | **Yes — archived privately** with disposition retained; **never** auto-project in B6 | **PROPOSED** |
| **OD-B5-11** | Include `platform_prepare_session_archive_assembly` in B5? | **Yes, optional helper RPC** — B5 may create/refresh an `in_assembly` row before sealing, but `platform_seal_session_archive` remains the required atomic authority and may supersede assembly. |
| **OD-B5-12** | Contributions snapshot? | **Entire B4C pool** with inclusion states preserved | **PROPOSED** |
| **OD-B5-13** | `report_template_authority`? | **Always NULL** | **PROPOSED** |
| **OD-B5-14** | Methodology identity in envelope? | **`specialty_id` → `radionics_specialties`** + slug/name snapshots only; **no** `platform_methodologies` | **PROPOSED** |
| **OD-B5-15** | Envelope integrity? | **`content_sha256`** required; idempotent same-hash replay | **PROPOSED** |
| **OD-B5-16** | Soft envelope size limit? | Follow F2 ~1–2 MB guidance; exact limit Owner-confirmable at implementation | **PROPOSED** |
| **OD-B5-17** | Separate authorizations for (a) local B5 implementation and (b) Development apply | **Required** (OD-F2-5); **no** Production/apply in this readiness | **PROPOSED** |

**No Product document contradiction requiring Product edits was found** for B5 scope: PD-009 archive/report separation, Product 03 §10 archive contents, and F1 seal-on-completed preconditions match this proposal. Open Owner choices are limited to auto-seal vs explicit seal, private-note archive retention, and transcript segment inclusion granularity.

---

## 15. Implementation batches — NOT AUTHORIZED

Suggested physical order (**still not authorized**):

1. Additive migration: `platform_session_archive_assemblies` (if approved), `platform_sealed_session_archives`, constraints, indexes, RLS, SELECT-only grants, immutability trigger.  
2. SECURITY DEFINER RPCs: optional `platform_prepare_session_archive_assembly`, required `platform_seal_session_archive` — B2-style idempotency; atomic seal TX; hash + fail-closed.  
3. Immediate RPC grants hardening.  
4. Local static B5 validator + implementation report (forbid B6/PDF/audio/`platform_methodologies`/therapeutic columns/post-seal patch).  
5. Separate Owner auth for Development apply.  
6. No UI/services/templates/PDF until separately authorized (B6 / Experience / F3).

**Batches clearly marked:**

| Step | Status |
|------|--------|
| B5 readiness (this document) | **PROPOSED FOR OWNER REVIEW — NOT AUTHORIZED FOR IMPLEMENTATION** |
| B5 local SQL + validator + report | **NOT AUTHORIZED** |
| B5 Development apply | **NOT AUTHORIZED** |
| B6 templates/projections/renditions | **NOT AUTHORIZED** |
| Production apply | **NOT AUTHORIZED** |

---

## 16. Confirmation — nothing implemented by this readiness task

This task creates **documentation only** (this readiness file).

- **No** SQL objects created or altered  
- **No** migrations added or modified  
- **No** code changes  
- **No** Supabase connections or writes  
- **No** UI, services, tests, or methodology behaviour changes  
- **No** Product / AGENTS / F2 v1.2 / F0–F1 contract edits  
- **No** B5 implementation started  
- **No** commit / push / deploy  

---

## 17. Stop line

**B5 READINESS PROPOSED — NOT AUTHORIZED FOR IMPLEMENTATION**

---

## 18. Deliverable confirmation

Only this documentation file was created:

`docs/Engine/Session/Platform_Session_F2_B5_Pre_Implementation_Readiness.md`

No SQL, code, migrations, Supabase, UI, services, tests, commit, push or deploy.
