# Platform Therapist Setup — Pre-Implementation Readiness

**Status:** `APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`  
**Date:** 2026-08-14  
**Owner approval date:** 2026-08-14  
**Implementation:** remains **not authorized**  
**Scope:** Documentation / readiness only — **Therapist setup / professional profile / certification onboarding** layer  
**Depends on:** Existing Phase-1 specialties & certifications schema; Product session experience; F2 Platform Session persistence (B1–B7) as **consumer** of eligibility  
**Does not authorize:** SQL, migrations, Supabase writes, UI, services, methodology configuration, therapist-owned/private methodologies, MAP/35/49 workflows, session/report persistence changes, commit, push, or deploy

---

## 1. Executive verdict

RADIONICS must treat **therapist setup** as a distinct platform layer that makes methodologies **eligible for use**, without confusing:

| Layer | Authority | Role |
|-------|-----------|------|
| **Therapist profile / professional data** | Identity + professional facts | Who the therapist is (profile); not the catalog |
| **Platform methodology catalog** | `radionics_specialties` (+ related knowledge assets) | What methodologies the platform offers |
| **Therapist certification status** | `therapist_specialty_certifications` (+ documents) | Whether this therapist may use a given specialty |
| **Therapist-specific methodology configuration** | Future (out of this readiness) | How the therapist personalizes an approved methodology |
| **Session-time methodology use** | F2 `platform_*` session graph | Actual use inside a session (plan / execution) |

**Core rule:** Specialty/certification is **eligibility context**. It is **not** the methodology itself (Product 03). Catalogue identity remains **`radionics_specialties`**. **No** `platform_methodologies`.

### 1.1 Owner decision — two supported flows (this phase)

Therapist Setup supports **exactly two** onboarding flows in this phase:

1. **Platform-catalog methodology selection** — therapist selects an existing `radionics_specialties` item (`status = active`) and submits certification evidence (`therapist_specialty_certifications` + documents).  
2. **New catalog request** — therapist requests a methodology/specialty not yet present via `radionics_specialty_requests`. It becomes usable **only if**:
   - the request is **approved into the platform catalog** (`radionics_specialties`), **and then**
   - the therapist **certifies** against that catalog specialty as required (flow 1).

**Request approval ≠ certification.** Catalog admission never bypasses certification governance.

**Therapist-owned / private methodologies** are **explicitly deferred**. They must **not** be implemented in this phase and must **not** bypass catalogue / certification governance (no private catalog, no session use without a platform specialty + approved cert).

This readiness defines the **prerequisite setup layer** so that:

1. Therapists can select platform-provided methodologies from the catalog (flow 1).  
2. Therapists can request missing catalog entries (flow 2), then certify after catalog approval.  
3. Therapists can submit certification proof per specialty.  
4. Admins can review, approve, reject (with reasons), and handle expiry / resubmission.  
5. Only **approved** (and non-expired) certifications unlock methodology use in resources, workflows, and **Platform Session** plan/execution gates.  
6. Multiple approved methodologies are first-class; related/combinable use is an eligibility + product rule, not a catalog merge.

Existing tables/contracts should be **reused and clarified**, not replaced:

- `radionics_specialties`  
- `therapist_specialty_certifications`  
- `therapist_specialty_documents`  
- `radionics_specialty_requests` (**flow 2** — required path for missing catalog entries; not optional private methodologies)  
- Helper `has_approved_specialty_certification(specialty_id)`  
- Storage bucket `radionics-certifications`

**Methodology configuration** (therapist personalization of an approved methodology) is **explicitly out of scope** here — only the prerequisite unlock layer is defined.

Document status is **APPROVED** (OD-TS-1…15). Implementation remains **not authorized** until separate authorizations.

**Label:** `APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`

---

## 2. Inspected files / authorities

