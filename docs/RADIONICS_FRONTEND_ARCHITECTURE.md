# RADIONICS_FRONTEND_ARCHITECTURE.md

# Frontend Architecture

## Objetivo

Este documento define a arquitetura frontend da RADIONICS.

O objetivo é transformar os requisitos funcionais da plataforma numa experiência de utilização consistente, intuitiva e eficiente para terapeutas.

A RADIONICS é uma aplicação profissional focada na execução de sessões terapêuticas guiadas.

Não é um CRM.

Não é um ERP.

Não é uma ferramenta administrativa.

O foco principal é a sessão terapêutica.

---

# Princípios de UX

## Sessão Primeiro

Toda a experiência deve ser construída em torno da sessão.

O terapeuta deve conseguir iniciar e executar uma sessão com o menor número possível de cliques.

---

## Pouca Escrita

A escrita manual deve ser reduzida ao mínimo.

Prioridade:

1. Seleção visual
2. Cards
3. Botões
4. Ditado por voz
5. Texto manual

---

## Informação Contextual

Informação avançada deve estar disponível mas não deve bloquear terapeutas experientes.

Utilizar:

* drawers
* modais
* painéis expansíveis

---

## Auto Save

Todas as alterações devem ser guardadas automaticamente.

O utilizador nunca deve precisar de clicar em "Guardar".

---

## Responsividade

Desktop:

3 colunas quando aplicável.

Tablet:

2 colunas.

Mobile:

1 coluna ou fluxo wizard.

Aplicar as regras de responsividade já utilizadas no ecossistema.

---

# Estrutura de Navegação

## Dashboard

Página inicial.

Objetivo:

Visão rápida da atividade.

---

## Sessões

Página operacional principal.

Objetivo:

Gerir e iniciar sessões.

---

## Clientes

Gestão de clientes associados ao terapeuta.

---

## Relatórios

Relatórios gerados e partilhados.

---

## Templates

Gestão de templates.

---

## Metodologias

Consulta das metodologias disponíveis.

---

## Perfil

Perfil profissional e certificações.

---

# Dashboard

## Bloco 1

Sessões em Curso

Exemplo:

* Sessão interrompida
* Sessão pausada
* Retomar sessão

---

## Bloco 2

Sessões de Hoje

Exemplo:

* Cliente
* Metodologia
* Hora
* Estado

---

## Bloco 3

Relatórios Pendentes

Exemplo:

* Drafts
* Em revisão

---

## Bloco 4

Clientes Recentes

---

# Página de Sessões

## Secção A

Sessões Agendadas

Mostrar:

* hoje
* próximas
* recentes

Ações:

* iniciar
* continuar
* abrir

---

## Secção B

Nova Sessão

Mostrar metodologias disponíveis em formato de cards.

Exemplo:

* MAP
* Mesa 35
* Mesa 49

Cada card deve apresentar:

* imagem
* nome
* breve descrição

---

# Fluxo de Nova Sessão

Passo 1

Escolher metodologia.

---

Passo 2

Escolher template.

---

Passo 3

Escolher cliente.

Opções:

* cliente existente
* criar novo cliente

---

Passo 4

Iniciar sessão.

---

# Página de Clientes

## Funcionalidades

* pesquisar
* criar
* editar
* consultar histórico

---

## Cartão de Cliente

Mostrar:

* nome
* email
* WhatsApp
* últimas sessões
* próximos agendamentos

---

## Estados do Cliente

contact_only

contact_with_email

hub_user

---

# Página de Templates

## Objetivo

Permitir ao terapeuta criar e gerir templates.

---

## Lista de Templates

Mostrar:

* templates oficiais
* templates personalizados

---

## Ações

* criar
* editar
* duplicar
* arquivar

---

# Builder de Templates

Estrutura:

Template

↓

Blocos

↓

Campos

---

## Drag and Drop

Os blocos devem poder ser reordenados.

---

## Configuração de Blocos

Opções:

* obrigatório
* mostrar na sessão
* mostrar no relatório
* mostrar no HUB
* privado

---

# Página de Relatórios

## Estados

draft

in_review

approved

shared

---

## Funcionalidades

* abrir
* editar
* aprovar
* exportar
* partilhar

---

# Workspace

## Objetivo

Executar sessões terapêuticas.

É o centro da aplicação.

---

# Layout Desktop

```text
┌─────────────┬─────────────────────────────┬─────────────┐
│ Navegação   │ Área de Trabalho            │ Assistente  │
│ da Sessão   │                             │             │
└─────────────┴─────────────────────────────┴─────────────┘
```

---

# Layout Tablet

```text
┌─────────────────────────────┐
│ Navegação                   │
├─────────────────────────────┤
│ Área de Trabalho            │
└─────────────────────────────┘
```

---

# Layout Mobile

Fluxo tipo wizard.

---

# Navegação da Sessão

Mostrar:

* etapas
* progresso
* estado atual

Exemplo:

Preparação ✔

Conexão ✔

Diagnóstico ▶

Ativações ○

Encerramento ○

---

# Tipos de Passo

information

input

options

activation

review

---

# Passos do Tipo Options

Exemplos:

* gráficos
* símbolos angelicais
* chakras
* protocolos

---

# Apresentação

Formato de cards.

Cada card pode apresentar:

* imagem
* nome
* descrição curta

---

# Seleção

Clique para selecionar.

Clique novamente para remover.

---

# Ferramentas Selecionadas

Após seleção:

Mostrar apenas as ferramentas escolhidas.

---

# Tool Grid

## Desktop

3 colunas.

---

## Tablet

2 colunas.

---

## Mobile

1 coluna.

---

# Tool Card

Mostrar:

* imagem
* nome
* estado

Opcional:

* notas
* ditado

---

# Estados da Ferramenta

⚪ Não analisada

🟡 Em análise

🟢 Concluída

⏭ Ignorada

---

# Ajuda Contextual

Botão:

ⓘ

Ao clicar:

Mostrar:

* descrição
* o que faz
* exemplo
* ativação sugerida

---

# Hawkins Selector

Não utilizar:

* dropdown
* slider
* campo numérico

Utilizar:

Cards visuais.

Cada card apresenta:

* frequência
* nome
* cor correspondente

---

# Ditado por Voz

Disponível em:

* sessões
* ferramentas
* relatórios

Fluxo:

🎤

↓

gravação

↓

transcrição

↓

edição opcional

---

# Barra de Estado

Sempre visível.

Exemplo:

Guardado há 3 segundos.

---

# Componentes Frontend

## Sessões

* SessionCard
* SessionProgress
* SessionStatusBadge

---

## Clientes

* ClientCard
* ClientSearch
* ClientSelector

---

## Templates

* TemplateCard
* TemplateBuilder
* TemplateBlock
* TemplateField

---

## Workspace

* ToolCard
* ToolGrid
* HawkinsSelector
* VoiceNoteButton
* StepNavigator
* SessionSidebar

---

## Relatórios

* ReportPreview
* ReportEditor
* ReportShareDialog

---

# Integrações

## AUTH

Autenticação e perfil.

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

Clientes, agenda e origem de sessões.

---

# Não Fazer

Não transformar a RADIONICS num CRM.

Não duplicar funcionalidades do RADIANCE.

Não criar formulários extensos.

Não obrigar o terapeuta a escrever informação que pode ser recolhida através de seleção visual.

Não esconder informação importante atrás de múltiplos níveis de navegação.

---

# Regra Fundamental

A RADIONICS deve comportar-se como uma mesa de trabalho digital.

O terapeuta deve sentir que está a conduzir uma sessão terapêutica.

Não que está a preencher um sistema administrativo.
