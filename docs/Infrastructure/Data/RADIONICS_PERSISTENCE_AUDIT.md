# RADIONICS — Persistence Audit

> Data: 2026-05-31
> Scope: repositório completo (`src/`, `docs/`, config, dependências)
> Objetivo: estado exacto da integração de dados e persistência

---

## Resumo executivo

| Pergunta | Resposta |
|----------|----------|
| Ligação real ao Supabase? | **Não** — cliente pode instanciar-se; zero I/O |
| `createClient()` existe? | **Sim** — `src/lib/supabaseClient.ts` |
| `select` / `insert` / `update` / `delete` / `storage.*` activos? | **Nenhum** em `src/` |
| Migrations SQL? | **Não** |
| Edge Functions? | **Não** |
| Stack legacy no runtime? | **Não** — isolada em `docs/legacy/` |
| Persistência efectiva hoje | **Mock estático + estado React in-memory** |

### Estado global: **A) Frontend apenas**

O projecto é uma SPA Vite sem backend integrado nem persistência remota funcional. Existe **scaffold Supabase** (pacote, cliente, services preparados), mas isso **não constitui integração parcial de dados** — nenhum registo sobrevive a refresh excepto o que estiver em mock estático.

---

## 1. Supabase — ligação real

### 1.1 Cliente

**Ficheiro:** `src/lib/supabaseClient.ts`

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
```

| Item | Estado |
|------|--------|
| Pacote `@supabase/supabase-js` | ✅ `package.json` |
| `VITE_SUPABASE_URL` | ✅ Lido |
| `VITE_SUPABASE_ANON_KEY` | ✅ Lido |
| Credenciais em `.env.local` | ✅ Presentes (não versionar) |
| Cliente usado em runtime | ❌ Nunca invocado para I/O |
| `isSupabaseConfigured()` | Exportado, **nunca importado** |

**Conclusão:** ligação de **transporte** possível (HTTP/WebSocket do SDK inicializado), mas **sem operações de persistência**.

### 1.2 Operações Supabase (`src/`)

| Operação | Chamadas activas | Notas |
|----------|------------------|-------|
| `.select()` | **0** | 1 linha **comentada** em `specialtiesService.ts` |
| `.insert()` | **0** | — |
| `.update()` | **0** | — |
| `.delete()` | **0** | — |
| `.upsert()` | **0** | — |
| `storage.*` | **0** | — |
| `auth.*` | **0** | — |
| `rpc()` | **0** | — |

**Única referência executável:** `if (supabase) throw new Error('Supabase not wired yet')` nos 3 services — **bloqueia** em vez de persistir quando credenciais existem.

### 1.3 Migrations SQL

| Local | Resultado |
|-------|-----------|
| `supabase/migrations/` | ❌ Não existe |
| `*.sql` no repo | ❌ 0 ficheiros |
| `drizzle-kit` / scripts migrate | ❌ Não configurado |

**Conclusão:** schema Supabase **não está versionado** neste repositório.

### 1.4 Edge Functions

| Local | Resultado |
|-------|-----------|
| `supabase/functions/` | ❌ Não existe |
| Invocações `supabase.functions.invoke` | ❌ 0 |

---

## 2. Tabelas Supabase referenciadas

### 2.1 Código activo (`src/`)

| Tabela | Ficheiro | Tipo |
|--------|----------|------|
| `radionics_specialties` | `specialtiesService.ts:21` | TODO comentado |

### 2.2 Contrato de tipos (`src/types/index.ts`)

Comentários `// Maps to:` — **documentação**, sem queries:

| Tabela planeadas | Tipo TS |
|------------------|---------|
| `radionics_specialties` | `Specialty` |
| `radionics_specialty_requests` | `SpecialtyRequest` |
| `therapist_specialty_certifications` | `Certification` |
| `therapist_specialty_documents` | `CertDocument` |
| `radionics_tables` | `Methodology` |
| `radionics_template_blocks` | `TemplateBlock` |
| `radionics_template_fields` | `TemplateField` |
| `radionics_session_templates` | `Template` |
| `radionics_template_versions` | (campo opcional) |
| `radionics_session_details` | `SessionStateSnapshot` |
| `radionics_session_snapshots` | `SessionSnapshot` |
| `radionics_client_portal_links` | `ClientPortalLink` |

