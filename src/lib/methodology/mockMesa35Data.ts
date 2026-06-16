/**
 * Mock Methodology Engine data — paridade Supabase V2.5A/V2.6B para mesa-35.
 */

import { HAWKINS_LEVELS, SPECIALTIES } from '@/data/mock-data';
import { MESA35_GRAPH_CATALOG } from '@/lib/methodology/mesa35GraphCatalog';
import { MESA35_GRAPH_KNOWLEDGE } from '@/lib/methodology/mesa35GraphKnowledge';
import { mesa35GraphCdnImageUrl } from '@/lib/methodology/mesa35GraphMedia';
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

const CHAKRA_CDN: Record<string, string> = {
  'chakra-basico': 'https://radionics.b-cdn.net/tools/map_outros/chakras/Basico.png',
  'chakra-frontal': 'https://radionics.b-cdn.net/tools/map_outros/chakras/Frontal.png',
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

export const MOCK_MESA35_GRAPH_ASSETS: MethodologyAsset[] = MESA35_GRAPH_CATALOG.map(entry => {
  const knowledge = MESA35_GRAPH_KNOWLEDGE[entry.slug];
  const imageUrl = mesa35GraphCdnImageUrl(entry.slug);
  const name = knowledge?.title ?? entry.name;

  return {
    id: `mock-asset-${entry.slug}`,
    toolId: MOCK_TOOL_GRAPH_ID,
    name,
    slug: entry.slug,
    code: `g${String(entry.sortOrder).padStart(2, '0')}`,
    canonicalName: name,
    aliases: [],
    assetType: 'graph' as const,
    usageMode: 'activation' as const,
    baseDescription: knowledge?.therapistExplanation ?? '',
    imageUrl,
    metadata: { import_source: 'v2.5a-mock' },
    status: 'active' as const,
    sortOrder: entry.sortOrder,
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
    imageUrl: CHAKRA_CDN['chakra-basico'],
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
    imageUrl: CHAKRA_CDN['chakra-frontal'],
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
  asset => {
    const knowledge = MESA35_GRAPH_KNOWLEDGE[asset.slug];
    return {
      id: `mock-sac-${asset.slug}`,
      specialtyId: MOCK_SPECIALTY_ID,
      assetId: asset.id,
      title: asset.name,
      therapistExplanation: knowledge?.therapistExplanation ?? asset.baseDescription ?? '',
      clientExplanation: knowledge?.clientExplanation ?? '',
      activationText: knowledge?.activationText,
      recommendedUse: knowledge?.clientExplanation ?? '',
      metadata: { import_source: 'v2.6b-mock' },
      sortOrder: asset.sortOrder,
      createdAt: NOW,
      updatedAt: NOW,
    };
  },
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

/** Media primária Bunny — paridade V2.5A para resolução igual à Resources. */
export function getMockMesa35AssetMedia(): MethodologyAssetMedia[] {
  const { specialtyId } = getMockMesa35Context();
  const graphMedia = MOCK_MESA35_GRAPH_ASSETS.map(asset => ({
    id: `mock-mam-${asset.slug}`,
    specialtyId,
    assetId: asset.id,
    toolId: MOCK_TOOL_GRAPH_ID,
    mediaType: 'image' as const,
    url: asset.imageUrl ?? '',
    storageProvider: 'bunny' as const,
    sourceType: 'teacher_original' as const,
    sourceName: 'radionics_tools',
    altText: asset.name,
    qualityStatus: 'approved' as const,
    isPrimary: true,
    metadata: { import_source: 'v2.5a-mock' },
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const chakraMedia = MOCK_CHAKRA_ASSETS.filter(a => a.imageUrl).map(asset => ({
    id: `mock-mam-${asset.slug}`,
    specialtyId,
    assetId: asset.id,
    toolId: MOCK_TOOL_CHAKRA_ID,
    mediaType: 'image' as const,
    url: asset.imageUrl ?? '',
    storageProvider: 'bunny' as const,
    sourceType: 'teacher_original' as const,
    sourceName: 'v2.5c-chakra-seed',
    altText: asset.name,
    qualityStatus: 'approved' as const,
    isPrimary: true,
    metadata: {},
    createdAt: NOW,
    updatedAt: NOW,
  }));

  return [...graphMedia, ...chakraMedia];
}
