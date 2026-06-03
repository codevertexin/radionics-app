import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = path.join(root, 'docs/knowledge/vanessa/GRAFICOS MESA.txt');
const outPath = path.join(
  root,
  'supabase/migrations/20260531220000_radionics_graph_knowledge_import_v2_6b.sql',
);

const SLUGS = [
  'anti-possessao', 'triturador', 'yoshua', 'luxor', 'quadrata', 'anti-depressao',
  'magnetismo-curativo', 'turbilhao-jupiter', 'saude-financeira', 'piramide-plana-om',
  'dissipador', 'desimpregnador', 'justica-divina', 'sol-da-vida', 'energizador',
  'anti-dor', 'anti-magia', 'iave-sete-circulos', 'mesa-damien', 'heptapentagrama',
  'revitalizador-chakras', 'scap-cabalista', 'quadrado-magico', 'sorte-sucesso',
  'cubo-metatron', 'desembaracador-relacionamentos', 'prosperador', 'antakarana',
  'piramide-tao', 'hexagrama', 'turbilhao-prosperador', 'kit-cromo', 'alta-vitalidade',
  'cruz-ansata', 'vesica-piscis',
];

const text = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const blocks = text.split(/\n(?=\d+\.\s)/).filter(b => /^\d+\./.test(b.trim()));

if (blocks.length !== 35) {
  throw new Error(`Expected 35 blocks, found ${blocks.length}`);
}

function parseBlock(block) {
  const titleM = block.match(/^\d+\.\s*([^\n]+)/);
  if (!titleM) throw new Error('No title');
  const title = titleM[1].trim();
  const body = block.slice(titleM[0].length).trim();
  const oQueIdx = body.indexOf('• O que é:');
  const clientIdx = body.indexOf('• O que informar ao cliente');
  const ativIdx = body.indexOf('Ativação do gráfico:');
  if (oQueIdx < 0 || clientIdx < 0 || ativIdx < 0) {
    throw new Error(`Missing sections in: ${title}`);
  }
  const therapist = body.slice(oQueIdx + '• O que é:'.length, clientIdx).trim();
  const client = body
    .slice(clientIdx, ativIdx)
    .replace(/^• O que informar ao cliente[^:]*:\s*/i, '')
    .trim();
  let activation = body.slice(ativIdx + 'Ativação do gráfico:'.length).trim();
  activation = activation.replace(/^["']|["']\s*$/g, '').trim();
  return { title, therapist, client, activation };
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

const rows = blocks.map((b, i) => {
  const p = parseBlock(b);
  if (!p.therapist || !p.client || !p.activation) {
    throw new Error(`Empty field for slug ${SLUGS[i]} (${p.title})`);
  }
  return { ...p, slug: SLUGS[i], sort: i + 1 };
});

const valuesLines = rows
  .map(
    r => `  (
    ${r.sort},
    '${r.slug}',
    ${dollarQuote(r.title)},
    ${dollarQuote(r.therapist)},
    ${dollarQuote(r.client)},
    ${dollarQuote(r.activation)}
  )`,
  )
  .join(',\n');

const migration = `-- =============================================================================
-- RADIONICS — Phase V2.6B: Graph knowledge import (Mesa 35)
-- Source: docs/knowledge/vanessa/GRAFICOS MESA.txt (${rows.length} entries, validated)
-- Target: specialty_asset_content, activation_scripts, activation_script_links
-- Specialty: mesa-35 · Tool: graph-set-35
-- Idempotent. No invented content.
-- =============================================================================

do $$
declare
  v_specialty_id uuid;
  v_tool_graph_id uuid;
  v_source_entries integer := ${rows.length};
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
${valuesLines};

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
`;

fs.writeFileSync(outPath, migration, 'utf8');
console.log(`Wrote ${outPath} (${rows.length} entries)`);
