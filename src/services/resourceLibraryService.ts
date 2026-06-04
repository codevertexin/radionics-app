/**
 * Resources Library V2.7 — read-only knowledge access (independent from Workspace).
 */

import { isMockMode, isSupabaseMode } from '@/lib/dataMode';
import { MethodologyEngineError } from '@/lib/methodology/errors';
import { groupMediaByAssetId, resolvePrimaryAssetMedia } from '@/lib/methodology/mediaResolution';
import {
  getMockActivationScripts,
  getMockProtocolDetail,
  getMockProtocolsForAsset,
  getMockProtocolsForSpecialty,
} from '@/lib/resources/mockResourceLibraryData';
import {
  buildActivationSearchResult,
  buildAssetSearchResult,
  buildProtocolSearchResult,
  filterAssetsBySearch,
  matchActivationSearch,
  matchProtocolSearch,
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

async function buildResourceAssets(specialtySlug: string): Promise<ResourceAssetView[]> {
  const [tools, assets, content, media] = await Promise.all([
    getSpecialtyTools(specialtySlug),
    engineGetSpecialtyAssets(specialtySlug),
    getSpecialtyAssetContent(specialtySlug),
    getSpecialtyAssetMedia(specialtySlug),
  ]);

  const toolById = new Map(tools.map(t => [t.toolId, t.tool]));
  const contentByAssetId = new Map(content.map(c => [c.assetId, c]));
  const mediaByAssetId = groupMediaByAssetId(media);
  const context = tools[0]
    ? { specialtyId: tools[0].specialtyId }
    : { specialtyId: '' };

  return assets.map(asset => {
    const resolved = resolvePrimaryAssetMedia(asset, mediaByAssetId[asset.id] ?? [], {
      specialtyId: context.specialtyId,
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

export async function getAvailableSpecialties(): Promise<Specialty[]> {
  if (isMockMode()) await delay();
  return getApprovedSpecialties();
}

export async function getSpecialtyResources(
  specialtySlug: string,
): Promise<SpecialtyResourceSummary> {
  const specialty = await assertApprovedSpecialty(specialtySlug);
  const slug = normalizeSlug(specialtySlug);

  const [tools, assets, protocols, scripts] = await Promise.all([
    getSpecialtyTools(slug),
    engineGetSpecialtyAssets(slug),
    getSpecialtyProtocols(slug),
    getSpecialtyActivationScripts(slug),
  ]);

  return {
    specialtyId: specialty.id,
    specialtySlug: specialty.slug,
    specialtyName: specialty.name,
    toolCount: tools.length,
    assetCount: assets.length,
    protocolCount: protocols.length,
    activationCount: scripts.length,
  };
}

/** Returns enriched assets for the Resources UI. */
export async function getSpecialtyAssets(specialtySlug: string): Promise<ResourceAssetView[]> {
  await assertApprovedSpecialty(specialtySlug);
  return buildResourceAssets(normalizeSlug(specialtySlug));
}

export async function getSpecialtyProtocols(specialtySlug: string): Promise<MethodologyProtocol[]> {
  const slug = normalizeSlug(specialtySlug);
  await assertApprovedSpecialty(slug);

  if (isMockMode()) {
    await delay();
    return getMockProtocolsForSpecialty(slug);
  }

  if (isSupabaseMode()) {
    const { protocols } = await supabaseResources.supabaseGetSpecialtyProtocols(slug);
    return protocols;
  }

  throw new MethodologyEngineError('VITE_DATA_MODE inválido.', 'CONFIG');
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
): Promise<ActivationScriptResource[]> {
  const slug = normalizeSlug(specialtySlug);
  await assertApprovedSpecialty(slug);

  if (isMockMode()) {
    await delay();
    return getMockActivationScripts(slug);
  }

  if (isSupabaseMode()) {
    const { scripts } = await supabaseResources.supabaseGetSpecialtyActivationScripts(slug);
    return scripts;
  }

  throw new MethodologyEngineError('VITE_DATA_MODE inválido.', 'CONFIG');
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
      getSpecialtyProtocols(specialty.slug).catch(() => [] as MethodologyProtocol[]),
      getSpecialtyActivationScripts(specialty.slug).catch(() => [] as ActivationScriptResource[]),
    ]);

    for (const { asset, matchedField } of filterAssetsBySearch(q, assets)) {
      results.push(buildAssetSearchResult(asset, specialty.slug, specialty.name, matchedField));
    }

    for (const protocol of protocols) {
      if (matchProtocolSearch(q, protocol)) {
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

export { MethodologyEngineError, isMethodologyEngineError } from '@/lib/methodology/errors';
