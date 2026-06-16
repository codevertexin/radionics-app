/**
 * Mock Resources data — mesa-35 chakras, mesa-49 sample protocol, activation scripts.
 */

import type {
  ActivationScriptResource,
  MethodologyProtocol,
  MethodologyProtocolDetail,
  ProtocolAssetLink,
} from '@/types';
import type { ProtocolWithLinkedAssets } from '@/lib/resources/protocolSearch';
import { MESA35_GRAPH_CATALOG } from '@/lib/methodology/mesa35GraphCatalog';
import { MESA35_GRAPH_KNOWLEDGE } from '@/lib/methodology/mesa35GraphKnowledge';
import { mesa35GraphCdnImageUrl } from '@/lib/methodology/mesa35GraphMedia';

const NOW = '2024-01-01T00:00:00.000Z';
const MOCK_SPECIALTY_MESA49 = 'spec-rad49';

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
  assets: [
    {
      id: 'mock-pa-1',
      protocolId: 'mock-protocol-prosperidade',
      assetId: 'mock-asset-prosperidade-angel',
      assetRole: 'angel',
      sortOrder: 1,
      notes: '• (15) Prosperidade',
      asset: {
        id: 'mock-asset-prosperidade-angel',
        toolId: 'mock-tool-angel',
        name: 'Prosperidade',
        slug: 'angel-prosperity',
        canonicalName: 'Prosperidade',
        aliases: ['Anjo da Prosperidade'],
        assetType: 'angel',
        usageMode: 'activation',
        metadata: {},
        status: 'active',
        sortOrder: 15,
        createdAt: NOW,
        updatedAt: NOW,
      },
    },
    {
      id: 'mock-pa-2',
      protocolId: 'mock-protocol-prosperidade',
      assetId: 'mock-asset-prosperador',
      assetRole: 'graph',
      sortOrder: 6,
      notes: '• (27) Prosperador',
      asset: {
        id: 'mock-asset-prosperador',
        toolId: 'mock-tool-graph',
        name: 'Prosperador',
        slug: 'prosperador',
        canonicalName: 'Prosperador',
        aliases: [],
        assetType: 'graph',
        usageMode: 'activation',
        metadata: {},
        status: 'active',
        sortOrder: 27,
        createdAt: NOW,
        updatedAt: NOW,
      },
    },
    {
      id: 'mock-pa-3',
      protocolId: 'mock-protocol-prosperidade',
      assetId: 'mock-asset-saude-financeira',
      assetRole: 'graph',
      sortOrder: 7,
      notes: '• (9) Saúde Financeira',
      asset: {
        id: 'mock-asset-saude-financeira',
        toolId: 'mock-tool-graph',
        name: 'Saúde Financeira',
        slug: 'saude-financeira',
        canonicalName: 'Saúde Financeira',
        aliases: [],
        assetType: 'graph',
        usageMode: 'activation',
        metadata: {},
        status: 'active',
        sortOrder: 9,
        createdAt: NOW,
        updatedAt: NOW,
      },
    },
  ] as ProtocolAssetLink[],
};

export const MOCK_ACTIVATION_SCRIPTS: ActivationScriptResource[] = [
  ...MESA35_GRAPH_CATALOG.map(entry => {
    const knowledge = MESA35_GRAPH_KNOWLEDGE[entry.slug];
    const title = knowledge?.title ?? entry.name;
    return {
      id: `mock-script-${entry.slug}`,
      name: `Ativação ${title}`,
      slug: `ativacao-${entry.slug}`,
      scriptType: 'activation' as const,
      content: knowledge?.activationText ?? '',
      assetId: `mock-asset-${entry.slug}`,
      assetName: title,
      assetSlug: entry.slug,
      assetType: 'graph' as const,
      toolSlug: 'graph-set-35',
      imageUrl: mesa35GraphCdnImageUrl(entry.slug),
      sourceName: 'Vanessa',
      sourceReference: 'docs/knowledge/vanessa/GRAFICOS MESA.txt',
      sortOrder: entry.sortOrder,
    };
  }),
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
    toolSlug: 'chakra-set',
    sourceName: 'Vanessa',
    sourceReference: 'docs/knowledge/vanessa/Chakra.txt',
    sortOrder: 100,
  },
];

export function getMockProtocolsWithLinkedAssets(slug: string): ProtocolWithLinkedAssets[] {
  if (slug !== 'mesa-49') return [];
  const { steps, ...protocol } = MOCK_MESA49_PROTOCOL;
  void steps;
  return [{
    ...protocol,
    linkedAssets: MOCK_MESA49_PROTOCOL.assets.map(pa => pa.asset),
  }];
}

export function getMockProtocolsForSpecialty(slug: string): MethodologyProtocol[] {
  return getMockProtocolsWithLinkedAssets(slug).map(({ linkedAssets: _la, ...p }) => {
    void _la;
    return p;
  });
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
