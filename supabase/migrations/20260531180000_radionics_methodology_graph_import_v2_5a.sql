-- =============================================================================
-- RADIONICS — Phase V2.5A: Legacy import — 35 Mesa graphs
-- Source: public.radionics_tools (category = 'graphic')
-- Target: methodology_assets, methodology_asset_media, specialty_asset_content
-- Tool: graph-set-35 · Specialty: mesa-35
-- Idempotent: upsert by (tool_id, slug); update primary media; preserve rich content
-- =============================================================================

create or replace function public.legacy_tool_code_to_asset_slug(p_code text)
returns text
language sql
immutable
as $$
  select regexp_replace(lower(trim(p_code)), '_', '-', 'g');
$$;

create or replace function public.legacy_tool_code_to_display_name(p_code text)
returns text
language sql
immutable
as $$
  select case public.legacy_tool_code_to_asset_slug(p_code)
    when 'anti-magia' then 'Anti Magia'
    when 'luxor' then 'Luxor'
    when 'anti-possessao' then 'Anti Possessão'
    when 'desobsessao' then 'Desobsessão'
    when 'prosperidade' then 'Prosperidade'
    when 'amor' then 'Amor'
    when 'saude' then 'Saúde'
    when 'karma' then 'Karma'
    else initcap(replace(trim(p_code), '_', ' '))
  end;
$$;

