# RADIONICS — Supabase Schema Phase 1

> Data: 2026-05-31  
> Scope: Especialidades + Certificações (schema, RLS, storage)  
> App: continua em `VITE_DATA_MODE=mock` — **nenhuma alteração de UI/services nesta fase**

---

## 1. Objectivo

Criar a base de dados Supabase real para o domínio **Especialidades e Certificações**, pronta para a fase seguinte (wire dos services), sem alterar o comportamento actual da app mock.

---

## 2. Migrations

| Ficheiro | Conteúdo |
|----------|----------|
| `supabase/migrations/20260531120000_radionics_specialties_phase1.sql` | Tabelas, RLS, seed, `is_radionics_admin()` |
| `supabase/migrations/20260531120001_radionics_certifications_storage.sql` | Bucket + policies Storage |

### Aplicar (Supabase CLI ou Dashboard SQL)

```bash
# Com Supabase CLI ligado ao projecto
supabase db push

# Ou copiar o conteúdo dos ficheiros para o SQL Editor do dashboard
```

---

## 3. Tabelas

### 3.1 `radionics_specialties`

Catálogo oficial (admin-managed).

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | `gen_random_uuid()` |
| `name` | text NOT NULL | Obrigatório |
| `slug` | text NOT NULL UNIQUE | Obrigatório |
| `description` | text | |
| `category` | text | |
| `image_url` | text | |
| `color` | text | |
| `requires_certification` | boolean | default true |
| `tool_count` | integer | default 0 |
| **`status`** | text | **`active` \| `inactive`** |
| `created_at` / `updated_at` | timestamptz | |

**Nota frontend:** o tipo TS `Specialty.isActive` mapeia para `status = 'active'`.

### 3.2 `radionics_specialty_requests`

Propostas de especialidade por terapeutas.

| Coluna | Tipo | Notas |
|--------|------|-------|
| `therapist_id` | uuid FK → `auth.users` | |
| `proposed_name` | text NOT NULL | |
| `proposed_slug` | text | |
| `status` | text | `pending_review` \| `approved` \| `rejected` |
| `reviewed_by` / `reviewed_at` | | Admin only |
| `submitted_at` / `created_at` | timestamptz | |

### 3.3 `therapist_specialty_certifications`

Uma linha por `(therapist_id, specialty_id)`.

| Coluna | Tipo | Notas |
|--------|------|-------|
| `therapist_id` | uuid FK → `auth.users` | Obrigatório |
| `specialty_id` | uuid FK → `radionics_specialties` | Obrigatório |
| **`years_of_experience`** | integer NOT NULL | default 0; **> 0** quando `status <> 'not_certified'` |
| `status` | text | ver estados abaixo |
| `submitted_at`, `reviewed_at`, `expires_at` | timestamptz | |
| UNIQUE | `(therapist_id, specialty_id)` | |

**Estados `therapist_specialty_certifications.status`:**

| Valor | Significado |
|-------|-------------|
| `not_certified` | Sem submissão |
| `pending` | Aguarda revisão admin |
| `approved` | Certificado |
| `rejected` | Rejeitado |
| `expired` | Expirado |

### 3.4 `therapist_specialty_documents`

Anexos de certificação.

| Coluna | Tipo | Notas |
|--------|------|-------|
| `certification_id` | uuid FK | |
| `storage_path` | text | Path no bucket |
| `file_url` | text | URL assinada/cache opcional |
| `file_name` | text NOT NULL | |
| **`mime_type`** | text | `application/pdf`, `image/jpeg`, `image/png` |
| `file_type` | text | `pdf`, `jpg`, `jpeg`, `png` (compat app) |
| `file_size` | bigint | bytes |

---

## 4. Indexes

| Tabela | Indexes |
|--------|---------|
| `radionics_specialties` | `status`, `created_at`, UNIQUE `slug` |
| `radionics_specialty_requests` | `therapist_id`, `status`, `created_at` |
| `therapist_specialty_certifications` | `therapist_id`, `specialty_id`, `status`, `created_at`, UNIQUE `(therapist_id, specialty_id)` |
| `therapist_specialty_documents` | `certification_id`, `created_at` |

---

## 5. RLS — resumo

RLS **activo** em todas as tabelas + bucket storage.

### Terapeuta (`auth.uid()`)

| Recurso | Permissões |
|---------|------------|
| `radionics_specialties` | SELECT onde `status = 'active'` |
| `radionics_specialty_requests` | INSERT próprio (`pending_review`), SELECT próprio |
| `therapist_specialty_certifications` | SELECT próprio; INSERT/UPDATE próprio **excepto** `approved` |
| `therapist_specialty_documents` | SELECT/INSERT/DELETE ligados às suas certs **não approved** |
| Storage | READ/WRITE/DELETE no path `{uid}/...` conforme policies |

### Admin (`is_radionics_admin()`)

