# RADIONICS — Vite Restructure Report

> Data: 2026-05-31  
> Objetivo: Transformar código desorganizado numa app Vite + React + TypeScript limpa, modular e preparada para Supabase.

---

## 1. Resumo

O projeto foi reorganizado de ficheiros soltos na raiz para uma estrutura `src/` modular. A stack frontend passou de **Wouter + Runable** para **Vite + React Router + TanStack Query**. Backend legacy (Hono, Drizzle, Turso, better-auth, R2) foi isolado em `docs/legacy/` sem integração na app.

**Build:** ✅ `npm run build` — sucesso  
**Typecheck:** ✅ `npm run typecheck` — sucesso  
**Lint:** ✅ `npm run lint` (tsc --noEmit) — sucesso

---

## 2. Nova estrutura de pastas

```
radionics/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── .env.example
├── public/
├── docs/
│   ├── legacy/          # Stack antiga (referência)
│   └── *.md             # Especificações existentes
└── src/
    ├── main.tsx
    ├── components/
    │   ├── Provider.tsx
    │   ├── layout/Sidebar.tsx
    │   └── ui/          # Badge, Button, Modal, etc.
    ├── layouts/AppLayout.tsx
    ├── routes/index.tsx
    ├── pages/
    │   ├── IndexPage.tsx
    │   ├── DashboardPage.tsx
    │   ├── SpecialtiesPage.tsx
    │   ├── CertificationsPage.tsx
    │   ├── ProfilePage.tsx
    │   ├── clients/
    │   ├── sessions/    # inclui NewSessionPage (wizard)
    │   ├── templates/
    │   └── reports/
    ├── data/mock-data.ts
    ├── lib/             # utils, state hooks, supabaseClient
    ├── services/        # specialties, certifications, sessions
    ├── types/index.ts
    ├── hooks/           # (vazio — reservado)
    └── styles/global.css
```

---

## 3. Ficheiros movidos

| Origem (raiz) | Destino |
|---------------|---------|
| `app.tsx` | Removido → substituído por `src/routes/index.tsx` + `src/main.tsx` |
| `index.ts` | `src/types/index.ts` |
| `mock-data.ts` | `src/data/mock-data.ts` |
| `utils.ts` | `src/lib/utils.ts` |
| `session-state.ts` | `src/lib/session-state.ts` |
| `template-state.ts` | `src/lib/template-state.ts` |
| `report-state.ts` | `src/lib/report-state.ts` |
| `snapshot-builder.ts` | `src/lib/snapshot-builder.ts` |
| `styles.css` | `src/styles/global.css` |
| `AppLayout.tsx` | `src/layouts/AppLayout.tsx` |
| `Sidebar.tsx` | `src/components/layout/Sidebar.tsx` |
| `Button.tsx`, `Badge.tsx`, etc. | `src/components/ui/` |
| `dashboard.tsx` | `src/pages/DashboardPage.tsx` |
| `certifications.tsx` | `src/pages/CertificationsPage.tsx` |
| `methodologies.tsx` | `src/pages/SpecialtiesPage.tsx` |
| `profile.tsx` | `src/pages/ProfilePage.tsx` |
| `index.tsx` (clientes) | `src/pages/clients/ClientsPage.tsx` |
| `workspace.tsx` | `src/pages/sessions/WorkspacePage.tsx` |
| `wizard.tsx` | `src/pages/templates/TemplateWizardPage.tsx` |
| `builder.tsx` | `src/pages/templates/BuilderPage.tsx` |
| `detail.tsx`, `pdf.tsx`, etc. | `src/pages/reports/` |
| `RADIONICS_*.md` | `docs/` |

### Ficheiros criados

| Ficheiro | Função |
|----------|--------|
| `src/pages/IndexPage.tsx` | Redirect `/` → `/dashboard` |
| `src/pages/sessions/SessionsPage.tsx` | Lista de sessões |
| `src/pages/sessions/NewSessionPage.tsx` | Wizard nova sessão (só especialidades approved) |
| `src/pages/clients/ClientDetailPage.tsx` | Detalhe do cliente |
| `src/pages/templates/TemplatesPage.tsx` | Lista de templates |
| `src/pages/reports/ReportsPage.tsx` | Lista de relatórios |
| `src/lib/supabaseClient.ts` | Cliente Supabase (null sem credenciais) |
| `src/services/specialtiesService.ts` | CRUD especialidades (mock) |
| `src/services/certificationsService.ts` | CRUD certificações (mock) |
| `src/services/sessionsService.ts` | CRUD sessões (mock) |
| `src/components/Provider.tsx` | React Query provider |
| `src/routes/index.tsx` | React Router config |