| Authority | Role |
|-----------|------|
| `supabase/migrations/20260531120000_radionics_specialties_phase1.sql` | Catalog + cert + documents + requests schema |
| `supabase/migrations/20260531120001_radionics_certifications_storage.sql` | Storage bucket/policies |
| `supabase/migrations/20260531130000_certifications_resubmit_rls.sql` | Resubmit RLS adjustments |
| `docs/Infrastructure/Supabase/RADIONICS_SUPABASE_SCHEMA_PHASE1.md` | Schema/RLS/storage contract |
| `docs/Infrastructure/Supabase/RADIONICS_SUPABASE_PHASE2A_SERVICES.md` | Submit/resubmit/admin review flows |
| `src/types/index.ts` | `Specialty`, `Certification`, `CertDocument`, `SpecialtyRequest` |
| `src/lib/certificationRules.ts` | Submit vs resubmit status gates |
| `docs/Product/03_Platform_Session_Experience.md` | Catalog vs certification presentation |
| `docs/Product/04_Platform_Session_Implementation_Readiness.md` | Cert as reusable eligibility source |
| F2 Session readiness/reports (B2/B3) | `specialty_id` + `has_approved_specialty_certification` at plan/execution time |
| `src/platform/session/repositories.ts` | Future F3 seam; no cert tables here |

**Not modified:** Product 00–05, MAP docs, AGENTS, F2 migrations/reports, UI, services — this task creates **only** this readiness file.

---

## 3. Scope and exclusions

### 3.1 In scope (proposed)

1. Therapist **professional / certification onboarding** narrative and state machine.  
2. **Flow 1:** Selection of **platform-provided** methodologies from `radionics_specialties` (`status = active`) + certification submission.  
3. **Flow 2:** New catalog request via `radionics_specialty_requests`, then certification only after the specialty exists in the platform catalog.  
4. Certification **submission** per `(therapist_id, specialty_id)`.  
5. Document upload/proof requirements (mime, size, path, linkage).  
6. Review states, rejection reasons (`admin_notes`), expiry, resubmission.  
7. When a methodology becomes **available** to the therapist.  
8. Multiple approved methodologies; related/combinable eligibility rules (product-level).  
9. Clear layer distinctions (profile / catalog / cert / config / session use).  
10. Boundaries with F2 session persistence and future F3/session services.  
11. What the **session wizard** may assume from approved certifications.  
12. Owner decisions **OD-TS-1…15** (**APPROVED**; implementation still separately authorized).

### 3.2 Explicitly out of scope

| Deferred / forbidden | Rule |
|----------------------|------|
| UI implementation (Certifications page redesign, wizard UX polish) | **Not authorized** |
| Services implementation / Phase-2A code changes | **Not authorized** |
| SQL / migrations / Supabase apply | **Not authorized** |
| Therapist-specific **methodology configuration** | **Future layer** |
| **Therapist-owned / private methodologies** | **Deferred** — must not ship in this phase; must not bypass catalog/cert governance |
| MAP / Mesa 35 / Mesa 49 workflow behaviour | **Methodology engine / Experience** |
| Session or report persistence changes (F2 B1–B7) | **Preserve** |
| Creating `platform_methodologies` | **Never** (OD-F2-6) |
| Auth/HUB identity product redesign | **Auth Core / HUB plans** |
| Commit / push / deploy | **Not authorized** |

---

## 4. Layer model (canonical distinctions)

```text
auth.users / HUB identity
        │
        ▼
[A] Therapist profile / professional data     ← identity + professional facts (minimal in RADIONICS today)
        │
        ├── Flow 1 ──────────────────────────────────────────────┐
        │                                                         │
        ▼                                                         │
[B] radionics_specialties                      ← platform catalog     │
        │                                                         │
        │  Flow 2: if missing from catalog                         │
        ▼                                                         │
    radionics_specialty_requests               ← request new entry │
        │  admin approves → catalog row in [B]                    │
        │  then therapist continues via Flow 1 ─────────────────────┘
        ▼
[C] therapist_specialty_certifications         ← eligibility status per specialty
        │
        ├── therapist_specialty_documents      ← proof artifacts (storage)
        │
        ▼
[D] Therapist methodology configuration        ← FUTURE (defaults, personal templates, prefs) — NOT THIS DOC
        │
        ▼
[E] Session-time use (F2)                      ← plan items / executions require approved cert at TX time

FORBIDDEN IN THIS PHASE:
  therapist-owned / private methodologies (no private catalog; no cert bypass)
```

