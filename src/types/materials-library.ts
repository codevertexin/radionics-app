/** Materials Library V2.8 — educational/support resources (not methodology assets). */

export type LibraryMaterialType =
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'link'
  | 'document'
  | 'other';

export type LibraryMaterialVisibility = 'certified_only' | 'admin_only';

export type LibraryMaterialStatus = 'active' | 'inactive' | 'draft' | 'archived';

export type LibraryMaterialSourceType =
  | 'teacher'
  | 'official'
  | 'app_created'
  | 'external'
  | 'course_material'
  | 'imported';

export type LibraryMaterialTargetType = 'specialty' | 'asset' | 'protocol';

export type LibraryMaterialLinkStatus = 'active' | 'inactive';

export interface LibraryMaterial {
  id: string;
  slug: string;
  title: string;
  description?: string;
  materialType: LibraryMaterialType;
  fileUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  language: string;
  sourceName?: string;
  sourceType: LibraryMaterialSourceType;
  sourceReference?: string;
  contentVersion: string;
  isAppAdapted: boolean;
  visibility: LibraryMaterialVisibility;
  status: LibraryMaterialStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryMaterialLink {
  id: string;
  materialId: string;
  targetType: LibraryMaterialTargetType;
  targetId: string;
  sortOrder: number;
  isPrimary: boolean;
  status: LibraryMaterialLinkStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** Material with its association links (read/detail). */
export interface LibraryMaterialBundle {
  material: LibraryMaterial;
  links: LibraryMaterialLink[];
}

export interface MaterialTypeGroup {
  type: LibraryMaterialType;
  label: string;
  materials: LibraryMaterial[];
}

export interface SearchMaterialsOptions {
  specialtySlug?: string;
  materialType?: LibraryMaterialType;
  language?: string;
}
