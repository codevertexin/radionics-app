import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = path.join(root, 'docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt');
const outPath = path.join(
  root,
  'supabase/migrations/20260531250000_radionics_protocol_import_v2_6e.sql',
);

const SOURCE_REF = 'docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt';
/** Protocols span angel + graph assets; certified visibility via mesa-49 (primary specialty). */
const SPECIALTY_SLUG = 'mesa-49';

const GRAPHS_BY_NUM = {
  1: { slug: 'anti-possessao', name: 'Anti Possessão' },
  2: { slug: 'triturador', name: 'Triturador' },
  3: { slug: 'yoshua', name: 'Yoshua' },
  4: { slug: 'luxor', name: 'Luxor' },
  5: { slug: 'quadrata', name: 'Quadrata' },
  6: { slug: 'anti-depressao', name: 'Anti Depressão' },
  7: { slug: 'magnetismo-curativo', name: 'Magnetismo Curativo' },
  8: { slug: 'turbilhao-jupiter', name: 'Turbilhão Júpiter' },
  9: { slug: 'saude-financeira', name: 'Saúde Financeira' },
  10: { slug: 'piramide-plana-om', name: 'Pirâmide Plana com OM' },
  11: { slug: 'dissipador', name: 'Dissipador' },
  12: { slug: 'desimpregnador', name: 'Desimpregnador' },
  13: { slug: 'justica-divina', name: 'Justiça Divina' },
  14: { slug: 'sol-da-vida', name: 'Sol da Vida' },
  15: { slug: 'energizador', name: 'Energizador' },
  16: { slug: 'anti-dor', name: 'Anti Dor' },
  17: { slug: 'anti-magia', name: 'Anti Magia' },
  18: { slug: 'iave-sete-circulos', name: 'Iavé – Sete Círculos' },
  19: { slug: 'mesa-damien', name: 'Mesa Damien' },
  20: { slug: 'heptapentagrama', name: 'Heptapentagrama' },
  21: { slug: 'revitalizador-chakras', name: 'Revitalizador de Chakras' },
  22: { slug: 'scap-cabalista', name: 'Scap Cabalístico' },
  23: { slug: 'quadrado-magico', name: 'Quadrado Mágico' },
  24: { slug: 'sorte-sucesso', name: 'Sorte e Sucesso' },
  25: { slug: 'cubo-metatron', name: 'Cubo de Metatron' },
  26: { slug: 'desembaracador-relacionamentos', name: 'Desembaraçador de Relacionamentos' },
  27: { slug: 'prosperador', name: 'Prosperador' },
  28: { slug: 'antakarana', name: 'Antakarana' },
  29: { slug: 'piramide-tao', name: 'Pirâmide Tao' },
  30: { slug: 'hexagrama', name: 'Hexagrama' },
  31: { slug: 'turbilhao-prosperador', name: 'Turbilhão Prosperador' },
  32: { slug: 'kit-cromo', name: 'Kit Cromo' },
  33: { slug: 'alta-vitalidade', name: 'Alta Vitalidade' },
  34: { slug: 'cruz-ansata', name: 'Cruz Ansata (Ankh)' },
  35: { slug: 'vesica-piscis', name: 'Vesica Piscis' },
};

