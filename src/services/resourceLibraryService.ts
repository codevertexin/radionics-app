/**
 * Resources Library V2.7 — read-only knowledge access (independent from Workspace).
 */

import { isMockMode, isSupabaseMode } from '@/lib/dataMode';
import { MethodologyEngineError, isMethodologyEngineError } from '@/lib/methodology/errors';
import { groupMediaByAssetId, resolvePrimaryAssetMedia } from '@/lib/methodology/mediaResolution';
import {
  getMockActivationScripts,
  getMockProtocolDetail,
  getMockProtocolsForAsset,
  getMockProtocolsWithLinkedAssets,
} from '@/lib/resources/mockResourceLibraryData';
import { countResourcesDisplayAssets } from '@/lib/resources/resourceFilters';
import {
  groupActivationsByTool,
  groupAssetsByTool,
  type ActivationToolGroup,
  type ToolAssetGroup,
} from '@/lib/resources/resourceGrouping';
import {
  searchProtocols as filterProtocolsByQuery,
  matchProtocolWithAssets,
  type ProtocolWithLinkedAssets,
} from '@/lib/resources/protocolSearch';
import {
  buildActivationSearchResult,
  buildAssetSearchResult,
  buildProtocolSearchResult,
  filterAssetsBySearch,
  matchActivationSearch,
  sortSearchResults,
} from '@/lib/resources/resourceSearch';
import {
  getSpecialtyAssetContent,
  getSpecialtyAssetMedia,
  getSpecialtyAssets as engineGetSpecialtyAssets,
  getSpecialtyTools,
} from '@/services/methodologyEngineService';
import { getApprovedSpecialties } from '@/services/specialtiesService';
import * as supabaseResources from '@/services/supabase/resourceLibrarySupabase';
import type {
  ActivationScriptResource,
  MethodologyProtocol,
  MethodologyProtocolDetail,
  ResourceAssetView,
  ResourceSearchResult,
  Specialty,
  SpecialtyResourceSummary,
} from '@/types';

const delay = (ms = 80) => new Promise<void>(r => setTimeout(r, ms));

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

async function assertApprovedSpecialty(specialtySlug: string): Promise<Specialty> {
  const slug = normalizeSlug(specialtySlug);
  const approved = await getApprovedSpecialties();
  const specialty = approved.find(s => s.slug === slug);
  if (!specialty) {
    throw new MethodologyEngineError(
      `Sem certificação aprovada para "${slug}". Solicite certificação para aceder aos recursos.`,
      'FORBIDDEN',
    );
  }
  return specialty;
}

async function safeSpecialtyTools(slug: string) {
  try {
    return await getSpecialtyTools(slug);
  } catch (err) {
    if (isMethodologyEngineError(err) && err.code === 'NOT_FOUND') return [];
    throw err;
  }
}

async function safeSpecialtyAssets(slug: string) {
  try {
    return await engineGetSpecialtyAssets(slug);
  } catch (err) {
    if (isMethodologyEngineError(err) && err.code === 'NOT_FOUND') return [];
    throw err;
  }
}

async function buildResourceAssets(specialtySlug: string): Promise<ResourceAssetView[]> {
  const [tools, assets, content, media] = await Promise.all([
    safeSpecialtyTools(specialtySlug),
    safeSpecialtyAssets(specialtySlug),
    getSpecialtyAssetContent(specialtySlug).catch(() => []),
    getSpecialtyAssetMedia(specialtySlug).catch(() => []),
  ]);

  const toolById = new Map(tools.map(t => [t.toolId, t.tool]));
  const contentByAssetId = new Map(content.map(c => [c.assetId, c]));
  const mediaByAssetId = groupMediaByAssetId(media);
  const specialtyId = tools[0]?.specialtyId ?? '';

  return assets.map(asset => {
    const resolved = resolvePrimaryAssetMedia(asset, mediaByAssetId[asset.id] ?? [], {
      specialtyId,
    });
    const tool = toolById.get(asset.toolId);
    return {
      ...asset,
      content: contentByAssetId.get(asset.id),
      imageUrlResolved: resolved.url ?? asset.imageUrl,
      toolName: tool?.name,
      toolSlug: tool?.slug,
    };
  });
}

