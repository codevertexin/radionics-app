# Platform Therapist Setup — Local Implementation Report

**Authorization consumed:** `RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01`  
**Design baseline:** `docs/Engine/Therapist/Platform_Therapist_Setup_Pre_Implementation_Readiness.md` (OD-TS-1…15 **APPROVED**)  
**Status:** `THERAPIST SETUP DEV APPLY VERIFIED — READY FOR OWNER ACCEPTANCE`  
**Date:** 2026-08-14  
**Scope:** Therapist Setup / certification onboarding governance + grants hardening (local artifacts + Development apply verified)

---

## 1. Executive verdict

Therapist Setup prepared under `RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01` and **verified in Development** after Owner-manual apply:

- Reuses canonical tables: `radionics_specialties`, `therapist_specialty_certifications`, `therapist_specialty_documents`, `radionics_specialty_requests`
- **Flow 1:** select active catalog specialty + certification evidence
- **Flow 2:** `radionics_specialty_requests` → catalog admission only → then Flow 1 certify
- **Deferred:** therapist-owned/private methodologies; methodology configuration; UI redesign; F3 session wiring
- Catalogue authority remains `radionics_specialties` — **no** `platform_methodologies`
- Governance SQL: OD-TS-5 (document before `pending`) + OD-TS-7 (expiry in eligibility helper)
- Grants hardening: exact client matrix verified in Development
- **Production:** not touched
- Prior local stop (repo artifacts): `THERAPIST SETUP GRANTS HARDENING RECONCILIATION COMPLETE — READY FOR OWNER REVIEW — NOT APPLIED`

**Status / stop label:** `THERAPIST SETUP DEV APPLY VERIFIED — READY FOR OWNER ACCEPTANCE`

---

## 2. Files created / modified (implementation history)

| Path | Action |
|------|--------|
| `supabase/migrations/20260814120000_radionics_therapist_setup_governance.sql` | Created (governance) |
| `supabase/migrations/20260814123000_radionics_therapist_setup_grants_hardening.sql` | Created (grants reconciliation) |
| `scripts/validate-platform-therapist-setup.mjs` | Static validator (exact grants matrix) |
| `docs/Engine/Therapist/Platform_Therapist_Setup_Local_Implementation_Report.md` | This report |
| `package.json` | Script `validate:platform-therapist-setup` |

**This documentation update:** only this report file was modified.

---

## 3. Gap analysis → migration decision

| OD | Gap vs Phase-1 / helper | Local action |
|----|-------------------------|--------------|
| OD-TS-5 | No DB enforcement of ≥1 document before `pending` | **Trigger** in governance migration |
| OD-TS-7 | `has_approved_specialty_certification` ignored `expires_at` | **Replace helper** in governance migration |
| OD-TS-9 | Request approval must not auto-certify | **Preserve**; documented in SQL comments |
| Grants | Default privileges after table create (Dev apply class finding) | **Additive** grants hardening migration |
| OD-TS-2/15 | No private catalog / no `platform_methodologies` | **No new tables** |
| OD-TS-4/13/14 | Config / profile CRM / UI | **Out of scope** |

---

## 4. Migration summary

### 4.1 Governance (`…14120000…`)

- Helper: `status = 'approved' AND (expires_at IS NULL OR expires_at > now())`
- Trigger: pending requires ≥1 `therapist_specialty_documents` row

### 4.2 Grants hardening (`…14123000…`)

**Dev apply findings / need (grants hardening):** After specialty/cert tables exist, Supabase default grants can leave `public` / `anon` / `authenticated` with excess privileges (including `TRUNCATE` / `TRIGGER` / `REFERENCES`), the same failure mode previously reconciled for F2 B1. Additive grants migration reconciles without rewriting the governance file.

| Role | Table | Intended privileges |
|------|-------|---------------------|
| `anon` | all four | **none** |
| `authenticated` | `radionics_specialties` | SELECT, INSERT, UPDATE, DELETE |
| `authenticated` | `radionics_specialty_requests` | SELECT, INSERT, UPDATE |
| `authenticated` | `therapist_specialty_certifications` | SELECT, INSERT, UPDATE |
| `authenticated` | `therapist_specialty_documents` | SELECT, INSERT, DELETE |

