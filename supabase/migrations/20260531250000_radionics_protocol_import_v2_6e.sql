-- =============================================================================
-- RADIONICS — Phase V2.6E: Protocol import (28 Protocolos Especiais)
-- Source: docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt (28 protocols, V2.6E validation passed)
-- Specialty: mesa-49 (RLS visibility; links angel-set-49 + graph-set-35 assets)
-- Idempotent. No invented content.
-- =============================================================================

do $$
declare
  v_specialty_id uuid;
  v_protocol_count integer := 28;
  v_protocols_upserted integer;
  v_assets_linked integer;
  v_steps_upserted integer;
  v_missing_assets integer;
begin
  select id into v_specialty_id
  from public.radionics_specialties
  where slug = 'mesa-49';

  if v_specialty_id is null then
    raise exception 'radionics_specialties slug ''mesa-49'' is required.';
  end if;

  create temp table _v26e_protocols (
    sort_order integer not null,
    code text not null,
    slug text not null,
    name text not null,
    description text not null,
    why_activate text not null,
    source_protocol_num integer not null,
    primary key (slug)
  ) on commit drop;

  insert into _v26e_protocols (
    sort_order, code, slug, name, description, why_activate, source_protocol_num
  ) values
  (
    1,
    'P01',
    'protocolo-01-medos',
    $k$Medos$k$,
    $k$Libertar o consulente de medos conscientes e inconscientes que o paralisam, causam sabotagem e bloqueiam suas ações.$k$,
    $k$O medo é uma das frequências mais baixas e afasta o fluxo de ação e merecimento. Este protocolo limpa a raiz vibracional e espiritual do medo, ativando coragem, clareza e segurança interior.$k$,
    1
  ),
  (
    2,
    'P02',
    'protocolo-02-culpas',
    $k$Culpas$k$,
    $k$Limpar vibrações de culpa e autopunição que impedem o merecimento e bloqueiam a prosperidade.$k$,
    $k$A culpa aprisiona a alma em repetições e sabotagens. Este protocolo cura registros inconscientes, restaura o merecimento e liberta o consulente do peso emocional.$k$,
    2
  ),
  (
    3,
    'P03',
    'protocolo-03-tristeza-e-depressao',
    $k$Tristeza e Depressão$k$,
    $k$Dissolver sentimentos de tristeza profunda, apatia, cansaço da alma e desconexão com o sentido da vida.$k$,
    $k$A tristeza profunda cria um colapso energético. Este protocolo traz luz à alma, eleva a vibração e restaura a alegria de viver.$k$,
    3
  ),
  (
    4,
    'P04',
    'protocolo-04-ansiedade',
    $k$Ansiedade$k$,
    $k$Reduzir agitação mental, expectativas exageradas e excesso de pensamentos sobre o futuro.$k$,
    $k$A ansiedade nasce da desconexão com o momento presente. Este protocolo limpa a mente e ancora o campo na segurança interna.$k$,
    4
  ),
  (
    5,
    'P05',
    'protocolo-05-prosperidade-e-abundancia',
    $k$Prosperidade e Abundância$k$,
    $k$Ativar o fluxo da prosperidade e romper com padrões vibracionais de escassez, culpa financeira e autossabotagem.$k$,
    $k$A prosperidade é um estado vibracional de merecimento e fluidez. Este protocolo limpa bloqueios e abre caminhos com expansão e consciência.$k$,
    5
  ),
  (
    6,
    'P06',
    'protocolo-06-aumento-de-vendas-e-clientes',
    $k$Aumento de Vendas e Clientes$k$,
    $k$Destravar o campo de atração de clientes, visibilidade e expansão profissional.$k$,
    $k$A energia do negócio é extensão do campo pessoal. Este protocolo alinha magnetismo, confiança e presença para atrair oportunidades com fluidez.$k$,
    6
  ),
  (
    7,
    'P07',
    'protocolo-07-clareza-e-criatividade',
    $k$Clareza e Criatividade$k$,
    $k$Desbloquear o fluxo criativo, expandir visão e clarear ideias e decisões.$k$,
    $k$A confusão mental bloqueia o campo criativo. Este protocolo ativa centros mentais superiores e permite que novas ideias fluam.$k$,
    7
  ),
  (
    8,
    'P08',
    'protocolo-08-emagrecimento-consciente',
    $k$Emagrecimento Consciente$k$,
    $k$Auxiliar na perda de peso de forma vibracional, limpando compulsões, autossabotagem e peso emocional.$k$,
    $k$Sobrepeso carrega registros emocionais, traumas e proteção. Este protocolo ativa leveza, foco e autopercepção consciente do corpo.$k$,
    8
  ),
  (
    9,
    'P09',
    'protocolo-09-saude-e-vitalidade',
    $k$Saúde e Vitalidade$k$,
    $k$Restaurar energia vital, elevar imunidade, sustentar cura física, emocional e vibracional.$k$,
    $k$Vitalidade é fluxo livre de energia. Este protocolo ativa centros energéticos, dissolve cansaço e fortalece o campo físico.$k$,
    9
  ),
  (
    10,
    'P10',
    'protocolo-10-harmonizacao-e-protecao-energetica',
    $k$Harmonização e Proteção Energética$k$,
    $k$Proteger o campo vibracional contra-ataques espirituais, inveja, carga coletiva e interferências sutis.$k$,
    $k$Pessoas sensíveis ou que trabalham com energia precisam de proteção constante. Este protocolo ancora luz, autoridade espiritual e blindagem energética.$k$,
    10
  ),
  (
    11,
    'P11',
    'protocolo-11-harmonizacao-de-relacionamentos',
    $k$Harmonização de Relacionamentos$k$,
    $k$Curar laços afetivos, familiares ou profissionais, restaurando conexão, empatia e entendimento.$k$,
    $k$Relações adoecem por mágoas, padrões herdados ou comunicação falha. Este protocolo dissolve interferências e fortalece vínculos saudáveis.$k$,
    11
  ),
  (
    12,
    'P12',
    'protocolo-12-procrastinacao-e-autossabotagem',
    $k$Procrastinação e Autossabotagem$k$,
    $k$Desbloquear a energia da ação, romper com adiamentos e insegurança.$k$,
    $k$A autossabotagem é sintoma de falta de foco e medo inconsciente. Este protocolo ativa clareza, impulso e comprometimento.$k$,
    12
  ),
  (
    13,
    'P13',
    'protocolo-13-libertacao-karmica',
    $k$Libertação Kármica$k$,
    $k$Dissolver registros de vidas passadas, padrões espirituais repetitivos e pactos inconscientes.$k$,
    $k$O karma não é castigo, é aprendizado. Este protocolo promove compreensão, liberação e elevação vibracional.$k$,
    13
  ),
  (
    14,
    'P14',
    'protocolo-14-autoestima-e-amor-proprio',
    $k$Autoestima e Amor Próprio$k$,
    $k$Fortalecer o vínculo com a própria autoestima, autoimagem, resgatando autovalor e aceitação.$k$,
    $k$Sem autoestima, tudo enfraquece: relações, finanças, presença. Este protocolo ancora amor-próprio e empoderamento sutil.$k$,
    14
  ),
  (
    15,
    'P15',
    'protocolo-15-proposito-e-missao',
    $k$Propósito e Missão$k$,
    $k$Reconectar o consulente ao seu chamado de alma, despertando seus talentos espirituais.$k$,
    $k$Desalinhamento com o propósito causa insatisfação, bloqueios e estagnação. Este protocolo ativa direção, clareza e força de realização.$k$,
    15
  ),
  (
    16,
    'P16',
    'protocolo-16-cortes-ancestrais-e-padroes-familiares-negativos',
    $k$Cortes Ancestrais e Padrões Familiares Negativos$k$,
    $k$Romper laços de dor herdados, lealdades invisíveis e repetições sistêmicas que aprisionam o consulente ao passado familiar.$k$,
    $k$A alma carrega padrões ancestrais que não lhe pertencem. Este protocolo limpa vínculos tóxicos, libera o campo e fortalece a identidade espiritual.$k$,
    16
  ),
  (
    17,
    'P17',
    'protocolo-17-harmonizacao-de-vidas-passadas',
    $k$Harmonização de Vidas Passadas$k$,
    $k$Ressignificar registros de vidas anteriores que afetam a realidade atual com dor, medo ou bloqueios sutis.$k$,
    $k$Quando não curadas, as memórias de outras encarnações reverberam nos corpos sutis. Este protocolo promove cura multidimensional.$k$,
    17
  ),
  (
    18,
    'P18',
    'protocolo-18-harmonizacao-e-restauracao-da-aura',
    $k$Harmonização e Restauração da Aura$k$,
    $k$Recompor a integridade da aura, curar rasgos nos corpos sutis e fortalecer o campo energético.$k$,
    $k$A aura danificada deixa o consulente vulnerável. Este protocolo sela, energiza e limpa todos os corpos com firmeza e delicadeza.$k$,
    18
  ),
  (
    19,
    'P19',
    'protocolo-19-divorcio-energetico',
    $k$Divórcio Energético$k$,
    $k$Cortar laços energéticos com ex-parceiros, votos inconscientes e vínculos emocionais que ainda conectam o campo ao passado.$k$,
    $k$Mesmo após o fim de uma relação, resíduos energéticos e padrões de apego permanecem. Este protocolo limpa e sela o campo.$k$,
    19
  ),
  (
    20,
    'P20',
    'protocolo-20-abusos-emocional-fisico-energetico-ou-espiritual',
    $k$Abusos (Emocional, Físico, Energético ou Espiritual)$k$,
    $k$Curar feridas profundas de violação física, emocional ou espiritual, restaurando o poder pessoal e a segurança interna.$k$,
    $k$O trauma do abuso fragmenta a alma. Este protocolo reintegra o campo, dissolve medo e restaura a integridade e a soberania energética.$k$,
    20
  ),
  (
    21,
    'P21',
    'protocolo-21-limpeza-uterina-e-cura-do-feminino',
    $k$Limpeza Uterina e Cura do Feminino$k$,
    $k$Liberar memórias energéticas de dor, traumas, relações passadas e repressões femininas armazenadas no centro criador.$k$,
    $k$O útero é um portal de criação e intuição. Quando limpo, ativa força pessoal, magnetismo e reconexão com o feminino sagrado.$k$,
    21
  ),
  (
    22,
    'P22',
    'protocolo-22-abertura-de-merecimento-e-possibilidades',
    $k$Abertura de Merecimento e Possibilidades$k$,
    $k$Desbloquear crenças de escassez, culpa ou inferioridade que impedem o fluxo de abundância e oportunidades.$k$,
    $k$O merecimento vibra no campo da autoestima. Quando aberto, tudo flui com mais leveza: amor, reconhecimento, prosperidade.$k$,
    22
  ),
  (
    23,
    'P23',
    'protocolo-23-esgotamento-mental-e-pensamentos-intrusivos',
    $k$Esgotamento Mental e Pensamentos Intrusivos$k$,
    $k$Reduzir excesso de pensamentos, ruídos mentais e cansaço cognitivo. Restaurar o foco e a tranquilidade.$k$,
    $k$A mente acelerada drena a energia e desconecta da intuição. Este protocolo silencia o ruído interno e promove clareza.$k$,
    23
  ),
  (
    24,
    'P24',
    'protocolo-24-encerramento-de-ciclos-e-inicio-de-novos-caminhos',
    $k$Encerramento de Ciclos e Início de Novos Caminhos$k$,
    $k$Finalizar ciclos energéticos, emocionais ou relacionais que já não ressoam, abrindo espaço para o novo com leveza e consciência.$k$,
    $k$O novo só entra quando o velho é liberado. Este protocolo limpa o campo, fecha portais antigos e prepara para novas experiências.$k$,
    24
  ),
  (
    25,
    'P25',
    'protocolo-25-autoconfianca-e-comunicacao-verdadeira',
    $k$Autoconfiança e Comunicação Verdadeira$k$,
    $k$Fortalecer a segurança interior e liberar a expressão da verdade com clareza, firmeza e amor.$k$,
    $k$Muitas pessoas travam por medo de julgamento ou rejeição. Este protocolo ativa o chakra laríngeo e fortalece o eu autêntico.$k$,
    25
  ),
  (
    26,
    'P26',
    'protocolo-26-equilibrio-da-raiva-e-impulsos-emocionais',
    $k$Equilíbrio da Raiva e Impulsos Emocionais$k$,
    $k$Harmonizar emoções intensas como raiva, frustração e impulsividade, transformando-as em ação consciente.$k$,
    $k$A raiva acumulada adoece o corpo e distorce relações. Este protocolo limpa a raiz emocional e redireciona essa força para atitudes construtivas.$k$,
    26
  ),
  (
    27,
    'P27',
    'protocolo-27-soltar-o-passado-e-deixar-fluir',
    $k$Soltar o Passado e Deixar Fluir$k$,
    $k$Libertar o consulente de apegos, mágoas antigas, dores emocionais e vínculos vibracionais com o passado.$k$,
    $k$Quem não solta o velho, impede o novo de entrar. Este protocolo dissolve amarras emocionais e traz fluidez e presença.$k$,
    27
  ),
  (
    28,
    'P28',
    'protocolo-28-alegria-humor-e-felicidade',
    $k$Alegria, Humor e Felicidade$k$,
    $k$Ressignificar a vida com leveza, alegria e gratidão, ativando estados emocionais de entusiasmo, riso e prazer de viver.$k$,
    $k$A vibração da alegria acelera processos de cura e manifestação. Este protocolo devolve brilho à alma e desperta a leveza da existência.$k$,
    28
  );

  create temp table _v26e_protocol_assets (
    protocol_slug text not null,
    asset_slug text not null,
    asset_role text not null,
    tool_slug text not null,
    sort_order integer not null,
    source_num integer not null,
    source_label text not null
  ) on commit drop;

  insert into _v26e_protocol_assets (
    protocol_slug, asset_slug, asset_role, tool_slug, sort_order, source_num, source_label
  ) values