const ANGELS_BY_NUM = {
  1: { slug: 'angel-magic', type: 'angel', labels: ['magia divina'] },
  2: { slug: 'angel-healing', type: 'angel', labels: ['cura interior'] },
  3: { slug: 'angel-guidance', type: 'angel', labels: ['direcionamento'] },
  4: { slug: 'angel-lightness', type: 'angel', labels: ['leveza'] },
  5: { slug: 'angel-personal-power', type: 'angel', labels: ['poder pessoal'] },
  6: { slug: 'angel-unconditional-love', type: 'angel', labels: ['amor incondicional'] },
  7: { slug: 'angel-wisdom', type: 'angel', labels: ['sabedoria'] },
  8: { slug: 'angel-clarity', type: 'angel', labels: ['clareza'] },
  9: { slug: 'angel-beauty', type: 'angel', labels: ['beleza'] },
  10: { slug: 'angel-discernment', type: 'angel', labels: ['discernimento'] },
  11: { slug: 'angel-purity', type: 'angel', labels: ['pureza'] },
  12: { slug: 'angel-purpose', type: 'angel', labels: ['proposito', 'missao'] },
  13: { slug: 'angel-peace', type: 'angel', labels: ['paz'] },
  14: { slug: 'angel-joy', type: 'angel', labels: ['alegria'] },
  15: { slug: 'angel-prosperity', type: 'angel', labels: ['prosperidade'] },
  16: { slug: 'angel-reflection', type: 'angel', labels: ['reflexao'] },
  17: { slug: 'angel-illumination', type: 'angel', labels: ['iluminacao', 'consciencia'] },
  18: { slug: 'angel-liberation', type: 'angel', labels: ['libertacao'] },
  19: { slug: 'angel-transformation', type: 'angel', labels: ['transformacao'] },
  20: { slug: 'angel-abundance', type: 'angel', labels: ['abundancia'] },
  21: { slug: 'angel-confidence', type: 'angel', labels: ['confianca'] },
  22: { slug: 'angel-compassion', type: 'angel', labels: ['compaixao'] },
  23: { slug: 'angel-fun', type: 'angel', labels: ['diversao'] },
  24: { slug: 'angel-empathy', type: 'angel', labels: ['empatia'] },
  25: { slug: 'angel-satisfaction', type: 'angel', labels: ['satisfacao'] },
  26: { slug: 'angel-hope', type: 'angel', labels: ['esperanca'] },
  27: { slug: 'angel-passion', type: 'angel', labels: ['paixao'] },
  28: { slug: 'angel-commitment', type: 'angel', labels: ['comprometimento'] },
  29: { slug: 'angel-self-esteem', type: 'angel', labels: ['autoestima'] },
  30: { slug: 'angel-courage', type: 'angel', labels: ['coragem'] },
  31: { slug: 'angel-acceleration', type: 'angel', labels: ['aceleracao'] },
  32: { slug: 'angel-communication', type: 'angel', labels: ['comunicacao'] },
  33: { slug: 'angel-gratitude', type: 'angel', labels: ['gratidao'] },
  34: { slug: 'archangel-raziel', type: 'archangel', labels: ['raziel'] },
  35: { slug: 'archangel-raphael', type: 'archangel', labels: ['rafael'] },
  36: { slug: 'archangel-gabriel', type: 'archangel', labels: ['gabriel'] },
  37: { slug: 'archangel-michael', type: 'archangel', labels: ['michael', 'miguel'] },
  38: { slug: 'archangel-uriel', type: 'archangel', labels: ['uriel'] },
  39: { slug: 'archangel-camael', type: 'archangel', labels: ['camael'] },
  40: { slug: 'archangel-metatron', type: 'archangel', labels: ['metatron'] },
  41: { slug: 'angel-union', type: 'angel', labels: ['uniao'] },
  42: { slug: 'angel-humor', type: 'angel', labels: ['humor'] },
  43: { slug: 'angel-harmony', type: 'angel', labels: ['harmonia'] },
  44: { slug: 'angel-forgiveness', type: 'angel', labels: ['perdao'] },
  45: { slug: 'angel-wellbeing', type: 'angel', labels: ['bem-estar', 'bem estar'] },
  46: { slug: 'angel-transmutation', type: 'angel', labels: ['transmutacao'] },
  47: { slug: 'angel-focus-discipline', type: 'angel', labels: ['foco', 'disciplina'] },
  48: { slug: 'angel-problem-solving', type: 'angel', labels: ['solucao', 'problemas'] },
  49: { slug: 'angel-perfect-health', type: 'angel', labels: ['saude perfeita'] },
};

