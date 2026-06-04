import { MethodologyEngineError } from '@/lib/methodology/errors';
import { mapMethodologyAsset } from '@/lib/supabase/methodologyEngineMappers';
import {
  mapActivationScriptResource,
  mapMethodologyProtocol,
  mapProtocolStep,
  unwrapJoin,
  type ActivationScriptLinkRow,
  type MethodologyProtocolRow,
  type ProtocolAssetRow,
  type ProtocolStepRow,
} from '@/lib/supabase/resourceLibraryMappers';
import { requireSupabaseClient } from '@/lib/dataMode';
import { requireAuthUserId } from '@/lib/supabase/auth';
import { wrapSupabaseError } from '@/lib/supabase/errors';
import type {
  ActivationScriptResource,
  MethodologyProtocol,
  MethodologyProtocolDetail,
  ProtocolAssetLink,
  SpecialtyMethodologyContext,
} from '@/types';
import { resolveSpecialtyBySlug } from '@/services/supabase/methodologyEngineSupabase';

function mapRlsError(context: string, error: { message: string; code?: string }): never {
  const msg = error.message.toLowerCase();
  if (
    error.code === '42501'
    || msg.includes('row-level security')
    || msg.includes('permission denied')
  ) {
    throw new MethodologyEngineError(
      `[${context}] Sem permissão para ler recursos. `
        + 'Certifique-se de que tem certificação aprovada para esta especialidade.',
      'RLS',
    );
  }
  wrapSupabaseError(context, error);
}

export async function supabaseGetSpecialtyProtocols(
  specialtySlug: string,
): Promise<{ context: SpecialtyMethodologyContext; protocols: MethodologyProtocol[] }> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const context = await resolveSpecialtyBySlug(specialtySlug);

  const { data, error } = await client
    .from('methodology_protocols')
    .select('*')
    .eq('specialty_id', context.specialtyId)
    .eq('status', 'active')
    .order('sort_order');

  if (error) mapRlsError('getSpecialtyProtocols', error);

  const protocols = ((data ?? []) as MethodologyProtocolRow[]).map(mapMethodologyProtocol);
  return { context, protocols };
}

export async function supabaseGetProtocolDetail(
  specialtySlug: string,
  protocolSlug: string,
): Promise<MethodologyProtocolDetail | null> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const context = await resolveSpecialtyBySlug(specialtySlug);

  const { data: protocolRow, error: protocolError } = await client
    .from('methodology_protocols')
    .select('*')
    .eq('specialty_id', context.specialtyId)
    .eq('slug', protocolSlug)
    .eq('status', 'active')
    .maybeSingle();

  if (protocolError) mapRlsError('getProtocolDetail', protocolError);
  if (!protocolRow) return null;

  const protocol = mapMethodologyProtocol(protocolRow as MethodologyProtocolRow);

  const [stepsResult, assetsResult] = await Promise.all([
    client
      .from('protocol_steps')
      .select('*')
      .eq('protocol_id', protocol.id)
      .order('step_number'),
    client
      .from('protocol_assets')
      .select(`
        id,
        protocol_id,
        asset_id,
        asset_role,
        sort_order,
        notes,
        methodology_assets (*)
      `)
      .eq('protocol_id', protocol.id)
      .order('sort_order'),
  ]);

  if (stepsResult.error) mapRlsError('getProtocolSteps', stepsResult.error);
  if (assetsResult.error) mapRlsError('getProtocolAssets', assetsResult.error);

  const steps = ((stepsResult.data ?? []) as ProtocolStepRow[]).map(mapProtocolStep);
  const assets: ProtocolAssetLink[] = ((assetsResult.data ?? []) as ProtocolAssetRow[])
    .flatMap(row => {
      const assetRow = unwrapJoin(row.methodology_assets);
      if (!assetRow) return [];
      return [{
        id: row.id,
        protocolId: row.protocol_id,
        assetId: row.asset_id,
        assetRole: row.asset_role,
        sortOrder: row.sort_order,
        notes: row.notes ?? undefined,
        asset: mapMethodologyAsset(assetRow),
      }];
    });

  return { ...protocol, steps, assets };
}

