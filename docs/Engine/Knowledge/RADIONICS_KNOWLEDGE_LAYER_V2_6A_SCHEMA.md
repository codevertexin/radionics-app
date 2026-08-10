# RADIONICS — Knowledge Layer V2.6A: Schema

## Objetivo

Criar a fundação de base de dados da **Knowledge Layer** (protocolos, passos, ligação a assets e proveniência editorial), **sem importar conteúdo** e sem alterar frontend, workspace, sessões ou relatórios.

## Migração

**Ficheiro:** `supabase/migrations/20260531210000_radionics_knowledge_layer_schema_v2_6a.sql`

**Dependências:** V2.1 (methodology core), Phase 1 (`radionics_specialties`), funções `is_radionics_admin()`, `has_approved_specialty_certification(uuid)`, `set_updated_at()`.

## Tabelas criadas

### `methodology_protocols`

Protocolos por especialidade.

| Destaque | Valores |
|----------|---------|
| Unique | `(specialty_id, slug)` |
| `source_type` | `teacher_original`, `course_material`, `app_adapted`, `generated`, `custom`, `imported` |
| `status` | `active`, `inactive`, `draft`, `archived` |
| Trigger | `trg_methodology_protocols_updated_at` |

### `protocol_assets`

Ligação protocolo ↔ asset com papel no fluxo.

| Destaque | Valores |
|----------|---------|
| Unique | `(protocol_id, asset_id)` |
| `asset_role` | `graph`, `angel`, `archangel`, `chakra`, `hawkins`, `selector`, `crystal`, `master`, `ray`, `other` |

### `protocol_steps`

Passos ordenados dentro de um protocolo.

| Destaque | Valores |
|----------|---------|
| Unique | `(protocol_id, step_number)` |
| `step_number` | `> 0` |
| Trigger | `trg_protocol_steps_updated_at` |

## Colunas adicionadas

### `specialty_asset_content`

| Coluna | Tipo | Default |
|--------|------|---------|
| `source_name` | text | — |
| `source_type` | text | `app_adapted` |
| `source_reference` | text | — |
| `content_version` | text | `v1` |
| `is_app_adapted` | boolean | `true` |
| `is_active` | boolean | `true` |

CHECK `source_type` (mesmo enum que protocolos). Índices: `source_type`, `is_active`.

### `activation_scripts`

Mesmas 6 colunas e CHECK/índices que `specialty_asset_content`.

**Nota:** RLS de `activation_scripts` permanece admin-only em V2.1; as colunas preparam imports futuros e filtros admin.

## Índices (novos)

| Tabela | Índices |
|--------|---------|
| `methodology_protocols` | `specialty_id`, `slug`, `status`, `source_type` |
| `protocol_assets` | `protocol_id`, `asset_id`, `asset_role` |
| `protocol_steps` | `protocol_id`, `step_number` |
| `specialty_asset_content` | `source_type`, `is_active` |
| `activation_scripts` | `source_type`, `is_active` |

## RLS — resumo

| Tabela | SELECT | INSERT / UPDATE / DELETE |
|--------|--------|---------------------------|
| `methodology_protocols` | Admin **ou** certificação na `specialty_id` | Admin apenas |
| `protocol_assets` | Admin **ou** certificação na specialty do protocolo pai | Admin apenas |
| `protocol_steps` | Admin **ou** certificação na specialty do protocolo pai | Admin apenas |

**Policies criadas (12):**

- `methodology_protocols_select_certified_or_admin`
- `methodology_protocols_admin_insert` / `_update` / `_delete`
- `protocol_assets_select_certified_or_admin`
- `protocol_assets_admin_insert` / `_update` / `_delete`
- `protocol_steps_select_certified_or_admin`
- `protocol_steps_admin_insert` / `_update` / `_delete`

## O que **não** foi importado

- Protocolos, passos ou ligações protocolo–asset
- Textos editoriais novos em `specialty_asset_content`
- Scripts de ativação
- Alterações ao workspace, mock-data ou serviços TypeScript

## Próximas fases

| Fase | Conteúdo |
|------|----------|
| **V2.6B** | Graph Knowledge Import (Mesa 35) |
| **V2.6C** | Angel Knowledge Import (Mesa 49) |
| **V2.6D** | Chakra Knowledge Import |
| **V2.6E** | Protocol Import |

## Validação SQL

### Tabelas Knowledge Layer

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'methodology_protocols',
    'protocol_assets',
    'protocol_steps'
  );
```

**Esperado:** 3 linhas.

### Colunas em `specialty_asset_content`

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'specialty_asset_content'
  and column_name in (
    'source_name',
    'source_type',
    'source_reference',
    'content_version',
    'is_app_adapted',
    'is_active'
  );
```

**Esperado:** 6 linhas.

### Colunas em `activation_scripts`

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'activation_scripts'
  and column_name in (
    'source_name',
    'source_type',
    'source_reference',
    'content_version',
    'is_app_adapted',
    'is_active'
  );
```

**Esperado:** 6 linhas.

### Contagem inicial (schema only)

```sql
select
  (select count(*) from methodology_protocols) as protocols,
  (select count(*) from protocol_assets) as protocol_asset_links,
  (select count(*) from protocol_steps) as protocol_steps;
```

**Esperado após V2.6A:** `0` em todas (sem seed).

## Validação build

```bash
npm run build
npm run typecheck
npm run lint
```