function norm(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function protocolSlug(order, name) {
  const base = norm(name).replace(/\s+/g, '-').replace(/-+/g, '-');
  return `protocolo-${String(order).padStart(2, '0')}-${base}`.slice(0, 96);
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

function matchAngel(num, rawName) {
  const entry = ANGELS_BY_NUM[num];
  if (!entry) return null;
  return { slug: entry.slug, role: entry.type, label: rawName, num };
}

function matchGraph(num, rawName) {
  const entry = GRAPHS_BY_NUM[num];
  if (!entry) return null;
  return { slug: entry.slug, role: 'graph', label: rawName, num };
}

function parseProtocolBlock(block) {
  const headerM = block.match(/^(\d+)\.\s*Protocolo\s+(\d+)\s*[–-]\s*([^\n]+)/i);
  if (!headerM) throw new Error('Invalid protocol header');

  const order = parseInt(headerM[1], 10);
  const protoNum = parseInt(headerM[2], 10);
  const name = headerM[3].trim();

  const paraM = block.match(/Para quê:\s*([\s\S]*?)(?=\nPor que ativar:)/i);
  const whyM = block.match(/Por que ativar:\s*([\s\S]*?)(?=\nSímbolos Angelicais)/i);
  if (!paraM || !whyM) throw new Error(`Missing para/why in protocol ${order}`);

  const description = paraM[1].replace(/\s+/g, ' ').trim();
  const whyActivate = whyM[1].replace(/\s+/g, ' ').trim();

  const angels = [];
  const graphs = [];
  let section = null;

  for (const line of block.split('\n')) {
    if (/^Símbolos Angelicais/i.test(line)) section = 'angel';
    else if (/^Gráficos Radiônicos/i.test(line)) section = 'graph';
    else if (section && line.trim().startsWith('•')) {
      const m = line.match(/^\s*•\s*\((\d+)\)\s*(.+?)\s*$/);
      if (!m) continue;
      const num = parseInt(m[1], 10);
      const rawName = m[2].trim();
      const matched = section === 'angel' ? matchAngel(num, rawName) : matchGraph(num, rawName);
      if (!matched) throw new Error(`Unmatched ${section} (${num}) ${rawName} in protocol ${order}`);
      if (section === 'angel') angels.push(matched);
      else graphs.push(matched);
    }
  }

  if (angels.length !== 5 || graphs.length !== 3) {
    throw new Error(`Protocol ${order}: expected 5 angels + 3 graphs, got ${angels.length}+${graphs.length}`);
  }

  const angelInstructions = angels.map(a => `• (${a.num}) ${a.label}`).join('\n');
  const graphInstructions = graphs.map(g => `• (${g.num}) ${g.label}`).join('\n');

  return {
    order,
    protoNum,
    name,
    slug: protocolSlug(order, name),
    code: `P${String(order).padStart(2, '0')}`,
    description,
    whyActivate,
    angels,
    graphs,
    step1Instructions: angelInstructions,
    step2Instructions: graphInstructions,
  };
}

const text = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const blocks = text.split(/\n(?=\d+\.\s*Protocolo\s+\d+)/i).filter(b =>
  /^\d+\.\s*Protocolo\s+\d+/i.test(b.trim()),
);

if (blocks.length !== 28) {
  throw new Error(`Validation failed: expected 28 protocols, found ${blocks.length}`);
}

const protocols = blocks.map(parseProtocolBlock);

const protocolValues = protocols
  .map(
    p => `  (
    ${p.order},
    '${p.code}',
    '${p.slug}',
    ${dollarQuote(p.name)},
    ${dollarQuote(p.description)},
    ${dollarQuote(p.whyActivate)},
    ${p.protoNum}
  )`,
  )
  .join(',\n');

const assetRows = [];
for (const p of protocols) {
  let sort = 1;
  for (const a of p.angels) {
    assetRows.push(
      `('${p.slug}', '${a.slug}', '${a.role}', 'angel-set-49', ${sort}, ${a.num}, ${dollarQuote(a.label)})`,
    );
    sort += 1;
  }
  for (const g of p.graphs) {
    assetRows.push(
      `('${p.slug}', '${g.slug}', 'graph', 'graph-set-35', ${sort}, ${g.num}, ${dollarQuote(g.label)})`,
    );
    sort += 1;
  }
}

const stepValues = protocols
  .flatMap(p => [
    `  ('${p.slug}', 1, ${dollarQuote('Símbolos Angelicais')}, ${dollarQuote(p.step1Instructions)})`,
    `  ('${p.slug}', 2, ${dollarQuote('Gráficos Radiônicos')}, ${dollarQuote(p.step2Instructions)})`,
  ])
  .join(',\n');

const migration = `-- =============================================================================
-- RADIONICS — Phase V2.6E: Protocol import (28 Protocolos Especiais)
-- Source: ${SOURCE_REF} (${protocols.length} protocols, V2.6E validation passed)
-- Specialty: ${SPECIALTY_SLUG} (RLS visibility; links angel-set-49 + graph-set-35 assets)
-- Idempotent. No invented content.
-- =============================================================================

do $$
declare
  v_specialty_id uuid;
  v_protocol_count integer := ${protocols.length};
  v_protocols_upserted integer;
  v_assets_linked integer;
  v_steps_upserted integer;
  v_missing_assets integer;
begin
  select id into v_specialty_id
  from public.radionics_specialties
  where slug = '${SPECIALTY_SLUG}';

  if v_specialty_id is null then
    raise exception 'radionics_specialties slug ''${SPECIALTY_SLUG}'' is required.';
  end if;

  create temp table _v26e_protocols (
    sort_order integer not null,
    code text not null,
    slug text not null,
    name text not null,
    description text not null,
    why_activate text not null,
    source_protocol_num integer not null,
    primary key (slug)
  ) on commit drop;

  insert into _v26e_protocols (
    sort_order, code, slug, name, description, why_activate, source_protocol_num
  ) values
${protocolValues};

  create temp table _v26e_protocol_assets (
    protocol_slug text not null,
    asset_slug text not null,
    asset_role text not null,
    tool_slug text not null,
    sort_order integer not null,
    source_num integer not null,
    source_label text not null
  ) on commit drop;

  insert into _v26e_protocol_assets (
    protocol_slug, asset_slug, asset_role, tool_slug, sort_order, source_num, source_label
  ) values
${assetRows.join(',\n')};

  create temp table _v26e_protocol_steps (
    protocol_slug text not null,
    step_number integer not null,
    title text not null,
    instructions text not null,
    primary key (protocol_slug, step_number)
  ) on commit drop;

  insert into _v26e_protocol_steps (protocol_slug, step_number, title, instructions) values
${stepValues};

  -- -------------------------------------------------------------------------
  -- methodology_protocols
  -- -------------------------------------------------------------------------
  insert into public.methodology_protocols (
    specialty_id,
    code,
    name,
    slug,
    description,
    why_activate,
    source_name,
    source_type,
    source_reference,
    content_version,
    is_app_adapted,
    status,
    sort_order,
    metadata
  )
  select
    v_specialty_id,
    p.code,
    p.name,
    p.slug,
    p.description,
    p.why_activate,
    'Vanessa',
    'course_material',
    '${SOURCE_REF}',
    'v1',
    false,
    'active',
    p.sort_order,
    jsonb_build_object(
      'import_source', 'v2.6e',
      'source_protocol_num', p.source_protocol_num
    )
  from _v26e_protocols p
  on conflict (specialty_id, slug) do update set
    code = excluded.code,
    name = excluded.name,
    description = excluded.description,
    why_activate = excluded.why_activate,
    source_name = excluded.source_name,
    source_type = excluded.source_type,
    source_reference = excluded.source_reference,
    content_version = excluded.content_version,
    is_app_adapted = excluded.is_app_adapted,
    status = excluded.status,
    sort_order = excluded.sort_order,
    metadata = coalesce(public.methodology_protocols.metadata, '{}'::jsonb) || excluded.metadata,
    updated_at = now();

  get diagnostics v_protocols_upserted = row_count;

  -- -------------------------------------------------------------------------
  -- protocol_assets (replace links for imported protocols)
  -- -------------------------------------------------------------------------
  delete from public.protocol_assets pa
  using public.methodology_protocols mp
  where pa.protocol_id = mp.id
    and mp.specialty_id = v_specialty_id
    and mp.source_reference = '${SOURCE_REF}';

  insert into public.protocol_assets (
    protocol_id,
    asset_id,
    asset_role,
    sort_order,
    notes
  )
  select
    mp.id,
    ma.id,
    pa.asset_role,
    pa.sort_order,
    'source #' || pa.source_num::text || ' — ' || pa.source_label
  from _v26e_protocol_assets pa
  inner join public.methodology_protocols mp
    on mp.slug = pa.protocol_slug
    and mp.specialty_id = v_specialty_id
  inner join public.methodology_tools mt on mt.slug = pa.tool_slug
  inner join public.methodology_assets ma
    on ma.slug = pa.asset_slug
    and ma.tool_id = mt.id
    and ma.status = 'active';

  get diagnostics v_assets_linked = row_count;

  select count(*) into v_missing_assets
  from _v26e_protocol_assets pa
  where not exists (
    select 1
    from public.methodology_tools mt
    inner join public.methodology_assets ma
      on ma.tool_id = mt.id
      and ma.slug = pa.asset_slug
      and ma.status = 'active'
    where mt.slug = pa.tool_slug
  );

  if v_missing_assets > 0 then
    raise warning 'V2.6E: % protocol asset references could not be resolved to methodology_assets.', v_missing_assets;
  end if;

  -- -------------------------------------------------------------------------
  -- protocol_steps (2 steps per protocol: angels, then graphs)
  -- -------------------------------------------------------------------------
  insert into public.protocol_steps (
    protocol_id,
    step_number,
    title,
    instructions,
    source_name,
    source_type,
    source_reference,
    content_version,
    is_app_adapted,
    metadata
  )
  select
    mp.id,
    ps.step_number,
    ps.title,
    ps.instructions,
    'Vanessa',
    'course_material',
    '${SOURCE_REF}',
    'v1',
    false,
    jsonb_build_object('import_source', 'v2.6e')
  from _v26e_protocol_steps ps
  inner join public.methodology_protocols mp
    on mp.slug = ps.protocol_slug
    and mp.specialty_id = v_specialty_id
  on conflict (protocol_id, step_number) do update set
    title = excluded.title,
    instructions = excluded.instructions,
    source_name = excluded.source_name,
    source_type = excluded.source_type,
    source_reference = excluded.source_reference,
    content_version = excluded.content_version,
    is_app_adapted = excluded.is_app_adapted,
    metadata = coalesce(public.protocol_steps.metadata, '{}'::jsonb) || excluded.metadata,
    updated_at = now();

  get diagnostics v_steps_upserted = row_count;

  raise notice 'V2.6E protocol import complete.';
  raise notice '  protocols expected: %', v_protocol_count;
  raise notice '  methodology_protocols touched: %', v_protocols_upserted;
  raise notice '  protocol_assets linked: %', v_assets_linked;
  raise notice '  protocol_steps touched: %', v_steps_upserted;
  raise notice '  unresolved asset refs: %', v_missing_assets;

  if v_assets_linked <> v_protocol_count * 8 then
    raise warning
      'Expected % protocol_asset links; inserted %.',
      v_protocol_count * 8,
      v_assets_linked;
  end if;

end $$;
`;

fs.writeFileSync(outPath, migration, 'utf8');
console.log(`Wrote ${outPath}`);
console.log(`Protocols: ${protocols.length}, asset links: ${protocols.length * 8}, steps: ${protocols.length * 2}`);
