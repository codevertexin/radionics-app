# RADIONICS — Knowledge Layer V2.6E: Protocol import (28 Protocolos Especiais)

## PHASE 0 — Validação da fonte

**Ficheiro:** `docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt`

| # | Resultado |
|---|-----------|
| 1. Total de protocolos | **28** |
| 2. Referências por protocolo | 5 anjos + 3 gráficos = **8** |
| 3. Total de referências | **224** |
| 4. Referências sem match | **0** (matching `(N)` → `sort_order` em `methodology_assets`) |
| 5. Anjos únicos referenciados | **37** |
| 6. Arcanjos únicos referenciados | **6** |
| 7. Gráficos únicos referenciados | **31** |
| 8. Referências diretas a `chakra-set` | **0** (`(21) Revitalizador de Chakras` = gráfico) |

Regenerar validação:

```bash
node scripts/validate-v26e-protocol-source.mjs
```

## Decisões de import

| Decisão | Valor | Motivo |
|---------|-------|--------|
| `specialty_id` | **`mesa-49`** | Protocolos «especiais» no contexto da mesa angelical; RLS/certificação via mesa-49. Gráficos resolvem via `graph-set-35` cross-tool. |
| `protocol_steps` | **2 passos** | Passo 1: Símbolos Angelicais (5 bullets da fonte). Passo 2: Gráficos Radiônicos (3 bullets da fonte). |
| Conteúdo inventado | **Nenhum** | `description` = «Para quê», `why_activate` = «Por que ativar», steps = bullets literais da fonte. |

## Migração

**Ficheiro:** `supabase/migrations/20260531250000_radionics_protocol_import_v2_6e.sql`

**Gerador:** `scripts/generate-v26e-protocol-import.mjs`

**Especialidade:** `mesa-49`

**Tools referenciados:** `angel-set-49`, `graph-set-35`

## Fases da migração

### PHASE 1 — `methodology_protocols`

| Campo | Origem |
|-------|--------|
| `code` | `P01` … `P28` |
| `slug` | `protocolo-NN-{nome-normalizado}` |
| `name` | título do protocolo na fonte |
| `description` | bloco «Para quê» |
| `why_activate` | bloco «Por que ativar» |
| `source_name` | `Vanessa` |
| `source_type` | `course_material` |
| `source_reference` | `docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt` |
| `metadata` | `{ import_source: "v2.6e", source_protocol_num: N }` |

Upsert idempotente: `ON CONFLICT (specialty_id, slug)`.

### PHASE 2 — `protocol_assets`

224 links (28 × 8):

| Campo | Valor |
|-------|--------|
| `asset_role` | `angel`, `archangel` ou `graph` |
| `sort_order` | 1–5 anjos, 6–8 gráficos |
| `notes` | `source #N — {label da fonte}` |

Resolução: `(tool_slug, asset_slug)` → `methodology_assets.id`.

Replace idempotente: `DELETE` links dos protocolos com `source_reference` V2.6E, depois `INSERT`.

### PHASE 3 — `protocol_steps`

56 steps (28 × 2):

| step_number | title | instructions |
|-------------|-------|--------------|
| 1 | Símbolos Angelicais | bullets `• (N) Nome` da fonte |
| 2 | Gráficos Radiônicos | bullets `• (N) Nome` da fonte |

Upsert idempotente: `ON CONFLICT (protocol_id, step_number)`.

## Resultado esperado

| Métrica | Esperado |
|---------|----------|
| `methodology_protocols` (V2.6E) | **28** |
| `protocol_assets` | **224** |
| `protocol_steps` | **56** |
| Asset refs não resolvidos | **0** |

## Validação SQL

```sql
select count(*) as protocol_count
from methodology_protocols
where source_reference = 'docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt'
  and status = 'active';
-- esperado: 28
```

```sql
select count(*) as asset_links
from protocol_assets pa
join methodology_protocols mp on mp.id = pa.protocol_id
where mp.source_reference = 'docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt';
-- esperado: 224
```

```sql
select count(*) as step_count
from protocol_steps ps
join methodology_protocols mp on mp.id = ps.protocol_id
where mp.source_reference = 'docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt';
-- esperado: 56
```

```sql
select mp.slug, mp.name, count(pa.id) as assets, count(ps.id) as steps
from methodology_protocols mp
left join protocol_assets pa on pa.protocol_id = mp.id
left join protocol_steps ps on ps.protocol_id = mp.id
where mp.source_reference = 'docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt'
group by mp.id, mp.slug, mp.name
order by mp.sort_order;
-- cada linha: assets=8, steps=2
```

```sql
select count(*) as unresolved
from (
  select 1
  from methodology_protocols mp
  join protocol_assets pa on pa.protocol_id = mp.id
  join methodology_assets ma on ma.id = pa.asset_id
  join methodology_tools mt on mt.id = ma.tool_id
  where mp.source_reference = 'docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt'
) x;
-- esperado: 224 (nenhum link órfão)
```

## Fora de scope

- Frontend, workspace, sessões, relatórios
- Serviços TypeScript read layer para protocolos (fase futura)

## Validação build

```bash
node scripts/validate-v26e-protocol-source.mjs
node scripts/generate-v26e-protocol-import.mjs
npm run build
npm run typecheck
npm run lint
```
