import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = path.join(root, 'docs/knowledge/vanessa/ANJOs.txt');
const outPath = path.join(
  root,
  'supabase/migrations/20260531230000_radionics_angel_knowledge_import_v2_6c.sql',
);

const SOURCE_REF = 'docs/knowledge/vanessa/ANJOs';

const LEGACY_BY_SORT = [
  { sort: 1, code: 'angel_magic', category: 'angel' },
  { sort: 2, code: 'angel_healing', category: 'angel' },
  { sort: 3, code: 'angel_guidance', category: 'angel' },
  { sort: 4, code: 'angel_lightness', category: 'angel' },
  { sort: 5, code: 'angel_personal_power', category: 'angel' },
  { sort: 6, code: 'angel_unconditional_love', category: 'angel' },
  { sort: 7, code: 'angel_wisdom', category: 'angel' },
  { sort: 8, code: 'angel_clarity', category: 'angel' },
  { sort: 9, code: 'angel_beauty', category: 'angel' },
  { sort: 10, code: 'angel_discernment', category: 'angel' },
  { sort: 11, code: 'angel_purity', category: 'angel' },
  { sort: 12, code: 'angel_purpose', category: 'angel' },
  { sort: 13, code: 'angel_peace', category: 'angel' },
  { sort: 14, code: 'angel_joy', category: 'angel' },
  { sort: 15, code: 'angel_prosperity', category: 'angel' },
  { sort: 16, code: 'angel_reflection', category: 'angel' },
  { sort: 17, code: 'angel_illumination', category: 'angel' },
  { sort: 18, code: 'angel_liberation', category: 'angel' },
  { sort: 19, code: 'angel_transformation', category: 'angel' },
  { sort: 20, code: 'angel_abundance', category: 'angel' },
  { sort: 21, code: 'angel_confidence', category: 'angel' },
  { sort: 22, code: 'angel_compassion', category: 'angel' },
  { sort: 23, code: 'angel_fun', category: 'angel' },
  { sort: 24, code: 'angel_empathy', category: 'angel' },
  { sort: 25, code: 'angel_satisfaction', category: 'angel' },
  { sort: 26, code: 'angel_hope', category: 'angel' },
  { sort: 27, code: 'angel_passion', category: 'angel' },
  { sort: 28, code: 'angel_commitment', category: 'angel' },
  { sort: 29, code: 'angel_self_esteem', category: 'angel' },
  { sort: 30, code: 'angel_courage', category: 'angel' },
  { sort: 31, code: 'angel_acceleration', category: 'angel' },
  { sort: 32, code: 'angel_communication', category: 'angel' },
  { sort: 33, code: 'angel_gratitude', category: 'angel' },
  { sort: 34, code: 'archangel_raziel', category: 'archangel' },
  { sort: 35, code: 'archangel_raphael', category: 'archangel' },
  { sort: 36, code: 'archangel_gabriel', category: 'archangel' },
  { sort: 37, code: 'archangel_michael', category: 'archangel' },
  { sort: 38, code: 'archangel_uriel', category: 'archangel' },
  { sort: 39, code: 'archangel_camael', category: 'archangel' },
  { sort: 40, code: 'archangel_metatron', category: 'archangel' },
  { sort: 41, code: 'angel_union', category: 'angel' },
  { sort: 42, code: 'angel_humor', category: 'angel' },
  { sort: 43, code: 'angel_harmony', category: 'angel' },
  { sort: 44, code: 'angel_forgiveness', category: 'angel' },
  { sort: 45, code: 'angel_wellbeing', category: 'angel' },
  { sort: 46, code: 'angel_transmutation', category: 'angel' },
  { sort: 47, code: 'angel_focus_discipline', category: 'angel' },
  { sort: 48, code: 'angel_problem_solving', category: 'angel' },
  { sort: 49, code: 'angel_perfect_health', category: 'angel' },
];

function codeToSlug(code) {
  return code.toLowerCase().replace(/_/g, '-');
}

function displayName(title) {
  return title
    .replace(/^ANJO\s*-\s*/i, '')
    .replace(/^ARCANJO\s+/i, 'Arcanjo ')
    .trim();
}

function parseBlock(block) {
  const titleM = block.match(/^\d+\.\s*([^\n]+)/);
  if (!titleM) throw new Error('No title');
  const sort = parseInt(block.match(/^(\d+)\./)[1], 10);
  const title = titleM[1].trim();
  const body = block.slice(titleM[0].length).trim();
  const ativM = body.match(/Ativação\s*-\s*gráfico:\s*["']?([\s\S]+?)["']?\s*$/i);
  if (!ativM) throw new Error(`No activation: ${title}`);
  const activation = ativM[1].trim().replace(/^["']|["']$/g, '');
  const legacy = LEGACY_BY_SORT[sort - 1];
  if (!legacy) throw new Error(`No legacy mapping for sort ${sort}`);
  return {
    sort,
    title,
    assetName: displayName(title),
    activation,
    slug: codeToSlug(legacy.code),
    assetType: legacy.category,
    legacyCode: legacy.code,
  };
}

function dollarTag(s) {
  let tag = 'k';
  while (s.includes(`$${tag}$`)) tag += 'x';
  return tag;
}

function dollarQuote(s) {
  const tag = dollarTag(s);
  return `$${tag}$${s}$${tag}$`;
}

const text = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const blocks = text.split(/\n(?=\d+\.\s)/).filter(b => /^\d+\./.test(b.trim()));

if (blocks.length !== 49) {
  throw new Error(`Validation failed: expected 49 entries, found ${blocks.length}`);
}

const rows = blocks.map(parseBlock);
const angels = rows.filter(r => r.assetType === 'angel').length;
const archangels = rows.filter(r => r.assetType === 'archangel').length;

if (angels !== 42 || archangels !== 7) {
  throw new Error(`Validation failed: angels=${angels}, archangels=${archangels}`);
}

const valuesLines = rows
  .map(
    r => `  (
    ${r.sort},
    '${r.slug}',
    '${r.assetType}',
    ${dollarQuote(r.assetName)},
    ${dollarQuote(r.activation)}
  )`,
  )
  .join(',\n');

const migration = `-- =============================================================================
-- RADIONICS — Phase V2.6C: Angel knowledge import (Mesa 49)
-- Source: docs/knowledge/vanessa/ANJOs.txt (${rows.length} entries validated)
--   angels: ${angels} · archangels: ${archangels}
-- Target: activation_scripts, specialty_asset_content (activation_text only),
--          activation_script_links (target_type = asset, for validation parity)
-- Specialty: mesa-49 · Tool: angel-set-49
-- Idempotent. No invented content.
-- =============================================================================

do $$
declare
  v_specialty_id uuid;
  v_tool_angel_id uuid;
  v_source_entries integer := ${rows.length};
  v_angel_entries integer := ${angels};
  v_archangel_entries integer := ${archangels};
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
${valuesLines};

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
    '${SOURCE_REF}',
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
    '${SOURCE_REF}',
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
    and s.source_reference = '${SOURCE_REF}'
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
    and s.source_reference = '${SOURCE_REF}';

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
`;

fs.writeFileSync(outPath, migration, 'utf8');
console.log(`Wrote ${outPath}`);
console.log(`Entries: ${rows.length} (${angels} angels, ${archangels} archangels)`);
