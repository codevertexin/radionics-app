/** Workflow Engine V3.0 — versioned session orchestration (schema V3.0B). */

export type WorkflowTemplateStatus = 'active' | 'inactive' | 'draft' | 'archived';

export type WorkflowStepStatus = 'active' | 'inactive';

export type WorkflowStepType =
  | 'preparation'
  | 'connection'
  | 'measurement'
  | 'diagnosis'
  | 'selection'
  | 'activation'
  | 'protocol'
  | 'closing'
  | 'report';

/** Simple conditional predicates in workflow_steps.config (v1 — no rule engine). */
export interface WorkflowCondition {
  requires_asset_type?: string;
  requires_protocol_selected?: boolean;
}

export type WorkflowMeasurementMode = 'initial' | 'final';

/** Generic measurement step — Hawkins uses tool_slug = hawkins-scale. */
export interface WorkflowMeasurementConfig {
  tool_slug: string;
  mode: WorkflowMeasurementMode;
}

export interface WorkflowAssetPickerConfig {
  tool_slug: string;
  multi?: boolean;
  max?: number;
}

/** Protocol steps run inline inside the workflow (v1). */
export interface WorkflowProtocolConfig {
  allow_browse?: boolean;
  filter_by_specialty?: boolean;
  inline?: boolean;
}

export interface WorkflowStepConfig {
  condition?: WorkflowCondition;
  measurement?: WorkflowMeasurementConfig;
  asset_picker?: WorkflowAssetPickerConfig;
  protocol?: WorkflowProtocolConfig;
  activation?: {
    require_script_read?: boolean;
    show_image?: boolean;
  };
  output_schema?: {
    fields: string[];
  };
}

/** Maps to: workflow_templates */
export interface WorkflowTemplate {
  id: string;
  specialtyId: string;
  slug: string;
  name: string;
  description?: string;
  version: string;
  status: WorkflowTemplateStatus;
  isDefault: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** Maps to: workflow_steps */
export interface WorkflowStep {
  id: string;
  workflowTemplateId: string;
  stepOrder: number;
  stepCode: string;
  stepType: WorkflowStepType;
  label: string;
  instructions?: string;
  config: WorkflowStepConfig;
  status: WorkflowStepStatus;
  createdAt: string;
  updatedAt: string;
}

/** Template with ordered steps (read/detail — V3.0C+). */
export interface WorkflowTemplateBundle {
  template: WorkflowTemplate;
  steps: WorkflowStep[];
}

/** Minimal session context for condition evaluation and content resolution (read-only). */
export interface WorkflowSessionContext {
  selectedProtocolId?: string;
  /** Asset types present in the selected protocol (e.g. graph, angel). */
  selectedProtocolAssetTypes?: string[];
  /** Optional keyed outputs by step_code — for future adapter use. */
  stepOutputs?: Record<string, Record<string, unknown>>;
}

export interface WorkflowConditionEvaluation {
  condition: WorkflowCondition;
  satisfied: boolean;
  reason: string;
}

/** Lightweight read-only content references resolved from step.config. */
export interface WorkflowStepResolvedContent {
  stepId: string;
  stepCode: string;
  stepType: WorkflowStepType;
  condition?: WorkflowConditionEvaluation;
  measurement?: {
    toolSlug: string;
    mode?: WorkflowMeasurementMode;
    available: boolean;
    toolId?: string;
  };
  assetPicker?: {
    toolSlug: string;
    multi?: boolean;
    max?: number;
    available: boolean;
    toolId?: string;
    assetCount?: number;
  };
  protocol?: {
    allowBrowse: boolean;
    filterBySpecialty: boolean;
    inline: boolean;
    available: boolean;
    protocolCount?: number;
  };
}
