import { createEmptyWorkflowState } from '@/lib/workflow-adapter/legacyBridge';
import type { WorkflowStateDraft } from '@/lib/workflow-adapter/types';
import type { WorkflowTemplateBundle } from '@/types/workflow-engine';

export interface InitializeWorkflowStateInput {
  workflowTemplateId: string;
  workflowTemplateSlug?: string;
  workflowVersion?: string;
  intention?: string;
}

/**
 * Builds initial workflow_state from a loaded bundle, or a minimal draft when bundle is unavailable.
 */
export function initializeWorkflowStateForSession(
  bundle: WorkflowTemplateBundle | null,
  input: InitializeWorkflowStateInput,
): WorkflowStateDraft {
  if (bundle) {
    const state = createEmptyWorkflowState(bundle);
    if (input.intention?.trim()) {
      const prep = state.steps.preparation;
      if (prep) {
        prep.outputs = { ...prep.outputs, intention: input.intention.trim() };
      }
    }
    return state;
  }

  return {
    templateId: input.workflowTemplateId,
    templateSlug: input.workflowTemplateSlug ?? '',
    workflowVersion: input.workflowVersion ?? 'v1',
    currentStepCode: 'preparation',
    steps: {},
    legacy: {
      executionMode: 'workflow',
      reportGenerated: false,
    },
  };
}
