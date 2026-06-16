import type { FieldValue, ToolResult } from '@/types';
import type {
  WorkflowSessionContext,
  WorkflowStep,
  WorkflowStepType,
  WorkflowTemplateBundle,
} from '@/types/workflow-engine';

export type SessionExecutionMode = 'legacy' | 'workflow';

export type LegacyStageCode =
  | 'preparation'
  | 'connection'
  | 'diagnosis'
  | 'activations'
  | 'closing'
  | 'report';

export type AdapterComponentKey =
  | 'preparation'
  | 'connection'
  | 'hawkins_initial'
  | 'hawkins_final'
  | 'diagnosis'
  | 'activations'
  | 'selection'
  | 'closing'
  | 'report_modal';

export type AdapterStepVisibility = 'visible' | 'hidden' | 'skipped';

export type WorkflowStepExecutionStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'skipped';

export interface AdapterStepView {
  stepCode: string;
  stepType: WorkflowStepType;
  label: string;
  stepOrder: number;
  legacyStageCode: LegacyStageCode;
  isSubStep: boolean;
  subStepOrder: number;
  componentKey: AdapterComponentKey;
  navId: string;
  visibility: AdapterStepVisibility;
  conditionReason?: string;
  workflowStep: WorkflowStep;
}

export interface AdapterNavItem {
  navId: string;
  legacyStageCode: LegacyStageCode;
  label: string;
  isSubStep: boolean;
  subStepOrder: number;
  stepCodes: string[];
  visibility: AdapterStepVisibility;
}

export interface WorkflowStepStateDraft {
  status: WorkflowStepExecutionStatus;
  outputs?: Record<string, unknown>;
  completedAt?: string;
  skipped?: boolean;
  skipReason?: string;
}

export interface WorkflowStateDraft {
  templateId: string;
  templateSlug: string;
  workflowVersion: string;
  currentStepCode: string;
  steps: Record<string, WorkflowStepStateDraft>;
  legacy?: {
    currentStageCode?: string;
    executionMode?: SessionExecutionMode;
    reportGenerated?: boolean;
  };
}

export interface AdapterContext {
  executionMode: SessionExecutionMode;
  specialtySlug: string;
  workflowBundle?: WorkflowTemplateBundle;
  adapterSteps: AdapterStepView[];
  workflowState: WorkflowStateDraft;
  sessionContext: WorkflowSessionContext;
}

/** Minimal session shape for adapter bridge (no full Session type required). */
export interface SessionLike {
  id: string;
  specialtySlug: string;
  methodologyId?: string;
  intention?: string;
  hawkinsInitial?: number;
  hawkinsFinal?: number;
  reverberationDays?: number;
  currentStageCode?: string;
  toolResults?: ToolResult[];
  fieldValues?: Record<string, FieldValue>;
  workflowTemplateId?: string;
  workflowVersion?: string;
  executionMode?: SessionExecutionMode;
}

export interface LegacyBridgeResult {
  hawkinsInitial: number | null;
  hawkinsFinal: number | null;
  reverberationDays: number | null;
  toolResults: ToolResult[];
  fieldValues: Record<string, FieldValue>;
  currentStageCode: string;
  stageCompletion: Record<string, boolean>;
}

export interface WorkflowAdapterLoadResult {
  executionMode: SessionExecutionMode;
  adapterContext: AdapterContext | null;
  navigationItems: AdapterNavItem[];
  error?: string;
}

export interface LoadAdapterContextParams {
  specialtySlug: string;
  session: SessionLike;
  /** When set, load this template instead of default. */
  workflowTemplateId?: string;
  /** Force legacy mode even if workflow exists (existing sessions). */
  forceLegacy?: boolean;
  /** D.2/testing: load default workflow without workflowTemplateId on session. */
  preferWorkflow?: boolean;
}

export interface LegacyStateInput {
  hawkinsInitial?: number | null;
  hawkinsFinal?: number | null;
  reverberationDays?: number | null;
  toolResults?: ToolResult[];
  fieldValues?: Record<string, FieldValue>;
  intention?: string;
  reportGenerated?: boolean;
}
