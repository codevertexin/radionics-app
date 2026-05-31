# RADIONICS_DATA_MODEL_V2.md

# Data Model V2

## Objetivo

Este documento define o modelo de dados V2 da RADIONICS.

A RADIONICS já possui uma base existente no Supabase. O objetivo da V2 não é recriar tudo, mas consolidar o que já existe, corrigir redundâncias e adicionar as estruturas necessárias para suportar:

* metodologias
* templates
* sessões guiadas
* resultados por passo
* relatórios automáticos
* clientes sem email
* evolução terapêutica

---

# Princípios Gerais

## 1. Não duplicar o que já existe

Tabelas existentes devem ser reutilizadas sempre que estiverem alinhadas com a arquitetura V2.

---

## 2. `radionics_tables` é a fonte principal das metodologias

A V2 deve tratar `radionics_tables` como a entidade principal para:

* MAP
* Mesa dos 35 Gráficos
* Mesa dos 49 Símbolos Angelicais
* futuras metodologias

`radionics_therapy_types` deve ser tratado como legacy.

---

## 3. O cliente é global

A RADIONICS não deve ter uma tabela isolada de clientes.

Deve usar:

* `clients`
* `therapist_clients`

---

## 4. O email não é obrigatório

O cliente pode existir apenas como contacto terapêutico.

Campos mínimos:

* nome

Campos opcionais:

* email
* WhatsApp
* Telegram
* telefone
* data de nascimento

---

## 5. O template define recolha e apresentação

Templates não alteram a metodologia.

Templates definem:

* blocos
* campos
* ordem
* obrigatoriedade
* visibilidade na sessão
* visibilidade no relatório
* visibilidade no HUB

---

## 6. A sessão guarda tudo ao longo do processo

A sessão deve ser persistida continuamente.

O relatório nasce dos dados guardados na sessão.

---

# Entidades Principais

```text
radionics_tables
↓
radionics_session_templates
↓
radionics_template_blocks
↓
radionics_template_fields
↓
sessions
↓
radionics_session_details
↓
radionics_session_step_results
↓
radionics_reports
```

---

# 1. Metodologias

## Tabela existente

`radionics_tables`

## Responsabilidade

Representa cada metodologia/mesa disponível na RADIONICS.

Exemplos:

* MAP
* RAD_35
* RAD_49

## Deve conter

* id
* app_code
* code
* name
* description
* image_url
* sort_order
* requires_certification
* is_active
* created_at

## Regra

Novo frontend deve usar `radionics_tables`.

Não deve usar `radionics_therapy_types`.

---

# 2. Ferramentas

## Tabelas existentes

* `radionics_tools`
* `radionics_tool_translations`
* `radionics_tool_table_map`

## Responsabilidade

Representar ferramentas utilizáveis dentro das metodologias.

Exemplos:

* gráficos
* símbolos angelicais
* chakras
* Hawkins
* protocolos
* causas emocionais

## Conteúdo operacional esperado

Cada ferramenta deve poder apresentar:

* imagem
* nome
* descrição
* o que faz
* exemplo de utilização
* ativação sugerida

---

# 3. Certificações e Mesas do Terapeuta

## Tabelas existentes

* `radionics_therapist_certifications`
* `radionics_therapist_tables`
* `radionics_usable_therapist_tables`

## Responsabilidade

Controlar que metodologias o terapeuta pode usar.

## Regra

O terapeuta só pode ativar uma mesa/metodologia se tiver certificação aprovada, quando exigido.

A view `radionics_usable_therapist_tables` calcula o que está utilizável com base nos entitlements ativos.

---

# 4. Clientes

## Tabelas existentes

* `clients`
* `therapist_clients`

## Responsabilidade

`clients` representa o cliente global.

`therapist_clients` representa a relação terapeuta-cliente.

## Regra de criação

Ao criar cliente na RADIONICS:

1. verificar se cliente compatível já existe
2. criar ou reutilizar cliente global
3. criar relação terapeuta-cliente
4. mostrar sempre: “Cliente criado com sucesso.”

## Cliente sem email

Deve ser permitido.

Email é útil para:

* envio de relatório
* convite HUB
* ligação futura a conta HUB

Mas não é obrigatório.

## Ajuste necessário

Se `clients.birth_date` estiver obrigatório, deve passar a ser opcional.

---

# 5. Templates

## Nova tabela

`radionics_session_templates`

## Responsabilidade

Representar templates de sessão/relatório.

## Campos sugeridos

```sql
id uuid primary key default gen_random_uuid(),
app_code app_code not null default 'RADIONICS',
therapist_id uuid null references auth.users(id) on delete cascade,
table_id uuid not null references public.radionics_tables(id),
name text not null,
description text,
is_base_template boolean not null default false,
source_template_id uuid null references public.radionics_session_templates(id),
status text not null default 'active',
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
```

## Regras

* `therapist_id = null` significa template base oficial.
* `therapist_id not null` significa template personalizado.
* Templates base não devem ser editáveis pelo terapeuta.
* Templates personalizados podem ser editados pelo terapeuta.
* Templates podem ser duplicados.

---

# 6. Blocos de Template

## Nova tabela

`radionics_template_blocks`

## Responsabilidade

Representar grupos de informação dentro de um template.

Exemplos:

* Identificação do Cliente
* Queixa Principal
* Histórico Energético
* Hawkins
* Gráficos
* Interpretação Final
* Recomendações

## Campos sugeridos

