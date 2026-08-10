# RADIONICS — Supabase Integration Audit

> Data: 2026-05-31
> Scope: `src/` (app Vite frontend)
> Conclusão: **Partial Supabase** (scaffold only — ver secção 9)

---

## 1. Checklist rápido

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Existe `src/lib/supabaseClient.ts`? | **Sim** |
| 2 | Usa `VITE_SUPABASE_URL`? | **Sim** |
| 3 | Usa `VITE_SUPABASE_ANON_KEY`? | **Sim** |
| 4 | Services ainda em mock? | **Sim — os 3 services** |
| 5 | Páginas só mock? | **17 de 19** leem mock directamente; **2 híbridas** |
| 6 | Chamadas reais ao Supabase? | **Não** — zero `supabase.from()` activo |
| 7 | Tabelas referenciadas? | **Sim** — comentários/TODO e tipos; 1 nome em código activo (comentado) |

---

## 2. Cliente Supabase

**Ficheiro:** `src/lib/supabaseClient.ts`

```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
```

| Aspecto | Estado |
|---------|--------|
| Pacote `@supabase/supabase-js` | Instalado (`package.json`) |
| Variáveis lidas | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Fallback sem credenciais | `supabase = null` |
| `isSupabaseConfigured()` usado em runtime | **Não** — exportado mas nunca importado |

### Ambiente

| Ficheiro | Conteúdo relevante |
|----------|-------------------|
| `.env.example` | Documenta `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` |
| `.env.local` | **Credenciais presentes** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) |

**Nota:** `.env.local` define também `VITE_SUPABASE_PROJECT_ID`, que **não é lido** por `supabaseClient.ts`. Apenas URL + anon key são usados.

**⚠️ Risco operacional:** Com credenciais configuradas, `supabase !== null` e **todos os services lançam** `throw new Error('Supabase not wired yet')` em vez de usar mock. A app pode falhar em `/certifications` e `/sessions/new` enquanto a integração não estiver implementada.

---

## 3. Chamadas reais ao Supabase

**Resultado: nenhuma chamada activa.**

| Tipo | Encontrado |
|------|------------|
| `supabase.from(...)` executável | **0** |
| `supabase.from(...)` comentado | **1** (TODO em `specialtiesService.ts`) |
| `supabase.auth.*` | **0** |
| `supabase.storage.*` | **0** |
| `supabase.rpc(...)` | **0** |

O cliente **pode ser instanciado** se existirem env vars, mas **nenhum código de produção o utiliza** para ler ou escrever dados.

---

## 4. Services (`src/services/`)

Todos importam `supabase` e `mock-data`. Padrão actual:

```ts
if (supabase) throw new Error('Supabase not wired yet');
// ... lógica mock in-memory
```

| Service | Mock seed | Funções | Supabase real |
|---------|-----------|---------|---------------|
| `specialtiesService.ts` | `SPECIALTIES`, `SPECIALTY_REQUESTS` | `getSpecialties`, `getMySpecialtyRequests`, `getAllSpecialtyRequests`, `proposeSpecialty`, `reviewSpecialtyRequest`, `getApprovedSpecialties` | ❌ TODO comentado em `getSpecialties` |
| `certificationsService.ts` | `CERTIFICATIONS` | `getMyCertifications`, `getAllCertifications`, `submitCertification`, `uploadCertDocument`, `reviewCertification` | ❌ |
| `sessionsService.ts` | `SESSIONS`, `CLIENTS`, `TEMPLATES`, `METHODOLOGIES` | `listSessions`, `getSessionById`, `createSession` | ❌ |

**Persistência mock:** stores in-memory (`specialtiesStore`, `certsStore`, `sessionsStore`) — **perdem-se no refresh**.

---

## 5. Páginas e dependências de dados

### 5.1 Via services (mock-backed)

