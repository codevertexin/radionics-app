# RADIONICS Knowledge Tools Model V2

## Objetivo

Este documento define a estrutura conceptual das ferramentas e elementos de conhecimento utilizados pelas metodologias terapêuticas da plataforma RADIONICS.

O objetivo é permitir:

* reutilização de conhecimento
* evitar duplicação de conteúdo
* suportar múltiplas metodologias
* permitir crescimento futuro do Knowledge Engine
* suportar Workspace, Relatórios e Assistente Terapêutico

---

# Problema

Uma metodologia não é composta apenas por ferramentas.

Por exemplo:

## Mesa dos 49 Símbolos Angelicais

Inclui:

* Símbolos Angelicais
* Gráficos da Radiestesia
* Decágono
* Escala de Hawkins
* Relógio Radiestésico
* Chakras

Todos estes elementos participam na metodologia.

No entanto:

* nem todos são ferramentas no mesmo sentido
* nem todos são ativados
* nem todos são medidos
* nem todos são analisados da mesma forma

---

# Visão Geral

A arquitetura divide-se em quatro níveis:

```txt
Especialidade
↓
Categoria
↓
Item de Conhecimento
↓
Conteúdo Contextual
```

---

# 1. Especialidades

Representam metodologias certificáveis.

Exemplos:

```txt
Mesa dos 35 Gráficos
Mesa dos 49 Símbolos Angelicais
MAP 2.0
Apometria
Quantec
Mesa Estelar
```

Tabela existente:

```txt
specialties
```

---

# 2. Categorias de Conhecimento

Agrupam elementos semelhantes.

Tabela proposta:

```txt
knowledge_categories
```

Campos:

```txt
id
name
slug
description
sort_order
status
```

---

## Categorias iniciais

### Símbolos Angelicais

Exemplos:

```txt
Anjo da Clareza
Anjo da Cura Interior
Anjo da Magia Divina
```

---

### Gráficos da Radiestesia

Exemplos:

```txt
Luxor
Anti Magia
Anti Possessão
Flor da Vida
```

---

### Escala de Hawkins

Exemplos:

```txt
20 — Vergonha
100 — Medo
200 — Coragem
540 — Alegria
```

---

### Chakras

Exemplos:

```txt
Raiz
Sacral
Plexo Solar
Cardíaco
Laríngeo
Frontal
Coronário
```

---

### Relógio Radiestésico

Exemplos:

```txt
Corpos
Dimensões
Percentagens
Escalas
```

---

### Decágono

Elementos próprios da metodologia.

---

# 3. Knowledge Items

Representam elementos individuais.

Tabela proposta:

```txt
knowledge_items
```

Campos:

```txt
id

category_id

name
slug
code

item_kind

description

image_url

sort_order

status

created_at
updated_at
```

---

# Item Kind

Define a natureza do elemento.

Valores iniciais:

```txt
graph
angel
chakra
hawkins
clock
decagon
cause
body
organ
symbol
```

---

# Exemplos

### Luxor

```txt
category:
Gráficos da Radiestesia

item_kind:
graph
```

---

### Anjo da Clareza

```txt
category:
Símbolos Angelicais

item_kind:
angel
```

---

### Hawkins 200

```txt
category:
Escala de Hawkins

item_kind:
hawkins
```

---

### Chakra Cardíaco

```txt
category:
Chakras

item_kind:
chakra
```

---

# 4. Utilização

Nem todos os elementos são utilizados da mesma forma.

Tabela:

```txt
knowledge_items
```

Campo:

```txt
usage_mode
```

---

## Valores

### activation

Pode ser ativado.

Exemplos:

```txt
Luxor
Anti Magia
Anjos
```

---

### measurement

Utilizado para medir.

Exemplos:

```txt
Escala de Hawkins
Relógio Radiestésico
```

---

### analysis

Utilizado para análise.

Exemplos:

```txt
Chakras
Corpos
Órgãos
```

---

### support

Utilizado como ferramenta auxiliar.

Exemplos:

```txt
Decágono
```

---

### reference

Apenas consulta.

Exemplos:

```txt
Tabelas de apoio
```

---

# 5. Ligação à Especialidade

Nem todos os itens pertencem a todas as metodologias.

Tabela:

```txt
specialty_knowledge_items
```

Campos:

```txt
id

specialty_id

knowledge_item_id

is_required

is_visible_in_workspace

sort_order

created_at
updated_at
```

---

# 6. Conteúdo Contextual

A mesma ferramenta pode ser utilizada de forma diferente.

Exemplo:

```txt
Luxor
```

na:

```txt
Mesa dos 35 Gráficos
```

tem uma interpretação.

No:

```txt
MAP 2.0
```

pode ter outra.

Tabela:

```txt
specialty_knowledge_content
```

Campos:

```txt
id

specialty_knowledge_item_id

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

# Exemplo

## Item Base

```txt
Luxor
```

---

## Mesa dos 35 Gráficos

```txt
Como interpretar
Como ativar
O que dizer ao cliente
```

---

## MAP 2.0

```txt
Outra interpretação
Outra ativação
Outra explicação
```

---

# Relação com Protocolos

Protocolos não substituem ferramentas.

Protocolos utilizam ferramentas.

Fluxo:

```txt
Especialidade
↓
Knowledge Items
↓
Protocolos
↓
Sessão
```

---

# Relação com Certificações

A certificação controla o acesso.

Regra:

```txt
approved
↓
acesso autorizado
```

Permite:

* consultar conteúdos
* utilizar ferramentas
* executar protocolos
* usar o assistente

---

# Open Questions

## 1. Knowledge Items vs Tools

Decisão ainda aberta.

Opção A:

```txt
tools
```

Opção B:

```txt
knowledge_items
```

Neste momento a opção B parece mais flexível.

---

## 2. Hawkins

Pergunta:

```txt
Hawkins é uma ferramenta
ou uma entidade de medição?
```

Ainda em análise.

---

## 3. Relógio Radiestésico

Pergunta:

```txt
Cada secção do relógio
é um item independente?
```

Ainda em análise.

---

## 4. MAP 2.0

O conteúdo completo do MAP poderá exigir novas categorias:

```txt
causas emocionais
causas espirituais
sistemas físicos
```

Decisão adiada para a fase de migração do MAP.

---

# Próximos Passos

1. Rever este modelo.
2. Validar com os conteúdos reais das apostilas.
3. Rever MAP 2.0.
4. Fechar Open Questions.
5. Criar migrations definitivas.
6. Implementar Knowledge Engine.
