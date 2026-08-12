# Platform Session F2 — Batch B7 Pre-Implementation Readiness

**Status:** `PROPOSED FOR OWNER REVIEW / NOT AUTHORIZED FOR IMPLEMENTATION`
**Date:** 2026-08-12
**Scope:** Documentation / readiness only — Batch **B7** (final F2 persistence **integration / closure** after B1–B6)
**Depends on:** F2 design baseline v1.2; B1–B6 local artifacts prepared (apply/verification status per batch reports)
**Does not authorize:** SQL, migrations, Supabase writes, UI, services, B8+/F3 wiring, Production/apply, `platform_methodologies`, commit, push, or deploy

---

## 1. Executive verdict

B7 is the **final F2 persistence integration and readiness-closure** unit after domain batches **B1–B6**. It should **not** introduce new domain tables or therapeutic behaviour. It should instead:

1. **Align contracts** across B1–B6 (naming, ownership, RPC-only writes, SELECT-only grants, same-session FKs, immutability boundaries).
2. Publish a **final validation / acceptance matrix** for declaring F2 persistence “locally complete” and “Dev-applied complete” under separate authorizations.
3. Plan **generated Supabase/TypeScript types** (if Owner requires compile-time `Database` coverage) without implementing F3 repositories.
4. Clarify **repository/service integration boundaries** (F3 / Experience own wiring; B7 only defines the seam).
5. Re-review **read/write posture** and **migration dependency order**.
6. Optionally propose **minor hardening only** (indexes, grant consistency, metadata comments, types generation script) — **no** new domain entities unless Owner explicitly approves a narrow hardening item.

**Product / engine framing:**

- Archive ≠ template ≠ projection ≠ approved rendition (PD-009; B5/B6).
- Session lifecycle ⊥ report lifecycle (F1).
- Catalogue authority remains **`radionics_specialties`**. **No** `platform_methodologies`.
- F2 ends at persistence primitives + validators + types plan; **B8 is out of F2** (F3 repository/mock parity).

**Write posture for any later B7 local work (proposed):** documentation + optional additive hardening migration + meta-validator + types generation plan/script — still **RPC-only** domain writes; **no** UI/services; **no** Production.

This document is a **proposed design baseline** for Owner review. It does **not** authorize local implementation, Development apply, SQL, migrations, Supabase writes, UI, services, or tests beyond what Owner later authorizes.

**Label:** `PROPOSED FOR OWNER REVIEW / NOT AUTHORIZED FOR IMPLEMENTATION`

---

## 2. Inspected files / authorities

| Authority | Role for B7 |
|-----------|-------------|
| `docs/Engine/Session/Platform_Session_F2_Supabase_Persistence_Pre_Implementation_Readiness.md` | F2 v1.2 batch map: B7 = indexes, grants, generated types |
| B1–B6 readiness + local implementation reports | Contract and artifact inventory |
| `supabase/migrations/20260807*…20260811*_platform_session_*.sql` | Migration dependency chain |
| `package.json` `validate:platform-session-f2-b*` | Static validators B1–B6 |
| `src/platform/session/**` | F0/F1 domain contracts (no Supabase imports) |
| `docs/Product/02–04` + PD-009 | Archive/report separation; platform before methodology |
| `docs/AGENTS.md` | Methodology-neutral platform session domain |

**Not modified:** Product, AGENTS, F2 v1.2, B1–B6 migrations/reports, UI, services — this task creates **only** this readiness file.

---

## 3. Scope and exclusions

### 3.1 In scope (proposed)

1. **Contract alignment checklist** across B1–B6 (tables, RPCs, immutability, grants).
2. **Final validation matrix** and acceptance gates (static + post-apply read-only + F0/F1).
3. **Generated types plan** (`supabase gen types` or equivalent → `Database` types location/ownership).
4. **Repository/service boundaries** — what F3 may consume; what B7 must not implement.
5. **Read/write posture review** — SELECT-only tables; SECURITY DEFINER RPCs; no anon EXECUTE.
6. **Migration dependency/order review** — timestamp order B1→B6; additive FK targets.
7. **Optional minor hardening catalogue** (indexes/grants/comments/types script) — Owner-gated.
8. **Owner decisions OD-B7-1…N** and separate local / Dev-apply authorization requirements.
9. **F2 closure criteria** — when F2 persistence may be labeled complete (local vs Dev-applied).

### 3.2 Explicitly out of scope

