# RADIONICS Knowledge Engine v1

## Visão

A RADIONICS não é apenas uma aplicação de gestão de sessões terapêuticas.

O objetivo é criar uma plataforma capaz de preservar, organizar, operacionalizar e disponibilizar metodologias terapêuticas certificadas através de um motor de conhecimento especializado.

O terapeuta não utiliza apenas ferramentas isoladas. Utiliza metodologias completas compostas por:

* Ferramentas
* Protocolos
* Guias de utilização
* Ativações
* Interpretações
* Mensagens ao cliente
* Boas práticas
* Regras éticas

A certificação do terapeuta serve como mecanismo de controlo de acesso a esse conhecimento.

---

# Objetivos

Criar uma arquitetura capaz de suportar:

* Mesa dos 35 Gráficos
* Mesa dos 49 Símbolos Angelicais
* MAP 2.0
* Apometria
* Quantec
* Terapia Floral
* Mesas Estelares
* Futuras metodologias

sem duplicação de conteúdo e permitindo reutilização de ferramentas entre especialidades.

---

# Conceitos Principais

## 1. Specialties

Representam metodologias certificáveis.

Exemplos:

* Mesa dos 35 Gráficos
* Mesa dos 49 Símbolos Angelicais
* MAP 2.0
* Apometria
* Quantec
* Mesa Estelar

Tabela:

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
status
requires_certification
created_at
updated_at
```

---

## 2. Tools

Representam ferramentas reutilizáveis.

Uma ferramenta existe apenas uma vez na plataforma.

Exemplos:

### Gráficos

* Luxor
* Anti Magia
* Anti Possessão
* Flor da Vida
* Scap

### Anjos

* Anjo da Clareza
* Anjo da Cura Interior
* Anjo da Proteção

### Chakras

* Chakra Cardíaco
* Chakra Frontal
* Chakra Plexo Solar

### Hawkins

* Hawkins 20
* Hawkins 100
* Hawkins 200
* Hawkins 540

Tabela:

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

image_url
base_description
status

created_at
updated_at
```

---

## 3. Specialty Tool Content

Esta é a entidade mais importante do sistema.

A mesma ferramenta pode existir em várias especialidades.

No entanto:

* a interpretação pode mudar
* a ativação pode mudar
* a mensagem ao cliente pode mudar
* os protocolos associados podem mudar

Exemplo:

### Mesa dos 35 Gráficos + Luxor

* interpretação específica
* ativação específica
* mensagem ao cliente específica

### MAP 2.0 + Luxor

* interpretação diferente
* ativação diferente
* mensagem ao cliente diferente

Tabela:

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

## 4. Protocols

Protocolos representam sequências estruturadas de trabalho.

Um protocolo não é uma ferramenta.

Um protocolo utiliza ferramentas.

Exemplos:

* Proteção Espiritual
* Libertação Kármica
* Harmonização Emocional
* Prosperidade
* Autoestima

Tabela:

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

## 5. Protocol Steps

Define a sequência de execução de um protocolo.

Tabela:

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

Exemplo:

### Proteção Espiritual

```txt
1 Anti Magia
2 Anti Possessão
3 Luxor
4 Anjo da Proteção
```

---

## 6. Knowledge Articles

Representam conteúdos completos da apostila.

Exemplos:

* Regras de utilização
* Ética
* Oração de abertura
* Oração de encerramento
* Guias passo a passo
* Perguntas frequentes
* Explicações técnicas

Tabela:

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
explanation
reference
faq

content

sort_order

created_at
updated_at
```

---

# Certificações

A certificação não valida apenas o terapeuta.

A certificação controla o acesso ao conhecimento operacional da especialidade.

Tabela existente:

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

Regra:

```txt
approved
↓
acesso autorizado

pending
↓
acesso negado

rejected
↓
acesso negado

expired
↓
acesso negado
```

---

# Especialidades vs Certificações

## Especialidade

Representa uma metodologia.

Exemplo:

```txt
Mesa dos 35 Gráficos
```

## Certificação

Representa a validação do terapeuta para utilizar essa metodologia.

Exemplo:

```txt
Certificado de formação da Mesa dos 35 Gráficos
```

Um terapeuta pode visualizar a existência da especialidade sem possuir certificação.

Mas não pode utilizar nem consultar os conteúdos exclusivos sem aprovação.

---

# Workspace

Quando o terapeuta inicia uma sessão:

```txt
Sessão
↓
Especialidade
↓
Ferramentas autorizadas
↓
Protocolos disponíveis
↓
Conteúdo da apostila
↓
Assistente contextual
```

O Workspace torna-se um ambiente orientado pela metodologia escolhida.

---

# Assistente Terapêutico

Fase futura.

O assistente poderá utilizar:

```txt
Especialidade
Ferramentas utilizadas
Hawkins inicial
Hawkins final
Objetivo da sessão
Sintomas reportados
```

Para sugerir:

```txt
Protocolos
Ferramentas
Anjos
Gráficos
Mensagens ao cliente
```

Sempre limitado ao conhecimento autorizado da especialidade certificada.

---

# Princípios Arquiteturais

## Reutilização

Uma ferramenta existe apenas uma vez.

Exemplo:

```txt
Luxor
```

Pode ser utilizada por:

* Mesa dos 35 Gráficos
* MAP 2.0
* Quantec
* Outras metodologias

---

## Contextualização

A mesma ferramenta pode possuir interpretações diferentes em metodologias diferentes.

O contexto pertence à especialidade.

Não à ferramenta.

---

## Certificação Obrigatória

O conhecimento operacional só é disponibilizado a terapeutas certificados.

---

## Escalabilidade

A arquitetura deve permitir adicionar novas metodologias sem necessidade de alterações estruturais significativas na base de dados.

---

# Roadmap Futuro

## Fase 1

* Especialidades
* Certificações
* Sessões
* Relatórios

## Fase 2

* Knowledge Engine
* Tools
* Specialty Tool Content
* Knowledge Articles

## Fase 3

* Protocolos
* Protocol Steps
* Recomendações automáticas

## Fase 4

* Assistente IA contextual
* Sugestões baseadas na metodologia certificada
* Relatórios enriquecidos
* Recomendações inteligentes

---

# Conclusão

A RADIONICS deve evoluir de uma aplicação de gestão de sessões para uma plataforma de metodologias terapêuticas certificadas.

O verdadeiro ativo da plataforma não são apenas as sessões ou relatórios.

É a capacidade de estruturar, proteger, reutilizar e operacionalizar conhecimento especializado de forma segura e escalável.
