# RADIONICS_SESSION_ENGINE.md

# Session Engine

## Objetivo

O Session Engine é o núcleo da RADIONICS.

É responsável por conduzir o terapeuta através de uma metodologia terapêutica estruturada, registando todos os resultados, observações e decisões realizadas durante o atendimento.

Todo o restante sistema da RADIONICS depende deste motor.

Os relatórios, históricos, análises de evolução e futuras funcionalidades de IA utilizam os dados recolhidos pelo Session Engine.

---

# Princípio Fundamental

A sessão é a entidade principal da RADIONICS.

Tudo o resto existe para suportar a sessão.

Exemplos:

* Clientes
* Ferramentas
* Metodologias
* Relatórios
* Evolução

Todos dependem da sessão.

---

# Estrutura Geral

Toda a metodologia deve seguir a seguinte hierarquia:

Metodologia

↓

Fluxo

↓

Etapas

↓

Ferramentas

↓

Resultados

↓

Observações

↓

Relatório

---

# Metodologia

Uma metodologia representa uma abordagem terapêutica disponível na plataforma.

Exemplos:

* MAP
* Mesa dos 35 Gráficos Radiônicos
* Mesa dos 49 Símbolos Angelicais

No futuro:

* Quantec
* Reiki
* Apometria
* Outras metodologias

Cada metodologia possui:

* Nome
* Descrição
* Fluxo
* Ferramentas disponíveis
* Regras próprias

---

# Fluxo

Um fluxo define a sequência lógica da sessão.

Exemplo padrão:

1. Preparação
2. Conexão
3. Diagnóstico
4. Ativações
5. Encerramento

Cada metodologia pode adaptar esta estrutura.

---

# Etapas

As etapas representam grandes momentos da sessão.

Exemplo:

Preparação

Conexão

Diagnóstico

Ativações

Encerramento

---

# Estado das Etapas

Cada etapa pode assumir:

* not_started
* in_progress
* completed
* skipped

O terapeuta pode saltar etapas quando considerar adequado.

A aplicação não deve impedir a adaptação da metodologia à realidade do atendimento.

---

# Ferramentas

Cada metodologia disponibiliza um conjunto de ferramentas.

Exemplo:

Mesa dos 35 Gráficos

Ferramentas:

* Anti Magia
* Luxor
* Anti Possessão
* Desobsessão
* Prosperidade
* etc.

Nem todas as ferramentas precisam de ser utilizadas em todas as sessões.

A utilização é dinâmica.

---

# Resultado de Ferramenta

Sempre que uma ferramenta é analisada, deve ser criado um registo.

Exemplo:

Ferramenta:
Anti Magia

Resultado:
Necessário

Estado:
Identificada

---

# Estado da Ferramenta

Cada ferramenta pode assumir:

* não analisada
* identificada
* ativada
* ignorada

Isto permite distinguir:

Ferramentas encontradas

de

Ferramentas efetivamente utilizadas.

---

# Observações do Terapeuta

Cada etapa e cada ferramenta devem permitir observações livres.

Estas observações representam a interpretação humana do terapeuta.

A interpretação nunca é substituída pela aplicação.

---

# Tipos de Observações

## Texto Manual

Observação escrita pelo terapeuta.

---

## Ditado por Voz

Observação capturada por voz.

A aplicação deve:

* gravar áudio opcionalmente
* transcrever automaticamente
* permitir edição posterior

---

# Guardado Automático

Toda a sessão deve ser guardada continuamente.

Nenhuma informação deve depender da conclusão da sessão.

Sempre que o terapeuta:

* altera um resultado
* escreve uma nota
* utiliza uma ferramenta
* muda de etapa

a informação deve ser persistida.

---

# Sessões Interrompidas

Uma sessão pode ser interrompida em qualquer momento.

Exemplos:

* chamada telefónica
* pausa
* sessão presencial interrompida
* sessão realizada em vários momentos

A RADIONICS deve permitir retomar exatamente no ponto onde ficou.

---

# Estados da Sessão

draft

Sessão criada mas ainda não iniciada.

---

in_progress

Sessão em execução.

---

paused

Sessão temporariamente interrompida.

---

completed

Sessão concluída.

---

reported

Relatório gerado e aprovado.

---

# Cliente

Toda a sessão está associada a um cliente.

O cliente é obtido a partir do RADIANCE.

A RADIONICS não é responsável pela gestão global dos clientes.

---

# Dados Base da Sessão

Toda a sessão deve guardar:

* cliente
* terapeuta
* metodologia
* data
* hora
* objetivo/intenção
* modo de atendimento

---

# Modo de Atendimento

Opções previstas:

* Presencial
* Online
* À Distância

Cada metodologia pode exigir dados adicionais.

Exemplo:

Sessão à distância:

* nome completo
* data de nascimento
* testemunho
* localização atual

---

