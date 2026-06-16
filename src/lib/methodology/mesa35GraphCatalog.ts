/**
 * Catálogo dos 35 gráficos Mesa 35 — paridade com V2.6b graph knowledge import.
 */

export interface Mesa35GraphCatalogEntry {
  slug: string;
  name: string;
  sortOrder: number;
}

/** Ordem e slugs alinhados com scripts/generate-v26b-graph-knowledge.mjs */
export const MESA35_GRAPH_CATALOG: Mesa35GraphCatalogEntry[] = [
  { slug: 'anti-possessao', name: 'Anti-Possessão', sortOrder: 1 },
  { slug: 'triturador', name: 'Triturador', sortOrder: 2 },
  { slug: 'yoshua', name: 'Yoshua', sortOrder: 3 },
  { slug: 'luxor', name: 'Luxor', sortOrder: 4 },
  { slug: 'quadrata', name: 'Quadrata', sortOrder: 5 },
  { slug: 'anti-depressao', name: 'Anti-Depressão', sortOrder: 6 },
  { slug: 'magnetismo-curativo', name: 'Magnetismo Curativo', sortOrder: 7 },
  { slug: 'turbilhao-jupiter', name: 'Turbilhão de Júpiter', sortOrder: 8 },
  { slug: 'saude-financeira', name: 'Saúde Financeira', sortOrder: 9 },
  { slug: 'piramide-plana-om', name: 'Pirâmide Plana OM', sortOrder: 10 },
  { slug: 'dissipador', name: 'Dissipador', sortOrder: 11 },
  { slug: 'desimpregnador', name: 'Desimpregnador', sortOrder: 12 },
  { slug: 'justica-divina', name: 'Justiça Divina', sortOrder: 13 },
  { slug: 'sol-da-vida', name: 'Sol da Vida', sortOrder: 14 },
  { slug: 'energizador', name: 'Energizador', sortOrder: 15 },
  { slug: 'anti-dor', name: 'Anti-Dor', sortOrder: 16 },
  { slug: 'anti-magia', name: 'Anti Magia', sortOrder: 17 },
  { slug: 'iave-sete-circulos', name: 'Iave Sete Círculos', sortOrder: 18 },
  { slug: 'mesa-damien', name: 'Mesa Damien', sortOrder: 19 },
  { slug: 'heptapentagrama', name: 'Heptapentagrama', sortOrder: 20 },
  { slug: 'revitalizador-chakras', name: 'Revitalizador de Chakras', sortOrder: 21 },
  { slug: 'scap-cabalista', name: 'SCAP Cabalista', sortOrder: 22 },
  { slug: 'quadrado-magico', name: 'Quadrado Mágico', sortOrder: 23 },
  { slug: 'sorte-sucesso', name: 'Sorte e Sucesso', sortOrder: 24 },
  { slug: 'cubo-metatron', name: 'Cubo de Metatron', sortOrder: 25 },
  { slug: 'desembaracador-relacionamentos', name: 'Desembaraçador de Relacionamentos', sortOrder: 26 },
  { slug: 'prosperador', name: 'Prosperador', sortOrder: 27 },
  { slug: 'antakarana', name: 'Antakarana', sortOrder: 28 },
  { slug: 'piramide-tao', name: 'Pirâmide Tao', sortOrder: 29 },
  { slug: 'hexagrama', name: 'Hexagrama', sortOrder: 30 },
  { slug: 'turbilhao-prosperador', name: 'Turbilhão Prosperador', sortOrder: 31 },
  { slug: 'kit-cromo', name: 'Kit Cromo', sortOrder: 32 },
  { slug: 'alta-vitalidade', name: 'Alta Vitalidade', sortOrder: 33 },
  { slug: 'cruz-ansata', name: 'Cruz Ansata', sortOrder: 34 },
  { slug: 'vesica-piscis', name: 'Vésica Piscis', sortOrder: 35 },
];
