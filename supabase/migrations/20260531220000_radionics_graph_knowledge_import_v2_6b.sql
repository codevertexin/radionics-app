-- =============================================================================
-- RADIONICS — Phase V2.6B: Graph knowledge import (Mesa 35)
-- Source: docs/knowledge/vanessa/GRAFICOS MESA.txt (35 entries, validated)
-- Target: specialty_asset_content, activation_scripts, activation_script_links
-- Specialty: mesa-35 · Tool: graph-set-35
-- Idempotent. No invented content.
-- =============================================================================

do $$
declare
  v_specialty_id uuid;
  v_tool_graph_id uuid;
  v_source_entries integer := 35;
  v_content_updated integer;
  v_scripts_upserted integer;
  v_links_created integer;
  v_matched_assets integer;
  v_missing_slugs text[];
begin
  select id into v_specialty_id
  from public.radionics_specialties
  where slug = 'mesa-35';

  if v_specialty_id is null then
    raise exception 'radionics_specialties slug ''mesa-35'' is required.';
  end if;

  select id into v_tool_graph_id
  from public.methodology_tools
  where slug = 'graph-set-35';

  if v_tool_graph_id is null then
    raise exception 'methodology_tools slug ''graph-set-35'' is required.';
  end if;

  create temp table _v26b_graph_knowledge (
    sort_order integer not null,
    asset_slug text not null,
    asset_name text not null,
    therapist_explanation text not null,
    client_explanation text not null,
    activation_text text not null,
    primary key (asset_slug)
  ) on commit drop;

  insert into _v26b_graph_knowledge (
    sort_order, asset_slug, asset_name, therapist_explanation, client_explanation, activation_text
  ) values
  (
    1,
    'anti-possessao',
    $k$Anti Possessão$k$,
    $k$Gráfico radiestésico de proteção espiritual profunda, utilizado para remover obsessores, entidades e energias negativas invasoras.$k$,
    $k$Informe ao cliente que será realizada uma limpeza energética para remover influências externas negativas, restaurando o livre-
arbítrio espiritual.$k$,
    $k$Ativo agora Anti Possessão, limpando profundamente todas as energias obsessivas, entidades e vínculos espirituais negativos do passado, presente e futuro que estejam 
influenciando (nome do consulente). Que seja imediatamente restaurada a soberania espiritual, a proteção e a luz divina. Assim é, está feito, gratidão.$k$
  ),
  (
    2,
    'triturador',
    $k$Triturador$k$,
    $k$Gráfico que atua na quebra de padrões negativos, formas-pensamento e crenças limitantes.$k$,
    $k$Será feita uma liberação de padrões mentais e emocionais repetitivos que estejam limitando sua vida ou causando bloqueios.$k$,
    $k$Ativo agora Triturador, dissolvendo profundamente todas as formas-pensamento negativas, crenças limitantes e padrões repetitivos do passado, presente e futuro que 
estejam impedindo o avanço de (nome do consulente). Que se estabeleça liberdade mental e emocional. 
Assim é, está feito, gratidão.$k$
  ),
  (
    3,
    'yoshua',
    $k$Yoshua$k$,
    $k$Gráfico radiestésico de cura profunda, conexão espiritual elevada e equilíbrio emocional.$k$,
    $k$Informe ao cliente que será ativada uma energia poderosa para cura profunda, equilíbrio emocional e conexão espiritual.$k$,
    $k$Ativo agora Yoshua, limpando profundamente todas as energias negativas e bloqueios do passado, presente e futuro que possam estar impedindo a cura profunda, o equilíbrio emocional e a conexão espiritual elevada em (nome do consulente). Que seja imediatamente estabelecida paz interior, cura total e centramento espiritual profundo. Assim é, está feito, gratidão.$k$
  ),
  (
    4,
    'luxor',
    $k$Luxor$k$,
    $k$Gráfico de alinhamento espiritual, conexão com sabedoria ancestral e reequilíbrio energético profundo.$k$,
    $k$Será ativada uma energia de sabedoria ancestral que promoverá equilíbrio espiritual e reconexão com o seu centro de poder interior.$k$,
    $k$Ativo agora Luxor, limpando todos os desequilíbrios espirituais, bloqueios e distorções do passado, presente e futuro em (nome do consulente). Que se estabeleça o alinhamento com a sabedoria ancestral e a força do espírito. Assim é, está feito, gratidão.$k$
  ),
  (
    5,
    'quadrata',
    $k$Quadrata$k$,
    $k$Gráfico de estrutura, foco e organização do campo mental e energético.$k$,
    $k$Ativaremos uma energia de clareza e organização para trazer mais foco, estabilidade e estrutura interior.$k$,
    $k$Ativo agora Quadrata, limpando toda desorganização energética, confusão mental e falta de foco do passado, presente e futuro em (nome do consulente). Que se estabeleça organização interior, estabilidade e clareza. Assim é, está feito, gratidão.$k$
  ),
  (
    6,
    'anti-depressao',
    $k$Anti Depressão$k$,
    $k$Gráfico que atua elevando a vibração, dissolvendo estados de tristeza profunda e restaurando o prazer de viver.$k$,
    $k$Será feita uma harmonização emocional para reduzir sintomas de tristeza, resgatar a alegria e o entusiasmo pela vida.$k$,
    $k$Ativo agora Anti Depressão, limpando todas as memórias e energias de tristeza, desânimo e vazio existencial do passado, presente e futuro em (nome do consulente). Que a alegria de viver, o entusiasmo e a força vital sejam restaurados. Assim é, está feito, gratidão.$k$
  ),
  (
    7,
    'magnetismo-curativo',
    $k$Magnetismo Curativo$k$,
    $k$Gráfico que ativa o campo de magnetismo para atrair e irradiar energia de cura.$k$,
    $k$Será ativado o magnetismo natural do seu corpo para acelerar o processo de cura física, emocional e espiritual.$k$,
    $k$Ativo agora Magnetismo Curativo, ativando o campo de cura e regeneração em todos os níveis no campo de (nome do consulente). Que a energia curativa flua e restaure plenamente o equilíbrio do passado, presente e futuro. Assim é, está feito, gratidão.$k$
  ),
  (
    8,
    'turbilhao-jupiter',
    $k$Turbilhão Júpiter$k$,
    $k$Gráfico de expansão, prosperidade e crescimento energético.$k$,
    $k$Será ativada uma energia de abertura de caminhos, expansão da sua força de ação e prosperidade.$k$,
    $k$Ativo agora Turbilhão Júpiter, limpando bloqueios de expansão, travas financeiras e limitações do passado, presente e futuro em (nome do consulente). Que se manifeste a prosperidade, o crescimento e a abundância. Assim é, está feito, gratidão.$k$
  ),
  (
    9,
    'saude-financeira',
    $k$Saúde Financeira$k$,
    $k$Gráfico que limpa bloqueios relacionados ao dinheiro e ativa o fluxo de prosperidade e equilíbrio financeiro.$k$,
    $k$Vamos harmonizar sua energia com o dinheiro, ativando equilíbrio e abrindo caminhos para a abundância material.$k$,
    $k$Ativo agora Saúde Financeira, limpando todas as crenças limitantes, traumas e escassez do passado, presente e futuro que impedem o fluxo de prosperidade em (nome do consulente). Que se estabeleça equilíbrio e liberdade financeira. Assim é, está feito, gratidão.$k$
  ),
  (
    10,
    'piramide-plana-om',
    $k$Pirâmide Plana com OM$k$,
    $k$Gráfico de elevação vibracional, alinhamento espiritual e harmonização profunda através da geometria sagrada e do som primordial.$k$,
    $k$Será ativada uma energia de purificação espiritual e elevação vibracional, para restaurar seu alinhamento com o divino.$k$,
    $k$Ativo agora Pirâmide Plana com OM, limpando desequilíbrios energéticos e espirituais do passado, presente e futuro em (nome do consulente). Que a frequência divina do OM traga paz, equilíbrio e reconexão com o Eu Superior. Assim é, está feito, gratidão.$k$
  ),
  (
    11,
    'dissipador',
    $k$Dissipador$k$,
    $k$Gráfico usado para dissipar energias densas, pensamentos obsessivos e cargas emocionais estagnadas.$k$,
    $k$Será realizada uma limpeza profunda para dissolver toda densidade emocional e mental acumulada.$k$,
    $k$Ativo agora Dissipador, dissolvendo todas as cargas emocionais, pensamentos negativos e energias densas do campo de (nome do consulente). Que a leveza, o equilíbrio 
e a clareza se estabeleçam. Assim é, está feito, gratidão.$k$
  ),
  (
    12,
    'desimpregnador',
    $k$Desimpregnador$k$,
    $k$Gráfico que remove cargas, miasmas e energias impregnadas no campo áurico e emocional.$k$,
    $k$Será feita uma desimpregnação energética completa para restaurar sua leveza e clareza vibracional.$k$,
    $k$Ativo agora Desimpregnador, removendo todas as energias impregnadas, miasmas e cargas emocionais no campo de (nome do consulente). Que a leveza, a clareza e a vitalidade se restabeleçam. Assim é, está feito, gratidão.$k$
  ),
  (
    13,
    'justica-divina',
    $k$Justiça Divina$k$,
    $k$Gráfico de equilíbrio kármico, liberação de injustiças e reconexão com a ordem divina.$k$,
    $k$Vamos ativar a frequência da Justiça Divina para alinhar sua vida com a verdade espiritual e restaurar o senso de justiça.$k$,
    $k$Ativo agora Justiça Divina, limpando todos os registros de injustiça, abusos e desequilíbrios do passado, presente e futuro em (nome do consulente). Que a verdade, o equilíbrio e o merecimento se manifestem. Assim é, está feito, gratidão.$k$
  ),
  (
    14,
    'sol-da-vida',
    $k$Sol da Vida$k$,
    $k$Gráfico que ativa o brilho pessoal, a vitalidade, a força interior e a alegria de viver.$k$,
    $k$Vamos restaurar sua energia vital, 
fortalecer sua presença e despertar a alegria genuína de viver.$k$,
    $k$Ativo agora Sol da Vida, despertando a vitalidade, a alegria e o brilho interior em (nome do consulente), limpando padrões de apatia e desânimo do passado, presente e futuro. Que a força da vida volte a pulsar com entusiasmo. Assim é, está feito, gratidão.$k$
  ),
  (
    15,
    'energizador',
    $k$Energizador$k$,
    $k$Gráfico que fortalece o campo energético, repondo energia vital e restaurando a disposição física e espiritual.$k$,
    $k$Será feita uma recarga energética para restaurar sua força, foco e vitalidade.$k$,
    $k$Ativo agora Energizador, recarregando o campo vital de (nome do consulente), restaurando sua força, energia e motivação. Que toda exaustão do passado, presente e 
futuro seja transmutada. Assim é, está feito, gratidão.$k$
  ),
  (
    16,
    'anti-dor',
    $k$Anti Dor$k$,
    $k$Gráfico que alivia dores físicas e emocionais, promovendo conforto e regeneração energética.$k$,
    $k$Vamos suavizar dores do corpo e da alma, promovendo alívio e conforto imediato.$k$,
    $k$Ativo agora Anti Dor, aliviando as dores físicas e emocionais em (nome do consulente), limpando os registros de sofrimento e desconforto do passado, presente e futuro. Que a cura e o conforto se instalem com leveza. Assim é, está feito, gratidão.$k$
  ),
  (
    17,
    'anti-magia',
    $k$Anti Magia$k$,
    $k$Gráfico de proteção espiritual que neutraliza magias, inveja, feitiços e ataques energéticos.$k$,
    $k$Vamos realizar uma proteção energética profunda contra qualquer forma de energia nociva, intencional ou não.$k$,
    $k$Ativo agora Anti Magia, neutralizando toda e qualquer magia negativa, inveja, ataques espirituais e manipulações no campo de (nome do consulente). Que a proteção divina se fortaleça. Assim é, está feito, gratidão.$k$
  ),
  (
    18,
    'iave-sete-circulos',
    $k$Iavé – Sete Círculos$k$,
    $k$Gráfico de conexão com o Sagrado, que traz proteção, luz e orientação espiritual elevada.$k$,
    $k$Vamos abrir um campo de luz com elevada proteção e alinhamento com o plano divino.$k$,
    $k$Ativo agora Iavé – Sete Círculos, conectando (nome do consulente) com a energia divina da Fonte Criadora, limpando interferências espirituais e trazendo luz, proteção e orientação do passado, presente e futuro. Assim é, está feito, gratidão.$k$
  ),
  (
    19,
    'mesa-damien',
    $k$Mesa Damien$k$,
    $k$Gráfico multifuncional de reequilíbrio energético, usado para alinhamento espiritual, limpeza profunda e ativação de forças internas.$k$,
    $k$Será ativada uma mesa completa que trabalha vários aspectos do seu campo ao mesmo tempo: limpeza, cura e alinhamento.$k$,
    $k$Ativo agora Mesa Damien, promovendo uma limpeza multidimensional e alinhamento completo no campo de (nome do consulente), restaurando equilíbrio, proteção e clareza 
espiritual do passado, presente e futuro. Assim é, está feito, gratidão.$k$
  ),
  (
    20,
    'heptapentagrama',
    $k$Heptapentagrama$k$,
    $k$Gráfico de proteção espiritual para os sete corpos sutis. Atua blindando o campo contra qualquer tipo de ataque energético.$k$,
    $k$Será criado um escudo espiritual para proteger todo o seu campo energético de energias externas.$k$,
    $k$Ativo agora Heptapentagrama, blindando os sete corpos sutis de (nome do consulente) contra-ataques espirituais, interferências e energias invasoras do passado, presente e futuro. Que a proteção divina se estabeleça. Assim é, está feito, gratidão.$k$
  ),
  (
    21,
    'revitalizador-chakras',
    $k$Revitalizador de Chakras$k$,
    $k$Gráfico de ativação e equilíbrio dos chakras. Reenergiza os centros vitais e restaura o fluxo energético.$k$,
    $k$Vamos ativar e harmonizar todos os seus chakras, promovendo equilíbrio e bem-estar.$k$,
    $k$Ativo agora Revitalizador de Chakras, equilibrando e reenergizando todos os centros de energia de (nome do consulente), limpando bloqueios e promovendo o fluxo saudável do passado, presente e futuro. Assim é, está feito, gratidão.$k$
  ),
  (
    22,
    'scap-cabalista',
    $k$Scap Cabalístico$k$,
    $k$Gráfico de limpeza e energização simultânea. Libera impurezas e fortalece o campo sutil.$k$,
    $k$Será feita uma limpeza intensa e imediata do campo, ao mesmo tempo em que será energizado com luz vital.$k$,
    $k$Ativo agora Scap, limpando profundamente e energizando o campo de (nome do consulente), removendo impurezas, densidades e restaurando o brilho da aura do passado, presente e futuro. Assim é, está feito, gratidão.$k$
  ),
  (
    23,
    'quadrado-magico',
    $k$Quadrado Mágico$k$,
    $k$Gráfico de ordenação mental e emocional. Promove clareza de pensamento, foco e organização interior.$k$,
    $k$Será organizada a energia mental e emocional para trazer mais foco, ordem interna e segurança.$k$,
    $k$Ativo agora Quadrado Mágico, organizando o campo mental e emocional de (nome do consulente), limpando a confusão, desordem e instabilidade do passado, presente e futuro. Que a clareza e o foco se instalem com sabedoria. Assim é, está feito, gratidão.$k$
  ),
  (
    24,
    'sorte-sucesso',
    $k$Sorte e Sucesso$k$,
    $k$Gráfico que atrai oportunidades, ativa o magnetismo da sorte e abre caminhos para o sucesso.$k$,
    $k$Será realizada uma ativação para aumentar seu magnetismo e atrair oportunidades e prosperidade.$k$,
    $k$Ativo agora Sorte e Sucesso, ativando o magnetismo da prosperidade no campo de (nome do consulente), limpando bloqueios que impedem o sucesso do passado, presente e 
futuro. Que as oportunidades fluam com leveza. Assim é, está feito, gratidão.$k$
  ),
  (
    25,
    'cubo-metatron',
    $k$Cubo de Metatron$k$,
    $k$Gráfico de geometria sagrada usado para proteção, cura multidimensional e alinhamento com a luz divina.$k$,
    $k$Será ativada a geometria sagrada de proteção e realinhamento com a energia divina de Metatron.$k$,
    $k$Ativo agora Cubo de Metatron, alinhando o campo energético de (nome do consulente) com a luz divina, limpando interferências multidimensionais do passado, presente e futuro. Que a proteção sagrada e a cura superior se instalem. Assim é, está feito, gratidão.$k$
  ),
  (
    26,
    'desembaracador-relacionamentos',
    $k$Desembaraçador de Relacionamentos$k$,
    $k$Gráfico que atua na liberação de vínculos tóxicos, dependência emocional e padrões negativos em relações afetivas.$k$,
    $k$Vamos trabalhar os laços energéticos nocivos para limpar padrões repetitivos e promover equilíbrio nas relações.$k$,
    $k$Ativo agora Desembaraçador de Relacionamentos, limpando vínculos tóxicos, 
dependência emocional e padrões de dor do passado, presente e futuro em (nome do consulente). Que se estabeleça liberdade afetiva, clareza e harmonia nos relacionamentos. Assim é, está feito, gratidão.$k$
  ),
  (
    27,
    'prosperador',
    $k$Prosperador$k$,
    $k$Gráfico que ativa o fluxo da prosperidade, desbloqueia crenças de escassez e alinha o campo com abundância.$k$,
    $k$Será feita uma ativação vibracional para destravar o fluxo financeiro e manifestar abundância material.$k$,
    $k$Ativo agora Prosperador, desbloqueando o fluxo da prosperidade no campo de (nome do consulente), limpando crenças limitantes, medos e escassez do passado, presente e futuro. Que a abundância flua com leveza e constância. Assim é, está feito, gratidão.$k$
  ),
  (
    28,
    'antakarana',
    $k$Antakarana$k$,
    $k$Gráfico de conexão espiritual profunda, alinhamento com o Eu Superior e expansão da consciência.$k$,
    $k$Vamos reconectar você com seu Eu Divino e abrir caminhos de expansão espiritual e sabedoria interior.$k$,
    $k$Ativo agora Antakarana, conectando (nome do consulente) com seu Eu Superior, limpando bloqueios espirituais e expandindo sua consciência do passado, presente e futuro. Que a luz da alma se manifeste plenamente. Assim é, está feito, gratidão.$k$
  ),
  (
    29,
    'piramide-tao',
    $k$Pirâmide Tao$k$,
    $k$Gráfico que harmoniza o yin e yang, equilibra os aspectos masculino e feminino e traz centramento.$k$,
    $k$Será feita uma harmonização entre forças opostas internas para restaurar paz, equilíbrio e força interior.$k$,
    $k$Ativo agora Pirâmide Tao, equilibrando o yin e yang no campo de (nome do consulente), limpando polaridades desequilibradas do passado, presente e futuro. Que a harmonia e o centramento interno se instalem com fluidez. Assim é, está feito, gratidão.$k$
  ),
  (
    30,
    'hexagrama',
    $k$Hexagrama$k$,
    $k$Gráfico de proteção cósmica e alinhamento entre o céu e a terra. Fortalece o campo espiritual e o propósito de vida.$k$,
    $k$Será ativado um campo sagrado que une o divino e o terreno para restaurar sua força espiritual e alinhamento de propósito.$k$,
    $k$Ativo agora Hexagrama, unindo céu e terra no campo de (nome do consulente), limpando bloqueios espirituais e fortalecendo seu propósito divino do passado, presente e 
futuro. Que a luz e a proteção se estabeleçam. Assim é, está feito, gratidão.$k$
  ),
  (
    31,
    'turbilhao-prosperador',
    $k$Turbilhão Prosperador$k$,
    $k$Gráfico de movimento e ativação do campo da abundância. Desbloqueia o fluxo financeiro e traz ação para prosperar.$k$,
    $k$Será ativada uma energia que impulsiona sua vida financeira, removendo bloqueios e ativando sua força de prosperar.$k$,
    $k$Ativo agora Turbilhão Prosperador, movimentando o fluxo da prosperidade no campo de (nome do consulente), limpando estagnações e medos de prosperar do passado, presente e futuro. Que a abundância entre em ação. Assim é, está feito, gratidão.$k$
  ),
  (
    32,
    'kit-cromo',
    $k$Kit Cromo$k$,
    $k$Conjunto de gráficos com base na cromoterapia, usados para harmonizar emoções, chakras e vibrações por meio das cores.$k$,
    $k$Será utilizada a vibração das cores para equilibrar seu campo energético e emocional conforme sua necessidade.$k$,
    $k$Ativo agora Kit Cromo, irradiando as frequências de cor necessárias no campo de (nome do consulente), limpando distorções vibracionais e restaurando o equilíbrio emocional e energético do passado, presente e futuro. Assim é, está feito, gratidão.$k$
  ),
  (
    33,
    'alta-vitalidade',
    $k$Alta Vitalidade$k$,
    $k$Gráfico que eleva a energia vital, fortalece o sistema imunológico e traz disposição física e mental.$k$,
    $k$Vamos ativar sua energia vital para aumentar a disposição e restaurar sua força interior.$k$,
    $k$Ativo agora Alta Vitalidade, elevando a energia vital de (nome do consulente), limpando padrões de cansaço, fraqueza e desmotivação do passado, presente e futuro. Que a disposição e a força se restabeleçam. Assim é, está feito, gratidão.$k$
  ),
  (
    34,
    'cruz-ansata',
    $k$Cruz Ansata (Ankh)$k$,
    $k$Gráfico egípcio que simboliza a vida eterna, renascimento e conexão com o fluxo divino da existência.$k$,
    $k$Será ativada a energia da vida plena, do renascimento e da reconexão com seu poder criador.$k$,
    $k$Ativo agora Cruz Ansata, ativando o fluxo de vida, regeneração e renascimento espiritual em (nome do consulente), limpando padrões de autossabotagem e bloqueios 
vitais do passado, presente e futuro. Que a força da vida eterna se manifeste. Assim é, está feito, gratidão.$k$
  ),
  (
    35,
    'vesica-piscis',
    $k$Vesica Piscis$k$,
    $k$Símbolo da criação divina, união dos opostos e expansão do campo criador. Ativa o feminino e masculino sagrados.$k$,
    $k$Vamos ativar a energia criadora divina,equilibrando seus aspectos internos e impulsionando sua manifestação consciente.$k$,
    $k$Ativo agora Vesica Piscis, unificando o sagrado feminino e o sagradomasculino no campo de (nome do consulente), limpando desequilíbrios, repressões e bloqueios criativos do passado, presente e futuro. Que o poder de criação consciente se manifeste plenamente. Assim é, está feito, gratidão.$k$
  );

  select count(*) into v_matched_assets
  from _v26b_graph_knowledge k
  inner join public.methodology_assets ma
    on ma.slug = k.asset_slug
    and ma.tool_id = v_tool_graph_id
    and ma.asset_type = 'graph'
    and ma.status = 'active';

  select array_agg(k.asset_slug order by k.sort_order)
  into v_missing_slugs
  from _v26b_graph_knowledge k
  where not exists (
    select 1
    from public.methodology_assets ma
    where ma.slug = k.asset_slug
      and ma.tool_id = v_tool_graph_id
      and ma.asset_type = 'graph'
      and ma.status = 'active'
  );

  if v_missing_slugs is not null and array_length(v_missing_slugs, 1) > 0 then
    raise warning 'V2.6B: unmatched graph asset slugs: %', array_to_string(v_missing_slugs, ', ');
  end if;

  -- -------------------------------------------------------------------------
  -- specialty_asset_content
  -- -------------------------------------------------------------------------
  insert into public.specialty_asset_content (
    specialty_id,
    asset_id,
    title,
    therapist_explanation,
    client_explanation,
    activation_text,
    source_name,
    source_type,
    source_reference,
    content_version,
    is_app_adapted,
    is_active,
    sort_order,
    metadata
  )
  select
    v_specialty_id,
    ma.id,
    k.asset_name,
    k.therapist_explanation,
    k.client_explanation,
    k.activation_text,
    'Vanessa',
    'course_material',
    'GRAFICOS MESA.txt',
    'v1',
    false,
    true,
    k.sort_order,
    jsonb_build_object('import_source', 'v2.6b')
  from _v26b_graph_knowledge k
  inner join public.methodology_assets ma
    on ma.slug = k.asset_slug
    and ma.tool_id = v_tool_graph_id
    and ma.asset_type = 'graph'
    and ma.status = 'active'
  on conflict (specialty_id, asset_id) do update set
    title = excluded.title,
    therapist_explanation = excluded.therapist_explanation,
    client_explanation = excluded.client_explanation,
    activation_text = excluded.activation_text,
    source_name = excluded.source_name,
    source_type = excluded.source_type,
    source_reference = excluded.source_reference,
    content_version = excluded.content_version,
    is_app_adapted = excluded.is_app_adapted,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order,
    metadata = coalesce(public.specialty_asset_content.metadata, '{}'::jsonb)
      || excluded.metadata,
    updated_at = now();

  get diagnostics v_content_updated = row_count;

  -- -------------------------------------------------------------------------
  -- activation_scripts
  -- -------------------------------------------------------------------------
  insert into public.activation_scripts (
    name,
    slug,
    script_type,
    content,
    status,
    source_name,
    source_type,
    source_reference,
    content_version,
    is_app_adapted,
    is_active,
    metadata
  )
  select
    'Ativação — ' || k.asset_name,
    'ativacao-' || k.asset_slug,
    'activation',
    k.activation_text,
    'active',
    'Vanessa',
    'course_material',
    'GRAFICOS MESA.txt',
    'v1',
    false,
    true,
    jsonb_build_object('import_source', 'v2.6b', 'asset_slug', k.asset_slug)
  from _v26b_graph_knowledge k
  inner join public.methodology_assets ma
    on ma.slug = k.asset_slug
    and ma.tool_id = v_tool_graph_id
    and ma.asset_type = 'graph'
    and ma.status = 'active'
  on conflict (slug) do update set
    name = excluded.name,
    script_type = excluded.script_type,
    content = excluded.content,
    status = excluded.status,
    source_name = excluded.source_name,
    source_type = excluded.source_type,
    source_reference = excluded.source_reference,
    content_version = excluded.content_version,
    is_app_adapted = excluded.is_app_adapted,
    is_active = excluded.is_active,
    metadata = coalesce(public.activation_scripts.metadata, '{}'::jsonb) || excluded.metadata,
    updated_at = now();

  get diagnostics v_scripts_upserted = row_count;

  -- -------------------------------------------------------------------------
  -- activation_script_links (idempotent: one link per script + content row)
  -- -------------------------------------------------------------------------
  delete from public.activation_script_links asl
  using public.activation_scripts s
  where asl.activation_script_id = s.id
    and s.source_reference = 'GRAFICOS MESA.txt'
    and s.script_type = 'activation'
    and asl.target_type = 'specialty_asset_content';

  insert into public.activation_script_links (
    activation_script_id,
    target_type,
    target_id,
    sort_order
  )
  select
    s.id,
    'specialty_asset_content',
    sac.id,
    0
  from _v26b_graph_knowledge k
  inner join public.methodology_assets ma
    on ma.slug = k.asset_slug
    and ma.tool_id = v_tool_graph_id
    and ma.asset_type = 'graph'
    and ma.status = 'active'
  inner join public.specialty_asset_content sac
    on sac.specialty_id = v_specialty_id
    and sac.asset_id = ma.id
  inner join public.activation_scripts s
    on s.slug = 'ativacao-' || k.asset_slug
  where s.source_reference = 'GRAFICOS MESA.txt';

  get diagnostics v_links_created = row_count;

  raise notice 'V2.6B graph knowledge import complete.';
  raise notice '  source file entries: %', v_source_entries;
  raise notice '  matched active graph assets: %', v_matched_assets;
  raise notice '  specialty_asset_content rows touched: %', v_content_updated;
  raise notice '  activation_scripts rows touched: %', v_scripts_upserted;
  raise notice '  activation_script_links created: %', v_links_created;

  if v_matched_assets <> v_source_entries then
    raise warning
      'Expected % matched assets; found %. Missing: %',
      v_source_entries,
      v_matched_assets,
      coalesce(array_to_string(v_missing_slugs, ', '), '(none listed)');
  end if;

end $$;