# Evolução

A sessão deve contribuir para o histórico terapêutico.

Exemplos:

* Hawkins inicial
* Hawkins final
* Ferramentas utilizadas
* Tendências observadas
* Relatórios anteriores

---

# Integração com IA

A IA é consumidora dos dados da sessão.

A IA nunca substitui o terapeuta.

A IA pode:

* transcrever voz
* resumir notas
* organizar observações
* estruturar relatórios

A interpretação permanece responsabilidade do terapeuta.

---

# Geração de Relatório

O relatório não é escrito do zero.

O relatório é construído a partir de:

* resultados
* ferramentas identificadas
* ferramentas ativadas
* observações
* recomendações

O terapeuta revê, complementa e aprova.

---

# Regra Fundamental

O objetivo do Session Engine não é controlar o terapeuta.

O objetivo do Session Engine é acompanhar, documentar e organizar o atendimento terapêutico sem interferir na liberdade profissional do terapeuta.


# ADENDA — CLIENTES

## Princípio Geral

A RADIONICS deve permitir ao terapeuta criar e utilizar clientes independentemente da existência de uma conta HUB.

O objetivo é garantir que a utilização da plataforma não depende da posse de um email ou da adesão prévia ao ecossistema ByElamor.

---

# Tipos de Cliente

## Contact Only

Cliente criado apenas para utilização terapêutica.

Pode conter:

* Nome
* WhatsApp
* Telegram
* Telefone
* Observações

Não possui conta HUB.

Pode participar normalmente em:

* Sessões
* Relatórios
* Histórico terapêutico

---

## Contact With Email

Cliente com endereço de email associado.

Permite:

* Envio de relatórios por email
* Convite para o HUB
* Associação futura a uma conta de utilizador

---

## Hub User

Cliente com conta ativa no HUB.

Pode aceder aos recursos autorizados pelo terapeuta.

Exemplos:

* Relatórios
* Histórico
* Sessões
* Documentos partilhados

---

# Identidade do Cliente

O identificador principal do cliente é sempre o client_id interno do ecossistema.

O email não é obrigatório.

O email é utilizado como mecanismo preferencial para:

* comunicação
* ligação ao HUB
* recuperação de identidade

---

# Criação de Clientes

## Cenário A — Cliente Novo

Se não existir um cliente compatível no ecossistema:

* criar cliente global
* criar relação terapeuta-cliente

Mensagem apresentada:

"Cliente criado com sucesso."

---

## Cenário B — Cliente Existente

Se já existir um cliente compatível:

* reutilizar cliente existente
* criar nova relação terapeuta-cliente

Mensagem apresentada:

"Cliente criado com sucesso."

O terapeuta nunca deve ser exposto à lógica interna de reutilização de clientes.

---

# Propagação para RADIANCE

Sempre que um cliente é criado na RADIONICS:

* o cliente passa a existir no ecossistema
* fica disponível no RADIANCE
* pode ser utilizado noutras aplicações autorizadas

A RADIONICS não mantém uma base de clientes isolada.

---

# ADENDA — GUIDED THERAPEUTIC WORKFLOW

## Estrutura de Navegação

As metodologias devem ser apresentadas em formato de fluxo guiado.

Cada etapa possui:

* AVANÇAR
* SKIP
* VOLTAR

O terapeuta mantém controlo total sobre a condução da sessão.

---

# Apresentação das Ferramentas

Durante o diagnóstico e ativações, as ferramentas não devem ser apresentadas em listas extensas.

A experiência deve ser sequencial.

Exemplo:

Diagnóstico

↓

Anti Magia

↓

AVANÇAR ou SKIP

↓

Luxor

↓

AVANÇAR ou SKIP

↓

Desobsessão

↓

AVANÇAR ou SKIP

---

# Informação Apresentada por Ferramenta

Cada ferramenta pode apresentar:

* Nome
* Descrição
* O que faz
* Exemplo de utilização
* Ativação sugerida

A informação deve apoiar a utilização da metodologia sem substituir os materiais de formação oficiais.

---

# Barra de Progresso da Sessão

A aplicação deve apresentar permanentemente:

* etapa atual
* etapas concluídas
* etapas ignoradas
* ferramenta atual
* progresso geral da sessão

---

# Persistência

Todas as alterações devem ser guardadas automaticamente.

O terapeuta pode:

* fechar a aplicação
* interromper a sessão
* continuar posteriormente

A sessão deve ser retomada exatamente no ponto onde ficou.

---

# Princípio de Liberdade Terapêutica

A RADIONICS guia o terapeuta.

A RADIONICS não controla o terapeuta.

O terapeuta pode:

* saltar ferramentas
* saltar etapas
* regressar a etapas anteriores
* adaptar o atendimento à realidade do cliente

A metodologia é apoiada pela aplicação, mas a decisão terapêutica permanece sempre humana.
