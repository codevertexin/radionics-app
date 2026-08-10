# RADIONICS — Workflow Engine V3.0B: Schema

**Status:** Implemented
**Migration:** `supabase/migrations/20260615000000_radionics_workflow_engine_schema_v3_0b.sql`
**Plan:** `docs/Engine/RADIONICS_V3_WORKFLOW_ENGINE_PLAN.md` (V3.0A.1 decisions)

---

## Objetivo

Criar o schema mínimo do **Workflow Engine**: templates versionados e passos ordenados, com RLS alinhado ao modelo Resources (certificação aprovada).

Sem colunas de sessão, seeds de workflow, workspace, relatórios ou `workflowEngineService` nesta fase.

---

## Tabelas criadas

### `workflow_templates`

Roteiro versionado por especialidade.

| Coluna | Notas |
|--------|-------|
| `specialty_id` | FK → `radionics_specialties` |
| `slug` | Identificador estável (ex.: `mesa-35-full`) |
| `version` | Default `v1`; nova linha por alteração estrutural |
| `status` | `active`, `inactive`, `draft`, `archived` |
| `is_default` | Default do wizard quando `status = active` |
| `metadata` | jsonb extensível (variants express/follow-up futuros) |

| Constraint / índice | Detalhe |
|---------------------|---------|
| Unique | `(specialty_id, slug, version)` |
| Partial unique | `(specialty_id)` WHERE `is_default = true AND status = 'active'` — no máximo um default activo por especialidade |
| Índices | `specialty_id`, `slug`, `status`, `is_default`, `(specialty_id, status)`, `(specialty_id, is_default)` |
| Trigger | `trg_workflow_templates_updated_at` |

### `workflow_steps`

Passos ordenados dentro de um template.

| Coluna | Notas |
|--------|-------|
| `step_order` | `> 0`, único por template |
| `step_code` | Slug estável (ex.: `hawkins_initial`) — chave em `workflow_state` futuro |
| `step_type` | `preparation`, `connection`, `measurement`, `diagnosis`, `selection`, `activation`, `protocol`, `closing`, `report` |
| `config` | jsonb: `measurement`, `asset_picker`, `protocol`, `condition`, `output_schema` |
| `status` | `active`, `inactive` |

| Constraint / índice | Detalhe |
|---------------------|---------|
| Unique | `(workflow_template_id, step_code)`, `(workflow_template_id, step_order)` |
| Índices | `workflow_template_id`, `step_type`, `status`, `step_order` |
| Trigger | `trg_workflow_steps_updated_at` |

---

## Função RLS

### `can_read_workflow_template(template_id uuid)`

Retorna `true` quando:

1. **Admin** (`is_radionics_admin()`), ou
2. Template `status = 'active'` **e** `has_approved_specialty_certification(specialty_id)`.

Terapeutas **não** leem templates `draft`, `inactive` ou `archived`.

---

## Políticas RLS

### `workflow_templates` (5 políticas)

| Política | Operação | Quem |
|----------|----------|------|
| `workflow_templates_admin_select` | SELECT | Admin |
| `workflow_templates_admin_insert` | INSERT | Admin |
| `workflow_templates_admin_update` | UPDATE | Admin |
| `workflow_templates_admin_delete` | DELETE | Admin |
| `workflow_templates_select_certified_or_admin` | SELECT | `can_read_workflow_template(id)` |

### `workflow_steps` (5 políticas)

| Política | Operação | Quem |
|----------|----------|------|
| `workflow_steps_admin_select` | SELECT | Admin |
| `workflow_steps_admin_insert` | INSERT | Admin |
| `workflow_steps_admin_update` | UPDATE | Admin |
| `workflow_steps_admin_delete` | DELETE | Admin |
| `workflow_steps_select_certified_or_admin` | SELECT | `can_read_workflow_template(workflow_template_id)` |

Terapeutas: **sem** INSERT/UPDATE/DELETE em ambas as tabelas.

---

## Índice partial unique — default activo

Implementado: `idx_workflow_templates_one_active_default_per_specialty`.

Garante no máximo **um** template com `is_default = true` e `status = 'active'` por `specialty_id`. Seguro com catálogo vazio; seeds futuros devem desmarcar o default anterior antes de promover outro.

Não impede múltiplos templates `active` sem `is_default` — decisão de wizard (V3.0C) se o terapeuta escolhe entre variants.

---

## Por que ainda não há colunas de sessão

Decisão V3.0A.1: sessões persistirão `workflow_template_id`, `workflow_version` e `workflow_state` jsonb **depois** do read service e adapter Mesa 35 validados.

| Razão | Detalhe |
|-------|---------|
| Coexistência | `TEMPLATES` mock e stages legados continuam sem alteração |
| Contrato | Schema exacto de `workflow_state` ainda em aberto (V3.0C/D) |
| Placement | `radionics_sessions` vs `radionics_session_details` — decisão diferida |
| Risco | Evitar migração de sessão antes do adapter M35 provar o modelo |

---

## Por que ainda não há seeds de workflow

| Razão | Detalhe |
|-------|---------|
| Rollout | Mesa 35 primeiro (V3.0D), depois Mesa 49 (V3.0F), MAP (V3.1+) |
| Validação | Seeds manuais ou migração dedicada após `workflowEngineService` (V3.0C) |
| Legado | Templates mock permanecem fallback até workflow validado por especialidade |

---

## Suporte a V3.0C (read service)

O schema V3.0B permite:

```text
getWorkflowForSpecialty(specialtyId | slug)
  → SELECT workflow_templates WHERE status = active AND is_default (ou slug)
  → SELECT workflow_steps ORDER BY step_order
  → map rows → WorkflowTemplate / WorkflowStep (src/types/workflow-engine.ts)
  → resolveStepContent() usa config + methodologyEngineService / resourceLibraryService
```

RLS já filtra por certificação — o service pode usar o cliente Supabase do terapeuta autenticado sem lógica duplicada.

`config.condition` e `config.measurement` são consumidos pelo runtime em V3.0C; não há avaliador na BD.

---

## TypeScript

| Ficheiro | Conteúdo |
|----------|----------|
| `src/types/workflow-engine.ts` | `WorkflowTemplate`, `WorkflowStep`, enums, `WorkflowStepConfig` |
| `src/types/index.ts` | Re-export dos tipos |

Sem mapper nem service nesta fase.

---

## Decisões em aberto (V3.0C/D)

| Tema | Estado |
|------|--------|
| Contrato exacto de `workflow_state` | Validar no adapter Mesa 35 |
| Coluna física na sessão | `sessions` vs `session_details` vs mock-only até D |
| Comportamento do adapter | Map `workflow_step` → legacy stage; skipped vs hidden para `condition` |
| Múltiplas versões activas no wizard | Uma default vs selecção explícita |
| Variants express/follow-up | `slug` separado vs `metadata.variant` |

---

## Validação SQL

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'workflow_templates',
    'workflow_steps'
  );

select count(*) as workflow_templates from workflow_templates;
select count(*) as workflow_steps from workflow_steps;
```

**Esperado após migração:** 2 tabelas listadas; contagens **0 / 0**.

---

## Referências

| Recurso | Caminho |
|---------|---------|
| Plano V3.0 | `docs/Engine/RADIONICS_V3_WORKFLOW_ENGINE_PLAN.md` |
| RLS Resources (padrão) | `supabase/migrations/20260531260000_radionics_resource_library_rls_v2_7.sql` |
| Materials RLS (padrão helper) | `supabase/migrations/20260531270000_radionics_materials_library_schema_v2_8b.sql` |
