import { buildSnapshotFromState } from '@/lib/snapshot-builder';
import type { WorkflowSessionContext } from '@/types/workflow-engine';
import type { WorkflowTemplateBundle } from '@/types/workflow-engine';
import type {
  LegacyBridgeResult,
  LegacyStateInput,
  SessionLike,
  WorkflowStateDraft,
} from '@/lib/workflow-adapter/types';
import type { SessionStateSnapshot, ToolResult } from '@/types';
import { computeAdapterStageCompletion } from '@/lib/workflow-adapter/stepCompletion';
import type { AdapterStepView } from '@/lib/workflow-adapter/types';

export function createEmptyWorkflowState(bundle: WorkflowTemplateBundle): WorkflowStateDraft {
  const firstStep = [...bundle.steps]
    .filter(s => s.status === 'active')
    .sort((a, b) => a.stepOrder - b.stepOrder)[0];

  const steps: WorkflowStateDraft['steps'] = {};
  for (const step of bundle.steps) {
    if (step.status !== 'active') continue;
    steps[step.stepCode] = { status: 'not_started', outputs: {} };
  }

  return {
    templateId: bundle.template.id,
    templateSlug: bundle.template.slug,
    workflowVersion: bundle.template.version,
    currentStepCode: firstStep?.stepCode ?? '',
    steps,
    legacy: {
      executionMode: 'workflow',
      reportGenerated: false,
    },
  };
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function toolResultFromAssetId(
  assetId: string,
  status: ToolResult['status'],
  existing?: ToolResult,
): ToolResult {
  return {
    toolId: assetId,
    toolName: existing?.toolName ?? assetId,
    toolImageUrl: existing?.toolImageUrl ?? '',
    status,
    notes: existing?.notes,
    intensity: existing?.intensity,
    transcript: existing?.transcript,
    voiceNotes: existing?.voiceNotes,
    activatedAt: status === 'activated' ? existing?.activatedAt ?? new Date().toISOString() : existing?.activatedAt,
  };
}

function mergeToolResultsById(lists: ToolResult[][]): ToolResult[] {
  const byId = new Map<string, ToolResult>();
  for (const list of lists) {
    for (const tr of list) {
      const prev = byId.get(tr.toolId);
      byId.set(tr.toolId, prev ? { ...prev, ...tr } : { ...tr });
    }
  }
  return [...byId.values()];
}

/**
 * Hydrates workflow_state draft from legacy session fields.
 */
export function hydrateWorkflowStateFromLegacy(
  session: SessionLike,
  bundle: WorkflowTemplateBundle,
): WorkflowStateDraft {
  const state = createEmptyWorkflowState(bundle);
  state.legacy = {
    ...state.legacy,
    currentStageCode: session.currentStageCode,
    reportGenerated: state.legacy?.reportGenerated ?? false,
  };

  if (session.intention) {
    setStepOutput(state, 'preparation', {
      intention: session.intention,
      status: 'completed',
    });
  }

  if (session.hawkinsInitial != null) {
    setStepOutput(state, 'hawkins_initial', {
      hawkins_value: session.hawkinsInitial,
      status: 'completed',
    });
  }

  if (session.hawkinsFinal != null) {
    setStepOutput(state, 'hawkins_final', {
      hawkins_value: session.hawkinsFinal,
      status: 'completed',
    });
  }

  if (session.reverberationDays != null) {
    setStepOutput(state, 'closing', {
      reverberation_days: session.reverberationDays,
      status: 'completed',
    });
  }

  const existingTools = session.toolResults ?? [];
  const identified = existingTools.filter(
    r => r.status === 'identified' || r.status === 'activated',
  );
  const activated = existingTools.filter(r => r.status === 'activated');

  if (identified.length > 0) {
    setStepOutput(state, 'graph_diagnosis', {
      selected_asset_ids: identified.map(r => r.toolId),
      status: 'completed',
    });
  }

  if (activated.length > 0) {
    setStepOutput(state, 'graph_activation', {
      activated_asset_ids: activated.map(r => r.toolId),
      status: 'completed',
    });
  }

  const chakraField = session.fieldValues?.selected_chakras;
  if (chakraField?.type === 'multi_select' && chakraField.value.length > 0) {
    setStepOutput(state, 'chakra_selection', {
      selected_asset_ids: chakraField.value,
      status: 'completed',
    });
  }

  if (session.currentStageCode) {
    const stepForStage = bundle.steps.find(
      s => s.stepCode === session.currentStageCode,
    );
    if (stepForStage) {
      state.currentStepCode = stepForStage.stepCode;
    }
  }

  return state;
}

function setStepOutput(
  state: WorkflowStateDraft,
  stepCode: string,
  input: {
    status?: WorkflowStateDraft['steps'][string]['status'];
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
 * Syncs workflow_state back to legacy session-compatible fields.
 */
export function syncWorkflowStateToLegacy(
  workflowState: WorkflowStateDraft,
  adapterSteps: AdapterStepView[],
  sessionLike: SessionLike,
  legacyInput?: LegacyStateInput,
): LegacyBridgeResult {
  const existingTools = legacyInput?.toolResults ?? sessionLike.toolResults ?? [];
  const existingById = new Map(existingTools.map(t => [t.toolId, t]));

  const prep = workflowState.steps.preparation;
  const hi = workflowState.steps.hawkins_initial;
  const hf = workflowState.steps.hawkins_final;
  const diagnosis = workflowState.steps.graph_diagnosis;
  const activation = workflowState.steps.graph_activation;
  const chakras = workflowState.steps.chakra_selection;
  const closing = workflowState.steps.closing;

  const hawkinsInitial =
    legacyInput?.hawkinsInitial !== undefined
      ? legacyInput.hawkinsInitial
      : asNumber(hi?.outputs?.hawkins_value);

  const hawkinsFinal =
    legacyInput?.hawkinsFinal !== undefined
      ? legacyInput.hawkinsFinal
      : asNumber(hf?.outputs?.hawkins_value);

  const reverberationDays =
    legacyInput?.reverberationDays !== undefined
      ? legacyInput.reverberationDays
      : asNumber(closing?.outputs?.reverberation_days);

  const selectedIds = asStringArray(diagnosis?.outputs?.selected_asset_ids);
  const activatedIds = new Set(asStringArray(activation?.outputs?.activated_asset_ids));

  const fromDiagnosis: ToolResult[] = selectedIds.map(id =>
    toolResultFromAssetId(
      id,
      activatedIds.has(id) ? 'activated' : 'identified',
      existingById.get(id),
    ),
  );

  const fromActivationOnly: ToolResult[] = [...activatedIds]
    .filter(id => !selectedIds.includes(id))
    .map(id => toolResultFromAssetId(id, 'activated', existingById.get(id)));

  const toolResults = mergeToolResultsById([
    existingTools.filter(r => !selectedIds.includes(r.toolId) && !activatedIds.has(r.toolId)),
    fromDiagnosis,
    fromActivationOnly,
  ]);

  const fieldValues = { ...(legacyInput?.fieldValues ?? sessionLike.fieldValues ?? {}) };
  const chakraIds = asStringArray(chakras?.outputs?.selected_asset_ids);
  if (chakraIds.length > 0) {
    fieldValues.selected_chakras = { type: 'multi_select', value: chakraIds };
  }

  const currentStageCode =
    workflowState.legacy?.currentStageCode
    ?? sessionLike.currentStageCode
    ?? adapterSteps.find(s => s.stepCode === workflowState.currentStepCode)?.legacyStageCode
    ?? 'preparation';

  const stageCompletion = computeAdapterStageCompletion({
    executionMode: 'workflow',
    adapterSteps,
    workflowState,
  });

  return {
    hawkinsInitial,
    hawkinsFinal,
    reverberationDays,
    toolResults,
    fieldValues,
    currentStageCode,
    stageCompletion,
  };
}

/**
 * Produces legacy SessionStateSnapshot shape for report compatibility.
 */
export function toLegacySessionSnapshot(
  workflowState: WorkflowStateDraft,
  adapterSteps: AdapterStepView[],
  sessionLike: SessionLike,
): SessionStateSnapshot {
  const legacy = syncWorkflowStateToLegacy(workflowState, adapterSteps, sessionLike);

  return buildSnapshotFromState({
    sessionId: sessionLike.id,
    hawkinsInitial: legacy.hawkinsInitial,
    hawkinsFinal: legacy.hawkinsFinal,
    reverbDays: legacy.reverberationDays,
    toolResults: legacy.toolResults,
    fieldValues: legacy.fieldValues,
    stageCompletion: legacy.stageCompletion,
  });
}

export function buildSessionContextFromWorkflowState(
  workflowState: WorkflowStateDraft,
): WorkflowSessionContext {
  const protocolStep = workflowState.steps.protocol_select
    ?? Object.values(workflowState.steps).find(
      s => s.outputs?.selected_protocol_id,
    );

  const protocolId = protocolStep?.outputs?.selected_protocol_id as string | undefined;
  const assetTypes = protocolStep?.outputs?.selected_protocol_asset_types;

  return {
    selectedProtocolId: protocolId,
    selectedProtocolAssetTypes: Array.isArray(assetTypes)
      ? assetTypes.filter((t): t is string => typeof t === 'string')
      : undefined,
    stepOutputs: Object.fromEntries(
      Object.entries(workflowState.steps).map(([code, step]) => [code, step.outputs ?? {}]),
    ),
  };
}