| Deferred / forbidden | Batch / rule |
|----------------------|--------------|
| New domain tables (clients, sessions, notes, archives, reports, …) | **B1–B6 already** — B7 must not reopen |
| UI / Live Report / experience flows | **Experience / F3** |
| Services / repositories Supabase wiring | **B8 / F3** |
| PDF / sharing / print pipelines | **Out of F2** (B6 boundary) |
| Archive re-seal / unseal / envelope patch | **Forbidden** |
| Therapeutic methodology behaviour / columns | **Forbidden** |
| `platform_methodologies` | **Never** (OD-F2-6) |
| Supabase apply / Production | **Separate OD-F2-5 auth** |
| Commit / push / deploy | **Not authorized here** |
| B8+ | **Out of F2** |

---

## 4. B1–B6 contract alignment (inventory)

### 4.1 Domain table map (persistence surface)

| Batch | Tables (domain) | Mutability |
|-------|-----------------|------------|
| **B1** | `platform_clients`, `platform_sessions`, `platform_command_idempotency` | Clients mutable; sessions via lifecycle RPCs; idempotency RPC-owned |
| **B2** | `platform_client_testimony_snapshots`, `platform_session_plan_items` | Testimony immutable; plan mutable via RPCs |
| **B3** | `platform_methodology_executions` (+ `sessions.active_execution_id`) | Executions via activate/status RPCs; opaque `state_payload` |
| **B4A** | `platform_session_notes`, `platform_timeline_events` | Notes mutable; timeline append-only |
| **B4B** | `platform_transcript_captures`, `platform_transcript_segments` | Capture lifecycle + segment inclusion; no audio |
| **B4C** | `platform_report_contributions` | Create-once `structured_value`; editorial inclusion/display/refs |
| **B5** | `platform_session_archive_assemblies`, `platform_sealed_session_archives` | Assembly WIP; sealed **immutable** |
| **B6** | `platform_report_templates`, `platform_report_projections`, `platform_approved_report_renditions` | Templates catalogue; projections mutable until approve; renditions **immutable** |

### 4.2 Cross-cutting invariants (must remain true)

1. **Ownership:** `therapist_id` + `UNIQUE (id, therapist_id)` + composite session FKs.
2. **Writes:** authenticated **SELECT only** on domain tables; mutations via **narrow SECURITY DEFINER RPCs**.
3. **Idempotency:** B2 pending-claim helpers for mutating RPCs.
4. **Same-session integrity:** optional artifact FKs include `session_id` where cross-link risk exists.
5. **Catalogue:** `specialty_id` → `radionics_specialties` only; **no** `platform_methodologies`.
6. **Opaque jsonb** for methodology state, contributions, template config, envelopes, sealed_content — no therapeutic typed columns.
7. **PD-009:** sealed archive `report_template_authority` always NULL; templates never rewrite archives; approved renditions never rewrite archives.
8. **Independence:** session lifecycle ≠ report lifecycle; seal ≠ auto-report; complete ≠ approve.
9. **Privacy defaults:** private notes / full transcript never auto-project; transcript private work material.
10. **Immutability triggers:** sealed archives + approved renditions reject UPDATE/DELETE.

### 4.3 Alignment gaps B7 should verify (not invent domain)

| Gap class | Example | B7 action |
|-----------|---------|-----------|
| Grant consistency | Any residual dangerous grants | Harden via additive grants migration if found |
| Index coverage | Hot paths missing `(session_id, therapist_id)` | Optional additive indexes only |
| Types drift | No generated `Database` types for `platform_*` | Types generation plan (§6) |
| Validator coverage | No single “B7 closure” meta-validator | Propose `validate:platform-session-f2-b7` orchestrating B1–B6 + F0/F1 |
| Docs drift | Readiness vs implemented RPC names | Align in B7 report when authorized |
| Apply status | Local ready ≠ Dev applied | Track per-batch apply verification in closure matrix |

---

## 5. Migration dependency / order review

### 5.1 Authorized local migration chain (timestamps)

```text
20260807120000  B1 core
20260807124000  B1 grants hardening
20260809170000  B2 testimony/plan/RPCs
20260809173000  B2 RPC grants hardening
20260809180000  B3 executions + active_execution_id
20260810120000  B4A notes/timeline
20260810140000  B4B transcript
20260810160000  B4C contributions (+ additive parent uniques)
20260811120000  B5 archive/seal
20260811140000  B6 templates/projections/renditions (+ additive sealed unique)
```

**Rule:** later batches may add **additive** unique/FK targets on earlier tables; they must **not** edit earlier migration file bodies.

### 5.2 Apply order (when authorized)

1. Apply strictly in timestamp order on Development.
2. Fail closed if any prerequisite batch missing.
3. Post-apply: run per-batch verification packs + B7 closure matrix.
4. Production: **never** from B7 readiness; requires separate Production authorization after Dev acceptance.

### 5.3 Optional B7 additive migration (only if OD-B7 approves)

Allowed contents (examples):

- Missing indexes for known hot paths
- Grant revoke/re-grant consistency
- Comments / schema_version documentation
- **Not:** new domain tables, new therapeutic columns, archive mutation RPCs, PDF/sharing tables

