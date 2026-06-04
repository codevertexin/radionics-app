import type {
  ActivationScriptResource,
  MethodologyAsset,
  MethodologyProtocol,
  ResourceSearchField,
  ResourceSearchResult,
  ResourceSearchResultKind,
} from '@/types';

/** Normalize text for alias / name matching (case- and accent-insensitive). */
export function normalizeResourceSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getAssetSearchFields(asset: MethodologyAsset): Record<ResourceSearchField, string | string[]> {
  return {
    name: asset.name,
    canonical_name: asset.canonicalName ?? asset.name,
    original_name: asset.originalName ?? '',
    aliases: asset.aliases ?? [],
  };
}

function matchAssetFields(query: string, asset: MethodologyAsset): ResourceSearchField | null {
  const q = normalizeResourceSearchText(query);
  if (!q) return null;

  const fields = getAssetSearchFields(asset);
  if (normalizeResourceSearchText(String(fields.name)).includes(q)) return 'name';
  if (fields.canonical_name && normalizeResourceSearchText(String(fields.canonical_name)).includes(q)) {
    return 'canonical_name';
  }
  if (fields.original_name && normalizeResourceSearchText(String(fields.original_name)).includes(q)) {
    return 'original_name';
  }
  for (const alias of fields.aliases) {
    if (normalizeResourceSearchText(alias).includes(q)) return 'aliases';
  }
  return null;
}

export function matchAssetSearch(query: string, asset: MethodologyAsset): ResourceSearchField | null {
  return matchAssetFields(query, asset);
}

export function matchProtocolSearch(query: string, protocol: MethodologyProtocol): boolean {
  const q = normalizeResourceSearchText(query);
  if (!q) return false;
  return (
    normalizeResourceSearchText(protocol.name).includes(q)
    || normalizeResourceSearchText(protocol.code).includes(q)
    || (protocol.description ? normalizeResourceSearchText(protocol.description).includes(q) : false)
  );
}

export function matchActivationSearch(query: string, script: ActivationScriptResource): boolean {
  const q = normalizeResourceSearchText(query);
  if (!q) return false;
  return (
    normalizeResourceSearchText(script.name).includes(q)
    || normalizeResourceSearchText(script.content).includes(q)
    || (script.assetName ? normalizeResourceSearchText(script.assetName).includes(q) : false)
  );
}

export function buildAssetSearchResult(
  asset: MethodologyAsset,
  specialtySlug: string,
  specialtyName: string,
  matchedField: ResourceSearchField,
): ResourceSearchResult {
  return {
    kind: 'asset',
    specialtySlug,
    specialtyName,
    id: asset.id,
    slug: asset.slug,
    name: asset.name,
    matchedField,
    subtitle: asset.originalName ?? asset.canonicalName,
    assetType: asset.assetType,
  };
}

export function buildProtocolSearchResult(
  protocol: MethodologyProtocol,
  specialtySlug: string,
  specialtyName: string,
): ResourceSearchResult {
  return {
    kind: 'protocol',
    specialtySlug,
    specialtyName,
    id: protocol.id,
    slug: protocol.slug,
    name: protocol.name,
    matchedField: 'name',
    subtitle: protocol.code,
  };
}

export function buildActivationSearchResult(
  script: ActivationScriptResource,
  specialtySlug: string,
  specialtyName: string,
): ResourceSearchResult {
  return {
    kind: 'activation',
    specialtySlug,
    specialtyName,
    id: script.id,
    slug: script.slug,
    name: script.name,
    matchedField: 'name',
    subtitle: script.assetName,
    assetType: script.assetType,
  };
}

export function sortSearchResults(results: ResourceSearchResult[]): ResourceSearchResult[] {
  const kindOrder: Record<ResourceSearchResultKind, number> = {
    asset: 0,
    protocol: 1,
    activation: 2,
  };
  return [...results].sort((a, b) => {
    const kindDiff = kindOrder[a.kind] - kindOrder[b.kind];
    if (kindDiff !== 0) return kindDiff;
    return a.name.localeCompare(b.name, 'pt');
  });
}

/** Filter assets by query across naming fields. */
export function filterAssetsBySearch(
  query: string,
  assets: MethodologyAsset[],
): Array<{ asset: MethodologyAsset; matchedField: ResourceSearchField }> {
  const q = query.trim();
  if (!q) return assets.map(asset => ({ asset, matchedField: 'name' as ResourceSearchField }));

  return assets
    .map(asset => {
      const matchedField = matchAssetSearch(q, asset);
      return matchedField ? { asset, matchedField } : null;
    })
    .filter((row): row is { asset: MethodologyAsset; matchedField: ResourceSearchField } => row !== null);
}

/** Options for future FTS / semantic search layers. */
export interface ResourceSearchOptions {
  query: string;
  specialtySlug?: string;
  kinds?: ResourceSearchResultKind[];
}
