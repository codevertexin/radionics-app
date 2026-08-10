# RADIONICS — Phase 3A.1: Estado do workspace e persistência local

## Fonte única de verdade

```
sessionsStore (sessionsService)
    ↑ updateSession() — sempre com toolResults explícitos
    ↓ getSessionById / listSessions
React Query ['session', id]  ← setQueryData após guardar (sem re-hidratar hook)
    ↓ hidratação única ao abrir sessão
useSessionState (UI derivada — não é segunda base de dados)
```

| Camada | Papel |
|--------|--------|
| **sessionsStore** | Canónico entre navegações (sem F5) |
| **React Query** | Cache da sessão aberta |
| **useSessionState** | Estado de edição; hidrata **só** quando `session.id` muda |
| **sessionSnapshot** | Derivado de `toolResults` + Hawkins para relatório |

### Campos persistidos em `Session`

- `toolResults[]` — `status` (`identified` / `activated` / …), `notes`, `intensity`, `activatedAt`, etc.
- `fieldValues`
- `hawkinsInitial`, `hawkinsFinal`, `reverberationDays`
- `currentStageCode`, `status`, `completedAt`

`normalizeSessionWorkspace()` faz `mergeToolResults(session.toolResults, stages)` — **o array de topo ganha** sobre dados legados em `stages[].steps`.

## Bug corrigido: gráficos voltavam a «Não analisado»

| Causa | Correção |
|-------|----------|
| `useEffect` re-hidratava em cada `session.updatedAt` após `setQueryData`, por vezes com `toolResults` vazios (debounce / closure antiga) | Hidratação **apenas** na primeira abertura de cada `session.id` (`hydratedSessionIdRef`) |
| `persistWorkspace` debounced (400 ms) perdia alterações ao mudar etapa antes do timeout | **Persist imediato** com `toolResults` calculados via `applyToolResultPatch` **antes** do `updateSession` |
| `normalizeSessionWorkspace` ignorava `toolResults: []` e repunha dados antigos só de `stages` | `mergeToolResults(session.toolResults ?? [], fromStages)` sempre |

## Fluxo ao identificar/ativar gráfico

1. `handleToolResultChange` → `applyToolResultPatch(toolResults, …)` → array `nextTools`
2. `replaceToolResults(nextTools)` — UI atualiza
3. `await persistWorkspace({ toolResults: nextTools })` — store + Query
4. Só após sucesso: «Guardado localmente às HH:mm»; em falha: mensagem vermelha

## Fluxo ao mudar etapa

1. `setCurrentStage(code)`
2. `await persistWorkspace({ currentStageCode: code })` — `toolResults` actuais incluídos no payload

## Ao sair do workspace

`useEffect` cleanup chama `persistWorkspace()` no unmount (último estado conhecido).

## Contagens (Diagnóstico / Assistente / Relatório)

`countToolWork(toolResults)` em `sessionWorkspace.ts`:

- **Identificados:** `identified` ou `activated`
- **Ativados:** só `activated`

## Transições de `status`

| Estado | Quando |
|--------|--------|
| `draft` | Criação no wizard |
| `in_progress` | Primeira ação relevante |
| `completed` | Encerramento completo ou «Gerar relatório» |
| `reported` | Fase relatórios (inalterado) |

## Teste manual esperado

1. Abrir sessão → Diagnóstico → Luxor identificado/ativado, Karma ativado
2. Ativações → voltar Diagnóstico → estados mantidos
3. `/sessions` → reabrir → mantidos
4. Relatório → 2 ativados (e identificados conforme regra acima)
5. Sem F5: tudo permanece no store

## Ficheiros

| Ficheiro | Função |
|----------|--------|
| `src/lib/sessionWorkspace.ts` | `applyToolResultPatch`, `mergeToolResults`, `cloneToolResults` |
| `src/lib/session-state.ts` | Hidratação por `session.id`, `computeStageCompletion` |
| `src/services/sessionsService.ts` | `updateSession` com clone de `toolResults` |
| `src/pages/sessions/WorkspacePage.tsx` | Persist imediato + feedback de erro |

## Validação

```bash
npm run build
npm run typecheck
npm run lint
```
