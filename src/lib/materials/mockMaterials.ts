/**
 * Mock Materials Library — sample PDFs for Mesa 35 and Mesa 49.
 * No real file URLs; Apometria has no materials.
 */

import type { LibraryMaterial, LibraryMaterialLink } from '@/types/materials-library';

const NOW = '2024-01-01T00:00:00.000Z';

const MOCK_SPECIALTY_MESA35 = 'spec-rad35';
const MOCK_SPECIALTY_MESA49 = 'spec-rad49';

export const MOCK_LIBRARY_MATERIALS: LibraryMaterial[] = [
  {
    id: 'mock-material-mesa35-handbook',
    slug: 'mesa-35-manual-amostra',
    title: 'Manual Mesa 35 (amostra)',
    description:
      'Documento de apoio introdutório à metodologia dos 35 gráficos radiônicos. Conteúdo mock — sem ficheiro real.',
    materialType: 'pdf',
    fileUrl: undefined,
    thumbnailUrl: undefined,
    language: 'pt-PT',
    sourceName: 'Radionics App',
    sourceType: 'app_created',
    contentVersion: 'v1',
    isAppAdapted: true,
    visibility: 'certified_only',
    status: 'active',
    metadata: { mock: true },
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'mock-material-mesa49-handbook',
    slug: 'mesa-49-guia-amostra',
    title: 'Guia Mesa 49 — Símbolos Angelicais (amostra)',
    description:
      'Material de referência para protocolos com anjos e arcanjos. Conteúdo mock — sem ficheiro real.',
    materialType: 'pdf',
    fileUrl: undefined,
    thumbnailUrl: undefined,
    language: 'pt-PT',
    sourceName: 'Radionics App',
    sourceType: 'app_created',
    contentVersion: 'v1',
    isAppAdapted: true,
    visibility: 'certified_only',
    status: 'active',
    metadata: { mock: true },
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const MOCK_LIBRARY_MATERIAL_LINKS: LibraryMaterialLink[] = [
  {
    id: 'mock-link-mesa35-handbook',
    materialId: 'mock-material-mesa35-handbook',
    targetType: 'specialty',
    targetId: MOCK_SPECIALTY_MESA35,
    sortOrder: 0,
    isPrimary: true,
    status: 'active',
    metadata: {},
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'mock-link-mesa49-handbook',
    materialId: 'mock-material-mesa49-handbook',
    targetType: 'specialty',
    targetId: MOCK_SPECIALTY_MESA49,
    sortOrder: 0,
    isPrimary: true,
    status: 'active',
    metadata: {},
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const SPECIALTY_ID_BY_SLUG: Record<string, string> = {
  'mesa-35': MOCK_SPECIALTY_MESA35,
  'mesa-49': MOCK_SPECIALTY_MESA49,
  apometria: 'spec-apometria',
};

export function getMockSpecialtyIdForMaterials(slug: string): string | undefined {
  return SPECIALTY_ID_BY_SLUG[slug.trim().toLowerCase()];
}

export function getMockMaterialsForSpecialty(specialtySlug: string): LibraryMaterial[] {
  const specialtyId = getMockSpecialtyIdForMaterials(specialtySlug);
  if (!specialtyId) return [];

  const materialIds = new Set(
    MOCK_LIBRARY_MATERIAL_LINKS
      .filter(
        l =>
          l.targetType === 'specialty'
          && l.targetId === specialtyId
          && l.status === 'active',
      )
      .map(l => l.materialId),
  );

  return MOCK_LIBRARY_MATERIALS.filter(
    m => materialIds.has(m.id) && m.status === 'active' && m.visibility === 'certified_only',
  );
}

export function getMockMaterialBySlug(slug: string): LibraryMaterial | null {
  const normalized = slug.trim().toLowerCase();
  return MOCK_LIBRARY_MATERIALS.find(m => m.slug === normalized) ?? null;
}

export function getMockMaterialLinks(materialId: string): LibraryMaterialLink[] {
  return MOCK_LIBRARY_MATERIAL_LINKS.filter(
    l => l.materialId === materialId && l.status === 'active',
  );
}

export function getAllMockMaterials(): LibraryMaterial[] {
  return [...MOCK_LIBRARY_MATERIALS];
}
