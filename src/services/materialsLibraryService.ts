/**
 * Materials Library V2.8C — read-only educational resources service.
 */

import { isMockMode, isSupabaseMode } from '@/lib/dataMode';
import { groupMaterialsByType } from '@/lib/materials/materialGrouping';
import {
  MaterialsLibraryError,
  isMaterialsLibraryError,
} from '@/lib/materials/materialsErrors';
import {
  MOCK_LIBRARY_MATERIALS,
  getMockMaterialBySlug,
  getMockMaterialLinks,
  getMockMaterialsForSpecialty,
} from '@/lib/materials/mockMaterials';
import { getApprovedSpecialties } from '@/services/specialtiesService';
import * as supabaseMaterials from '@/services/supabase/materialsLibrarySupabase';
import type {
  LibraryMaterial,
  LibraryMaterialBundle,
  LibraryMaterialLink,
  SearchMaterialsOptions,
} from '@/types/materials-library';
import type { Specialty } from '@/types';

const delay = (ms = 80) => new Promise<void>(r => setTimeout(r, ms));

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

async function assertApprovedSpecialty(specialtySlug: string): Promise<Specialty> {
  const slug = normalizeSlug(specialtySlug);
  const approved = await getApprovedSpecialties();
  const specialty = approved.find(s => s.slug === slug);
  if (!specialty) {
    throw new MaterialsLibraryError(
      `Sem certificação aprovada para "${slug}".`,
      'MATERIAL_FORBIDDEN',
    );
  }
  return specialty;
}

function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matchesSearchQuery(material: LibraryMaterial, q: string): boolean {
  if (!q) return true;
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

function isMockMaterialReadable(
  material: LibraryMaterial,
  approvedSpecialtyIds: Set<string>,
): boolean {
  if (material.status !== 'active' || material.visibility !== 'certified_only') {
    return false;
  }
  return getMockMaterialLinks(material.id).some(
    l =>
      l.targetType === 'specialty'
      && l.status === 'active'
      && approvedSpecialtyIds.has(l.targetId),
  );
}

export { groupMaterialsByType };
export { MaterialsLibraryError, isMaterialsLibraryError };

/**
 * Active materials linked to the specialty (specialty grant link required in v1).
 * Supabase: relies on RLS + can_read_library_material.
 */
export async function listMaterialsForSpecialty(
  specialtySlug: string,
): Promise<LibraryMaterial[]> {
  await assertApprovedSpecialty(specialtySlug);
  const slug = normalizeSlug(specialtySlug);

  if (isMockMode()) {
    await delay();
    return getMockMaterialsForSpecialty(slug);
  }

  if (isSupabaseMode()) {
    return supabaseMaterials.supabaseListMaterialsForSpecialty(slug);
  }

  throw new MaterialsLibraryError('VITE_DATA_MODE inválido.', 'MATERIALS_NOT_AVAILABLE');
}

/** Returns one material if readable (RLS in Supabase mode). */
export async function getMaterialBySlug(slug: string): Promise<LibraryMaterial | null> {
  const normalized = normalizeSlug(slug);
  if (!normalized) return null;

  if (isMockMode()) {
    await delay();
    const material = getMockMaterialBySlug(normalized);
    if (!material) return null;

    const approved = await getApprovedSpecialties();
    const approvedIds = new Set(approved.map(s => s.id));
    return isMockMaterialReadable(material, approvedIds) ? material : null;
  }

  if (isSupabaseMode()) {
    return supabaseMaterials.supabaseGetMaterialBySlug(normalized);
  }

  throw new MaterialsLibraryError('VITE_DATA_MODE inválido.', 'MATERIALS_NOT_AVAILABLE');
}

/** Active links for a material if the material is readable. */
export async function listMaterialLinks(materialId: string): Promise<LibraryMaterialLink[]> {
  if (isMockMode()) {
    await delay();
    const material = MOCK_LIBRARY_MATERIALS.find(m => m.id === materialId);
    if (!material) {
      throw new MaterialsLibraryError('Material não encontrado.', 'MATERIAL_NOT_FOUND');
    }

    const approved = await getApprovedSpecialties();
    if (!isMockMaterialReadable(material, new Set(approved.map(s => s.id)))) {
      throw new MaterialsLibraryError('Sem permissão para ler este material.', 'MATERIAL_FORBIDDEN');
    }

    return getMockMaterialLinks(materialId);
  }

  if (isSupabaseMode()) {
    return supabaseMaterials.supabaseListMaterialLinks(materialId);
  }

  throw new MaterialsLibraryError('VITE_DATA_MODE inválido.', 'MATERIALS_NOT_AVAILABLE');
}

/** Search materials across certified specialties (or one specialty). */
export async function searchMaterials(
  query: string,
  options?: SearchMaterialsOptions,
): Promise<LibraryMaterial[]> {
  const q = normalizeSearchQuery(query);

  if (isMockMode()) {
    await delay();
    const approved = await getApprovedSpecialties();
    const targets = options?.specialtySlug
      ? approved.filter(s => s.slug === normalizeSlug(options.specialtySlug!))
      : approved;

    const seen = new Set<string>();
    const results: LibraryMaterial[] = [];

    for (const specialty of targets) {
      for (const material of getMockMaterialsForSpecialty(specialty.slug)) {
        if (seen.has(material.id)) continue;
        if (options?.materialType && material.materialType !== options.materialType) continue;
        if (options?.language && material.language !== options.language) continue;
        if (!matchesSearchQuery(material, q)) continue;
        seen.add(material.id);
        results.push(material);
      }
    }

    return results.sort((a, b) => a.title.localeCompare(b.title, 'pt'));
  }

  if (isSupabaseMode()) {
    if (options?.specialtySlug) {
      const specialty = await assertApprovedSpecialty(options.specialtySlug);
      return supabaseMaterials.supabaseSearchMaterials(q, {
        specialtyId: specialty.id,
        materialType: options?.materialType,
        language: options?.language,
      });
    }

    const approved = await getApprovedSpecialties();
    const merged: LibraryMaterial[] = [];
    const seen = new Set<string>();

    for (const specialty of approved) {
      const batch = await supabaseMaterials.supabaseSearchMaterials(q, {
        specialtyId: specialty.id,
        materialType: options?.materialType,
        language: options?.language,
      });
      for (const m of batch) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          merged.push(m);
        }
      }
    }

    return merged.sort((a, b) => a.title.localeCompare(b.title, 'pt'));
  }

  throw new MaterialsLibraryError('VITE_DATA_MODE inválido.', 'MATERIALS_NOT_AVAILABLE');
}

/** Material + links bundle for detail views (V2.8D). */
export async function getMaterialBundleBySlug(slug: string): Promise<LibraryMaterialBundle | null> {
  const material = await getMaterialBySlug(slug);
  if (!material) return null;
  const links = await listMaterialLinks(material.id);
  return { material, links };
}