---

## 4. Stack antiga identificada e isolada

Movidos para `docs/legacy/`:

| Ficheiro | Tecnologia |
|----------|------------|
| `specialties-router.ts` | Hono API routes |
| `api-client.ts` | Hono RPC client |
| `auth.ts` | better-auth |
| `schema.ts` | Drizzle ORM (SQLite/Turso) |
| `s3.ts` | AWS SDK / Cloudflare R2 |

**Não integrados** na app Vite. Ver `docs/legacy/README.md`.

---

## 5. Rotas configuradas

| Rota | Página |
|------|--------|
| `/` | Redirect → `/dashboard` |
| `/dashboard` | Dashboard |
| `/sessions` | Lista de sessões |
| `/sessions/new` | Wizard nova sessão |
| `/sessions/:id` | Workspace |
| `/sessions/:id/report` | Gerar relatório |
| `/clients`, `/clients/:id` | Clientes |
| `/templates`, `/templates/new`, `/templates/:id/edit` | Templates |
| `/reports`, `/reports/:id`, `/preview`, `/pdf` | Relatórios |
| `/specialties` | Catálogo de especialidades |
| `/methodologies` | Redirect → `/specialties` |
| `/certifications` | Especialidades e Certificações |
| `/profile` | Perfil profissional |

---

## 6. Refactor funcional preservado

- ✅ "Metodologias" → "Especialidades" na UI
- ✅ Página "Especialidades e Certificações" com tabs "As minhas especialidades" e "Admin"
- ✅ Modais de submeter certificação e propor especialidade
- ✅ Estados: `approved`, `pending`, `rejected`, `expired`, `not_certified`
- ✅ Wizard `/sessions/new` — apenas especialidades com certificação `approved`
- ✅ Perfil RADIONICS com dados profissionais + link "Editar perfil global no Auth"
- ✅ Auth Core e HUB **não alterados**

---

## 7. Imports e alias

- Alias `@/` → `src/` configurado em `vite.config.ts` e `tsconfig.app.json`
- Todos os imports relativos (`../../lib/`, etc.) convertidos para `@/`
- Router migrado de **wouter** para **react-router-dom v7**

---

## 8. Erros encontrados e corrigidos

| Erro | Correção |
|------|----------|
| `StageCompletion` vs `Record<string, boolean>` | Spread para objeto indexável em `session-state.ts` e `WorkspacePage.tsx` |
| `title` prop em ícones Lucide (React 19) | Wrapped em `<span title="...">` |
| `ReturnType<typeof getReportV2ById>['sections']` undefined | Tipo explícito `ReportSection` |
| `voice_transcripts` obsoleto | Migrado para `voice_notes[].transcript` |
| `@/lib/mock-data` path errado | Corrigido para `@/data/mock-data` |
| Páginas com props de rota (`{ id }`) | Migradas para `useParams()` |
| `CertificationsPage` importava `@/lib/db/specialties` inexistente | Migrado para `@/services/*` |

---

## 9. Comandos executados

```bash
npm install          # 102 packages, 0 vulnerabilities
npm run build        # tsc -b && vite build — sucesso
npm run typecheck    # tsc -b --noEmit — sucesso
npm run lint         # tsc --noEmit — sucesso
```

---

## 10. Próximos passos para Supabase

1. **Credenciais:** Copiar `.env.example` → `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
2. **Services:** Substituir implementações mock em:
   - `src/services/specialtiesService.ts`
   - `src/services/certificationsService.ts`
   - `src/services/sessionsService.ts`
3. **Schema:** Seguir `docs/RADIONICS_SUPABASE_INTEGRATION_PLAN.md` e `docs/RADIONICS_SUPABASE_MAPPING_PLAN.md`
4. **Auth:** Integrar com Auth Core/HUB (fora deste repo) — token bearer ou SSO
5. **Storage:** Upload de certificados via Supabase Storage (substituir mock URLs)
6. **Persistência:** Ligar `session-state`, `report-state`, `template-state` a mutations Supabase
7. **Code splitting:** Considerar lazy routes para reduzir bundle (~670 kB)

---

## 11. Desenvolvimento local

```bash
npm run dev      # http://localhost:5173
npm run build    # produção em dist/
npm run preview  # preview do build
```