('protocolo-01-medos', 'angel-confidence', 'angel', 'angel-set-49', 1, 21, $k$Anjo da Confiança$k$),
('protocolo-01-medos', 'angel-hope', 'angel', 'angel-set-49', 2, 26, $k$Anjo da Esperança$k$),
('protocolo-01-medos', 'angel-courage', 'angel', 'angel-set-49', 3, 30, $k$Anjo da Coragem$k$),
('protocolo-01-medos', 'archangel-michael', 'archangel', 'angel-set-49', 4, 37, $k$Arcanjo Miguel$k$),
('protocolo-01-medos', 'angel-focus-discipline', 'angel', 'angel-set-49', 5, 47, $k$Anjo do Foco e Disciplina$k$),
('protocolo-01-medos', 'anti-possessao', 'graph', 'graph-set-35', 6, 1, $k$Anti Possessão$k$),
('protocolo-01-medos', 'energizador', 'graph', 'graph-set-35', 7, 15, $k$Energizador$k$),
('protocolo-01-medos', 'anti-dor', 'graph', 'graph-set-35', 8, 16, $k$Anti Dor$k$),
('protocolo-02-culpas', 'angel-purity', 'angel', 'angel-set-49', 1, 11, $k$Anjo da Pureza$k$),
('protocolo-02-culpas', 'angel-self-esteem', 'angel', 'angel-set-49', 2, 29, $k$Anjo da Autoestima$k$),
('protocolo-02-culpas', 'archangel-raziel', 'archangel', 'angel-set-49', 3, 34, $k$Arcanjo Raziel$k$),
('protocolo-02-culpas', 'angel-forgiveness', 'angel', 'angel-set-49', 4, 44, $k$Perdão$k$),
('protocolo-02-culpas', 'angel-wellbeing', 'angel', 'angel-set-49', 5, 45, $k$Bem-estar$k$),
('protocolo-02-culpas', 'saude-financeira', 'graph', 'graph-set-35', 6, 9, $k$Saúde Financeira$k$),
('protocolo-02-culpas', 'desimpregnador', 'graph', 'graph-set-35', 7, 12, $k$Desimpregnador$k$),
('protocolo-02-culpas', 'cruz-ansata', 'graph', 'graph-set-35', 8, 34, $k$Cruz Ansata$k$),
('protocolo-03-tristeza-e-depressao', 'angel-healing', 'angel', 'angel-set-49', 1, 2, $k$Anjo para Cura Interior$k$),
('protocolo-03-tristeza-e-depressao', 'angel-peace', 'angel', 'angel-set-49', 2, 13, $k$Anjo da Paz$k$),
('protocolo-03-tristeza-e-depressao', 'angel-joy', 'angel', 'angel-set-49', 3, 14, $k$Anjo da Alegria$k$),
('protocolo-03-tristeza-e-depressao', 'angel-transformation', 'angel', 'angel-set-49', 4, 19, $k$Anjo da Transformação$k$),
('protocolo-03-tristeza-e-depressao', 'archangel-raphael', 'archangel', 'angel-set-49', 5, 35, $k$Arcanjo Rafael$k$),
('protocolo-03-tristeza-e-depressao', 'anti-depressao', 'graph', 'graph-set-35', 6, 6, $k$Anti Depressão$k$),
('protocolo-03-tristeza-e-depressao', 'magnetismo-curativo', 'graph', 'graph-set-35', 7, 7, $k$Magnetismo Curativo$k$),
('protocolo-03-tristeza-e-depressao', 'sol-da-vida', 'graph', 'graph-set-35', 8, 14, $k$Sol da Vida$k$),
('protocolo-04-ansiedade', 'angel-magic', 'angel', 'angel-set-49', 1, 1, $k$Anjo da Magia Divina$k$),
('protocolo-04-ansiedade', 'angel-lightness', 'angel', 'angel-set-49', 2, 4, $k$Anjo da Leveza$k$),
('protocolo-04-ansiedade', 'angel-illumination', 'angel', 'angel-set-49', 3, 17, $k$Anjo da Iluminação e Consciência$k$),
('protocolo-04-ansiedade', 'angel-communication', 'angel', 'angel-set-49', 4, 32, $k$Anjo da Comunicação$k$),
('protocolo-04-ansiedade', 'archangel-gabriel', 'archangel', 'angel-set-49', 5, 36, $k$Arcanjo Gabriel$k$),
('protocolo-04-ansiedade', 'yoshua', 'graph', 'graph-set-35', 6, 3, $k$Yoshua$k$),
('protocolo-04-ansiedade', 'desembaracador-relacionamentos', 'graph', 'graph-set-35', 7, 26, $k$Desembaraçador de Relacionamento$k$),
('protocolo-04-ansiedade', 'cruz-ansata', 'graph', 'graph-set-35', 8, 34, $k$Cruz Ansata$k$),
('protocolo-05-prosperidade-e-abundancia', 'angel-personal-power', 'angel', 'angel-set-49', 1, 5, $k$Anjo do Poder Pessoal$k$),
('protocolo-05-prosperidade-e-abundancia', 'angel-prosperity', 'angel', 'angel-set-49', 2, 15, $k$Anjo da Prosperidade$k$),
('protocolo-05-prosperidade-e-abundancia', 'angel-abundance', 'angel', 'angel-set-49', 3, 20, $k$Anjo da Abundância$k$),
('protocolo-05-prosperidade-e-abundancia', 'angel-gratitude', 'angel', 'angel-set-49', 4, 33, $k$Anjo da Gratidão$k$),
('protocolo-05-prosperidade-e-abundancia', 'archangel-uriel', 'archangel', 'angel-set-49', 5, 38, $k$Arcanjo Uriel$k$),
('protocolo-05-prosperidade-e-abundancia', 'turbilhao-jupiter', 'graph', 'graph-set-35', 6, 8, $k$Turbilhão Júpiter$k$),
('protocolo-05-prosperidade-e-abundancia', 'saude-financeira', 'graph', 'graph-set-35', 7, 9, $k$Saúde Financeira$k$),
('protocolo-05-prosperidade-e-abundancia', 'prosperador', 'graph', 'graph-set-35', 8, 27, $k$Prosperador$k$),
('protocolo-06-aumento-de-vendas-e-clientes', 'angel-personal-power', 'angel', 'angel-set-49', 1, 5, $k$Anjo do Poder Pessoal$k$),
('protocolo-06-aumento-de-vendas-e-clientes', 'angel-abundance', 'angel', 'angel-set-49', 2, 20, $k$Anjo da Abundância$k$),
('protocolo-06-aumento-de-vendas-e-clientes', 'angel-confidence', 'angel', 'angel-set-49', 3, 21, $k$Anjo da Confiança$k$),
('protocolo-06-aumento-de-vendas-e-clientes', 'angel-gratitude', 'angel', 'angel-set-49', 4, 33, $k$Anjo da Gratidão$k$),
('protocolo-06-aumento-de-vendas-e-clientes', 'archangel-metatron', 'archangel', 'angel-set-49', 5, 40, $k$Arcanjo Metatron$k$),
('protocolo-06-aumento-de-vendas-e-clientes', 'turbilhao-jupiter', 'graph', 'graph-set-35', 6, 8, $k$Turbilhão Júpiter$k$),
('protocolo-06-aumento-de-vendas-e-clientes', 'sorte-sucesso', 'graph', 'graph-set-35', 7, 24, $k$Sorte e Sucesso$k$),
('protocolo-06-aumento-de-vendas-e-clientes', 'cubo-metatron', 'graph', 'graph-set-35', 8, 25, $k$Cubo de Metatron$k$),
('protocolo-07-clareza-e-criatividade', 'angel-guidance', 'angel', 'angel-set-49', 1, 3, $k$Anjo para Direcionamento$k$),
('protocolo-07-clareza-e-criatividade', 'angel-wisdom', 'angel', 'angel-set-49', 2, 7, $k$Anjo da Sabedoria$k$),
('protocolo-07-clareza-e-criatividade', 'angel-clarity', 'angel', 'angel-set-49', 3, 8, $k$Anjo da Clareza$k$),
('protocolo-07-clareza-e-criatividade', 'angel-communication', 'angel', 'angel-set-49', 4, 32, $k$Anjo da Comunicação$k$),
('protocolo-07-clareza-e-criatividade', 'archangel-raziel', 'archangel', 'angel-set-49', 5, 34, $k$Arcanjo Raziel$k$),
('protocolo-07-clareza-e-criatividade', 'triturador', 'graph', 'graph-set-35', 6, 2, $k$Triturador$k$),
('protocolo-07-clareza-e-criatividade', 'revitalizador-chakras', 'graph', 'graph-set-35', 7, 21, $k$Revitalizador de Chakras$k$),
('protocolo-07-clareza-e-criatividade', 'piramide-tao', 'graph', 'graph-set-35', 8, 29, $k$Pirâmide Tao$k$),
('protocolo-08-emagrecimento-consciente', 'angel-purity', 'angel', 'angel-set-49', 1, 11, $k$Anjo da Pureza$k$),
('protocolo-08-emagrecimento-consciente', 'angel-commitment', 'angel', 'angel-set-49', 2, 28, $k$Anjo do Comprometimento$k$),
('protocolo-08-emagrecimento-consciente', 'angel-self-esteem', 'angel', 'angel-set-49', 3, 29, $k$Anjo da Autoestima$k$),
('protocolo-08-emagrecimento-consciente', 'angel-wellbeing', 'angel', 'angel-set-49', 4, 45, $k$Bem-estar$k$),
('protocolo-08-emagrecimento-consciente', 'angel-transmutation', 'angel', 'angel-set-49', 5, 46, $k$Transmutação$k$),
('protocolo-08-emagrecimento-consciente', 'quadrata', 'graph', 'graph-set-35', 6, 5, $k$Quadrata$k$),
('protocolo-08-emagrecimento-consciente', 'anti-depressao', 'graph', 'graph-set-35', 7, 6, $k$Anti Depressão$k$),
('protocolo-08-emagrecimento-consciente', 'piramide-tao', 'graph', 'graph-set-35', 8, 29, $k$Pirâmide Tao$k$),
('protocolo-09-saude-e-vitalidade', 'angel-healing', 'angel', 'angel-set-49', 1, 2, $k$Anjo para Cura Interior$k$),
('protocolo-09-saude-e-vitalidade', 'angel-passion', 'angel', 'angel-set-49', 2, 27, $k$Anjo da Paixão$k$),
('protocolo-09-saude-e-vitalidade', 'archangel-raphael', 'archangel', 'angel-set-49', 3, 35, $k$Arcanjo Rafael$k$),
('protocolo-09-saude-e-vitalidade', 'angel-wellbeing', 'angel', 'angel-set-49', 4, 45, $k$Bem-estar$k$),
('protocolo-09-saude-e-vitalidade', 'angel-perfect-health', 'angel', 'angel-set-49', 5, 49, $k$Saúde Perfeita$k$),
('protocolo-09-saude-e-vitalidade', 'magnetismo-curativo', 'graph', 'graph-set-35', 6, 7, $k$Magnetismo Curativo$k$),
('protocolo-09-saude-e-vitalidade', 'revitalizador-chakras', 'graph', 'graph-set-35', 7, 21, $k$Revitalizador de Chakras$k$),
('protocolo-09-saude-e-vitalidade', 'alta-vitalidade', 'graph', 'graph-set-35', 8, 33, $k$Alta Vitalidade$k$),
('protocolo-10-harmonizacao-e-protecao-energetica', 'angel-magic', 'angel', 'angel-set-49', 1, 1, $k$Anjo da Magia Divina$k$),
('protocolo-10-harmonizacao-e-protecao-energetica', 'angel-compassion', 'angel', 'angel-set-49', 2, 22, $k$Anjo da Compaixão$k$),
('protocolo-10-harmonizacao-e-protecao-energetica', 'archangel-michael', 'archangel', 'angel-set-49', 3, 37, $k$Arcanjo Miguel$k$),
('protocolo-10-harmonizacao-e-protecao-energetica', 'archangel-metatron', 'archangel', 'angel-set-49', 4, 40, $k$Arcanjo Metatron$k$),
('protocolo-10-harmonizacao-e-protecao-energetica', 'angel-harmony', 'angel', 'angel-set-49', 5, 43, $k$Harmonia$k$),
('protocolo-10-harmonizacao-e-protecao-energetica', 'justica-divina', 'graph', 'graph-set-35', 6, 13, $k$Justiça Divina$k$),
('protocolo-10-harmonizacao-e-protecao-energetica', 'heptapentagrama', 'graph', 'graph-set-35', 7, 20, $k$Heptapentagrama$k$),
('protocolo-10-harmonizacao-e-protecao-energetica', 'cubo-metatron', 'graph', 'graph-set-35', 8, 25, $k$Cubo de Metraton$k$),
('protocolo-11-harmonizacao-de-relacionamentos', 'angel-unconditional-love', 'angel', 'angel-set-49', 1, 6, $k$Anjo do Amor Incondicional$k$),
('protocolo-11-harmonizacao-de-relacionamentos', 'angel-empathy', 'angel', 'angel-set-49', 2, 24, $k$Anjo da Empatia$k$),
('protocolo-11-harmonizacao-de-relacionamentos', 'angel-union', 'angel', 'angel-set-49', 3, 41, $k$União$k$),
('protocolo-11-harmonizacao-de-relacionamentos', 'angel-harmony', 'angel', 'angel-set-49', 4, 43, $k$Harmonia$k$),
('protocolo-11-harmonizacao-de-relacionamentos', 'angel-forgiveness', 'angel', 'angel-set-49', 5, 44, $k$Perdão$k$),
('protocolo-11-harmonizacao-de-relacionamentos', 'desimpregnador', 'graph', 'graph-set-35', 6, 12, $k$Desimpregnador$k$),
('protocolo-11-harmonizacao-de-relacionamentos', 'desembaracador-relacionamentos', 'graph', 'graph-set-35', 7, 26, $k$Desembaraçador de Relacionamento$k$),
('protocolo-11-harmonizacao-de-relacionamentos', 'vesica-piscis', 'graph', 'graph-set-35', 8, 35, $k$Vesica Piscis$k$),
('protocolo-12-procrastinacao-e-autossabotagem', 'angel-guidance', 'angel', 'angel-set-49', 1, 3, $k$Anjo para Direcionamento$k$),
('protocolo-12-procrastinacao-e-autossabotagem', 'angel-personal-power', 'angel', 'angel-set-49', 2, 5, $k$Anjo do Poder Pessoal$k$),
('protocolo-12-procrastinacao-e-autossabotagem', 'angel-confidence', 'angel', 'angel-set-49', 3, 21, $k$Anjo da Confiança$k$),
('protocolo-12-procrastinacao-e-autossabotagem', 'angel-commitment', 'angel', 'angel-set-49', 4, 28, $k$Anjo do Comprometimento$k$),
('protocolo-12-procrastinacao-e-autossabotagem', 'angel-focus-discipline', 'angel', 'angel-set-49', 5, 47, $k$Anjo do Foco e Disciplina$k$),
('protocolo-12-procrastinacao-e-autossabotagem', 'quadrata', 'graph', 'graph-set-35', 6, 5, $k$Quadrata$k$),
('protocolo-12-procrastinacao-e-autossabotagem', 'energizador', 'graph', 'graph-set-35', 7, 15, $k$Energizador$k$),
('protocolo-12-procrastinacao-e-autossabotagem', 'kit-cromo', 'graph', 'graph-set-35', 8, 32, $k$Kit Cromo$k$),
('protocolo-13-libertacao-karmica', 'angel-purpose', 'angel', 'angel-set-49', 1, 12, $k$Anjo do Propósito e Missão$k$),
('protocolo-13-libertacao-karmica', 'angel-liberation', 'angel', 'angel-set-49', 2, 18, $k$Anjo da Libertação$k$),
('protocolo-13-libertacao-karmica', 'archangel-raziel', 'archangel', 'angel-set-49', 3, 34, $k$Arcanjo Raziel$k$),
('protocolo-13-libertacao-karmica', 'archangel-metatron', 'archangel', 'angel-set-49', 4, 40, $k$Arcanjo Metatron$k$),
('protocolo-13-libertacao-karmica', 'angel-transmutation', 'angel', 'angel-set-49', 5, 46, $k$Transmutação$k$),
('protocolo-13-libertacao-karmica', 'turbilhao-jupiter', 'graph', 'graph-set-35', 6, 8, $k$Turbilhão Júpiter$k$),
('protocolo-13-libertacao-karmica', 'piramide-tao', 'graph', 'graph-set-35', 7, 29, $k$Pirâmide Tao$k$),
('protocolo-13-libertacao-karmica', 'kit-cromo', 'graph', 'graph-set-35', 8, 32, $k$Kit Cromo$k$),
('protocolo-14-autoestima-e-amor-proprio', 'angel-unconditional-love', 'angel', 'angel-set-49', 1, 6, $k$Anjo do Amor Incondicional$k$),
('protocolo-14-autoestima-e-amor-proprio', 'angel-satisfaction', 'angel', 'angel-set-49', 2, 25, $k$Anjo da Satisfação$k$),
('protocolo-14-autoestima-e-amor-proprio', 'angel-self-esteem', 'angel', 'angel-set-49', 3, 29, $k$Anjo da Autoestima$k$),
('protocolo-14-autoestima-e-amor-proprio', 'angel-gratitude', 'angel', 'angel-set-49', 4, 33, $k$Anjo da Gratidão$k$),
('protocolo-14-autoestima-e-amor-proprio', 'angel-wellbeing', 'angel', 'angel-set-49', 5, 45, $k$Bem-estar$k$),
('protocolo-14-autoestima-e-amor-proprio', 'yoshua', 'graph', 'graph-set-35', 6, 3, $k$Yoshua$k$),
('protocolo-14-autoestima-e-amor-proprio', 'scap-cabalista', 'graph', 'graph-set-35', 7, 22, $k$Scap$k$),
('protocolo-14-autoestima-e-amor-proprio', 'turbilhao-prosperador', 'graph', 'graph-set-35', 8, 31, $k$Turbilhão Prosperador$k$),
('protocolo-15-proposito-e-missao', 'angel-wisdom', 'angel', 'angel-set-49', 1, 7, $k$Anjo da Sabedoria$k$),
('protocolo-15-proposito-e-missao', 'angel-clarity', 'angel', 'angel-set-49', 2, 8, $k$Anjo da Clareza$k$),
('protocolo-15-proposito-e-missao', 'angel-purpose', 'angel', 'angel-set-49', 3, 12, $k$Anjo do Propósito e Missão$k$),
('protocolo-15-proposito-e-missao', 'angel-illumination', 'angel', 'angel-set-49', 4, 17, $k$Anjo da Iluminação e Consciência$k$),
('protocolo-15-proposito-e-missao', 'archangel-raziel', 'archangel', 'angel-set-49', 5, 34, $k$Arcanjo Raziel$k$),
('protocolo-15-proposito-e-missao', 'luxor', 'graph', 'graph-set-35', 6, 4, $k$Luxor$k$),
('protocolo-15-proposito-e-missao', 'iave-sete-circulos', 'graph', 'graph-set-35', 7, 18, $k$Iavé – Sete Círculos$k$),
('protocolo-15-proposito-e-missao', 'antakarana', 'graph', 'graph-set-35', 8, 28, $k$Antakarana$k$),
('protocolo-16-cortes-ancestrais-e-padroes-familiares-negativos', 'angel-transformation', 'angel', 'angel-set-49', 1, 19, $k$Anjo da Transformação$k$),
('protocolo-16-cortes-ancestrais-e-padroes-familiares-negativos', 'archangel-raziel', 'archangel', 'angel-set-49', 2, 34, $k$Arcanjo Raziel$k$),
('protocolo-16-cortes-ancestrais-e-padroes-familiares-negativos', 'archangel-uriel', 'archangel', 'angel-set-49', 3, 38, $k$Arcanjo Uriel$k$),
('protocolo-16-cortes-ancestrais-e-padroes-familiares-negativos', 'angel-forgiveness', 'angel', 'angel-set-49', 4, 44, $k$Perdão$k$),
('protocolo-16-cortes-ancestrais-e-padroes-familiares-negativos', 'angel-transmutation', 'angel', 'angel-set-49', 5, 46, $k$Transmutação$k$),
('protocolo-16-cortes-ancestrais-e-padroes-familiares-negativos', 'dissipador', 'graph', 'graph-set-35', 6, 11, $k$Dissipador$k$),
('protocolo-16-cortes-ancestrais-e-padroes-familiares-negativos', 'cubo-metatron', 'graph', 'graph-set-35', 7, 25, $k$Cubo de Metatron$k$),
('protocolo-16-cortes-ancestrais-e-padroes-familiares-negativos', 'vesica-piscis', 'graph', 'graph-set-35', 8, 35, $k$Vesica Piscis$k$),
('protocolo-17-harmonizacao-de-vidas-passadas', 'angel-magic', 'angel', 'angel-set-49', 1, 1, $k$Anjo da Magia Divina$k$),
('protocolo-17-harmonizacao-de-vidas-passadas', 'angel-illumination', 'angel', 'angel-set-49', 2, 17, $k$Anjo da Iluminação e Consciência$k$),
('protocolo-17-harmonizacao-de-vidas-passadas', 'angel-liberation', 'angel', 'angel-set-49', 3, 18, $k$Anjo da Libertação$k$),
('protocolo-17-harmonizacao-de-vidas-passadas', 'archangel-raziel', 'archangel', 'angel-set-49', 4, 34, $k$Arcanjo Raziel$k$),
('protocolo-17-harmonizacao-de-vidas-passadas', 'archangel-metatron', 'archangel', 'angel-set-49', 5, 40, $k$Arcanjo Metatron$k$),
('protocolo-17-harmonizacao-de-vidas-passadas', 'dissipador', 'graph', 'graph-set-35', 6, 11, $k$Dissipador$k$),
('protocolo-17-harmonizacao-de-vidas-passadas', 'iave-sete-circulos', 'graph', 'graph-set-35', 7, 18, $k$Iavé – Sete Círculos$k$),
('protocolo-17-harmonizacao-de-vidas-passadas', 'kit-cromo', 'graph', 'graph-set-35', 8, 32, $k$Kit Cromo$k$),
('protocolo-18-harmonizacao-e-restauracao-da-aura', 'angel-magic', 'angel', 'angel-set-49', 1, 1, $k$Anjo da Magia Divina$k$),
('protocolo-18-harmonizacao-e-restauracao-da-aura', 'archangel-raphael', 'archangel', 'angel-set-49', 2, 35, $k$Arcanjo Rafael$k$),
('protocolo-18-harmonizacao-e-restauracao-da-aura', 'angel-harmony', 'angel', 'angel-set-49', 3, 43, $k$Harmonia$k$),
('protocolo-18-harmonizacao-e-restauracao-da-aura', 'angel-wellbeing', 'angel', 'angel-set-49', 4, 45, $k$Bem-estar$k$),
('protocolo-18-harmonizacao-e-restauracao-da-aura', 'angel-perfect-health', 'angel', 'angel-set-49', 5, 49, $k$Saúde Perfeita$k$),
('protocolo-18-harmonizacao-e-restauracao-da-aura', 'heptapentagrama', 'graph', 'graph-set-35', 6, 20, $k$Heptapentagrama$k$),
('protocolo-18-harmonizacao-e-restauracao-da-aura', 'revitalizador-chakras', 'graph', 'graph-set-35', 7, 21, $k$Revitalizador de Chakras$k$),
('protocolo-18-harmonizacao-e-restauracao-da-aura', 'scap-cabalista', 'graph', 'graph-set-35', 8, 22, $k$Scap$k$),
('protocolo-19-divorcio-energetico', 'angel-unconditional-love', 'angel', 'angel-set-49', 1, 6, $k$Anjo do Amor Incondicional$k$),
('protocolo-19-divorcio-energetico', 'angel-self-esteem', 'angel', 'angel-set-49', 2, 29, $k$Anjo da Autoestima$k$),
('protocolo-19-divorcio-energetico', 'angel-union', 'angel', 'angel-set-49', 3, 41, $k$União$k$),
('protocolo-19-divorcio-energetico', 'angel-forgiveness', 'angel', 'angel-set-49', 4, 44, $k$Perdão$k$),
('protocolo-19-divorcio-energetico', 'angel-transmutation', 'angel', 'angel-set-49', 5, 46, $k$Transmutação$k$),
('protocolo-19-divorcio-energetico', 'desimpregnador', 'graph', 'graph-set-35', 6, 12, $k$Desimpregnador$k$),
('protocolo-19-divorcio-energetico', 'desembaracador-relacionamentos', 'graph', 'graph-set-35', 7, 26, $k$Desembaraçador de Relacionamento$k$),
('protocolo-19-divorcio-energetico', 'piramide-tao', 'graph', 'graph-set-35', 8, 29, $k$Pirâmide de Tao$k$),
('protocolo-20-abusos-emocional-fisico-energetico-ou-espiritual', 'angel-healing', 'angel', 'angel-set-49', 1, 2, $k$Anjo para Cura Interior$k$),
('protocolo-20-abusos-emocional-fisico-energetico-ou-espiritual', 'angel-personal-power', 'angel', 'angel-set-49', 2, 5, $k$Anjo do Poder Pessoal$k$),
('protocolo-20-abusos-emocional-fisico-energetico-ou-espiritual', 'angel-self-esteem', 'angel', 'angel-set-49', 3, 29, $k$Anjo da Autoestima$k$),
('protocolo-20-abusos-emocional-fisico-energetico-ou-espiritual', 'archangel-raphael', 'archangel', 'angel-set-49', 4, 35, $k$Arcanjo Rafael$k$),
('protocolo-20-abusos-emocional-fisico-energetico-ou-espiritual', 'archangel-michael', 'archangel', 'angel-set-49', 5, 37, $k$Arcanjo Miguel$k$),
('protocolo-20-abusos-emocional-fisico-energetico-ou-espiritual', 'anti-possessao', 'graph', 'graph-set-35', 6, 1, $k$Anti Possessão$k$),
('protocolo-20-abusos-emocional-fisico-energetico-ou-espiritual', 'yoshua', 'graph', 'graph-set-35', 7, 3, $k$Yoshua$k$),
('protocolo-20-abusos-emocional-fisico-energetico-ou-espiritual', 'piramide-tao', 'graph', 'graph-set-35', 8, 29, $k$Pirâmide Tao$k$),
('protocolo-21-limpeza-uterina-e-cura-do-feminino', 'angel-unconditional-love', 'angel', 'angel-set-49', 1, 6, $k$Anjo do Amor Incondicional$k$),
('protocolo-21-limpeza-uterina-e-cura-do-feminino', 'angel-forgiveness', 'angel', 'angel-set-49', 2, 44, $k$Perdão$k$),
('protocolo-21-limpeza-uterina-e-cura-do-feminino', 'angel-wellbeing', 'angel', 'angel-set-49', 3, 45, $k$Bem-estar$k$),
('protocolo-21-limpeza-uterina-e-cura-do-feminino', 'angel-transmutation', 'angel', 'angel-set-49', 4, 46, $k$Transmutação$k$),
('protocolo-21-limpeza-uterina-e-cura-do-feminino', 'angel-perfect-health', 'angel', 'angel-set-49', 5, 49, $k$Saúde Perfeita$k$),
('protocolo-21-limpeza-uterina-e-cura-do-feminino', 'desimpregnador', 'graph', 'graph-set-35', 6, 12, $k$Desimpregnador$k$),
('protocolo-21-limpeza-uterina-e-cura-do-feminino', 'revitalizador-chakras', 'graph', 'graph-set-35', 7, 21, $k$Revitalizador de Chakras$k$),
('protocolo-21-limpeza-uterina-e-cura-do-feminino', 'piramide-tao', 'graph', 'graph-set-35', 8, 29, $k$Pirâmide Tao$k$),
('protocolo-22-abertura-de-merecimento-e-possibilidades', 'angel-abundance', 'angel', 'angel-set-49', 1, 20, $k$Anjo da Abundância$k$),
('protocolo-22-abertura-de-merecimento-e-possibilidades', 'angel-self-esteem', 'angel', 'angel-set-49', 2, 29, $k$Anjo da Autoestima$k$),
('protocolo-22-abertura-de-merecimento-e-possibilidades', 'angel-gratitude', 'angel', 'angel-set-49', 3, 33, $k$Anjo da Gratidão$k$),
('protocolo-22-abertura-de-merecimento-e-possibilidades', 'archangel-uriel', 'archangel', 'angel-set-49', 4, 38, $k$Arcanjo Uriel$k$),
('protocolo-22-abertura-de-merecimento-e-possibilidades', 'angel-wellbeing', 'angel', 'angel-set-49', 5, 45, $k$Bem-estar$k$),
('protocolo-22-abertura-de-merecimento-e-possibilidades', 'saude-financeira', 'graph', 'graph-set-35', 6, 9, $k$Saúde Financeira$k$),
('protocolo-22-abertura-de-merecimento-e-possibilidades', 'prosperador', 'graph', 'graph-set-35', 7, 27, $k$Prosperador$k$),
('protocolo-22-abertura-de-merecimento-e-possibilidades', 'kit-cromo', 'graph', 'graph-set-35', 8, 32, $k$Kit Cromo$k$),
('protocolo-23-esgotamento-mental-e-pensamentos-intrusivos', 'angel-magic', 'angel', 'angel-set-49', 1, 1, $k$Anjo da Magia Divina$k$),
('protocolo-23-esgotamento-mental-e-pensamentos-intrusivos', 'angel-lightness', 'angel', 'angel-set-49', 2, 4, $k$Anjo da Leveza$k$),
('protocolo-23-esgotamento-mental-e-pensamentos-intrusivos', 'angel-clarity', 'angel', 'angel-set-49', 3, 8, $k$Anjo da Clareza$k$),
('protocolo-23-esgotamento-mental-e-pensamentos-intrusivos', 'angel-illumination', 'angel', 'angel-set-49', 4, 17, $k$Anjo da Iluminação e Consciência$k$),
('protocolo-23-esgotamento-mental-e-pensamentos-intrusivos', 'archangel-gabriel', 'archangel', 'angel-set-49', 5, 36, $k$Arcanjo Gabriel$k$),
('protocolo-23-esgotamento-mental-e-pensamentos-intrusivos', 'triturador', 'graph', 'graph-set-35', 6, 2, $k$Triturador$k$),
('protocolo-23-esgotamento-mental-e-pensamentos-intrusivos', 'quadrata', 'graph', 'graph-set-35', 7, 5, $k$Quadrata$k$),
('protocolo-23-esgotamento-mental-e-pensamentos-intrusivos', 'quadrado-magico', 'graph', 'graph-set-35', 8, 23, $k$Quadrado Mágico$k$),
('protocolo-24-encerramento-de-ciclos-e-inicio-de-novos-caminhos', 'angel-purpose', 'angel', 'angel-set-49', 1, 12, $k$Anjo do Propósito e Missão$k$),
('protocolo-24-encerramento-de-ciclos-e-inicio-de-novos-caminhos', 'angel-reflection', 'angel', 'angel-set-49', 2, 16, $k$Anjo da Reflexão$k$),
('protocolo-24-encerramento-de-ciclos-e-inicio-de-novos-caminhos', 'angel-transformation', 'angel', 'angel-set-49', 3, 19, $k$Anjo da Transformação$k$),
('protocolo-24-encerramento-de-ciclos-e-inicio-de-novos-caminhos', 'angel-harmony', 'angel', 'angel-set-49', 4, 43, $k$Harmonia$k$),
('protocolo-24-encerramento-de-ciclos-e-inicio-de-novos-caminhos', 'angel-forgiveness', 'angel', 'angel-set-49', 5, 44, $k$Perdão$k$),
('protocolo-24-encerramento-de-ciclos-e-inicio-de-novos-caminhos', 'dissipador', 'graph', 'graph-set-35', 6, 11, $k$Dissipador$k$),
('protocolo-24-encerramento-de-ciclos-e-inicio-de-novos-caminhos', 'kit-cromo', 'graph', 'graph-set-35', 7, 32, $k$Kit Cromo$k$),
('protocolo-24-encerramento-de-ciclos-e-inicio-de-novos-caminhos', 'cruz-ansata', 'graph', 'graph-set-35', 8, 34, $k$Cruz Ansata$k$),
('protocolo-25-autoconfianca-e-comunicacao-verdadeira', 'angel-personal-power', 'angel', 'angel-set-49', 1, 5, $k$Anjo do Poder Pessoal$k$),
('protocolo-25-autoconfianca-e-comunicacao-verdadeira', 'angel-confidence', 'angel', 'angel-set-49', 2, 21, $k$Anjo da Confiança$k$),
('protocolo-25-autoconfianca-e-comunicacao-verdadeira', 'angel-self-esteem', 'angel', 'angel-set-49', 3, 29, $k$Anjo da Autoestima$k$),
('protocolo-25-autoconfianca-e-comunicacao-verdadeira', 'angel-communication', 'angel', 'angel-set-49', 4, 32, $k$Anjo da Comunicação$k$),
('protocolo-25-autoconfianca-e-comunicacao-verdadeira', 'archangel-gabriel', 'archangel', 'angel-set-49', 5, 36, $k$Arcanjo Gabriel$k$),
('protocolo-25-autoconfianca-e-comunicacao-verdadeira', 'yoshua', 'graph', 'graph-set-35', 6, 3, $k$Yoshua$k$),
('protocolo-25-autoconfianca-e-comunicacao-verdadeira', 'quadrata', 'graph', 'graph-set-35', 7, 5, $k$Quadrata$k$),
('protocolo-25-autoconfianca-e-comunicacao-verdadeira', 'revitalizador-chakras', 'graph', 'graph-set-35', 8, 21, $k$Revitalizador de Chakras$k$),
('protocolo-26-equilibrio-da-raiva-e-impulsos-emocionais', 'angel-magic', 'angel', 'angel-set-49', 1, 1, $k$Anjo da Magia Divina$k$),
('protocolo-26-equilibrio-da-raiva-e-impulsos-emocionais', 'angel-lightness', 'angel', 'angel-set-49', 2, 4, $k$Anjo da Leveza$k$),
('protocolo-26-equilibrio-da-raiva-e-impulsos-emocionais', 'angel-peace', 'angel', 'angel-set-49', 3, 13, $k$Anjo da Paz$k$),
('protocolo-26-equilibrio-da-raiva-e-impulsos-emocionais', 'angel-compassion', 'angel', 'angel-set-49', 4, 22, $k$Anjo da Compaixão$k$),
('protocolo-26-equilibrio-da-raiva-e-impulsos-emocionais', 'archangel-michael', 'archangel', 'angel-set-49', 5, 37, $k$Arcanjo Miguel$k$),
('protocolo-26-equilibrio-da-raiva-e-impulsos-emocionais', 'desimpregnador', 'graph', 'graph-set-35', 6, 12, $k$Desimpregnador$k$),
('protocolo-26-equilibrio-da-raiva-e-impulsos-emocionais', 'energizador', 'graph', 'graph-set-35', 7, 15, $k$Energizador$k$),
('protocolo-26-equilibrio-da-raiva-e-impulsos-emocionais', 'revitalizador-chakras', 'graph', 'graph-set-35', 8, 21, $k$Revitalizador de Chakras$k$),
('protocolo-27-soltar-o-passado-e-deixar-fluir', 'angel-unconditional-love', 'angel', 'angel-set-49', 1, 6, $k$Anjo do Amor Incondicional$k$),
('protocolo-27-soltar-o-passado-e-deixar-fluir', 'angel-reflection', 'angel', 'angel-set-49', 2, 16, $k$Anjo da Reflexão$k$),
('protocolo-27-soltar-o-passado-e-deixar-fluir', 'angel-transformation', 'angel', 'angel-set-49', 3, 19, $k$Anjo da Transformação$k$),
('protocolo-27-soltar-o-passado-e-deixar-fluir', 'angel-harmony', 'angel', 'angel-set-49', 4, 43, $k$Harmonia$k$),
('protocolo-27-soltar-o-passado-e-deixar-fluir', 'angel-forgiveness', 'angel', 'angel-set-49', 5, 44, $k$Perdão$k$),
('protocolo-27-soltar-o-passado-e-deixar-fluir', 'dissipador', 'graph', 'graph-set-35', 6, 11, $k$Dissipador$k$),
('protocolo-27-soltar-o-passado-e-deixar-fluir', 'cruz-ansata', 'graph', 'graph-set-35', 7, 34, $k$Cruz Ansata$k$),
('protocolo-27-soltar-o-passado-e-deixar-fluir', 'vesica-piscis', 'graph', 'graph-set-35', 8, 35, $k$Vesica Piscis$k$),
('protocolo-28-alegria-humor-e-felicidade', 'angel-joy', 'angel', 'angel-set-49', 1, 14, $k$Anjo da Alegria$k$),
('protocolo-28-alegria-humor-e-felicidade', 'angel-satisfaction', 'angel', 'angel-set-49', 2, 25, $k$Anjo da Satisfação$k$),
('protocolo-28-alegria-humor-e-felicidade', 'angel-gratitude', 'angel', 'angel-set-49', 3, 33, $k$Anjo da Gratidão$k$),
('protocolo-28-alegria-humor-e-felicidade', 'angel-humor', 'angel', 'angel-set-49', 4, 42, $k$Anjo do Humor$k$),
('protocolo-28-alegria-humor-e-felicidade', 'angel-harmony', 'angel', 'angel-set-49', 5, 43, $k$Harmonia$k$),
('protocolo-28-alegria-humor-e-felicidade', 'sol-da-vida', 'graph', 'graph-set-35', 6, 14, $k$Sol da Vida$k$),
('protocolo-28-alegria-humor-e-felicidade', 'scap-cabalista', 'graph', 'graph-set-35', 7, 22, $k$Scap$k$),
('protocolo-28-alegria-humor-e-felicidade', 'kit-cromo', 'graph', 'graph-set-35', 8, 32, $k$Kit Cromo$k$);

  create temp table _v26e_protocol_steps (
    protocol_slug text not null,
    step_number integer not null,
    title text not null,
    instructions text not null,
    primary key (protocol_slug, step_number)
  ) on commit drop;

  insert into _v26e_protocol_steps (protocol_slug, step_number, title, instructions) values
  ('protocolo-01-medos', 1, $k$Símbolos Angelicais$k$, $k$• (21) Anjo da Confiança
• (26) Anjo da Esperança
• (30) Anjo da Coragem
• (37) Arcanjo Miguel
• (47) Anjo do Foco e Disciplina$k$),
  ('protocolo-01-medos', 2, $k$Gráficos Radiônicos$k$, $k$• (1) Anti Possessão
• (15) Energizador
• (16) Anti Dor$k$),
  ('protocolo-02-culpas', 1, $k$Símbolos Angelicais$k$, $k$• (11) Anjo da Pureza
• (29) Anjo da Autoestima
• (34) Arcanjo Raziel
• (44) Perdão
• (45) Bem-estar$k$),
  ('protocolo-02-culpas', 2, $k$Gráficos Radiônicos$k$, $k$• (9) Saúde Financeira
• (12) Desimpregnador
• (34) Cruz Ansata$k$),
  ('protocolo-03-tristeza-e-depressao', 1, $k$Símbolos Angelicais$k$, $k$• (2) Anjo para Cura Interior
• (13) Anjo da Paz
• (14) Anjo da Alegria
• (19) Anjo da Transformação
• (35) Arcanjo Rafael$k$),
  ('protocolo-03-tristeza-e-depressao', 2, $k$Gráficos Radiônicos$k$, $k$• (6) Anti Depressão
• (7) Magnetismo Curativo
• (14) Sol da Vida$k$),
  ('protocolo-04-ansiedade', 1, $k$Símbolos Angelicais$k$, $k$• (1) Anjo da Magia Divina
• (4) Anjo da Leveza
• (17) Anjo da Iluminação e Consciência
• (32) Anjo da Comunicação
• (36) Arcanjo Gabriel$k$),
  ('protocolo-04-ansiedade', 2, $k$Gráficos Radiônicos$k$, $k$• (3) Yoshua
• (26) Desembaraçador de Relacionamento
• (34) Cruz Ansata$k$),
  ('protocolo-05-prosperidade-e-abundancia', 1, $k$Símbolos Angelicais$k$, $k$• (5) Anjo do Poder Pessoal
• (15) Anjo da Prosperidade
• (20) Anjo da Abundância
• (33) Anjo da Gratidão
• (38) Arcanjo Uriel$k$),
  ('protocolo-05-prosperidade-e-abundancia', 2, $k$Gráficos Radiônicos$k$, $k$• (8) Turbilhão Júpiter
• (9) Saúde Financeira
• (27) Prosperador$k$),
  ('protocolo-06-aumento-de-vendas-e-clientes', 1, $k$Símbolos Angelicais$k$, $k$• (5) Anjo do Poder Pessoal
• (20) Anjo da Abundância
• (21) Anjo da Confiança
• (33) Anjo da Gratidão
• (40) Arcanjo Metatron$k$),
  ('protocolo-06-aumento-de-vendas-e-clientes', 2, $k$Gráficos Radiônicos$k$, $k$• (8) Turbilhão Júpiter
• (24) Sorte e Sucesso
• (25) Cubo de Metatron$k$),
  ('protocolo-07-clareza-e-criatividade', 1, $k$Símbolos Angelicais$k$, $k$• (3) Anjo para Direcionamento
• (7) Anjo da Sabedoria
• (8) Anjo da Clareza
• (32) Anjo da Comunicação
• (34) Arcanjo Raziel$k$),
  ('protocolo-07-clareza-e-criatividade', 2, $k$Gráficos Radiônicos$k$, $k$• (2) Triturador
• (21) Revitalizador de Chakras
• (29) Pirâmide Tao$k$),
  ('protocolo-08-emagrecimento-consciente', 1, $k$Símbolos Angelicais$k$, $k$• (11) Anjo da Pureza
• (28) Anjo do Comprometimento
• (29) Anjo da Autoestima
• (45) Bem-estar
• (46) Transmutação$k$),
  ('protocolo-08-emagrecimento-consciente', 2, $k$Gráficos Radiônicos$k$, $k$• (5) Quadrata
• (6) Anti Depressão
• (29) Pirâmide Tao$k$),
  ('protocolo-09-saude-e-vitalidade', 1, $k$Símbolos Angelicais$k$, $k$• (2) Anjo para Cura Interior
• (27) Anjo da Paixão
• (35) Arcanjo Rafael
• (45) Bem-estar
• (49) Saúde Perfeita$k$),
  ('protocolo-09-saude-e-vitalidade', 2, $k$Gráficos Radiônicos$k$, $k$• (7) Magnetismo Curativo
• (21) Revitalizador de Chakras
• (33) Alta Vitalidade$k$),
  ('protocolo-10-harmonizacao-e-protecao-energetica', 1, $k$Símbolos Angelicais$k$, $k$• (1) Anjo da Magia Divina
• (22) Anjo da Compaixão
• (37) Arcanjo Miguel
• (40) Arcanjo Metatron
• (43) Harmonia$k$),
  ('protocolo-10-harmonizacao-e-protecao-energetica', 2, $k$Gráficos Radiônicos$k$, $k$• (13) Justiça Divina
• (20) Heptapentagrama
• (25) Cubo de Metraton$k$),
  ('protocolo-11-harmonizacao-de-relacionamentos', 1, $k$Símbolos Angelicais$k$, $k$• (6) Anjo do Amor Incondicional
• (24) Anjo da Empatia
• (41) União
• (43) Harmonia
• (44) Perdão$k$),
  ('protocolo-11-harmonizacao-de-relacionamentos', 2, $k$Gráficos Radiônicos$k$, $k$• (12) Desimpregnador
• (26) Desembaraçador de Relacionamento
• (35) Vesica Piscis$k$),
  ('protocolo-12-procrastinacao-e-autossabotagem', 1, $k$Símbolos Angelicais$k$, $k$• (3) Anjo para Direcionamento
• (5) Anjo do Poder Pessoal
• (21) Anjo da Confiança
• (28) Anjo do Comprometimento
• (47) Anjo do Foco e Disciplina$k$),
  ('protocolo-12-procrastinacao-e-autossabotagem', 2, $k$Gráficos Radiônicos$k$, $k$• (5) Quadrata
• (15) Energizador
• (32) Kit Cromo$k$),
  ('protocolo-13-libertacao-karmica', 1, $k$Símbolos Angelicais$k$, $k$• (12) Anjo do Propósito e Missão
• (18) Anjo da Libertação
• (34) Arcanjo Raziel
• (40) Arcanjo Metatron
• (46) Transmutação$k$),
  ('protocolo-13-libertacao-karmica', 2, $k$Gráficos Radiônicos$k$, $k$• (8) Turbilhão Júpiter
• (29) Pirâmide Tao
• (32) Kit Cromo$k$),
  ('protocolo-14-autoestima-e-amor-proprio', 1, $k$Símbolos Angelicais$k$, $k$• (6) Anjo do Amor Incondicional
• (25) Anjo da Satisfação
• (29) Anjo da Autoestima
• (33) Anjo da Gratidão
• (45) Bem-estar$k$),
  ('protocolo-14-autoestima-e-amor-proprio', 2, $k$Gráficos Radiônicos$k$, $k$• (3) Yoshua
• (22) Scap
• (31) Turbilhão Prosperador$k$),
  ('protocolo-15-proposito-e-missao', 1, $k$Símbolos Angelicais$k$, $k$• (7) Anjo da Sabedoria
• (8) Anjo da Clareza
• (12) Anjo do Propósito e Missão
• (17) Anjo da Iluminação e Consciência
• (34) Arcanjo Raziel$k$),
  ('protocolo-15-proposito-e-missao', 2, $k$Gráficos Radiônicos$k$, $k$• (4) Luxor
• (18) Iavé – Sete Círculos
• (28) Antakarana$k$),
  ('protocolo-16-cortes-ancestrais-e-padroes-familiares-negativos', 1, $k$Símbolos Angelicais$k$, $k$• (19) Anjo da Transformação
• (34) Arcanjo Raziel
• (38) Arcanjo Uriel
• (44) Perdão
• (46) Transmutação$k$),
  ('protocolo-16-cortes-ancestrais-e-padroes-familiares-negativos', 2, $k$Gráficos Radiônicos$k$, $k$• (11) Dissipador
• (25) Cubo de Metatron
• (35) Vesica Piscis$k$),
  ('protocolo-17-harmonizacao-de-vidas-passadas', 1, $k$Símbolos Angelicais$k$, $k$• (1) Anjo da Magia Divina
• (17) Anjo da Iluminação e Consciência
• (18) Anjo da Libertação
• (34) Arcanjo Raziel
• (40) Arcanjo Metatron$k$),
  ('protocolo-17-harmonizacao-de-vidas-passadas', 2, $k$Gráficos Radiônicos$k$, $k$• (11) Dissipador
• (18) Iavé – Sete Círculos
• (32) Kit Cromo$k$),
  ('protocolo-18-harmonizacao-e-restauracao-da-aura', 1, $k$Símbolos Angelicais$k$, $k$• (1) Anjo da Magia Divina
• (35) Arcanjo Rafael
• (43) Harmonia
• (45) Bem-estar
• (49) Saúde Perfeita$k$),
  ('protocolo-18-harmonizacao-e-restauracao-da-aura', 2, $k$Gráficos Radiônicos$k$, $k$• (20) Heptapentagrama
• (21) Revitalizador de Chakras
• (22) Scap$k$),
  ('protocolo-19-divorcio-energetico', 1, $k$Símbolos Angelicais$k$, $k$• (6) Anjo do Amor Incondicional
• (29) Anjo da Autoestima
• (41) União
• (44) Perdão
• (46) Transmutação$k$),
  ('protocolo-19-divorcio-energetico', 2, $k$Gráficos Radiônicos$k$, $k$• (12) Desimpregnador
• (26) Desembaraçador de Relacionamento
• (29) Pirâmide de Tao$k$),
  ('protocolo-20-abusos-emocional-fisico-energetico-ou-espiritual', 1, $k$Símbolos Angelicais$k$, $k$• (2) Anjo para Cura Interior
• (5) Anjo do Poder Pessoal
• (29) Anjo da Autoestima
• (35) Arcanjo Rafael
• (37) Arcanjo Miguel$k$),
  ('protocolo-20-abusos-emocional-fisico-energetico-ou-espiritual', 2, $k$Gráficos Radiônicos$k$, $k$• (1) Anti Possessão
• (3) Yoshua
• (29) Pirâmide Tao$k$),
  ('protocolo-21-limpeza-uterina-e-cura-do-feminino', 1, $k$Símbolos Angelicais$k$, $k$• (6) Anjo do Amor Incondicional
• (44) Perdão
• (45) Bem-estar
• (46) Transmutação
• (49) Saúde Perfeita$k$),
  ('protocolo-21-limpeza-uterina-e-cura-do-feminino', 2, $k$Gráficos Radiônicos$k$, $k$• (12) Desimpregnador
• (21) Revitalizador de Chakras
• (29) Pirâmide Tao$k$),
  ('protocolo-22-abertura-de-merecimento-e-possibilidades', 1, $k$Símbolos Angelicais$k$, $k$• (20) Anjo da Abundância
• (29) Anjo da Autoestima
• (33) Anjo da Gratidão
• (38) Arcanjo Uriel
• (45) Bem-estar$k$),
  ('protocolo-22-abertura-de-merecimento-e-possibilidades', 2, $k$Gráficos Radiônicos$k$, $k$• (9) Saúde Financeira
• (27) Prosperador
• (32) Kit Cromo$k$),
  ('protocolo-23-esgotamento-mental-e-pensamentos-intrusivos', 1, $k$Símbolos Angelicais$k$, $k$• (1) Anjo da Magia Divina
• (4) Anjo da Leveza
• (8) Anjo da Clareza
• (17) Anjo da Iluminação e Consciência
• (36) Arcanjo Gabriel$k$),
  ('protocolo-23-esgotamento-mental-e-pensamentos-intrusivos', 2, $k$Gráficos Radiônicos$k$, $k$• (2) Triturador
• (5) Quadrata
• (23) Quadrado Mágico$k$),
  ('protocolo-24-encerramento-de-ciclos-e-inicio-de-novos-caminhos', 1, $k$Símbolos Angelicais$k$, $k$• (12) Anjo do Propósito e Missão
• (16) Anjo da Reflexão
• (19) Anjo da Transformação
• (43) Harmonia
• (44) Perdão$k$),
  ('protocolo-24-encerramento-de-ciclos-e-inicio-de-novos-caminhos', 2, $k$Gráficos Radiônicos$k$, $k$• (11) Dissipador
• (32) Kit Cromo
• (34) Cruz Ansata$k$),
  ('protocolo-25-autoconfianca-e-comunicacao-verdadeira', 1, $k$Símbolos Angelicais$k$, $k$• (5) Anjo do Poder Pessoal
• (21) Anjo da Confiança
• (29) Anjo da Autoestima
• (32) Anjo da Comunicação
• (36) Arcanjo Gabriel$k$),
  ('protocolo-25-autoconfianca-e-comunicacao-verdadeira', 2, $k$Gráficos Radiônicos$k$, $k$• (3) Yoshua
• (5) Quadrata
• (21) Revitalizador de Chakras$k$),
  ('protocolo-26-equilibrio-da-raiva-e-impulsos-emocionais', 1, $k$Símbolos Angelicais$k$, $k$• (1) Anjo da Magia Divina
• (4) Anjo da Leveza
• (13) Anjo da Paz
• (22) Anjo da Compaixão
• (37) Arcanjo Miguel$k$),
  ('protocolo-26-equilibrio-da-raiva-e-impulsos-emocionais', 2, $k$Gráficos Radiônicos$k$, $k$• (12) Desimpregnador
• (15) Energizador
• (21) Revitalizador de Chakras$k$),
  ('protocolo-27-soltar-o-passado-e-deixar-fluir', 1, $k$Símbolos Angelicais$k$, $k$• (6) Anjo do Amor Incondicional
• (16) Anjo da Reflexão
• (19) Anjo da Transformação
• (43) Harmonia
• (44) Perdão$k$),
  ('protocolo-27-soltar-o-passado-e-deixar-fluir', 2, $k$Gráficos Radiônicos$k$, $k$• (11) Dissipador
• (34) Cruz Ansata
• (35) Vesica Piscis$k$),
  ('protocolo-28-alegria-humor-e-felicidade', 1, $k$Símbolos Angelicais$k$, $k$• (14) Anjo da Alegria
• (25) Anjo da Satisfação
• (33) Anjo da Gratidão
• (42) Anjo do Humor
• (43) Harmonia$k$),
  ('protocolo-28-alegria-humor-e-felicidade', 2, $k$Gráficos Radiônicos$k$, $k$• (14) Sol da Vida
• (22) Scap
• (32) Kit Cromo$k$);

  -- -------------------------------------------------------------------------
  -- methodology_protocols
  -- -------------------------------------------------------------------------
  insert into public.methodology_protocols (
    specialty_id,
    code,
    name,
    slug,
    description,
    why_activate,
    source_name,
    source_type,
    source_reference,
    content_version,
    is_app_adapted,
    status,
    sort_order,
    metadata
  )
  select
    v_specialty_id,
    p.code,
    p.name,
    p.slug,
    p.description,
    p.why_activate,
    'Vanessa',
    'course_material',
    'docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt',
    'v1',
    false,
    'active',
    p.sort_order,
    jsonb_build_object(
      'import_source', 'v2.6e',
      'source_protocol_num', p.source_protocol_num
    )
  from _v26e_protocols p
  on conflict (specialty_id, slug) do update set
    code = excluded.code,
    name = excluded.name,
    description = excluded.description,
    why_activate = excluded.why_activate,
    source_name = excluded.source_name,
    source_type = excluded.source_type,
    source_reference = excluded.source_reference,
    content_version = excluded.content_version,
    is_app_adapted = excluded.is_app_adapted,
    status = excluded.status,
    sort_order = excluded.sort_order,
    metadata = coalesce(public.methodology_protocols.metadata, '{}'::jsonb) || excluded.metadata,
    updated_at = now();

  get diagnostics v_protocols_upserted = row_count;

  -- -------------------------------------------------------------------------
  -- protocol_assets (replace links for imported protocols)
  -- -------------------------------------------------------------------------
  delete from public.protocol_assets pa
  using public.methodology_protocols mp
  where pa.protocol_id = mp.id
    and mp.specialty_id = v_specialty_id
    and mp.source_reference = 'docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt';

  insert into public.protocol_assets (
    protocol_id,
    asset_id,
    asset_role,
    sort_order,
    notes
  )
  select
    mp.id,
    ma.id,
    pa.asset_role,
    pa.sort_order,
    'source #' || pa.source_num::text || ' — ' || pa.source_label
  from _v26e_protocol_assets pa
  inner join public.methodology_protocols mp
    on mp.slug = pa.protocol_slug
    and mp.specialty_id = v_specialty_id
  inner join public.methodology_tools mt on mt.slug = pa.tool_slug
  inner join public.methodology_assets ma
    on ma.slug = pa.asset_slug
    and ma.tool_id = mt.id
    and ma.status = 'active';

  get diagnostics v_assets_linked = row_count;

  select count(*) into v_missing_assets
  from _v26e_protocol_assets pa
  where not exists (
    select 1
    from public.methodology_tools mt
    inner join public.methodology_assets ma
      on ma.tool_id = mt.id
      and ma.slug = pa.asset_slug
      and ma.status = 'active'
    where mt.slug = pa.tool_slug
  );

  if v_missing_assets > 0 then
    raise warning 'V2.6E: % protocol asset references could not be resolved to methodology_assets.', v_missing_assets;
  end if;

  -- -------------------------------------------------------------------------
  -- protocol_steps (2 steps per protocol: angels, then graphs)
  -- -------------------------------------------------------------------------
  insert into public.protocol_steps (
    protocol_id,
    step_number,
    title,
    instructions,
    source_name,
    source_type,
    source_reference,
    content_version,
    is_app_adapted,
    metadata
  )
  select
    mp.id,
    ps.step_number,
    ps.title,
    ps.instructions,
    'Vanessa',
    'course_material',
    'docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt',
    'v1',
    false,
    jsonb_build_object('import_source', 'v2.6e')
  from _v26e_protocol_steps ps
  inner join public.methodology_protocols mp
    on mp.slug = ps.protocol_slug
    and mp.specialty_id = v_specialty_id
  on conflict (protocol_id, step_number) do update set
    title = excluded.title,
    instructions = excluded.instructions,
    source_name = excluded.source_name,
    source_type = excluded.source_type,
    source_reference = excluded.source_reference,
    content_version = excluded.content_version,
    is_app_adapted = excluded.is_app_adapted,
    metadata = coalesce(public.protocol_steps.metadata, '{}'::jsonb) || excluded.metadata,
    updated_at = now();

  get diagnostics v_steps_upserted = row_count;

  raise notice 'V2.6E protocol import complete.';
  raise notice '  protocols expected: %', v_protocol_count;
  raise notice '  methodology_protocols touched: %', v_protocols_upserted;
  raise notice '  protocol_assets linked: %', v_assets_linked;
  raise notice '  protocol_steps touched: %', v_steps_upserted;
  raise notice '  unresolved asset refs: %', v_missing_assets;

  if v_assets_linked <> v_protocol_count * 8 then
    raise warning
      'Expected % protocol_asset links; inserted %.',
      v_protocol_count * 8,
      v_assets_linked;
  end if;

end $$;
