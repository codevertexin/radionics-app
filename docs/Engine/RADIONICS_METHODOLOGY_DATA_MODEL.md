# RADIONICS Methodology Data Model

## Objetivo

Este documento define o modelo de dados conceptual para suportar o Methodology Engine da RADIONICS.

O objetivo é permitir adicionar novas mesas, metodologias e especialidades através de configuração, sem necessidade de alterar o código base da aplicação.

Uma nova mesa deve poder ser criada através de:

1. criação da especialidade;
2. configuração dos assets;
3. configuração dos protocolos;
4. configuração dos seletores;
5. configuração dos scripts de ativação;
6. configuração dos templates;
7. configuração dos requisitos de certificação.

---

# Conceitos Centrais

## Specialty

Representa uma metodologia certificável.

Exemplos:

* Mesa dos 35 Gráficos
* Mesa dos 49 Símbolos Angelicais
* MAP 2.0
* Mesa Radiônica Quântica de Saint Germain
* Mesa Radiônica de Registos Akáshicos
* Mesa Apométrica da Grande Fraternidade Branca

Tabela:

```sql
specialties
```

Campos principais:

```txt
id
name
slug
description
category
status
requires_certification
created_at
updated_at
```

---

## Asset

Representa um elemento de conhecimento reutilizável.

Exemplos:

* Luxor
* Anti Magia
* La Hanna Nai
* Arcanjo Miguel
* Saint Germain
* Chakra Cardíaco
* Hawkins 200
* Ametista

Tabela:

```sql
methodology_assets
```

Campos principais:

```txt
id
name
slug
asset_type
usage_mode
description
image_url
status
created_at
updated_at
```

### asset_type

Valores possíveis:

```txt
graph
symbol
angel
archangel
master
ray
chakra
hawkins_level
crystal
flower
cause
body
organ
scale
selector_item
reference
```

### usage_mode

Valores possíveis:

```txt
activation
measurement
analysis
support
reference
```

---

## Specialty Asset

Define que assets pertencem a uma especialidade.

Tabela:

```sql
specialty_assets
```

Campos principais:

```txt
id
specialty_id
asset_id
sort_order
is_required
is_visible_in_workspace
created_at
updated_at
```

---

## Specialty Asset Content

Define como uma especialidade interpreta e utiliza um asset.

A mesma ferramenta pode pertencer a várias especialidades com explicações diferentes.

Tabela:

```sql
specialty_asset_content
```

Campos principais:

```txt
id
specialty_asset_id
title
therapist_explanation
client_explanation
activation_text
interpretation
recommended_use
notes
created_at
updated_at
```

---

# Protocolos

## Protocol

Representa um processo executável.

Exemplos:

* Retirada de Implantes
* Corte de Laços Energéticos
* Salto Quântico
* Regressão a Vidas Passadas
* Harmonização de Chakras
* Limpeza Energética

Tabela:

```sql
methodology_protocols
```

Campos principais:

```txt
id
name
slug
description
category
status
created_at
updated_at
```

---

## Specialty Protocol

Liga um protocolo a uma especialidade.

Tabela:

```sql
specialty_protocols
```

Campos principais:

```txt
id
specialty_id
protocol_id
sort_order
is_required
is_visible_in_workspace
max_per_session
created_at
updated_at
```

---

## Protocol Step

Define os passos de execução de um protocolo.

Tabela:

```sql
protocol_steps
```

Campos principais:

```txt
id
protocol_id
step_order
title
instruction
asset_id
activation_script_id
notes
created_at
updated_at
```

---

# Seletores

## Selector

Representa uma estrutura de apoio à decisão.

Exemplos:

* Relógio Radiestésico
* Seletor Primário
* Seletor Secundário
* Seletor de Cura Consciencial

Tabela:

```sql
methodology_selectors
```

Campos principais:

```txt
id
name
slug
description
selector_type
status
created_at
updated_at
```

---

## Specialty Selector

Liga um seletor a uma especialidade.

Tabela:

```sql
specialty_selectors
```

Campos principais:

```txt
id
specialty_id
selector_id
sort_order
is_visible_in_workspace
created_at
updated_at
```

---

## Selector Option

Representa opções internas de um seletor.

Tabela:

```sql
selector_options
```

Campos principais:

```txt
id
selector_id
label
value
description
sort_order
created_at
updated_at
```

---

# Scripts de Ativação

## Activation Script

Representa comandos, decretos, orações ou instruções de ativação.

Tabela:

```sql
activation_scripts
```

Campos principais:

```txt
id
name
slug
script_type
content
status
created_at
updated_at
```

### script_type

Valores possíveis:

```txt
activation
deactivation
prayer
decree
visualization
instruction
```

---

## Script Associations

Um script pode ser associado a:

* asset;
* protocolo;
* etapa de protocolo;
* especialidade.

Tabela:

```sql
activation_script_links
```

