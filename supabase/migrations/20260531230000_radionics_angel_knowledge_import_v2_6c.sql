-- =============================================================================
-- RADIONICS — Phase V2.6C: Angel knowledge import (Mesa 49)
-- Source: docs/knowledge/vanessa/ANJOs.txt (49 entries validated)
--   angels: 42 · archangels: 7
-- Target: activation_scripts, specialty_asset_content (activation_text only),
--          activation_script_links (target_type = asset, for validation parity)
-- Specialty: mesa-49 · Tool: angel-set-49
-- Idempotent. No invented content.
-- =============================================================================

do $$
declare
  v_specialty_id uuid;
  v_tool_angel_id uuid;
  v_source_entries integer := 49;
  v_angel_entries integer := 42;
  v_archangel_entries integer := 7;
  v_scripts_upserted integer;
  v_content_updated integer;
  v_links_created integer;
  v_matched_assets integer;
  v_missing_slugs text[];
begin
  select id into v_specialty_id
  from public.radionics_specialties
  where slug = 'mesa-49';

  if v_specialty_id is null then
    raise exception 'radionics_specialties slug ''mesa-49'' is required.';
  end if;

  select id into v_tool_angel_id
  from public.methodology_tools
  where slug = 'angel-set-49';

  if v_tool_angel_id is null then
    raise exception 'methodology_tools slug ''angel-set-49'' is required.';
  end if;

  create temp table _v26c_angel_knowledge (
    sort_order integer not null,
    asset_slug text not null,
    asset_type text not null,
    asset_name text not null,
    activation_text text not null,
    primary key (asset_slug)
  ) on commit drop;

  insert into _v26c_angel_knowledge (
    sort_order, asset_slug, asset_type, asset_name, activation_text
  ) values
  (
    1,
    'angel-magic',
    'angel',
    $k$MAGIA DIVINA$k$,
    $k$Ativo agora o símbolo - Anjo - Magia Divina no campo de (nome - consulente), limpando toda energia  densa, negatividade e desequilíbrio - alma. Que a purificação e o reequilíbrio se manifestem com o amor divino. Assim é, está  feito, gratidão.$k$
  ),
  (
    2,
    'angel-healing',
    'angel',
    $k$CURA INTERIOR$k$,
    $k$Ativo agora o símbolo - Anjo - Cura Interior no campo de (nome - consulente), liberando as dores  - alma, rejeições, culpas e medos - passado, presente e futuro. Que a cura plena se manifeste de dentro - fora. Assim é, está feito, gratidão.$k$
  ),
  (
    3,
    'angel-guidance',
    'angel',
    $k$DIRECIONAMENTO$k$,
    $k$Ativo agora o símbolo - Anjo - Direcionamento no campo de (nome - consulente), trazendo clareza,  propósito e sabedoria - escolher os melhores caminhos. Que o coração fale mais alto. Assim é, está feito, gratidão.$k$
  ),
  (
    4,
    'angel-lightness',
    'angel',
    $k$LEVEZA$k$,
    $k$Ativo agora o símbolo - Anjo - Leveza no campo de (nome - consulente), limpando pesos, tensões  e desequilíbrios emocionais. Que a paz, a calma e a liberdade fluam com suavidade. Assim é, está feito, gratidão.$k$
  ),
  (
    5,
    'angel-personal-power',
    'angel',
    $k$PODER PESSOAL$k$,
    $k$Ativo agora o símbolo - Anjo - Ativar o Poder Pessoal no campo de (nome - consulente),  despertando sua luz, autoestima e força interior. Que a autoconfiança e o brilho - alma se revelem com plenitude. Assim é,  está feito, gratidão.$k$
  ),
  (
    6,
    'angel-unconditional-love',
    'angel',
    $k$AMOR INCONDICIONAL$k$,
    $k$Ativo agora o símbolo - Anjo - Amor Incondicional no campo de (nome - consulente), limpando  julgamentos, carências e expectativas. Que o amor puro, genuíno e sem condições preencha todo o seu ser. Assim é, está feito, gratidão.$k$
  ),
  (
    7,
    'angel-wisdom',
    'angel',
    $k$SABEDORIA$k$,
    $k$Ativo agora o símbolo - Anjo - Sabedoria no campo de (nome - consulente), despertando o  discernimento e a sabedoria divina - decisões conscientes. Que a verdade - coração guie todos os caminhos. Assim é, está  feito, gratidão.$k$
  ),
  (
    8,
    'angel-clarity',
    'angel',
    $k$CLAREZA$k$,
    $k$Ativo agora o símbolo - Anjo - Clareza no campo de (nome - consulente), dissipando a confusão e  revelando a visão - futuro com propósito. Que a mente e o espírito enxerguem com nitidez. Assim é, está feito, gratidão.$k$
  ),
  (
    9,
    'angel-beauty',
    'angel',
    $k$BELEZA$k$,
    $k$Ativo agora o símbolo - Anjo - Beleza no campo de (nome - consulente), despertando a percepção  - beleza na vida, no corpo e na alma. Que o sagrado se revele na simplicidade e no natural. Assim é, está feito, gratidão.$k$
  ),
  (
    10,
    'angel-discernment',
    'angel',
    $k$DISCERNIMENTO$k$,
    $k$Ativo agora o símbolo - Anjo - Discernimento no campo de (nome - consulente), revelando o que  está oculto e limpando ilusões - passado, presente e futuro. Que a verdade se revele com clareza e proteção divina. Assim é, está feito, gratidão.$k$
  ),
  (
    11,
    'angel-purity',
    'angel',
    $k$PUREZA$k$,
    $k$Ativo agora o símbolo - Anjo - Pureza no campo de (nome - consulente), limpando intenções  distorcidas, vaidades ocultas e padrões impuros. Que a luz - verdade, - honestidade e - pureza reine nas atitudes e no  coração. Assim é, está feito, gratidão.$k$
  ),
  (
    12,
    'angel-purpose',
    'angel',
    $k$PROPÓSITO E MISSÃO DE ALMA$k$,
    $k$Ativo agora o símbolo - Anjo - Propósito e Missão de Alma no campo de (nome - consulente),  despertando o alinhamento com seu chamado divino. Que seus dons e talentos se manifestem com direção, coragem e verdade.  Assim é, está feito, gratidão.$k$
  ),
  (
    13,
    'angel-peace',
    'angel',
    $k$PAZ$k$,
    $k$Ativo agora o símbolo - Anjo - Paz no campo de (nome - consulente), limpando conflitos internos,  perturbações emocionais e ruídos espirituais. Que a serenidade, a harmonia e o silêncio sagrado se estabeleçam. Assim é, está feito, gratidão.$k$
  ),
  (
    14,
    'angel-joy',
    'angel',
    $k$ALEGRIA$k$,
    $k$Ativo agora o símbolo - Anjo - Alegria no campo de (nome - consulente), liberando tristeza, desânimo  e cansaço emocional. Que a vida seja preenchida de sorrisos sinceros, entusiasmo e prazer de viver. Assim é, está feito,  gratidão.$k$
  ),
  (
    15,
    'angel-prosperity',
    'angel',
    $k$PROSPERIDADE$k$,
    $k$Ativo agora o símbolo - Anjo - Prosperidade no campo de (nome - consulente), quebrando padrões  de escassez e ativando a abundância divina. Que seus caminhos se abram com bênçãos, fluidez e merecimento. Assim é, está  feito, gratidão.$k$
  ),
  (
    16,
    'angel-reflection',
    'angel',
    $k$REFLEXÃO$k$,
    $k$Ativo agora o símbolo - Anjo - Reflexão no campo de (nome - consulente), trazendo lucidez sobre  suas escolhas e aprendizados. Que a consciência se expanda e novas possibilidades floresçam. Assim é, está feito, gratidão.$k$
  ),
  (
    17,
    'angel-illumination',
    'angel',
    $k$ILUMINAÇÃO E CONSCIÊNCIA$k$,
    $k$Ativo agora o símbolo - Anjo - Iluminação e Consciência no campo de (nome - consulente),  dissolvendo padrões inconscientes e abrindo portais de despertar espiritual. Que a luz guie seus passos com sabedoria. Assim  é, está feito, gratidão.$k$
  ),
  (
    18,
    'angel-liberation',
    'angel',
    $k$LIBERTAÇÃO (Limpeza de Anjo Caído)$k$,
    $k$Ativo agora o símbolo - Anjo - Libertação no campo de (nome - consulente), quebrando amarras,  pactos e influências negativas ligadas ao poder, vaidade e ilusão. Que a proteção de Miguel e seus anjos se faça presente.  Assim é, está feito, gratidão.$k$
  ),
  (
    19,
    'angel-transformation',
    'angel',
    $k$TRANSFORMAÇÃO$k$,
    $k$Ativo agora o símbolo - Anjo - Transformação no campo de (nome - consulente), transmutando  velhos padrões e abrindo caminho - o renascimento. Que a evolução se manifeste com consciência e ação. Assim é, está  feito, gratidão.$k$
  ),
  (
    20,
    'angel-abundance',
    'angel',
    $k$ABUNDÂNCIA$k$,
    $k$Ativo agora o símbolo - Anjo - Abundância no campo de (nome - consulente), ativando a plenitude  e a fartura em todas as áreas - vida. Que a energia - transbordar envolva mente, corpo e alma. Assim é, está feito, gratidão.$k$
  ),
  (
    21,
    'angel-confidence',
    'angel',
    $k$CONFIANÇA$k$,
    $k$Ativo agora o símbolo - Anjo - Confiança no campo de (nome - consulente), dissolvendo medos,  inseguranças e dúvidas internas. Que a fé em si, na vida e no plano divino seja restaurada plenamente. Assim é, está feito,  gratidão.$k$
  ),
  (
    22,
    'angel-compassion',
    'angel',
    $k$COMPAIXÃO$k$,
    $k$Ativo agora o símbolo - Anjo - Compaixão no campo de (nome - consulente), despertando o  acolhimento, a empatia e a gentileza diante - dor alheia e - própria. Que o amor compassivo conduza suas ações. Assim é,  está feito, gratidão.$k$
  ),
  (
    23,
    'angel-fun',
    'angel',
    $k$DIVERSÃO$k$,
    $k$Ativo agora o símbolo - Anjo - Diversão no campo de (nome - consulente), liberando rigidez, peso e  cobranças excessivas. Que a leveza, o riso e os momentos de prazer façam parte - sua jornada. Assim é, está feito, gratidão.$k$
  ),
  (
    24,
    'angel-empathy',
    'angel',
    $k$EMPATIA$k$,
    $k$Ativo agora o símbolo - Anjo - Empatia no campo de (nome - consulente), expandindo a consciência  - sentir e compreender o outro com o coração. Que a conexão humana aconteça com verdade e sensibilidade. Assim é, está  feito, gratidão.$k$
  ),
  (
    25,
    'angel-satisfaction',
    'angel',
    $k$SATISFAÇÃO$k$,
    $k$Ativo agora o símbolo - Anjo - Satisfação no campo de (nome - consulente), libertando padrões de  autocrítica e comparação. Que a alegria por ser quem se é floresça em todos os níveis. Assim é, está feito, gratidão.$k$
  ),
  (
    26,
    'angel-hope',
    'angel',
    $k$ESPERANÇA$k$,
    $k$Ativo agora o símbolo - Anjo - Esperança no campo de (nome - consulente), restaurando a fé, a  coragem e a visão de um futuro possível e iluminado. Que a esperança seja a luz no meio - caminho. Assim é, está feito,  gratidão.$k$
  ),
  (
    27,
    'angel-passion',
    'angel',
    $k$PAIXÃO$k$,
    $k$Ativo agora o símbolo - Anjo - Paixão no campo de (nome - consulente), reacendendo o fogo sagrado  pelos sonhos, projetos e sentimentos. Que a motivação e o entusiasmo guiem seus passos. Assim é, está feito, gratidão.$k$
  ),
  (
    28,
    'angel-commitment',
    'angel',
    $k$COMPROMETIMENTO$k$,
    $k$Ativo agora o símbolo - Anjo - Comprometimento no campo de (nome - consulente), fortalecendo a  disciplina, a clareza de metas e a responsabilidade com seu propósito. Que a ação firme se manifeste. Assim é, está feito,  gratidão.$k$
  ),
  (
    29,
    'angel-self-esteem',
    'angel',
    $k$AUTOESTIMA$k$,
    $k$Ativo agora o símbolo - Anjo - Autoestima no campo de (nome - consulente), curando julgamentos  internos e resgatando o valor pessoal. Que o amor-próprio floresça em segurança e autovalorização. Assim é, está feito,  gratidão.$k$
  ),
  (
    30,
    'angel-courage',
    'angel',
    $k$CORAGEM$k$,
    $k$Ativo agora o símbolo - Anjo - Coragem no campo de (nome - consulente), dissolvendo medos  paralisantes e despertando força interior - agir. Que a bravura e a determinação conduzam a vitória. Assim é, está feito,  gratidão.$k$
  ),
  (
    31,
    'angel-acceleration',
    'angel',
    $k$ACELERAÇÃO$k$,
    $k$Ativo agora o símbolo - Anjo - Aceleração no campo de (nome - consulente), desacelerando  excessos, ansiedade e urgência no tempo - alma. Que o equilíbrio entre ação e pausa se instale com leveza. Assim é, está  feito, gratidão.$k$
  ),
  (
    32,
    'angel-communication',
    'angel',
    $k$COMUNICAÇÃO$k$,
    $k$Ativo agora o símbolo - Anjo - Comunicação no campo de (nome - consulente), abrindo canais -  uma expressão clara, verdadeira e amorosa. Que toda palavra seja ponte de cura e conexão. Assim é, está feito, gratidão.$k$
  ),
  (
    33,
    'angel-gratitude',
    'angel',
    $k$GRATIDÃO$k$,
    $k$Ativo agora o símbolo - Anjo - Gratidão no campo de (nome - consulente), despertando o coração  - reconhecer as bênçãos já recebidas. Que o fluxo de gratidão abra as portas - abundância e - paz. Assim é, está feito,  gratidão.$k$
  ),
  (
    34,
    'archangel-raziel',
    'archangel',
    $k$Arcanjo RAZIEL$k$,
    $k$Ativo agora o símbolo - Arcanjo Raziel no campo de (nome - consulente), trazendo sabedoria divina,  revelações profundas e a verdade - alma. Que a luz - conhecimento sagrado guie seus passos. Assim é, está feito, gratidão.$k$
  ),
  (
    35,
    'archangel-raphael',
    'archangel',
    $k$Arcanjo RAFAEL$k$,
    $k$Ativo agora o símbolo - Arcanjo Rafael no campo de (nome - consulente), promovendo cura integral  - corpo, - alma e - espírito. Que a saúde perfeita e a harmonia divina se estabeleçam em todos os níveis. Assim é, está  feito, gratidão.$k$
  ),
  (
    36,
    'archangel-gabriel',
    'archangel',
    $k$Arcanjo GABRIEL$k$,
    $k$Ativo agora o símbolo - Arcanjo Gabriel no campo de (nome - consulente), despertando a inspiração,  a expressão emocional e a clareza - se comunicar com verdade. Que a paz e a boa nova cheguem com leveza. Assim é,  está feito, gratidão.$k$
  ),
  (
    37,
    'archangel-michael',
    'archangel',
    $k$Arcanjo MIGUEL$k$,
    $k$Ativo agora o símbolo - Arcanjo Miguel no campo de (nome - consulente), invocando proteção divina,  força espiritual e libertação de energias nocivas. Que o escudo - justiça e - luz esteja presente agora. Assim é, está feito,  gratidão.$k$
  ),
  (
    38,
    'archangel-uriel',
    'archangel',
    $k$Arcanjo URIEL$k$,
    $k$Ativo agora o símbolo - Arcanjo Uriel no campo de (nome - consulente), trazendo luz - o corpo,  mente e coração. Que a alegria, a prosperidade e a sabedoria se manifestem com plenitude. Assim é, está feito, gratidão.$k$
  ),
  (
    39,
    'archangel-camael',
    'archangel',
    $k$Arcanjo CAMAEL$k$,
    $k$Ativo agora o símbolo - Arcanjo Camael no campo de (nome - consulente), despertando a força de  vontade, coragem e justiça em seu coração. Que a dignidade, a ação reta e a proteção sejam constantes. Assim é, está feito,  gratidão.$k$
  ),
  (
    40,
    'archangel-metatron',
    'archangel',
    $k$Arcanjo METATRON$k$,
    $k$Ativo agora o símbolo - Arcanjo Metatron no campo de (nome - consulente), harmonizando o espírito  com as leis divinas e restaurando o equilíbrio entre o céu e a terra. Que a sabedoria kármica e a plenitude espiritual guiem sua  jornada. Assim é, está feito, gratidão.$k$
  ),
  (
    41,
    'angel-union',
    'angel',
    $k$UNIÃO$k$,
    $k$Ativo agora o símbolo - Anjo - União no campo de (nome - consulente), fortalecendo os laços afetivos  e a conexão de alma com os que caminham ao seu lado. Que a harmonia e o amor se unam em perfeita sintonia. Assim é, está  feito, gratidão.$k$
  ),
  (
    42,
    'angel-humor',
    'angel',
    $k$HUMOR$k$,
    $k$Ativo agora o símbolo - Anjo - Humor no campo de (nome - consulente), dissipando tristeza, tensão  e rigidez. Que o riso, a leveza e a alegria preencham seu dia com energia vibrante e renovada. Assim é, está feito, gratidão.$k$
  ),
  (
    43,
    'angel-harmony',
    'angel',
    $k$HARMONIA$k$,
    $k$Ativo agora o símbolo - Anjo - Harmonia no campo de (nome - consulente), restaurando o equilíbrio  em todas as áreas - vida. Que a paz, a serenidade e a vibração - amor se espalhem ao seu redor. Assim é, está feito,  gratidão.$k$
  ),
  (
    44,
    'angel-forgiveness',
    'angel',
    $k$PERDÃO$k$,
    $k$Ativo agora o símbolo - Anjo - Perdão no campo de (nome - consulente), limpando mágoas,  ressentimentos e culpas - passado, presente e futuro. Que o coração se liberte - amar e acolher com leveza. Assim é, está  feito, gratidão.$k$
  ),
  (
    45,
    'angel-wellbeing',
    'angel',
    $k$BEM-ESTAR$k$,
    $k$Ativo agora o símbolo - Anjo - Bem-Estar no campo de (nome - consulente), fortalecendo a saúde,  os hábitos saudáveis e a vitalidade - corpo e - alma. Que o equilíbrio se manifeste por inteiro. Assim é, está feito, gratidão.$k$
  ),
  (
    46,
    'angel-transmutation',
    'angel',
    $k$TRANSMUTAÇÃO$k$,
    $k$Ativo agora o símbolo - Anjo - Transmutação no campo de (nome - consulente), transformando  energias densas em luz e consciência. Que a chama violeta purifique, eleve e renove todas as áreas - sua vida. Assim é, está feito, gratidão.$k$
  ),
  (
    47,
    'angel-focus-discipline',
    'angel',
    $k$FOCO E DISCIPLINA$k$,
    $k$Ativo agora o símbolo - Anjo - Foco e Disciplina no campo de (nome - consulente), ativando força,  constância e clareza - manifestar seus objetivos. Que o caminho se mantenha firme e direcionado. Assim é, está feito,  gratidão.$k$
  ),
  (
    48,
    'angel-problem-solving',
    'angel',
    $k$SOLUÇÃO DE PROBLEMAS$k$,
    $k$Ativo agora o símbolo - Anjo - Solução de Problemas no campo de (nome - consulente), iluminando  os caminhos e trazendo clareza - superar os desafios com sabedoria. Que as respostas venham com leveza e fluidez. Assim  é, está feito, gratidão.$k$
  ),
  (
    49,
    'angel-perfect-health',
    'angel',
    $k$SAÚDE PERFEITA$k$,
    $k$Ativo agora o símbolo - Anjo - Saúde Perfeita no campo de (nome - consulente), restaurando o  equilíbrio físico, mental, emocional e espiritual. Que a energia - vitalidade se manifeste em plenitude. Assim é, está feito,  gratidão.$k$
  );

  select count(*) into v_matched_assets
  from _v26c_angel_knowledge k
  inner join public.methodology_assets ma
    on ma.slug = k.asset_slug
    and ma.tool_id = v_tool_angel_id
    and ma.asset_type = k.asset_type
    and ma.status = 'active';

  select array_agg(k.asset_slug order by k.sort_order)
  into v_missing_slugs
  from _v26c_angel_knowledge k
  where not exists (
    select 1
    from public.methodology_assets ma
    where ma.slug = k.asset_slug
      and ma.tool_id = v_tool_angel_id
      and ma.asset_type = k.asset_type
      and ma.status = 'active'
  );

  if v_missing_slugs is not null and array_length(v_missing_slugs, 1) > 0 then
    raise warning 'V2.6C: unmatched angel/archangel asset slugs: %', array_to_string(v_missing_slugs, ', ');
  end if;

  -- -------------------------------------------------------------------------
  -- specialty_asset_content — activation_text + provenance only (no therapist/client)
  -- -------------------------------------------------------------------------
  insert into public.specialty_asset_content (
    specialty_id,
    asset_id,
    title,
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
    k.activation_text,
    'Vanessa',
    'course_material',
    'docs/knowledge/vanessa/ANJOs',
    'v1',
    false,
    true,
    k.sort_order,
    jsonb_build_object('import_source', 'v2.6c')
  from _v26c_angel_knowledge k
  inner join public.methodology_assets ma
    on ma.slug = k.asset_slug
    and ma.tool_id = v_tool_angel_id
    and ma.asset_type = k.asset_type
    and ma.status = 'active'
  on conflict (specialty_id, asset_id) do update set
    title = coalesce(public.specialty_asset_content.title, excluded.title),
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
    'docs/knowledge/vanessa/ANJOs',
    'v1',
    false,
    true,
    jsonb_build_object('import_source', 'v2.6c', 'asset_slug', k.asset_slug, 'asset_type', k.asset_type)
  from _v26c_angel_knowledge k
  inner join public.methodology_assets ma
    on ma.slug = k.asset_slug
    and ma.tool_id = v_tool_angel_id
    and ma.asset_type = k.asset_type
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
  -- activation_script_links (idempotent)
  -- -------------------------------------------------------------------------
  delete from public.activation_script_links asl
  using public.activation_scripts s
  where asl.activation_script_id = s.id
    and s.source_reference = 'docs/knowledge/vanessa/ANJOs'
    and s.script_type = 'activation';

  -- Asset-level links (validation SQL expects target_id = methodology_assets.id)
  insert into public.activation_script_links (
    activation_script_id,
    target_type,
    target_id,
    sort_order
  )
  select
    s.id,
    'asset',
    ma.id,
    0
  from _v26c_angel_knowledge k
  inner join public.methodology_assets ma
    on ma.slug = k.asset_slug
    and ma.tool_id = v_tool_angel_id
    and ma.asset_type = k.asset_type
    and ma.status = 'active'
  inner join public.activation_scripts s
    on s.slug = 'ativacao-' || k.asset_slug
    and s.source_reference = 'docs/knowledge/vanessa/ANJOs';

  get diagnostics v_links_created = row_count;

  raise notice 'V2.6C angel knowledge import complete.';
  raise notice '  source file entries: % (% angels, % archangels)', v_source_entries, v_angel_entries, v_archangel_entries;
  raise notice '  matched active assets: %', v_matched_assets;
  raise notice '  specialty_asset_content rows touched: %', v_content_updated;
  raise notice '  activation_scripts rows touched: %', v_scripts_upserted;
  raise notice '  activation_script_links (asset): %', v_links_created;

  if v_matched_assets <> v_source_entries then
    raise warning
      'Expected % matched assets; found %. Missing: %',
      v_source_entries,
      v_matched_assets,
      coalesce(array_to_string(v_missing_slugs, ', '), '(none listed)');
  end if;

end $$;
