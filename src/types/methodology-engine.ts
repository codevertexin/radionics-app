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
