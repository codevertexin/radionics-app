import type { MethodologyAsset, MethodologyAssetMedia, MediaType } from '@/types';

export type MediaResolutionSource =
  | 'specialty_primary'
  | 'tool_primary'
  | 'global_primary'
  | 'asset_image_url'
  | 'none';

export interface ResolvedAssetMedia {
  media: MethodologyAssetMedia | null;
  url: string | null;
  resolution: MediaResolutionSource;
}

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

function isNilScope(id: string | null | undefined): boolean {
  return id == null || id === NIL_UUID;
}

function matchesScope(
  row: MethodologyAssetMedia,
  opts: {
    assetId: string;
    specialtyId?: string | null;
    toolId?: string | null;
    mediaType: MediaType;
    primaryOnly: boolean;
  },
): boolean {
  if (row.assetId !== opts.assetId) return false;
  if (row.mediaType !== opts.mediaType) return false;
  if (opts.primaryOnly && !row.isPrimary) return false;
  if (opts.specialtyId !== undefined) {
    if (opts.specialtyId === null) {
      if (!isNilScope(row.specialtyId)) return false;
    } else if (row.specialtyId !== opts.specialtyId) {
      return false;
    }
  }
  if (opts.toolId !== undefined) {
    if (opts.toolId === null) {
      if (!isNilScope(row.toolId)) return false;
    } else if (row.toolId !== opts.toolId) {
      return false;
    }
  }
  return true;
}

function pickPrimary(
  rows: MethodologyAssetMedia[],
  opts: Parameters<typeof matchesScope>[1],
): MethodologyAssetMedia | null {
  const primary = rows.find(r => matchesScope(r, { ...opts, primaryOnly: true }));
  if (primary) return primary;
  return rows.find(r => matchesScope(r, { ...opts, primaryOnly: false })) ?? null;
}

/**
 * Resolution order (documented in V2.4):
 * 1. asset + specialty + primary
 * 2. asset + tool + primary (specialty scope null)
 * 3. asset global primary (both scopes null)
 * 4. methodology_assets.image_url
 * 5. none (app-level placeholder is future UI concern)
 */
export function resolvePrimaryAssetMedia(
  asset: Pick<MethodologyAsset, 'id' | 'toolId' | 'imageUrl'>,
  mediaRows: MethodologyAssetMedia[],
  options?: {
    specialtyId?: string;
    mediaType?: MediaType;
  },
): ResolvedAssetMedia {
  const mediaType = options?.mediaType ?? 'image';
  const specialtyId = options?.specialtyId;

  if (specialtyId) {
    const specialtyScoped =
      mediaRows.find(
        r =>
          r.assetId === asset.id
          && r.specialtyId === specialtyId
          && r.isPrimary
          && r.mediaType === mediaType,
      )
      ?? mediaRows.find(
        r => r.assetId === asset.id && r.specialtyId === specialtyId && r.mediaType === mediaType,
      );
    if (specialtyScoped) {
      return { media: specialtyScoped, url: specialtyScoped.url, resolution: 'specialty_primary' };
    }
  }

  const toolScoped = pickPrimary(mediaRows, {
    assetId: asset.id,
    specialtyId: null,
    toolId: asset.toolId,
    mediaType,
    primaryOnly: true,
  });
  if (toolScoped) {
    return { media: toolScoped, url: toolScoped.url, resolution: 'tool_primary' };
  }

  const globalScoped = pickPrimary(mediaRows, {
    assetId: asset.id,
    specialtyId: null,
    toolId: null,
    mediaType,
    primaryOnly: true,
  });
  if (globalScoped) {
    return { media: globalScoped, url: globalScoped.url, resolution: 'global_primary' };
  }

  if (asset.imageUrl?.trim()) {
    return { media: null, url: asset.imageUrl, resolution: 'asset_image_url' };
  }

  return { media: null, url: null, resolution: 'none' };
}

export function groupMediaByAssetId(
  media: MethodologyAssetMedia[],
): Record<string, MethodologyAssetMedia[]> {
  const map: Record<string, MethodologyAssetMedia[]> = {};
  for (const row of media) {
    if (!map[row.assetId]) map[row.assetId] = [];
    map[row.assetId].push(row);
  }
  for (const id of Object.keys(map)) {
    map[id].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }
  return map;
}
