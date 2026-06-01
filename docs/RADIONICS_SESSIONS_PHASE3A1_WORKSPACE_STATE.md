# RADIONICS — Phase 3A.1: Estado do workspace e pré-visualização do relatório

## Problemas corrigidos

| Sintoma | Causa | Correção |
|---------|-------|----------|
| Sessão permanece em **Rascunho** em `/sessions` após trabalhar no workspace | `updateSession` não guardava `toolResults` nem promovia `status`; só mudava para `in_progress` no botão Guardar manual | Persistência com `deriveSessionStatus` + auto-save debounced |
| Relatório com **0 identificados / 0 ativados** | `toolResults` só existiam no React hook; preview usava snapshot vazio; contagens ignoravam `activated` no painel lateral | `toolResults` no `Session` + store; `countToolWork()` partilhado |
| Hawkins final / reverberação incorretos no encerramento | `ClosingStage` lia `session.hawkinsInitial` (store) em vez do hook | Passa `hawkinsInitial` do hook |
| Supabase mode quebrava sessões | `supabaseNotWired` (já removido em 3A) | Store mock único |

## Modelo de estado

```
NewSessionPage → createSession (status: draft, toolResults: [])
       ↓
WorkspacePage → useSessionState (hook UI)
       ↓ debounced persistWorkspace (400ms)
sessionsService.updateSession → sessionsStore (partilhado)
       ↓
/sessions listSessions ← mesma store
```

**Não há store paralelo:** o hook é cache de edição; a fonte de verdade após persist é `sessionsStore`.

### Campos em `Session`

- `toolResults[]` — diagnóstico e ativações
- `fieldValues` — campos de template (futuro)
- `hawkinsInitial`, `hawkinsFinal`, `reverberationDays`
- `status`, `currentStageCode`, `completedAt`
- `specialtyId`, `specialtyName`, `specialtySlug` (relatório / lista)

Seed legado: `normalizeSessionWorkspace()` agrega `stages[].steps[].toolResults` para `sess-001`, etc.

## Transições de `status`

| Estado | Quando |
|--------|--------|
| `draft` | Criação no wizard |
| `in_progress` | Primeira ação relevante (gráfico analisado, Hawkins, mudança de etapa, etc.) |
| `completed` | Encerramento completo (`hawkinsFinal` + `reverberationDays`) ou «Gerar relatório» no modal |
| `reported` | Inalterado (fase relatórios) |

Implementação: `src/lib/sessionWorkspace.ts` → `deriveSessionStatus()`, `buildWorkspacePersistPayload()`.

## Contagens de gráficos

`countToolWork(toolResults)`:

- **Identificados (UI relatório):** `status === 'identified' || status === 'activated'`
- **Ativados:** `status === 'activated'`

Usado em: `DiagnosisStage`, `AssistantPanel`, `ReportPreviewModal`.

## Guardar

- Label mantém **«Guardado localmente»** (`MOCK_SAVE_LABELS`).
- Auto-save debounced em alterações de gráficos, Hawkins, reverberação e etapa.
- Botão **Guardar** chama `persistWorkspace()` imediato.
- Lista `/sessions`: `invalidateQueries(['sessions'])` após persist.
- Detalhe da sessão no workspace: `setQueryData(['session', id])` para evitar loop de re-hidratação.

## Pré-visualização do relatório

`ReportPreviewModal` usa `sessionSnapshot` do hook (dados em memória) após `persistWorkspace()` ao abrir.

Mostra: cliente, especialidade (`specialtyName`), Hawkins início/fim, reverberação, contagens e lista de gráficos trabalhados.

## Ficheiros

| Ficheiro | Função |
|----------|--------|
| `src/lib/sessionWorkspace.ts` | Normalização, status, contagens |
| `src/lib/session-state.ts` | Hidratação a partir de `session.toolResults` |
| `src/services/sessionsService.ts` | `normalizeSessionWorkspace` em clone/get |
| `src/pages/sessions/WorkspacePage.tsx` | Persistência e UI |

## Fora de scope

- Supabase `radionics_sessions` / `radionics_session_details`
- `GeneratePage` ainda lê `mock-data` estático (migrar para `sessionsService` numa fase seguinte)

## Validação

```bash
npm run build
npm run typecheck
npm run lint
```
