import { mapMaterialsSupabaseError } from '@/lib/materials/materialsErrors';
import { MaterialsLibraryError } from '@/lib/materials/materialsErrors';
import { requireSupabaseClient } from '@/lib/dataMode';
import {
  mapLibraryMaterial,
  mapLibraryMaterialLink,
  type LibraryMaterialLinkRow,
  type LibraryMaterialRow,
} from '@/lib/supabase/materialsLibraryMappers';
import { requireAuthUserId } from '@/lib/supabase/auth';
import type { LibraryMaterial, LibraryMaterialLink } from '@/types/materials-library';
import { resolveSpecialtyBySlug } from '@/services/supabase/methodologyEngineSupabase';

export async function supabaseListMaterialsForSpecialty(
  specialtySlug: string,
): Promise<LibraryMaterial[]> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const context = await resolveSpecialtyBySlug(specialtySlug);

  const { data: links, error: linksError } = await client
    .from('library_material_links')
    .select('material_id')
    .eq('target_type', 'specialty')
    .eq('target_id', context.specialtyId)
    .eq('status', 'active');

  if (linksError) mapMaterialsSupabaseError('listMaterialsForSpecialty.links', linksError);

  const materialIds = [
    ...new Set((links ?? []).map(row => row.material_id as string)),
  ];

  if (materialIds.length === 0) return [];

  const { data, error } = await client
    .from('library_materials')
    .select('*')
    .in('id', materialIds)
    .eq('status', 'active')
    .eq('visibility', 'certified_only')
    .order('title');

  if (error) mapMaterialsSupabaseError('listMaterialsForSpecialty', error);

  return ((data ?? []) as LibraryMaterialRow[]).map(mapLibraryMaterial);
}

export async function supabaseGetMaterialBySlug(slug: string): Promise<LibraryMaterial | null> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const { data, error } = await client
    .from('library_materials')
    .select('*')
    .eq('slug', slug.trim().toLowerCase())
    .maybeSingle();

  if (error) mapMaterialsSupabaseError('getMaterialBySlug', error);
  if (!data) return null;

  return mapLibraryMaterial(data as LibraryMaterialRow);
}

export async function supabaseListMaterialLinks(
  materialId: string,
): Promise<LibraryMaterialLink[]> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const { data: material, error: materialError } = await client
    .from('library_materials')
    .select('id')
    .eq('id', materialId)
    .maybeSingle();

  if (materialError) mapMaterialsSupabaseError('listMaterialLinks.material', materialError);
  if (!material) {
    throw new MaterialsLibraryError('Material não encontrado.', 'MATERIAL_NOT_FOUND');
  }

  const { data, error } = await client
    .from('library_material_links')
    .select('*')
    .eq('material_id', materialId)
    .eq('status', 'active')
    .order('sort_order');

  if (error) mapMaterialsSupabaseError('listMaterialLinks', error);

  return ((data ?? []) as LibraryMaterialLinkRow[]).map(mapLibraryMaterialLink);
}

export async function supabaseSearchMaterials(
  query: string,
  options?: {
    specialtyId?: string;
    materialType?: string;
    language?: string;
  },
): Promise<LibraryMaterial[]> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  let materialIds: string[] | undefined;

  if (options?.specialtyId) {
    const { data: links, error: linksError } = await client
      .from('library_material_links')
      .select('material_id')
      .eq('target_type', 'specialty')
      .eq('target_id', options.specialtyId)
      .eq('status', 'active');

    if (linksError) mapMaterialsSupabaseError('searchMaterials.links', linksError);

    materialIds = [...new Set((links ?? []).map(row => row.material_id as string))];
    if (materialIds.length === 0) return [];
  }

  let builder = client
    .from('library_materials')
    .select('*')
    .eq('status', 'active')
    .eq('visibility', 'certified_only');

  if (materialIds) {
    builder = builder.in('id', materialIds);
  }

  if (options?.materialType) {
    builder = builder.eq('material_type', options.materialType);
  }

  if (options?.language) {
    builder = builder.eq('language', options.language);
  }

  const { data, error } = await builder.order('title');

  if (error) mapMaterialsSupabaseError('searchMaterials', error);

  const q = query.trim().toLowerCase();
  if (!q) {
    return ((data ?? []) as LibraryMaterialRow[]).map(mapLibraryMaterial);
  }

  return ((data ?? []) as LibraryMaterialRow[])
    .map(mapLibraryMaterial)
    .filter(m => matchesMaterialSearchQuery(m, q));
}

function matchesMaterialSearchQuery(
  material: LibraryMaterial,
  q: string,
): boolean {
  const haystack = [
    material.title,
    material.description,
    material.sourceName,
    material.materialType,
    material.language,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(q);
}
