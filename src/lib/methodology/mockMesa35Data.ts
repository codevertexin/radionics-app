/**
 * Mock Methodology Engine data — parity with V2.2 Supabase seed for mesa-35.
 */

import { HAWKINS_LEVELS, SPECIALTIES, TOOLS_RAD35 } from '@/data/mock-data';
import type {
  MethodologyAsset,
  MethodologyAssetMedia,
  MethodologyTool,
  SpecialtyAssetContent,
  SpecialtyToolLink,
} from '@/types';

const NOW = '2024-01-01T00:00:00.000Z';

const MOCK_TOOL_GRAPH_ID = 'mock-tool-graph-set-35';
const MOCK_TOOL_HAWKINS_ID = 'mock-tool-hawkins-scale';
const MOCK_TOOL_CHAKRA_ID = 'mock-tool-chakra-set';
const MOCK_SPECIALTY_ID = 'spec-rad35';

const TOOL_CODE_TO_ASSET_SLUG: Record<string, string> = {
  anti_magia: 'anti-magia',
  luxor: 'luxor',
  anti_possessao: 'anti-possessao',
  desobsessao: 'desobsessao',
  prosperidade: 'prosperidade',
  amor: 'amor',
  saude: 'saude',
  karma: 'karma',
};

const GRAPH_BASE_DESCRIPTIONS: Record<string, string> = {
  'anti-magia':
    'Gráfico radiônico utilizado para neutralização de influências energéticas externas, magia, inveja, ataques espirituais e padrões vibracionais dissonantes.',
  luxor:
    'Gráfico radiônico associado à elevação vibracional, alinhamento espiritual, clareza, proteção e ligação a frequências superiores.',
  'anti-possessao':
    'Gráfico radiônico utilizado em trabalhos de desobsessão, libertação de interferências espirituais e limpeza energética profunda.',
  desobsessao:
    'Gráfico radiônico orientado para limpeza, libertação espiritual e harmonização de campos afetados por obsessões ou interferências externas.',
  prosperidade:
    'Gráfico radiônico associado à abertura de caminhos, desbloqueio financeiro, abundância e expansão de possibilidades materiais.',
  amor:
    'Gráfico radiônico usado para harmonização afetiva, cura emocional, reconciliação interna e equilíbrio nos relacionamentos.',
  saude:
    'Gráfico radiônico associado ao apoio vibracional à saúde, equilíbrio energético e harmonização dos corpos físico, emocional e espiritual.',
  karma:
    'Gráfico radiônico utilizado para harmonização de padrões kármicos, libertação de repetições, vínculos e memórias energéticas.',
};

const GRAPH_CLIENT_EXPLANATIONS: Record<string, string> = {
  'anti-magia': 'Apoio à proteção energética e neutralização de influências externas desfavoráveis.',
  luxor: 'Elevação do campo vibracional e maior clareza interior.',
  'anti-possessao': 'Limpeza profunda e libertação de interferências no campo energético.',
  desobsessao: 'Harmonização de padrões repetitivos e libertação espiritual.',
  prosperidade: 'Abertura de caminhos e equilíbrio na área material e profissional.',
  amor: 'Harmonização afetiva e cura das relações com compaixão.',
  saude: 'Apoio vibracional ao bem-estar físico e à vitalidade.',
  karma: 'Integração e suavização de padrões que se repetem na vida.',
};

const GRAPH_RECOMMENDED_USE: Record<string, string> = {
  'anti-magia': 'Diagnóstico e harmonização quando há sensação de ataque, inveja ou bloqueio inexplicável.',
  luxor: 'Reforço energético em fases de baixa vitalidade ou desalinhamento.',
  'anti-possessao': 'Trabalho de desobsessão e restabelecimento da autonomia energética.',
  desobsessao: 'Quando há pensamentos ou comportamentos repetitivos difíceis de integrar.',
  prosperidade: 'Sessões focadas em abundância, oportunidades e desbloqueio financeiro.',
  amor: 'Trabalho emocional em relacionamentos, autoestima e abertura do coração.',
  saude: 'Reequilíbrio energético associado a saúde, recuperação e cuidado do corpo.',
  karma: 'Quando há ciclos familiares ou situações que parecem repetir-se sem causa aparente.',
};

