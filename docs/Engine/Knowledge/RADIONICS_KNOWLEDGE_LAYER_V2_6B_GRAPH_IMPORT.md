# RADIONICS — Knowledge Layer V2.6B: Graph knowledge import (Mesa 35)

## Validação da fonte (pré-migração)

**Ficheiro:** `docs/knowledge/vanessa/GRAFICOS MESA.txt`

| Verificação | Resultado |
|-------------|-----------|
| Estrutura | 35 blocos numerados (`1.` … `35.`) |
| Campos por entrada | `• O que é:` · `• O que informar ao cliente` · `Ativação do gráfico:` |
| Conteúdo inventado | **Nenhum** — texto extraído integralmente do ficheiro |
| Entradas encontradas | **35** |

## Migração

**Ficheiro:** `supabase/migrations/20260531220000_radionics_graph_knowledge_import_v2_6b.sql`

**Gerador (reimportar a partir da fonte):** `scripts/generate-v26b-graph-knowledge.mjs`

```bash
node scripts/generate-v26b-graph-knowledge.mjs
```

**Dependências:** V2.5A (35 gráficos ativos em `graph-set-35`), V2.6A (colunas de proveniência).

## Mapeamento slug (ordem do ficheiro ↔ V2.5A)

| # | Título no ficheiro | `methodology_assets.slug` |
|---|-------------------|---------------------------|
| 1 | Anti Possessão | `anti-possessao` |
| 2 | Triturador | `triturador` |
| 3 | Yoshua | `yoshua` |
| 4 | Luxor | `luxor` |
| 5 | Quadrata | `quadrata` |
| 6 | Anti Depressão | `anti-depressao` |
| 7 | Magnetismo Curativo | `magnetismo-curativo` |
| 8 | Turbilhão Júpiter | `turbilhao-jupiter` |
| 9 | Saúde Financeira | `saude-financeira` |
| 10 | Pirâmide Plana com OM | `piramide-plana-om` |
| 11 | Dissipador | `dissipador` |
| 12 | Desimpregnador | `desimpregnador` |
| 13 | Justiça Divina | `justica-divina` |
| 14 | Sol da Vida | `sol-da-vida` |
| 15 | Energizador | `energizador` |
| 16 | Anti Dor | `anti-dor` |
| 17 | Anti Magia | `anti-magia` |
| 18 | Iavé – Sete Círculos | `iave-sete-circulos` |
| 19 | Mesa Damien | `mesa-damien` |
| 20 | Heptapentagrama | `heptapentagrama` |
| 21 | Revitalizador de Chakras | `revitalizador-chakras` |
| 22 | Scap Cabalístico | `scap-cabalista` |
| 23 | Quadrado Mágico | `quadrado-magico` |
| 24 | Sorte e Sucesso | `sorte-sucesso` |
| 25 | Cubo de Metatron | `cubo-metatron` |
| 26 | Desembaraçador de Relacionamentos | `desembaracador-relacionamentos` |
| 27 | Prosperador | `prosperador` |
| 28 | Antakarana | `antakarana` |
| 29 | Pirâmide Tao | `piramide-tao` |
| 30 | Hexagrama | `hexagrama` |
| 31 | Turbilhão Prosperador | `turbilhao-prosperador` |
| 32 | Kit Cromo | `kit-cromo` |
| 33 | Alta Vitalidade | `alta-vitalidade` |
| 34 | Cruz Ansata (Ankh) | `cruz-ansata` |
| 35 | Vesica Piscis | `vesica-piscis` |

## Destinos

### `specialty_asset_content` (mesa-35)

| Campo | Origem / valor |
|-------|----------------|
| `therapist_explanation` | `• O que é:` |
| `client_explanation` | `• O que informar ao cliente` |
| `activation_text` | `Ativação do gráfico:` |
| `source_name` | `Vanessa` |
| `source_type` | `course_material` |
| `source_reference` | `GRAFICOS MESA.txt` |
| `content_version` | `v1` |
| `is_app_adapted` | `false` |
| `is_active` | `true` |

Upsert: `(specialty_id, asset_id)`.

### `activation_scripts`

| Campo | Valor |
|-------|--------|
| `name` | `Ativação — {asset name}` |
| `slug` | `ativacao-{asset_slug}` |
| `script_type` | `activation` |
| `content` | texto de ativação do ficheiro |
| Proveniência | igual ao content acima |

Upsert: `(slug)`.

### `activation_script_links`

- `target_type` = `specialty_asset_content`
- `target_id` = id da linha de content do gráfico
- Idempotência: remove links existentes deste import (`source_reference = GRAFICOS MESA.txt`) e recria 35

## Slugs em falta

Se algum dos 35 slugs não existir em `methodology_assets` (ativo, `graph-set-35`), a migração emite **`RAISE WARNING`** com a lista e continua para os restantes.

## Resultado esperado

| Métrica | Esperado |
|---------|----------|
| `graph_content_rows` | **35** |
| `graph_activation_scripts` | **35** |
| `graph_activation_links` | **35** |

## Validação SQL

```sql
select count(*) as graph_content_rows
from specialty_asset_content sac
join methodology_assets ma on ma.id = sac.asset_id
join methodology_tools mt on mt.id = ma.tool_id
join radionics_specialties rs on rs.id = sac.specialty_id
where mt.slug = 'graph-set-35'
  and rs.slug = 'mesa-35'
  and ma.asset_type = 'graph'
  and sac.is_active = true
  and sac.therapist_explanation is not null
  and sac.client_explanation is not null
  and sac.activation_text is not null;
```

```sql
select count(*) as graph_activation_scripts
from activation_scripts
where source_reference = 'GRAFICOS MESA.txt'
  and script_type = 'activation'
  and is_active = true;
```

```sql
select count(*) as graph_activation_links
from activation_script_links asl
join activation_scripts s on s.id = asl.activation_script_id
where s.source_reference = 'GRAFICOS MESA.txt'
  and asl.target_type = 'specialty_asset_content';
```

## Fora de scope

- `methodology_protocols` / `protocol_steps` (V2.6E)
- Frontend, workspace, sessões, relatórios
- Alteração aos assets V2.5A (apenas knowledge overlay)

## Próximas fases

- **V2.6C** — Angel knowledge import
- **V2.6D** — Chakra knowledge import
- **V2.6E** — Protocol import

## Validação build

```bash
npm run build
npm run typecheck
npm run lint
```
