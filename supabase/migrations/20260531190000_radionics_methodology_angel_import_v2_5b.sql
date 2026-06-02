-- =============================================================================
-- RADIONICS — Phase V2.5B: Legacy import — 49 Angelical assets (Mesa 49)
-- Source: public.radionics_tools (category IN ('angel', 'archangel'))
-- Target: methodology_tools, methodology_assets, methodology_asset_media,
--         specialty_tools, specialty_asset_content
-- Specialty: mesa-49 · Tool: angel-set-49
-- Does not modify V2.5A graph assets (graph-set-35 / mesa-35).
-- =============================================================================

-- Extend slug helper: lowercase, underscores → hyphens, strip common accents
create or replace function public.legacy_tool_code_to_asset_slug(p_code text)
returns text
language sql
immutable
as $$
  select translate(
    regexp_replace(lower(trim(p_code)), '_', '-', 'g'),
    'áàâãäéèêëíìîïóòôõöúùûüçñ',
    'aaaaaeeeeiiiiooooouuuucn'
  );
$$;

create or replace function public.legacy_angel_code_to_display_name(
  p_code text,
  p_category text
)
returns text
language sql
immutable
as $$
  select case
    when p_category = 'archangel' then
      'Arcanjo ' || initcap(
        replace(
          regexp_replace(lower(trim(p_code)), '^archangel_', ''),
          '_', ' '
        )
      )
    when p_category = 'angel' then
      initcap(
        replace(
          regexp_replace(lower(trim(p_code)), '^angel_', ''),
          '_', ' '
        )
      )
    else public.legacy_tool_code_to_display_name(p_code)
  end;
$$;

