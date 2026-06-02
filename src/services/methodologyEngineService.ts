/**
 * Methodology Engine V2 — read-only access (mock | Supabase).
 * Does not replace workspace TOOLS_RAD35 yet.
 */

import { isMockMode, isSupabaseMode } from '@/lib/dataMode';
import { MethodologyEngineError } from '@/lib/methodology/errors';
import {
  groupMediaByAssetId,
  resolvePrimaryAssetMedia as resolveMedia,
  type ResolvedAssetMedia,
} from '@/lib/methodology/mediaResolution';
import {
  getMockMesa35AssetContent,
  getMockMesa35AssetMedia,
  getMockMesa35Assets,
  getMockMesa35Context,
  getMockMesa35Tools,
} from '@/lib/methodology/mockMesa35Data';
import * as supabaseEngine from '@/services/supabase/methodologyEngineSupabase';
import type {
  MethodologyAsset,
  MethodologyAssetMedia,
  SpecialtyAssetContent,
  SpecialtyMethodologyContext,
  SpecialtyToolLink,
} from '@/types';

const delay = (ms = 80) => new Promise<void>(r => setTimeout(r, ms));

export interface SpecialtyMethodologyBundle {
  context: SpecialtyMethodologyContext;
  tools: SpecialtyToolLink[];
  assets: MethodologyAsset[];
  assetContent: SpecialtyAssetContent[];
  assetMedia: MethodologyAssetMedia[];
  mediaByAssetId: Record<string, MethodologyAssetMedia[]>;
}

export type { ResolvedAssetMedia } from '@/lib/methodology/mediaResolution';

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function mockContextForSlug(slug: string): SpecialtyMethodologyContext {
  if (slug !== 'mesa-35') {
    throw new MethodologyEngineError(
      `Mock: dados de metodologia disponíveis apenas para "mesa-35" (pedido: "${slug}").`,
      'NOT_FOUND',
    );
  }
  return getMockMesa35Context();
}

async function mockGetSpecialtyTools(slug: string): Promise<SpecialtyToolLink[]> {
  await delay();
  if (normalizeSlug(slug) !== 'mesa-35') {
    throw new MethodologyEngineError(
      `Mock: especialidade "${slug}" sem ferramentas de metodologia configuradas.`,
      'NOT_FOUND',
    );
  }
  return getMockMesa35Tools();
}

async function mockGetSpecialtyAssets(slug: string): Promise<MethodologyAsset[]> {
  await delay();
  if (normalizeSlug(slug) !== 'mesa-35') {
    throw new MethodologyEngineError(
      `Mock: especialidade "${slug}" sem assets de metodologia configurados.`,
      'NOT_FOUND',
    );
  }
  return getMockMesa35Assets();
}

async function mockGetSpecialtyAssetContent(slug: string): Promise<SpecialtyAssetContent[]> {
  await delay();
  if (normalizeSlug(slug) !== 'mesa-35') {
    return [];
  }
  return getMockMesa35AssetContent();
}

async function mockGetSpecialtyAssetMedia(slug: string): Promise<MethodologyAssetMedia[]> {
  await delay();
  if (normalizeSlug(slug) !== 'mesa-35') {
    return [];
  }
  return getMockMesa35AssetMedia();
}

export async function getSpecialtyTools(specialtySlug: string): Promise<SpecialtyToolLink[]> {
  const slug = normalizeSlug(specialtySlug);
  if (!slug) {
    throw new MethodologyEngineError('specialtySlug é obrigatório.', 'CONFIG');
  }

  if (isMockMode()) {
    return mockGetSpecialtyTools(slug);
  }

  if (isSupabaseMode()) {
    const { tools } = await supabaseEngine.supabaseGetSpecialtyTools(slug);
    return tools;
  }

  throw new MethodologyEngineError(
    `VITE_DATA_MODE inválido. Use "mock" ou "supabase".`,
    'CONFIG',
  );
}

export async function getSpecialtyAssets(specialtySlug: string): Promise<MethodologyAsset[]> {
  const slug = normalizeSlug(specialtySlug);
  if (!slug) {
    throw new MethodologyEngineError('specialtySlug é obrigatório.', 'CONFIG');
  }

  if (isMockMode()) {
    return mockGetSpecialtyAssets(slug);
  }

  if (isSupabaseMode()) {
    const { assets } = await supabaseEngine.supabaseGetSpecialtyAssets(slug);
    return assets;
  }

  throw new MethodologyEngineError(
    `VITE_DATA_MODE inválido. Use "mock" ou "supabase".`,
    'CONFIG',
  );
}

