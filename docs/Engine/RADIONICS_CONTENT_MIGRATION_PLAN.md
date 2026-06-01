# RADIONICS Content Migration Plan v1

## Objetivo

Este documento define a estratégia de migração das metodologias terapêuticas atualmente existentes em formato de apostilas para o futuro Knowledge Engine da plataforma RADIONICS.

O objetivo é transformar conteúdos não estruturados em entidades reutilizáveis, pesquisáveis, certificáveis e utilizáveis pelo Workspace, Relatórios e Assistente Terapêutico.

---

# Problema Atual

Hoje o conhecimento encontra-se distribuído por:

* Apostilas PDF
* Manuais de formação
* Protocolos
* Documentos de apoio
* Guias de utilização

Cada metodologia possui o seu próprio conteúdo.

No entanto:

* muitas ferramentas repetem-se
* muitos conceitos repetem-se
* muitas metodologias utilizam os mesmos gráficos
* muitos protocolos utilizam as mesmas ferramentas

Criar conteúdo duplicado para cada metodologia criaria uma base de dados difícil de manter e escalar.

---

# Princípio Fundamental

Uma ferramenta deve existir apenas uma vez.

Exemplos:

* Luxor
* Anti Magia
* Flor da Vida
* Anjo da Clareza
* Chakra Cardíaco
* Hawkins 200

Devem existir apenas uma vez no sistema.

A forma como cada metodologia utiliza essa ferramenta será armazenada separadamente.

---

# Especialidades Iniciais

## Mesa dos 35 Gráficos

Estado:

```txt
Planeada para migração
```

Conteúdos identificados:

* Gráficos
* Protocolos
* Hawkins
* Orações
* Regras
* Guias de utilização

---

## Mesa dos 49 Símbolos Angelicais

Estado:

```txt
Planeada para migração
```

Conteúdos identificados:

* Anjos
* Protocolos
* Hawkins
* Orações
* Regras
* Guias de utilização

---

## MAP 2.0

Estado:

```txt
Planeada para migração
```

Conteúdos identificados:

* Gráficos
* Chakras
* Hawkins
* Causas emocionais
* Causas espirituais
* Sistemas físicos
* Relógio radiestésico
* Anjos
* Protocolos
* Guias

---

# Classificação dos Conteúdos

Todos os conteúdos das apostilas devem ser classificados numa destas categorias.

---

# Categoria A — Tools

Representam elementos reutilizáveis.

Exemplos:

```txt
Luxor
Anti Magia
Flor da Vida

Anjo da Cura

Chakra Cardíaco

Hawkins 200
```

Destino:

```txt
tools
```

---

# Categoria B — Specialty Tool Content

Representa a forma como uma especialidade utiliza uma ferramenta.

Exemplo:

```txt
Mesa 35
+
Luxor
```

Contém:

* explicação para terapeuta
* explicação para cliente
* ativação
* interpretação
* observações

Destino:

```txt
specialty_tool_content
```

---

# Categoria C — Protocols

Representa sequências estruturadas de trabalho.

Exemplos:

```txt
Proteção Espiritual

Libertação Kármica

Autoestima

Prosperidade
```

Destino:

```txt
specialty_protocols
```

---

# Categoria D — Protocol Steps

Representa os passos internos de um protocolo.

Exemplo:

```txt
1 Anti Magia

2 Luxor

3 Anjo da Proteção
```

Destino:

```txt
specialty_protocol_steps
```

---

# Categoria E — Knowledge Articles

Representa conteúdo textual das apostilas.

Tipos:

```txt
rule
ethics
prayer
step_guide
faq
reference
explanation
```

Destino:

```txt
specialty_knowledge_articles
```

---

# Matriz de Conteúdos

Versão inicial.

| Conteúdo             | Mesa 35 | Mesa 49 | MAP 2.0 |
| -------------------- | ------- | ------- | ------- |
| Gráficos             | ✅       | ❌       | ✅       |
| Anjos                | ❌       | ✅       | ✅       |
| Arcanjos             | ❌       | ❌       | ✅       |
| Chakras              | ❌       | ❌       | ✅       |
| Hawkins              | ✅       | ✅       | ✅       |
| Protocolos           | ✅       | ✅       | ✅       |
| Orações              | ✅       | ✅       | ✅       |
| Regras               | ✅       | ✅       | ✅       |
| Guias                | ✅       | ✅       | ✅       |
| Causas Emocionais    | ❌       | ❌       | ✅       |
| Causas Espirituais   | ❌       | ❌       | ✅       |
| Sistemas Físicos     | ❌       | ❌       | ✅       |
| Relógio Radiestésico | ❌       | ❌       | ✅       |

---

# Processo de Migração

Cada apostila deverá ser analisada seguindo o mesmo fluxo.

---

## Passo 1

Identificar todas as ferramentas.

Exemplo:

```txt
Luxor

Anti Magia

Flor da Vida
```

Destino:

```txt
tools
```

---

## Passo 2

Identificar conteúdos específicos da metodologia.

Exemplo:

```txt
Como usar Luxor

O que dizer ao cliente

Interpretação
```

Destino:

```txt
specialty_tool_content
```

---

## Passo 3

Identificar protocolos.

Exemplo:

```txt
Proteção Espiritual

Prosperidade

Autoestima
```

Destino:

```txt
specialty_protocols
```

---

## Passo 4

Identificar passos dos protocolos.

Destino:

```txt
specialty_protocol_steps
```

---

## Passo 5

Identificar conteúdos de apoio.

Exemplos:

```txt
Regras

Orações

FAQs

Boas práticas
```

Destino:

```txt
specialty_knowledge_articles
```

---

# Certificações

A certificação é o mecanismo que controla acesso ao conhecimento.

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

Isto aplica-se a:

* Ferramentas
* Protocolos
* Guias
* Apostilas
* Assistente Terapêutico

---

# Utilização no Workspace

Quando uma sessão é iniciada:

```txt
Especialidade
↓
Ferramentas autorizadas
↓
Protocolos
↓
Guias
↓
Conteúdo da metodologia
```

Tudo é carregado dinamicamente a partir do Knowledge Engine.

---

# Utilização no Assistente Terapêutico

Fase futura.

O assistente poderá sugerir:

* Ferramentas
* Protocolos
* Sequências
* Mensagens ao cliente

Com base:

* na especialidade
* na certificação
* nos resultados da sessão

Sempre respeitando os limites da metodologia certificada.

---

# Roadmap de Migração

## Fase 1

Mesa dos 35 Gráficos

Objetivo:

* estruturar gráficos
* estruturar protocolos
* estruturar regras

---

## Fase 2

Mesa dos 49 Símbolos Angelicais

Objetivo:

* estruturar anjos
* estruturar protocolos
* estruturar interpretações

---

## Fase 3

MAP 2.0

Objetivo:

* estruturar gráficos
* chakras
* Hawkins
* causas emocionais
* causas espirituais
* sistemas físicos
* relógio radiestésico

---

## Fase 4

Apometria

---

## Fase 5

Quantec

---

## Fase 6

Novas metodologias

---

# Resultado Esperado

No final da migração, a RADIONICS deixará de depender de apostilas PDF para consulta operacional.

Todo o conhecimento passará a existir como dados estruturados reutilizáveis.

Isto permitirá:

* Workspace inteligente
* Relatórios automáticos enriquecidos
* Assistente Terapêutico
* Pesquisa contextual
* Recomendações automáticas
* Escalabilidade para novas metodologias

sem duplicação de conteúdo.
