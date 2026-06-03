import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = path.join(root, 'docs/knowledge/vanessa/ANJOs.txt');

/** Legacy radionics_tools codes by sort_order 1..49 (V2.5B parity) */
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

function parseBlock(block) {
  const titleM = block.match(/^\d+\.\s*([^\n]+)/);
  if (!titleM) throw new Error('No title');
  const sort = parseInt(block.match(/^(\d+)\./)[1], 10);
  const title = titleM[1].trim();
  const body = block.slice(titleM[0].length).trim();
  const ativM = body.match(/Ativação\s*-\s*gráfico:\s*["']?([\s\S]+?)["']?\s*$/i);
  if (!ativM) throw new Error(`No activation in entry ${sort}: ${title}`);
  const activation = ativM[1].trim().replace(/^["']|["']$/g, '');
  return { sort, title, activation };
}

const text = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const blocks = text.split(/\n(?=\d+\.\s)/).filter(b => /^\d+\./.test(b.trim()));
const entries = blocks.map(parseBlock);

const angels = entries.filter(e => LEGACY_BY_SORT[e.sort - 1]?.category === 'angel');
const archangels = entries.filter(e => LEGACY_BY_SORT[e.sort - 1]?.category === 'archangel');

const titleCounts = {};
for (const e of entries) {
  const key = e.title.toUpperCase();
  titleCounts[key] = (titleCounts[key] || 0) + 1;
}
const duplicates = Object.entries(titleCounts).filter(([, c]) => c > 1);

const preview = entries.map(e => {
  const legacy = LEGACY_BY_SORT[e.sort - 1];
  if (!legacy) return { ...e, slug: null, category: null, match: false };
  return {
    sort: e.sort,
    title: e.title,
    slug: codeToSlug(legacy.code),
    category: legacy.category,
    code: legacy.code,
    match: true,
  };
});

const unmatched = preview.filter(p => !p.match || p.sort !== LEGACY_BY_SORT.find(l => l.code === p.code)?.sort);

let ok = true;
const errors = [];

if (entries.length !== 49) {
  ok = false;
  errors.push(`Total entries: expected 49, found ${entries.length}`);
}
if (angels.length !== 42) {
  ok = false;
  errors.push(`Angels: expected 42, found ${angels.length}`);
}
if (archangels.length !== 7) {
  ok = false;
  errors.push(`Archangels: expected 7, found ${archangels.length}`);
}
if (duplicates.length > 0) {
  ok = false;
  errors.push(`Duplicate titles: ${duplicates.map(([t]) => t).join(', ')}`);
}

for (const e of entries) {
  if (e.sort < 1 || e.sort > 49 || !LEGACY_BY_SORT[e.sort - 1]) {
    ok = false;
    errors.push(`Invalid sort ${e.sort} for ${e.title}`);
  }
}

console.log('=== PHASE 0 — ANJOs.txt Validation ===\n');
console.log('1. Total entries:', entries.length);
console.log('2. Angels:', angels.length);
console.log('3. Archangels:', archangels.length);
console.log('4. Duplicated names:', duplicates.length ? duplicates.map(([t, c]) => `${t} (${c}x)`).join('; ') : '(none)');
console.log('5. Unmatched assets:', unmatched.length ? unmatched.map(u => u.sort).join(', ') : '(none — mapped by sort_order)');
console.log('\n6. Asset slug mapping preview (first 10 / archangels / last 5):');
const show = [...preview.slice(0, 10), ...preview.filter(p => p.category === 'archangel'), ...preview.slice(-5)];
for (const p of show) {
  console.log(`  ${String(p.sort).padStart(2)} | ${p.category?.padEnd(10) || '?'} | ${p.slug} | ${p.title}`);
}

if (!ok) {
  console.error('\nVALIDATION FAILED:\n', errors.join('\n'));
  process.exit(1);
}

console.log('\nVALIDATION PASSED — safe to generate migration.');
export { entries, LEGACY_BY_SORT, codeToSlug, preview };
