# RADIONICS — Knowledge Layer V2.6D: Chakra import (Mesa 35)

## PHASE 0 — Validação da fonte

**Ficheiro:** `docs/knowledge/vanessa/Chakra.txt`

| # | Resultado |
|---|-----------|
| 1. Total de entradas | **7** |
| 2. Nomes (V2.5C) | Chakra Básico … Chakra Coronário |
| 3. Nomes sânscritos | Muladhara, Swadhisthana, Manipura, Anahata, Vishuddha, Ajna, Sahasrara |
| 4. Aliases | Conforme V2.6A.1 (Raiz, Sacral, Terceiro Olho, etc.) |
| 5. Secções em falta | **Nenhuma** (Localização, Função, Cor, Elemento, Órgãos, Desequilíbrios, Equilibrar, Ativação) |
| 6. Assets sem match | **Nenhum** (slugs `chakra-*` V2.5C) |

Regenerar validação:

```bash
node scripts/validate-v26d-chakra-source.mjs
```

## Migração

**Ficheiro:** `supabase/migrations/20260531240000_radionics_chakra_knowledge_import_v2_6d.sql`

**Gerador:** `scripts/generate-v26d-chakra-knowledge.mjs`

**Especialidade:** `mesa-35` (chakra-set ligado desde V2.2)

## Fases da migração

### PHASE 1 — `methodology_assets` (naming)

| Campo | Valor |
|-------|--------|
| `canonical_name` | nome UI (`Chakra Básico`, …) |
| `original_name` | sânscrito do ficheiro |
| `aliases` | array conforme tabela abaixo |

### PHASE 2 — `specialty_asset_content`

| Campo | Origem |
|-------|--------|
| `therapist_explanation` | Localização + Função + Cor + Elemento + Órgãos + Desequilíbrios + Como Equilibrar |
| `client_explanation` | Função + desequilíbrios + equilíbrio (linguagem acessível) |
| `activation_text` | linha `Ativação:` do ficheiro |
| `interpretation` | Cor + Elemento + desequilíbrios |
| `recommended_use` | `Como Equilibrar` |
| `metadata` | JSON estruturado (`location`, `function`, `color`, `element`, …) |

Proveniência: `Vanessa` · `course_material` · `docs/knowledge/vanessa/Chakra.txt`

### PHASE 3 — `activation_scripts`

7 scripts: `ativacao-{slug}`, conteúdo = ativação do ficheiro.

### PHASE 4 — `activation_script_links`

`target_type = specialty_asset_content` · idempotente (delete + insert por `source_reference`).

## Mapeamento slug / aliases

| Slug | `original_name` | Aliases |
|------|-----------------|---------|
| `chakra-basico` | Muladhara | Chakra Raiz, Muladhara |
| `chakra-sexual` | Swadhisthana | Chakra Sacral, Chakra Esplênico, Chakra Umbilical, Swadhisthana |
| `chakra-plexo-solar` | Manipura | Manipura |
| `chakra-cardiaco` | Anahata | Anahata |
| `chakra-laringeo` | Vishuddha | Vishuddha |
| `chakra-frontal` | Ajna | Terceiro Olho, Ajna |
| `chakra-coronario` | Sahasrara | Sahasrara |

## Resultado esperado

| Métrica | Esperado |
|---------|----------|
| Assets com naming | **7** |
| `chakra_content_rows` | **7** |
| `chakra_activation_scripts` | **7** |
| `chakra_activation_links` | **7** |

## Validação SQL

```sql
select slug, name, original_name, aliases
from methodology_assets ma
join methodology_tools mt on mt.id = ma.tool_id
where mt.slug = 'chakra-set'
order by ma.sort_order;
```

```sql
select count(*) as chakra_content_rows
from specialty_asset_content sac
join methodology_assets ma on ma.id = sac.asset_id
join methodology_tools mt on mt.id = ma.tool_id
join radionics_specialties rs on rs.id = sac.specialty_id
where mt.slug = 'chakra-set'
  and rs.slug = 'mesa-35'
  and ma.asset_type = 'chakra'
  and sac.is_active = true
  and sac.activation_text is not null
  and sac.metadata ? 'location'
  and sac.metadata ? 'function'
  and sac.metadata ? 'color'
  and sac.metadata ? 'element';
```

```sql
select count(*) as chakra_activation_scripts
from activation_scripts
where source_reference = 'docs/knowledge/vanessa/Chakra.txt'
  and script_type = 'activation'
  and is_active = true;
```

```sql
select count(*) as chakra_activation_links
from activation_script_links asl
join activation_scripts s on s.id = asl.activation_script_id
where s.source_reference = 'docs/knowledge/vanessa/Chakra.txt';
```

## Fora de scope

- Frontend, workspace, sessões, relatórios
- Protocolos (V2.6E)

## Validação build

```bash
npm run build
npm run typecheck
npm run lint
```
