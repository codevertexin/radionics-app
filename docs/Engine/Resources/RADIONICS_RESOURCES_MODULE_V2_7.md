# RADIONICS — Resources Module V2.7

## Princípio

```
Certificação → Recursos → Conhecimento → Sessão (opcional)
```

O módulo Resources é **independente do Workspace** — consulta read-only da knowledge layer.

---

## V2.7A — Resource Service Layer

**Ficheiro:** `src/services/resourceLibraryService.ts`

| Função | Descrição |
|--------|-----------|
| `getAvailableSpecialties()` | Especialidades com certificação `approved` |
| `getSpecialtyResources(slug)` | Resumo (counts) |
| `getSpecialtyAssets(slug)` | Assets enriquecidos (imagem, content, naming) |
| `getSpecialtyProtocols(slug)` | Protocolos activos |
| `getSpecialtyActivationScripts(slug)` | Scripts de ativação ligados ao content |
| `searchResources(query, options?)` | Pesquisa cross-specialty certificada |

**Supabase:** `src/services/supabase/resourceLibrarySupabase.ts`
**Search:** `src/lib/resources/resourceSearch.ts`
**Reutiliza:** `methodologyEngineService` para tools, assets, content, media.

### Campos de pesquisa (V2.7C)

- `name`
- `canonical_name`
- `original_name`
- `aliases`

Normalização: case-insensitive, sem acentos. Preparado para FTS/AI search futuro via `ResourceSearchOptions`.

---

## V2.7B — Resources Pages

| Rota | Página |
|------|--------|
| `/resources` | Home — cards por especialidade certificada |
| `/resources/:specialtySlug` | Redirect → assets |
| `/resources/:specialtySlug/assets` | Grelha de assets + search |
| `/resources/:specialtySlug/assets/:assetSlug` | Detalhe do asset |
| `/resources/:specialtySlug/protocols` | Lista de protocolos |
| `/resources/:specialtySlug/protocols/:protocolSlug` | Detalhe (purpose, why, steps, assets) |
| `/resources/:specialtySlug/activations` | Scripts agrupados por tipo |
| `/resources/:specialtySlug/materials` | Placeholder |

**Permissões:** sem certificação aprovada → `CertificationRequired` (403 UX) com link para `/certifications`. RLS Supabase como segunda linha de defesa.

---

## V2.7 — RLS migration

**Ficheiro:** `supabase/migrations/20260531260000_radionics_resource_library_rls_v2_7.sql`

Permite leitura de `activation_scripts` e `activation_script_links` a terapeutas certificados quando ligados a `specialty_asset_content` da sua especialidade.

---

## Validação manual (mock)

Terapeuta mock com Mesa 35 + Mesa 49 aprovadas:

1. Abrir **Recursos** na sidebar
2. Entrar em **Mesa 35** → Assets
3. Pesquisar `Muladhara` → **Chakra Básico**
4. Entrar em **Mesa 49** → Protocolos → **Prosperidade e Abundância**
5. Ver: Para quê, Por que ativar, passos, anjos/gráficos

```bash
npm run typecheck
npm run build
npm run lint
```

## V2.7 UX polish (fecho)

### Hawkins
- Níveis individuais da escala Hawkins **não aparecem** como cards em Recursos (`hawkins-scale` / `asset_type = hawkins_level`).
- Dados permanecem na metodologia para sessões e workflows.
- Futuro: um único media asset «Escala de Hawkins» / «Biômetro Hawkins».

### Therapist UI
- Link retroceder: **← Voltar** (detalhe de asset, protocolo).
- Ativações: só título = nome do asset; sem `sourceName` / `sourceReference` / nome duplicado do script.
- Imagens de ativação: moldura quadrada, `object-fit: contain`, fundo neutro.

### Exportação PDF terapêutica

| Campo | Semântica |
|-------|-----------|
| `image_url` | Imagem de **visualização** (Recursos, sessões, ativações) |
| `print_image_url` | **Layout final de impressão** preparado pelo admin/designer |

Exemplo:
- `image_url`: `tools/map_outros/graphics/alta_vitalidade.jpg`
- `print_image_url`: `prints/graphs/alta-vitalidade-emissor.svg`

- Conceito primário: **tamanho físico de impressão** (selector UI: 21 / 25 / 31 cm), não A4.
- **Um layout de impressão** (`print_image_url`) → vários PDFs conforme tamanho selecionado (21×21, 25×25, 31×31 cm).
- **SVG (layout final):** colocado full-bleed no PDF via `svg2pdf.js` + `jspdf`; **sem** reconstruir título/margens/gráfico.
- **PNG/JPG (layout preparado):** `pdf-lib` full-bleed; validação de DPI; sem upscale silencioso.
- **Produção:** sem `print_image_url` → botão **Exportar PDF** desativado + «Versão de impressão ainda não disponível.»; sem avisos técnicos ao terapeuta.
- **DEV:** fallback para `image_url` permitido (com aviso técnico); rota `/print` para pré-visualização/debug.
- Metadata (sem migração): `print_image_url`, `print_asset_type`, `print_max_size_cm`, `print_size_cm`, `print_dpi`, `print_layout`.
- Pipeline extensível a gráficos, anjos, chakras, MAP (`THERAPEUTIC_PDF_ASSET_TYPES`).
- UI: `TherapeuticPrintSizeSelector` + **Exportar PDF**.

## V2.7 UX — Agrupamento e pesquisa

### Assets (`/resources/:slug/assets`)
- Agrupamento por `methodology_tools.slug`: Gráficos, Chakras, Anjos/Arcanjos, Hawkins
- Filtro secundário por grupo (chips)
- Cards: imagem, nome, `original_name`, aliases, preview de `activation_text`

### Ativações
- Agrupamento: Gráficos, Anjos, Arcanjos, Chakras
- Layout com imagem do asset + texto + proveniência

### Protocolos
- `searchProtocols()` — nome, description, why_activate, assets ligados (nome/aliases/original_name)

### Tabs
- Ocultas quando count = 0; mensagem se todos zero

### Helpers
- `src/lib/resources/resourceGrouping.ts` — `groupAssetsByTool`, `groupActivationsByTool`
- `src/lib/resources/protocolSearch.ts` — `searchProtocols`, `matchProtocolWithAssets`

