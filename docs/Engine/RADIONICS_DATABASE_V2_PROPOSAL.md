# RADIONICS Database V2 Proposal

## Objetivo

Este documento define a proposta de arquitetura de dados para a próxima geração da plataforma RADIONICS.

O objetivo é suportar:

* Especialidades certificáveis
* Ferramentas reutilizáveis
* Protocolos
* Conteúdo das apostilas
* Sessões terapêuticas
* Relatórios
* Assistente Terapêutico
* Recomendações inteligentes

sem duplicação de conhecimento e com escalabilidade para novas metodologias.

---

# Princípios Arquiteturais

## Separação entre Conhecimento e Utilização

A arquitetura divide-se em duas áreas:

### Knowledge Engine

Conhecimento da metodologia.

Exemplos:

* Gráficos
* Anjos
* Chakras
* Hawkins
* Protocolos
* Guias
* Orações
* Regras

---

### Runtime Engine

Execução prática.

Exemplos:

* Clientes
* Sessões
* Relatórios
* Ativações
* Histórico

---

# Área 1 — Especialidades

## specialties

Representa metodologias certificáveis.

```sql
specialties
```

Campos:

```txt
id
name
slug
description
category

requires_certification

status

active
inactive

created_at
updated_at
```

Exemplos:

```txt
Mesa dos 35 Gráficos
Mesa dos 49 Símbolos Angelicais
MAP 2.0
Apometria
Quantec
Mesa Estelar
```

---

# Área 2 — Ferramentas

## tools

Representa elementos reutilizáveis.

```sql
tools
```

Campos:

```txt
id

name
slug

tool_type

graph
angel
archangel
chakra
hawkins
cause
body
organ
symbol
protocol_component

image_url

base_description

status

created_at
updated_at
```

---

# Área 3 — Conteúdo Contextual

## specialty_tool_content

Liga uma especialidade a uma ferramenta.

Uma ferramenta pode existir em várias metodologias.

Cada metodologia fornece a sua própria interpretação.

```sql
specialty_tool_content
```

Campos:

```txt
id

specialty_id

tool_id

title

therapist_explanation

client_explanation

activation_text

interpretation

recommended_use

notes

sort_order

created_at
updated_at
```

---

# Área 4 — Protocolos

## specialty_protocols

Representa protocolos de trabalho.

```sql
specialty_protocols
```

Campos:

```txt
id

specialty_id

name

description

category

max_per_session

status

created_at
updated_at
```

---

## specialty_protocol_steps

Passos do protocolo.

```sql
specialty_protocol_steps
```

Campos:

```txt
id

protocol_id

step_order

tool_id

instruction

notes

created_at
updated_at
```

---

# Área 5 — Conhecimento da Apostila

## specialty_knowledge_articles

Representa conteúdos completos das apostilas.

```sql
specialty_knowledge_articles
```

Campos:

```txt
id

specialty_id

title

article_type

rule
ethics
prayer
step_guide
faq
reference
explanation

content

sort_order

created_at
updated_at
```

---

# Área 6 — Certificações

## therapist_specialty_certifications

Já existente.

Controla acesso ao conteúdo.

```sql
therapist_specialty_certifications
```

Estados:

```txt
approved
pending
rejected
expired
not_certified
```

---

## therapist_specialty_documents

Já existente.

Documentos enviados.

```sql
therapist_specialty_documents
```

---

# Área 7 — Clientes

## clients

```sql
clients
```

Campos:

```txt
id

therapist_id

name
email
phone

birth_date

notes

created_at
updated_at
```

---

# Área 8 — Sessões

## sessions

Representa a sessão terapêutica.

```sql
sessions
```

Campos:

```txt
id

therapist_id
client_id

specialty_id

template_id

status

draft
in_progress
completed
archived

session_mode

presential
online
distance

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

# Área 9 — Workspace

## session_workspace

Representa o estado vivo da sessão.

```sql
session_workspace
```

Campos:

```txt
id

session_id

field_values jsonb

tool_results jsonb

assistant_context jsonb

updated_at
```

---

# Área 10 — Ativações

## session_tool_results

Representa ferramentas utilizadas.

```sql
session_tool_results
```

Campos:

```txt
id

session_id

tool_id

specialty_tool_content_id

status

identified
activated
ignored

notes

created_at
updated_at
```

---

# Área 11 — Protocolos Utilizados

## session_protocols

```sql
session_protocols
```

Campos:

```txt
id

session_id

protocol_id

notes

created_at
```

---

# Área 12 — Relatórios

## reports

Representa relatórios gerados.

```sql
reports
```

Campos:

```txt
id

session_id

therapist_id
client_id

title

report_data jsonb

pdf_url

created_at
updated_at
```

---

# Área 13 — Assistente Terapêutico

## assistant_recommendations

Fase futura.

```sql
assistant_recommendations
```

Campos:

```txt
id

specialty_id

trigger_type

hawkins
tool
symptom
objective

trigger_value

recommendation_type

tool
protocol
message

recommendation_data jsonb

created_at
updated_at
```

---

# Controlo de Acesso

Regra principal:

```txt
Especialidade
↓
Certificação
↓
Conteúdo disponível
```

Se:

```txt
certification.status = approved
```

o terapeuta pode:

* utilizar a especialidade
* criar sessões
* visualizar protocolos
* consultar apostilas
* usar recomendações

Caso contrário:

```txt
acesso negado
```

---

# Fluxo Futuro

```txt
Especialidade
↓
Ferramentas
↓
Protocolos
↓
Sessão
↓
Workspace
↓
Relatório
↓
Histórico
```

Tudo suportado pelo Knowledge Engine.

---

# Roadmap de Implementação

## V2.1

Knowledge Engine Base

```txt
tools
specialty_tool_content
specialty_knowledge_articles
```

---

## V2.2

Protocol Engine

```txt
specialty_protocols
specialty_protocol_steps
```

---

## V2.3

Sessions Persistence

```txt
sessions
session_workspace
session_tool_results
```

---

## V2.4

Reports Engine

```txt
reports
```

---

## V2.5

Therapeutic Assistant

```txt
assistant_recommendations
```

---

# Resultado Esperado

A RADIONICS passa de uma aplicação centrada em sessões para uma plataforma centrada em metodologias terapêuticas certificadas.

O conhecimento torna-se:

* estruturado
* reutilizável
* pesquisável
* protegido por certificação
* consumível por sessões, relatórios e IA

permitindo escalar para dezenas de metodologias sem necessidade de redesenhar a arquitetura.
