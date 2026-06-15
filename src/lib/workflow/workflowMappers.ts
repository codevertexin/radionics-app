import type {
  WorkflowStep,
  WorkflowStepConfig,
  WorkflowStepStatus,
  WorkflowStepType,
  WorkflowTemplate,
  WorkflowTemplateStatus,
} from '@/types/workflow-engine';

export interface WorkflowTemplateRow {
  id: string;
  specialty_id: string;
  slug: string;
  name: string;
  description: string | null;
  version: string;
  status: string;
  is_default: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStepRow {
  id: string;
  workflow_template_id: string;
  step_order: number;
  step_code: string;
  step_type: string;
  label: string;
  instructions: string | null;
  config: WorkflowStepConfig | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function mapWorkflowTemplate(row: WorkflowTemplateRow): WorkflowTemplate {
  return {
    id: row.id,
    specialtyId: row.specialty_id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    version: row.version,
    status: row.status as WorkflowTemplateStatus,
    isDefault: row.is_default,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapWorkflowStep(row: WorkflowStepRow): WorkflowStep {
  return {
    id: row.id,
    workflowTemplateId: row.workflow_template_id,
    stepOrder: row.step_order,
    stepCode: row.step_code,
    stepType: row.step_type as WorkflowStepType,
    label: row.label,
    instructions: row.instructions ?? undefined,
    config: row.config ?? {},
    status: row.status as WorkflowStepStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function sortWorkflowTemplates(templates: WorkflowTemplate[]): WorkflowTemplate[] {
  return [...templates].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    const nameCmp = a.name.localeCompare(b.name, 'pt');
    if (nameCmp !== 0) return nameCmp;
    return b.version.localeCompare(a.version, 'pt');
  });
}

export function sortWorkflowSteps(steps: WorkflowStep[]): WorkflowStep[] {
  return [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
}