**Rules:**

1. **[B] ≠ [C]** — Catalog membership does not imply therapist eligibility.  
2. **[C] ≠ [D]** — Approval unlocks use; it does not create personal configuration.  
3. **[C] ≠ [E]** — Approval is necessary for session gates; session rows do not store “certification as methodology.”  
4. **[A]** must not be overloaded into certification rows beyond professional proof fields already on `therapist_specialty_certifications`.  
5. **Flow 2 → Flow 1 only** — `radionics_specialty_requests` admission feeds the platform catalog; usability still requires certification on the resulting specialty.  
6. **No private methodology path** — therapists cannot create usable methodologies that skip `radionics_specialties` + certification.

---

## 5. Existing data contracts (reuse)

### 5.1 `radionics_specialties` — platform catalog

- Platform-provided methodologies/specialties (`name`, `slug`, `category`, `status` active/inactive, etc.).  
- Therapists **SELECT** active rows only.  
- Admin maintains catalog.  
- Seed includes MAP, Mesa 35, Mesa 49, etc. — **catalog entries**, not session workflows.

### 5.2 `radionics_specialty_requests` — Flow 2 (new catalog request)

- Therapist proposes a specialty/methodology **not yet** in the platform catalog.  
- Status: `pending_review` \| `approved` \| `rejected`.  
- **Owner rule:** approval of a **request** admits (or activates) a row in `radionics_specialties` only.  
- It is **not** therapist certification and **not** a private methodology.  
- After catalog approval, the therapist must complete **Flow 1** (certify against that specialty) before session/resource use.  
- Rejected requests do not create usable session methodologies.

### 5.3 `therapist_specialty_certifications` — eligibility

- **UNIQUE** `(therapist_id, specialty_id)` — one row per pair.  
- Status: `not_certified` \| `pending` \| `approved` \| `rejected` \| `expired`.  
- Professional proof fields: `years_of_experience` (required when not `not_certified`), experience description, training institution/date, certificate number, certified_by, notes.  
- Review fields: `admin_notes`, `reviewed_by`, `reviewed_at`, `submitted_at`, `expires_at`.  
- Helper: `has_approved_specialty_certification(specialty_id)` → `status = 'approved'` for `auth.uid()` (expiry enforcement: see OD-TS).

### 5.4 `therapist_specialty_documents` — proof uploads

- FK to certification; `storage_path`, file metadata, mime (`pdf` / `jpeg` / `png`), size.  
- Bucket `radionics-certifications`, private, max ~10 MB.  
- Canonical path: `radionics/certifications/{therapist_id}/{certification_id}/{filename}`.  
- Therapist may mutate documents only while certification is **not** `approved` (resubmit policies refine rejected/expired).

---

## 6. Onboarding / certification lifecycle

### 6.1 Happy paths (two flows)

**Flow 1 — existing catalog specialty**

```text
Browse active specialties (radionics_specialties)
  → select specialty
  → create/update certification row (not_certified → pending)
  → upload required documents
  → submit for review (pending)
  → admin approve → approved (+ optional expires_at)
  → methodology available to therapist
```

**Flow 2 — methodology not yet in catalog**

```text
Propose via radionics_specialty_requests (pending_review)
  → admin approve request → specialty enters platform catalog (radionics_specialties)
  → therapist starts Flow 1 against that specialty
  → certify + documents → pending → approved
  → methodology available to therapist

If request rejected → no catalog entry for use; no certification path against a non-catalog specialty
```

**Explicitly not a third flow:** therapist-owned/private methodologies.

### 6.2 Status meanings

| Status | Therapist meaning | Admin meaning | Session/resource gate |
|--------|-------------------|---------------|------------------------|
| `not_certified` | Not submitted | No review | **Blocked** |
| `pending` | Awaiting review | In queue | **Blocked** |
| `approved` | May use specialty | Active grant | **Allowed** (if not past expiry — OD-TS) |
| `rejected` | Must correct & resubmit | Rejection recorded in `admin_notes` | **Blocked** |
| `expired` | Must renew/resubmit | Prior approval lapsed | **Blocked** |

