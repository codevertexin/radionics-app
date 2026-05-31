# RADIONICS — Mock Mode Stabilization

> Data: 2026-05-31  
> Fase: estabilizar mock antes de Supabase real

---

## 1. Objectivo

Manter a app **previsível e testável** em modo mock, independentemente de credenciais Supabase estarem presentes em `.env.local`.

---

## 2. `VITE_DATA_MODE`

| Valor | Comportamento |
|-------|---------------|
| `mock` (default) | Sempre usa `mock-data.ts` + stores in-memory |
| `supabase` | Tenta Supabase; erro claro se tabelas/queries não existirem |

**Implementação:** `src/lib/dataMode.ts`

```ts
getDataMode()      // 'mock' | 'supabase'
isMockMode()       // true por omissão
isSupabaseMode()   // só true se VITE_DATA_MODE=supabase
supabaseNotWired() // erro descritivo em modo supabase
```

### Regras importantes

1. **`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` sozinhos NÃO activam Supabase.**
2. Só `VITE_DATA_MODE=supabase` muda o caminho de dados.
3. Em modo `supabase` sem credenciais → erro: credenciais em falta.
4. Em modo `supabase` com credenciais mas sem migrations → erro: `[Supabase] … is not implemented yet`.

### Exemplo `.env`

```env
VITE_DATA_MODE=mock

# Ignorados para persistência enquanto DATA_MODE=mock:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 3. O que é mock only

| Camada | Comportamento |
|--------|---------------|
| `src/data/mock-data.ts` | Dados estáticos iniciais (seed) |
| `src/services/*.ts` | Stores in-memory mutáveis durante a sessão do browser |
| Páginas sem service | Leem mock-data directamente |
| State hooks | `useSessionState`, `useReportState`, `useTemplateState` — React state + auto-save simulado |

### O que persiste vs. o que não persiste

| Acção | Persiste navegação SPA? | Persiste refresh (F5)? |
|-------|-------------------------|------------------------|
| Criar sessão (`/sessions/new`) | ✅ via `sessionsService` store | ❌ |
| Guardar sessão (workspace) | ✅ `updateSession` no store | ❌ |
| Certificações / especialidades (services) | ✅ in-memory | ❌ |
| Relatórios / templates (hooks) | ✅ React state | ❌ |
| Dados seed originais | ✅ sempre (hardcoded) | ✅ |

**Supabase ainda não está activo** — nenhum dado vai para Postgres ou Storage.

---

## 4. Alterações desta fase

### 4.1 Services (`specialties`, `certifications`, `sessions`)

- Removido `if (supabase) throw …` baseado em credenciais
- Guard `isSupabaseMode()` + `supabaseNotWired()` para modo explícito

### 4.2 Sessões unificadas

| Componente | Antes | Depois |
|------------|-------|--------|
| `SessionsPage` | `SESSIONS` de mock-data | `listSessions()` via React Query |
| `NewSessionPage` | `createSession()` | + invalida `['sessions']` |
| `WorkspacePage` | `getSessionById` mock-data | `getSessionById()` + `updateSession()` service |
| Store | Duplicado (mock vs service) | **Único** `sessionsStore` em `sessionsService.ts` |

Sessões criadas em `/sessions/new` aparecem em `/sessions` (secção **Rascunhos**) sem refresh manual.

### 4.3 Textos de guardar

Centralizados em `MOCK_SAVE_LABELS` (`src/lib/dataMode.ts`):

- `Guardado localmente` (não implica cloud)
- `A guardar localmente…`
- `Auto-guardado local`

Actualizados em: Workspace, Reports Detail, Template Builder, AutoSave.

### 4.4 `.env.example`

Novas variáveis:

```env
VITE_DATA_MODE=mock
VITE_APP_CODE=RADIONICS
VITE_HUB_URL=https://hub.byelamor.com
VITE_HELP_URL=https://help.byelamor.com
VITE_SUPPORT_EMAIL=info@byelamor.com
```

---

## 5. Como testar mock mode

```bash
# Garantir modo mock (ou omitir VITE_DATA_MODE)
VITE_DATA_MODE=mock npm run dev
```

1. Abrir `/certifications` — deve carregar sem erro (mesmo com Supabase URL no `.env.local`)
2. Criar sessão em `/sessions/new` → verificar em `/sessions` (Rascunhos)
3. Abrir workspace → Guardar → texto "Guardado localmente"
4. Refresh (F5) → sessão criada desaparece (esperado)

### Testar modo supabase (dev)

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Chamadas a services devem falhar com mensagem `[Supabase] … is not implemented yet`.

---

## 6. Próximos passos para Supabase real

1. Criar `supabase/migrations/` com DDL (specialties, certifications, sessions…)
2. Implementar queries em `specialtiesService` + `certificationsService`
3. Manter `VITE_DATA_MODE=mock` até cada domínio estar testado
4. Activar domínio a domínio com `VITE_DATA_MODE=supabase`
5. Criar services em falta: `clientsService`, `reportsService`, `templatesService`
6. Ligar hooks de estado a upserts debounced
7. Integrar auth com Auth Core/HUB

---

## 7. Ficheiros alterados

```
src/lib/dataMode.ts                    (novo)
src/lib/supabaseClient.ts              (comentário)
src/services/specialtiesService.ts
src/services/certificationsService.ts
src/services/sessionsService.ts
src/pages/sessions/SessionsPage.tsx
src/pages/sessions/NewSessionPage.tsx
src/pages/sessions/WorkspacePage.tsx
src/pages/reports/DetailPage.tsx
src/pages/templates/BuilderPage.tsx
src/components/ui/AutoSave.tsx
.env.example
```

---

## 8. Referências

- [RADIONICS_PERSISTENCE_AUDIT.md](./RADIONICS_PERSISTENCE_AUDIT.md)
- [RADIONICS_SUPABASE_AUDIT.md](./RADIONICS_SUPABASE_AUDIT.md)
- [RADIONICS_SUPABASE_INTEGRATION_PLAN.md](./RADIONICS_SUPABASE_INTEGRATION_PLAN.md)
