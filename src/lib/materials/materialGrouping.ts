import type { LibraryMaterial, LibraryMaterialType, MaterialTypeGroup } from '@/types/materials-library';

export const MATERIAL_TYPE_LABELS: Record<LibraryMaterialType, string> = {
  pdf: 'PDFs',
  image: 'Imagens',
  video: 'Vídeos',
  audio: 'Áudios',
  link: 'Links',
  document: 'Documentos',
  other: 'Outros',
};

export const MATERIAL_TYPE_ORDER: LibraryMaterialType[] = [
  'pdf',
  'image',
  'video',
  'audio',
  'link',
  'document',
  'other',
];

/** Groups materials by type for Resources UI (V2.8D). */
export function groupMaterialsByType(materials: LibraryMaterial[]): MaterialTypeGroup[] {
  const byType = new Map<LibraryMaterialType, LibraryMaterial[]>();

  for (const material of materials) {
    const list = byType.get(material.materialType) ?? [];
    list.push(material);
    byType.set(material.materialType, list);
  }

  return MATERIAL_TYPE_ORDER
    .filter(type => (byType.get(type)?.length ?? 0) > 0)
    .map(type => ({
      type,
      label: MATERIAL_TYPE_LABELS[type],
      materials: byType.get(type) ?? [],
    }));
}
