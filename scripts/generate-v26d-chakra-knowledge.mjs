import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = path.join(root, 'docs/knowledge/vanessa/Chakra.txt');
const outPath = path.join(
  root,
  'supabase/migrations/20260531240000_radionics_chakra_knowledge_import_v2_6d.sql',
);

const SOURCE_REF = 'docs/knowledge/vanessa/Chakra.txt';

const EXPECTED = [
  { sort: 1, slug: 'chakra-basico', assetName: 'Chakra Básico', originalName: 'Muladhara', aliases: ['Chakra Raiz', 'Muladhara'] },
  { sort: 2, slug: 'chakra-sexual', assetName: 'Chakra Sexual', originalName: 'Swadhisthana', aliases: ['Chakra Sacral', 'Chakra Esplênico', 'Chakra Umbilical', 'Swadhisthana'] },
  { sort: 3, slug: 'chakra-plexo-solar', assetName: 'Chakra Plexo Solar', originalName: 'Manipura', aliases: ['Manipura'] },
  { sort: 4, slug: 'chakra-cardiaco', assetName: 'Chakra Cardíaco', originalName: 'Anahata', aliases: ['Anahata'] },
  { sort: 5, slug: 'chakra-laringeo', assetName: 'Chakra Laríngeo', originalName: 'Vishuddha', aliases: ['Vishuddha'] },
  { sort: 6, slug: 'chakra-frontal', assetName: 'Chakra Frontal', originalName: 'Ajna', aliases: ['Terceiro Olho', 'Ajna'] },
  { sort: 7, slug: 'chakra-coronario', assetName: 'Chakra Coronário', originalName: 'Sahasrara', aliases: ['Sahasrara'] },
];

function extractField(body, label) {
  const re = new RegExp(`•\\s*${label}:\\s*([\\s\\S]*?)(?=\\n•\\s*|\\nAtivação:|$)`, 'i');
  const m = body.match(re);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function parseChakraBlock(block, expected) {
  const headerM = block.match(/^(\d+)º\s*Chakra:\s*([^\n(]+)(?:\(([^)]+)\))?/i);
  const body = block.slice(headerM[0].length).trim();
  const fields = {
    location: extractField(body, 'Localização'),
    function: extractField(body, 'Função'),
    color: extractField(body, 'Cor'),
    element: extractField(body, 'Elemento'),
    corresponding_organs: extractField(body, 'Órgãos Correspondentes'),
    imbalances: extractField(body, 'Desequilíbrios'),
    how_to_balance: extractField(body, 'Como Equilibrar'),
  };
  const ativM = body.match(/Ativação:\s*["']?([\s\S]+?)["']?\s*$/i);
  const activation = ativM[1].replace(/^["']|["']$/g, '').trim();

  const therapist = [
    `Localização: ${fields.location}`,
    `Função: ${fields.function}`,
    `Cor: ${fields.color}`,
    `Elemento: ${fields.element}`,
    `Órgãos correspondentes: ${fields.corresponding_organs}`,
    `Desequilíbrios: ${fields.imbalances}`,
    `Como equilibrar: ${fields.how_to_balance}`,
  ].join('\n\n');

  const client = [
    fields.function,
    `Quando desequilibrado: ${fields.imbalances}`,
    `Sugestão de equilíbrio: ${fields.how_to_balance}`,
  ].join('\n\n');

  const interpretation = [
    `Cor: ${fields.color} · Elemento: ${fields.element}`,
    fields.imbalances,
  ].join(' ');

  return {
    ...expected,
    ...fields,
    activation,
    therapist_explanation: therapist,
    client_explanation: client,
    interpretation,
    recommended_use: fields.how_to_balance,
    metadata: {
      import_source: 'v2.6d',
      location: fields.location,
      function: fields.function,
      color: fields.color,
      element: fields.element,
      corresponding_organs: fields.corresponding_organs,
      imbalances: fields.imbalances,
      how_to_balance: fields.how_to_balance,
    },
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

function sqlArray(arr) {
  return `ARRAY[${arr.map(a => dollarQuote(a)).join(', ')}]::text[]`;
}

function sqlJson(obj) {
  return dollarQuote(JSON.stringify(obj));
}

const text = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const blocks = text.split(/\n(?=\d+º\s*Chakra:)/i).filter(b => /^\d+º\s*Chakra:/i.test(b.trim()));

if (blocks.length !== 7) throw new Error(`Expected 7 blocks, found ${blocks.length}`);

const rows = blocks.map((b, i) => parseChakraBlock(b, EXPECTED[i]));

const valuesLines = rows
  .map(
    r => `  (
    ${r.sort},
    '${r.slug}',
    ${dollarQuote(r.assetName)},
    ${dollarQuote(r.originalName)},
    ${sqlArray(r.aliases)},
    ${dollarQuote(r.therapist_explanation)},
    ${dollarQuote(r.client_explanation)},
    ${dollarQuote(r.interpretation)},
    ${dollarQuote(r.recommended_use)},
    ${dollarQuote(r.activation)},
    ${sqlJson(r.metadata)}
  )`,
  )
  .join(',\n');

const migration = `-- =============================================================================
-- RADIONICS — Phase V2.6D: Chakra knowledge import (Mesa 35)
-- Source: docs/knowledge/vanessa/Chakra.txt (${rows.length} entries validated)
-- Target: methodology_assets (naming), specialty_asset_content (mesa-35),
--         activation_scripts, activation_script_links
-- Idempotent. No invented content.
-- =============================================================================

do $$
declare
  v_specialty_id uuid;
  v_tool_chakra_id uuid;
  v_source_entries integer := ${rows.length};
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
${valuesLines};

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
    '${SOURCE_REF}',
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
    '${SOURCE_REF}',
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
    and s.source_reference = '${SOURCE_REF}'
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
    and s.source_reference = '${SOURCE_REF}';

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
`;

fs.writeFileSync(outPath, migration, 'utf8');
console.log(`Wrote ${outPath} (${rows.length} chakras)`);
