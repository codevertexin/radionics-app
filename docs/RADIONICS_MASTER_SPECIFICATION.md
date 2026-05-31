# RADIONICS_MASTER_SPECIFICATION.md

# Master Specification

## Versão

1.0

---

# Objetivo

Este documento representa a especificação oficial da plataforma RADIONICS.

Todos os desenvolvimentos futuros devem respeitar os princípios, regras e estruturas definidos neste documento e nos documentos de suporte associados.

Em caso de conflito, este documento prevalece.

---

# Visão Geral

A RADIONICS é uma aplicação profissional destinada a terapeutas que utilizam metodologias estruturadas de análise, diagnóstico e harmonização energética.

O foco principal da plataforma é a execução de sessões terapêuticas guiadas.

A aplicação reduz a carga administrativa do terapeuta através de:

* sessões guiadas
* recolha estruturada de dados
* geração automática de relatórios
* histórico evolutivo do cliente
* reutilização de metodologias e templates

---

# Posicionamento no Ecossistema

A RADIONICS pertence ao ecossistema ByElamor.

A RADIONICS não substitui o RADIANCE.

---

## RADIANCE

Responsável por:

* catálogo de serviços
* preços
* pagamentos
* agenda
* marcações
* perfil público do terapeuta
* gestão comercial

---

## RADIONICS

Responsável por:

* clientes
* sessões terapêuticas
* metodologias
* templates
* relatórios
* evolução terapêutica

---

# Arquitetura Conceptual

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

---

# Metodologias

As metodologias representam os sistemas terapêuticos disponíveis.

Exemplos:

* MAP
* Mesa dos 35 Gráficos
* Mesa dos 49 Símbolos Angelicais
* futuras metodologias

As metodologias são definidas pela RADIONICS.

Os terapeutas não alteram metodologias.

---

# Templates

Os templates definem:

* informação recolhida
* estrutura do relatório
* visibilidade da informação
* experiência da sessão

Cada metodologia possui pelo menos um template oficial.

Os terapeutas podem criar templates personalizados.

Templates nunca alteram a metodologia.

---

# Sessões

Uma sessão é uma execução de uma metodologia utilizando um template específico.

Fluxo:

```text
Metodologia
↓
Template
↓
Cliente
↓
Sessão
```

Cada sessão:

* guarda progresso automaticamente
* pode ser interrompida
* pode ser retomada
* gera relatório

---

# Session Engine

O Session Engine é responsável pela execução da sessão.

Capacidades:

* etapas
* passos
* skip
* retoma
* auto-save
* progresso
* resultados

Os passos podem gerar etapas dinâmicas.

Exemplo:

```text
Selecionar Gráficos
↓
Anti Magia
Luxor
Prosperidade
↓
Gerar passos automaticamente
```

---

# Workspace

O Workspace é o centro da aplicação.

Princípios:

* cards
* imagens
* seleção visual
* ditado por voz
* pouca escrita

O Workspace deve comportar-se como uma mesa de trabalho digital.

Não como um formulário.

---

# Report Engine

Os relatórios são gerados a partir dos dados recolhidos durante a sessão.

Fluxo:

```text
Sessão
↓
Compilação
↓
Draft
↓
Revisão Humana
↓
Aprovação
↓
Partilha
```

A interpretação final pertence sempre ao terapeuta.

---

# Clientes

A RADIONICS utiliza o cliente global do ecossistema.

Não existe uma tabela de clientes isolada.

Estrutura:

```text
clients
↓
therapist_clients
```

---

## Cliente sem Email

Permitido.

Campos mínimos:

* nome

Campos opcionais:

* email
* WhatsApp
* Telegram
* telefone

---

## Cliente com HUB

Opcional.

Um cliente pode existir sem conta HUB.

---

# Histórico Evolutivo

O sistema deve permitir acompanhar:

* Hawkins ao longo do tempo
* metodologias utilizadas
* ferramentas recorrentes
* observações
* recomendações

---

# Responsividade

Aplicar padrões oficiais do ecossistema.

Desktop:

* 3 colunas quando aplicável

Tablet:

* 2 colunas

Mobile:

* 1 coluna ou wizard

---

# Integrações Obrigatórias

## AUTH

Autenticação.

---

## BILLING

Entitlements e limites.

---

## HELP

Ajuda e suporte.

---

## LEGAL

Termos e privacidade.

---

## RADIANCE

Agenda e sessões originadas por marcações.

---

# Modelo de Dados

A implementação deve respeitar:

* tabelas existentes auditadas
* Data Model V2
* Session Engine
* Template Engine
* Report Engine

Evitar duplicação de entidades já existentes.

---

# Documentos Oficiais do Projeto

## Produto

* RADIONICS_VISION.md
* RADIONICS_PRODUCT_BOUNDARIES.md

---

## Sessões

* RADIONICS_SESSION_ENGINE.md
* RADIONICS_REAL_SESSION_EXAMPLES.md

---

## Templates

* RADIONICS_TEMPLATE_ENGINE.md

---

## Relatórios

* RADIONICS_REPORT_ENGINE.md

---

## Workspace

* RADIONICS_WORKSPACE.md

---

## Dados

* RADIONICS_DATA_MODEL_AUDIT.md
* RADIONICS_DATA_MODEL_V2.md

---

## Frontend

* RADIONICS_FRONTEND_ARCHITECTURE.md

---

# Regras de Desenvolvimento

Não alterar metodologias oficiais.

Não substituir interpretação humana por IA.

Não duplicar funcionalidades do RADIANCE.

Privilegiar seleção visual em vez de formulários.

Privilegiar ditado por voz em vez de escrita.

Garantir auto-save em toda a sessão.

Garantir retoma de sessões interrompidas.

Garantir compatibilidade futura com novas metodologias.

---

# Definição Final

A RADIONICS é uma plataforma profissional de execução de sessões terapêuticas guiadas.

O objetivo não é gerir o negócio do terapeuta.

O objetivo é apoiar o terapeuta durante a sessão, organizar a informação recolhida e transformar essa informação em relatórios e histórico evolutivo de forma eficiente e consistente.
