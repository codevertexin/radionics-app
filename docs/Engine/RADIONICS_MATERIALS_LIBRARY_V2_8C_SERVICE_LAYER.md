# RADIONICS — Materials Library V2.8C: Service Layer

**Status:** Implemented  
**Schema:** `docs/Engine/RADIONICS_MATERIALS_LIBRARY_V2_8B_SCHEMA.md`  
**Architecture:** `docs/Engine/RADIONICS_MATERIALS_LIBRARY_V2_8A.md`

---

## Objetivo

Camada de serviço read-only para a Materials Library, integrada no módulo Resources sem UI nem seeds SQL.

---

## Ficheiros

| Ficheiro | Função |
|----------|--------|
| `src/types/materials-library.ts` | Tipos TypeScript |
| `src/lib/materials/materialsErrors.ts` | Erros e mapeamento Supabase |
| `src/lib/materials/materialGrouping.ts` | `groupMaterialsByType` |
| `src/lib/materials/mockMaterials.ts` | Mock Mesa 35 / Mesa 49 |
| `src/lib/supabase/materialsLibraryMappers.ts` | Row → domain mappers |
| `src/services/supabase/materialsLibrarySupabase.ts` | Queries Supabase |
| `src/services/materialsLibraryService.ts` | API pública do serviço |

---

## Funções do serviço

| Função | Descrição |
|--------|-----------|
| `listMaterialsForSpecialty(specialtySlug)` | Materiais ativos com link `specialty` ativo; exige certificação aprovada |
| `getMaterialBySlug(slug)` | Um material se legível (`null` se inexistente ou RLS nega) |
| `listMaterialLinks(materialId)` | Links ativos do material (se material legível) |
| `searchMaterials(query, options?)` | Pesquisa por título, descrição, `source_name`, `material_type`, `language` |
| `groupMaterialsByType(materials)` | Agrupa: PDFs, Imagens, Vídeos, Áudios, Links, Documentos, Outros |
| `getMaterialBundleBySlug(slug)` | Helper material + links (para V2.8D) |

---

## Integração Resources

`resourceLibraryService.getSpecialtyResources()` chama `listMaterialsForSpecialty()` para `materialCount`.

- Tab **Materiais** aparece quando `materialCount > 0` (`ResourceSpecialtyTabs`).
- `ResourceMaterialsPage` permanece placeholder — pronta para consumir o serviço em V2.8D.

---

## Comportamento mock

| Especialidade | Materiais |
|---------------|-----------|
| Mesa 35 | 1 PDF amostra (`mesa-35-manual-amostra`) |
| Mesa 49 | 1 PDF amostra (`mesa-49-guia-amostra`) |
| Apometria | 0 |

Sem `file_url` real — apenas metadados para desenvolvimento.

---

## Comportamento Supabase / RLS

- Queries em `library_materials` e `library_material_links`.
- Listagem por especialidade: links `target_type = specialty` + `target_id` = specialty UUID.
- **RLS** aplica `can_read_library_material()` — terapeuta só vê materiais com grant specialty + certificação.
- Links `asset` / `protocol` **não** concedem acesso em v1 (apenas contexto futuro).
- Erros RLS → `MATERIAL_FORBIDDEN`.
- Tabela em falta → `MATERIALS_SCHEMA_MISSING`.

---

## Erros

| Código | Quando |
|--------|--------|
| `MATERIALS_NOT_AVAILABLE` | Modo inválido / erro genérico Supabase |
| `MATERIAL_NOT_FOUND` | Material inexistente (links) |
| `MATERIAL_FORBIDDEN` | Sem certificação ou RLS |
| `MATERIALS_SCHEMA_MISSING` | Migração V2.8B não aplicada |

---

## Fora de âmbito (V2.8C)

- Upload / admin
- Storage bucket
- Seeds SQL
- UI tab Materiais (lista/detalhe)
- Pesquisa global em `searchResources()` (pode unificar em fase futura)

---

## Próxima fase — V2.8D UI

- Substituir placeholder `ResourceMaterialsPage`
- Cards por `groupMaterialsByType`
- Detalhe / abrir PDF / link externo
- Materiais relacionados em asset/protocol detail (links contextuais)

---

## Fases seguintes

| Fase | Conteúdo |
|------|----------|
| **V2.8E** | Seeds SQL |
| **V2.8F** | Admin / upload / Bunny storage |
