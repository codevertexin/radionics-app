import {
  mapWorkflowStepToAdapterView,
} from '@/lib/workflow-adapter/mesa35Mapping';
import {
  buildSessionContextFromWorkflowState,
  createEmptyWorkflowState,
  hydrateWorkflowStateFromLegacy,
} from '@/lib/workflow-adapter/legacyBridge';
import { evaluateWorkflowCondition } from '@/lib/workflow/workflowConditions';
import type { WorkflowTemplateBundle } from '@/types/workflow-engine';
import type {
  AdapterContext,
  AdapterNavItem,
  AdapterStepView,
  LoadAdapterContextParams,
  WorkflowAdapterLoadResult,
  WorkflowStateDraft,
} from '@/lib/workflow-adapter/types';

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function applyConditionVisibility(
  step: WorkflowTemplateBundle['steps'][number],
  sessionContext: ReturnType<typeof buildSessionContextFromWorkflowState>,
): Pick<AdapterStepView, 'visibility' | 'conditionReason'> {
  const condition = step.config?.condition;
  if (!condition) {
    return { visibility: 'visible' };
  }

  const evaluation = evaluateWorkflowCondition(condition, sessionContext);
  if (evaluation.satisfied) {
    return { visibility: 'visible', conditionReason: evaluation.reason };
  }

  return {
    visibility: 'hidden',
    conditionReason: evaluation.reason,
  };
}

/**
 * Maps workflow bundle steps to adapter views (Mesa 35 mapping).
 */
export function buildAdapterSteps(
  workflowBundle: WorkflowTemplateBundle,
  specialtySlug: string,
  workflowState?: WorkflowStateDraft,
): AdapterStepView[] {
  const slug = normalizeSlug(specialtySlug);
  if (slug !== 'mesa-35') {
    return [];
  }

  const state = workflowState ?? createEmptyWorkflowState(workflowBundle);
  const sessionContext = buildSessionContextFromWorkflowState(state);

  const views: AdapterStepView[] = [];

  for (const step of workflowBundle.steps) {
    if (step.status !== 'active') continue;

    const { visibility, conditionReason } = applyConditionVisibility(step, sessionContext);
    const view = mapWorkflowStepToAdapterView(step, visibility, conditionReason);
    if (!view) continue;

    if (visibility === 'hidden') {
      const draft = state.steps[step.stepCode];
      if (draft) {
        draft.status = 'skipped';
        draft.skipped = true;
        draft.skipReason = conditionReason ?? 'condition_not_met';
      }
    }

    views.push(view);
  }

  return views.sort((a, b) => a.stepOrder - b.stepOrder);
}

const LEGACY_STAGE_LABELS: Record<string, string> = {
  preparation: 'Preparação',
  connection: 'Conexão',
  diagnosis: 'Diagnóstico',
  activations: 'Ativações',
  closing: 'Encerramento',
  report: 'Relatório',
};

/**
 * Builds navigation items grouped by legacy stage (5 stages + report).
 * Sub-steps are merged into their parent legacy stage item.
 */
export function buildNavigation(adapterSteps: AdapterStepView[]): AdapterNavItem[] {
  const visible = adapterSteps.filter(s => s.visibility === 'visible');
  const byLegacyStage = new Map<string, AdapterNavItem>();

  for (const step of visible) {
    const stageKey = step.legacyStageCode;
    const existing = byLegacyStage.get(stageKey);

    if (existing) {
      existing.stepCodes.push(step.stepCode);
      if (step.isSubStep && step.subStepOrder >= existing.subStepOrder) {
        existing.subStepOrder = step.subStepOrder;
      }
      continue;
    }

    byLegacyStage.set(stageKey, {
      navId: stageKey,
      legacyStageCode: step.legacyStageCode,
      label: LEGACY_STAGE_LABELS[step.legacyStageCode] ?? step.label,
      isSubStep: false,
      subStepOrder: step.subStepOrder,
      stepCodes: [step.stepCode],
      visibility: step.visibility,
    });
  }

  for (const item of byLegacyStage.values()) {
    item.stepCodes.sort((a, b) => {
      const stepA = visible.find(s => s.stepCode === a);
      const stepB = visible.find(s => s.stepCode === b);
      return (stepA?.stepOrder ?? 0) - (stepB?.stepOrder ?? 0);
    });
  }

  return [...byLegacyStage.values()].sort((a, b) => {
    const stageOrder: Record<string, number> = {
      preparation: 1,
      connection: 2,
      diagnosis: 3,
      activations: 4,
      closing: 5,
      report: 6,
    };
    return (stageOrder[a.legacyStageCode] ?? 99) - (stageOrder[b.legacyStageCode] ?? 99);
  });
}

export function resolveActiveStep(
  adapterContext: AdapterContext,
  currentNavId: string,
): AdapterStepView | null {
  const visible = adapterContext.adapterSteps.filter(s => s.visibility === 'visible');

  const stepsInNav = visible.filter(
    s => s.legacyStageCode === currentNavId || s.navId === currentNavId,
  );
  if (stepsInNav.length > 0) {
    const currentCode = adapterContext.workflowState.currentStepCode;
    const match = stepsInNav.find(s => s.stepCode === currentCode);
    return match ?? stepsInNav[0];
  }

  const currentCode = adapterContext.workflowState.currentStepCode;
  return visible.find(s => s.stepCode === currentCode) ?? visible[0] ?? null;
}

/** Sync helper — builds full workflow context from bundle without async service. */
export function buildAdapterContextFromBundle(
  specialtySlug: string,
  bundle: WorkflowTemplateBundle,
  session: LoadAdapterContextParams['session'],
): WorkflowAdapterLoadResult {
  const slug = normalizeSlug(specialtySlug);
  const workflowState = hydrateWorkflowStateFromLegacy(session, bundle);
  const adapterSteps = buildAdapterSteps(bundle, slug, workflowState);
  const navigationItems = buildNavigation(adapterSteps);

  return {
    executionMode: 'workflow',
    adapterContext: {
      executionMode: 'workflow',
      specialtySlug: slug,
      workflowBundle: bundle,
      adapterSteps,
      workflowState,
      sessionContext: buildSessionContextFromWorkflowState(workflowState),
    },
    navigationItems,
  };
}
