-- =============================================================================
-- RADIONICS — Phase V2.5C: Seed 7 main chakras (chakra-set + Bunny media)
-- Requires: V2.1 methodology_tools (chakra-set), V2.4 methodology_asset_media
-- Does not alter frontend, workspace, sessions, reports, or V2.5A/V2.5B imports.
-- Global media scope: specialty_id NULL, tool_id = chakra-set (teacher overrides later).
-- =============================================================================

do $$
declare
  v_tool_chakra_id uuid;
  v_asset_count integer;
  v_media_count integer;
begin
  select id into v_tool_chakra_id
  from public.methodology_tools
  where slug = 'chakra-set';

  if v_tool_chakra_id is null then
    raise exception
      'methodology_tools with slug ''chakra-set'' is required. Apply V2.1 migration first.';
  end if;

  -- -------------------------------------------------------------------------
  -- 1. methodology_assets — 7 main chakras
  -- -------------------------------------------------------------------------
  insert into public.methodology_assets (
    tool_id,
    name,
    slug,
    code,
    asset_type,
    usage_mode,
    base_description,
    image_url,
    status,
    sort_order,
    metadata
  ) values
    (
      v_tool_chakra_id,
      'Chakra Básico',
      'chakra-basico',
      'basico',
      'chakra',
      'analysis',
      'Centro energético associado à base, enraizamento, segurança, vitalidade física e ligação à matéria.',
      'https://radionics.b-cdn.net/tools/map_outros/chakras/Basico.png',
      'active',
      1,
      '{"import_source":"v2.5c"}'::jsonb
    ),
    (
      v_tool_chakra_id,
      'Chakra Sexual',
      'chakra-sexual',
      'sexual',
      'chakra',
      'analysis',
      'Centro energético associado à criatividade, sexualidade, prazer, emoções e fluxo da energia vital.',
      'https://radionics.b-cdn.net/tools/map_outros/chakras/Sexual.png',
      'active',
      2,
      '{"import_source":"v2.5c"}'::jsonb
    ),
    (
      v_tool_chakra_id,
      'Chakra Plexo Solar',
      'chakra-plexo-solar',
      'plexo',
      'chakra',
      'analysis',
      'Centro energético associado ao poder pessoal, autoestima, vontade, identidade e ação.',
      'https://radionics.b-cdn.net/tools/map_outros/chakras/Plexo.png',
      'active',
      3,
      '{"import_source":"v2.5c"}'::jsonb
    ),
    (
      v_tool_chakra_id,
      'Chakra Cardíaco',
      'chakra-cardiaco',
      'cardiaco',
      'chakra',
      'analysis',
      'Centro energético associado ao amor, compaixão, perdão, equilíbrio emocional e relações afetivas.',
      'https://radionics.b-cdn.net/tools/map_outros/chakras/Cardiaco.png',
      'active',
      4,
      '{"import_source":"v2.5c"}'::jsonb
    ),
    (
      v_tool_chakra_id,
      'Chakra Laríngeo',
      'chakra-laringeo',
      'laringeo',
      'chakra',
      'analysis',
      'Centro energético associado à comunicação, expressão, verdade interior e criatividade verbal.',
      'https://radionics.b-cdn.net/tools/map_outros/chakras/Laringeo.png',
      'active',
      5,
      '{"import_source":"v2.5c"}'::jsonb
    ),
    (
      v_tool_chakra_id,
      'Chakra Frontal',
      'chakra-frontal',
      'frontal',
      'chakra',
      'analysis',
      'Centro energético associado à intuição, visão interior, clareza mental, perceção e discernimento.',
      'https://radionics.b-cdn.net/tools/map_outros/chakras/Frontal.png',
      'active',
      6,
      '{"import_source":"v2.5c"}'::jsonb
    ),
    (
      v_tool_chakra_id,
      'Chakra Coronário',
      'chakra-coronario',
      'coronario',
      'chakra',
      'analysis',
      'Centro energético associado à espiritualidade, conexão superior, consciência expandida e ligação ao divino.',
      'https://radionics.b-cdn.net/tools/map_outros/chakras/Coronario.png',
      'active',
      7,
      '{"import_source":"v2.5c"}'::jsonb
    )
  on conflict (tool_id, slug) do update set
    name = excluded.name,
    code = excluded.code,
    asset_type = excluded.asset_type,
    usage_mode = excluded.usage_mode,
    base_description = excluded.base_description,
    image_url = excluded.image_url,
    status = excluded.status,
    sort_order = excluded.sort_order,
    metadata = coalesce(public.methodology_assets.metadata, '{}'::jsonb) || excluded.metadata,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- 2. methodology_asset_media — global primary (specialty_id NULL, tool scoped)
  -- -------------------------------------------------------------------------
  update public.methodology_asset_media mam
  set
    url = src.image_url,
    storage_provider = 'bunny',
    source_type = 'app_default',
    source_name = 'RADIONICS',
    alt_text = src.asset_name,
    quality_status = 'approved',
    is_primary = true,
    metadata = coalesce(mam.metadata, '{}'::jsonb) || jsonb_build_object('import_source', 'v2.5c'),
    updated_at = now()
  from (
    select
      ma.id as asset_id,
      ma.name as asset_name,
      ma.image_url
    from public.methodology_assets ma
    where ma.tool_id = v_tool_chakra_id
      and ma.asset_type = 'chakra'
      and ma.status = 'active'
      and nullif(trim(ma.image_url), '') is not null
  ) src
  where mam.asset_id = src.asset_id
    and mam.specialty_id is null
    and mam.tool_id = v_tool_chakra_id
    and mam.media_type = 'image'
    and mam.is_primary = true;

  insert into public.methodology_asset_media (
    asset_id,
    specialty_id,
    tool_id,
    media_type,
    url,
    storage_provider,
    source_type,
    source_name,
    alt_text,
    quality_status,
    is_primary,
    metadata
  )
  select
    ma.id,
    null,
    v_tool_chakra_id,
    'image',
    ma.image_url,
    'bunny',
    'app_default',
    'RADIONICS',
    ma.name,
    'approved',
    true,
    jsonb_build_object('import_source', 'v2.5c')
  from public.methodology_assets ma
  where ma.tool_id = v_tool_chakra_id
    and ma.asset_type = 'chakra'
    and ma.status = 'active'
    and nullif(trim(ma.image_url), '') is not null
    and not exists (
      select 1
      from public.methodology_asset_media mam
      where mam.asset_id = ma.id
        and mam.specialty_id is null
        and mam.tool_id = v_tool_chakra_id
        and mam.media_type = 'image'
        and mam.is_primary = true
    );

  -- -------------------------------------------------------------------------
  -- Validation counts
  -- -------------------------------------------------------------------------
  select count(*) into v_asset_count
  from public.methodology_assets ma
  where ma.tool_id = v_tool_chakra_id
    and ma.asset_type = 'chakra'
    and ma.status = 'active';

  select count(*) into v_media_count
  from public.methodology_asset_media mam
  inner join public.methodology_assets ma on ma.id = mam.asset_id
  where ma.tool_id = v_tool_chakra_id
    and mam.media_type = 'image'
    and mam.is_primary = true
    and mam.tool_id = v_tool_chakra_id
    and mam.specialty_id is null;

  raise notice 'V2.5C chakra seed complete.';
  raise notice '  active chakra assets: %', v_asset_count;
  raise notice '  primary global chakra media: %', v_media_count;

  if v_asset_count <> 7 then
    raise warning 'Expected 7 chakra assets; found %.', v_asset_count;
  end if;

  if v_media_count <> 7 then
    raise warning 'Expected 7 primary chakra media rows; found %.', v_media_count;
  end if;

end $$;
