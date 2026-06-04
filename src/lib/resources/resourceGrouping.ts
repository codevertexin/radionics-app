import { filterResourcesDisplayAssets } from '@/lib/resources/resourceFilters';
import type {
  ActivationScriptResource,
  MethodologyAssetType,
  ResourceAssetView,
} from '@/types';

/** Display labels keyed by methodology_tools.slug */
export const TOOL_SLUG_LABELS: Record<string, string> = {
  'graph-set-35': 'Gráficos',
  'chakra-set': 'Chakras',
  'angel-set-49': 'Anjos / Arcanjos',
  'hawkins-scale': 'Hawkins',
};

/** Preferred section order on the Assets tab */
export const TOOL_SLUG_ORDER: string[] = [
  'graph-set-35',
  'angel-set-49',
  'chakra-set',
  'hawkins-scale',
];

/** Activation tab uses finer angel / archangel split */
export const ACTIVATION_GROUP_LABELS: Record<string, string> = {
  graph: 'Gráficos',
  angel: 'Anjos',
  archangel: 'Arcanjos',
  chakra: 'Chakras',
  hawkins_level: 'Hawkins',
  other: 'Outros',
};

export const ACTIVATION_GROUP_ORDER: string[] = [
  'graph',
  'angel',
  'archangel',
  'chakra',
  'hawkins_level',
  'other',
];

export interface ToolAssetGroup {
  toolSlug: string;
  toolName: string;
  label: string;
  assets: ResourceAssetView[];
}

export interface ActivationToolGroup {
  groupKey: string;
  label: string;
  items: ActivationScriptResource[];
}

export function getToolGroupLabel(toolSlug?: string): string {
  if (toolSlug && TOOL_SLUG_LABELS[toolSlug]) return TOOL_SLUG_LABELS[toolSlug];
  return 'Outros';
}

export function getActivationGroupKey(
  assetType?: MethodologyAssetType,
  assetRole?: string,
): string {
  if (assetType === 'archangel' || assetRole === 'archangel') return 'archangel';
  if (assetType === 'angel' || assetRole === 'angel') return 'angel';
  if (assetType === 'graph') return 'graph';
  if (assetType === 'chakra') return 'chakra';
  if (assetType === 'hawkins_level') return 'hawkins_level';
  return 'other';
}

export function groupAssetsByTool(assets: ResourceAssetView[]): ToolAssetGroup[] {
  const visible = filterResourcesDisplayAssets(assets);
  const byTool = new Map<string, ResourceAssetView[]>();

  for (const asset of visible) {
    const key = asset.toolSlug ?? 'other';
    const list = byTool.get(key) ?? [];
    list.push(asset);
    byTool.set(key, list);
  }

  const groups: ToolAssetGroup[] = [...byTool.entries()].map(([toolSlug, groupAssets]) => {
    const sorted = [...groupAssets].sort((a, b) => a.sortOrder - b.sortOrder);
    const toolName = sorted[0]?.toolName ?? toolSlug;
    return {
      toolSlug,
      toolName,
      label: getToolGroupLabel(toolSlug),
      assets: sorted,
    };
  });

  return groups.sort((a, b) => {
    const ai = TOOL_SLUG_ORDER.indexOf(a.toolSlug);
    const bi = TOOL_SLUG_ORDER.indexOf(b.toolSlug);
    const aOrder = ai === -1 ? 999 : ai;
    const bOrder = bi === -1 ? 999 : bi;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.label.localeCompare(b.label, 'pt');
  });
}

export function groupActivationsByTool(
  scripts: ActivationScriptResource[],
): ActivationToolGroup[] {
  const byKey = new Map<string, ActivationScriptResource[]>();

  for (const script of scripts) {
    if (script.assetType === 'hawkins_level') continue;
    const key = getActivationGroupKey(script.assetType);
    const list = byKey.get(key) ?? [];
    list.push(script);
    byKey.set(key, list);
  }

  const groups: ActivationToolGroup[] = [...byKey.entries()].map(([groupKey, items]) => ({
    groupKey,
    label: ACTIVATION_GROUP_LABELS[groupKey] ?? groupKey,
    items: [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'pt')),
  }));

  return groups.sort((a, b) => {
    const ai = ACTIVATION_GROUP_ORDER.indexOf(a.groupKey);
    const bi = ACTIVATION_GROUP_ORDER.indexOf(b.groupKey);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

export function truncatePreview(text: string, maxLen = 120): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen).trim()}…`;
}
