import { getSpecialtyAssets } from '@/services/resourceLibraryService';
import { getSpecialtyActivationScripts } from '@/services/resourceLibraryService';
import { MESA35_ACTIVATION_UNAVAILABLE } from '@/lib/workflow-adapter/mesa35WorkspaceCopy';
import type { ResourceAssetView } from '@/types';
import type { Tool } from '@/types';

export interface Mesa35ChakraItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
}

export interface Mesa35WorkspaceBundle {
  graphTools: Tool[];
  chakraItems: Mesa35ChakraItem[];
  toolByAssetId: Map<string, Tool>;
}

function resolveAssetName(asset: ResourceAssetView): string {
  return asset.canonicalName?.trim() || asset.name;
}

function resolveImageUrl(asset: ResourceAssetView): string {
  return asset.imageUrlResolved?.trim() || asset.imageUrl?.trim() || '';
}

function resourceAssetToTool(
  asset: ResourceAssetView,
  activationText: string,
): Tool {
  const content = asset.content;
  const therapist =
    content?.therapistExplanation?.trim()
    ?? asset.baseDescription?.trim()
    ?? '';

  const whatItDoes =
    content?.clientExplanation?.trim()
    ?? therapist;

  const whenToUse =
    content?.recommendedUse?.trim()
    ?? content?.clientExplanation?.trim()
    ?? '';

  const script =
    activationText.trim()
    || content?.activationText?.trim()
    || '';

  return {
    id: asset.id,
    code: asset.slug,
    name: resolveAssetName(asset),
    description: therapist,
    whatItDoes,
    example: whenToUse,
    suggestedActivation: script || MESA35_ACTIVATION_UNAVAILABLE,
    imageUrl: resolveImageUrl(asset),
    methodologyId: 'meth-rad35',
    sortOrder: asset.sortOrder,
  };
}

function chakraFromAsset(asset: ResourceAssetView): Mesa35ChakraItem {
  const content = asset.content;
  return {
    id: asset.id,
    name: resolveAssetName(asset),
    slug: asset.slug,
    description:
      content?.therapistExplanation?.trim()
      ?? asset.baseDescription?.trim()
      ?? '',
    imageUrl: resolveImageUrl(asset),
    sortOrder: asset.sortOrder,
  };
}

/**
 * Carrega gráficos e chakras via Resources/Methodology Engine —
 * mesma fonte e resolução de imagens que a biblioteca de Recursos.
 */
export async function loadMesa35WorkspaceBundle(): Promise<Mesa35WorkspaceBundle> {
  const [assets, scripts] = await Promise.all([
    getSpecialtyAssets('mesa-35'),
    getSpecialtyActivationScripts('mesa-35', { enrichImages: false }).catch(() => []),
  ]);

  const activationByAssetId = new Map(
    scripts
      .filter(s => s.assetId && s.content?.trim())
      .map(s => [s.assetId as string, s.content.trim()]),
  );

  const graphAssets = assets
    .filter(a => a.assetType === 'graph' && a.status === 'active')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const chakraAssets = assets
    .filter(a => a.assetType === 'chakra' && a.status === 'active')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const graphTools: Tool[] = [];
  const toolByAssetId = new Map<string, Tool>();
  const chakraItems: Mesa35ChakraItem[] = [];

  for (const asset of graphAssets) {
    const activationText = activationByAssetId.get(asset.id) ?? '';
    const tool = resourceAssetToTool(asset, activationText);
    graphTools.push(tool);
    toolByAssetId.set(asset.id, tool);
  }

  for (const asset of chakraAssets) {
    chakraItems.push(chakraFromAsset(asset));
  }

  return { graphTools, chakraItems, toolByAssetId };
}
