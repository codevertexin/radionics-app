# RADIONICS Methodology Engine — V2.4 Asset Media Layer

## Objetivo

Adicionar suporte a imagens e outros ficheiros para assets do Methodology Engine **sem alterar** workspace, sessões, relatórios ou UI de produção.

## Por que a media é separada dos assets

- O mesmo asset (`methodology_assets`) pode ter representações visuais diferentes consoante **especialidade**, **ferramenta** ou **professor/material**.
- `methodology_assets.image_url` permanece como **fallback legado** apenas — não é removido nem preenchido automaticamente pela camada V2.4.
- A tabela `methodology_asset_media` modela contexto, proveniência (`source_type`), qualidade e CDN (`storage_provider`) de forma independente do catálogo base.

## Tabela: `methodology_asset_media`

| Campo | Notas |
|-------|--------|
| `asset_id` | FK obrigatória para `methodology_assets` |
| `specialty_id` | Opcional — media específica da especialidade |
| `tool_id` | Opcional — media ao nível da ferramenta |
| `media_type` | `image`, `pdf`, `audio`, `video`, `document`, `other` |
| `storage_provider` | `bunny`, `supabase`, `external`, `app_public`, `other` |
| `source_type` | `app_default`, `teacher_original`, `course_material`, … |
| `is_primary` | Um primário por `(asset, specialty scope, tool scope, media_type)` |

Migração: `supabase/migrations/20260531170000_radionics_methodology_asset_media_v2.sql`

## Ordem de resolução (cliente)

Implementada em `src/lib/methodology/mediaResolution.ts` e exposta via `resolvePrimaryAssetMedia()`:

1. **asset + specialty + primary** — `specialty_id` coincide, `is_primary`, `media_type` (default `image`)
2. **asset + tool + primary** — `specialty_id` nulo, `tool_id` = ferramenta do asset
3. **asset global primary** — `specialty_id` e `tool_id` nulos
4. **`methodology_assets.image_url`** — fallback legado no registo do asset
5. **Fallback da app** — placeholder UI (fase futura; hoje `resolution: 'none'`)

## RLS (leitura)

Utilizadores autenticados podem ler quando:

- `source_type = 'app_default'` **e** `quality_status = 'approved'`, **ou**
- `specialty_id` com certificação aprovada, **ou**
- `tool_id` ligado a especialidade certificada (via `specialty_tools`), **ou**
- `is_radionics_admin()`

Escrita: apenas administradores RADIONICS.

## Bunny e proveniência

- `storage_provider = 'bunny'` prepara URLs CDN Bunny sem acoplar o workspace.
- `source_type = 'app_default'` — media curada pela plataforma, visível globalmente quando aprovada.
- `source_type = 'teacher_original'` — material do formador; requer certificação na especialidade (ou admin).

## Camada de leitura (TypeScript)

| Artefacto | Função |
|-----------|--------|
| `MethodologyAssetMedia` | Tipo em `src/types/methodology-engine.ts` |
| `getSpecialtyAssetMedia(slug)` | Lista media dos assets da especialidade |
| `resolvePrimaryAssetMedia(assetId, slug?)` | Resolve URL primária |
| `getSpecialtyMethodologyBundle` | Inclui `assetMedia` e `mediaByAssetId` |

Mock: `getMockMesa35AssetMedia()` devolve `[]` (sem URLs inventadas).

## Debug

`/methodology-debug/:specialtySlug` — contagem de media, estado por asset (`No media configured` ou resolução).

## Próxima fase

- Seed de URLs Bunny para gráficos Mesa 35 (`source_type = 'app_default'`, `storage_provider = 'bunny'`).
- Integração opcional no workspace quando o engine substituir `TOOLS_RAD35`.

## Validação

```bash
npm run build
npm run typecheck
npm run lint
```
