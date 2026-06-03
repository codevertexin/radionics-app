import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = path.join(root, 'docs/knowledge/vanessa/Chakra.txt');

const EXPECTED = [
  {
    sort: 1,
    slug: 'chakra-basico',
    assetName: 'Chakra Básico',
    originalName: 'Muladhara',
    aliases: ['Chakra Raiz', 'Muladhara'],
  },
  {
    sort: 2,
    slug: 'chakra-sexual',
    assetName: 'Chakra Sexual',
    originalName: 'Swadhisthana',
    aliases: ['Chakra Sacral', 'Chakra Esplênico', 'Chakra Umbilical', 'Swadhisthana'],
  },
  {
    sort: 3,
    slug: 'chakra-plexo-solar',
    assetName: 'Chakra Plexo Solar',
    originalName: 'Manipura',
    aliases: ['Manipura'],
  },
  {
    sort: 4,
    slug: 'chakra-cardiaco',
    assetName: 'Chakra Cardíaco',
    originalName: 'Anahata',
    aliases: ['Anahata'],
  },
  {
    sort: 5,
    slug: 'chakra-laringeo',
    assetName: 'Chakra Laríngeo',
    originalName: 'Vishuddha',
    aliases: ['Vishuddha'],
  },
  {
    sort: 6,
    slug: 'chakra-frontal',
    assetName: 'Chakra Frontal',
    originalName: 'Ajna',
    aliases: ['Terceiro Olho', 'Ajna'],
  },
  {
    sort: 7,
    slug: 'chakra-coronario',
    assetName: 'Chakra Coronário',
    originalName: 'Sahasrara',
    aliases: ['Sahasrara'],
  },
];

const REQUIRED_SECTIONS = [
  'location',
  'function',
  'color',
  'element',
  'corresponding_organs',
  'imbalances',
  'how_to_balance',
  'activation',
];

function extractField(body, label) {
  const re = new RegExp(`•\\s*${label}:\\s*([\\s\\S]*?)(?=\\n•\\s*|\\nAtivação:|$)`, 'i');
  const m = body.match(re);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function parseChakraBlock(block, expected) {
  const headerM = block.match(/^(\d+)º\s*Chakra:\s*([^\n(]+)(?:\(([^)]+)\))?/i);
  if (!headerM) throw new Error(`Invalid header in block for ${expected.slug}`);

  const sanskrit = headerM[3]?.trim() || null;
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
  const activation = ativM ? ativM[1].replace(/^["']|["']$/g, '').trim() : null;

  const missing = REQUIRED_SECTIONS.filter(k => {
    if (k === 'activation') return !activation;
    return !fields[k];
  });

  const aliasesFromHeader = [];
  const headerTitle = headerM[2].trim();
  if (headerTitle.includes('ou')) {
    headerTitle.split(/,| ou /i).forEach(part => {
      const p = part.trim();
      if (p && p !== expected.assetName.replace(/^Chakra\s+/i, '')) {
        aliasesFromHeader.push(p);
      }
    });
  }

  return {
    sort: parseInt(headerM[1], 10),
    slug: expected.slug,
    assetName: expected.assetName,
    originalName: sanskrit || expected.originalName,
    aliases: expected.aliases,
    headerTitle,
    ...fields,
    activation,
    missingSections: missing,
  };
}

const text = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const blocks = text.split(/\n(?=\d+º\s*Chakra:)/i).filter(b => /^\d+º\s*Chakra:/i.test(b.trim()));

const entries = blocks.map((b, i) => parseChakraBlock(b, EXPECTED[i]));

console.log('=== PHASE 0 — Chakra.txt Validation ===\n');
console.log('1. Total chakra entries:', entries.length);
console.log('2. Names found:');
entries.forEach(e => console.log(`   ${e.sort}. ${e.assetName} (${e.slug})`));
console.log('3. Sanskrit names:');
entries.forEach(e => console.log(`   ${e.slug}: ${e.originalName}`));
console.log('4. Aliases (planned):');
entries.forEach(e => console.log(`   ${e.slug}: ${e.aliases.join(', ')}`));
console.log('5. Missing sections per chakra:');
let hasMissing = false;
entries.forEach(e => {
  if (e.missingSections.length) {
    hasMissing = true;
    console.log(`   ${e.slug}: ${e.missingSections.join(', ')}`);
  }
});
if (!hasMissing) console.log('   (none)');
console.log('6. Unmatched assets:');
const unmatched = entries.filter((e, i) => e.sort !== EXPECTED[i].sort || e.slug !== EXPECTED[i].slug);
if (unmatched.length) {
  console.log('   ', unmatched.map(e => e.slug).join(', '));
} else {
  console.log('   (none — all 7 slugs match V2.5C)');
}

const ok =
  entries.length === 7 &&
  !hasMissing &&
  unmatched.length === 0 &&
  entries.every((e, i) => e.originalName === EXPECTED[i].originalName);

if (!ok) {
  console.error('\nVALIDATION FAILED');
  process.exit(1);
}

console.log('\nVALIDATION PASSED — safe to generate migration.');
export { entries, EXPECTED };
