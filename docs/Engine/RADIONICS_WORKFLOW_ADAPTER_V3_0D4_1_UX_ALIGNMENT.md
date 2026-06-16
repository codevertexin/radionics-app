# RADIONICS — Workflow Adapter V3.0D.4.1 UX Alignment

**Fase:** V3.0D.4.1 — polish pós-integração workspace (Mesa 35 workflow)  
**Data:** 2026-06-15  
**Escopo:** UX + alinhamento de dados. Sem alterações a schema, persistência, adapter ou relatórios.

---

## Problemas descobertos

### 1. Diagnóstico mostrava 8 gráficos legados

**Causa raiz (dupla):**

| Camada | Problema |
|--------|----------|
| **Gating UI** | `workflowActive` exigia adapter **e** bundle de assets. Enquanto assets carregavam (ou se o adapter ainda não estava pronto), o diagnóstico caía no fallback `getToolsByMethodology()` → **8** entradas `TOOLS_RAD35`. |
| **Mock data** | `mockMesa35Data.ts` usava `TOOLS_RAD35` + `PLACEHOLDER_GRAPH_IMAGE` (Unsplash) para 27 gráficos fora do catálogo legado de 8. `getMockMesa35AssetMedia()` devolvia `[]`, pelo que a resolução de media não coincidia com Resources. |
| **Loader workspace** | `mesa35WorkspaceAssets.ts` chamava `methodologyEngineService` diretamente em vez de `resourceLibraryService.getSpecialtyAssets()` — caminho diferente do módulo Resources (sem `imageUrlResolved` unificado). |

### 2. Conhecimento e ativações incompletos no mock

- `MOCK_MESA35_ASSET_CONTENT` tinha descrições genéricas para a maioria dos gráficos.
- `MOCK_ACTIVATION_SCRIPTS` tinha apenas Luxor + 1 chakra.

### 3. Terminologia técnica no wizard

- «Fluxo recomendado», «Workflow · v1», «Modelo» expostos ao terapeuta.

---

## Correções de source-of-truth

### Imagens (paridade V2.5A / Resources)

- Novo helper: `mesa35GraphMedia.ts` → URLs Bunny `https://radionics.b-cdn.net/tools/map_outros/graphics/{code}.jpg`
- `mockMesa35Data.ts`: 35 assets com CDN, sem `TOOLS_RAD35` nem placeholders Unsplash
- `getMockMesa35AssetMedia()`: 35 linhas de media primária Bunny (como Supabase V2.5A)

### Conhecimento (paridade V2.6B)

- Gerado `mesa35GraphKnowledge.ts` a partir de `docs/knowledge/vanessa/GRAFICOS MESA.txt` (35 entradas)
- `specialty_asset_content` mock usa `therapistExplanation`, `clientExplanation`, `activationText` reais
- `MOCK_ACTIVATION_SCRIPTS`: 35 scripts de ativação alinhados com knowledge

### Workspace loader

- `loadMesa35WorkspaceBundle()` usa **`resourceLibraryService.getSpecialtyAssets('mesa-35')`** — mesma fonte que Resources
- Resolução: `imageUrlResolved` → `imageUrl` → CDN
- Nomes: `canonicalName` → `name`
- Conteúdo drawer: `therapistExplanation` (O que faz), `clientExplanation`/`recommendedUse` (Quando usar), `activationText`/scripts (Ativação)

### Gating UI (WorkspacePage)

| Flag | Uso |
|------|-----|
| `workflowAssetsReady` | Diagnóstico / Ativações / tool metadata |
| `workflowPersistActive` | `workflowState` + `legacyBridge` + stage completion |

Assets carregam com `useMesa35WorkflowAssets(isWorkflowM35)` **sem** depender do adapter.

---

## Decisões de UX (terminologia)

| Antes | Depois |
|-------|--------|
| Fluxo recomendado | **Recomendado** |
| Modelos clássicos | **Outros tipos** |
| Template (step) | **Tipo de sessão** |
| Fluxo / Modelo (confirm) | **Tipo de sessão** |
| Mesa 35 — Sessão completa (card) | **Sessão Completa** + badge Recomendado |
| Mesa 35 — Template Oficial | **Sessão Completa** |
| Mesa 35 — Sessão Express | **Sessão Express** |
| Workflow · v1 | *(removido da UI)* |

Camada: `src/lib/sessionWizardDisplay.ts` — slugs/IDs internos inalterados.

### Mensagem de ativação em falta

- Antes: `Script não disponível`
- Depois: `Esta ativação ainda não possui um texto orientador disponível.`

Constante: `MESA35_ACTIVATION_UNAVAILABLE` em `mesa35WorkspaceCopy.ts`

---

## Limitações conhecidas (restantes)

1. **Modo mock** — dados gerados localmente; em `VITE_DATA_MODE=supabase` a fonte é BD real (V2.5A/V2.6B).
2. **Chakras mock** — ainda 2 chakras no mock (V2.5C parcial).
3. **Sessões legadas** — continuam com 8 gráficos `TOOLS_RAD35` (comportamento intencional).
4. **Relatório** — snapshot legado; enriquecimento workflow fica para fase posterior.
5. **Regenerar knowledge** — `node scripts/generate-mesa35-graph-knowledge.mjs` após alterar `GRAFICOS MESA.txt`.

---

## Ficheiros alterados (D.4.1)

| Ficheiro | Alteração |
|----------|-----------|
| `mesa35GraphMedia.ts` | URLs Bunny |
| `mesa35GraphKnowledge.ts` | Knowledge V2.6B (gerado) |
| `mockMesa35Data.ts` | 35 gráficos reais, media, content |
| `mockResourceLibraryData.ts` | 35 activation scripts |
| `mesa35WorkspaceAssets.ts` | Resources service como fonte |
| `mesa35WorkspaceCopy.ts` | Mensagem amigável |
| `sessionWizardDisplay.ts` | Copy terapeuta |
| `NewSessionPage.tsx` | UX wizard |
| `WorkspacePage.tsx` | Gating + loading + imagens |
| `scripts/generate-mesa35-graph-knowledge.mjs` | Gerador knowledge |

---

## Validação manual sugerida

- [ ] Nova sessão: sem «workflow» / «fluxo» visível
- [ ] Cards: Sessão Completa (Recomendado) + Sessão Express
- [ ] Diagnóstico workflow: **35** símbolos radiônicos Bunny
- [ ] Detalhe Luxor: texto V2.6 (O que faz / Quando usar / Ativação)
- [ ] Ativações: script real + fallback amigável se ausente
- [ ] Sessão legada: ainda funciona (8 gráficos)
- [ ] Relatório abre

---

## Validação automatizada

```bash
npm run typecheck
npm run build
npm run lint
```
