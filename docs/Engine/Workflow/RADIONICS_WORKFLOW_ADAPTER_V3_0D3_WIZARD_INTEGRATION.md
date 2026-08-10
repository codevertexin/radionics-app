# RADIONICS — Workflow Adapter V3.0D.3: Wizard Integration

**Status:** Implemented
**Depends on:** V3.0C read service, V3.0D.2 adapter infrastructure
**Plan:** `docs/Engine/RADIONICS_WORKFLOW_ADAPTER_V3_0D1_PLAN.md`

---

## Objetivo

Integrar o Workflow Engine no **wizard de nova sessão** e em `createSession()`, permitindo criar sessões Mesa 35 com metadata de workflow.

O **workspace permanece legado** até V3.0D.4 — sessões workflow abrem com a mesma UI de sempre.

---

## O que mudou

| Área | Alteração |
|------|-----------|
| `Session` type | Campos opcionais `executionMode`, `workflowTemplate*`, `workflowVersion`, `workflowState` |
| `createSession()` | Aceita metadata workflow; validação de `TEMPLATES` só em modo `legacy` |
| `NewSessionPage` | Secções «Fluxo recomendado» + «Modelos clássicos» |
| Selecção wizard | Union discriminada `SessionWizardSelection` |
| Estado inicial | `initializeWorkflowStateForSession()` a partir do bundle |

---

## Coexistência workflow + templates legados

```
Nova sessão → Especialidade
           → Fluxo recomendado (workflow_templates / mock)
           → Modelos clássicos (TEMPLATES mock)
           → Cliente → Confirmar → createSession
```

| Selecção | `executionMode` | Comportamento workspace (D.3) |
|----------|-----------------|-------------------------------|
| Workflow | `workflow` | Metadata persistida; UI legada |
| Modelo clássico | `legacy` | Inalterado |

Templates legados **não removidos**. Supabase sem seeds → só modelos clássicos visíveis.

---

## Campos de sessão adicionados

| Campo | Tipo | Notas |
|-------|------|-------|
| `executionMode` | `'legacy' \| 'workflow'` | Default `legacy` |
| `workflowTemplateId` | string | ID do template workflow |
| `workflowTemplateSlug` | string | ex.: `mesa-35-full` |
| `workflowTemplateName` | string | Nome para UI |
| `workflowVersion` | string | ex.: `v1` |
| `workflowState` | `WorkflowStateDraft` | Estado inicial com passos `not_started` |

Sessões antigas sem estes campos continuam válidas.

---

## Wizard — selecção discriminada

```typescript
type SessionWizardSelection =
  | { kind: 'workflow'; workflowTemplateId; slug; name; version }
  | { kind: 'legacy-template'; templateId; name };
```

**Confirmar:**

- Workflow → «Fluxo: …» + «Versão: …»
- Legado → «Modelo: …»

---

## createSession — workflow

Quando `executionMode === 'workflow'`:

- `templateId` / `templateName` = workflow (compatibilidade UI existente)
- Stages hardcoded mantidos (5 legados)
- `workflowState` inicializado via `getWorkflowBundle` + `initializeWorkflowStateForSession`
- Intenção do wizard injectada em `steps.preparation.outputs.intention`

---

## Fallback

| Situação | Comportamento |
|----------|---------------|
| `getWorkflowTemplatesForSpecialty` falha | `[]`; só modelos clássicos; log em DEV |
| Supabase sem workflows | Secção workflow oculta |
| `getWorkflowBundle` falha no create | `workflowState` mínimo com ids/version |
| Specialty sem workflow mock | Apenas modelos clássicos |

Sem erro bloqueante no wizard.

---

## Mock / dev Mesa 35

Com `VITE_DATA_MODE=mock` (default):

- «Mesa 35 — Sessão completa» aparece em **Fluxo recomendado**
- Modelos `tmpl-rad35-official` / `tmpl-rad35-express` em **Modelos clássicos**

---

## Ficheiros alterados

| Ficheiro | Mudança |
|----------|---------|
| `src/types/index.ts` | Campos Session + re-exports |
| `src/lib/sessionWizardSelection.ts` | Tipos de selecção |
| `src/lib/workflow-adapter/initializeWorkflowState.ts` | Estado inicial |
| `src/services/sessionsService.ts` | CreateSessionInput + createSession |
| `src/pages/sessions/NewSessionPage.tsx` | UI workflow + confirm |

---

## Fora de âmbito (V3.0D.4+)

| Item | Fase |
|------|------|
| WorkspacePage com adapter | V3.0D.4 |
| 35 gráficos do Methodology Engine | V3.0D.4 |
| Relatório via workflow_state | V3.0D.5 |
| Colunas SQL sessão | Futuro |
| Seeds Supabase workflow | Opcional antes de prod |

---

## Validação manual

1. Specialty sem workflow → só modelos clássicos
2. Mesa 35 mock → fluxo recomendado + clássicos
3. Seleccionar workflow → sessão com `executionMode: 'workflow'` e metadata
4. Workspace abre normalmente (legado)
5. Sessões antigas abrem sem regressão

```bash
npm run typecheck
npm run build
npm run lint
```

---

## Referências

| Recurso | Caminho |
|---------|---------|
| Adapter D.2 | `docs/Engine/RADIONICS_WORKFLOW_ADAPTER_V3_0D2.md` |
| Read service | `docs/Engine/RADIONICS_WORKFLOW_ENGINE_V3_0C_READ_SERVICE.md` |
