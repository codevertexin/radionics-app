import { MethodologyEngineError } from '@/lib/methodology/errors';
import { requireSupabaseClient } from '@/lib/dataMode';
import { requireAuthUserId } from '@/lib/supabase/auth';
import { wrapSupabaseError } from '@/lib/supabase/errors';
import {
  mapMethodologyAsset,
  mapMethodologyAssetMedia,
  mapSpecialtyAssetContent,
  mapSpecialtyToolLink,
  type MethodologyAssetMediaRow,
  type MethodologyAssetRow,
  type SpecialtyAssetContentRow,
  type SpecialtySlugRow,
  type SpecialtyToolRow,
} from '@/lib/supabase/methodologyEngineMappers';
import type {
  MethodologyAsset,
  MethodologyAssetMedia,
  SpecialtyAssetContent,
  SpecialtyMethodologyContext,
  SpecialtyToolLink,
} from '@/types';

export async function resolveSpecialtyBySlug(slug: string): Promise<SpecialtyMethodologyContext> {
  const client = requireSupabaseClient();

  const { data, error } = await client
    .from('radionics_specialties')
    .select('id, name, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (error) wrapSupabaseError('resolveSpecialtyBySlug', error);

  if (!data) {
    throw new MethodologyEngineError(
      `Especialidade com slug "${slug}" não encontrada.`,
      'NOT_FOUND',
    );
  }

  const row = data as SpecialtySlugRow;
  return {
    specialtyId: row.id,
    specialtySlug: row.slug,
    specialtyName: row.name,
  };
}

function mapRlsError(context: string, error: { message: string; code?: string }): never {
  const msg = error.message.toLowerCase();
  if (
    error.code === '42501'
    || msg.includes('row-level security')
    || msg.includes('permission denied')
  ) {
    throw new MethodologyEngineError(
      `[${context}] Sem permissão para ler dados da metodologia. `
        + 'Certifique-se de que tem certificação aprovada para esta especialidade ou contacto de administrador.',
      'RLS',
    );
  }
  wrapSupabaseError(context, error);
}

export async function supabaseGetSpecialtyTools(
  specialtySlug: string,
): Promise<{ context: SpecialtyMethodologyContext; tools: SpecialtyToolLink[] }> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const context = await resolveSpecialtyBySlug(specialtySlug);

  const { data, error } = await client
    .from('specialty_tools')
    .select(`
      id,
      specialty_id,
      tool_id,
      is_required,
      is_visible_in_workspace,
      sort_order,
      created_at,
      updated_at,
      methodology_tools (
        id,
        name,
        slug,
        description,
        tool_type,
        usage_mode,
        status,
        sort_order,
        created_at,
        updated_at
      )
    `)
    .eq('specialty_id', context.specialtyId)
    .order('sort_order');

  if (error) mapRlsError('getSpecialtyTools', error);

  const tools = ((data ?? []) as SpecialtyToolRow[]).map(mapSpecialtyToolLink);
  return { context, tools };
}

export async function supabaseGetSpecialtyAssets(
  specialtySlug: string,
): Promise<{ context: SpecialtyMethodologyContext; assets: MethodologyAsset[] }> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const { context, tools } = await supabaseGetSpecialtyTools(specialtySlug);
  const toolIds = tools.map(t => t.toolId);

  if (toolIds.length === 0) {
    return { context, assets: [] };
  }

  const { data, error } = await client
    .from('methodology_assets')
    .select('*')
    .in('tool_id', toolIds)
    .eq('status', 'active')
    .order('sort_order');

  if (error) mapRlsError('getSpecialtyAssets', error);

  const assets = ((data ?? []) as MethodologyAssetRow[]).map(mapMethodologyAsset);
  return { context, assets };
}

export async function supabaseGetSpecialtyAssetContent(
  specialtySlug: string,
): Promise<{ context: SpecialtyMethodologyContext; content: SpecialtyAssetContent[] }> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const context = await resolveSpecialtyBySlug(specialtySlug);

  const { data, error } = await client
    .from('specialty_asset_content')
    .select('*')
    .eq('specialty_id', context.specialtyId)
    .order('sort_order');

  if (error) mapRlsError('getSpecialtyAssetContent', error);

  const content = ((data ?? []) as SpecialtyAssetContentRow[]).map(mapSpecialtyAssetContent);
  return { context, content };
}

export async function supabaseGetSpecialtyAssetMedia(
  specialtySlug: string,
): Promise<{ context: SpecialtyMethodologyContext; media: MethodologyAssetMedia[] }> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const { context, assets } = await supabaseGetSpecialtyAssets(specialtySlug);
  const assetIds = assets.map(a => a.id);

  if (assetIds.length === 0) {
    return { context, media: [] };
  }

  const { data, error } = await client
    .from('methodology_asset_media')
    .select('*')
    .in('asset_id', assetIds)
    .order('is_primary', { ascending: false })
    .order('created_at');

  if (error) mapRlsError('getSpecialtyAssetMedia', error);

  const media = ((data ?? []) as MethodologyAssetMediaRow[]).map(mapMethodologyAssetMedia);
  return { context, media };
}

export async function supabaseGetAssetMediaByAssetId(
  assetId: string,
): Promise<MethodologyAssetMedia[]> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const { data, error } = await client
    .from('methodology_asset_media')
    .select('*')
    .eq('asset_id', assetId)
    .order('is_primary', { ascending: false })
    .order('created_at');

  if (error) mapRlsError('getAssetMediaByAssetId', error);

  return ((data ?? []) as MethodologyAssetMediaRow[]).map(mapMethodologyAssetMedia);
}

export async function supabaseGetMethodologyAssetById(
  assetId: string,
): Promise<MethodologyAsset | null> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const { data, error } = await client
    .from('methodology_assets')
    .select('*')
    .eq('id', assetId)
    .maybeSingle();

  if (error) mapRlsError('getMethodologyAssetById', error);
  if (!data) return null;

  return mapMethodologyAsset(data as MethodologyAssetRow);
}
