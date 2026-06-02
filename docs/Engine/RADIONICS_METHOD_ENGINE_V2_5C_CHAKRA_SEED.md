# RADIONICS — Methodology Engine V2.5C: Chakra seed (7)

## Objetivo

Semear os **7 chakras principais** no Methodology Engine, usando a ferramenta existente `chakra-set` e imagens Bunny, sem alterar frontend, workspace, sessões ou relatórios.

## Migração

**Ficheiro:** `supabase/migrations/20260531200000_radionics_methodology_chakra_seed_v2_5c.sql`

**Dependências:** V2.1 (`methodology_tools.chakra-set`), V2.4 (`methodology_asset_media`).

## Assets (`methodology_assets`)

| sort | Nome | slug | code | Bunny |
|------|------|------|------|-------|
| 1 | Chakra Básico | `chakra-basico` | `basico` | `.../Basico.png` |
| 2 | Chakra Sexual | `chakra-sexual` | `sexual` | `.../Sexual.png` |
| 3 | Chakra Plexo Solar | `chakra-plexo-solar` | `plexo` | `.../Plexo.png` |
| 4 | Chakra Cardíaco | `chakra-cardiaco` | `cardiaco` | `.../Cardiaco.png` |
| 5 | Chakra Laríngeo | `chakra-laringeo` | `laringeo` | `.../Laringeo.png` |
| 6 | Chakra Frontal | `chakra-frontal` | `frontal` | `.../Frontal.png` |
| 7 | Chakra Coronário | `chakra-coronario` | `coronario` | `.../Coronario.png` |

- `asset_type`: `chakra`
- `usage_mode`: `analysis`
- Upsert: `ON CONFLICT (tool_id, slug) DO UPDATE`
- `image_url` no asset = fallback legado (mesma URL Bunny)

## Media (`methodology_asset_media`)

Escopo **global** (preparado para overrides por professor mais tarde):

| Campo | Valor |
|-------|--------|
| `specialty_id` | `NULL` |
| `tool_id` | `chakra-set` |
| `is_primary` | `true` |
| `storage_provider` | `bunny` |
| `source_type` | `app_default` |
| `source_name` | `RADIONICS` |

RLS: linhas `app_default` + `approved` são legíveis por utilizadores autenticados (V2.4).

## Especialidades

- **Não** cria novos `specialty_tools`.
- Mesa 35 já liga `chakra-set` desde V2.2 (`sort_order = 3`, opcional).
- **Sem** `specialty_asset_content` nesta fase.

## Resultado esperado

| Métrica | Valor |
|---------|-------|
| `chakra_assets` | **7** |
| `chakra_media` (primária) | **7** |

## Validação SQL

```sql
select count(*) as chakra_assets
from methodology_assets ma
join methodology_tools mt on mt.id = ma.tool_id
where mt.slug = 'chakra-set'
  and ma.asset_type = 'chakra'
  and ma.status = 'active';

select count(*) as chakra_media
from methodology_asset_media mam
join methodology_assets ma on ma.id = mam.asset_id
join methodology_tools mt on mt.id = ma.tool_id
where mt.slug = 'chakra-set'
  and mam.media_type = 'image'
  and mam.is_primary = true;

select ma.slug, ma.name, mam.url
from methodology_assets ma
join methodology_tools mt on mt.id = ma.tool_id
left join methodology_asset_media mam on mam.asset_id = ma.id and mam.is_primary = true
where mt.slug = 'chakra-set'
order by ma.sort_order;
```

## Resolução de media (referência V2.4)

Para chakras com `specialty_id` NULL na media global:

1. asset + specialty + primary (futuro override por especialidade)
2. asset + **tool** + primary ← escopo V2.5C
3. asset global primary
4. `methodology_assets.image_url`

## Fora de scope

- Workspace / mock-data
- Conteúdo contextual por especialidade
- Novas ligações specialty ↔ chakra além de V2.2

## Próximos passos

- `specialty_asset_content` para chakras em Mesa 35 (ou MAP)
- Media com `specialty_id` + `teacher_original` quando houver variantes por formador

## Validação build

```bash
npm run build
npm run typecheck
npm run lint
```
