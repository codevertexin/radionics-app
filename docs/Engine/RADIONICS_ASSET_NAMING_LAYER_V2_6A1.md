# RADIONICS — Asset Naming Layer V2.6A.1

## Objetivo

Suportar **vários nomes** para o mesmo asset (pesquisa, workflows, recursos, IA futura) sem alterar frontend, workspace ou importar conteúdo editorial nesta fase.

## Migração

**Ficheiro:** `supabase/migrations/20260531210500_radionics_asset_naming_layer_v2_6a1.sql`

## Colunas em `methodology_assets`

| Coluna | Tipo | Default | Papel |
|--------|------|---------|--------|
| `name` | text (existente) | — | **Nome de exibição na UI** — rótulo humano atual (ex.: «Chakra Básico») |
| `canonical_name` | text | backfill → `name` | **Referência interna oficial** — nome canónico estável para lógica e APIs |
| `original_name` | text | null | **Nome original da fonte** — ex.: nome sânscrito (`Muladhara`) |
| `aliases` | text[] | `'{}'` | **Sinónimos** — nomes alternativos pesquisáveis |

### Semântica

- **`name`** — o que o terapeuta vê na interface; pode manter acentos e convenções de produto.
- **`canonical_name`** — identidade estável para matching interno; após backfill igual a `name` até migrações futuras refinarem.
- **`original_name`** — rastreabilidade à material de formação / legado (Vanessa, MAP, etc.).
- **`aliases`** — array PostgreSQL para GIN search; inclui traduções, nomes populares e rótulos antigos.

## Backfill (migração V2.6A.1)

Para todas as linhas existentes:

| Campo | Valor |
|-------|--------|
| `canonical_name` | `name` (só se `canonical_name` IS NULL) |
| `original_name` | permanece `NULL` |
| `aliases` | `'{}'` (só se `aliases` IS NULL) |

**Não** altera gráficos, anjos ou chakras com aliases sânscritos nesta migração.

## Índices

| Índice | Tipo | Coluna(s) |
|--------|------|-----------|
| `idx_methodology_assets_canonical_name` | B-tree | `canonical_name` |
| `idx_methodology_assets_original_name` | B-tree parcial | `original_name` WHERE NOT NULL |
| `idx_methodology_assets_aliases_gin` | GIN | `aliases` |

Exemplo de pesquisa futura por alias:

```sql
select id, name, canonical_name, aliases
from methodology_assets
where aliases @> array['Muladhara']::text[];
```

## Mapeamento preparado — Chakras (V2.6D+ / migração futura)

Aplicar numa migração posterior sobre assets `chakra-set` (V2.5C). Valores **planeados**, não importados em V2.6A.1:

| `name` (UI) | `original_name` | `aliases` |
|-------------|-----------------|-----------|
| Chakra Básico | Muladhara | Chakra Raiz, Muladhara |
| Chakra Sexual | Swadhisthana | Chakra Sacral, Chakra Esplênico, Chakra Umbilical, Swadhisthana |
| Chakra Plexo Solar | Manipura | Manipura |
| Chakra Cardíaco | Anahata | Anahata |
| Chakra Laríngeo | Vishuddha | Vishuddha |
| Chakra Frontal | Ajna | Terceiro Olho, Ajna |
| Chakra Coronário | Sahasrara | Sahasrara |

Slugs V2.5C: `chakra-basico`, `chakra-sexual`, `chakra-plexo-solar`, `chakra-cardiaco`, `chakra-laringeo`, `chakra-frontal`, `chakra-coronario`.

## Fora de scope (V2.6A.1)

- TypeScript / serviços de leitura
- Workspace e sessões
- Knowledge import (V2.6B/C/D)
- Triggers de sincronização automática `name` → `canonical_name`

## Validação SQL

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'methodology_assets'
  and column_name in (
    'canonical_name',
    'original_name',
    'aliases'
  );
```

**Esperado:** 3 linhas.

```sql
select
  count(*) as total_assets,
  count(*) filter (where canonical_name is not null) as with_canonical,
  count(*) filter (where aliases = '{}') as empty_aliases
from methodology_assets;
```

## Validação build

```bash
npm run build
npm run typecheck
npm run lint
```

## Próximo passo sugerido

Migração **V2.6A.2** ou **V2.6D** — aplicar aliases dos 7 chakras + eventualmente gráficos/anjo com nomes alternativos do legado.