### 6.3 Submit vs resubmit (aligned with `certificationRules`)

| Current status | New initial submit | Resubmit / renew flow |
|----------------|--------------------|------------------------|
| missing / `not_certified` | **Allowed** | — |
| `pending` | **Forbidden** | — |
| `approved` | **Forbidden** (already active) | Renew only if product defines pre-expiry renew (OD-TS) |
| `rejected` | **Forbidden** as “new” | **Resubmit** required |
| `expired` | **Forbidden** as “new” | **Resubmit** / renew required |

Resubmit typically: clear/replace documents as policy allows → set `pending` → clear prior review fields → new `submitted_at`.

### 6.4 Rejection reasons

- Store therapist-visible reason in **`admin_notes`** (existing column).  
- Structured reason codes optional later (OD-TS); do not invent a new table in this readiness.  
- Rejection must not delete catalog or therapist identity; documents may be replaced on resubmit.

### 6.5 Expiry

- `expires_at` optional on approval.  
- When past expiry: status should become / be treated as `expired` (job vs read-time check — OD-TS).  
- Historical F2 sessions that used the specialty remain readable; **new** plan/execution creates remain gated (F2 B3 pattern).

### 6.6 Document requirements (proposed product minimum)

| Requirement | Proposed default |
|-------------|------------------|
| At least one proof document before submit to `pending` | **Yes** (OD-TS) |
| Allowed types | PDF, JPEG, PNG |
| Max size | 10 MB per file (bucket) |
| Path | Canonical certifications path only |
| Approved cert documents | Immutable for therapist (no delete/replace until rejected/expired/renew flow) |

---

## 7. When a methodology becomes available

A platform methodology/specialty `S` is **available** to therapist `T` when **all** hold:

1. `radionics_specialties.id = S` and `status = 'active'`.  
2. Certification row `(T, S)` exists with **`status = 'approved'`**.  
3. Expiry rule satisfied (`expires_at` null OR `expires_at > now()`, or status not `expired` — OD-TS).  
4. Any product feature flag / specialty `requiresCertification` semantics respected (if `requiresCertification = false`, OD-TS must confirm whether empty cert still required — **proposed default: still require explicit approval row for session gates that call `has_approved_specialty_certification`**).

**Unavailable** when pending, rejected, expired, not_certified, specialty inactive, or cert missing.

**Multiple approvals:** Therapist may hold many `(specialty_id)` approvals concurrently. UI/catalog lists all available specialties.

**Related / combinable methodologies:**

- Combinability is **not** encoded as a merge of specialties.  
- Session complementary execution (F2 B3) requires **separate** approved certification for the complementary specialty at invoke time.  
- “Related” groupings (e.g. radiônica family) are catalog metadata / UX affordances only unless Owner later adds an explicit relation table (out of scope unless OD-TS requests).

---

## 8. What the session wizard may assume

From Product/F2 and current wizard behaviour (`approved-specialties` query):

| Assumption | Allowed? |
|------------|----------|
| List only specialties available under §7 | **Yes** |
| Treat specialty card as methodology identity for plan seeding | **Yes** — via `specialty_id` + slug/name snapshots |
| Assume certification details (documents, years) are session facts | **No** |
| Assume methodology configuration exists because cert is approved | **No** |
| Start session without approved specialty when wizard requires one | **No** (empty state → certifications CTA) |
| Bypass F2 RPC cert gates because wizard already filtered | **No** — server must re-check at TX time |

Wizard is a **consumer** of eligibility, not the source of truth.

---

## 9. Boundaries with F2 and F3

### 9.1 F2 Platform Session persistence

