# Platform Session F2 — Batch B6 Pre-Implementation Readiness

**Status:** `APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`  
**Date:** 2026-08-11  
**Scope:** Documentation / readiness only — Batch **B6** (report **templates**, **projections**, and **approved renditions** only)  
**Depends on:** F2 design baseline v1.2; B1–B5 completed / applied / verified / published (sealed archive is immutable source of truth for projection)  
**Does not authorize:** SQL, migrations, Supabase writes, UI, services, tests, methodology behaviour, archive mutation/re-seal/unseal, PDF generation implementation, B7+, commit, push, Production/apply, or deploy

---

## 1. Executive verdict

B6 is the next **persistence** unit after B5. It should materialize how a therapist selects a **Report Template**, projects **client-facing report drafts** from a **sealed session archive**, customizes those drafts, and **approves immutable renditions** — **without** mutating the sealed archive, implementing Live Report UI, PDF engines, or therapeutic methodology behaviour.

**Product framing (Product 03 §10, Product 04, PD-009, AGENTS, F1 `reportProjection.ts`, OD-F2-3):**

- **Session archive ≠ report template ≠ report projection ≠ approved rendition.**  
- **B5 sealed archive** is the **immutable source of truth** for what may be projected; B6 **reads** it and **never** updates/re-seals/unseals it.  
- A Report Template **selects, organizes and presents** archived information; it **never** determines which canonical therapeutic data is preserved.  
- Changing a template creates a **new projection** (or regenerates a draft under explicit therapist choice) — it **never** changes the sealed archive or previously approved/shared renditions.  
- Completing / sealing a session does **not** approve or share a report (session lifecycle ⊥ report lifecycle).  
- Contributions / notes / transcript inclusion states in the archive remain **candidates** until therapist projection overrides and approval.  
- Catalogue authority for methodology identity remains **`radionics_specialties`** (OD-F2-6). **No** `platform_methodologies`.  
- Opaque JSONB for template configuration, therapist edits, and sealed rendition content — no Hawkins / chakras / graphs / angels / MAP-specific columns.

**Why B6 (not B5 / not Experience):** F2 batch map places **`platform_report_templates` + projections + approved renditions** in B6. Visual editor, full composition engine, personalization UI, sharing UX, and PDF rendering remain **Experience / F3** (or later explicit auth). B6 may define an **export/PDF boundary** (metadata / “not generated here”) without implementing PDF generation unless separately approved.

**Proposed write posture (mirrors B2–B5):** authenticated **SELECT only** on B6 session-owned tables (and appropriate template reads); **narrow SECURITY DEFINER RPCs** with `platform_command_idempotency` (B2 pending-claim); **no** archive mutation RPCs; **no** direct client writes to approved renditions; grants hardening (no anon EXECUTE; no dangerous table grants).

This document is a **proposed design baseline** for Owner review. It does **not** authorize local implementation, Development apply, SQL, migrations, Supabase writes, UI, services, or tests.

**Label:** `B6 READINESS APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`

---

## 2. Inspected files / authorities

| Authority | Role for B6 |
|-----------|-------------|
| `docs/AGENTS.md` | Platform session methodology-neutral; report assets are platform session domain |
| `docs/Product/02_Product_Decisions.md` | **PD-009** archive / report projection separation |
| `docs/Product/03_Platform_Session_Experience.md` | §9–§10 Live Report, archive, templates, projection sequence, approval |
| `docs/Product/04_Platform_Session_Implementation_Readiness.md` | Archive-independent templates; immutable approved versions |
| `src/platform/session/reportProjection.ts` + `types.ts` | F1 draft / approve / report lifecycle independence |
| `docs/Engine/Session/Platform_Session_F2_Supabase_Persistence_Pre_Implementation_Readiness.md` | §§6.12–6.14, §11, OD-F2-3 (mandatory templates catalogue) |
| B1–B5 local/Dev reports | RPC-only, SELECT-only, sealed archive immutability, contribution/note/transcript inclusion semantics |

**Not modified:** Product 00–05, AGENTS, F2 v1.2 baseline, B1–B5 migrations/reports, F0/F1 contracts, UI, services — this task creates **only** this readiness file.

**Fact check:** `platform_report_templates` / projections / approved renditions are **absent** from migrations through B5; B6 must introduce them.

---

## 3. Scope and exclusions

### 3.1 In scope (proposed)