export async function supabaseGetSpecialtyActivationScripts(
  specialtySlug: string,
): Promise<{ context: SpecialtyMethodologyContext; scripts: ActivationScriptResource[] }> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const context = await resolveSpecialtyBySlug(specialtySlug);

  const { data: contentRows, error: contentError } = await client
    .from('specialty_asset_content')
    .select('id, asset_id, is_active')
    .eq('specialty_id', context.specialtyId)
    .eq('is_active', true);

  if (contentError) mapRlsError('getSpecialtyActivationScripts.content', contentError);

  const contentIds = (contentRows ?? []).map(r => r.id as string);
  if (contentIds.length === 0) {
    return { context, scripts: [] };
  }

  const contentById = new Map(
    (contentRows ?? []).map(r => [r.id as string, r.asset_id as string]),
  );

  const { data: assetRows, error: assetError } = await client
    .from('methodology_assets')
    .select('id, name, slug, asset_type')
    .in('id', [...new Set([...contentById.values()])]);

  if (assetError) mapRlsError('getSpecialtyActivationScripts.assets', assetError);

  const assetById = new Map(
    (assetRows ?? []).map(r => [
      r.id as string,
      { name: r.name as string, slug: r.slug as string, assetType: r.asset_type as string },
    ]),
  );

  const { data: linkRows, error: linkError } = await client
    .from('activation_script_links')
    .select(`
      id,
      activation_script_id,
      target_type,
      target_id,
      sort_order,
      activation_scripts (
        id,
        name,
        slug,
        script_type,
        content,
        status,
        is_active,
        metadata
      )
    `)
    .eq('target_type', 'specialty_asset_content')
    .in('target_id', contentIds)
    .order('sort_order');

  if (linkError) mapRlsError('getSpecialtyActivationScripts.links', linkError);

  const scripts: ActivationScriptResource[] = [];
  const seen = new Set<string>();

  for (const link of (linkRows ?? []) as ActivationScriptLinkRow[]) {
    const scriptRow = unwrapJoin(link.activation_scripts);
    if (!scriptRow || scriptRow.status !== 'active' || scriptRow.is_active === false) continue;

    const dedupeKey = `${scriptRow.id}:${link.target_id}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const assetId = contentById.get(link.target_id);
    const asset = assetId ? assetById.get(assetId) : undefined;

    scripts.push(
      mapActivationScriptResource(scriptRow, {
        assetId,
        assetName: asset?.name,
        assetSlug: asset?.slug,
        assetType: asset?.assetType as ActivationScriptResource['assetType'],
        sortOrder: link.sort_order,
      }),
    );
  }

  scripts.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'pt'));
  return { context, scripts };
}

export async function supabaseGetProtocolsForAsset(
  specialtySlug: string,
  assetId: string,
): Promise<MethodologyProtocol[]> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const context = await resolveSpecialtyBySlug(specialtySlug);

  const { data: linkRows, error: linkError } = await client
    .from('protocol_assets')
    .select(`
      protocol_id,
      methodology_protocols!inner (
        id,
        specialty_id,
        code,
        name,
        slug,
        description,
        why_activate,
        status,
        sort_order,
        metadata,
        created_at,
        updated_at
      )
    `)
    .eq('asset_id', assetId);

  if (linkError) mapRlsError('getProtocolsForAsset', linkError);

  const protocols: MethodologyProtocol[] = [];
  const seen = new Set<string>();

  for (const row of linkRows ?? []) {
    const protocolRow = unwrapJoin(
      (row as { methodology_protocols: MethodologyProtocolRow | MethodologyProtocolRow[] })
        .methodology_protocols,
    );
    if (!protocolRow || protocolRow.specialty_id !== context.specialtyId) continue;
    if (protocolRow.status !== 'active' || seen.has(protocolRow.id)) continue;
    seen.add(protocolRow.id);
    protocols.push(mapMethodologyProtocol(protocolRow));
  }

  return protocols.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Re-export for resource library service. */
export { resolveSpecialtyBySlug };