function enrichActivationScripts(
  scripts: ActivationScriptResource[],
  assets: ResourceAssetView[],
): ActivationScriptResource[] {
  const assetById = new Map(assets.map(a => [a.id, a]));
  return scripts.map(script => {
    const asset = script.assetId ? assetById.get(script.assetId) : undefined;
    return {
      ...script,
      assetName: script.assetName ?? asset?.name,
      assetSlug: script.assetSlug ?? asset?.slug,
      assetType: script.assetType ?? asset?.assetType,
      toolSlug: script.toolSlug ?? asset?.toolSlug,
      imageUrl: script.imageUrl ?? asset?.imageUrlResolved ?? asset?.imageUrl,
    };
  });
}

export { groupAssetsByTool, groupActivationsByTool };
export type { ToolAssetGroup, ActivationToolGroup, ProtocolWithLinkedAssets };

export async function getAvailableSpecialties(): Promise<Specialty[]> {
  if (isMockMode()) await delay();
  return getApprovedSpecialties();
}

export async function getSpecialtyResources(
  specialtySlug: string,
): Promise<SpecialtyResourceSummary> {
  const specialty = await assertApprovedSpecialty(specialtySlug);
  const slug = normalizeSlug(specialtySlug);

  const [tools, rawAssets, protocols, scripts] = await Promise.all([
    safeSpecialtyTools(slug),
    safeSpecialtyAssets(slug),
    getSpecialtyProtocolsWithLinkedAssets(slug).catch(() => []),
    getSpecialtyActivationScripts(slug, { enrichImages: false }).catch(() => []),
  ]);

  return {
    specialtyId: specialty.id,
    specialtySlug: specialty.slug,
    specialtyName: specialty.name,
    toolCount: tools.length,
    assetCount: countResourcesDisplayAssets(rawAssets),
    protocolCount: protocols.length,
    activationCount: scripts.length,
    materialCount: 0,
  };
}

export function hasAnyResourceContent(summary: SpecialtyResourceSummary): boolean {
  return (
    summary.assetCount > 0
    || summary.protocolCount > 0
    || summary.activationCount > 0
    || summary.materialCount > 0
  );
}

export function getDefaultResourceTab(summary: SpecialtyResourceSummary): string {
  if (summary.assetCount > 0) return 'assets';
  if (summary.protocolCount > 0) return 'protocols';
  if (summary.activationCount > 0) return 'activations';
  if (summary.materialCount > 0) return 'materials';
  return 'assets';
}

/** Returns enriched assets for the Resources UI. */
export async function getSpecialtyAssets(specialtySlug: string): Promise<ResourceAssetView[]> {
  await assertApprovedSpecialty(specialtySlug);
  return buildResourceAssets(normalizeSlug(specialtySlug));
}

export async function getSpecialtyProtocolsWithLinkedAssets(
  specialtySlug: string,
): Promise<ProtocolWithLinkedAssets[]> {
  const slug = normalizeSlug(specialtySlug);
  await assertApprovedSpecialty(slug);

  if (isMockMode()) {
    await delay();
    return getMockProtocolsWithLinkedAssets(slug);
  }

  if (isSupabaseMode()) {
    const { protocols } = await supabaseResources.supabaseGetSpecialtyProtocolsWithLinkedAssets(slug);
    return protocols;
  }

  throw new MethodologyEngineError('VITE_DATA_MODE inválido.', 'CONFIG');
}

export async function getSpecialtyProtocols(specialtySlug: string): Promise<MethodologyProtocol[]> {
  const items = await getSpecialtyProtocolsWithLinkedAssets(specialtySlug);
  return items.map(({ linkedAssets: _la, ...protocol }) => {
    void _la;
    return protocol;
  });
}

