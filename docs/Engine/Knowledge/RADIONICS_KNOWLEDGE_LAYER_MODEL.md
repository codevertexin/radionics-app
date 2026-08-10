# RADIONICS_KNOWLEDGE_LAYER_MODEL.md

## Objetivo

O Methodology Engine define as ferramentas, assets, imagens e fluxos de trabalho de uma metodologia.

A Knowledge Layer define o conhecimento terapêutico associado a essas ferramentas.

O objetivo é permitir que a plataforma RADIONICS não apenas apresente símbolos, gráficos e chakras, mas também oriente o terapeuta durante a sessão através de explicações, interpretações, ativações, protocolos e conteúdos específicos de cada metodologia.

---

# Princípios

## Asset ≠ Conhecimento

Um asset representa um objeto terapêutico.

Exemplos:

* Anti Magia
* Luxor
* Arcanjo Miguel
* Chakra Cardíaco
* Escala de Hawkins

O conhecimento associado a esse asset pode variar conforme:

* metodologia
* professor
* escola
* versão do conteúdo

Por isso o conhecimento não deve ser armazenado apenas no asset.

---

## Conteúdo Global vs Conteúdo por Especialidade

### Conteúdo Global

Representa informação universal.

Exemplo:

Chakra Cardíaco:

* localização
* cor
* função
* elemento

Este conteúdo é comum independentemente da metodologia.

---

### Conteúdo por Especialidade

Representa a interpretação da metodologia.

Exemplo:

Mesa 35 → Anti Magia

* o que é
* quando utilizar
* como explicar ao cliente
* ativação
* observações

Outra metodologia poderá usar o mesmo asset com textos diferentes.

---

# Entidades Principais

## methodology_assets

Representa o objeto terapêutico.

Exemplos:

* Anti Magia
* Luxor
* Arcanjo Miguel
* Chakra Cardíaco

---

## specialty_asset_content

Representa conhecimento específico da metodologia.

Campos sugeridos:

* title
* therapist_explanation
* client_explanation
* interpretation
* activation_text
* recommended_use
* notes
* source_name
* source_type
* content_version

---

## activation_scripts

Representa scripts estruturados de ativação.

Exemplos:

* Ativação Anti Magia
* Ativação Chakra Cardíaco
* Ativação Arcanjo Miguel

Campos:

* name
* script_text
* usage_mode
* source_name
* source_type
* version

---

# Protocolos

## Conceito

Um protocolo representa um conjunto organizado de assets utilizados para um objetivo específico.

Exemplos:

* Medos
* Prosperidade
* Autoestima
* Saúde e Vitalidade
* Libertação Kármica

---

## methodology_protocols

Campos:

* id
* specialty_id
* code
* name
* description
* why_activate
* sort_order
* source_name
* source_type
* content_version

---

## protocol_assets

Liga protocolos aos assets.

Campos:

* protocol_id
* asset_id
* asset_role
* sort_order

asset_role:

* graph
* angel
* archangel
* chakra
* hawkins
* other

---

## protocol_steps

Permite modelar sequências futuras.

Exemplo:

Passo 1
Passo 2
Passo 3

Campos:

* protocol_id
* step_number
* title
* instructions
* activation_text

---

# Source Material

Todo conteúdo importado deve preservar a origem.

Campos recomendados:

* source_name
* source_type
* source_reference

source_type:

* teacher_original
* course_material
* app_adapted
* generated
* custom

---

# Content Versioning

Cada conteúdo poderá possuir versões.

Exemplo:

Versão Original Vanessa

Versão Adaptada RADIONICS

Versão Personalizada do Terapeuta

Campos:

* version
* is_active
* created_at
* updated_at

---

# Utilização no Workspace

Durante uma sessão o terapeuta poderá consultar:

* descrição do asset
* explicação para o cliente
* ativação
* protocolos associados
* observações da metodologia

sem necessidade de consultar a apostila original.

---

# Relação com o Workflow Engine

A Knowledge Layer fornece o conteúdo.

O Workflow Engine define quando e como esse conteúdo é apresentado.

Knowledge Layer:

* O que é
* Como interpretar
* Como ativar

Workflow Engine:

* Quando mostrar
* Em que ordem
* Em que contexto

---

# Roadmap

V2.6A
Schema Knowledge Layer

V2.6B
Import Gráficos

V2.6C
Import Anjos

V2.6D
Import Chakras

V2.6E
Import Protocolos

V3.0
Workflow Engine

V3.1
Workspace Dinâmico
