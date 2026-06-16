# RADIONICS — Workflow Adapter V3.0D.2

**Status:** Implemented (infrastructure only)  
**Plan:** `docs/Engine/RADIONICS_WORKFLOW_ADAPTER_V3_0D1_PLAN.md`  
**Depends on:** V3.0C read service, Mesa 35 mock workflow

---

## Objetivo

Infraestrutura do **Workflow Adapter** para Mesa 35 — traduz passos de workflow para vista compatível com o workspace legado.

**Sem alteração de comportamento visível:** WorkspacePage, NewSessionPage, sessionsService, relatórios e BD inalterados.

---

## Ficheiros criados

| Ficheiro | Papel |
|----------|-------|
| `src/lib/workflow-adapter/types.ts` | Contratos adapter |
| `src/lib/workflow-adapter/mesa35Mapping.ts` | Mapa estático 9 passos → 5 stages |
| `src/lib/workflow-adapter/workflowAdapterBuild.ts` | Build sync (steps, nav, bundle) — sem deps Supabase |
| `src/lib/workflow-adapter/workflowAdapter.ts` | Load async via workflowEngineService |
| `src/lib/workflow-adapter/legacyBridge.ts` | Hydrate / sync / snapshot |
| `src/lib/workflow-adapter/stepCompletion.ts` | Regras de conclusão |
| `src/hooks/useWorkflowAdapter.ts` | Hook read-only (não ligado ao UI) |
| `src/lib/workflow-adapter/validateV30d2.ts` | Self-check |
| `scripts/validate-v30d2-workflow-adapter.mjs` | Launcher validação |

---

## Contratos principais

### `SessionExecutionMode`

- `legacy` — fluxo actual (default para sessões sem `workflowTemplateId`)
- `workflow` — adapter activo

### `AdapterStepView`

Passo workflow enriquecido com:

- `legacyStageCode` — stage UI legado
- `isSubStep` / `subStepOrder` — sub-navegação (ex.: Hawkins em preparation)
- `componentKey` — componente workspace alvo
- `navId` — id de navegação (`preparation`, `preparation:hawkins_initial`, …)
- `visibility` — `visible` \| `hidden` \| `skipped`

### `WorkflowStateDraft`

Estado vivo JSONB (em memória em D.2):

- `steps[step_code].outputs` — outputs por passo
- `legacy` — metadados de bridge (`currentStageCode`, `reportGenerated`)

### `loadAdapterContext(params)`

- Usa `workflowEngineService` (`getWorkflowBundle`, `getDefaultWorkflowForSpecialty`, `hasWorkflowForSpecialty`)
- Sem workflow → `executionMode: 'legacy'`, **sem throw**
- Erro de load → fallback legacy + `error` opcional

### `useWorkflowAdapter`

Hook read-only; **não** importado em `WorkspacePage`.

---

## Mesa 35 mapping

| workflow_step | legacy stage | sub-step | component |
|---------------|--------------|----------|-----------|
| preparation | preparation | — | preparation |
| hawkins_initial | preparation | sim | hawkins_initial |
| connection | connection | — | connection |
| graph_diagnosis | diagnosis | — | diagnosis |
| chakra_selection | diagnosis | sim | selection |
| graph_activation | activations | — | activations |
| hawkins_final | closing | sim | hawkins_final |
| closing | closing | — | closing |
| report | report | — | report_modal |

`buildNavigation()` → **6 itens** (5 legacy stages agrupados + report). Sub-passos fundidos no item do stage pai (`stepCodes[]`).

---

## Legacy bridge mappings

| workflow output | Campo legado |
|-----------------|--------------|
| `hawkins_initial.outputs.hawkins_value` | `hawkinsInitial` |
| `hawkins_final.outputs.hawkins_value` | `hawkinsFinal` |
| `graph_diagnosis.outputs.selected_asset_ids` | `toolResults` (identified) |
| `graph_activation.outputs.activated_asset_ids` | `toolResults` (activated) |
| `chakra_selection.outputs.selected_asset_ids` | `fieldValues.selected_chakras` |
| `closing.outputs.reverberation_days` | `reverberationDays` |

`toLegacySessionSnapshot()` → shape `SessionStateSnapshot` para compatibilidade com relatório (sem alterar UI de relatório).

---

## Regras de conclusão

| Passo | Completo quando |
|-------|-----------------|
| preparation | intenção definida ou status completed |
| connection | sempre `true` (v1) |
| hawkins_initial | valor Hawkins existe |
| graph_diagnosis | ≥1 gráfico seleccionado |
| graph_activation | todos os seleccionados activados |
| chakra_selection | opcional; seleccionados ou skipped |
| hawkins_final | valor existe |
| closing | dias de reverberação definidos |
| report | `legacy.reportGenerated === true` (default false) |

`computeAdapterStageCompletion()` agrega por `legacyStageCode`.

---

## Condicionais

Passos com `config.condition` não satisfeita:

- **Navegação:** `visibility: hidden` (Option A do plano D.1)
- **Estado:** `workflow_state.steps[code].status = 'skipped'`

---

## Validação

```bash
node scripts/validate-v30d2-workflow-adapter.mjs
# ou
npx tsx src/lib/workflow-adapter/validateV30d2.ts

npm run typecheck
npm run build
npm run lint
```

Self-check verifica:

- 9 adapter steps
- 5 legacy nav groups + report
- round-trip Hawkins + graphs
- regras diagnosis/activation
- condição false → hidden

---

## Fora de âmbito (D.2)

| Item | Fase |
|------|------|
| WorkspacePage integração | V3.0D.4 |
| Wizard / createSession | V3.0D.3 |
| 35 gráficos do Methodology Engine na UI | V3.0D.4 |
| Colunas SQL sessão | V3.0D.3+ |
| Relatório UI | V3.0D.5 |
| Mesa 49 / MAP | V3.0F / V3.1 |

---

## Próxima fase — V3.0D.3

1. Wizard: `hasWorkflowForSpecialty` + `getWorkflowTemplatesForSpecialty`
2. `createSession` com `workflowTemplateId`, `workflowVersion`, `executionMode: 'workflow'`
3. Manter fallback `TEMPLATES` legado
4. Sem alterar workspace ainda

---

## Referências

| Recurso | Caminho |
|---------|---------|
| Plano D.1 | `docs/Engine/RADIONICS_WORKFLOW_ADAPTER_V3_0D1_PLAN.md` |
| Read service | `docs/Engine/RADIONICS_WORKFLOW_ENGINE_V3_0C_READ_SERVICE.md` |
| Mock workflow | `src/lib/workflow/mockWorkflows.ts` |
