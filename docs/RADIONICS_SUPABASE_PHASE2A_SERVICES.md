# RADIONICS — Supabase Phase 2A: Specialties + Certifications Services

**Date:** 2026-05-31  
**Scope:** `specialtiesService` e `certificationsService` com persistência Supabase real.  
**Fora de scope:** sessões, Auth Core, HUB.

---

## Resumo

Com `VITE_DATA_MODE=supabase`, especialidades e certificações usam Postgres + Storage.  
Com `VITE_DATA_MODE=mock` (default), o comportamento in-memory anterior mantém-se intacto.

| Modo | Comportamento |
|------|---------------|
| `mock` | Stores in-memory (`mock-data.ts`), therapist fixo `therapist-001` |
| `supabase` | Queries reais; requer credenciais + migrations Phase 1 + sessão autenticada |

**Sem fallback silencioso:** se `VITE_DATA_MODE=supabase` e faltar config, schema ou auth, os services lançam erro explícito.

---

## Configuração

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Pré-requisitos:

1. Migrations aplicadas:
   - `20260531120000_radionics_specialties_phase1.sql`
   - `20260531120001_radionics_certifications_storage.sql`
2. Utilizador autenticado via Supabase Auth (`auth.uid()` para RLS)
3. Admin (opcional): entrada em `radionics_admin_allowlist` ou claim JWT `radionics_role=admin`

---

## Arquitetura

```
src/services/specialtiesService.ts      → branch mock | supabase
src/services/certificationsService.ts   → branch mock | supabase
src/services/supabase/
  specialtiesSupabase.ts
  certificationsSupabase.ts
src/lib/supabase/
  auth.ts       — requireAuthUserId()
  errors.ts     — wrapSupabaseError(), schema missing detection
  mappers.ts    — DB rows ↔ app types, storage paths
src/lib/dataMode.ts — requireSupabaseClient()
```

A UI (`CertificationsPage`) continua a importar os aliases legados (`getSpecialties`, `getMyCertifications`, etc.), que delegam para as funções Phase 2A.

---

## API — Specialties

| Função Phase 2A | Alias UI | Supabase |
|-----------------|----------|----------|
| `listSpecialties()` | `getSpecialties` | `SELECT * FROM radionics_specialties WHERE status = 'active'` |
| `listSpecialtyRequests()` | `getMySpecialtyRequests` | requests do `auth.uid()` |
| `adminListSpecialtyRequests()` | `getAllSpecialtyRequests` | todos (RLS admin) |
| `proposeSpecialty()` | — | `INSERT radionics_specialty_requests` |
| `adminReviewSpecialtyRequest()` | `reviewSpecialtyRequest` | update + cria specialty se aprovado |

---

## API — Certifications

| Função Phase 2A | Alias UI | Supabase |
|-----------------|----------|----------|
| `listCertifications()` | `getMyCertifications` | certs do terapeuta + documentos |
| `adminListCertifications()` | `getAllCertifications` | todas (RLS admin) |
| `submitCertification()` | — | insert/update `therapist_specialty_certifications` |
| `uploadCertificationDocument()` | `uploadCertDocument` | Storage + metadata |
| `uploadCertificationDocuments()` | — | batch upload |
| `addCertificationDocuments()` | — | alias de batch upload |
| `listCertificationDocuments()` | — | docs por `certification_id` |
| `adminReviewCertification()` | `reviewCertification` | aprovar/rejeitar + `expires_at` |

---

## Storage

**Bucket:** `radionics-certifications` (privado)

**Path canónico:**

```
radionics/certifications/{therapist_id}/{certification_id}/{safeFilename}
```

**Metadata** em `therapist_specialty_documents`:

- `certification_id`
- `storage_path`
- `file_name`
- `mime_type` (`application/pdf`, `image/jpeg`, `image/png`)
- `file_type` (`pdf`, `jpg`, `jpeg`, `png`)
- `file_size`

URLs para a UI: signed URLs (TTL 1h) geradas a partir de `storage_path`.

---

## Erros

| Situação | Mensagem |
|----------|----------|
| `VITE_DATA_MODE=supabase` sem URL/key | `VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing` |
| Tabela inexistente (migration não aplicada) | `database schema not found. Apply Phase 1 migrations...` |
| Sem sessão | `[Supabase Auth] Sessão não autenticada...` |
| MIME não permitido | `[Supabase] MIME type not allowed: ...` |
| Cert já pending/approved | `Certification already submitted or approved` |

---

## Auth (placeholder)

RLS usa `auth.uid()`. Auth Core/HUB **não** estão integrados — para testar Phase 2A:

1. Criar utilizador no Supabase Auth (email/password ou magic link)
2. Iniciar sessão no browser (Supabase JS persiste em localStorage)
3. Para admin: `INSERT INTO radionics_admin_allowlist (user_id) VALUES ('<uuid>');`

---

## Validação local

```bash
npm run build
npm run typecheck
npm run lint
```

---

## Próximas fases (não implementadas)

- Phase 2B+: `sessionsService` Supabase
- Auth Core / HUB SSO
- Substituir `is_radionics_admin()` placeholder por claims reais
