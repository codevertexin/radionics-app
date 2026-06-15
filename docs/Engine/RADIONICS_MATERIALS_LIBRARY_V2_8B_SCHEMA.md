# RADIONICS — Materials Library V2.8B: Schema

**Status:** Implemented  
**Migration:** `supabase/migrations/20260531270000_radionics_materials_library_schema_v2_8b.sql`  
**Architecture:** `docs/Engine/RADIONICS_MATERIALS_LIBRARY_V2_8A.md`

---

## Objetivo

Criar o schema da **Materials Library** (recursos educacionais/de apoio) e RLS básico, separado de `methodology_assets`.

Sem seeds, storage, upload ou UI nesta fase.

---

## Decisões V2.8B (aprovadas)

| Decisão | Valor |
|---------|--------|
| `slug` | Global e único |
| Autorização v1 | Pelo menos um link `target_type = specialty` ativo |
| Links `asset` / `protocol` | Contexto UI futuro — **não** concedem acesso em v1 |
| `public_preview` | Fora de âmbito v1 |
| `visibility` v1 | `certified_only`, `admin_only` |

---

## Tabelas criadas

### `library_materials`

Catálogo canónico — um registo por recurso (PDF, vídeo, link, etc.).

| Destaque | Valores |
|----------|---------|
| `material_type` | `pdf`, `image`, `video`, `audio`, `link`, `document`, `other` |
| `source_type` | `teacher`, `official`, `app_created`, `external`, `course_material`, `imported` |
| `visibility` | `certified_only`, `admin_only` |
| `status` | `active`, `inactive`, `draft`, `archived` |
| Unique | `slug` (global) |
| Trigger | `trg_library_materials_updated_at` |

**Semântica:**

- `file_url` — conteúdo do material (CDN); não confundir com `image_url` de assets.
- `external_url` — destino para tipo `link` ou embed.

### `library_material_links`

Associações many-to-many material ↔ entidade.

| Destaque | Valores |
|----------|---------|
| `target_type` | `specialty`, `asset`, `protocol` |
| `status` | `active`, `inactive` |
| Unique | `(material_id, target_type, target_id)` |
| Trigger | `trg_library_material_links_updated_at` |

**V1:** só links `specialty` com certificação aprovada desbloqueiam leitura ao terapeuta.

---

## Função RLS

### `can_read_library_material(material_id uuid)`

Retorna `true` quando:

1. **Admin** (`is_radionics_admin()`), ou
2. Material `status = active` **e** `visibility = certified_only` **e** existe link ativo:
   - `target_type = specialty`
   - `has_approved_specialty_certification(target_id)`

Materiais `admin_only`, `draft`, ou sem link specialty ativo → terapeuta **não** lê.

---

## Políticas RLS

### `library_materials`

| Política | Operação | Quem |
|----------|----------|------|
| `library_materials_admin_select` | SELECT | Admin |
| `library_materials_admin_insert` | INSERT | Admin |
| `library_materials_admin_update` | UPDATE | Admin |
| `library_materials_admin_delete` | DELETE | Admin |
| `library_materials_select_certified_or_admin` | SELECT | `can_read_library_material(id)` |

### `library_material_links`

| Política | Operação | Quem |
|----------|----------|------|
| `library_material_links_admin_*` | CRUD | Admin |
| `library_material_links_select_certified_or_admin` | SELECT | `can_read_library_material(material_id)` |

Terapeutas: **sem** INSERT/UPDATE/DELETE.

---

## Por que o link specialty é obrigatório em v1

1. **Autorização explícita** — evita inferir especialidade via asset/protocol (ambiguidade multi-especialidade).
2. **RLS simples e auditável** — uma regra: certificação na specialty ligada.
3. **Links asset/protocol** reservados para navegação contextual (ex.: «manual deste gráfico») na UI V2.8D, sem abrir acesso por derivacao.

Fase futura pode relaxar ou adicionar grants derivados; v1 mantém modelo conservador.

---

## Índices

| Tabela | Índice |
|--------|--------|
| `library_materials` | `slug`, `material_type`, `visibility`, `status` |
| `library_material_links` | `material_id`, `(target_type, target_id)`, `status` |
| `library_material_links` | Parcial `(material_id, target_id)` WHERE specialty + active |

---

## Fora de âmbito (V2.8B)

- Upload / admin panel
- Storage bucket
- Seeds / import SQL
- UI `/resources/:slug/materials`
- Service layer TypeScript
- Validação polimórfica por trigger em `target_id`
- `public_preview`

---

## Próximas fases

| Fase | Conteúdo |
|------|----------|
| **V2.8C** | Service layer — `getSpecialtyMaterials`, types, mock, `materialCount` |
| **V2.8D** | UI — tab Materiais, cards, detalhe, links contextuais |
| **V2.8E** | Seeds — handbooks, PDFs de curso |
| **V2.8F** | Admin / upload / storage Bunny |

---

## Dependências

Reutiliza (não recria):

- `public.is_radionics_admin()`
- `public.has_approved_specialty_certification(uuid)`
- `public.set_updated_at()`

---

## Validação SQL (manual pós-apply)

```sql
-- Estrutura
select table_name from information_schema.tables
where table_schema = 'public' and table_name like 'library_material%';

-- RLS ativo
select relname, relrowsecurity from pg_class
where relname in ('library_materials', 'library_material_links');
```
