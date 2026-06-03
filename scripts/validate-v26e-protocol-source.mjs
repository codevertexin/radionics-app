/**
 * V2.6E Phase 0 — Protocol source validation (read-only)
 * Run: node scripts/validate-v26e-protocol-source.mjs
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = path.join(root, 'docs/knowledge/vanessa/28 PROTOCOLOS ESPECIAIS.txt');

// V2.5A graph import order (sort_order → slug, display)
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

// V2.5B angel/archangel order (sort_order → slug, type, labels)
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

const CHAKRAS_BY_SLUG = {
  'chakra-basico': 'Chakra Básico',
  'chakra-sexual': 'Chakra Sexual',
  'chakra-plexo-solar': 'Chakra Plexo Solar',
  'chakra-cardiaco': 'Chakra Cardíaco',
  'chakra-laringeo': 'Chakra Laríngeo',
  'chakra-frontal': 'Chakra Frontal',
  'chakra-coronario': 'Chakra Coronário',
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

function parseRefLine(line, section) {
  const m = line.match(/^\s*•\s*\((\d+)\)\s*(.+?)\s*$/);
  if (!m) return null;
  return { num: parseInt(m[1], 10), rawName: m[2].trim(), section };
}

function matchAngel(num, rawName) {
  const entry = ANGELS_BY_NUM[num];
  if (!entry) return { matched: false, reason: `number ${num} out of angel range 1-49` };
  const n = norm(rawName);
  const isArch = n.includes('arcanjo');
  if (entry.type === 'archangel' && !isArch && !entry.labels.some(l => n.includes(l))) {
    // short names like "Perdão" without Anjo prefix
  }
  if (entry.type === 'angel' && isArch) {
    return { matched: false, reason: 'numbered as angel but text says arcanjo', expected: entry.slug };
  }
  if (entry.type === 'archangel' && !isArch) {
    // OK for short archangel refs? e.g. only number with name Raziel - check labels
    if (!entry.labels.some(l => n.includes(l))) {
      // short form Perdão at 44 is angel not archangel - handled by type
    }
  }
  const labelOk =
    entry.labels.some(l => n.includes(l)) ||
    n.includes(norm(entry.slug.replace(/^(angel|archangel)-/, '').replace(/-/g, ' ')));
  if (!labelOk && !isArch && entry.type === 'archangel') {
    return { matched: false, reason: `name "${rawName}" does not match ${entry.slug}`, expected: entry.slug };
  }
  return { matched: true, slug: entry.slug, type: entry.type, assetSet: 'angel-set-49' };
}

function matchGraph(num, rawName) {
  const entry = GRAPHS_BY_NUM[num];
  if (!entry) return { matched: false, reason: `number ${num} out of graph range 1-35` };
  const n = norm(rawName);
  const nameNorm = norm(entry.name);
  const slugWords = entry.slug.replace(/-/g, ' ');
  const ok =
    n.includes(slugWords.split(' ')[0]) ||
    nameNorm.split(' ').some(w => w.length > 3 && n.includes(w)) ||
    (num === 22 && (n === 'scap' || n.includes('scap'))) ||
    (num === 25 && (n.includes('metatron') || n.includes('metraton'))) ||
    (num === 26 && n.includes('desembaracador')) ||
    (num === 29 && n.includes('piramide') && n.includes('tao'));
  if (!ok) {
    return { matched: false, reason: `name "${rawName}" weak match for ${entry.slug}`, expected: entry.slug };
  }
  return { matched: true, slug: entry.slug, type: 'graph', assetSet: 'graph-set-35' };
}

function detectChakraMention(text) {
  const mentions = [];
  const n = norm(text);
  for (const [slug, name] of Object.entries(CHAKRAS_BY_SLUG)) {
    if (n.includes(norm(name)) || n.includes(slug.replace('chakra-', ''))) {
      mentions.push({ slug, name, asAssetRef: false });
    }
  }
  if (n.includes('chakra laringeo') || n.includes('chakra laríngeo')) {
    mentions.push({ slug: 'chakra-laringeo', name: 'Chakra Laríngeo', asAssetRef: false, note: 'narrative only' });
  }
  return mentions;
}

const text = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const blocks = text.split(/\n(?=\d+\.\s*Protocolo\s+\d+)/i).filter(b =>
  /^\d+\.\s*Protocolo\s+\d+/i.test(b.trim()),
);

if (blocks.length !== 28) {
  console.error(`Expected 28 protocols, found ${blocks.length}`);
  process.exit(1);
}

const protocols = [];
const allRefs = [];
const assetRefCounts = new Map();

for (const block of blocks) {
  const headerM = block.match(/^(\d+)\.\s*Protocolo\s+(\d+)\s*[–-]\s*([^\n]+)/i);
  if (!headerM) continue;

  const order = parseInt(headerM[1], 10);
  const protoNum = parseInt(headerM[2], 10);
  const name = headerM[3].trim();

  let section = null;
  const angels = [];
  const archangels = [];
  const graphs = [];
  const missing = [];
  const lines = block.split('\n');

  for (const line of lines) {
    if (/^Símbolos Angelicais/i.test(line)) section = 'angel';
    else if (/^Gráficos Radiônicos/i.test(line)) section = 'graph';
    else if (section && line.trim().startsWith('•')) {
      const ref = parseRefLine(line, section);
      if (!ref) continue;
      allRefs.push({ protocol: order, ...ref });

      let result;
      if (section === 'angel') {
        result = matchAngel(ref.num, ref.rawName);
        if (result.matched) {
          if (result.type === 'archangel') archangels.push({ num: ref.num, name: ref.rawName, slug: result.slug });
          else angels.push({ num: ref.num, name: ref.rawName, slug: result.slug });
          assetRefCounts.set(result.slug, (assetRefCounts.get(result.slug) || 0) + 1);
        } else missing.push({ section: 'angel', ...ref, ...result });
      } else {
        result = matchGraph(ref.num, ref.rawName);
        if (result.matched) {
          graphs.push({ num: ref.num, name: ref.rawName, slug: result.slug });
          assetRefCounts.set(result.slug, (assetRefCounts.get(result.slug) || 0) + 1);
        } else missing.push({ section: 'graph', ...ref, ...result });
      }
    }
  }

  const chakraMentions = detectChakraMention(block);

  protocols.push({
    order,
    protoNum,
    name,
    angels,
    archangels,
    graphs,
    missing,
    chakraMentions,
  });
}

const matchedRefs = allRefs.length - protocols.reduce((s, p) => s + p.missing.length, 0);
const unmatchedRefs = protocols.reduce((s, p) => s + p.missing.length, 0);
const repeatedAssets = [...assetRefCounts.entries()]
  .filter(([, c]) => c > 1)
  .sort((a, b) => b[1] - a[1]);

const uniqueAngels = new Set();
const uniqueArchangels = new Set();
const uniqueGraphs = new Set();
protocols.forEach(p => {
  p.angels.forEach(a => uniqueAngels.add(a.slug));
  p.archangels.forEach(a => uniqueArchangels.add(a.slug));
  p.graphs.forEach(g => uniqueGraphs.add(g.slug));
});

console.log(JSON.stringify({
  protocol_count: protocols.length,
  total_asset_references: allRefs.length,
  matched_references: matchedRefs,
  unmatched_references: unmatchedRefs,
  unique_angels: uniqueAngels.size,
  unique_archangels: uniqueArchangels.size,
  unique_graphs: uniqueGraphs.size,
  repeated_asset_count: repeatedAssets.length,
  protocols: protocols.map(p => ({
    order: p.order,
    name: p.name,
    angels_matched: p.angels.map(a => a.slug),
    archangels_matched: p.archangels.map(a => a.slug),
    graphs_matched: p.graphs.map(a => a.slug),
    missing: p.missing,
    chakra_mentions: p.chakraMentions,
  })),
  repeated_assets: repeatedAssets.map(([slug, count]) => ({ slug, count })),
  validation_passed: unmatchedRefs === 0 && protocols.length === 28,
}, null, 2));
