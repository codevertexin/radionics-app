import type {
  ActivationScriptResource,
  MethodologyProtocol,
  MethodologyProtocolStatus,
  ProtocolStep,
} from '@/types/methodology-engine';
import type { ActivationScriptType } from '@/types/methodology-engine';

export type MethodologyProtocolRow = {
  id: string;
  specialty_id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  why_activate: string | null;
  status: string;
  sort_order: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type ProtocolStepRow = {
  id: string;
  protocol_id: string;
  step_number: number;
  title: string;
  instructions: string | null;
  activation_text: string | null;
  metadata: Record<string, unknown> | null;
};

export type ProtocolAssetRow = {
  id: string;
  protocol_id: string;
  asset_id: string;
  asset_role: string;
  sort_order: number;
  notes: string | null;
  methodology_assets: import('@/lib/supabase/methodologyEngineMappers').MethodologyAssetRow
    | import('@/lib/supabase/methodologyEngineMappers').MethodologyAssetRow[]
    | null;
};

export type ActivationScriptRow = {
  id: string;
  name: string;
  slug: string;
  script_type: string;
  content: string;
  status: string;
  is_active: boolean | null;
  source_name: string | null;
  source_reference: string | null;
  metadata: Record<string, unknown> | null;
};

export type ActivationScriptLinkRow = {
  id: string;
  activation_script_id: string;
  target_type: string;
  target_id: string;
  sort_order: number;
  activation_scripts: ActivationScriptRow | ActivationScriptRow[] | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function mapMethodologyProtocol(row: MethodologyProtocolRow): MethodologyProtocol {
  return {
    id: row.id,
    specialtyId: row.specialty_id,
    code: row.code,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    whyActivate: row.why_activate ?? undefined,
    status: row.status as MethodologyProtocolStatus,
    sortOrder: row.sort_order,
    metadata: asRecord(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProtocolStep(row: ProtocolStepRow): ProtocolStep {
  return {
    id: row.id,
    protocolId: row.protocol_id,
    stepNumber: row.step_number,
    title: row.title,
    instructions: row.instructions ?? undefined,
    activationText: row.activation_text ?? undefined,
    metadata: asRecord(row.metadata),
  };
}

export function mapActivationScriptResource(
  row: ActivationScriptRow,
  extras?: {
    assetId?: string;
    assetName?: string;
    assetSlug?: string;
    assetType?: ActivationScriptResource['assetType'];
    toolSlug?: string;
    imageUrl?: string;
    sortOrder?: number;
  },
): ActivationScriptResource {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    scriptType: row.script_type as ActivationScriptType,
    content: row.content,
    assetId: extras?.assetId,
    assetName: extras?.assetName,
    assetSlug: extras?.assetSlug,
    assetType: extras?.assetType,
    toolSlug: extras?.toolSlug,
    imageUrl: extras?.imageUrl,
    sourceName: row.source_name ?? undefined,
    sourceReference: row.source_reference ?? undefined,
    sortOrder: extras?.sortOrder ?? 0,
  };
}

export function unwrapJoin<T>(joined: T | T[] | null): T | null {
  if (!joined) return null;
  if (Array.isArray(joined)) return joined[0] ?? null;
  return joined;
}

export type { ActivationScriptType, MethodologyProtocolStatus } from '@/types/methodology-engine';
