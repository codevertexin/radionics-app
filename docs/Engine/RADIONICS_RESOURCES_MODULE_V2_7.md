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

## Fora de scope

Workspace, sessões, relatórios, AI, execução de protocolos, booking, gestão de clientes.
