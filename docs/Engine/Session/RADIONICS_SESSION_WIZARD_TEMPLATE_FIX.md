# RADIONICS — Correção do passo «Escolher template» (wizard nova sessão)

## Problema

Em `/sessions/new`, o passo 1 listava especialidades com certificação **approved**, mas o passo 2 «Escolher template» ficava vazio ao escolher uma especialidade (sobretudo em `VITE_DATA_MODE=supabase`, onde `specialty.id` é UUID).

## Origem dos templates

| Fonte | Estado |
|-------|--------|
| Supabase `radionics_session_templates` | **Não usado** (fora de scope) |
| `templatesService` dedicado | **Não existe** |
| Array `TEMPLATES` em `src/data/mock-data.ts` | **Fonte atual** |

O wizard importa a lógica via `src/lib/sessionTemplates.ts`, que filtra `TEMPLATES`.

## Associação especialidade ↔ template

Ordem de correspondência em `templateMatchesSpecialty()`:

1. `template.specialtyIds` inclui `specialty.id` (UUID Supabase ou `spec-*` mock)
2. `template.specialtySlugs` inclui `specialty.slug` (`map`, `mesa-35`, `mesa-49`, …)
3. **Fallback:** `template.methodologyId === resolveSpecialtyToMethodologyId(specialty)`

`resolveSpecialtyToMethodologyId()` mapeia slugs do seed Supabase e IDs mock legados para chaves internas de sessão:

| Slug / ID legado | Chave `methodologyId` |
|------------------|------------------------|
| `map` / `spec-map` | `meth-map` |
| `mesa-35` / `spec-rad35` | `meth-rad35` |
| `mesa-49` / `spec-rad49` | `meth-rad49` |

`createSession()` continua a receber `specialtyId` como `meth-*` (compatível com `METHODOLOGIES` em mock).

## Templates mínimos garantidos

| Especialidade | Template(s) em mock |
|---------------|---------------------|
| MAP | `tmpl-map-official` (novo) |
| Mesa dos 35 Gráficos | `tmpl-rad35-official`, `tmpl-rad35-express` |
| Mesa dos 49 Símbolos | `tmpl-rad49-official` |

## UI — estado vazio

Se não houver templates após o filtro:

- Mensagem: «Nenhum template disponível para esta especialidade.»
- Subtexto: «Crie um template ou escolha outra especialidade.»
- Ações: link para `/templates/new` e botão para voltar ao passo especialidade.

## Ficheiros alterados

- `src/lib/sessionTemplates.ts` — resolução e filtro
- `src/pages/sessions/NewSessionPage.tsx` — wizard + empty state
- `src/data/mock-data.ts` — template MAP + `specialtySlugs` / `specialtyIds`
- `src/types/index.ts` — campos opcionais no tipo `Template`

## Fora de scope

- Persistência de templates em Supabase
- Alterações em `sessionsService` para Supabase

## Validação

```bash
npm run build
npm run typecheck
npm run lint
```
