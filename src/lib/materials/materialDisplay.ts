import type { LibraryMaterial, LibraryMaterialType } from '@/types/materials-library';

export const MATERIAL_TYPE_GROUP_ICONS: Record<LibraryMaterialType, string> = {
  pdf: '📚',
  image: '🖼',
  video: '🎥',
  audio: '🎧',
  link: '🔗',
  document: '📄',
  other: '📦',
};

export function formatGroupHeading(type: LibraryMaterialType, label: string): string {
  return `${MATERIAL_TYPE_GROUP_ICONS[type]} ${label}`;
}

export function formatMaterialSourceLabel(material: LibraryMaterial): string | undefined {
  if (material.sourceName?.trim()) {
    const name = material.sourceName.trim();
    if (material.sourceType === 'teacher' && !/^prof/i.test(name)) {
      return `Prof. ${name}`;
    }
    return name;
  }

  switch (material.sourceType) {
    case 'app_created':
      return 'RADIONICS';
    case 'official':
      return 'Material oficial';
    case 'teacher':
      return 'Professor';
    case 'external':
      return 'Fonte externa';
    case 'course_material':
      return 'Material de curso';
    case 'imported':
      return 'Material importado';
    default:
      return undefined;
  }
}

export function formatDuration(seconds?: number): string | undefined {
  if (seconds == null || seconds < 0) return undefined;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatFileSize(bytes?: number): string | undefined {
  if (bytes == null || bytes <= 0) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getMaterialOpenUrl(material: LibraryMaterial): string | undefined {
  if (material.materialType === 'link') {
    return material.externalUrl ?? material.fileUrl;
  }
  return material.fileUrl ?? material.externalUrl;
}

export function getMaterialActionLabel(material: LibraryMaterial): string {
  switch (material.materialType) {
    case 'video':
      return 'Ver vídeo';
    case 'audio':
      return 'Ouvir';
    case 'link':
      return 'Abrir ligação externa';
    default:
      return 'Abrir';
  }
}

export function truncateDescription(text: string | undefined, max = 140): string | undefined {
  if (!text?.trim()) return undefined;
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}
