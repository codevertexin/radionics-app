# RADIONICS_WORKSPACE.md

# Workspace

## Objetivo

O Workspace é o ambiente principal de trabalho da RADIONICS.

É o local onde o terapeuta executa uma sessão terapêutica, consulta ferramentas, regista observações, utiliza metodologias e acompanha o progresso do atendimento.

O Workspace não deve comportar-se como um formulário tradicional.

O Workspace deve comportar-se como uma mesa de trabalho digital.

---

# Princípio Fundamental

O terapeuta deve passar a maior parte do tempo a analisar o cliente.

Não a preencher campos.

A interface deve reduzir ao máximo a necessidade de escrita manual.

Sempre que possível deve privilegiar:

* seleção visual
* cards
* imagens
* botões
* ditado por voz

---

# Entrada no Workspace

## Sessão Manual

Nova Sessão

↓

Escolher Metodologia

↓

Escolher Template

↓

Escolher Cliente

↓

Iniciar Sessão

↓

Workspace

---

## Sessão Agendada

RADIANCE

↓

Sessão Agendada

↓

Metodologia definida

↓

Cliente definido

↓

Escolher Template

↓

Workspace

---

# Estrutura Geral

O Workspace é composto por:

## Navegação da Sessão

Mostra:

* etapas
* progresso
* estado atual

---

## Área Principal

Mostra:

* passo atual
* ferramentas
* resultados
* notas

---

## Assistente de Apoio

Opcional.

Mostra:

* ajuda contextual
* informações da ferramenta
* resumo da sessão
* histórico relevante

---

# Layout Responsivo

## Desktop

3 áreas principais

```text
┌─────────────┬─────────────────────────────┬─────────────┐
│ Navegação   │ Área de Trabalho            │ Assistente  │
│             │                             │             │
└─────────────┴─────────────────────────────┴─────────────┘
```

---

## Tablet

2 áreas principais

```text
┌─────────────────────────────┐
│ Navegação                   │
├─────────────────────────────┤
│ Área de Trabalho            │
└─────────────────────────────┘
```

---

## Mobile

Fluxo tipo wizard.

Um passo de cada vez.

---

# Navegação da Sessão

Exemplo:

Preparação ✔

Conexão ✔

Diagnóstico ▶

Ativações ○

Encerramento ○

---

# Estados das Etapas

* not_started
* in_progress
* completed
* skipped

---

# Tipos de Passo

## Information

Apresenta informação.

Exemplo:

Introdução à etapa.

---

## Input

Recolhe informação.

Exemplo:

Objetivo da sessão.

---

## Options

Permite selecionar opções.

Exemplo:

Gráficos identificados.

---

## Activation

Executar ferramentas selecionadas.

---

## Review

Resumo antes de concluir.

---

# Passos do Tipo Options

Os passos do tipo Options são fundamentais na RADIONICS.

Exemplos:

* Gráficos Radiestésicos
* Símbolos Angelicais
* Chakras
* Protocolos
* Causas Emocionais

---

# Apresentação das Opções

As opções devem ser apresentadas em formato visual.

Cada opção pode apresentar:

* imagem
* nome
* descrição curta

---

# Seleção

O terapeuta utiliza a metodologia física.

A aplicação apenas regista as opções identificadas.

Exemplo:

✔ Anti Magia

✔ Luxor

✔ Prosperidade

---

# Geração Dinâmica

Após a seleção, a sessão gera automaticamente novos passos.

Exemplo:

Selecionar Gráficos

↓

Anti Magia

↓

Luxor

↓

Prosperidade

---

# Workspace de Ferramentas

Quando existirem múltiplas ferramentas selecionadas, estas devem ser apresentadas em formato de grid.

---

## Desktop

3 colunas

---

## Tablet

2 colunas

---

## Mobile

1 coluna

---

# Card de Ferramenta

Cada ferramenta apresenta:

* imagem
* nome
* estado

Opcionalmente:

* notas
* ditado
* observações

---

# Estados da Ferramenta

⚪ Não analisada

🟡 Em análise

🟢 Concluída

⏭ Ignorada

---

# Informação Avançada

Cada ferramenta possui ajuda contextual.

A ajuda não deve ser apresentada por defeito.

Objetivo:

Não incomodar terapeutas experientes.

---

# Abrir Detalhes

Ao clicar em:

ⓘ

a aplicação apresenta:

* descrição
* o que faz
* exemplo
* ativação sugerida

---

# Modos de Utilização

## Modo Experiente

Mostra:

* imagem
* nome
* estado
* notas

---

## Modo Iniciante

Mostra adicionalmente:

* descrição
* exemplos
* orientações

---

# Hawkins

Não utilizar campos de texto.

Não utilizar sliders.

Deve ser apresentado como seleção visual.

---

# Hawkins Inicial

Cards com:

* cor
* frequência
* estado associado

Exemplo:

150

Raiva

---

310

Vontade

---

500

Amor

---

# Hawkins Final

Mesmo comportamento.

---

# Notas

O terapeuta deve escrever o mínimo possível.

---

# Métodos de Registo

## Texto

Introdução manual.

---

## Ditado

🎤

Transcrição automática.

---

## Seleção

Método preferencial.

---

# Guardado Automático

Toda a sessão é guardada automaticamente.

Sempre que:

* seleciona opção
* altera valor
* adiciona nota
* muda etapa

---

# Sessões Interrompidas

A sessão pode ser interrompida em qualquer momento.

Ao regressar:

* mesma etapa
* mesma ferramenta
* mesmas notas
* mesmo progresso

---

# Barra de Estado

Sempre visível.

Exemplo:

Guardado há 2 segundos

---

# Ações Disponíveis

## Avançar

Próximo passo.

---

## Skip

Ignorar passo.

---

## Voltar

Regressar ao passo anterior.

---

## Pausar

Interromper sessão.

---

## Concluir

Finalizar sessão.

---

# Conclusão da Sessão

Ao concluir:

Session Engine

↓

Compilar Dados

↓

Report Engine

↓

Gerar Draft

↓

Revisão do Terapeuta

↓

Aprovação

---

# Regra Fundamental

O Workspace deve reduzir a carga administrativa do terapeuta.

O terapeuta deve concentrar-se na análise e interpretação.

A aplicação deve concentrar-se na recolha, organização e estruturação da informação.