---

## 6. Generated Supabase / types plan

### 6.1 Current state

- F0/F1 domain types live under `src/platform/session/**` (no Supabase imports).
- Generated `Database` types for `platform_*` F2 tables are **not** assumed present in app `src` (B7 must confirm at implementation time).

### 6.2 Proposed plan (Owner-gated)

| Step | Proposal |
|------|----------|
| Tooling | `supabase gen types typescript --project-id <Dev>` **or** local DB gen after authorized apply |
| Output path | e.g. `src/types/supabase.generated.ts` or `src/lib/database.types.ts` (match repo convention when implementing) |
| Scope | Include all `public.platform_*` F2 tables + RPC arg/return types if generator supports |
| Ownership | Types are **compile aids**; domain logic remains F1 contracts |
| CI | Optional: fail if generated types missing after Dev apply (later) |
| B7 local auth | May include a **types generation script + docs**; must **not** wire services |

**OD-B7** must choose: generate types in B7 local vs defer entirely to B8/F3.

---

## 7. Repository / service integration boundaries

```text
F1 contracts (src/platform/session)     ← already present; pure domain
        │
F2 B1–B6 SQL + RPCs                    ← persistence primitives
        │
B7 (this batch)                        ← closure: validators, grants/indexes optional, types plan
        │
B8 / F3                                ← repositories implementing interfaces; services; UI
```

| Layer | B7 may | B7 must not |
|-------|--------|-------------|
| Domain contracts | Reference / checklist against F1 | Change product behaviour |
| SQL | Optional hardening only | New domain model |
| Validators | Meta-validator orchestrating B1–B6 + F0/F1 | Live DB mutation tests without auth |
| Types | Plan + optionally generate | Import into services/UI |
| Repositories | Document interface mapping table | Implement Supabase repositories |
| Services / UI | Document seams | Edit `src/pages` / `src/services` |

**Mapping hint for later F3 (documentation only):**

| F1 / repository concept | Persistence |
|-------------------------|-------------|
| Clients / sessions | B1 |
| Testimony / plan | B2 |
| Executions | B3 |
| Notes / timeline | B4A |
| Transcript | B4B |
| Contributions | B4C |
| Archive assembly / sealed | B5 |
| Templates / projections / renditions | B6 |

---

## 8. Read / write posture review

### 8.1 Target posture (unchanged)

| Object class | Authenticated | Anon |
|--------------|---------------|------|
| Domain tables | `SELECT` only (clients historically broader — confirm B1 matrix) | none |
| Mutating RPCs | `EXECUTE` only after revoke-all hardening | none |
| Sealed archives / approved renditions | `SELECT` own; no UPDATE/DELETE | none |
| Official report templates | `SELECT` (therapist_id NULL) | none |

### 8.2 B7 review checklist

1. No `GRANT INSERT/UPDATE/DELETE` on B2–B6 domain tables to authenticated.
2. No `GRANT EXECUTE` to `anon` / `public` on platform RPCs.
3. No `TRUNCATE` / `TRIGGER` / `REFERENCES` to authenticated.
4. Immutability triggers present for sealed archives + approved renditions.
5. No archive mutation / PDF / share RPCs in F2 surface.
6. B1 clients/sessions grant exceptions remain intentional and documented.

---

## 9. Final validation matrix and acceptance gates

### 9.1 Static (local — no Supabase)

| Gate | Command / check | Pass criteria |
|------|-----------------|---------------|
| B1…B6 static validators | `npm run validate:platform-session-f2-b{1,2,3,4a,4b,4c,5,6}` | All PASSED |
| F0/F1 | `npm run validate:platform-session-f0-f1` | PASSED |
| Typecheck / lint / build | `npm run typecheck` / `lint` / `build` | PASSED |
| Workflow adapter | `node scripts/validate-v30d2-workflow-adapter.mjs` | `ok: true` |
| Diff hygiene | `git diff --check` on F2 paths | PASSED |
| **Proposed B7 meta-validator** | `validate:platform-session-f2-b7` | Orchestrates above + forbids B8/UI/SQL domain creep in B7 artifacts |

### 9.2 Post-apply Dev (read-only; separate apply auth)

| Gate | Pass criteria |
|------|---------------|
| Migration order applied | All B1–B6 (and optional B7 hardening) present |
| Tables exist + RLS enabled | Per-batch verification packs |
| RPC EXECUTE grants | authenticated only for public RPCs |
| Dangerous table grants | 0 rows |
| Immutability | Sealed archive / rendition UPDATE denied |
| No `platform_methodologies` | `to_regclass` null |
| Contract spot-checks | One sealed archive per session; projection FK to archive; contribution create-once surface intact |