1. **`platform_report_templates`** — mandatory minimal catalogue (OD-F2-3): official (`therapist_id` NULL) + therapist-owned templates; identity, version, status, opaque `configuration` jsonb.  
2. **`platform_report_projections`** — mutable draft/in-review projections bound to **one sealed archive** + **one template ref** (id + version snapshot).  
3. **Therapist customization** — opaque `therapist_edits` / `inclusion_overrides` (and related draft fields) without rewriting archive facts.  
4. **`platform_approved_report_renditions`** — immutable approved artifacts with `sealed_content` jsonb + provenance to archive + template.  
5. **Provenance** — every projection/rendition references `archive_id` + template identity/version; optional `projection_id` on rendition.  
6. **Report lifecycle** independent of session lifecycle (F1 statuses).  
7. **RLS / grants** — SELECT-only for session-owned B6 tables; template read rules; RPC-only writes.  
8. **Idempotency / concurrency** — B2 pending-claim; `row_revision` on mutable projections/templates.  
9. **Export/PDF boundary** — document that PDF is **out of B6 implementation** unless later authorized; may reserve optional export-metadata fields or forbid them until OD approval.  
10. **Validation gates** and Owner decisions for later local + Dev-apply authorizations.

### 3.2 Explicitly out of scope

| Deferred / forbidden | Batch / rule |
|----------------------|--------------|
| Archive assembly / seal / re-seal / unseal / envelope patch | **B5 only** — B6 must not mutate sealed archives |
| Live Report UI / visual template editor / composition engine | **Experience / F3** |
| PDF / print pipeline generation | **Out of B6 unless separate auth** (boundary only here) |
| Client sharing portal / public links mutating renditions | **Later** — sharing must not alter `sealed_content` |
| Auto-inventing missing findings | **Forbidden** (Product 03) |
| Altering B1–B5 migration files | **Preserve B1–B5** |
| `platform_methodologies` | **Never** (OD-F2-6) |
| Therapeutic first-class columns | **Forbidden** |
| UI / services wiring | **F3 / Experience** |
| SQL / migrations / Supabase writes / Production apply | **Require separate OD-F2-5 authorizations** |
| B7+ indexes/types polish as a substitute for B6 design | **B7** |

---

## 4. Relationship to B1–B5 (especially B5 sealed archive)

```text
B5 platform_sealed_session_archives (immutable envelope)
        │  read-only for projection
        ▼
B6 platform_report_templates (catalogue; OD-F2-3)
        │  selected template id + version
        ▼
B6 platform_report_projections (mutable draft / in_review)
        │  therapist edits + inclusion overrides
        │  approve RPC
        ▼
B6 platform_approved_report_renditions (immutable sealed_content)
        │
        └── never writes back to B5 archive
```

| Prior asset | B6 interaction |
|-------------|----------------|
| `platform_sealed_session_archives` | **Required** parent for projection create; composite FK; **SELECT only** — no UPDATE/DELETE from B6 |
| `platform_sessions` | Ownership parent; report lifecycle independent of session status (projection typically after seal/`completed`, but session status is not report status) |
| B4C contributions (inside envelope) | Projection may override inclusion for **presentation**; does not rewrite live B4C rows or sealed envelope |
| B4A notes dispositions | Private notes in archive: **never auto-project**; review/included dispositions eligible for therapist selection |
| B4B transcript | Private work material; excerpts only if already in archive per B5 rules **and** therapist includes them in projection |
| `radionics_specialties` | Optional template tagging / methodology section mapping via specialty ids — **not** `platform_methodologies` |
| `platform_command_idempotency` | Dedup for create-projection / patch-draft / approve-rendition / template RPCs |

**Boundary reminders:**

- Live B1–B4C rows may still exist and even change under prior batch rules; **approved reports do not silently refresh** from live data — they freeze presentation from archive + edits at approval.  
- Regenerating a draft after live changes still **reads the sealed archive**, not a new seal (unless therapist seals again — B5 forbids second seal per session).

---

## 5. Proposed data model (conceptual)

### 5.1 `platform_report_templates` (new in B6; OD-F2-3)

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | Stable template identity |
| `therapist_id` | `uuid` | YES | NULL = official/platform; non-null = therapist-owned |
| `name` | `text` | NO | Display name |
| `version` | `text` | NO | Version string (immutable per row or row-per-version — OD-B6) |
| `status` | `text` | NO | e.g. `draft` \| `active` \| `inactive` |
| `configuration` | `jsonb` | NO | Opaque template configuration (sections, defaults, copy) — **not** therapeutic typed schema |
| `specialty_id` | `uuid` | YES | Optional FK → `radionics_specialties` when template is specialty-associated |
| `schema_version` | `text` | NO | e.g. `platform.report.template.v1` |
| `row_revision` | `integer` | NO | For therapist-owned mutable rows |
| `created_at` / `updated_at` | `timestamptz` | NO | Server-owned |

