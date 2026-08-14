# Platform Therapist Setup — Local Implementation Report

**Authorization consumed:** `RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01`  
**Design baseline:** `docs/Engine/Therapist/Platform_Therapist_Setup_Pre_Implementation_Readiness.md` (OD-TS-1…15 **APPROVED**)  
**Status:** `READY FOR OWNER REVIEW — NOT APPLIED TO SUPABASE`  
**Date:** 2026-08-14  
**Scope:** Local Therapist Setup / certification onboarding governance + grants hardening reconciliation

---

## 1. Executive verdict

Therapist Setup local implementation prepared under `RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01`:

- Reuses canonical tables: `radionics_specialties`, `therapist_specialty_certifications`, `therapist_specialty_documents`, `radionics_specialty_requests`
- **Flow 1:** select active catalog specialty + certification evidence  
- **Flow 2:** `radionics_specialty_requests` → catalog admission only → then Flow 1 certify  
- **Deferred:** therapist-owned/private methodologies; methodology configuration; UI redesign; F3 session wiring  
- Catalogue authority remains `radionics_specialties` — **no** `platform_methodologies`  
- Additive governance SQL closes OD-TS-5 (document before `pending`) and OD-TS-7 (expiry in eligibility helper)
- **Grants hardening** reconciles unsafe default table privileges (same class of Dev finding as F2 B1)
- Static validator + this report; F2 persistence validators remain green
- Migrations **not applied** to Supabase by this task

**Stop label:** `THERAPIST SETUP GRANTS HARDENING RECONCILIATION COMPLETE — READY FOR OWNER REVIEW — NOT APPLIED`

---

## 2. Files created / modified

| Path | Action |
|------|--------|
| `supabase/migrations/20260814120000_radionics_therapist_setup_governance.sql` | Created earlier (unchanged this reconciliation) |
| `supabase/migrations/20260814123000_radionics_therapist_setup_grants_hardening.sql` | **Created** (grants reconciliation) |
| `scripts/validate-platform-therapist-setup.mjs` | **Updated** — exact grants matrix asserts |
| `docs/Engine/Therapist/Platform_Therapist_Setup_Local_Implementation_Report.md` | **Updated** (this file) |
| `package.json` | Script `validate:platform-therapist-setup` (prior batch) |

**Not modified:** governance core SQL (`…14120000…`), F2 B1–B7 migrations, Product/MAP docs, UI, services.

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

### 4.1 Governance (`…14120000…`) — unchanged this batch

- Helper: `status = 'approved' AND (expires_at IS NULL OR expires_at > now())`
- Trigger: pending requires ≥1 `therapist_specialty_documents` row

### 4.2 Grants hardening (`…14123000…`) — this reconciliation

**Dev apply findings / need:** After specialty/cert tables exist (Phase-1 and/or Therapist Setup governance), Supabase default grants can leave `public` / `anon` / `authenticated` with excess privileges (including `TRUNCATE` / `TRIGGER` / `REFERENCES`), the same failure mode previously reconciled for F2 B1. Therapist Setup therefore ships an additive grants migration **without** rewriting the governance file.

| Role | Table | Intended privileges |
|------|-------|---------------------|
| `anon` | all four | **none** |
| `authenticated` | `radionics_specialties` | SELECT, INSERT, UPDATE, DELETE |
| `authenticated` | `radionics_specialty_requests` | SELECT, INSERT, UPDATE |
| `authenticated` | `therapist_specialty_certifications` | SELECT, INSERT, UPDATE |
| `authenticated` | `therapist_specialty_documents` | SELECT, INSERT, DELETE |

- Wrapped in `BEGIN` / `COMMIT`
- RLS policies preserved (not dropped/recreated)
- No TRUNCATE / TRIGGER / REFERENCES to anon/authenticated
- `service_role` untouched
- No RPCs; no `platform_methodologies`

### 4.3 Explicit non-goals

- No methodology configuration  
- No therapist-owned/private methodology store  
- No F2 `platform_*` session changes  
- No Supabase apply in this task  

---

## 5. Supported flows (locked)

| Flow | Path | Usable when |
|------|------|-------------|
| 1 | `radionics_specialties` (active) → cert + documents → admin approve | §7 availability + helper |
| 2 | `radionics_specialty_requests` → admin → catalog row → Flow 1 | Same as Flow 1 after catalog + cert |

**Not a flow:** therapist-owned/private methodologies.

---

## 6. Validator

- **Command:** `npm run validate:platform-therapist-setup`
- **Assertions:** **89** passed / 0 failed
- Includes exact revoke/grant matrix + no dangerous grants
- Static only — not a live PostgreSQL test

---

## 7. Boundaries confirmed

| Concern | Posture |
|---------|---------|
| F2 B1–B7 | Untouched; validators re-run green |
| Governance SQL core | **Not modified** this reconciliation |
| UI / services | Not implemented this batch |
| Methodology configuration | Deferred |
| Private methodologies | Deferred / forbidden |
| Production / Dev apply | **NOT APPLIED** |

---

## 8. Commands executed and results

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

**Not executed:** Supabase apply/write, commit, push, deploy.

---

## 9. Confirmations

- Zero Supabase connections/writes from this task
- No UI / F3 repositories / methodology configuration
- No Product / MAP doc edits
- No commit / push / deploy
- Core governance migration left unchanged

---

## 10. Stop line

**THERAPIST SETUP GRANTS HARDENING RECONCILIATION COMPLETE — READY FOR OWNER REVIEW — NOT APPLIED**
