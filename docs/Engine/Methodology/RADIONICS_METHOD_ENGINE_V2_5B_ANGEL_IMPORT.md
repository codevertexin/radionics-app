# RADIONICS — Methodology Engine V2.5B: Legacy Angelical import (49)

## Objetivo

Importar os **49 símbolos angelicais** do catálogo legado `radionics_tools` para o Methodology Engine, ligados à especialidade **mesa-49**, sem alterar frontend, workspace, sessões, relatórios ou os gráficos importados em V2.5A.

## Migração

**Ficheiro:** `supabase/migrations/20260531190000_radionics_methodology_angel_import_v2_5b.sql`

**Dependências:** V2.1 (core), V2.4 (`methodology_asset_media`), Phase 1 (`mesa-49` em `radionics_specialties`), tabela legada `public.radionics_tools`.

## Origem — `radionics_tools`

| Filtro | Contagem esperada |
|--------|-------------------|
| `category = 'angel'` | **42** |
| `category = 'archangel'` | **7** |
| **Total** | **49** |

Campos usados: `code`, `category`, `image_url`, `sort_order`, `therapy_type_id`, `is_active`, `description` (se existir na instância).

URLs Bunny (exemplo): `https://radionics.b-cdn.net/tools/map_outros/angels/...`

## Destino

| Artefacto | Valor / regra |
|-----------|----------------|
| `methodology_tools` | `angel-set-49` · `49 Símbolos Angelicais` · `angel_set` · `activation` |
| `methodology_assets` | Upsert `(tool_id, slug)` · `asset_type` = `angel` ou `archangel` |
| `methodology_asset_media` | `mesa-49` + `angel-set-49` · primária · `bunny` · `teacher_original` · `Vanessa` |
| `specialty_tools` | `mesa-49` + `angel-set-49` · obrigatório · visível · `sort_order = 1` |
| `specialty_asset_content` | 1 linha por asset ativo |

## Regras de mapeamento

- **Slug:** `legacy_tool_code_to_asset_slug(code)` — lowercase, `_` → `-`, remoção de acentos comuns (PT).
- **Nome:** `legacy_angel_code_to_display_name(code, category)` — remove prefixos `angel_` / `archangel_`.
- **Metadata:** `legacy_code`, `legacy_category`, `therapy_type_id`, `import_source = v2.5b`.
- **Idempotência:** `ON CONFLICT DO UPDATE` em tools, assets, specialty_tools, content; media via UPDATE + INSERT NOT EXISTS (índice primário parcial V2.4).

## Resultado esperado

| Métrica | Esperado |
|---------|----------|
| Assets `angel` | 42 |
| Assets `archangel` | 7 |
| Media primária | 49 |
| `specialty_asset_content` | 49 |
| `specialty_tools` mesa-49 ↔ angel-set-49 | 1 linha |

## Validação SQL

### Contagem na origem legada

```sql
select category, count(*)
from radionics_tools
where category in ('angel', 'archangel')
group by category
order by category;
```

### Assets importados

```sql
select ma.asset_type, count(*) as imported_count
from methodology_assets ma
join methodology_tools mt on mt.id = ma.tool_id
where mt.slug = 'angel-set-49'
group by ma.asset_type
order by ma.asset_type;
```

### Media primária

```sql
select count(*) as primary_media_rows
from methodology_asset_media mam
join methodology_assets ma on ma.id = mam.asset_id
join methodology_tools mt on mt.id = ma.tool_id
join radionics_specialties rs on rs.id = mam.specialty_id
where mt.slug = 'angel-set-49'
  and rs.slug = 'mesa-49'
  and mam.is_primary
  and mam.media_type = 'image';
```

### Ligação specialty ↔ tool

```sql
select rs.slug as specialty_slug, mt.slug as tool_slug, st.sort_order
from specialty_tools st
join radionics_specialties rs on rs.id = st.specialty_id
join methodology_tools mt on mt.id = st.tool_id
where rs.slug = 'mesa-49'
order by st.sort_order;
```

### Conteúdo contextual

```sql
select count(*) as specialty_content_rows
from specialty_asset_content sac
join methodology_assets ma on ma.id = sac.asset_id
join methodology_tools mt on mt.id = ma.tool_id
join radionics_specialties rs on rs.id = sac.specialty_id
where mt.slug = 'angel-set-49'
  and rs.slug = 'mesa-49';
```

## NOTICE na migração

Ao aplicar, o bloco PL/pgSQL emite totais de origem, assets, media e content (com `WARNING` se divergirem de 42/7/49).

## Fora de scope

- Workspace continua `TOOLS_RAD49` (mock).
- Rota debug metodologia — sem alterações nesta fase.
- V2.5A (`graph-set-35` / `mesa-35`) — intocado.

## Próximos passos

- V2.5C+: alinhar mock / read layer com 49 slugs Bunny.
- Enriquecer `client_explanation` e `activation_text` por símbolo.

## Validação build

```bash
npm run build
npm run typecheck
npm run lint
```

(Sem alterações TypeScript nesta fase — validação confirma que o repo permanece íntegro.)
