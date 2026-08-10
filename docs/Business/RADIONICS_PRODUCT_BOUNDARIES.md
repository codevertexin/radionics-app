# RADIONICS_PRODUCT_BOUNDARIES.md

# Product Boundaries

## Objetivo

Este documento define as fronteiras funcionais da aplicação RADIONICS.

O objetivo é garantir que a aplicação mantém o seu propósito principal ao longo do tempo, evitando sobreposição com outras aplicações do ecossistema ByElamor, especialmente o RADIANCE.

Este documento deve ser considerado uma referência arquitetural permanente para decisões de produto, UX, desenvolvimento e integração.

---

# Missão da RADIONICS

A RADIONICS existe para apoiar a execução de sessões terapêuticas guiadas.

A aplicação foi criada para ajudar terapeutas a:

* Conduzir metodologias terapêuticas estruturadas
* Registar resultados durante a sessão
* Documentar observações e interpretações
* Organizar ativações realizadas
* Gerar relatórios profissionais
* Acompanhar a evolução terapêutica dos clientes

O foco principal da RADIONICS é a sessão terapêutica.

---

# O Que Pertence à RADIONICS

## Metodologias Terapêuticas

A RADIONICS é responsável pela execução das metodologias disponíveis na plataforma.

Exemplos:

* MAP
* Mesa dos 35 Gráficos Radiônicos
* Mesa dos 49 Símbolos Angelicais
* Futuras metodologias compatíveis

---

## Sessões

A RADIONICS é responsável por:

* Criar sessões
* Continuar sessões
* Guardar sessões em rascunho
* Retomar sessões interrompidas
* Concluir sessões

---

## Workspace Terapêutico

A RADIONICS é responsável por:

* Guiar o terapeuta pelos passos da metodologia
* Apresentar ferramentas relevantes
* Registar resultados
* Registar observações
* Permitir ditado por voz
* Guardar automaticamente o progresso

---

## Ferramentas Terapêuticas

A RADIONICS disponibiliza informação operacional sobre cada ferramenta.

Exemplos:

* Nome
* Descrição
* O que faz
* Exemplo de utilização
* Ativação sugerida

A RADIONICS não substitui os materiais de formação do terapeuta.

---

## Relatórios

A RADIONICS é responsável por:

* Compilar os dados da sessão
* Gerar relatórios automaticamente
* Permitir revisão humana
* Permitir edição manual
* Exportar relatórios
* Disponibilizar relatórios ao cliente

---

## Evolução Terapêutica

A RADIONICS é responsável por:

* Histórico de sessões
* Histórico de relatórios
* Evolução Hawkins
* Evolução por metodologia
* Tendências terapêuticas observadas

---

# O Que NÃO Pertence à RADIONICS

## Catálogo Comercial

A RADIONICS não é responsável por:

* Catálogo de terapias
* Serviços comercializados
* Pacotes de atendimento
* Produtos digitais

Responsável:

RADIANCE

---

## Gestão de Preços

A RADIONICS não define:

* Preços
* Promoções
* Descontos
* Planos comerciais

Responsável:

RADIANCE

---

## Pagamentos

A RADIONICS não processa:

* Pagamentos
* Reembolsos
* Assinaturas
* Cobranças

Responsável:

RADIANCE + BILLING

---

## Agenda Global

A RADIONICS não gere:

* Disponibilidade do terapeuta
* Horários
* Calendário profissional
* Marcações globais

Responsável:

RADIANCE

---

## Marketing

A RADIONICS não inclui:

* Campanhas
* Funis
* Landing pages
* Captação de clientes

Responsável:

RADIANCE

---

# Relação com o RADIANCE

O RADIANCE é o Sistema Operativo do Negócio do Terapeuta.

A RADIONICS é o Sistema Operativo da Sessão Terapêutica.

A relação entre ambos deve permanecer clara e consistente.

## Fluxo Esperado

Cliente agenda sessão

↓

RADIANCE

↓

Sessão criada

↓

RADIONICS

↓

Execução terapêutica

↓

Relatório

↓

Cliente

---

# Princípios de Design

## Sessão Primeiro

A entidade principal da RADIONICS é a sessão.

Clientes, ferramentas e relatórios existem para suportar a sessão.

---

## Relatório Como Consequência

O terapeuta não deve escrever relatórios do zero.

Os relatórios devem ser construídos a partir dos dados recolhidos durante a sessão.

---

## Registo Contínuo

Todos os dados devem ser guardados ao longo da sessão.

A perda de informação nunca deve depender da conclusão do atendimento.

---

## Flexibilidade Terapêutica

O terapeuta pode:

* Saltar etapas
* Retomar sessões
* Adaptar a metodologia
* Utilizar apenas parte das ferramentas disponíveis

A aplicação apoia a metodologia, mas não limita a prática profissional.

---

# Inteligência Artificial

A IA é uma ferramenta de apoio.

A IA pode:

* Transcrever ditado
* Organizar notas
* Estruturar relatórios
* Resumir informação

A IA não pode:

* Substituir o terapeuta
* Tomar decisões terapêuticas
* Produzir diagnósticos apresentados como verdade clínica
* Assumir responsabilidade profissional

---

# Regra Fundamental

Sempre que surgir uma dúvida sobre uma nova funcionalidade, deve ser feita a seguinte pergunta:

"Esta funcionalidade ajuda o terapeuta a executar uma sessão terapêutica?"

Se a resposta for não, a funcionalidade provavelmente pertence ao RADIANCE e não à RADIONICS.