Campos principais:

```txt
id
activation_script_id
target_type
target_id
sort_order
created_at
updated_at
```

### target_type

Valores possíveis:

```txt
specialty
asset
specialty_asset
protocol
protocol_step
selector
```

---

# Templates

## Session Template

Representa um fluxo de sessão configurável.

Tabela:

```sql
session_templates
```

Campos principais:

```txt
id
specialty_id
name
slug
description
template_type
status
created_at
updated_at
```

### template_type

Valores possíveis:

```txt
official
express
custom
```

---

## Template Steps

Define as etapas internas do template.

Tabela:

```sql
session_template_steps
```

Campos principais:

```txt
id
template_id
step_order
stage_key
title
description
required
config jsonb
created_at
updated_at
```

---

# Materiais de Referência

## Reference Materials

Representa materiais ligados à especialidade.

Tabela:

```sql
reference_materials
```

Campos principais:

```txt
id
specialty_id
title
material_type
file_url
external_url
visibility
created_at
updated_at
```

### material_type

Valores possíveis:

```txt
pdf
image
video
audio
link
text
```

### visibility

Valores possíveis:

```txt
certified_only
admin_only
public_preview
```

---

# Certificações

## Therapist Specialty Certifications

Tabela já existente.

Representa o pedido e estado da certificação do terapeuta.

```sql
therapist_specialty_certifications
```

Estados:

```txt
not_certified
pending
approved
rejected
expired
```

Regra principal:

```txt
approved
→ pode usar a especialidade

pending/rejected/expired/not_certified
→ não pode usar a especialidade
```

---

# Sessões

## Sessions

Representa uma execução prática de uma especialidade.

Tabela:

```sql
sessions
```

Campos principais:

```txt
id
therapist_id
client_id
specialty_id
template_id
status
session_mode
current_stage
hawkins_initial
hawkins_final
reverberation_days
started_at
completed_at
created_at
updated_at
```

---

## Session Workspace

Representa o estado vivo da sessão.

Tabela:

```sql
session_workspace
```

Campos principais:

```txt
id
session_id
field_values jsonb
asset_results jsonb
protocol_results jsonb
selector_results jsonb
assistant_context jsonb
updated_at
```

---

## Session Asset Results

Representa assets identificados, analisados ou ativados durante a sessão.

Tabela:

```sql
session_asset_results
```

Campos principais:

```txt
id
session_id
asset_id
specialty_asset_id
status
notes
created_at
updated_at
```

### status

Valores possíveis:

```txt
identified
activated
ignored
not_applicable
```

---

## Session Protocol Results

Representa protocolos executados durante a sessão.

Tabela:

```sql
session_protocol_results
```

Campos principais:

```txt
id
session_id
protocol_id
status
notes
created_at
updated_at
```

### status

Valores possíveis:

```txt
suggested
selected
executed
skipped
```

---

# Relatórios

## Reports

Representa relatórios gerados a partir de uma sessão.

Tabela:

```sql
reports
```

Campos principais:

```txt
id
session_id
therapist_id
client_id
specialty_id
report_data jsonb
status
pdf_url
created_at
updated_at
```

---

# Fluxo para Adicionar Nova Mesa

## 1. Criar Specialty

Criar nova especialidade com nome, slug, descrição, categoria e estado.

## 2. Adicionar Assets

Criar assets novos ou reutilizar assets existentes.

## 3. Associar Assets à Specialty

Criar registos em:

```sql
specialty_assets
```

## 4. Adicionar Conteúdo Contextual

Criar explicações e ativações em:

```sql
specialty_asset_content
```

## 5. Criar Protocolos

Criar protocolos em:

```sql
methodology_protocols
```

ou reutilizar protocolos existentes.

## 6. Associar Protocolos à Specialty

Criar registos em:

```sql
specialty_protocols
```

## 7. Criar Passos dos Protocolos

Criar passos em:

```sql
protocol_steps
```

## 8. Criar Seletores

Criar ou reutilizar seletores.

## 9. Criar Scripts de Ativação

Criar scripts em:

```sql
activation_scripts
```

e associar aos respetivos elementos.

## 10. Criar Templates

Criar templates de sessão.

## 11. Definir Materiais de Referência

Adicionar apostilas, imagens, vídeos ou guias.

## 12. Definir Requisitos de Certificação

A especialidade só fica utilizável por terapeutas com certificação aprovada.

---

# Regra Arquitetural Principal

A aplicação não deve ter lógica específica para uma mesa concreta.

Errado:

```txt
if specialty.slug === "mesa-35" then ...
```

Correto:

```txt
load specialty config
load assets
load protocols
load selectors
load template
render dynamically
```

---

# Resultado Esperado

Com este modelo, adicionar uma nova mesa significa configurar dados.

Não significa alterar código.

A RADIONICS passa a funcionar como um motor configurável de metodologias terapêuticas.
