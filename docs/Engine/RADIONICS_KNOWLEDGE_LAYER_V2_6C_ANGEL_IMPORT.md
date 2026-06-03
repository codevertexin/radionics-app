# RADIONICS — Knowledge Layer V2.6C: Angel knowledge import (Mesa 49)

## PHASE 0 — Validação da fonte

**Ficheiro:** `docs/knowledge/vanessa/ANJOs.txt`  
*(Pedido referia pasta `ANJOs`; conteúdo está em `ANJOs.txt`.)*

| # | Verificação | Resultado |
|---|-------------|-----------|
| 1 | Total de entradas | **49** |
| 2 | Anjos (`ANJO - …`) | **42** |
| 3 | Arcanjos (`ARCANJO …`) | **7** |
| 4 | Nomes duplicados | **Nenhum** |
| 5 | Assets sem correspondência | **Nenhum** (mapeamento por `sort_order` = número da entrada ↔ `radionics_tools`) |
| 6 | Estrutura por entrada | Título numerado + `Ativação - gráfico: "…"` |

**Campos na fonte:** apenas texto de **ativação**. Não há `O que é` nem texto para cliente — `therapist_explanation` / `client_explanation` **não são alterados** no upsert.

### Mapeamento (entrada N → slug V2.5B)

O número da entrada no ficheiro (1–49) coincide com `sort_order` em `radionics_tools`:

| Entradas | Tipo | Exemplos de slug |
|----------|------|------------------|
| 1–33 | angel | `angel-magic` … `angel-gratitude` |
| 34–40 | archangel | `archangel-raziel` … `archangel-metatron` |
| 41–49 | angel | `angel-union` … `angel-perfect-health` |

Regenerar validação:

```bash
node scripts/validate-v26c-angel-source.mjs
```

## Migração

**Ficheiro:** `supabase/migrations/20260531230000_radionics_angel_knowledge_import_v2_6c.sql`

**Gerador:** `scripts/generate-v26c-angel-knowledge.mjs`

**Dependências:** V2.5B (49 assets + `specialty_asset_content` base), V2.6A (proveniência).

## Destinos

### `activation_scripts` (49)

| Campo | Valor |
|-------|--------|
| `name` | `Ativação — {nome do ficheiro}` |
| `slug` | `ativacao-{asset_slug}` |
| `content` | texto após `Ativação - gráfico:` |
| `source_reference` | `docs/knowledge/vanessa/ANJOs` |
| `source_name` | `Vanessa` |
| `source_type` | `course_material` |
| `is_app_adapted` | `false` |

### `specialty_asset_content` (mesa-49)

Atualiza **apenas** (em conflito): `activation_text`, proveniência, `title` se vazio, `sort_order`.  
**Não** sobrescreve `therapist_explanation` nem `client_explanation`.

### `activation_script_links` (49)

- `target_type` = **`asset`**
- `target_id` = `methodology_assets.id`  
  (alinhado com SQL de validação do projeto)

Idempotência: remove links existentes deste `source_reference` e recria 49.

## Metadados de origem

| Campo | Valor |
|-------|--------|
| `source_name` | Vanessa |
| `source_type` | course_material |
| `source_reference` | docs/knowledge/vanessa/ANJOs |
| `content_version` | v1 |
| `is_app_adapted` | false |

## Resultado esperado

| Métrica | Esperado |
|---------|----------|
| `angel_activation_scripts` | **49** |
| `angel_activation_links` | **49** |
| `angel_assets_with_scripts` | **49** |

## Validação SQL

```sql
select count(*) as angel_activation_scripts
from activation_scripts
where source_reference = 'docs/knowledge/vanessa/ANJOs'
  and script_type = 'activation'
  and is_active = true;
```

```sql
select count(*) as angel_activation_links
from activation_script_links asl
join activation_scripts s on s.id = asl.activation_script_id
where s.source_reference = 'docs/knowledge/vanessa/ANJOs';
```

```sql
select count(distinct ma.id) as angel_assets_with_scripts
from methodology_assets ma
join activation_script_links asl on asl.target_id = ma.id
join activation_scripts s on s.id = asl.activation_script_id
where s.source_reference = 'docs/knowledge/vanessa/ANJOs';
```

## Fora de scope

- Protocolos (`methodology_protocols`) — V2.6E
- Frontend, workspace, sessões, relatórios
- Conteúdo inventado ou placeholders

## Próximas fases

- **V2.6D** — Chakra knowledge import  
- **V2.6E** — Protocol import  

## Validação build

```bash
npm run build
npm run typecheck
npm run lint
```
