import type { ActivationScriptResource, MethodologyAsset, ResourceAssetView } from '@/types';

/** Tool slug for Hawkins scale — hidden from Resources browse UI (V2.7). */
export const HAWKINS_TOOL_SLUG = 'hawkins-scale';

/**
 * Hawkins levels stay in methodology_assets for sessions/workflows.
 * Resources UI does not list them as individual cards.
 * Future: single media asset for "Escala de Hawkins" / "Biômetro Hawkins".
 */
export function isHawkinsResourceAsset(
  asset: Pick<MethodologyAsset, 'assetType'> & { toolSlug?: string },
): boolean {
  return asset.toolSlug === HAWKINS_TOOL_SLUG || asset.assetType === 'hawkins_level';
}

export function filterResourcesDisplayAssets<T extends ResourceAssetView>(assets: T[]): T[] {
  return assets.filter(a => !isHawkinsResourceAsset(a));
}

export function filterResourcesDisplayActivations(
  scripts: ActivationScriptResource[],
): ActivationScriptResource[] {
  return scripts.filter(s => s.assetType !== 'hawkins_level');
}

export function countResourcesDisplayAssets(
  assets: Pick<MethodologyAsset, 'assetType'>[],
): number {
  return assets.filter(a => a.assetType !== 'hawkins_level').length;
}
