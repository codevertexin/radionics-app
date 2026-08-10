# RADIONICS — Workflow Engine V3.0C: Read Service

**Status:** Implemented
**Depends on:** V3.0B schema (`workflow_templates`, `workflow_steps`), V3.0A.1 plan
**Migration:** `supabase/migrations/20260615000000_radionics_workflow_engine_schema_v3_0b.sql`

---

## Objetivo

Camada de serviço **read-only** para definir e resolver workflows versionados por especialidade.

Sem execução de workflow, sem alterações ao workspace, sessões, relatórios ou templates legados.

---

## Ficheiros

| Ficheiro | Papel |
|----------|-------|
| `src/services/workflowEngineService.ts` | API pública (mock \| Supabase) |
| `src/services/supabase/workflowEngineSupabase.ts` | Queries Supabase + RLS |
| `src/lib/workflow/workflowMappers.ts` | Row → domain types |
| `src/lib/workflow/workflowConditions.ts` | Avaliador v1 de condições |
| `src/lib/workflow/workflowErrors.ts` | `WorkflowEngineError` + mapeamento Supabase |
| `src/lib/workflow/mockWorkflows.ts` | Mock Mesa 35 (9 passos) |
| `src/types/workflow-engine.ts` | Tipos extendidos |

---

## Funções do serviço

### `getWorkflowTemplatesForSpecialty(specialtySlug)`

- Requer certificação aprovada.
- Retorna templates `status = active` legíveis pelo utilizador.
- Ordenação: `is_default` desc → `name` asc → `version` desc.
- Supabase: RLS via `can_read_workflow_template()`.

### `getDefaultWorkflowForSpecialty(specialtySlug)`

- Retorna `WorkflowTemplateBundle` (template default activo + passos activos ordenados).
- `null` se não existir workflow (Supabase vazio ou specialty sem mock).

### `getWorkflowBySlug(specialtySlug, workflowSlug, version?)`

- Com `version`: template activo exacto.
- Sem `version`: preferência por default activo com o mesmo `slug`, senão versão activa mais recente (text desc).

### `getWorkflowBundle(templateId)`

- Template + passos activos por `id`.
- Mock: valida certificação na specialty do template.
- Supabase: RLS no template e nos passos.

### `resolveStepContent(step, specialtySlug, sessionContext?)`

Resolver read-only — **não executa** o passo. Interpreta `step.config`:

| Config | Resolução |
|--------|-----------|
| `measurement.tool_slug` | Verifica ferramenta via `getSpecialtyTools()` |
| `asset_picker.tool_slug` | Ferramenta + `assetCount` via `getSpecialtyAssets()` |
| `protocol.allow_browse` | Se true, conta protocolos via `getSpecialtyProtocols()` |
| `condition.*` | Delega a `evaluateWorkflowCondition()` |

Retorno: `WorkflowStepResolvedContent` (referências leves, flags `available`).

### `evaluateWorkflowCondition(condition, sessionContext)`

Predicates v1 (sem rule engine):

| Chave | Satisfaz quando |
|-------|-----------------|
| `requires_protocol_selected` | `sessionContext.selectedProtocolId` definido |
| `requires_asset_type` | Tipo presente em `sessionContext.selectedProtocolAssetTypes` |

Condição vazia → `satisfied: true`.

### `hasWorkflowForSpecialty(specialtySlug)`

- `true` se existir pelo menos um workflow activo legível.
- `false` se sem certificação ou sem workflows.
- Destinado ao wizard (fallback para `TEMPLATES` legado) — **ainda não ligado** ao UI.

---

## Comportamento mock

| Specialty | Workflows |
|-----------|-----------|
| `mesa-35` | 1 template `mesa-35-full` v1, default, 9 passos (plano V3.0A.1) |
| `mesa-49` | Vazio (`null` / `false`) |
| Outras | Vazio |

Passos mock Mesa 35:

1. `preparation`
2. `connection`
3. `hawkins_initial` — `measurement` + `hawkins-scale` / `initial`
4. `graph_diagnosis` — `asset_picker` + `graph-set-35`
5. `graph_activation` — `activation` + `graph-set-35`
6. `chakra_selection` — `asset_picker` + `chakra-set`
7. `hawkins_final` — `measurement` + `final`
8. `closing`
9. `report`

O mock **não altera** o workspace nem o wizard — apenas disponível via service.

---

## Comportamento Supabase

- Usa `workflow_templates` e `workflow_steps`.
- Autenticação obrigatória (`requireAuthUserId`).
- Erros de schema → `WORKFLOW_SCHEMA_MISSING`.
- Erros RLS → `WORKFLOW_FORBIDDEN`.
- Catálogo vazio após V3.0B → funções retornam `[]` / `null` / `false` (esperado).

---

## Sem alterações nesta fase

| Área | Estado |
|------|--------|
| Workspace | Inalterado |
| Sessões | Sem `workflow_template_id`, `workflow_version`, `workflow_state` |
| Relatórios | Inalterados |
| Seeds SQL | Nenhum workflow na BD |
| Templates legados (`TEMPLATES` mock) | Mantidos |
| Wizard | `hasWorkflowForSpecialty()` pronto mas não integrado |

---

## Suporte a V3.0D (Mesa 35 adapter)

O read service permite:

```text
hasWorkflowForSpecialty('mesa-35')
  → true (mock) | false (Supabase sem seeds)

getDefaultWorkflowForSpecialty('mesa-35')
  → WorkflowTemplateBundle

resolveStepContent(step, 'mesa-35')
  → tool/asset/protocol availability para diagnosis + activation adapter
```

Decisões diferidas para V3.0D:

| Tema | Fase |
|------|------|
| Contrato exacto de `workflow_state` | V3.0D |
| Coluna física na sessão | V3.0D |
| Map `workflow_step` → legacy stage | V3.0D adapter |
| Skipped vs hidden para condicionais | V3.0D UI |

---

## Validação

```bash
npm run typecheck
npm run build
npm run lint
```

---

## Referências

| Recurso | Caminho |
|---------|---------|
| Plano V3.0 | `docs/Engine/RADIONICS_V3_WORKFLOW_ENGINE_PLAN.md` |
| Schema V3.0B | `docs/Engine/RADIONICS_WORKFLOW_ENGINE_V3_0B_SCHEMA.md` |
| Methodology read | `src/services/methodologyEngineService.ts` |
| Protocols read | `src/services/resourceLibraryService.ts` |
