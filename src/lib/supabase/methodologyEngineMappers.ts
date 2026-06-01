import type {
  MethodologyAsset,
  MethodologyAssetType,
  MethodologyCatalogStatus,
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