**Constraints (proposed):**

- `UNIQUE (id)` always  
- Therapist-owned: `UNIQUE (id, therapist_id)` when `therapist_id` not null  
- Optional uniqueness on `(therapist_id, name, version)` for owned templates  
- Official rows: `therapist_id IS NULL`; readable by authenticated therapists per RLS (OD-B6)  
- `configuration` must be jsonb object  
- **No** visual editor assets in F2  

**In F2:** persistence of catalogue only.  
**Out of F2:** WYSIWYG editor, marketplace, full composition engine.

### 5.2 `platform_report_projections` (mutable draft)

Aligned with F1 `ReportProjectionDraft`:

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | `projectionId` |
| `therapist_id` | `uuid` | NO | Owner |
| `session_id` | `uuid` | NO | Parent session |
| `archive_id` | `uuid` | NO | **FK → sealed archive** (same therapist/session) |
| `template_id` | `uuid` | NO | Selected template |
| `template_version` | `text` | NO | Snapshot of template version at projection create/bind |
| `template_name` | `text` | YES | Snapshot for historical display |
| `status` | `text` | NO | Report lifecycle subset used on projection (see §7) |
| `therapist_edits` | `jsonb` | NO | Opaque edits; default `{}` |
| `inclusion_overrides` | `jsonb` | NO | Map-like object of contribution/section inclusion decisions |
| `projected_snapshot` | `jsonb` | YES | Optional materialized projection working set (OD-B6: store vs compute-on-read) |
| `schema_version` | `text` | NO | e.g. `platform.report.projection.v1` |
| `row_revision` | `integer` | NO | Optimistic concurrency |
| `created_at` / `updated_at` | `timestamptz` | NO | |

**Constraints (proposed):**

- `UNIQUE (id, therapist_id)`  
- Composite session FK `(session_id, therapist_id) → platform_sessions`  
- Same-session/therapist sealed archive FK: `(archive_id, therapist_id)` → `platform_sealed_session_archives` **and** enforce `archive.session_id = projection.session_id` (composite unique on sealed `(id, therapist_id, session_id)` additive if needed)  
- Template FK to `platform_report_templates(id)` (version matched in RPC against catalogue row)  
- Status CHECK per §7  
- `therapist_edits` / `inclusion_overrides` jsonb objects  
- Guard via `platform_guard_mutable_owned_row` while mutable  

**Multiplicity:** Multiple projections per archive allowed (new template → new projection). Prefer soft-close of superseded drafts rather than hard DELETE (OD-B6).

### 5.3 `platform_approved_report_renditions` (immutable)

Aligned with F1 `ApprovedReportRendition`:

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | `uuid` | NO | `renditionId` |
| `therapist_id` | `uuid` | NO | Owner |
| `session_id` | `uuid` | NO | |
| `archive_id` | `uuid` | NO | Provenance to sealed archive |
| `projection_id` | `uuid` | NO | Source projection at approval |
| `template_id` | `uuid` | NO | |
| `template_version` | `text` | NO | Frozen |
| `template_name` | `text` | YES | Frozen |
| `version` | `integer` | NO | Rendition version number (monotonic per session or per projection — OD-B6) |
| `approved_at` | `timestamptz` | NO | |
| `approved_by_therapist_id` | `uuid` | NO | Must equal owner |
| `sealed_content` | `jsonb` | NO | Opaque approved presentation payload |
| `content_sha256` | `text` | YES | Recommended integrity hash of `sealed_content` |
| `schema_version` | `text` | NO | e.g. `platform.report.rendition.v1` |
| `created_at` | `timestamptz` | NO | Insert-once |

**Constraints (proposed):**

- `UNIQUE (id, therapist_id)`  
- Composite FKs to session, sealed archive, projection (same therapist)  
- `approved_by_therapist_id = therapist_id`  
- Immutability trigger reject UPDATE/DELETE  
- Soft size limit on `sealed_content` (Owner-confirmable; align with F2 ~1–2 MiB guidance)  

### 5.4 Tables B6 must not create / alter

