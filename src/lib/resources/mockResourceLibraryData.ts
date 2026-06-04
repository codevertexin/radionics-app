/**
 * Mock Resources data — mesa-35 chakras, mesa-49 sample protocol, activation scripts.
 */

import type {
  ActivationScriptResource,
  MethodologyAsset,
  MethodologyProtocol,
  MethodologyProtocolDetail,
  SpecialtyAssetContent,
} from '@/types';

const NOW = '2024-01-01T00:00:00.000Z';
const MOCK_SPECIALTY_MESA35 = 'spec-rad35';
const MOCK_SPECIALTY_MESA49 = 'spec-rad49';

export const MOCK_CHAKRA_ASSETS: MethodologyAsset[] = [
  {
    id: 'mock-asset-chakra-basico',
    toolId: 'mock-tool-chakra-set',
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
    toolId: 'mock-tool-chakra-set',
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
  specialtyId: MOCK_SPECIALTY_MESA35,
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

export const MOCK_MESA49_PROTOCOL: MethodologyProtocolDetail = {
  id: 'mock-protocol-prosperidade',
  specialtyId: MOCK_SPECIALTY_MESA49,
  code: 'P05',
  name: 'Prosperidade e Abundância',
  slug: 'protocolo-05-prosperidade-e-abundancia',
  description:
    'Ativar o fluxo da prosperidade e romper com padrões vibracionais de escassez, culpa financeira e autossabotagem.',
  whyActivate:
    'A prosperidade exige merecimento e alinhamento vibracional. Este protocolo limpa bloqueios financeiros e ativa abundância.',
  status: 'active',
  sortOrder: 5,
  metadata: {},
  createdAt: NOW,
  updatedAt: NOW,
  steps: [
    {
      id: 'mock-step-1',
      protocolId: 'mock-protocol-prosperidade',
      stepNumber: 1,
      title: 'Símbolos Angelicais',
      instructions: '• (15) Prosperidade\n• (20) Abundância\n• (33) Gratidão\n• (5) Poder Pessoal\n• (37) Arcanjo Miguel',
      metadata: {},
    },
    {
      id: 'mock-step-2',
      protocolId: 'mock-protocol-prosperidade',
      stepNumber: 2,
      title: 'Gráficos Radiônicos',
      instructions: '• (9) Saúde Financeira\n• (27) Prosperador\n• (24) Sorte e Sucesso',
      metadata: {},
    },
  ],
  assets: [],
};

export const MOCK_ACTIVATION_SCRIPTS: ActivationScriptResource[] = [
  {
    id: 'mock-script-luxor',
    name: 'Ativação Luxor',
    slug: 'ativacao-luxor',
    scriptType: 'activation',
    content: 'Visualize luz dourada envolvendo o gráfico Luxor e irradie o campo do consulente.',
    assetId: 'mock-asset-luxor',
    assetName: 'Luxor',
    assetSlug: 'luxor',
    assetType: 'graph',
    sortOrder: 1,
  },
  {
    id: 'mock-script-chakra-basico',
    name: 'Ativação Chakra Básico',
    slug: 'ativacao-chakra-basico',
    scriptType: 'activation',
    content: 'Visualize luz vermelha na base da coluna, enraizando e estabilizando o campo.',
    assetId: 'mock-asset-chakra-basico',
    assetName: 'Chakra Básico',
    assetSlug: 'chakra-basico',
    assetType: 'chakra',
    sortOrder: 2,
  },
];

export function getMockProtocolsForSpecialty(slug: string): MethodologyProtocol[] {
  if (slug === 'mesa-49') {
    const { steps, assets, ...protocol } = MOCK_MESA49_PROTOCOL;
    void steps;
    void assets;
    return [protocol];
  }
  return [];
}

export function getMockProtocolDetail(
  specialtySlug: string,
  protocolSlug: string,
): MethodologyProtocolDetail | null {
  if (specialtySlug === 'mesa-49' && protocolSlug === MOCK_MESA49_PROTOCOL.slug) {
    return MOCK_MESA49_PROTOCOL;
  }
  return null;
}

export function getMockActivationScripts(slug: string): ActivationScriptResource[] {
  if (slug === 'mesa-35') return MOCK_ACTIVATION_SCRIPTS;
  if (slug === 'mesa-49') return [];
  return [];
}

export function getMockProtocolsForAsset(specialtySlug: string, assetId: string): MethodologyProtocol[] {
  void assetId;
  return getMockProtocolsForSpecialty(specialtySlug);
}
