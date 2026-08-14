# Platform Therapist Setup — Local Implementation Report

**Authorization consumed:** `RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01`  
**Design baseline:** `docs/Engine/Therapist/Platform_Therapist_Setup_Pre_Implementation_Readiness.md` (OD-TS-1…15 **APPROVED**)  
**Status:** `READY FOR OWNER REVIEW — NOT APPLIED TO SUPABASE`  
**Date:** 2026-08-14  
**Scope:** Local Therapist Setup / certification onboarding governance layer (eligibility only)

---

## 1. Executive verdict

Therapist Setup local implementation prepared under `RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01`:

- Reuses canonical tables: `radionics_specialties`, `therapist_specialty_certifications`, `therapist_specialty_documents`, `radionics_specialty_requests`
- **Flow 1:** select active catalog specialty + certification evidence  
- **Flow 2:** `radionics_specialty_requests` → catalog admission only → then Flow 1 certify  
- **Deferred:** therapist-owned/private methodologies; methodology configuration; UI redesign; F3 session wiring  
- Catalogue authority remains `radionics_specialties` — **no** `platform_methodologies`  
- Additive governance SQL closes OD-TS-5 (document before `pending`) and OD-TS-7 (expiry in eligibility helper)  
- Static validator + this report; F2 persistence validators remain green  
- Migration **not applied** to Supabase by this task

**Stop label:** `THERAPIST SETUP LOCAL IMPLEMENTATION COMPLETE — READY FOR OWNER REVIEW — NOT APPLIED`

---

## 2. Files created / modified

| Path | Action |
|------|--------|
| `supabase/migrations/20260814120000_radionics_therapist_setup_governance.sql` | **Created** (justified gaps) |
| `scripts/validate-platform-therapist-setup.mjs` | **Created** |
| `docs/Engine/Therapist/Platform_Therapist_Setup_Local_Implementation_Report.md` | **Created** (this file) |
| `package.json` | **Modified** — added `validate:platform-therapist-setup` |

**Not modified:** F2 B1–B7 migrations, Product/MAP docs, AGENTS, UI pages, F3 repositories, methodology configuration.

---

## 3. Gap analysis → migration decision

| OD | Gap vs Phase-1 / helper | Local action |
|----|-------------------------|--------------|
| OD-TS-5 | No DB enforcement of ≥1 document before `pending` | **Trigger** `trg_therapist_specialty_certifications_pending_requires_document` |
| OD-TS-7 | `has_approved_specialty_certification` ignored `expires_at` | **Replace helper** with approved + non-expired check |
| OD-TS-9 | Request approval must not auto-certify | **Preserve** (service already inserts catalog only); documented in SQL comments |
| OD-TS-2/15 | No private catalog / no `platform_methodologies` | **No new tables**; validator forbids private tables |
| OD-TS-3 | Reuse existing tables | **Reuse** — governance is additive only |
| OD-TS-4/13/14 | Config / profile CRM / UI | **Out of scope** this batch |

**SQL created:** yes — justified by approved OD-TS-5 and OD-TS-7.

---

## 4. Migration summary

### 4.1 `has_approved_specialty_certification` (OD-TS-7)

```text
status = 'approved'
AND (expires_at IS NULL OR expires_at > now())
```

Read-time gate for F2 / resource RLS consumers. EXECUTE retained for `authenticated` + `service_role`.

### 4.2 Pending requires document (OD-TS-5)

`BEFORE INSERT OR UPDATE OF status` on `therapist_specialty_certifications`: if `NEW.status = 'pending'`, require ≥1 row in `therapist_specialty_documents` for `NEW.id`.

### 4.3 Explicit non-goals in this SQL

- No new tables  
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
- **Assertions:** **65** passed / 0 failed
- Static only — not a live PostgreSQL test

---

## 7. Boundaries confirmed

| Concern | Posture |
|---------|---------|
| F2 B1–B7 | Untouched; validators re-run green |
| UI | Not implemented this batch |
| Services | No new services; existing Flow 2 review remains catalog-only |
| Methodology configuration | Deferred |
| Private methodologies | Deferred / forbidden |
| Production / Dev apply | **NOT APPLIED** |

---

## 8. Commands executed and results

| Command | Result |
|---------|--------|
| `npm run validate:platform-therapist-setup` | PASSED (**65** assertions) |
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
| `npm run typecheck` | PASSED |
| `npm run lint` | PASSED |
| `npm run build` | PASSED |
| `node scripts/validate-v30d2-workflow-adapter.mjs` | PASSED (`ok: true`) |
| `git diff --check` (Therapist Setup paths) | PASSED |

**Not executed:** Supabase apply/write, commit, push, deploy.

---

## 9. Confirmations

- Zero Supabase connections/writes from this task  
- No UI / F3 repositories / methodology configuration  
- No Product / MAP doc edits  
- No commit / push / deploy  

---

## 10. Stop line

**THERAPIST SETUP LOCAL IMPLEMENTATION COMPLETE — READY FOR OWNER REVIEW — NOT APPLIED**