- Must **not** recreate B1–B5 tables  
- Must **not** add archive mutation / re-seal RPCs  
- Must **not** create `platform_methodologies`  
- Must **not** create PDF binary storage tables unless separately authorized  
- Must **not** create sharing/public-link tables in B6 core (defer)

---

## 6. Projection rules from sealed archive

### 6.1 Inputs

1. Sealed envelope (B5) — facts, testimony, plan, executions (opaque state), notes, timeline, transcript (per B5 inclusion), contributions pool.  
2. Selected template `configuration` — opaque section/layout defaults.  
3. Therapist edits + inclusion overrides on the projection.

### 6.2 Default inclusion heuristics (proposed; non-therapeutic)

| Archive material | Default into client-facing projection |
|------------------|----------------------------------------|
| Session facts / testimony identity | Per template sections; identity as template requests |
| Plan / execution metadata | Eligible; opaque state only if template asks — platform does not interpret |
| Notes `private` | **Never** auto-include |
| Notes `review_for_report` | Candidate — therapist decide |
| Notes `included_in_report` | Default candidate for include |
| Timeline | Only if template/therapist selects meaningful events |
| Transcript | **Never** auto-include full transcript; only archive-present segments therapist selects |
| Contributions `included` | Default candidates |
| Contributions `candidate` / `pending_review` | Review required |
| Contributions `excluded` / `system_context` | **Never** auto-include |

Platform **omits or marks not recorded** when template requests missing data — **never invents** values (Product 03 §10.5).

### 6.3 What projection must not do

- Mutate sealed archive or live B1–B4C rows as a side effect of projection edits  
- Treat template as archive authority  
- Approve/share automatically on session complete or seal  
- Embed raw audio / STT / provisional text  

---

## 7. Lifecycle and invariants

### 7.1 Report lifecycle (F1)

F1 `PlatformReportLifecycleStatus`:

`not_started` → `accumulating` → `draft` → `in_review` → `approved` → `shared`

Allowed transitions (domain):

| From | To |
|------|----|
| `not_started` | `accumulating`, `draft` |
| `accumulating` | `draft`, `in_review` |
| `draft` | `in_review`, `approved` |
| `in_review` | `draft`, `approved` |
| `approved` | `shared` |
| `shared` | ∅ |

**Proposed B6 persistence simplification (OD-B6):**

- Projection rows primarily use `draft` \| `in_review` (and optionally `accumulating`).  
- Approval creates **rendition** and may mark projection `approved` (or leave projection as historical draft and treat rendition as authority — Owner choose).  
- `shared` deferred to sharing feature (status on rendition metadata later) — **default: not in B6 RPCs**.

### 7.2 Invariants

1. Session lifecycle and report lifecycle are **independent**.  
2. Projection requires an existing **sealed** archive for the same session/therapist.  
3. Approval freezes `sealed_content` from projection + archive reads at approve time.  
4. Template change after approval → **new** projection/rendition path; old renditions unchanged.  
5. No UPDATE/DELETE on approved renditions.  
6. No UPDATE/DELETE on sealed archives from B6.  
7. Fail closed if archive missing, template inactive/unauthorized, revision conflict, or idempotency fingerprint mismatch.

### 7.3 Concurrency

- Mutable projections: `row_revision` + optional `p_expected_row_revision` on patch/approve.  
- Templates (therapist-owned): `row_revision` on update RPCs.  
- Approve RPC: lock projection (+ read archive); insert rendition; finalize idempotency in one TX.  
- Forbidden: silent last-write-wins without revision/idempotency.

---

## 8. Proposed RPCs (conceptual names)

| RPC | Purpose |
|-----|---------|
| `platform_create_report_projection` | Bind sealed `archive_id` + `template_id` (+ version resolve); create draft projection; idempotent |
| `platform_update_report_projection_draft` | Patch `therapist_edits` and/or `inclusion_overrides` and/or status within draft/in_review only; **not** a general sealed_content writer |
| `platform_set_report_projection_status` | Narrow status transition among allowed draft/in_review paths |
| `platform_approve_report_rendition` | Create immutable rendition from projection; command_type `approve_rendition`; fail closed if not approvable |
| `platform_upsert_report_template` (therapist-owned) | Optional narrow create/update for owned templates (configuration opaque); official templates admin-only / seed |
| `platform_set_report_template_status` | Activate/deactivate owned templates |

**Explicitly not in B6:**