do $$
declare
  v_specialty_id uuid;
  v_tool_graph_id uuid;
  v_legacy_count integer;
  v_active_graphs integer;
  v_media_count integer;
  v_content_count integer;
  v_deactivated integer;
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'radionics_tools'
  ) then
    raise exception
      'Table public.radionics_tools is required for V2.5A graph import.';
  end if;

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

  select count(*) into v_legacy_count
  from public.radionics_tools rt
  where rt.category = 'graphic';

  if v_legacy_count = 0 then
    raise exception
      'No rows in radionics_tools with category = ''graphic''. Cannot import Mesa 35 graphs.';
  end if;

  -- -------------------------------------------------------------------------
  -- 1. methodology_assets (upsert by tool_id + slug from legacy code)
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
  )
  select
    v_tool_graph_id,
    public.legacy_tool_code_to_display_name(rt.code),
    public.legacy_tool_code_to_asset_slug(rt.code),
    lpad(rt.sort_order::text, 2, '0'),
    'graph',
    'activation',
    null,
    nullif(trim(rt.image_url), ''),
    case when coalesce(rt.is_active, true) then 'active' else 'inactive' end,
    rt.sort_order,
    jsonb_build_object(
      'import_source', 'v2.5a',
      'legacy_tool_id', rt.id,
      'legacy_code', rt.code,
      'legacy_table_id', rt.table_id
    )
  from public.radionics_tools rt
  where rt.category = 'graphic'
  on conflict (tool_id, slug) do update set
    name = excluded.name,
    code = excluded.code,
    image_url = excluded.image_url,
    status = excluded.status,
    sort_order = excluded.sort_order,
    metadata = coalesce(public.methodology_assets.metadata, '{}'::jsonb) || excluded.metadata,
    updated_at = now();

  -- Retire V2.2 placeholder graphs not present in legacy catalog (keeps exactly 35 active)
  with legacy_slugs as (
    select public.legacy_tool_code_to_asset_slug(rt.code) as slug
    from public.radionics_tools rt
    where rt.category = 'graphic'
  )
  update public.methodology_assets ma
  set
    status = 'inactive',
    updated_at = now(),
    metadata = coalesce(ma.metadata, '{}'::jsonb) || jsonb_build_object(
      'deactivated_by', 'v2.5a',
      'reason', 'not_in_legacy_radionics_tools_graphic_catalog'
    )
  where ma.tool_id = v_tool_graph_id
    and ma.asset_type = 'graph'
    and ma.status = 'active'
    and ma.slug not in (select slug from legacy_slugs);

  get diagnostics v_deactivated = row_count;

  -- -------------------------------------------------------------------------
  -- 2. methodology_asset_media — primary Bunny image per asset (mesa-35 scope)
  -- -------------------------------------------------------------------------
  update public.methodology_asset_media mam
  set
    url = src.image_url,
    storage_provider = 'bunny',
    source_type = 'teacher_original',
    source_name = 'radionics_tools',
    alt_text = src.asset_name,
    quality_status = 'approved',
    is_primary = true,
    metadata = coalesce(mam.metadata, '{}'::jsonb) || jsonb_build_object(
      'import_source', 'v2.5a',
      'legacy_tool_id', src.legacy_tool_id,
      'legacy_code', src.legacy_code
    ),
    updated_at = now()
  from (
    select
      ma.id as asset_id,
      nullif(trim(rt.image_url), '') as image_url,
      public.legacy_tool_code_to_display_name(rt.code) as asset_name,
      rt.id as legacy_tool_id,
      rt.code as legacy_code
    from public.radionics_tools rt
    inner join public.methodology_assets ma
      on ma.tool_id = v_tool_graph_id
      and ma.slug = public.legacy_tool_code_to_asset_slug(rt.code)
    where rt.category = 'graphic'
      and nullif(trim(rt.image_url), '') is not null
  ) src
  where mam.asset_id = src.asset_id
    and mam.specialty_id = v_specialty_id
    and mam.tool_id is null
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
    v_specialty_id,
    null,
    'image',
    nullif(trim(rt.image_url), ''),
    'bunny',
    'teacher_original',
    'radionics_tools',
    public.legacy_tool_code_to_display_name(rt.code),
    'approved',
    true,
    jsonb_build_object(
      'import_source', 'v2.5a',
      'legacy_tool_id', rt.id,
      'legacy_code', rt.code
    )
  from public.radionics_tools rt
  inner join public.methodology_assets ma
    on ma.tool_id = v_tool_graph_id
    and ma.slug = public.legacy_tool_code_to_asset_slug(rt.code)
  where rt.category = 'graphic'
    and nullif(trim(rt.image_url), '') is not null
    and not exists (
      select 1
      from public.methodology_asset_media mam
      where mam.asset_id = ma.id
        and mam.specialty_id = v_specialty_id
        and mam.tool_id is null
        and mam.media_type = 'image'
        and mam.is_primary = true
    );

  -- -------------------------------------------------------------------------
  -- 3. specialty_asset_content — one row per active graph for mesa-35
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
    sort_order,
    metadata
  )
  select
    v_specialty_id,
    ma.id,
    ma.name,
    ma.base_description,
    null,
    null,
    null,
    null,
    null,
    ma.sort_order,
    jsonb_build_object('import_source', 'v2.5a')
  from public.methodology_assets ma
  where ma.tool_id = v_tool_graph_id
    and ma.asset_type = 'graph'
    and ma.status = 'active'
  on conflict (specialty_id, asset_id) do update set
    title = excluded.title,
    therapist_explanation = coalesce(
      excluded.therapist_explanation,
      public.specialty_asset_content.therapist_explanation
    ),
    client_explanation = coalesce(
      public.specialty_asset_content.client_explanation,
      excluded.client_explanation
    ),
    recommended_use = coalesce(
      public.specialty_asset_content.recommended_use,
      excluded.recommended_use
    ),
    sort_order = excluded.sort_order,
    metadata = coalesce(public.specialty_asset_content.metadata, '{}'::jsonb)
      || excluded.metadata,
    updated_at = now();

  select count(*) into v_active_graphs
  from public.methodology_assets
  where tool_id = v_tool_graph_id
    and asset_type = 'graph'
    and status = 'active';

  select count(*) into v_media_count
  from public.methodology_asset_media mam
  inner join public.methodology_assets ma on ma.id = mam.asset_id
  where ma.tool_id = v_tool_graph_id
    and ma.asset_type = 'graph'
    and ma.status = 'active'
    and mam.specialty_id = v_specialty_id
    and mam.is_primary = true
    and mam.media_type = 'image';

  select count(*) into v_content_count
  from public.specialty_asset_content sac
  inner join public.methodology_assets ma on ma.id = sac.asset_id
  where sac.specialty_id = v_specialty_id
    and ma.tool_id = v_tool_graph_id
    and ma.asset_type = 'graph'
    and ma.status = 'active';

  raise notice 'V2.5A graph import complete.';
  raise notice '  legacy radionics_tools (graphic): %', v_legacy_count;
  raise notice '  active methodology_assets (graph-set-35): %', v_active_graphs;
  raise notice '  primary methodology_asset_media (mesa-35): %', v_media_count;
  raise notice '  specialty_asset_content (mesa-35 graphs): %', v_content_count;
  raise notice '  deactivated non-legacy V2.2 placeholders: %', v_deactivated;

  if v_legacy_count <> 35 then
    raise warning
      'Expected 35 legacy graphic tools; found %. Active graph assets after import: %.',
      v_legacy_count, v_active_graphs;
  end if;

  if v_active_graphs <> v_legacy_count then
    raise warning
      'Active graph asset count (%) does not match legacy import count (%).',
      v_active_graphs, v_legacy_count;
  end if;

end $$;
