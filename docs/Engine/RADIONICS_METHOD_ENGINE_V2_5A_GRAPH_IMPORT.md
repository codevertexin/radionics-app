# RADIONICS — Methodology Engine V2.5A: Legacy graph import (35)

## Objetivo

Importar os **35 gráficos** do catálogo legado `radionics_tools` para o Methodology Engine, com imagens Bunny e conteúdo contextual para **mesa-35**, sem duplicar os assets já criados em V2.2 quando o slug coincide.

## Migração

**Ficheiro:** `supabase/migrations/20260531180000_radionics_methodology_graph_import_v2_5a.sql`

**Dependências:** V2.1 (core), V2.2 (mesa-35 seed parcial), V2.4 (`methodology_asset_media`), tabela legada `public.radionics_tools`.

## Origem — `radionics_tools`

| Campo legado | Uso no engine |
|--------------|----------------|
| `code` | Slug do asset: `lower(code)` com `_` → `-` |
| `sort_order` | `methodology_assets.sort_order` e `code` (`lpad`) |
| `image_url` | `methodology_asset_media.url` (Bunny) + fallback `methodology_assets.image_url` |
| `category = 'graphic'` | Filtro de importação (35 linhas no ambiente atual) |
| `is_active` | `methodology_assets.status` |

**Nota:** A tabela legada não tem colunas `name` / `description`; o nome exibe-se via `legacy_tool_code_to_display_name()` (com nomes preservados para slugs que coincidem com V2.2).

## Destino

| Tabela | Regra |
|--------|--------|
| `methodology_assets` | `tool_id` = `graph-set-35`, `asset_type` = `graph`, upsert `(tool_id, slug)` |
| `methodology_asset_media` | `specialty_id` = mesa-35, `is_primary` = true, `storage_provider` = `bunny`, `source_type` = `teacher_original` |
| `specialty_asset_content` | Uma linha por asset ativo; preserva `client_explanation` / `recommended_use` existentes em conflito |

## Idempotência

- Reexecutar a migração **atualiza** assets, media e content pelas mesmas chaves.
- Assets V2.2 que **não** existem no legado (`desobsessao`, `prosperidade`, `amor`, `saude`, `karma`) passam a `inactive` (mantém histórico, não duplica).
- Slugs coincidentes (`anti-magia`, `luxor`, `anti-possessao`) são **atualizados** com URL Bunny e ordem legada.

## Funções auxiliares (SQL)

- `public.legacy_tool_code_to_asset_slug(text)`
- `public.legacy_tool_code_to_display_name(text)`

## Validação pós-migração

Substituir IDs se necessário; os slugs são estáveis.

### Contagem de assets importados (ativos)

```sql
select count(*) as active_graph_assets
from public.methodology_assets ma
join public.methodology_tools mt on mt.id = ma.tool_id
where mt.slug = 'graph-set-35'
  and ma.asset_type = 'graph'
  and ma.status = 'active';
```

**Esperado:** `35`

### Contagem de media primária (mesa-35)

```sql
select count(*) as primary_media_rows
from public.methodology_asset_media mam
join public.methodology_assets ma on ma.id = mam.asset_id
join public.methodology_tools mt on mt.id = ma.tool_id
join public.radionics_specialties rs on rs.id = mam.specialty_id
where mt.slug = 'graph-set-35'
  and rs.slug = 'mesa-35'
  and mam.is_primary = true
  and mam.media_type = 'image'
  and mam.storage_provider = 'bunny'
  and mam.source_type = 'teacher_original';
```

**Esperado:** `35`

### Contagem de specialty_asset_content

```sql
select count(*) as specialty_content_rows
from public.specialty_asset_content sac
join public.methodology_assets ma on ma.id = sac.asset_id
join public.methodology_tools mt on mt.id = ma.tool_id
join public.radionics_specialties rs on rs.id = sac.specialty_id
where mt.slug = 'graph-set-35'
  and rs.slug = 'mesa-35'
  and ma.asset_type = 'graph'
  and ma.status = 'active';
```

**Esperado:** `35`

### Legado vs engine (amostra)

```sql
select
  rt.code as legacy_code,
  public.legacy_tool_code_to_asset_slug(rt.code) as asset_slug,
  ma.name,
  mam.url as bunny_url
from public.radionics_tools rt
left join public.methodology_assets ma
  on ma.slug = public.legacy_tool_code_to_asset_slug(rt.code)
  and ma.tool_id = (select id from public.methodology_tools where slug = 'graph-set-35')
left join public.methodology_asset_media mam
  on mam.asset_id = ma.id
  and mam.is_primary = true
  and mam.media_type = 'image'
where rt.category = 'graphic'
order by rt.sort_order;
```

### NOTICE no `supabase db push` / SQL editor

A migração emite `RAISE NOTICE` com:

- legacy graphic count  
- active graph assets  
- primary media rows  
- specialty content rows  
- placeholders V2.2 desativados  

## Catálogo legado (35 códigos)

Ordem por `sort_order` em `radionics_tools`:

1. anti_possessao · 2. triturador · 3. yoshua · 4. luxor · 5. quadrata · 6. anti_depressao · 7. magnetismo_curativo · 8. turbilhao_jupiter · 9. saude_financeira · 10. piramide_plana_om · 11. dissipador · 12. desimpregnador · 13. justica_divina · 14. sol_da_vida · 15. energizador · 16. anti_dor · 17. anti_magia · 18. iave_sete_circulos · 19. mesa_damien · 20. heptapentagrama · 21. revitalizador_chakras · 22. scap_cabalista · 23. quadrado_magico · 24. sorte_sucesso · 25. cubo_metatron · 26. desembaracador_relacionamentos · 27. prosperador · 28. antakarana · 29. piramide_tao · 30. hexagrama · 31. turbilhao_prosperador · 32. kit_cromo · 33. alta_vitalidade · 34. cruz_ansata · 35. vesica_piscis  

URLs: `https://radionics.b-cdn.net/tools/map_outros/graphics/{code}.jpg`

## Fora de scope

- Workspace continua `TOOLS_RAD35` (8 itens mock) até fase de ligação ao engine.
- Textos ricos (`client_explanation`) para gráficos novos — fase editorial posterior.
- Hawkins / chakra — inalterados.

## Próximos passos

- V2.5B: alinhar mock/app com os 35 slugs Bunny.
- Enriquecer `specialty_asset_content` por gráfico.
- Opcional: `source_type = app_default` para subset curado pela plataforma.
