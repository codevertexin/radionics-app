# RADIONICS_TEMPLATE_ENGINE.md

# Template Engine

## Objetivo

O Template Engine permite aos terapeutas definir quais os dados que pretendem recolher durante uma sessão e como esses dados devem ser organizados para gerar os seus relatórios.

O objetivo não é alterar metodologias terapêuticas.

O objetivo é adaptar a recolha e apresentação da informação ao método de trabalho de cada terapeuta.

---

# Princípio Fundamental

As metodologias pertencem à RADIONICS.

Os templates pertencem ao terapeuta.

A metodologia define:

* Fluxo terapêutico
* Ferramentas
* Passos
* Regras da sessão

O template define:

* Dados recolhidos
* Campos apresentados
* Estrutura do relatório
* Informação disponibilizada ao cliente

---

# Hierarquia

Metodologia

↓

Template

↓

Sessão

↓

Dados Recolhidos

↓

Relatório

---

# Tipos de Template

## Template Base

Template oficial disponibilizado pela RADIONICS.

Representa a sequência recomendada pelo criador da metodologia.

Exemplos:

* MAP - Template Oficial
* Mesa 35 - Template Oficial
* Mesa 49 - Template Oficial

---

## Template Personalizado

Criado pelo terapeuta.

Pode ser baseado em:

* Template Base
* Outro Template Personalizado

O terapeuta pode criar múltiplos templates para a mesma metodologia.

---

# Regras dos Templates Base

Os templates base:

* São fornecidos pela RADIONICS
* Não podem ser eliminados
* Não podem ser alterados diretamente
* Podem ser duplicados

Objetivo:

Garantir que existe sempre uma implementação oficial da metodologia.

---

# Regras dos Templates Personalizados

Os templates personalizados podem:

* Alterar ordem dos blocos
* Adicionar blocos
* Remover blocos
* Alterar obrigatoriedade
* Definir visibilidade
* Personalizar relatórios

Os templates personalizados não podem:

* Alterar a metodologia
* Alterar o fluxo terapêutico principal
* Remover ferramentas da metodologia
* Modificar regras da sessão

---

# Estrutura dos Templates

Um template é composto por blocos.

Exemplo:

Identificação do Cliente

↓

Objetivos da Sessão

↓

Histórico Energético

↓

Hawkins

↓

Gráficos

↓

Interpretação Final

↓

Recomendações

---

# Blocos

Os blocos representam grupos de informação.

Exemplos:

* Identificação do Cliente
* Queixa Principal
* Consentimento
* Histórico Energético
* Histórico Emocional
* Dados Gerais de Saúde
* Hawkins
* Chakras
* Gráficos
* Símbolos Angelicais
* Interpretação Final
* Plano de Ação
* Recomendações

---

# Propriedades de um Bloco

Cada bloco possui:

* Nome
* Descrição
* Ordem
* Visibilidade
* Obrigatório
* Ativo

---

# Visibilidade

Cada bloco pode ser configurado para:

## Sessão

Mostrar durante a sessão.

---

## Relatório

Mostrar no relatório.

---

## HUB

Disponibilizar ao cliente.

---

## Privado

Disponível apenas para o terapeuta.

---

# Campos

Cada bloco é composto por campos.

Exemplos:

Nome Completo

Email

WhatsApp

Data de Nascimento

Queixa Principal

Observações

---

# Tipos de Campo

## Texto Curto

Exemplo:

Nome

---

## Texto Longo

Exemplo:

Observações

---

## Seleção Única

Exemplo:

Estado Civil

---

## Seleção Múltipla

Exemplo:

Sintomas

---

## Data

Exemplo:

Data de Nascimento

---

## Número

Exemplo:

Idade

---

## Checkbox

Exemplo:

Consentimento

---

## Imagem

Exemplo:

Fotografia

---

## Áudio

Exemplo:

Nota de voz

---

# Blocos Terapêuticos

Alguns blocos estão ligados ao Session Engine.

Exemplos:

* Hawkins
* Chakras
* Gráficos Radiestésicos
* Símbolos Angelicais
* Protocolos

Estes blocos utilizam os resultados recolhidos durante a sessão.

---

# Template e Sessão

Quando uma sessão é criada:

1. Escolher metodologia
2. Escolher template
3. Gerar estrutura da sessão
4. Iniciar atendimento

O template passa a fazer parte da sessão.

Alterações futuras ao template não devem alterar sessões já realizadas.

---

# Template e Relatório

O relatório é construído com base:

* nos dados recolhidos pela sessão
* nos blocos definidos pelo template
* nas regras de visibilidade

Cada template pode gerar relatórios diferentes para a mesma metodologia.

---

# Template e HUB

Cada bloco pode definir:

Mostrar ao cliente?

Sim ou Não

Isto permite criar:

* relatórios completos
* relatórios resumidos
* notas privadas do terapeuta

---

# Duplicação de Templates

O terapeuta deve poder:

* duplicar templates base
* duplicar templates próprios

Objetivo:

Permitir criação rápida de variantes.

Exemplo:

Mesa 35 - Completo

↓

Duplicar

↓

Mesa 35 - Sessão Express

---

# Gestão de Templates

Cada terapeuta possui a sua própria biblioteca de templates.

Pode:

* criar
* editar
* arquivar
* duplicar

Templates arquivados permanecem associados às sessões antigas.

---

# Compatibilidade Futura

O Template Engine deve ser compatível com futuras metodologias.

Exemplos:

* Quantec
* Apometria
* Reiki
* Tarot
* Numerologia
* Outras terapias integradas

Sem necessidade de alterar o motor principal.

---

# Regra Fundamental

Os templates definem a forma como a informação é recolhida e apresentada.

Os templates nunca alteram a metodologia terapêutica.

A metodologia permanece responsabilidade da RADIONICS.

A personalização permanece responsabilidade do terapeuta.