```sql
id uuid primary key default gen_random_uuid(),
app_code app_code not null default 'RADIONICS',
template_id uuid not null references public.radionics_session_templates(id) on delete cascade,
block_code text not null,
title text not null,
description text,
order_index integer not null default 0,
is_required boolean not null default false,
show_in_session boolean not null default true,
show_in_report boolean not null default true,
show_in_hub boolean not null default false,
is_private boolean not null default false,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
```

---

# 7. Campos de Template

## Nova tabela

`radionics_template_fields`

## Responsabilidade

Representar campos configuráveis dentro de blocos.

## Tipos de campo

* short_text
* long_text
* number
* date
* single_select
* multi_select
* checkbox
* image
* audio
* tool_selector
* hawkins_selector

## Campos sugeridos

```sql
id uuid primary key default gen_random_uuid(),
app_code app_code not null default 'RADIONICS',
block_id uuid not null references public.radionics_template_blocks(id) on delete cascade,
field_code text not null,
label text not null,
field_type text not null,
order_index integer not null default 0,
is_required boolean not null default false,
options_json jsonb,
default_value jsonb,
placeholder text,
help_text text,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
```

---

# 8. Versões de Template

## Nova tabela recomendada

`radionics_template_versions`

## Responsabilidade

Congelar a estrutura do template usado numa sessão.

## Porquê

Se o terapeuta alterar um template, sessões antigas não devem mudar.

## Campos sugeridos

```sql
id uuid primary key default gen_random_uuid(),
app_code app_code not null default 'RADIONICS',
template_id uuid not null references public.radionics_session_templates(id) on delete cascade,
version_number integer not null,
schema_json jsonb not null,
created_by uuid references auth.users(id),
created_at timestamptz not null default now()
```

---

# 9. Sessão

## Tabela core existente

`sessions`

## Extensão RADIONICS existente

`radionics_session_details`

## Ajustes necessários

`radionics_session_details` deve suportar:

* session_id
* therapist_id
* client_id
* table_id
* template_id
* template_version_id
* intention
* session_mode
* hawkins_initial
* hawkins_final
* reverberation_days
* status
* current_stage_code
* current_step_code
* created_at
* updated_at

## Estados da sessão

* draft
* in_progress
* paused
* completed
* reported

---

# 10. Resultados por Passo

## Tabela existente

`radionics_session_step_results`

## Responsabilidade

Guardar todos os resultados recolhidos durante o workspace.

## Deve suportar

* respostas simples
* seleção de opções
* ferramentas selecionadas
* notas escritas
* notas ditadas
* transcrição
* áudio
* estado do passo

## Campos recomendados

* session_id
* therapist_id
* client_id
* table_id
* template_id
* stage_code
* step_code
* step_type
* tool_id nullable
* selected_option_ids jsonb
* value_json jsonb
* notes_text
* transcript_text
* audio_url
* status
* skipped_at
* completed_at
* created_at
* updated_at

## Estados do passo

* not_started
* in_progress
* completed
* skipped

---

# 11. Ativações

## Tabela existente

`radionics_session_activations`

## Responsabilidade

Guardar ferramentas efetivamente ativadas.

## Regra

Nem toda ferramenta identificada é ativada.

O sistema deve distinguir:

* ferramenta selecionada
* ferramenta analisada
* ferramenta ativada
* ferramenta ignorada

---

# 12. Relatórios

## Tabela existente provável

`radionics_reports`

## Responsabilidade

Guardar relatório gerado a partir da sessão.

## Deve suportar

* session_id
* therapist_id
* client_id
* table_id
* template_id
* template_version_id
* status
* draft_json
* editable_content_json
* final_html
* pdf_url
* shared_via
* shared_at
* approved_at
* created_at
* updated_at

## Estados

* draft
* in_review
* approved
* shared

---

# 13. Histórico Evolutivo

O histórico pode ser inicialmente derivado das sessões e relatórios.

Não é obrigatório criar tabela própria na V2 inicial.

Fontes:

* `sessions`
* `radionics_session_details`
* `radionics_session_step_results`
* `radionics_session_activations`
* `radionics_reports`

Exemplos de evolução:

* Hawkins inicial/final ao longo do tempo
* ferramentas recorrentes
* metodologias utilizadas
* temas recorrentes
* recomendações anteriores

---

# 14. Tabelas Legacy

## Não usar no novo frontend

* `radionics_therapy_types`
* `radionics_tool_therapy_map`

## Regra

Manter por compatibilidade.

Não criar novas dependências.

Migrar gradualmente para:

* `radionics_tables`
* `radionics_tool_table_map`

---

# 15. Migrations Recomendadas

## Fase 1 — Segurança

* tornar `clients.birth_date` nullable, se estiver obrigatório
* confirmar criação de cliente sem email
* garantir `table_id` nas sessões RADIONICS
* confirmar RLS em tabelas novas

---

## Fase 2 — Template Engine

Criar:

* `radionics_session_templates`
* `radionics_template_blocks`
* `radionics_template_fields`
* `radionics_template_versions`

---

## Fase 3 — Session Engine

Expandir, se necessário:

* `radionics_session_details`
* `radionics_session_step_results`

---

## Fase 4 — Report Engine

Confirmar/expandir:

* `radionics_reports`

---

# 16. Regra Final

O modelo V2 deve permitir que a RADIONICS funcione assim:

```text
Metodologia
↓
Template
↓
Sessão
↓
Resultados
↓
Relatório
↓
Evolução
```

Sem misturar responsabilidades com o RADIANCE.

RADIANCE gere o negócio.

RADIONICS executa a sessão terapêutica.
