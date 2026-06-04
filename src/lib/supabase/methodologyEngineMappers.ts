import type {
  MethodologyAsset,
  MethodologyAssetMedia,
  MethodologyAssetType,
  MethodologyCatalogStatus,
  MediaQualityStatus,
  MediaSourceType,
  MediaStorageProvider,
  MediaType,
  MethodologyTool,
  MethodologyToolType,
  MethodologyUsageMode,
  SpecialtyAssetContent,
  SpecialtyToolLink,
} from '@/types';

export type MethodologyToolRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tool_type: string;
  usage_mode: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MethodologyAssetRow = {
  id: string;
  tool_id: string;
  name: string;
  slug: string;
  code: string | null;
  canonical_name: string | null;
  original_name: string | null;
  aliases: string[] | null;
  asset_type: string;
  usage_mode: string;
  base_description: string | null;
  image_url: string | null;
  metadata: Record<string, unknown> | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SpecialtyToolRow = {
  id: string;
  specialty_id: string;
  tool_id: string;
  is_required: boolean;
  is_visible_in_workspace: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  methodology_tools: MethodologyToolRow | MethodologyToolRow[] | null;
};

export type SpecialtyAssetContentRow = {
  id: string;
  specialty_id: string;
  asset_id: string;
  title: string | null;
  therapist_explanation: string | null;
  client_explanation: string | null;
  activation_text: string | null;
  interpretation: string | null;
  recommended_use: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SpecialtySlugRow = {
  id: string;
  name: string;
  slug: string;
};

export type MethodologyAssetMediaRow = {
  id: string;
  asset_id: string;
  specialty_id: string | null;
  tool_id: string | null;
  media_type: string;
  url: string;
  storage_provider: string;
  source_type: string;
  source_name: string | null;
  alt_text: string | null;
  caption: string | null;
  quality_status: string;
  is_primary: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function mapMethodologyTool(row: MethodologyToolRow): MethodologyTool {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    toolType: row.tool_type as MethodologyToolType,
    usageMode: row.usage_mode as MethodologyUsageMode,
    status: row.status as MethodologyCatalogStatus,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMethodologyAsset(row: MethodologyAssetRow): MethodologyAsset {
  return {
    id: row.id,
    toolId: row.tool_id,
    name: row.name,
    slug: row.slug,
    code: row.code ?? undefined,
    canonicalName: row.canonical_name ?? undefined,
    originalName: row.original_name ?? undefined,
    aliases: row.aliases ?? [],
    assetType: row.asset_type as MethodologyAssetType,
    usageMode: row.usage_mode as MethodologyUsageMode,
    baseDescription: row.base_description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    metadata: asRecord(row.metadata),
    status: row.status as MethodologyCatalogStatus,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function unwrapToolJoin(
  joined: MethodologyToolRow | MethodologyToolRow[] | null,
): MethodologyToolRow | null {
  if (!joined) return null;
  if (Array.isArray(joined)) return joined[0] ?? null;
  return joined;
}

export function mapSpecialtyToolLink(row: SpecialtyToolRow): SpecialtyToolLink {
  const toolRow = unwrapToolJoin(row.methodology_tools);
  if (!toolRow) {
    throw new Error('specialty_tools row missing methodology_tools join');
  }
  return {
    id: row.id,
    specialtyId: row.specialty_id,
    toolId: row.tool_id,
    isRequired: row.is_required,
    isVisibleInWorkspace: row.is_visible_in_workspace,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tool: mapMethodologyTool(toolRow),
  };
}

export function mapMethodologyAssetMedia(row: MethodologyAssetMediaRow): MethodologyAssetMedia {
  return {
    id: row.id,
    assetId: row.asset_id,
    specialtyId: row.specialty_id ?? undefined,
    toolId: row.tool_id ?? undefined,
    mediaType: row.media_type as MediaType,
    url: row.url,
    storageProvider: row.storage_provider as MediaStorageProvider,
    sourceType: row.source_type as MediaSourceType,
    sourceName: row.source_name ?? undefined,
    altText: row.alt_text ?? undefined,
    caption: row.caption ?? undefined,
    qualityStatus: row.quality_status as MediaQualityStatus,
    isPrimary: row.is_primary,
    metadata: asRecord(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSpecialtyAssetContent(row: SpecialtyAssetContentRow): SpecialtyAssetContent {
  return {
    id: row.id,
    specialtyId: row.specialty_id,
    assetId: row.asset_id,
    title: row.title ?? undefined,
    therapistExplanation: row.therapist_explanation ?? undefined,
    clientExplanation: row.client_explanation ?? undefined,
    activationText: row.activation_text ?? undefined,
    interpretation: row.interpretation ?? undefined,
    recommendedUse: row.recommended_use ?? undefined,
    notes: row.notes ?? undefined,
    metadata: asRecord(row.metadata),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