### 9.3 Acceptance labels (proposed)

| Label | Meaning |
|-------|---------|
| `F2 LOCAL PERSISTENCE COMPLETE` | B1–B6 (+ optional B7 hardening/types) local artifacts + static suite green; **not** applied |
| `F2 DEV PERSISTENCE APPLIED & VERIFIED` | Dev apply + read-only packs pass for B1–B6 (+ B7 if any) |
| `F2 READY FOR F3 REPOSITORY WORK` | Prior label + Owner acceptance; B8 still separately authorized |

---

## 10. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| B7 becomes a dumping ground for new domain | Explicit “no new domain tables” rule; OD list |
| Premature service/UI wiring | Boundary §7; forbid src service/page edits |
| Types generation treated as Production apply | Types from Dev/local only; separate Production auth |
| Declaring F2 complete while Dev apply incomplete | Dual labels: local vs Dev-verified |
| Reopening B1–B5 files | Additive-only; validators assert untouched file hashes optional |
| `platform_methodologies` sneak-in | Static forbid across B7 meta-validator |
| PDF/sharing creep | B6 boundary; B7 forbid |

---

## 11. Owner decisions (PROPOSED defaults — awaiting Owner)

| ID | Decision | Proposed default | Status |
|----|----------|------------------|--------|
| **OD-B7-1** | Approve this readiness as design baseline for B7 (F2 closure / integration only)? | **Yes** when Owner approves | **PROPOSED** |
| **OD-B7-2** | Confirm B7 excludes new domain tables, UI, services, PDF/sharing, archive mutation, `platform_methodologies`, B8+? | **Yes** | **PROPOSED** |
| **OD-B7-3** | B7 local deliverables? | Meta-validator + local report + optional hardening migration + types plan/script | **PROPOSED** |
| **OD-B7-4** | Generate TypeScript `Database` types in B7? | **Yes — plan + generate after Dev schema available**; commit path Owner-confirmable | **PROPOSED** |
| **OD-B7-5** | Allow additive indexes/grants hardening migration in B7? | **Yes — only if gap found**; otherwise docs/validator only | **PROPOSED** |
| **OD-B7-6** | Implement F3 repositories in B7? | **No** — B8/F3 | **PROPOSED** |
| **OD-B7-7** | Edit Product / AGENTS as part of B7? | **No** unless contradiction found | **PROPOSED** |
| **OD-B7-8** | F2 closure requires all B1–B6 Dev-applied & verified? | **Yes** for `F2 DEV PERSISTENCE APPLIED & VERIFIED` | **PROPOSED** |
| **OD-B7-9** | Production apply in B7? | **No** | **PROPOSED** |
| **OD-B7-10** | Separate authorizations for (a) B7 local and (b) any Dev apply of B7 hardening | **Required** (OD-F2-5) | **PROPOSED** |

---

## 12. Implementation batches — NOT AUTHORIZED

Suggested physical order (**still not authorized**):

1. Inventory B1–B6 artifacts vs this alignment checklist; note apply/verification status.
2. Create `scripts/validate-platform-session-f2-b7.mjs` meta-validator + `package.json` script.
3. Optionally additive hardening migration (indexes/grants only) if OD-B7-5 and gaps exist.
4. Types generation plan; generate only when schema source authorized.
5. Local B7 implementation report with closure labels.
6. Separate Owner auth for any Development apply of B7 hardening.
7. Hand-off to B8/F3 only after Owner acceptance — **not** part of B7.

**Batches clearly marked:**

| Step | Status |
|------|--------|
| B7 readiness (this document) | **PROPOSED FOR OWNER REVIEW — NOT AUTHORIZED FOR IMPLEMENTATION** |
| B7 local meta-validator / report / optional hardening / types | **NOT AUTHORIZED** |
| B7 Development apply | **NOT AUTHORIZED** |
| B8 / F3 repositories / UI / services | **NOT AUTHORIZED** |
| Production apply | **NOT AUTHORIZED** |

---

## 13. Confirmation — nothing implemented by this readiness task

This task creates **documentation only** (this readiness file).

- **No** SQL objects created or altered
- **No** migrations added or modified
- **No** code changes
- **No** Supabase connections or writes
- **No** UI, services, tests, or methodology behaviour changes
- **No** Product / AGENTS / F2 v1.2 / B1–B6 edits
- **No** B7 implementation started
- **No** commit / push / deploy

---

## 14. Stop line

**B7 READINESS PROPOSED — NOT AUTHORIZED FOR IMPLEMENTATION**

---

## 15. Deliverable confirmation

Only this documentation file was created:

`docs/Engine/Session/Platform_Session_F2_B7_Pre_Implementation_Readiness.md`

No SQL, code, migrations, Supabase, UI, services, tests, commit, push or deploy.
