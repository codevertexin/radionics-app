-- =============================================================================
-- RADIONICS — Phase V2.2: Seed Mesa 35 methodology assets (additive)
-- Requires: Phase 1 radionics_specialties (mesa-35) + Phase V2.1 methodology_tools
-- =============================================================================

do $$
declare
  v_specialty_id uuid;
  v_tool_graph_id uuid;
  v_tool_hawkins_id uuid;
  v_tool_chakra_id uuid;
begin
  -- -------------------------------------------------------------------------
  -- Part 1 — Resolve IDs by slug (fail loud if specialty missing)
  -- -------------------------------------------------------------------------
  select id into v_specialty_id
  from public.radionics_specialties
  where slug = 'mesa-35';

  if v_specialty_id is null then
    raise exception
      'radionics_specialties with slug ''mesa-35'' is required. '
      'Apply Phase 1 migration seed (20260531120000_radionics_specialties_phase1.sql) first.';
  end if;

  select id into v_tool_graph_id
  from public.methodology_tools
  where slug = 'graph-set-35';

  if v_tool_graph_id is null then
    raise exception
      'methodology_tools with slug ''graph-set-35'' is required. Apply V2.1 migration first.';
  end if;

  select id into v_tool_hawkins_id
  from public.methodology_tools
  where slug = 'hawkins-scale';

  if v_tool_hawkins_id is null then
    raise exception
      'methodology_tools with slug ''hawkins-scale'' is required. Apply V2.1 migration first.';
  end if;

  select id into v_tool_chakra_id
  from public.methodology_tools
  where slug = 'chakra-set';

  if v_tool_chakra_id is null then
    raise exception
      'methodology_tools with slug ''chakra-set'' is required. Apply V2.1 migration first.';
  end if;

  -- -------------------------------------------------------------------------
  -- Part 2 — 8 graph assets (UI/mock parity; not full 35 yet)
  -- -------------------------------------------------------------------------
  insert into public.methodology_assets (
    tool_id, name, slug, code, asset_type, usage_mode, base_description, status, sort_order
  ) values
    (
      v_tool_graph_id, 'Anti Magia', 'anti-magia', 'g01', 'graph', 'activation',
      'Gráfico radiônico utilizado para neutralização de influências energéticas externas, magia, inveja, ataques espirituais e padrões vibracionais dissonantes.',
      'active', 1
    ),
    (
      v_tool_graph_id, 'Luxor', 'luxor', 'g02', 'graph', 'activation',
      'Gráfico radiônico associado à elevação vibracional, alinhamento espiritual, clareza, proteção e ligação a frequências superiores.',
      'active', 2
    ),
    (
      v_tool_graph_id, 'Anti Possessão', 'anti-possessao', 'g03', 'graph', 'activation',
      'Gráfico radiônico utilizado em trabalhos de desobsessão, libertação de interferências espirituais e limpeza energética profunda.',
      'active', 3
    ),
    (
      v_tool_graph_id, 'Desobsessão', 'desobsessao', 'g04', 'graph', 'activation',
      'Gráfico radiônico orientado para limpeza, libertação espiritual e harmonização de campos afetados por obsessões ou interferências externas.',
      'active', 4
    ),
    (
      v_tool_graph_id, 'Prosperidade', 'prosperidade', 'g05', 'graph', 'activation',
      'Gráfico radiônico associado à abertura de caminhos, desbloqueio financeiro, abundância e expansão de possibilidades materiais.',
      'active', 5
    ),
    (
      v_tool_graph_id, 'Amor', 'amor', 'g06', 'graph', 'activation',
      'Gráfico radiônico usado para harmonização afetiva, cura emocional, reconciliação interna e equilíbrio nos relacionamentos.',
      'active', 6
    ),
    (
      v_tool_graph_id, 'Saúde', 'saude', 'g07', 'graph', 'activation',
      'Gráfico radiônico associado ao apoio vibracional à saúde, equilíbrio energético e harmonização dos corpos físico, emocional e espiritual.',
      'active', 7
    ),
    (
      v_tool_graph_id, 'Karma', 'karma', 'g08', 'graph', 'activation',
      'Gráfico radiônico utilizado para harmonização de padrões kármicos, libertação de repetições, vínculos e memórias energéticas.',
      'active', 8
    )
  on conflict (tool_id, slug) do update set
    name = excluded.name,
    code = excluded.code,
    asset_type = excluded.asset_type,
    usage_mode = excluded.usage_mode,
    base_description = excluded.base_description,
    status = excluded.status,
    sort_order = excluded.sort_order,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- Part 3 — Hawkins level assets (17 levels)
  -- -------------------------------------------------------------------------
  insert into public.methodology_assets (
    tool_id, name, slug, code, asset_type, usage_mode, base_description, status, sort_order
  ) values
    (v_tool_hawkins_id, '20 Vergonha', 'hawkins-20-vergonha', '20', 'hawkins_level', 'measurement', 'Nível associado a vergonha, contração, baixa autoestima e sensação de indignidade.', 'active', 20),
    (v_tool_hawkins_id, '30 Culpa', 'hawkins-30-culpa', '30', 'hawkins_level', 'measurement', 'Nível associado a culpa, autocondenação e peso emocional.', 'active', 30),
    (v_tool_hawkins_id, '50 Apatia', 'hawkins-50-apatia', '50', 'hawkins_level', 'measurement', 'Nível associado a apatia, desistência, impotência e perda de vitalidade.', 'active', 50),
    (v_tool_hawkins_id, '75 Luto', 'hawkins-75-luto', '75', 'hawkins_level', 'measurement', 'Nível associado a tristeza, perda, dor emocional e apego ao passado.', 'active', 75),
    (v_tool_hawkins_id, '100 Medo', 'hawkins-100-medo', '100', 'hawkins_level', 'measurement', 'Nível associado a medo, insegurança, ansiedade e perceção de ameaça.', 'active', 100),
    (v_tool_hawkins_id, '125 Desejo', 'hawkins-125-desejo', '125', 'hawkins_level', 'measurement', 'Nível associado a desejo, apego, carência e busca externa de satisfação.', 'active', 125),
    (v_tool_hawkins_id, '150 Raiva', 'hawkins-150-raiva', '150', 'hawkins_level', 'measurement', 'Nível associado a raiva, frustração, resistência e conflito.', 'active', 150),
    (v_tool_hawkins_id, '175 Orgulho', 'hawkins-175-orgulho', '175', 'hawkins_level', 'measurement', 'Nível associado a orgulho, rigidez, necessidade de validação e defesa do ego.', 'active', 175),
    (v_tool_hawkins_id, '200 Coragem', 'hawkins-200-coragem', '200', 'hawkins_level', 'measurement', 'Nível associado a coragem, responsabilidade, ação e início de transformação positiva.', 'active', 200),
    (v_tool_hawkins_id, '250 Neutralidade', 'hawkins-250-neutralidade', '250', 'hawkins_level', 'measurement', 'Nível associado a neutralidade, flexibilidade, aceitação inicial e menor resistência.', 'active', 250),
    (v_tool_hawkins_id, '310 Vontade', 'hawkins-310-vontade', '310', 'hawkins_level', 'measurement', 'Nível associado a vontade, abertura, colaboração e disposição para evoluir.', 'active', 310),
    (v_tool_hawkins_id, '350 Aceitação', 'hawkins-350-aceitacao', '350', 'hawkins_level', 'measurement', 'Nível associado a aceitação, integração, responsabilidade interna e maturidade emocional.', 'active', 350),
    (v_tool_hawkins_id, '400 Razão', 'hawkins-400-razao', '400', 'hawkins_level', 'measurement', 'Nível associado a clareza mental, discernimento, compreensão e inteligência racional.', 'active', 400),
    (v_tool_hawkins_id, '500 Amor', 'hawkins-500-amor', '500', 'hawkins_level', 'measurement', 'Nível associado a amor, compaixão, coerência, abertura do coração e harmonização profunda.', 'active', 500),
    (v_tool_hawkins_id, '540 Alegria', 'hawkins-540-alegria', '540', 'hawkins_level', 'measurement', 'Nível associado a alegria, gratidão, leveza, bênção e expansão espiritual.', 'active', 540),
    (v_tool_hawkins_id, '600 Paz', 'hawkins-600-paz', '600', 'hawkins_level', 'measurement', 'Nível associado a paz, silêncio interior, transcendência e serenidade profunda.', 'active', 600),
    (v_tool_hawkins_id, '700 Iluminação', 'hawkins-700-iluminacao', '700', 'hawkins_level', 'measurement', 'Nível associado a iluminação, unidade, consciência elevada e ligação espiritual expandida.', 'active', 700)
  on conflict (tool_id, slug) do update set
    name = excluded.name,
    code = excluded.code,
    asset_type = excluded.asset_type,
    usage_mode = excluded.usage_mode,
    base_description = excluded.base_description,
    status = excluded.status,
    sort_order = excluded.sort_order,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- Part 4 — Link tools to Mesa dos 35 Gráficos
  -- -------------------------------------------------------------------------
  insert into public.specialty_tools (
    specialty_id, tool_id, is_required, is_visible_in_workspace, sort_order
  ) values
    (v_specialty_id, v_tool_graph_id, true, true, 1),
    (v_specialty_id, v_tool_hawkins_id, true, true, 2),
    (v_specialty_id, v_tool_chakra_id, false, true, 3)
  on conflict (specialty_id, tool_id) do update set
    is_required = excluded.is_required,
    is_visible_in_workspace = excluded.is_visible_in_workspace,
    sort_order = excluded.sort_order,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- Part 5 — specialty_asset_content for 8 graphs only
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
    sort_order
  )
  select
    v_specialty_id,
    ma.id,
    ma.name,
    ma.base_description,
    v.client_explanation,
    null,
    null,
    v.recommended_use,
    null,
    ma.sort_order
  from public.methodology_assets ma
  join (
    values
      ('anti-magia', 'Apoio à proteção energética e neutralização de influências externas desfavoráveis.', 'Diagnóstico e harmonização quando há sensação de ataque, inveja ou bloqueio inexplicável.'),
      ('luxor', 'Elevação do campo vibracional e maior clareza interior.', 'Reforço energético em fases de baixa vitalidade ou desalinhamento.'),
      ('anti-possessao', 'Limpeza profunda e libertação de interferências no campo energético.', 'Trabalho de desobsessão e restabelecimento da autonomia energética.'),
      ('desobsessao', 'Harmonização de padrões repetitivos e libertação espiritual.', 'Quando há pensamentos ou comportamentos repetitivos difíceis de integrar.'),
      ('prosperidade', 'Abertura de caminhos e equilíbrio na área material e profissional.', 'Sessões focadas em abundância, oportunidades e desbloqueio financeiro.'),
      ('amor', 'Harmonização afetiva e cura das relações com compaixão.', 'Trabalho emocional em relacionamentos, autoestima e abertura do coração.'),
      ('saude', 'Apoio vibracional ao bem-estar físico e à vitalidade.', 'Reequilíbrio energético associado a saúde, recuperação e cuidado do corpo.'),
      ('karma', 'Integração e suavização de padrões que se repetem na vida.', 'Quando há ciclos familiares ou situações que parecem repetir-se sem causa aparente.')
  ) as v(asset_slug, client_explanation, recommended_use)
    on v.asset_slug = ma.slug
  where ma.tool_id = v_tool_graph_id
  on conflict (specialty_id, asset_id) do update set
    title = excluded.title,
    therapist_explanation = excluded.therapist_explanation,
    client_explanation = excluded.client_explanation,
    activation_text = excluded.activation_text,
    interpretation = excluded.interpretation,
    recommended_use = excluded.recommended_use,
    notes = excluded.notes,
    sort_order = excluded.sort_order,
    updated_at = now();

end $$;