export async function searchProtocols(
  specialtySlug: string,
  query: string,
): Promise<ProtocolWithLinkedAssets[]> {
  const protocols = await getSpecialtyProtocolsWithLinkedAssets(specialtySlug);
  return filterProtocolsByQuery(query, protocols);
}

export async function getSpecialtyProtocolDetail(
  specialtySlug: string,
  protocolSlug: string,
): Promise<MethodologyProtocolDetail | null> {
  const slug = normalizeSlug(specialtySlug);
  await assertApprovedSpecialty(slug);

  if (isMockMode()) {
    await delay();
    return getMockProtocolDetail(slug, protocolSlug);
  }

  if (isSupabaseMode()) {
    return supabaseResources.supabaseGetProtocolDetail(slug, protocolSlug);
  }

  throw new MethodologyEngineError('VITE_DATA_MODE inválido.', 'CONFIG');
}

export async function getSpecialtyActivationScripts(
  specialtySlug: string,
  options?: { enrichImages?: boolean },
): Promise<ActivationScriptResource[]> {
  const slug = normalizeSlug(specialtySlug);
  await assertApprovedSpecialty(slug);

  let scripts: ActivationScriptResource[] = [];

  if (isMockMode()) {
    await delay();
    scripts = getMockActivationScripts(slug);
  } else if (isSupabaseMode()) {
    const result = await supabaseResources.supabaseGetSpecialtyActivationScripts(slug);
    scripts = result.scripts;
  } else {
    throw new MethodologyEngineError('VITE_DATA_MODE inválido.', 'CONFIG');
  }

  if (options?.enrichImages === false) {
    return scripts;
  }

  const assets = await buildResourceAssets(slug);
  return enrichActivationScripts(scripts, assets);
}

export async function getAssetResourceDetail(
  specialtySlug: string,
  assetSlug: string,
): Promise<ResourceAssetView | null> {
  const slug = normalizeSlug(specialtySlug);
  await assertApprovedSpecialty(slug);

  const assets = await buildResourceAssets(slug);
  const asset = assets.find(a => a.slug === assetSlug);
  if (!asset) return null;

  const relatedProtocols = isMockMode()
    ? getMockProtocolsForAsset(slug, asset.id)
    : await supabaseResources.supabaseGetProtocolsForAsset(slug, asset.id);

  return {
    ...asset,
    relatedProtocolSlugs: relatedProtocols.map(p => p.slug),
  };
}

export async function searchResources(
  query: string,
  options?: { specialtySlug?: string },
): Promise<ResourceSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const approved = await getAvailableSpecialties();
  const targets = options?.specialtySlug
    ? approved.filter(s => s.slug === normalizeSlug(options.specialtySlug!))
    : approved;

  const results: ResourceSearchResult[] = [];

  for (const specialty of targets) {
    const [assets, protocols, scripts] = await Promise.all([
      buildResourceAssets(specialty.slug).catch(() => [] as ResourceAssetView[]),
      getSpecialtyProtocolsWithLinkedAssets(specialty.slug).catch(() => []),
      getSpecialtyActivationScripts(specialty.slug).catch(() => []),
    ]);

    for (const { asset, matchedField } of filterAssetsBySearch(q, assets)) {
      results.push(buildAssetSearchResult(asset, specialty.slug, specialty.name, matchedField));
    }

    for (const protocol of protocols) {
      if (matchProtocolWithAssets(q, protocol, protocol.linkedAssets)) {
        results.push(buildProtocolSearchResult(protocol, specialty.slug, specialty.name));
      }
    }

    for (const script of scripts) {
      if (matchActivationSearch(q, script)) {
        results.push(buildActivationSearchResult(script, specialty.slug, specialty.name));
      }
    }
  }

  return sortSearchResults(results);
}

export { MethodologyEngineError, isMethodologyEngineError };
