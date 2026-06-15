import type {
  LibraryMaterial,
  LibraryMaterialLink,
  LibraryMaterialLinkStatus,
  LibraryMaterialSourceType,
  LibraryMaterialStatus,
  LibraryMaterialTargetType,
  LibraryMaterialType,
  LibraryMaterialVisibility,
} from '@/types/materials-library';

export interface LibraryMaterialRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  material_type: string;
  file_url: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  language: string;
  source_name: string | null;
  source_type: string;
  source_reference: string | null;
  content_version: string;
  is_app_adapted: boolean;
  visibility: string;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface LibraryMaterialLinkRow {
  id: string;
  material_id: string;
  target_type: string;
  target_id: string;
  sort_order: number;
  is_primary: boolean;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export function mapLibraryMaterial(row: LibraryMaterialRow): LibraryMaterial {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? undefined,
    materialType: row.material_type as LibraryMaterialType,
    fileUrl: row.file_url ?? undefined,
    externalUrl: row.external_url ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    durationSeconds: row.duration_seconds ?? undefined,
    fileSizeBytes: row.file_size_bytes ?? undefined,
    language: row.language,
    sourceName: row.source_name ?? undefined,
    sourceType: row.source_type as LibraryMaterialSourceType,
    sourceReference: row.source_reference ?? undefined,
    contentVersion: row.content_version,
    isAppAdapted: row.is_app_adapted,
    visibility: row.visibility as LibraryMaterialVisibility,
    status: row.status as LibraryMaterialStatus,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapLibraryMaterialLink(row: LibraryMaterialLinkRow): LibraryMaterialLink {
  return {
    id: row.id,
    materialId: row.material_id,
    targetType: row.target_type as LibraryMaterialTargetType,
    targetId: row.target_id,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
    status: row.status as LibraryMaterialLinkStatus,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