---

## 5. Development apply — verified

Both migrations were **applied manually in Development** (not by the agent in this documentation update):

1. `supabase/migrations/20260814120000_radionics_therapist_setup_governance.sql`
2. `supabase/migrations/20260814123000_radionics_therapist_setup_grants_hardening.sql`

### 5.1 Grants verification

`therapist_setup_exact_client_grants` **PASS** — `missing=0` `unexpected=0`

| Role | Table | Final grants |
|------|-------|--------------|
| `authenticated` | `radionics_specialties` | SELECT, INSERT, UPDATE, DELETE |
| `authenticated` | `radionics_specialty_requests` | SELECT, INSERT, UPDATE |
| `authenticated` | `therapist_specialty_certifications` | SELECT, INSERT, UPDATE |
| `authenticated` | `therapist_specialty_documents` | SELECT, INSERT, DELETE |
| `anon` | all four | **no grants** |

Also verified: **no** TRUNCATE / TRIGGER / REFERENCES to `anon` / `authenticated`.

### 5.2 Existing rows preserved

| Table / entity | Count |
|----------------|------:|
| certifications | 6 |
| documents | 6 |
| specialty_requests | 1 |

No data rows were inserted by this documentation task beyond pre-existing rows.

### 5.3 Other Dev checks

- RLS enabled on all four relevant tables (`radionics_specialties`, `radionics_specialty_requests`, `therapist_specialty_certifications`, `therapist_specialty_documents`)
- `pending-requires-document` trigger present
- **no** `platform_methodologies`

---

## 6. Supported flows (locked)

| Flow | Path | Usable when |
|------|------|-------------|
| 1 | `radionics_specialties` (active) → cert + documents → admin approve | §7 availability + helper |
| 2 | `radionics_specialty_requests` → admin → catalog row → Flow 1 | Same as Flow 1 after catalog + cert |

**Not a flow:** therapist-owned/private methodologies.

---

## 7. Validator (static / local)

- **Command:** `npm run validate:platform-therapist-setup`
- **Assertions (last local run):** **89** passed / 0 failed
- Static only — complements live Dev verification above; does not replace it

---

## 8. Boundaries confirmed

| Concern | Posture |
|---------|---------|
| Development apply | **Applied manually + verified** |
| Production | **No Production** |
| UI / services | **None** this path |
| Methodology configuration | **None** |
| F3 | **None** |
| Agent data inserts | **None** beyond pre-existing rows |
| This documentation update | **Only this report file** |

---

## 9. Local static suite (prior local batch — reference)

| Command | Result |
|---------|--------|
| `npm run validate:platform-therapist-setup` | PASSED (**89** assertions) |
| `npm run validate:platform-session-f2-b7` | PASSED (**84** assertions) |
| `npm run validate:platform-session-f2-b6` | PASSED (**77** assertions) |
| `npm run validate:platform-session-f2-b5` | PASSED (**70** assertions) |
| `npm run validate:platform-session-f2-b4c` | PASSED (**69** assertions) |
| `npm run validate:platform-session-f2-b4b` | PASSED (**92** assertions) |
| `npm run validate:platform-session-f2-b4a` | PASSED (**61** assertions) |
| `npm run validate:platform-session-f2-b3` | PASSED (**78** assertions) |
| `npm run validate:platform-session-f2-b2` | PASSED (**82** assertions) |
| `npm run validate:platform-session-f2-b1` | PASSED (**105** assertions) |
| `npm run validate:platform-session-f0-f1` | PASSED (**151** assertions) |

---

## 10. Confirmations (this update)

- **No Production**
- **No** UI / services / methodology configuration / F3
- **No** data rows inserted by this task beyond pre-existing rows
- **Only** this report file was modified

---

## 11. Stop line

**THERAPIST SETUP DEV APPLY VERIFIED — READY FOR OWNER ACCEPTANCE**