export async function getSpecialtyAssetContent(
  specialtySlug: string,
): Promise<SpecialtyAssetContent[]> {
  const slug = normalizeSlug(specialtySlug);
  if (!slug) {
    throw new MethodologyEngineError('specialtySlug é obrigatório.', 'CONFIG');
  }

  if (isMockMode()) {
    return mockGetSpecialtyAssetContent(slug);
  }

  if (isSupabaseMode()) {
    const { content } = await supabaseEngine.supabaseGetSpecialtyAssetContent(slug);
    return content;
  }

  throw new MethodologyEngineError(
    `VITE_DATA_MODE inválido. Use "mock" ou "supabase".`,
    'CONFIG',
  );
}

export async function getSpecialtyAssetMedia(
  specialtySlug: string,
): Promise<MethodologyAssetMedia[]> {
  const slug = normalizeSlug(specialtySlug);
  if (!slug) {
    throw new MethodologyEngineError('specialtySlug é obrigatório.', 'CONFIG');
  }

  if (isMockMode()) {
    return mockGetSpecialtyAssetMedia(slug);
  }

  if (isSupabaseMode()) {
    const { media } = await supabaseEngine.supabaseGetSpecialtyAssetMedia(slug);
    return media;
  }

  throw new MethodologyEngineError(
    `VITE_DATA_MODE inválido. Use "mock" ou "supabase".`,
    'CONFIG',
  );
}

export async function resolvePrimaryAssetMedia(
  assetId: string,
  specialtySlug?: string,
): Promise<ResolvedAssetMedia> {
  if (!assetId.trim()) {
    throw new MethodologyEngineError('assetId é obrigatório.', 'CONFIG');
  }

  if (specialtySlug) {
    const slug = normalizeSlug(specialtySlug);
    const [assets, media] = await Promise.all([
      getSpecialtyAssets(slug),
      getSpecialtyAssetMedia(slug),
    ]);
    const asset = assets.find(a => a.id === assetId);
    if (!asset) {
      throw new MethodologyEngineError(
        `Asset "${assetId}" não encontrado para especialidade "${slug}".`,
        'NOT_FOUND',
      );
    }
    const context = isMockMode()
      ? mockContextForSlug(slug)
      : (await supabaseEngine.supabaseGetSpecialtyTools(slug)).context;
    const assetMedia = media.filter(m => m.assetId === assetId);
    return resolveMedia(asset, assetMedia, { specialtyId: context.specialtyId });
  }

  if (isMockMode()) {
    const assets = await getMockMesa35Assets();
    const asset = assets.find(a => a.id === assetId);
    if (!asset) {
      throw new MethodologyEngineError(`Asset "${assetId}" não encontrado.`, 'NOT_FOUND');
    }
    return resolveMedia(asset, []);
  }

  if (isSupabaseMode()) {
    const [asset, media] = await Promise.all([
      supabaseEngine.supabaseGetMethodologyAssetById(assetId),
      supabaseEngine.supabaseGetAssetMediaByAssetId(assetId),
    ]);
    if (!asset) {
      throw new MethodologyEngineError(`Asset "${assetId}" não encontrado.`, 'NOT_FOUND');
    }
    return resolveMedia(asset, media);
  }

  throw new MethodologyEngineError(
    `VITE_DATA_MODE inválido. Use "mock" ou "supabase".`,
    'CONFIG',
  );
}

/** Convenience loader for the methodology debug page. */
export async function getSpecialtyMethodologyBundle(
  specialtySlug: string,
): Promise<SpecialtyMethodologyBundle> {
  const slug = normalizeSlug(specialtySlug);

  if (isMockMode()) {
    const context = mockContextForSlug(slug);
    const [tools, assets, assetContent, assetMedia] = await Promise.all([
      mockGetSpecialtyTools(slug),
      mockGetSpecialtyAssets(slug),
      mockGetSpecialtyAssetContent(slug),
      mockGetSpecialtyAssetMedia(slug),
    ]);
    return {
      context,
      tools,
      assets,
      assetContent,
      assetMedia,
      mediaByAssetId: groupMediaByAssetId(assetMedia),
    };
  }

  if (isSupabaseMode()) {
    const { context, tools } = await supabaseEngine.supabaseGetSpecialtyTools(slug);
    const [assets, assetContent, assetMedia] = await Promise.all([
      supabaseEngine.supabaseGetSpecialtyAssets(slug).then(r => r.assets),
      supabaseEngine.supabaseGetSpecialtyAssetContent(slug).then(r => r.content),
      supabaseEngine.supabaseGetSpecialtyAssetMedia(slug).then(r => r.media),
    ]);
    return {
      context,
      tools,
      assets,
      assetContent,
      assetMedia,
      mediaByAssetId: groupMediaByAssetId(assetMedia),
    };
  }

  throw new MethodologyEngineError(
    `VITE_DATA_MODE inválido. Use "mock" ou "supabase".`,
    'CONFIG',
  );
}

export { MethodologyEngineError, isMethodologyEngineError } from '@/lib/methodology/errors';