do $$
declare
  v_specialty_id uuid;
  v_tool_angel_id uuid;
  v_legacy_angel integer;
  v_legacy_archangel integer;
  v_legacy_total integer;
  v_asset_angel integer;
  v_asset_archangel integer;
  v_media_count integer;
  v_content_count integer;
  v_has_description boolean;
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'radionics_tools'
  ) then
    raise exception
      'Table public.radionics_tools is required for V2.5B angel import.';
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'radionics_tools'
      and column_name = 'description'
  ) into v_has_description;

  select id into v_specialty_id
  from public.radionics_specialties
  where slug = 'mesa-49';

  if v_specialty_id is null then
    raise exception
      'radionics_specialties with slug ''mesa-49'' is required. '
      'Apply Phase 1 migration seed first.';
  end if;

  select count(*) into v_legacy_angel
  from public.radionics_tools rt
  where rt.category = 'angel';

  select count(*) into v_legacy_archangel
  from public.radionics_tools rt
  where rt.category = 'archangel';

  v_legacy_total := v_legacy_angel + v_legacy_archangel;

  if v_legacy_total = 0 then
    raise exception
      'No rows in radionics_tools with category angel/archangel. Cannot import Mesa 49.';
  end if;

  -- -------------------------------------------------------------------------
  -- 1. methodology_tools — angel-set-49
  -- -------------------------------------------------------------------------
  insert into public.methodology_tools (
    name,
    slug,
    description,
    tool_type,
    usage_mode,
    status,
    sort_order
  ) values (
    '49 Símbolos Angelicais',
    'angel-set-49',
    'Conjunto de 49 símbolos angelicais (42 anjos + 7 arcanjos) para harmonização espiritual.',
    'angel_set',
    'activation',
    'active',
    40
  )
  on conflict (slug) do update set
    name = excluded.name,
    description = excluded.description,
    tool_type = excluded.tool_type,
    usage_mode = excluded.usage_mode,
    status = excluded.status,
    sort_order = excluded.sort_order,
    updated_at = now();

  select id into v_tool_angel_id
  from public.methodology_tools
  where slug = 'angel-set-49';

  if v_tool_angel_id is null then
    raise exception 'Failed to resolve methodology_tools slug ''angel-set-49'' after upsert.';
  end if;

  -- -------------------------------------------------------------------------
  -- 2. methodology_assets
  -- -------------------------------------------------------------------------
  if v_has_description then
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
      v_tool_angel_id,
      public.legacy_angel_code_to_display_name(rt.code, rt.category),
      public.legacy_tool_code_to_asset_slug(rt.code),
      rt.code,
      rt.category,
      'activation',
      nullif(trim(rt.description), ''),
      nullif(trim(rt.image_url), ''),
      case when coalesce(rt.is_active, true) then 'active' else 'inactive' end,
      rt.sort_order,
      jsonb_build_object(
        'import_source', 'v2.5b',
        'legacy_code', rt.code,
        'legacy_category', rt.category,
        'legacy_tool_id', rt.id,
        'therapy_type_id', rt.therapy_type_id
      )
    from public.radionics_tools rt
    where rt.category in ('angel', 'archangel')
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
  else
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
      v_tool_angel_id,
      public.legacy_angel_code_to_display_name(rt.code, rt.category),
      public.legacy_tool_code_to_asset_slug(rt.code),
      rt.code,
      rt.category,
      'activation',
      null,
      nullif(trim(rt.image_url), ''),
      case when coalesce(rt.is_active, true) then 'active' else 'inactive' end,
      rt.sort_order,
      jsonb_build_object(
        'import_source', 'v2.5b',
        'legacy_code', rt.code,
        'legacy_category', rt.category,
        'legacy_tool_id', rt.id,
        'therapy_type_id', rt.therapy_type_id
      )
    from public.radionics_tools rt
    where rt.category in ('angel', 'archangel')
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
  end if;

  -- -------------------------------------------------------------------------
  -- 3. methodology_asset_media — primary Bunny image (mesa-49 + angel-set-49 scope)
  -- -------------------------------------------------------------------------
  update public.methodology_asset_media mam
  set
    url = src.image_url,
    storage_provider = 'bunny',
    source_type = 'teacher_original',
    source_name = 'Vanessa',
    alt_text = src.asset_name,
    quality_status = 'approved',
    is_primary = true,
    metadata = coalesce(mam.metadata, '{}'::jsonb) || jsonb_build_object(
      'import_source', 'v2.5b',
      'legacy_tool_id', src.legacy_tool_id,
      'legacy_code', src.legacy_code,
      'legacy_category', src.legacy_category
    ),
    updated_at = now()
  from (
    select
      ma.id as asset_id,
      nullif(trim(rt.image_url), '') as image_url,
      public.legacy_angel_code_to_display_name(rt.code, rt.category) as asset_name,
      rt.id as legacy_tool_id,
      rt.code as legacy_code,
      rt.category as legacy_category
    from public.radionics_tools rt
    inner join public.methodology_assets ma
      on ma.tool_id = v_tool_angel_id
      and ma.slug = public.legacy_tool_code_to_asset_slug(rt.code)
    where rt.category in ('angel', 'archangel')
      and nullif(trim(rt.image_url), '') is not null
  ) src
  where mam.asset_id = src.asset_id
    and mam.specialty_id = v_specialty_id
    and mam.tool_id = v_tool_angel_id
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
    v_tool_angel_id,
    'image',
    nullif(trim(rt.image_url), ''),
    'bunny',
    'teacher_original',
    'Vanessa',
    public.legacy_angel_code_to_display_name(rt.code, rt.category),
    'approved',
    true,
    jsonb_build_object(
      'import_source', 'v2.5b',
      'legacy_tool_id', rt.id,
      'legacy_code', rt.code,
      'legacy_category', rt.category
    )
  from public.radionics_tools rt
  inner join public.methodology_assets ma
    on ma.tool_id = v_tool_angel_id
    and ma.slug = public.legacy_tool_code_to_asset_slug(rt.code)
  where rt.category in ('angel', 'archangel')
    and nullif(trim(rt.image_url), '') is not null
    and not exists (
      select 1
      from public.methodology_asset_media mam
      where mam.asset_id = ma.id
        and mam.specialty_id = v_specialty_id
        and mam.tool_id = v_tool_angel_id
        and mam.media_type = 'image'
        and mam.is_primary = true
    );

  -- -------------------------------------------------------------------------
  -- 4. specialty_tools — mesa-49 ↔ angel-set-49
  -- -------------------------------------------------------------------------
  insert into public.specialty_tools (
    specialty_id,
    tool_id,
    is_required,
    is_visible_in_workspace,
    sort_order
  ) values (
    v_specialty_id,
    v_tool_angel_id,
    true,
    true,
    1
  )
  on conflict (specialty_id, tool_id) do update set
    is_required = excluded.is_required,
    is_visible_in_workspace = excluded.is_visible_in_workspace,
    sort_order = excluded.sort_order,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- 5. specialty_asset_content
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
    jsonb_build_object('import_source', 'v2.5b')
  from public.methodology_assets ma
  where ma.tool_id = v_tool_angel_id
    and ma.asset_type in ('angel', 'archangel')
    and ma.status = 'active'
  on conflict (specialty_id, asset_id) do update set
    title = excluded.title,
    therapist_explanation = excluded.therapist_explanation,
    sort_order = excluded.sort_order,
    metadata = coalesce(public.specialty_asset_content.metadata, '{}'::jsonb)
      || excluded.metadata,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- Validation counts (NOTICE)
  -- -------------------------------------------------------------------------
  select count(*) into v_asset_angel
  from public.methodology_assets ma
  where ma.tool_id = v_tool_angel_id
    and ma.asset_type = 'angel'
    and ma.status = 'active';

  select count(*) into v_asset_archangel
  from public.methodology_assets ma
  where ma.tool_id = v_tool_angel_id
    and ma.asset_type = 'archangel'
    and ma.status = 'active';

  select count(*) into v_media_count
  from public.methodology_asset_media mam
  inner join public.methodology_assets ma on ma.id = mam.asset_id
  where ma.tool_id = v_tool_angel_id
    and mam.specialty_id = v_specialty_id
    and mam.tool_id = v_tool_angel_id
    and mam.is_primary = true
    and mam.media_type = 'image';

  select count(*) into v_content_count
  from public.specialty_asset_content sac
  inner join public.methodology_assets ma on ma.id = sac.asset_id
  where sac.specialty_id = v_specialty_id
    and ma.tool_id = v_tool_angel_id
    and ma.status = 'active';

  raise notice 'V2.5B angel import complete.';
  raise notice '  legacy radionics_tools angel: %', v_legacy_angel;
  raise notice '  legacy radionics_tools archangel: %', v_legacy_archangel;
  raise notice '  active methodology_assets angel: %', v_asset_angel;
  raise notice '  active methodology_assets archangel: %', v_asset_archangel;
  raise notice '  primary methodology_asset_media (mesa-49): %', v_media_count;
  raise notice '  specialty_asset_content (mesa-49): %', v_content_count;

  if v_legacy_angel <> 42 then
    raise warning 'Expected 42 legacy angel tools; found %.', v_legacy_angel;
  end if;

  if v_legacy_archangel <> 7 then
    raise warning 'Expected 7 legacy archangel tools; found %.', v_legacy_archangel;
  end if;

  if v_asset_angel <> v_legacy_angel or v_asset_archangel <> v_legacy_archangel then
    raise warning
      'Imported asset counts (angel=%, archangel=%) differ from legacy (%, %).',
      v_asset_angel, v_asset_archangel, v_legacy_angel, v_legacy_archangel;
  end if;

  if v_media_count <> v_legacy_total then
    raise warning
      'Primary media count (%) differs from legacy total (%).',
      v_media_count, v_legacy_total;
  end if;

  if v_content_count <> v_legacy_total then
    raise warning
      'Specialty content count (%) differs from legacy total (%).',
      v_content_count, v_legacy_total;
  end if;

end $$;
