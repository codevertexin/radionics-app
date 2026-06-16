import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'docs/knowledge/vanessa/GRAFICOS MESA.txt');
const outPath = path.join(root, 'src/lib/methodology/mesa35GraphKnowledge.ts');

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

function parseBlock(block) {
  const titleM = block.match(/^\d+\.\s*([^\n]+)/);
  if (!titleM) throw new Error('No title');
  const title = titleM[1].trim();
  const body = block.slice(titleM[0].length).trim();
  const oQueIdx = body.indexOf('• O que é:');
  const clientIdx = body.indexOf('• O que informar ao cliente');
  const ativIdx = body.indexOf('Ativação do gráfico:');
  const therapist = body.slice(oQueIdx + '• O que é:'.length, clientIdx).trim();
  const client = body
    .slice(clientIdx, ativIdx)
    .replace(/^• O que informar ao cliente[^:]*:\s*/i, '')
    .trim();
  let activation = body.slice(ativIdx + 'Ativação do gráfico:'.length).trim();
  activation = activation.replace(/^["']|["']\s*$/g, '').trim();
  return { title, therapist, client, activation };
}

const rows = blocks.map((b, i) => ({ ...parseBlock(b), slug: SLUGS[i] }));
const lines = rows
  .map(
    r =>
      `  ${JSON.stringify(r.slug)}: { title: ${JSON.stringify(r.title)}, therapistExplanation: ${JSON.stringify(r.therapist)}, clientExplanation: ${JSON.stringify(r.client)}, activationText: ${JSON.stringify(r.activation)} },`,
  )
  .join('\n');

const out = `/** Auto-generated from docs/knowledge/vanessa/GRAFICOS MESA.txt — V2.6b parity */

export interface Mesa35GraphKnowledgeRow {
  title: string;
  therapistExplanation: string;
  clientExplanation: string;
  activationText: string;
}

export const MESA35_GRAPH_KNOWLEDGE: Record<string, Mesa35GraphKnowledgeRow> = {
${lines}
};
`;

fs.writeFileSync(outPath, out, 'utf8');
console.log(`Wrote ${rows.length} entries to ${outPath}`);
