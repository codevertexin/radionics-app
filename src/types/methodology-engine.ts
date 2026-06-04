// Methodology Engine V2 — read model (Supabase tables + mock parity)

export type MethodologyToolType =
  | 'graph_set' | 'symbol_set' | 'angel_set' | 'archangel_set' | 'chakra_set'
  | 'hawkins_scale' | 'radionic_clock' | 'decagon' | 'selector' | 'crystal_set'
  | 'ray_set' | 'master_set' | 'protocol_set' | 'reference_set' | 'other';

export type MethodologyUsageMode =
  | 'activation' | 'measurement' | 'analysis' | 'support' | 'reference' | 'mixed';

export type MethodologyCatalogStatus = 'active' | 'inactive' | 'draft';

export type MethodologyAssetType =
  | 'graph' | 'symbol' | 'angel' | 'archangel' | 'chakra' | 'hawkins_level'
  | 'clock_item' | 'decagon' | 'selector_option' | 'crystal' | 'ray' | 'master'
  | 'cause' | 'body' | 'organ' | 'protocol_component' | 'reference' | 'other';

export interface MethodologyTool {
  id: string;
  name: string;
  slug: string;
  description?: string;
  toolType: MethodologyToolType;
  usageMode: MethodologyUsageMode;
  status: MethodologyCatalogStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MethodologyAsset {
  id: string;
  toolId: string;
  name: string;
  slug: string;
  code?: string;
  canonicalName?: string;
  originalName?: string;
  aliases: string[];
  assetType: MethodologyAssetType;
  usageMode: MethodologyUsageMode;
  baseDescription?: string;
  imageUrl?: string;
  metadata: Record<string, unknown>;
  status: MethodologyCatalogStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type MethodologyProtocolStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface MethodologyProtocol {
  id: string;
  specialtyId: string;
  code: string;
  name: string;
  slug: string;
  description?: string;
  whyActivate?: string;
  status: MethodologyProtocolStatus;
  sortOrder: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ProtocolStep {
  id: string;
  protocolId: string;
  stepNumber: number;
  title: string;
  instructions?: string;
  activationText?: string;
  metadata: Record<string, unknown>;
}

export interface ProtocolAssetLink {
  id: string;
  protocolId: string;
  assetId: string;
  assetRole: string;
  sortOrder: number;
  notes?: string;
  asset: MethodologyAsset;
}

export interface MethodologyProtocolDetail extends MethodologyProtocol {
  steps: ProtocolStep[];
  assets: ProtocolAssetLink[];
}

export type ActivationScriptType =
  | 'activation' | 'deactivation' | 'prayer' | 'decree' | 'visualization'
  | 'instruction' | 'opening' | 'closing' | 'protection' | 'other';

export interface ActivationScriptResource {
  id: string;
  name: string;
  slug: string;
  scriptType: ActivationScriptType;
  content: string;
  assetId?: string;
  assetName?: string;
  assetSlug?: string;
  assetType?: MethodologyAssetType;
  toolSlug?: string;
  imageUrl?: string;
  sourceName?: string;
  sourceReference?: string;
  sortOrder: number;
}

/** Asset enriched for the Resources browse/detail UI. */
export interface ResourceAssetView extends MethodologyAsset {
  content?: SpecialtyAssetContent;
  imageUrlResolved?: string;
  toolName?: string;
  toolSlug?: string;
  relatedProtocolSlugs?: string[];
}

export interface SpecialtyResourceSummary {
  specialtyId: string;
  specialtySlug: string;
  specialtyName: string;
  toolCount: number;
  assetCount: number;
  protocolCount: number;
  activationCount: number;
  materialCount: number;
}

export type ResourceSearchField = 'name' | 'canonical_name' | 'original_name' | 'aliases';

export type ResourceSearchResultKind = 'asset' | 'protocol' | 'activation';

export interface ResourceSearchResult {
  kind: ResourceSearchResultKind;
  specialtySlug: string;
  specialtyName: string;
  id: string;
  slug: string;
  name: string;
  matchedField: ResourceSearchField | 'content';
  subtitle?: string;
  assetType?: MethodologyAssetType;
}

export interface SpecialtyToolLink {
  id: string;
  specialtyId: string;
  toolId: string;
  isRequired: boolean;
  isVisibleInWorkspace: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  tool: MethodologyTool;
}

export interface SpecialtyAssetContent {
  id: string;
  specialtyId: string;
  assetId: string;
  title?: string;
  therapistExplanation?: string;
  clientExplanation?: string;
  activationText?: string;
  interpretation?: string;
  recommendedUse?: string;
  notes?: string;
  metadata: Record<string, unknown>;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialtyMethodologyContext {
  specialtyId: string;
  specialtySlug: string;
  specialtyName: string;
}

export type MediaType = 'image' | 'pdf' | 'audio' | 'video' | 'document' | 'other';

export type MediaStorageProvider = 'bunny' | 'supabase' | 'external' | 'app_public' | 'other';

export type MediaSourceType =
  | 'app_default'
  | 'teacher_original'
  | 'course_material'
  | 'generated'
  | 'custom_upload'
  | 'fallback';

export type MediaQualityStatus =
  | 'approved'
  | 'needs_review'
  | 'low_quality'
  | 'replaced'
  | 'deprecated';

/** Contextual media row — methodology_assets.image_url remains legacy fallback only. */
export interface MethodologyAssetMedia {
  id: string;
  assetId: string;
  specialtyId?: string;
  toolId?: string;
  mediaType: MediaType;
  url: string;
  storageProvider: MediaStorageProvider;
  sourceType: MediaSourceType;
  sourceName?: string;
  altText?: string;
  caption?: string;
  qualityStatus: MediaQualityStatus;
  isPrimary: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
