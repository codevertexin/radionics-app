-- =============================================================================
-- RADIONICS — Phase V2.6D: Chakra knowledge import (Mesa 35)
-- Source: docs/knowledge/vanessa/Chakra.txt (7 entries validated)
-- Target: methodology_assets (naming), specialty_asset_content (mesa-35),
--         activation_scripts, activation_script_links
-- Idempotent. No invented content.
-- =============================================================================

do $$
declare
  v_specialty_id uuid;
  v_tool_chakra_id uuid;
  v_source_entries integer := 7;
  v_naming_updated integer;
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

  select id into v_tool_chakra_id
  from public.methodology_tools
  where slug = 'chakra-set';

  if v_tool_chakra_id is null then
    raise exception 'methodology_tools slug ''chakra-set'' is required.';
  end if;

  create temp table _v26d_chakra_knowledge (
    sort_order integer not null,
    asset_slug text not null,
    asset_name text not null,
    original_name text not null,
    aliases text[] not null,
    therapist_explanation text not null,
    client_explanation text not null,
    interpretation text not null,
    recommended_use text not null,
    activation_text text not null,
    structured_metadata jsonb not null,
    primary key (asset_slug)
  ) on commit drop;

  insert into _v26d_chakra_knowledge (
    sort_order,
    asset_slug,
    asset_name,
    original_name,
    aliases,
    therapist_explanation,
    client_explanation,
    interpretation,
    recommended_use,
    activation_text,
    structured_metadata
  ) values
  (
    1,
    'chakra-basico',
    $k$Chakra Básico$k$,
    $k$Muladhara$k$,
    ARRAY[$k$Chakra Raiz$k$, $k$Muladhara$k$]::text[],
    $k$Localização: Base da coluna vertebral.

Função: Responsável pela conexão com a terra, segurança, vitalidade e sobrevivência. É a base dos demais chakras e fundamental para o equilíbrio energético.

Cor: Vermelho.

Elemento: Terra.

Órgãos correspondentes: Coluna, ossos, pernas, pés, reto, intestino grosso e órgãos reprodutores.

Desequilíbrios: Insegurança, ansiedade, excesso de materialismo, medo, rigidez física e emocional. Pode resultar em problemas como prisão de ventre, artrite, problemas nos pés e nas pernas.

Como equilibrar: Meditação focada na cor vermelha, contato com a natureza (como andar descalço na terra), uso de aromas como cedro e cravo, e atividades físicas.$k$,
    $k$Responsável pela conexão com a terra, segurança, vitalidade e sobrevivência. É a base dos demais chakras e fundamental para o equilíbrio energético.

Quando desequilibrado: Insegurança, ansiedade, excesso de materialismo, medo, rigidez física e emocional. Pode resultar em problemas como prisão de ventre, artrite, problemas nos pés e nas pernas.

Sugestão de equilíbrio: Meditação focada na cor vermelha, contato com a natureza (como andar descalço na terra), uso de aromas como cedro e cravo, e atividades físicas.$k$,
    $k$Cor: Vermelho. · Elemento: Terra. Insegurança, ansiedade, excesso de materialismo, medo, rigidez física e emocional. Pode resultar em problemas como prisão de ventre, artrite, problemas nos pés e nas pernas.$k$,
    $k$Meditação focada na cor vermelha, contato com a natureza (como andar descalço na terra), uso de aromas como cedro e cravo, e atividades físicas.$k$,
    $k$Eu ativo agora o Chakra Básico de (nome do consulente), liberando medos, inseguranças e bloqueios ligados à sobrevivência. Que (nome do consulente) se sinta ancorado, seguro e firme na vida, com confiança em si e no fluxo da Terra. Assim é, está feito.$k$,
    $k${"import_source":"v2.6d","location":"Base da coluna vertebral.","function":"Responsável pela conexão com a terra, segurança, vitalidade e sobrevivência. É a base dos demais chakras e fundamental para o equilíbrio energético.","color":"Vermelho.","element":"Terra.","corresponding_organs":"Coluna, ossos, pernas, pés, reto, intestino grosso e órgãos reprodutores.","imbalances":"Insegurança, ansiedade, excesso de materialismo, medo, rigidez física e emocional. Pode resultar em problemas como prisão de ventre, artrite, problemas nos pés e nas pernas.","how_to_balance":"Meditação focada na cor vermelha, contato com a natureza (como andar descalço na terra), uso de aromas como cedro e cravo, e atividades físicas."}$k$
  ),
  (
    2,
    'chakra-sexual',
    $k$Chakra Sexual$k$,
    $k$Swadhisthana$k$,
    ARRAY[$k$Chakra Sacral$k$, $k$Chakra Esplênico$k$, $k$Chakra Umbilical$k$, $k$Swadhisthana$k$]::text[],
    $k$Localização: Abaixo do umbigo.

Função: Ligado à sexualidade, criatividade, prazer e emoções. Responsável pela vitalidade física e emocional.

Cor: Laranja.

Elemento: Água.

Órgãos correspondentes: Órgãos reprodutores, rins, bexiga e sistema circulatório.

Desequilíbrios: Problemas emocionais como ciúme, medo, repressão sexual, falta de criatividade e desconexão com o prazer. Fisicamente, pode causar infecções urinárias e problemas nos órgãos sexuais.

Como equilibrar: Visualização da cor laranja, contato com água, dança, chás como manjericão e gengibre, e uso de aromas como sândalo.$k$,
    $k$Ligado à sexualidade, criatividade, prazer e emoções. Responsável pela vitalidade física e emocional.

Quando desequilibrado: Problemas emocionais como ciúme, medo, repressão sexual, falta de criatividade e desconexão com o prazer. Fisicamente, pode causar infecções urinárias e problemas nos órgãos sexuais.

Sugestão de equilíbrio: Visualização da cor laranja, contato com água, dança, chás como manjericão e gengibre, e uso de aromas como sândalo.$k$,
    $k$Cor: Laranja. · Elemento: Água. Problemas emocionais como ciúme, medo, repressão sexual, falta de criatividade e desconexão com o prazer. Fisicamente, pode causar infecções urinárias e problemas nos órgãos sexuais.$k$,
    $k$Visualização da cor laranja, contato com água, dança, chás como manjericão e gengibre, e uso de aromas como sândalo.$k$,
    $k$Eu ativo agora o Chakra Sexual de (nome do consulente), liberando repressões, culpas e bloqueios emocionais. Que a energia criativa e afetiva flua livremente, trazendo prazer, pulsão de vida, vitalidade e conexão autêntica. Assim é, está feito.$k$,
    $k${"import_source":"v2.6d","location":"Abaixo do umbigo.","function":"Ligado à sexualidade, criatividade, prazer e emoções. Responsável pela vitalidade física e emocional.","color":"Laranja.","element":"Água.","corresponding_organs":"Órgãos reprodutores, rins, bexiga e sistema circulatório.","imbalances":"Problemas emocionais como ciúme, medo, repressão sexual, falta de criatividade e desconexão com o prazer. Fisicamente, pode causar infecções urinárias e problemas nos órgãos sexuais.","how_to_balance":"Visualização da cor laranja, contato com água, dança, chás como manjericão e gengibre, e uso de aromas como sândalo."}$k$
  ),
  (
    3,
    'chakra-plexo-solar',
    $k$Chakra Plexo Solar$k$,
    $k$Manipura$k$,
    ARRAY[$k$Manipura$k$]::text[],
    $k$Localização: Região do abdômen, acima do umbigo.

Função: Centro do poder pessoal, autoconfiança e autoestima. Está associado à energia vital e ao metabolismo.

Cor: Amarelo.

Elemento: Fogo.

Órgãos correspondentes: Estômago, fígado, pâncreas, vesícula biliar e sistema digestivo.

Desequilíbrios: Medo, raiva, baixa autoestima, problemas digestivos e dificuldade em tomar decisões.

Como equilibrar: Exposição ao sol da manhã, meditação focada na cor amarela, prática de atividades que aumentem a autoestima e uso de aromas como patchouli e alecrim.$k$,
    $k$Centro do poder pessoal, autoconfiança e autoestima. Está associado à energia vital e ao metabolismo.

Quando desequilibrado: Medo, raiva, baixa autoestima, problemas digestivos e dificuldade em tomar decisões.

Sugestão de equilíbrio: Exposição ao sol da manhã, meditação focada na cor amarela, prática de atividades que aumentem a autoestima e uso de aromas como patchouli e alecrim.$k$,
    $k$Cor: Amarelo. · Elemento: Fogo. Medo, raiva, baixa autoestima, problemas digestivos e dificuldade em tomar decisões.$k$,
    $k$Exposição ao sol da manhã, meditação focada na cor amarela, prática de atividades que aumentem a autoestima e uso de aromas como patchouli e alecrim.$k$,
    $k$Eu ativo agora o Chakra do Plexo Solar de (nome do consulente), eliminando medos, inseguranças e sentimentos de impotência. Que (nome do consulente) se reconecte com sua força 
interior, brilhe com coragem e manifeste sua vontade no mundo. Assim é, está feito.$k$,
    $k${"import_source":"v2.6d","location":"Região do abdômen, acima do umbigo.","function":"Centro do poder pessoal, autoconfiança e autoestima. Está associado à energia vital e ao metabolismo.","color":"Amarelo.","element":"Fogo.","corresponding_organs":"Estômago, fígado, pâncreas, vesícula biliar e sistema digestivo.","imbalances":"Medo, raiva, baixa autoestima, problemas digestivos e dificuldade em tomar decisões.","how_to_balance":"Exposição ao sol da manhã, meditação focada na cor amarela, prática de atividades que aumentem a autoestima e uso de aromas como patchouli e alecrim."}$k$
  ),
  (
    4,
    'chakra-cardiaco',
    $k$Chakra Cardíaco$k$,
    $k$Anahata$k$,
    ARRAY[$k$Anahata$k$]::text[],
    $k$Localização: Centro do peito, na altura do coração.

Função: É o centro do amor incondicional, compaixão e harmonia. Une os três chakras inferiores aos superiores.

Cor: Verde (às vezes rosa).

Elemento: Ar.

Órgãos correspondentes: Coração, pulmões, sistema circulatório e sistema imunológico.

Desequilíbrios: Falta de empatia, dificuldade em perdoar, sentimentos de mágoa, tristeza, problemas circulatórios e respiratórios.

Como equilibrar: Contato com a natureza, meditação com foco na cor verde ou rosa, uso de aromas como rosa e jasmim, práticas como arranjos florais e exercícios de respiração.$k$,
    $k$É o centro do amor incondicional, compaixão e harmonia. Une os três chakras inferiores aos superiores.

Quando desequilibrado: Falta de empatia, dificuldade em perdoar, sentimentos de mágoa, tristeza, problemas circulatórios e respiratórios.

Sugestão de equilíbrio: Contato com a natureza, meditação com foco na cor verde ou rosa, uso de aromas como rosa e jasmim, práticas como arranjos florais e exercícios de respiração.$k$,
    $k$Cor: Verde (às vezes rosa). · Elemento: Ar. Falta de empatia, dificuldade em perdoar, sentimentos de mágoa, tristeza, problemas circulatórios e respiratórios.$k$,
    $k$Contato com a natureza, meditação com foco na cor verde ou rosa, uso de aromas como rosa e jasmim, práticas como arranjos florais e exercícios de respiração.$k$,
    $k$Eu ativo agora o Chakra Cardíaco de (nome do consulente), liberando mágoas, ressentimentos e bloqueios no dar e receber amor. Que (nome do consulente) vibre na frequência do 
amor incondicional, da empatia e da harmonia. Assim é, está feito.$k$,
    $k${"import_source":"v2.6d","location":"Centro do peito, na altura do coração.","function":"É o centro do amor incondicional, compaixão e harmonia. Une os três chakras inferiores aos superiores.","color":"Verde (às vezes rosa).","element":"Ar.","corresponding_organs":"Coração, pulmões, sistema circulatório e sistema imunológico.","imbalances":"Falta de empatia, dificuldade em perdoar, sentimentos de mágoa, tristeza, problemas circulatórios e respiratórios.","how_to_balance":"Contato com a natureza, meditação com foco na cor verde ou rosa, uso de aromas como rosa e jasmim, práticas como arranjos florais e exercícios de respiração."}$k$
  ),
  (
    5,
    'chakra-laringeo',
    $k$Chakra Laríngeo$k$,
    $k$Vishuddha$k$,
    ARRAY[$k$Vishuddha$k$]::text[],
    $k$Localização: Região da garganta.

Função: Comunicação, expressão criativa e capacidade de ouvir e ser ouvido.

Cor: Azul claro.

Elemento: Éter.

Órgãos correspondentes: Garganta, tireoide, brônquios, boca, ouvidos e sistema respiratório superior.

Desequilíbrios: Dificuldade em se expressar, medo de falar em público, gagueira, problemas na garganta e ombros tensos.

Como equilibrar: Meditação focada no azul claro, cantar, usar aromas como eucalipto e cânfora, e consumir chás de ervas como anis estrelado.$k$,
    $k$Comunicação, expressão criativa e capacidade de ouvir e ser ouvido.

Quando desequilibrado: Dificuldade em se expressar, medo de falar em público, gagueira, problemas na garganta e ombros tensos.

Sugestão de equilíbrio: Meditação focada no azul claro, cantar, usar aromas como eucalipto e cânfora, e consumir chás de ervas como anis estrelado.$k$,
    $k$Cor: Azul claro. · Elemento: Éter. Dificuldade em se expressar, medo de falar em público, gagueira, problemas na garganta e ombros tensos.$k$,
    $k$Meditação focada no azul claro, cantar, usar aromas como eucalipto e cânfora, e consumir chás de ervas como anis estrelado.$k$,
    $k$Eu ativo agora o Chakra Laríngeo de (nome do consulente), dissolvendo bloqueios, silenciamentos e medos de se expressar. Que (nome do consulente) fale com clareza, verdade e 
sabedoria, e seja ouvido com respeito. Assim é, está feito.$k$,
    $k${"import_source":"v2.6d","location":"Região da garganta.","function":"Comunicação, expressão criativa e capacidade de ouvir e ser ouvido.","color":"Azul claro.","element":"Éter.","corresponding_organs":"Garganta, tireoide, brônquios, boca, ouvidos e sistema respiratório superior.","imbalances":"Dificuldade em se expressar, medo de falar em público, gagueira, problemas na garganta e ombros tensos.","how_to_balance":"Meditação focada no azul claro, cantar, usar aromas como eucalipto e cânfora, e consumir chás de ervas como anis estrelado."}$k$
  ),
  (
    6,
    'chakra-frontal',
    $k$Chakra Frontal$k$,
    $k$Ajna$k$,
    ARRAY[$k$Terceiro Olho$k$, $k$Ajna$k$]::text[],
    $k$Localização: Entre as sobrancelhas.

Função: Centro da intuição, visão interior e sabedoria. Ligado à clarividência e percepção espiritual.

Cor: Azul índigo.

Elemento: Luz (mental).

Órgãos correspondentes: Olhos, glândula pineal e sistema nervoso central.

Desequilíbrios: Dificuldade de concentração, pesadelos, confusão mental, dores de cabeça e isolamento.

Como equilibrar: Meditação focada no azul índigo, práticas de visualização, contemplação do céu noturno e uso de aromas como lavanda e hortelã.$k$,
    $k$Centro da intuição, visão interior e sabedoria. Ligado à clarividência e percepção espiritual.

Quando desequilibrado: Dificuldade de concentração, pesadelos, confusão mental, dores de cabeça e isolamento.

Sugestão de equilíbrio: Meditação focada no azul índigo, práticas de visualização, contemplação do céu noturno e uso de aromas como lavanda e hortelã.$k$,
    $k$Cor: Azul índigo. · Elemento: Luz (mental). Dificuldade de concentração, pesadelos, confusão mental, dores de cabeça e isolamento.$k$,
    $k$Meditação focada no azul índigo, práticas de visualização, contemplação do céu noturno e uso de aromas como lavanda e hortelã.$k$,
    $k$Eu ativo agora o Chakra Frontal de (nome do consulente), limpando ilusões, confusões mentais e bloqueios de percepção. Que (nome do consulente) confie na sua intuição, enxergue com clareza e tome decisões guiadas pela consciência. Assim é, está feito.$k$,
    $k${"import_source":"v2.6d","location":"Entre as sobrancelhas.","function":"Centro da intuição, visão interior e sabedoria. Ligado à clarividência e percepção espiritual.","color":"Azul índigo.","element":"Luz (mental).","corresponding_organs":"Olhos, glândula pineal e sistema nervoso central.","imbalances":"Dificuldade de concentração, pesadelos, confusão mental, dores de cabeça e isolamento.","how_to_balance":"Meditação focada no azul índigo, práticas de visualização, contemplação do céu noturno e uso de aromas como lavanda e hortelã."}$k$
  ),
  (
    7,
    'chakra-coronario',
    $k$Chakra Coronário$k$,
    $k$Sahasrara$k$,
    ARRAY[$k$Sahasrara$k$]::text[],
    $k$Localização: Topo da cabeça.

Função: Conexão com o divino e o universo. É o centro da espiritualidade e da transcendência.

Cor: Violeta (ou branco cristalino).

Elemento: Espírito.

Órgãos correspondentes: Cérebro e sistema nervoso.

Desequilíbrios: Sentimentos de desconexão espiritual, alienação, depressão, falta de inspiração e bloqueios nos outros chakras.

Como equilibrar: Meditação focada no violeta ou branco, oração, observação do horizonte, uso de aromas como lótus e práticas de silêncio interior.$k$,
    $k$Conexão com o divino e o universo. É o centro da espiritualidade e da transcendência.

Quando desequilibrado: Sentimentos de desconexão espiritual, alienação, depressão, falta de inspiração e bloqueios nos outros chakras.

Sugestão de equilíbrio: Meditação focada no violeta ou branco, oração, observação do horizonte, uso de aromas como lótus e práticas de silêncio interior.$k$,
    $k$Cor: Violeta (ou branco cristalino). · Elemento: Espírito. Sentimentos de desconexão espiritual, alienação, depressão, falta de inspiração e bloqueios nos outros chakras.$k$,
    $k$Meditação focada no violeta ou branco, oração, observação do horizonte, uso de aromas como lótus e práticas de silêncio interior.$k$,
    $k$Eu ativo agora o Chakra Coronário de (nome do consulente), removendo dúvidas, medo de conexão espiritual e sensação de separação. Que (nome do consulente) esteja em plena comunhão com a Fonte, recebendo sabedoria, luz e paz. Assim é, está feito.$k$,
    $k${"import_source":"v2.6d","location":"Topo da cabeça.","function":"Conexão com o divino e o universo. É o centro da espiritualidade e da transcendência.","color":"Violeta (ou branco cristalino).","element":"Espírito.","corresponding_organs":"Cérebro e sistema nervoso.","imbalances":"Sentimentos de desconexão espiritual, alienação, depressão, falta de inspiração e bloqueios nos outros chakras.","how_to_balance":"Meditação focada no violeta ou branco, oração, observação do horizonte, uso de aromas como lótus e práticas de silêncio interior."}$k$
  );

  select count(*) into v_matched_assets
  from _v26d_chakra_knowledge k
  inner join public.methodology_assets ma
    on ma.slug = k.asset_slug
    and ma.tool_id = v_tool_chakra_id
    and ma.asset_type = 'chakra'
    and ma.status = 'active';

  select array_agg(k.asset_slug order by k.sort_order)
  into v_missing_slugs
  from _v26d_chakra_knowledge k
  where not exists (
    select 1
    from public.methodology_assets ma
    where ma.slug = k.asset_slug
      and ma.tool_id = v_tool_chakra_id
      and ma.asset_type = 'chakra'
      and ma.status = 'active'
  );

  if v_missing_slugs is not null and array_length(v_missing_slugs, 1) > 0 then
    raise warning 'V2.6D: unmatched chakra asset slugs: %', array_to_string(v_missing_slugs, ', ');
  end if;

  -- -------------------------------------------------------------------------
  -- PHASE 1 — methodology_assets naming
  -- -------------------------------------------------------------------------
  update public.methodology_assets ma
  set
    canonical_name = k.asset_name,
    original_name = k.original_name,
    aliases = k.aliases,
    metadata = coalesce(ma.metadata, '{}'::jsonb) || k.structured_metadata,
    updated_at = now()
  from _v26d_chakra_knowledge k
  where ma.slug = k.asset_slug
    and ma.tool_id = v_tool_chakra_id
    and ma.asset_type = 'chakra';

  get diagnostics v_naming_updated = row_count;

  -- -------------------------------------------------------------------------
  -- PHASE 2 — specialty_asset_content (mesa-35)
  -- -------------------------------------------------------------------------
  insert into public.specialty_asset_content (
    specialty_id,
    asset_id,
    title,
    therapist_explanation,
    client_explanation,
    activation_text,
    interpretation,
    recommended_use,
    notes,
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
    k.interpretation,
    k.recommended_use,
    null,
    'Vanessa',
    'course_material',
    'docs/knowledge/vanessa/Chakra.txt',
    'v1',
    false,
    true,
    k.sort_order,
    k.structured_metadata
  from _v26d_chakra_knowledge k
  inner join public.methodology_assets ma
    on ma.slug = k.asset_slug
    and ma.tool_id = v_tool_chakra_id
    and ma.asset_type = 'chakra'
    and ma.status = 'active'
  on conflict (specialty_id, asset_id) do update set
    title = excluded.title,
    therapist_explanation = excluded.therapist_explanation,
    client_explanation = excluded.client_explanation,
    activation_text = excluded.activation_text,
    interpretation = excluded.interpretation,
    recommended_use = excluded.recommended_use,
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
  -- PHASE 3 — activation_scripts
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
    'docs/knowledge/vanessa/Chakra.txt',
    'v1',
    false,
    true,
    jsonb_build_object('import_source', 'v2.6d', 'asset_slug', k.asset_slug)
  from _v26d_chakra_knowledge k
  inner join public.methodology_assets ma
    on ma.slug = k.asset_slug
    and ma.tool_id = v_tool_chakra_id
    and ma.asset_type = 'chakra'
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
  -- PHASE 4 — activation_script_links (specialty_asset_content)
  -- -------------------------------------------------------------------------
  delete from public.activation_script_links asl
  using public.activation_scripts s
  where asl.activation_script_id = s.id
    and s.source_reference = 'docs/knowledge/vanessa/Chakra.txt'
    and s.script_type = 'activation';

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
  from _v26d_chakra_knowledge k
  inner join public.methodology_assets ma
    on ma.slug = k.asset_slug
    and ma.tool_id = v_tool_chakra_id
    and ma.asset_type = 'chakra'
    and ma.status = 'active'
  inner join public.specialty_asset_content sac
    on sac.specialty_id = v_specialty_id
    and sac.asset_id = ma.id
  inner join public.activation_scripts s
    on s.slug = 'ativacao-' || k.asset_slug
    and s.source_reference = 'docs/knowledge/vanessa/Chakra.txt';

  get diagnostics v_links_created = row_count;

  raise notice 'V2.6D chakra knowledge import complete.';
  raise notice '  source entries: %', v_source_entries;
  raise notice '  matched assets: %', v_matched_assets;
  raise notice '  naming rows updated: %', v_naming_updated;
  raise notice '  specialty_asset_content touched: %', v_content_updated;
  raise notice '  activation_scripts touched: %', v_scripts_upserted;
  raise notice '  activation_script_links: %', v_links_created;

  if v_matched_assets <> v_source_entries then
    raise warning
      'Expected % matched chakras; found %. Missing: %',
      v_source_entries,
      v_matched_assets,
      coalesce(array_to_string(v_missing_slugs, ', '), '(none)');
  end if;

end $$;