- `platform_seal_session_archive` / prepare / re-seal / unseal / archive patch  
- PDF generate/render RPCs (unless later authorized)  
- Methodology state-patch / contribution create (owned by prior batches)  
- Sharing publish RPCs that mutate `sealed_content`  

All mutating RPCs: B2 pending-claim idempotency; `REVOKE ALL` → `GRANT EXECUTE TO authenticated` only.

---

## 9. RLS / grants posture

### 9.1 Shared model

- `therapist_id = auth.uid()` for owned rows  
- Composite ownership FKs into sessions / sealed archives / projections  
- Server-owned timestamps / revisions  
- RPC EXECUTE hardening identical to B2–B5  

### 9.2 Proposed RLS matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `platform_report_templates` | official: authenticated (or certified) read; owned: owner | **deny** (RPC/admin) | **deny** (RPC) | **deny** |
| `platform_report_projections` | owner | **deny** (RPC) | **deny** (RPC) | **deny** |
| `platform_approved_report_renditions` | owner | **deny** (RPC) | **deny** | **deny** |

### 9.3 Proposed grants (authenticated)

| Object | Privileges |
|--------|------------|
| B6 tables | `SELECT` only (templates: as RLS allows) |
| B6 RPCs | `EXECUTE` to `authenticated` only |
| `anon` | **none** |

Never grant `TRUNCATE` / `TRIGGER` / `REFERENCES` to authenticated.

---

## 10. Export / PDF boundary

| Topic | B6 posture (proposed) |
|-------|------------------------|
| PDF generation libraries / storage | **Out of scope** — do not implement |
| Export job tables | **Defer** unless Owner requires a stub |
| Rendition `sealed_content` | Presentation JSON suitable for **later** PDF/UI renderers |
| Documented boundary | Experience/F3 may render PDF from approved rendition **without** changing B6 rows |

**OD-B6** must confirm: B6 ships **zero** PDF RPCs/tables.

---

## 11. Validation expectations (when B6 is later authorized)

1. Additive migration(s) only; B1–B5 files untouched (except additive unique targets strictly required for same-session archive FKs).  
2. Creates templates + projections + approved renditions only; no archive mutation; no `platform_methodologies`; no therapeutic columns; no audio; no PDF generators.  
3. Projection FK to sealed archive; approve requires projection + archive.  
4. `report_template_authority` remains NULL on sealed archives (B5 invariant preserved).  
5. SELECT-only table grants; RPC EXECUTE authenticated only after hardening.  
6. Approved rendition immutability trigger; no update/patch RPCs on renditions.  
7. Idempotent create-projection / patch / approve replay.  
8. Template change does not UPDATE sealed archive or existing renditions.  
9. Private notes / full transcript never auto-included by default projection rules.  
10. Static validator forbids re-seal/unseal/archive-patch/PDF/`platform_methodologies`/therapeutic terms.  
11. F0/F1 validator remains green; new static B6 validator.  
12. No Product/AGENTS edits unless Owner-directed.

---

## 12. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Template treated as archive authority | PD-009; projections reference archive; sealed `report_template_authority` stays NULL |
| Silent refresh of approved reports from live data | Approve freezes `sealed_content`; no auto-rebuild RPC |
| Mutating sealed archive from report flow | No archive write RPCs in B6; validator forbids |
| Private notes / transcript leakage | Default exclusion rules; overrides explicit only |
| Inventing missing fields | Omit / not-recorded; Product 03 |
| PDF scope creep | Boundary section; OD forbids PDF in B6 |
| Therapeutic schema in template configuration | Opaque jsonb; forbid methodology columns |
| Duplicate methodology catalogue | OD-F2-6; `radionics_specialties` only |
| Direct browser writes | SELECT-only; RPC-only |
| Collapsing UI into persistence | No UI/services in B6 |
| Treating readiness as implementation auth | Separate local + Dev apply (OD-F2-5) |

---

## 13. Owner decisions (APPROVED)

