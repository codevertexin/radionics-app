# RADIONICS — Workflow Adapter V3.0D.4 Workspace Integration

**Fase:** V3.0D.4 — primeira integração workspace-touching (Mesa 35 workflow apenas)
**Data:** 2026-06-15
**Pré-requisitos:** V3.0D.2 (adapter infra), V3.0D.3 (wizard + `workflowState` na sessão)

---

## Objetivo

Ligar o Workflow Adapter ao Session Workspace **apenas** para sessões:

- `session.executionMode === 'workflow'`
- `session.specialtySlug === 'mesa-35'`

Todas as outras sessões mantêm comportamento legado inalterado.

---

## Guard principal

```typescript
isMesa35WorkflowSession(session)
```

Ficheiro: `src/lib/workflow-adapter/isMesa35WorkflowSession.ts`

Usado no `WorkspacePage` para decidir se carrega adapter, assets do Methodology Engine e persistência workflow.

---

## Alterações no workspace

### `WorkspacePage.tsx` (alterações mínimas, guardadas)

| Área | Comportamento workflow M35 | Comportamento legado |
|------|---------------------------|----------------------|
| Adapter | `useWorkflowAdapter` quando `isMesa35WorkflowSession` | Não carregado |
| Assets | `useMesa35WorkflowAssets` → Methodology Engine | `getToolsByMethodology()` |
| Diagnóstico | 35 gráficos ativos via `toolsOverride` | 8 gráficos `TOOLS_RAD35` |
| Ativações | Gráficos identificados + script knowledge | Lista legada |
| Chakras | Sub-secção no diagnóstico (opcional) | Não exposto |
| Hawkins | Sync para `workflowState` + campos legados | Campos legados apenas |
| Conclusão etapas | `computeAdapterStageCompletion()` | `computeStageCompletion()` |
| Persistência | `workflowState` + `legacyBridge` | Campos legados apenas |
| Relatório | Sync antes do preview (via `persistWorkspace`) | Inalterado |

### Fallback silencioso

Se o adapter ou assets falharem:

- Comportamento legado (sem erro bloqueante ao terapeuta)
- `console.warn` apenas em dev

---

## Navegação

Mantém **5 etapas legadas** + modal de relatório — UX familiar, sem labels técnicos do workflow.

Mapeamento interno (adapter):

| Passos workflow | Etapa legada |
|-----------------|--------------|
| `preparation` + `hawkins_initial` | Preparação |
| `connection` | Conexão |
| `graph_diagnosis` + `chakra_selection` | Diagnóstico |
| `graph_activation` | Ativações |
| `hawkins_final` + `closing` | Encerramento |
| `report` | Relatório/modal |

---

## Fonte de gráficos: 8 → 35

**Antes (legado):** `TOOLS_RAD35` mock — 8 gráficos.

**Workflow M35:** `loadMesa35WorkspaceBundle()` via:

- `getSpecialtyAssets('mesa-35')` — Methodology Engine
- `getSpecialtyAssetContent` / media resolution
- `getSpecialtyActivationScripts` — Knowledge Layer

Mock expandido: `MESA35_GRAPH_CATALOG` (35 entradas) em `mesa35GraphCatalog.ts`, usado por `mockMesa35Data.ts`.

---

## Chakras (suporte mínimo)

- Assets `assetType === 'chakra'` do Methodology Engine
- UI simples no estágio Diagnóstico (toggle multi-select)
- Persistência:
  - `workflowState.steps.chakra_selection.outputs.selected_asset_ids`
  - `fieldValues.selected_chakras` (via `legacyBridge`)

---

## Persistência

Fluxo em `prepareWorkflowPersist()` (`workflowStatePersist.ts`):

1. `updateWorkflowStateFromLegacyDraft` — draft UI → `workflowState`
2. `syncWorkflowStateToLegacy` — `workflowState` → campos legados
3. `updateSession` — grava `toolResults`, Hawkins, `fieldValues`, `workflowState`

Sem colunas SQL novas — usa campos opcionais da sessão (V3.0D.3).

---

## Compatibilidade com relatório

Relatório **não reescrito**. Antes de abrir o preview:

- `persistWorkspace()` sincroniza `workflowState` → snapshot legado
- `ReportPreviewModal` continua a usar `sessionSnapshot` existente

---

## Ficheiros novos

| Ficheiro | Função |
|----------|--------|
| `isMesa35WorkflowSession.ts` | Guard de sessão |
| `mesa35GraphCatalog.ts` | Catálogo 35 gráficos (mock/paridade) |
| `mesa35WorkspaceAssets.ts` | Carregamento assets → `Tool` |
| `workflowStatePersist.ts` | Merge draft ↔ workflowState |
| `useMesa35WorkflowAssets.ts` | Hook de carregamento |

---

## Limitações conhecidas

1. **Apenas Mesa 35 workflow** — M49/MAP não integrados.
2. **Mock activation scripts** — poucos scripts seeded; ausência mostra «Script não disponível» (ativação permitida).
3. **Chakras mock** — 2 chakras no mock; UI mínima, sem fluxo avançado.
4. **Imagens mock** — gráficos fora dos 8 originais usam placeholder até media Supabase.
5. **Conclusão diagnóstico workflow** — basta ≥1 gráfico identificado (regra adapter); legado exige todos analisados.
6. **Relatório** — ainda baseado em snapshot legado; enriquecimento workflow no relatório fica para D.5.

---

## Validação manual sugerida

- [ ] Sessão legado existente continua a funcionar
- [ ] Nova sessão M35 template clássico continua a funcionar
- [ ] Nova sessão M35 workflow abre workspace
- [ ] Diagnóstico mostra 35 gráficos
- [ ] Identificar 2 gráficos → aparecem em Ativações
- [ ] Texto de ativação quando disponível (ex.: Luxor)
- [ ] Ativar gráficos → estado persiste após sair/reabrir
- [ ] Selecionar chakras → persiste
- [ ] Hawkins inicial/final persistem
- [ ] Relatório abre normalmente

---

## Validação automatizada

```bash
npm run typecheck
npm run build
npm run lint
node scripts/validate-v30d2-workflow-adapter.mjs
```