### 2.3 Documentação de produto (`docs/RADIONICS_*.md`)

Plano alargado inclui ainda: `clients`, `radionics_tools`, `radionics_reports`, `radionics_report_sections`, `therapist_methodology_certifications`, etc.

**Nenhuma tabela tem DDL ou RLS neste repo.**

---

## 3. Camadas de persistência actuais

```
┌─────────────────────────────────────────────────────────┐
│  Páginas React (17/19 → mock-data directo)               │
├─────────────────────────────────────────────────────────┤
│  Services (3) → in-memory store + mock-data seed        │
│  ⚠ throw se supabase !== null                           │
├─────────────────────────────────────────────────────────┤
│  State hooks (session / report / template)              │
│  → useState + setTimeout (auto-save simulado)           │
├─────────────────────────────────────────────────────────┤
│  src/data/mock-data.ts (estático, ~1000 linhas)         │
├─────────────────────────────────────────────────────────┤
│  Supabase / localStorage / IndexedDB / API              │
│  → NENHUM                                               │
└─────────────────────────────────────────────────────────┘
```

| Mecanismo | Usado? | Sobrevive refresh? |
|-----------|--------|-------------------|
| `mock-data.ts` estático | ✅ | ✅ (hardcoded) |
| In-memory stores (services) | ✅ | ❌ |
| React state (hooks/páginas) | ✅ | ❌ |
| Auto-save simulado (`setTimeout`) | ✅ | ❌ (sem write) |
| `localStorage` / `sessionStorage` | ❌ | — |
| Supabase PostgREST | ❌ | — |
| Supabase Storage | ❌ | — |
| HTTP API (`fetch`) | ❌ | — |

---

## 4. Services

### 4.1 Exclusivamente mock (runtime actual)

Todos os 3 services importam `@/data/mock-data` e mantêm stores in-memory:

| Service | Seed mock | Store volátil | Funções |
|---------|-----------|---------------|---------|
| `specialtiesService.ts` | `SPECIALTIES`, `SPECIALTY_REQUESTS` | `specialtiesStore`, `requestsStore` | 6 |
| `certificationsService.ts` | `CERTIFICATIONS` | `certsStore` | 5 |
| `sessionsService.ts` | `SESSIONS`, `CLIENTS`, `TEMPLATES`, `METHODOLOGIES` | `sessionsStore` | 3 |

**Classificação:** **Mock Only** (com guard **Placeholder** para Supabase)

### 4.2 Preparados para Supabase, não ligados

| Service | Preparação | Ligado? |
|---------|------------|---------|
| `specialtiesService.ts` | Import `supabase`, TODO `from('radionics_specialties')` | ❌ |
| `certificationsService.ts` | Import `supabase`, guards | ❌ |
| `sessionsService.ts` | Import `supabase`, guards | ❌ |

**Classificação:** **Placeholder**

### 4.3 Services em falta (domínios só mock)

| Domínio | Consumido por | Service |
|---------|---------------|---------|
| Clientes | 3 páginas | ❌ |
| Relatórios | 5 páginas | ❌ |
| Templates | 3 páginas + `template-state` | ❌ |
| Tools / Hawkins | Workspace, Specialties | ❌ |
| Dashboard aggregations | Dashboard | ❌ |

---

## 5. Páginas — origem dos dados