| F2 concern | Relationship to therapist setup |
|------------|----------------------------------|
| `platform_session_plan_items.specialty_id` | Must reference catalog; create gated by approved cert |
| `platform_methodology_executions.specialty_id` | Same; activate/create re-check cert |
| Sealed archive / contributions | May snapshot specialty slug/name; do **not** embed cert documents |
| Report projection | Does not grant methodology eligibility |
| `platform_methodologies` | **Forbidden** |

F2 must **not** be altered by this readiness. Setup layer is upstream eligibility.

### 9.2 F3 / session services

| F3 concern | Boundary |
|------------|----------|
| Repositories for sessions | Read eligibility via cert helper / cert service; do not duplicate status in session tables |
| Certifications UI/services | Own surface (`/certifications`, admin review); not session workspace |
| Methodology configuration service | **Later**; blocked until OD for config layer |

---

## 10. Therapist profile data vs certification fields

**Today in RADIONICS persistence:**

- Identity primarily from **Auth/HUB** (`auth.users`), not a rich `therapist_profiles` table in Phase-1 specialties migration.  
- Professional proof for a specialty lives on **`therapist_specialty_certifications`** (years, training, certificate metadata).

**Proposed stance:**

1. Do **not** invent a full therapist CRM profile in this readiness.  
2. If Owner later requires global professional profile (license board, clinic address), add a dedicated profile artifact under a **separate** authorization — keep it distinct from per-specialty certification.  
3. Admin UI may display requester name/email from Auth Core for review; those are **not** RADIONICS catalog fields (`requesterName` / `requesterEmail` are UI-only today).

---

## 11. RLS / grants posture (existing — preserve)

| Actor | Certifications | Documents | Specialties | Requests |
|-------|----------------|-----------|-------------|----------|
| Therapist | SELECT own; INSERT/UPDATE own except breaking `approved` rules | CRUD linked to non-approved certs (per policy) | SELECT active | INSERT/SELECT own |
| Admin | SELECT all; UPDATE review fields | SELECT/moderation delete | Full catalog | Review UPDATE |

Therapists **cannot** self-approve. Session RPCs use **SECURITY DEFINER** helpers that re-check approval — browser cannot spoof eligibility by writing session tables directly (F2 posture).

---

## 12. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Treating specialty catalog as “my methodologies” without cert | UI + `has_approved_specialty_certification` |
| Confusing request approval with therapist certification | Explicit two-step Flow 2 → Flow 1 narrative |
| Treating specialty requests as private methodologies | OD-TS-15: requests only feed platform catalog |
| Therapist-owned/private methodologies in this phase | Explicitly deferred; forbid bypass of catalog/cert |
| Config layer sneaking into cert rows | Separate future config; cert = eligibility only |
| Session bypass of cert gates | F2 RPC re-check at TX time |
| Expired cert still usable | Expiry status / read-time check (OD-TS) |
| `platform_methodologies` duplication | Forbid; specialties only |
| Pulling MAP/35/49 into setup | Catalog seed ≠ workflow implementation |
| Document leakage | Private bucket; path scoped to therapist/cert |

---

## 13. Validation expectations (when later authorized)

1. No new `platform_methodologies` table.  
2. Preserve UNIQUE `(therapist_id, specialty_id)`.  
3. Status CHECK set unchanged unless OD extends deliberately.  
4. Submit/resubmit rules match `certificationRules` (+ server enforcement).  
5. Documents blocked for therapist mutation while `approved`.  
6. `has_approved_specialty_certification` aligns with wizard availability + F2 gates.  
7. Specialty request approval ≠ auto-certification (Flow 2 then Flow 1).  
8. No therapist-owned/private methodology tables or bypass paths.  
9. No session/report migrations in a therapist-setup batch unless separately authorized.  
10. Static/product tests: pending/rejected/expired cannot start plan/execution.  
11. Separate local + Dev apply authorizations if SQL changes are ever required.

---

## 14. Owner decisions

**Owner approval date:** 2026-08-14  
**Document status:** `APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION`  
**Implementation:** remains **not authorized** (separate authorizations required).

All **OD-TS-1…15** are **APPROVED**, with decided values preserved below.

