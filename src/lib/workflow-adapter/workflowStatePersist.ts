import { syncWorkflowStateToLegacy } from '@/lib/workflow-adapter/legacyBridge';
import { computeAdapterStageCompletion } from '@/lib/workflow-adapter/stepCompletion';
import type {
  AdapterStepView,
  LegacyStateInput,
  SessionLike,
  WorkflowStateDraft,
  WorkflowStepStateDraft,
} from '@/lib/workflow-adapter/types';
import type { FieldValue, ToolResult } from '@/types';
import type { StageCompletion } from '@/lib/session-state';

export interface LegacyWorkspaceDraft {
  toolResults: ToolResult[];
  fieldValues: Record<string, FieldValue>;
  hawkinsInitial: number | null;
  hawkinsFinal: number | null;
  reverbDays: number | null;
  currentStageCode: string;
  intention?: string;
}

function cloneWorkflowState(state: WorkflowStateDraft): WorkflowStateDraft {
  return {
    ...state,
    steps: Object.fromEntries(
      Object.entries(state.steps).map(([code, step]) => [
        code,
        {
          ...step,
          outputs: step.outputs ? { ...step.outputs } : undefined,
        },
      ]),
    ),
    legacy: state.legacy ? { ...state.legacy } : undefined,
  };
}

function setStepOutput(
  state: WorkflowStateDraft,
  stepCode: string,
  input: {
    status?: WorkflowStepStateDraft['status'];
    [key: string]: unknown;
  },
): void {
  const { status, ...outputs } = input;
  const step = state.steps[stepCode] ?? { status: 'not_started', outputs: {} };
  step.outputs = { ...step.outputs, ...outputs };
  if (status) {
    step.status = status;
    if (status === 'completed') {
      step.completedAt = step.completedAt ?? new Date().toISOString();
    }
  }
  state.steps[stepCode] = step;
}

/**
 * Aplica alterações do draft legado do workspace em workflow_state.
 */
export function updateWorkflowStateFromLegacyDraft(
  workflowState: WorkflowStateDraft,
  draft: Partial<LegacyWorkspaceDraft>,
): WorkflowStateDraft {
  const next = cloneWorkflowState(workflowState);

  if (draft.intention?.trim()) {
    setStepOutput(next, 'preparation', {
      intention: draft.intention.trim(),
      status: 'completed',
    });
  }

  if (draft.hawkinsInitial != null) {
    setStepOutput(next, 'hawkins_initial', {
      hawkins_value: draft.hawkinsInitial,
      status: 'completed',
    });
  }

  if (draft.hawkinsFinal != null) {
    setStepOutput(next, 'hawkins_final', {
      hawkins_value: draft.hawkinsFinal,
      status: 'completed',
    });
  }

  if (draft.reverbDays != null) {
    setStepOutput(next, 'closing', {
      reverberation_days: draft.reverbDays,
      status: 'completed',
    });
  }

  if (draft.toolResults) {
    const identified = draft.toolResults.filter(
      r => r.status === 'identified' || r.status === 'activated',
    );
    const activated = draft.toolResults.filter(r => r.status === 'activated');

    setStepOutput(next, 'graph_diagnosis', {
      selected_asset_ids: identified.map(r => r.toolId),
      status: identified.length > 0 ? 'completed' : 'in_progress',
    });

    setStepOutput(next, 'graph_activation', {
      activated_asset_ids: activated.map(r => r.toolId),
      status:
        identified.length > 0 && activated.length === identified.length
          ? 'completed'
          : activated.length > 0
            ? 'in_progress'
            : 'not_started',
    });
  }

  const chakraField = draft.fieldValues?.selected_chakras;
  if (chakraField?.type === 'multi_select') {
    setStepOutput(next, 'chakra_selection', {
      selected_asset_ids: chakraField.value,
      status: chakraField.value.length > 0 ? 'completed' : 'not_started',
    });
  }

  if (draft.currentStageCode) {
    next.legacy = {
      ...next.legacy,
      currentStageCode: draft.currentStageCode,
      executionMode: 'workflow',
    };
  }

  return next;
}

export interface WorkflowPersistResult {
  workflowState: WorkflowStateDraft;
  legacy: ReturnType<typeof syncWorkflowStateToLegacy>;
  stageCompletion: StageCompletion;
}

/**
 * Prepara payload workflow + campos legados sincronizados para persistência.
 */
export function prepareWorkflowPersist(
  session: SessionLike,
  adapterSteps: AdapterStepView[],
  workflowState: WorkflowStateDraft,
  draft: LegacyWorkspaceDraft,
): WorkflowPersistResult {
  const updatedState = updateWorkflowStateFromLegacyDraft(workflowState, draft);

  const legacyInput: LegacyStateInput = {
    hawkinsInitial: draft.hawkinsInitial,
    hawkinsFinal: draft.hawkinsFinal,
    reverberationDays: draft.reverbDays,
    toolResults: draft.toolResults,
    fieldValues: draft.fieldValues,
    intention: draft.intention ?? session.intention,
  };

  const legacy = syncWorkflowStateToLegacy(
    updatedState,
    adapterSteps,
    session,
    legacyInput,
  );

  const stageCompletionRaw = computeAdapterStageCompletion(
    {
      adapterSteps,
      workflowState: updatedState,
      executionMode: 'workflow',
    },
    legacyInput,
  );

  const stageCompletion: StageCompletion = {
    preparation: stageCompletionRaw.preparation ?? false,
    connection: stageCompletionRaw.connection ?? false,
    diagnosis: stageCompletionRaw.diagnosis ?? false,
    activations: stageCompletionRaw.activations ?? false,
    closing: stageCompletionRaw.closing ?? false,
  };

  return {
    workflowState: updatedState,
    legacy,
    stageCompletion,
  };
}
