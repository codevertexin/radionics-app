import type {
  AdapterContext,
  AdapterStepView,
  LegacyStateInput,
  WorkflowStateDraft,
} from '@/lib/workflow-adapter/types';
import type { WorkflowStep } from '@/types/workflow-engine';

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function getStepState(
  workflowState: WorkflowStateDraft,
  stepCode: string,
): WorkflowStateDraft['steps'][string] | undefined {
  return workflowState.steps[stepCode];
}

/**
 * Computes completion for a single workflow step.
 */
export function computeWorkflowStepCompletion(
  step: WorkflowStep | AdapterStepView,
  workflowState: WorkflowStateDraft,
  legacyState?: LegacyStateInput,
): boolean {
  const stepCode = step.stepCode;
  const stepType = step.stepType;
  const state = getStepState(workflowState, stepCode);

  if (state?.skipped) return true;
  if (state?.status === 'skipped') return true;
  if (state?.status === 'completed') return true;

  switch (stepCode) {
    case 'preparation': {
      const intention =
        legacyState?.intention
        ?? (state?.outputs?.intention as string | undefined)
        ?? (state?.outputs?.notes as string | undefined);
      return Boolean(intention?.trim());
    }
    case 'connection':
      return true;
    case 'hawkins_initial': {
      const v = legacyState?.hawkinsInitial ?? asNumber(state?.outputs?.hawkins_value);
      return v !== null && v !== undefined;
    }
    case 'graph_diagnosis': {
      const ids = asStringArray(state?.outputs?.selected_asset_ids);
      if (ids.length > 0) return true;
      const legacyIdentified = (legacyState?.toolResults ?? []).filter(
        r => r.status === 'identified' || r.status === 'activated',
      );
      return legacyIdentified.length > 0;
    }
    case 'graph_activation': {
      const selected = asStringArray(
        workflowState.steps.graph_diagnosis?.outputs?.selected_asset_ids,
      );
      if (selected.length === 0) {
        const legacyActivated = (legacyState?.toolResults ?? []).filter(
          r => r.status === 'activated',
        );
        return legacyActivated.length > 0;
      }
      const activated = new Set(
        asStringArray(state?.outputs?.activated_asset_ids),
      );
      return selected.every(id => activated.has(id));
    }
    case 'chakra_selection': {
      if (state?.skipped) return true;
      const ids = asStringArray(state?.outputs?.selected_asset_ids);
      if (ids.length > 0) return true;
      const field = legacyState?.fieldValues?.selected_chakras;
      return field?.type === 'multi_select' && field.value.length > 0;
    }
    case 'hawkins_final': {
      const v = legacyState?.hawkinsFinal ?? asNumber(state?.outputs?.hawkins_value);
      return v !== null && v !== undefined;
    }
    case 'closing': {
      const days =
        legacyState?.reverberationDays
        ?? asNumber(state?.outputs?.reverberation_days);
      return days !== null && days !== undefined;
    }
    case 'report':
      return Boolean(
        workflowState.legacy?.reportGenerated
        ?? legacyState?.reportGenerated
        ?? false,
      );
    default:
      if (stepType === 'connection') return true;
      return false;
  }
}

/**
 * Maps workflow step completion to legacy stage_completion keys.
 */
export function computeAdapterStageCompletion(
  adapterContext: Pick<AdapterContext, 'adapterSteps' | 'workflowState' | 'executionMode'>,
  legacyState?: LegacyStateInput,
): Record<string, boolean> {
  const { adapterSteps, workflowState } = adapterContext;

  const visibleSteps = adapterSteps.filter(s => s.visibility === 'visible');
  const stepsByLegacy = new Map<string, AdapterStepView[]>();

  for (const step of visibleSteps) {
    const list = stepsByLegacy.get(step.legacyStageCode) ?? [];
    list.push(step);
    stepsByLegacy.set(step.legacyStageCode, list);
  }

  const isStageComplete = (legacyCode: string): boolean => {
    const steps = stepsByLegacy.get(legacyCode) ?? [];
    if (steps.length === 0) {
      if (legacyCode === 'connection') return true;
      if (legacyCode === 'report') return false;
      return false;
    }
    return steps.every(s => computeWorkflowStepCompletion(s, workflowState, legacyState));
  };

  return {
    preparation: isStageComplete('preparation'),
    connection: isStageComplete('connection'),
    diagnosis: isStageComplete('diagnosis'),
    activations: isStageComplete('activations'),
    closing: isStageComplete('closing'),
    report: isStageComplete('report'),
  };
}