| ID | Decision | Decided value | Status |
|----|----------|---------------|--------|
| **OD-TS-1** | Approve this readiness as design baseline for therapist setup / certification onboarding? | **Yes** | **APPROVED** |
| **OD-TS-2** | Catalogue authority remains `radionics_specialties` only (no `platform_methodologies`)? | **Yes** | **APPROVED** |
| **OD-TS-3** | Reuse existing cert/document/request tables as source of truth? | **Yes** — clarify/extend only if gap | **APPROVED** |
| **OD-TS-4** | Methodology configuration in this layer? | **No** — future separate readiness | **APPROVED** |
| **OD-TS-5** | Require ≥1 document before status may become `pending`? | **Yes** | **APPROVED** |
| **OD-TS-6** | Rejection reason field? | Use `admin_notes`; structured codes later optional | **APPROVED** |
| **OD-TS-7** | Expiry enforcement? | Treat past `expires_at` as not approved for gates; prefer status `expired` via job or read-time | **APPROVED** |
| **OD-TS-8** | Pre-expiry renewal while still `approved`? | **Defer** — resubmit from `expired` first | **APPROVED** |
| **OD-TS-9** | Specialty request approval auto-creates cert? | **No** — catalog only; therapist must certify (Flow 2 → Flow 1) | **APPROVED** |
| **OD-TS-10** | Session wizard lists only §7-available specialties? | **Yes** | **APPROVED** |
| **OD-TS-11** | Complementary session methodologies each need own approved cert? | **Yes** | **APPROVED** |
| **OD-TS-12** | If `requiresCertification = false` on specialty, skip cert for F2 gates? | **No** by default — keep helper-based gate unless Owner carves exceptions | **APPROVED** |
| **OD-TS-13** | Global therapist professional profile table in this initiative? | **No** — Auth/HUB + per-specialty cert fields | **APPROVED** |
| **OD-TS-14** | UI/services/SQL authorized by this document? | **No** — separate authorizations | **APPROVED** |
| **OD-TS-15** | Supported flows this phase; defer therapist-owned/private methodologies? | **Two flows only:** (1) select existing `radionics_specialties` + certify; (2) `radionics_specialty_requests` → catalog approval → then certify. **Private/owned methodologies deferred** — no bypass of catalog/cert governance | **APPROVED** |

---

## 15. Implementation posture — NOT AUTHORIZED

Suggested later order (**not authorized now**):

1. OD-TS-1…15 approved (2026-08-14) — readiness baseline locked; implementation still blocked.  
2. Gap analysis: schema vs this baseline (documents-required-on-submit, expiry job, etc.).  
3. If SQL gaps: separate local migration auth → Dev apply auth.  
4. Services/UI alignment authorizations (Experience) — Flow 1 + Flow 2 only.  
5. Methodology **configuration** readiness (separate doc).  
6. Therapist-owned/private methodologies — **only** under a future readiness + auth.  
7. F3 session services consume eligibility only.

| Step | Status |
|------|--------|
| Therapist setup readiness (this document) | **APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION** |
| Schema gap SQL | **NOT AUTHORIZED** |
| UI / services | **NOT AUTHORIZED** |
| Methodology configuration | **NOT AUTHORIZED** |
| Therapist-owned / private methodologies | **DEFERRED / NOT AUTHORIZED** |
| F2 session changes | **NOT AUTHORIZED** |

---

## 16. Confirmation — documentation update only

This update modifies **documentation only** (this readiness file).

- **No** SQL / migrations  
- **No** code  
- **No** Supabase connections or writes  
- **No** UI / services  
- **No** Product / MAP / F2 edits  
- **No** commit / push / deploy  

---

## 17. Stop line

**THERAPIST SETUP READINESS APPROVED — NOT AUTHORIZED FOR IMPLEMENTATION**

---

## 18. Deliverable confirmation

Only this documentation file was modified:

`docs/Engine/Therapist/Platform_Therapist_Setup_Pre_Implementation_Readiness.md`

No SQL, code, migrations, Supabase, UI, services, tests, commit, push or deploy. No unrelated MAP/Product docs were modified.