| Página | Origem | Classificação |
|--------|--------|---------------|
| `CertificationsPage` | Services (mock-backed) | **Mock Only** |
| `NewSessionPage` | Services + mock (`CLIENTS`, `TEMPLATES`) | **Mock Only** |
| `DashboardPage` | `mock-data` directo | **Mock Only** |
| `SpecialtiesPage` | `mock-data` directo | **Mock Only** |
| `ProfilePage` | `mock-data` directo | **Mock Only** |
| `ClientsPage` / `ClientDetailPage` | `mock-data` directo | **Mock Only** |
| `SessionsPage` | `mock-data` directo *(ignora `sessionsService`)* | **Mock Only** |
| `WorkspacePage` | `mock-data` + `useSessionState` | **Mock Only** |
| `TemplatesPage` / `Wizard` / `Builder` | `mock-data` + `useTemplateState` | **Mock Only** |
| `ReportsPage` / `Detail` / `Preview` / `Pdf` / `Generate` | `mock-data` + `useReportState` | **Mock Only** |
| `IndexPage` | Redirect | — |
| `Sidebar` | `METHODOLOGIES` (badge) | **Mock Only** |

---

## 6. State hooks (persistência simulada)

| Hook | Ficheiro | Write real | Classificação |
|------|----------|------------|---------------|
| `useSessionState` | `lib/session-state.ts` | ❌ React state only | **Mock Only** |
| `useReportState` | `lib/report-state.ts` | ❌ `setTimeout` fake save | **Placeholder** |
| `useTemplateState` | `lib/template-state.ts` | ❌ `setTimeout` fake save | **Placeholder** |
| `buildSnapshotFromState` | `lib/snapshot-builder.ts` | Pure functions | **Production Ready** (utilitário) |

Comentários nos hooks referem shapes Supabase-ready — **contrato preparado**, **persistência ausente**.

---

## 7. Stack legacy — dependências remanescentes

### 7.1 `package.json` (runtime da app)

| Tecnologia | Presente? |
|------------|-------------|
| Hono | ❌ |
| Drizzle | ❌ |
| Turso / libsql | ❌ |
| better-auth | ❌ |
| @aws-sdk / R2 | ❌ |

**A app Vite não depende de nenhuma stack legacy.**

### 7.2 `docs/legacy/` (referência, não importada)

| Ficheiro | Tecnologia | Operações |
|----------|------------|-----------|
| `specialties-router.ts` | Hono + Drizzle + R2 | select/insert/update/delete (Turso) |
| `schema.ts` | Drizzle SQLite | 4 tabelas definidas |
| `auth.ts` | better-auth | localStorage token |
| `api-client.ts` | Hono client | — |
| `s3.ts` | AWS SDK → R2 | presigned URLs |

**Classificação:** **Legacy** — zero imports desde `src/`.

### 7.3 Documentos obsoletos

| Ficheiro | Nota |
|----------|------|
| `task.md` | Descreve stack Turso/Hono/R2 antiga — **não reflecte** o projecto actual |

---

## 8. Classificação por área funcional

| Área | Estado | Detalhe |
|------|--------|---------|
| **Cliente Supabase** | Placeholder | `createClient()` existe; sem uso |
| **Auth / sessão utilizador** | Mock Only | `therapist-001` hardcoded nos services |
| **Especialidades (catálogo)** | Mock Only | Página directa mock; service mock |
| **Pedidos de especialidade** | Mock Only | Service in-memory |
| **Certificações** | Mock Only | Service in-memory; upload → `mock://` URL |
| **Documentos certificação** | Mock Only | Sem Storage |
| **Sessões (CRUD)** | Mock Only | Service existe; lista/workspace ignoram-nos |
| **Session workspace (runtime)** | Mock Only | `useSessionState` — perde no refresh |
| **Clientes** | Mock Only | Sem service |
| **Templates** | Mock Only | Sem service; auto-save simulado |
| **Relatórios** | Mock Only | Sem service; auto-save simulado |
| **Snapshots de sessão** | Mock Only | `SESSION_SNAPSHOTS` estático |
| **Portal cliente / partilha** | Mock Only | URLs `mock://` e `https://app.radionics.io/...` |
| **Dashboard aggregations** | Mock Only | `getDashboardData()` |
| **Tools / Hawkins** | Mock Only | Arrays estáticos |
| **Migrations / schema DB** | Legacy (docs) | Drizzle em legacy; zero SQL Supabase |
| **API backend** | Legacy | Hono router arquivado |
| **File storage** | Legacy | R2 arquivado; cert uploads mock |

**Nenhuma área está Production Ready para persistência remota.**

---

## 9. Mapa de consumo de dados