| Recurso | Permissões |
|---------|------------|
| Todas as tabelas | SELECT global |
| `radionics_specialties` | INSERT, UPDATE, DELETE |
| `radionics_specialty_requests` | UPDATE (aprovar/rejeitar) |
| `therapist_specialty_certifications` | UPDATE (aprovar/rejeitar) |
| Storage | SELECT global, DELETE (moderação) |

Terapeutas **não podem** aprovar/rejeitar requests nem certifications.

---

## 6. `is_radionics_admin()`

Função placeholder isolada para substituição futura pela integração HUB/Auth Core.

Verifica (por ordem):

1. `radionics_admin_allowlist` — tabela bootstrap (`user_id uuid PK`)
2. JWT `app_metadata.radionics_role = 'admin'`
3. JWT `user_metadata.radionics_admin = true`

```sql
-- Bootstrap manual de um admin (service role / SQL editor)
insert into public.radionics_admin_allowlist (user_id, note)
values ('<auth-user-uuid>', 'bootstrap admin');
```

**Substituir depois:** claim canónica do Auth Core sem alterar policies (só a função).

---

## 7. Storage — bucket `radionics-certifications`

| Propriedade | Valor |
|-------------|-------|
| ID / name | `radionics-certifications` |
| Public | `false` |
| Max size | 10 MB |
| MIME types | `application/pdf`, `image/jpeg`, `image/png` |

### Path canónico

```
radionics/certifications/{therapist_id}/{certification_id}/{filename}
```

Exemplo:

```
radionics/certifications/550e8400-e29b-41d4-a716-446655440000/7c9e6679-7425-40de-944b-e07fc1f90ae7/diploma.pdf
```

### Policies Storage

| Policy | Actor | Acção |
|--------|-------|-------|
| `radionics_cert_storage_therapist_select` | Terapeuta | SELECT no seu `{therapist_id}` |
| `radionics_cert_storage_therapist_insert` | Terapeuta | INSERT se cert existe, é sua, e `status <> 'approved'` |
| `radionics_cert_storage_therapist_update` | Terapeuta | UPDATE no seu path |
| `radionics_cert_storage_therapist_delete` | Terapeuta | DELETE se cert não approved |
| `radionics_cert_storage_admin_select` | Admin | SELECT tudo |
| `radionics_cert_storage_admin_delete` | Admin | DELETE (moderação) |

O registo em `therapist_specialty_documents.storage_path` deve usar exactamente este path.

---

## 8. Seed — especialidades iniciais

| name | slug | category |
|------|------|----------|
| MAP | `map` | Radiônica |
| Mesa dos 35 Gráficos | `mesa-35` | Radiônica |
| Mesa dos 49 Símbolos Angelicais | `mesa-49` | Radiônica Avançada |
| Apometria | `apometria` | Espiritual |
| Terapia Floral | `terapia-floral` | Terapias Florais |
| Mesa Estelar | `mesa-estelar` | Radiônica Avançada |

Insert idempotente: `ON CONFLICT (slug) DO NOTHING`.

---

## 9. O que NÃO foi alterado (esta fase)

- `VITE_DATA_MODE` (continua `mock` por omissão)
- `src/services/*`
- Páginas React
- `src/data/mock-data.ts`
- Auth Core / HUB

---

## 10. Mapeamento TS ↔ SQL (referência para Phase 2)

| TypeScript (`src/types`) | Coluna SQL |
|--------------------------|------------|
| `Specialty.isActive` | `status = 'active'` |
| `Specialty.slug` | `slug` |
| `Certification.therapistId` | `therapist_id` |
| `Certification.specialtyId` | `specialty_id` |
| `CertDocument.mimeType` (futuro) | `mime_type` |
| `CertDocument.fileType` | `file_type` |
| `CertDocument.fileUrl` | `file_url` ou signed URL derivada de `storage_path` |

---

## 11. Próximos passos (Phase 2 — services)

1. Aplicar migrations no projecto Supabase (`yayemzevflcnvxlfbrlf`)
2. Adicionar admin bootstrap em `radionics_admin_allowlist`
3. Implementar queries em `specialtiesService` + `certificationsService`
4. Upload Storage → registar `storage_path` em `therapist_specialty_documents`
5. Testar com `VITE_DATA_MODE=supabase` num branch separado
6. Manter `mock` como default até QA completo

---

## 12. Validação local (app)

Esta fase só adiciona SQL/docs — a app mock não muda:

```bash
npm run build
npm run typecheck
npm run lint
```

---

## 13. Referências

- [RADIONICS_MOCK_MODE_STABILIZATION.md](./RADIONICS_MOCK_MODE_STABILIZATION.md)
- [RADIONICS_PERSISTENCE_AUDIT.md](./RADIONICS_PERSISTENCE_AUDIT.md)
- [RADIONICS_SUPABASE_INTEGRATION_PLAN.md](./RADIONICS_SUPABASE_INTEGRATION_PLAN.md)