function hawkinsSlug(value: number, label: string): string {
  const norm = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return `hawkins-${value}-${norm}`;
}

export const MOCK_MESA35_TOOLS: MethodologyTool[] = [
  {
    id: MOCK_TOOL_GRAPH_ID,
    name: '35 Gráficos',
    slug: 'graph-set-35',
    description: 'Conjunto de 35 gráficos radiônicos para diagnóstico e harmonização.',
    toolType: 'graph_set',
    usageMode: 'mixed',
    status: 'active',
    sortOrder: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: MOCK_TOOL_HAWKINS_ID,
    name: 'Escala de Hawkins',
    slug: 'hawkins-scale',
    description: 'Escala de consciência de David R. Hawkins para medição vibracional.',
    toolType: 'hawkins_scale',
    usageMode: 'measurement',
    status: 'active',
    sortOrder: 20,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: MOCK_TOOL_CHAKRA_ID,
    name: 'Chakras',
    slug: 'chakra-set',
    description: 'Conjunto de chakras para análise e equilíbrio energético.',
    toolType: 'chakra_set',
    usageMode: 'analysis',
    status: 'active',
    sortOrder: 30,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const MOCK_MESA35_GRAPH_ASSETS: MethodologyAsset[] = TOOLS_RAD35.map((t, i) => {
  const slug = TOOL_CODE_TO_ASSET_SLUG[t.code] ?? t.code.replace(/_/g, '-');
  return {
    id: `mock-asset-${slug}`,
    toolId: MOCK_TOOL_GRAPH_ID,
    name: t.name,
    slug,
    code: `g0${i + 1}`,
    canonicalName: t.name,
    aliases: [],
    assetType: 'graph' as const,
    usageMode: 'activation' as const,
    baseDescription: GRAPH_BASE_DESCRIPTIONS[slug] ?? t.description,
    imageUrl: t.imageUrl,
    metadata: {},
    status: 'active' as const,
    sortOrder: t.sortOrder,
    createdAt: NOW,
    updatedAt: NOW,
  };
});

export const MOCK_MESA35_HAWKINS_ASSETS: MethodologyAsset[] = HAWKINS_LEVELS.map(h => ({
  id: `mock-asset-${hawkinsSlug(h.value, h.label)}`,
  toolId: MOCK_TOOL_HAWKINS_ID,
  name: `${h.value} ${h.label}`,
  slug: hawkinsSlug(h.value, h.label),
  code: String(h.value),
  canonicalName: `${h.value} ${h.label}`,
  aliases: [],
  assetType: 'hawkins_level' as const,
  usageMode: 'measurement' as const,
  baseDescription: h.description,
  metadata: { color: h.color, bgColor: h.bgColor },
  status: 'active' as const,
  sortOrder: h.value,
  createdAt: NOW,
  updatedAt: NOW,
}));

export const MOCK_CHAKRA_ASSETS: MethodologyAsset[] = [
  {
    id: 'mock-asset-chakra-basico',
    toolId: MOCK_TOOL_CHAKRA_ID,
    name: 'Chakra Básico',
    slug: 'chakra-basico',
    canonicalName: 'Chakra Básico',
    originalName: 'Muladhara',
    aliases: ['Chakra Raiz', 'Muladhara'],
    assetType: 'chakra',
    usageMode: 'activation',
    baseDescription: 'Chakra da base da coluna — segurança, sobrevivência e enraizamento.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    metadata: { color: 'Vermelho', element: 'Terra', location: 'Base da coluna' },
    status: 'active',
    sortOrder: 1,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'mock-asset-chakra-frontal',
    toolId: MOCK_TOOL_CHAKRA_ID,
    name: 'Chakra Frontal',
    slug: 'chakra-frontal',
    canonicalName: 'Chakra Frontal',
    originalName: 'Ajna',
    aliases: ['Terceiro Olho', 'Ajna'],
    assetType: 'chakra',
    usageMode: 'activation',
    baseDescription: 'Chakra do terceiro olho — intuição, visão interior e clareza mental.',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80',
    metadata: { color: 'Índigo', element: 'Luz', location: 'Entre as sobrancelhas' },
    status: 'active',
    sortOrder: 6,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const MOCK_CHAKRA_CONTENT: SpecialtyAssetContent[] = MOCK_CHAKRA_ASSETS.map(asset => ({
  id: `mock-sac-${asset.slug}`,
  specialtyId: MOCK_SPECIALTY_ID,
  assetId: asset.id,
  title: asset.name,
  therapistExplanation: asset.baseDescription,
  clientExplanation: `Equilíbrio do ${asset.name.toLowerCase()} para maior harmonia energética.`,
  activationText: `Visualize luz ${(asset.metadata.color as string)?.toLowerCase() ?? 'dourada'} no centro ${asset.originalName ?? asset.name}.`,
  recommendedUse: 'Quando há desequilíbrio energético neste centro.',
  metadata: asset.metadata,
  sortOrder: asset.sortOrder,
  createdAt: NOW,
  updatedAt: NOW,
}));

export const MOCK_MESA35_SPECIALTY_TOOLS: SpecialtyToolLink[] = [
  {
    id: 'mock-st-graph',
    specialtyId: MOCK_SPECIALTY_ID,
    toolId: MOCK_TOOL_GRAPH_ID,
    isRequired: true,
    isVisibleInWorkspace: true,
    sortOrder: 1,
    createdAt: NOW,
    updatedAt: NOW,
    tool: MOCK_MESA35_TOOLS[0],
  },
  {
    id: 'mock-st-hawkins',
    specialtyId: MOCK_SPECIALTY_ID,
    toolId: MOCK_TOOL_HAWKINS_ID,
    isRequired: true,
    isVisibleInWorkspace: true,
    sortOrder: 2,
    createdAt: NOW,
    updatedAt: NOW,
    tool: MOCK_MESA35_TOOLS[1],
  },
  {
    id: 'mock-st-chakra',
    specialtyId: MOCK_SPECIALTY_ID,
    toolId: MOCK_TOOL_CHAKRA_ID,
    isRequired: false,
    isVisibleInWorkspace: true,
    sortOrder: 3,
    createdAt: NOW,
    updatedAt: NOW,
    tool: MOCK_MESA35_TOOLS[2],
  },
];

export const MOCK_MESA35_ASSET_CONTENT: SpecialtyAssetContent[] = MOCK_MESA35_GRAPH_ASSETS.map(
  asset => ({
    id: `mock-sac-${asset.slug}`,
    specialtyId: MOCK_SPECIALTY_ID,
    assetId: asset.id,
    title: asset.name,
    therapistExplanation: asset.baseDescription,
    clientExplanation: GRAPH_CLIENT_EXPLANATIONS[asset.slug],
    recommendedUse: GRAPH_RECOMMENDED_USE[asset.slug],
    metadata: {},
    sortOrder: asset.sortOrder,
    createdAt: NOW,
    updatedAt: NOW,
  }),
);

export function getMockMesa35Context() {
  const spec = SPECIALTIES.find(s => s.slug === 'mesa-35');
  return {
    specialtyId: spec?.id ?? MOCK_SPECIALTY_ID,
    specialtySlug: 'mesa-35',
    specialtyName: spec?.name ?? 'Mesa 35',
  };
}

export function getMockMesa35Tools(): SpecialtyToolLink[] {
  return MOCK_MESA35_SPECIALTY_TOOLS.map(row => ({
    ...row,
    tool: { ...row.tool },
  }));
}

export function getMockMesa35Assets(): MethodologyAsset[] {
  return [...MOCK_MESA35_GRAPH_ASSETS, ...MOCK_MESA35_HAWKINS_ASSETS, ...MOCK_CHAKRA_ASSETS].map(a => ({ ...a }));
}

export function getMockMesa35AssetContent(): SpecialtyAssetContent[] {
  return [...MOCK_MESA35_ASSET_CONTENT, ...MOCK_CHAKRA_CONTENT].map(c => ({ ...c }));
}

/** V2.4 — no seeded media URLs in mock (parity with empty Supabase table). */
export function getMockMesa35AssetMedia(): MethodologyAssetMedia[] {
  return [];
}