```
mock-data.ts ─────────────────────────────────────────────┐
    │                                                      │
    ├──► 15 páginas (import directo)                       │
    ├──► 3 services (seed + lookup)                        │
    ├──► session-state, template-state                     │
    └──► Sidebar                                           │
                                                           │
services/ ◄── CertificationsPage, NewSessionPage (parcial) │
    │                                                      │
    └──► in-memory stores (volátil)                        │
                                                           │
supabaseClient.ts ──► NUNCA reaches DB ◄───────────────────┘
```

---

## 10. Riscos identificados

1. **Credenciais activas quebram a app:** com `.env.local` preenchido, services lançam erro em vez de mock.
2. **Dupla fonte de verdade:** `SessionsPage` usa mock directo; `sessionsService` tem store separado — sessões criadas em `/sessions/new` **não aparecem** na lista (stores diferentes).
3. **Auto-save enganador:** UI mostra "Guardado" sem write persistente.
4. **Nomenclatura de tabelas inconsistente:** `radionics_specialties` (types/legacy) vs `radionics_tables` / `therapist_methodology_certifications` (docs DB).

---

## 11. Estado global — opções A / B / C

| Opção | Critério | Aplica? |
|-------|----------|---------|
| **A) Frontend apenas** | SPA + mock; zero persistência remota | **✅ Sim** |
| **B) Frontend + Supabase parcial** | Algum domínio com CRUD real Supabase | ❌ Não |
| **C) Frontend + Supabase completo** | Todos os domínios persistidos | ❌ Não |

**Veredicto: A) Frontend apenas**

> Nota: existe infraestrutura **Placeholder** (cliente SDK, services, tipos) orientada para B), mas **nenhuma operação de persistência foi implementada**. Instanciar o cliente não equivale a integração parcial.

---

## 12. Próxima fase recomendada

### Fase 1 — Estabilizar mock (1–2 dias)

1. Corrigir guards nos services: mock por defeito até `VITE_SUPABASE_ENABLED=true`
2. Unificar sessões: `SessionsPage` → `sessionsService.listSessions()`
3. Documentar comportamento de auto-save como não-persistente

### Fase 2 — Schema Supabase (3–5 dias)

1. Criar `supabase/migrations/` com DDL alinhado a `src/types/`
2. Prioridade: `radionics_specialties`, `radionics_specialty_requests`, `therapist_specialty_certifications`, `therapist_specialty_documents`
3. RLS por `therapist_id = auth.uid()`
4. Bucket Storage para certificados

### Fase 3 — Primeiro domínio real (3–5 dias)

1. Implementar queries em `specialtiesService` + `certificationsService`
2. Remover throws; manter mock como fallback de dev opcional
3. Validar `CertificationsPage` end-to-end contra Supabase

### Fase 4 — Expandir (iterativo)

1. `clientsService` + `sessionsService` → `radionics_session_details`
2. `reportsService` + snapshots
3. `templatesService`
4. Ligar `useSessionState` / `useReportState` a debounced upserts
5. Auth via Auth Core/HUB (fora deste repo)

---

## 13. Ficheiros auditados

```
src/lib/supabaseClient.ts
src/services/*.ts
src/data/mock-data.ts
src/types/index.ts
src/lib/session-state.ts
src/lib/template-state.ts
src/lib/report-state.ts
src/lib/snapshot-builder.ts
src/pages/**/*.tsx
src/components/layout/Sidebar.tsx
package.json
.env.example
docs/legacy/*
docs/RADIONICS_*.md
task.md
```

---

## 14. Referência cruzada

- Auditoria Supabase anterior: [`RADIONICS_SUPABASE_AUDIT.md`](./RADIONICS_SUPABASE_AUDIT.md)
- Restructure Vite: [`RADIONICS_VITE_RESTRUCTURE_REPORT.md`](./RADIONICS_VITE_RESTRUCTURE_REPORT.md)
- Plano integração: [`RADIONICS_SUPABASE_INTEGRATION_PLAN.md`](./RADIONICS_SUPABASE_INTEGRATION_PLAN.md)
