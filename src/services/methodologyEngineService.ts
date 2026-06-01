/**
 * Methodology Engine V2 — read-only access (mock | Supabase).
 * Does not replace workspace TOOLS_RAD35 yet.
 */

import { isMockMode, isSupabaseMode } from '@/lib/dataMode';
import { MethodologyEngineError } from '@/lib/methodology/errors';
import {
  getMockMesa35AssetContent,
  getMockMesa35Assets,
  getMockMesa35Context,
  getMockMesa35Tools,
} from '@/lib/methodology/mockMesa35Data';
import * as supabaseEngine from '@/services/supabase/methodologyEngineSupabase';
import type {
  MethodologyAsset,
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
}

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

/** Convenience loader for the methodology debug page. */
export async function getSpecialtyMethodologyBundle(
  specialtySlug: string,
): Promise<SpecialtyMethodologyBundle> {
  const slug = normalizeSlug(specialtySlug);

  if (isMockMode()) {
    const context = mockContextForSlug(slug);
    const [tools, assets, assetContent] = await Promise.all([
      mockGetSpecialtyTools(slug),
      mockGetSpecialtyAssets(slug),
      mockGetSpecialtyAssetContent(slug),
    ]);
    return { context, tools, assets, assetContent };
  }

  if (isSupabaseMode()) {
    const { context, tools } = await supabaseEngine.supabaseGetSpecialtyTools(slug);
    const [assets, assetContent] = await Promise.all([
      supabaseEngine.supabaseGetSpecialtyAssets(slug).then(r => r.assets),
      supabaseEngine.supabaseGetSpecialtyAssetContent(slug).then(r => r.content),
    ]);
    return { context, tools, assets, assetContent };
  }

  throw new MethodologyEngineError(
    `VITE_DATA_MODE inválido. Use "mock" ou "supabase".`,
    'CONFIG',
  );
}

export { MethodologyEngineError, isMethodologyEngineError } from '@/lib/methodology/errors';