| ID | Decision | Proposed default | Status |
|----|----------|------------------|--------|
| **OD-B6-1** | Approve this readiness as design baseline for B6 (templates + projections + approved renditions)? | **Yes** — becomes baseline when Owner approves | **APPROVED** |
| **OD-B6-2** | Confirm B6 excludes archive mutation, UI, PDF generation, therapeutic columns, `platform_methodologies`? | **Yes** | **APPROVED** |
| **OD-B6-3** | Write posture? | **RPC-only**; authenticated **SELECT only** on B6 tables | **APPROVED** |
| **OD-B6-4** | Create mandatory `platform_report_templates` in B6 (OD-F2-3)? | **Yes** — catalogue persistence only | **APPROVED** |
| **OD-B6-5** | Official templates (`therapist_id` NULL) readable by all authenticated therapists? | **Yes** (cert gating optional later) | **APPROVED** |
| **OD-B6-6** | Therapist-owned template upsert RPC in B6? | **Yes** — narrow; opaque configuration | **APPROVED** |
| **OD-B6-7** | Projection requires sealed archive? | **Yes** — fail closed if none | **APPROVED** |
| **OD-B6-8** | Multiple projections per archive? | **Yes** | **APPROVED** |
| **OD-B6-9** | Store `projected_snapshot` on projection rows? | **Optional** — default **compute-on-approve** from archive + edits; may cache draft snapshot if needed | **APPROVED** |
| **OD-B6-10** | Projection statuses persisted in B6? | **`draft` \| `in_review`** (+ mark `approved` on approve); defer `shared` | **APPROVED** |
| **OD-B6-11** | Private notes auto-include in projection? | **No** | **APPROVED** |
| **OD-B6-12** | Full transcript auto-include? | **No** | **APPROVED** |
| **OD-B6-13** | Approve creates immutable rendition + `content_sha256`? | **Yes** | **APPROVED** |
| **OD-B6-14** | Rendition versioning scope? | **Monotonic integer per session** (or per projection — prefer per session) | **APPROVED** |
| **OD-B6-15** | PDF generation in B6? | **No** — boundary only | **APPROVED** |
| **OD-B6-16** | Sharing / `shared` status RPCs in B6? | **No** — defer | **APPROVED** |
| **OD-B6-17** | Methodology identity on templates? | Optional `specialty_id` → `radionics_specialties` only | **APPROVED** |
| **OD-B6-18** | Separate authorizations for (a) local B6 implementation and (b) Development apply | **Required** (OD-F2-5); **no** Production in this readiness | **APPROVED** | 

**No Product document contradiction requiring Product edits was found** for B6 scope: PD-009, Product 03 §10 projection sequence, and OD-F2-3 mandatory templates catalogue match this proposal. Owner choices are resolved in OD-B6-1…18; implementation must follow the approved defaults unless a later Owner decision supersedes them.

---

## 14. Implementation batches — NOT AUTHORIZED

Suggested physical order (**still not authorized**):

1. Additive migration: `platform_report_templates`, `platform_report_projections`, `platform_approved_report_renditions`, constraints, indexes, RLS, SELECT-only grants, rendition immutability trigger; additive sealed unique targets if required for same-session FKs.  
2. SECURITY DEFINER RPCs: create projection, update draft, set status, approve rendition, optional template upsert/status — B2-style idempotency.  
3. Immediate RPC grants hardening.  
4. Seed strategy for official templates (**Owner-directed**; may be empty catalogue initially).  
5. Local static B6 validator + implementation report (forbid archive mutation/PDF/`platform_methodologies`/therapeutic columns).  
6. Separate Owner auth for Development apply.  
7. No UI/services/PDF/sharing until separately authorized.

**Batches clearly marked:**

| Step | Status |
|------|--------|
| B6 readiness (this document) | **APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION** |
| B6 local SQL + validator + report | **NOT AUTHORIZED** |
| B6 Development apply | **NOT AUTHORIZED** |
| PDF / sharing / Live Report UI | **NOT AUTHORIZED** |
| B7+ | **NOT AUTHORIZED** |
| Production apply | **NOT AUTHORIZED** |

---

## 15. Confirmation — nothing implemented by this readiness task

This task creates **documentation only** (this readiness file).

- **No** SQL objects created or altered  
- **No** migrations added or modified  
- **No** code changes  
- **No** Supabase connections or writes  
- **No** UI, services, tests, or methodology behaviour changes  
- **No** Product / AGENTS / F2 v1.2 / F0–F1 / B1–B5 edits  
- **No** B6 implementation started  
- **No** commit / push / deploy  

---

## 16. Stop line

**Stop line: B6 READINESS APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION**

---

## 17. Deliverable confirmation

Only this documentation file was created:

`docs/Engine/Session/Platform_Session_F2_B6_Pre_Implementation_Readiness.md`

No SQL, code, migrations, Supabase, UI, services, tests, commit, push or deploy.