| Página | Services | Mock directo adicional |
|--------|----------|------------------------|
| `CertificationsPage.tsx` | `specialtiesService`, `certificationsService` | — |
| `sessions/NewSessionPage.tsx` | `specialtiesService`, `sessionsService` | `CLIENTS`, `TEMPLATES` de `@/data/mock-data` |

### 5.2 Exclusivamente mock-data (sem services)

| Página | Imports principais |
|--------|-------------------|
| `DashboardPage.tsx` | `getDashboardData`, `HAWKINS_LEVELS` |
| `SpecialtiesPage.tsx` | `METHODOLOGIES`, `getToolsByMethodology` |
| `ProfilePage.tsx` | `METHODOLOGIES` |
| `clients/ClientsPage.tsx` | `CLIENTS` |
| `clients/ClientDetailPage.tsx` | `getClientById`, `SESSIONS` |
| `sessions/SessionsPage.tsx` | `SESSIONS` *(não usa `sessionsService`)* |
| `sessions/WorkspacePage.tsx` | `getSessionById`, `HAWKINS_LEVELS`, `getToolsByMethodology`, `TOOLS_RAD35` |
| `templates/TemplatesPage.tsx` | `TEMPLATES` |
| `templates/TemplateWizardPage.tsx` | `METHODOLOGIES`, `TEMPLATES` |
| `templates/BuilderPage.tsx` | `METHODOLOGIES` |
| `reports/ReportsPage.tsx` | `REPORTS` |
| `reports/DetailPage.tsx` | `getReportV2ById`, `getClientById`, `SESSIONS` |
| `reports/PreviewPage.tsx` | `getReportV2ById` |
| `reports/PdfPage.tsx` | `getReportV2ById`, `getClientById` |
| `reports/GeneratePage.tsx` | `getSessionById`, `getClientById`, `getSnapshotBySessionId` |
| `IndexPage.tsx` | — (redirect) |

### 5.3 Componentes / lib com mock

| Módulo | Fonte mock |
|--------|------------|
| `components/layout/Sidebar.tsx` | `METHODOLOGIES` (badge pending) |
| `lib/session-state.ts` | `getToolsByMethodology` |
| `lib/template-state.ts` | `TEMPLATES` |
| `lib/report-state.ts` | Sem import directo — recebe `ReportV2` inicial das páginas (mock) |
| `lib/snapshot-builder.ts` | Funções puras — sem I/O |
| `data/mock-data.ts` | Fonte única de dados estáticos (~1000 linhas) |

---

## 6. Tabelas Supabase referenciadas no código

### 6.1 Código activo (`src/`)

| Tabela | Onde | Tipo referência |
|--------|------|-----------------|
| `radionics_specialties` | `specialtiesService.ts:21` | TODO comentado |

### 6.2 Tipos — mapeamento documentado (`src/types/index.ts`)

Comentários `// Maps to:` (contrato futuro, sem queries):

| Tabela conceptual | Tipo TS |
|-------------------|---------|
| `radionics_specialties` | `Specialty` |
| `radionics_specialty_requests` | `SpecialtyRequest` |
| `therapist_specialty_certifications` | `Certification` |
| `therapist_specialty_documents` | `CertDocument` |
| `radionics_tables` | `Methodology` |
| `radionics_template_blocks` | `TemplateBlock` |
| `radionics_template_fields` | `TemplateField` |
| `radionics_session_templates` | `Template` |
| `radionics_session_details` | `SessionStateSnapshot` |
| `radionics_session_snapshots` | `SessionSnapshot` |
| `radionics_client_portal_links` | `ClientPortalLink` |

### 6.3 Legacy (`docs/legacy/schema.ts`) — Drizzle, não integrado

- `radionics_specialties`
- `radionics_specialty_requests`
- `therapist_specialty_certifications`
- `therapist_specialty_documents`

### 6.4 Documentação de produto (`docs/RADIONICS_*.md`)

Plano alargado inclui, entre outras:

`clients`, `radionics_tables`, `radionics_tools`, `radionics_session_details`, `radionics_session_templates`, `radionics_template_blocks`, `radionics_template_fields`, `radionics_session_snapshots`, `radionics_reports`, `radionics_report_sections`, `client_portal_links`, `therapist_methodology_certifications`

**Nenhuma destas tabelas tem migration ou query activa no frontend.**

---

## 7. Domínios sem service layer

Estes domínios **não têm** `src/services/*` e dependem 100% de mock:

| Domínio | Dados mock |
|---------|------------|
| Clientes | `CLIENTS`, `getClientById` |
| Relatórios | `REPORTS`, `getReportV2ById`, `getSnapshotBySessionId` |
| Templates | `TEMPLATES`, `getTemplateById` |
| Tools / Hawkins | `TOOLS_RAD35`, `TOOLS_RAD49`, `HAWKINS_LEVELS` |
| Dashboard | `getDashboardData()` |
| Methodologies (UI legacy) | `METHODOLOGIES` |

---

## 8. Matriz de maturidade por área

| Área | Cliente | Service | Páginas | DB real |
|------|---------|---------|---------|---------|
| Especialidades | ✅ | ✅ mock | Certifications ✅ / Specialties ❌ mock | ❌ |
| Certificações | ✅ | ✅ mock | Certifications ✅ | ❌ |
| Sessões | ✅ | ✅ mock | Sessions ❌ mock / New ✅ parcial / Workspace ❌ mock | ❌ |
| Clientes | ✅ | ❌ | ❌ mock | ❌ |
| Templates | ✅ | ❌ | ❌ mock | ❌ |
| Relatórios | ✅ | ❌ | ❌ mock | ❌ |
| Auth | — | — | Perfil mock (link Auth externo) | ❌ |

---

## 9. Conclusão final

### Classificação: **Partial Supabase**

| Nível | Aplica? | Evidência |
|-------|---------|-----------|
| **Mock only** | Parcialmente | Todo I/O de dados usa mock; zero queries Supabase |
| **Partial Supabase** | **✅ Sim** | Cliente + env vars + 3 services preparados + tipos mapeados; integração não implementada |
| **Fully Supabase** | ❌ Não | Nenhuma tabela ligada; sem auth/storage; 17/19 páginas ignoram services |

**Em termos práticos de runtime:** a app comporta-se como **mock only** *desde que* `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` **não estejam definidos**. Com credenciais presentes (como em `.env.local`), o comportamento degrada para **erros** nos endpoints que usam services.

---

## 10. Recomendações imediatas

1. **Corrigir guard nos services** — enquanto Supabase não estiver wired, usar mock mesmo com cliente instanciado:
   ```ts
   // Preferir feature flag explícita, e.g. VITE_SUPABASE_ENABLED=true
   if (import.meta.env.VITE_SUPABASE_ENABLED === 'true' && supabase) { ... }
   ```
2. **Implementar primeiro** `specialtiesService` + `certificationsService` (já consumidos por `CertificationsPage`).
3. **Migrar `SessionsPage`** para `sessionsService.listSessions()` (service existe mas página não o usa).
4. **Criar services em falta:** `clientsService`, `reportsService`, `templatesService`.
5. **Alinhar nomes de tabela** entre `types/` (`radionics_specialties`) e docs DB (`radionics_tables` / `therapist_methodology_certifications`) antes de implementar queries.
6. **Não commitar** `.env.local` — contém anon key real.

---

## 11. Ficheiros auditados

```
src/lib/supabaseClient.ts
src/services/specialtiesService.ts
src/services/certificationsService.ts
src/services/sessionsService.ts
src/data/mock-data.ts
src/types/index.ts
src/pages/**/*.tsx
src/lib/session-state.ts
src/lib/template-state.ts
src/lib/report-state.ts
docs/legacy/schema.ts
.env.example
.env.local (presença de credenciais — não versionar)
```
