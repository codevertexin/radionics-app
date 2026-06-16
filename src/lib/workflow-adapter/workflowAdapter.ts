import { getMesa35Mapping } from '@/lib/workflow-adapter/mesa35Mapping';
import {
  buildAdapterSteps,
  buildNavigation,
  resolveActiveStep,
} from '@/lib/workflow-adapter/workflowAdapterBuild';
import {
  buildSessionContextFromWorkflowState,
  hydrateWorkflowStateFromLegacy,
} from '@/lib/workflow-adapter/legacyBridge';
import {
  getDefaultWorkflowForSpecialty,
  getWorkflowBundle,
  hasWorkflowForSpecialty,
} from '@/services/workflowEngineService';
import type { WorkflowTemplateBundle } from '@/types/workflow-engine';
import type {
  AdapterContext,
  LoadAdapterContextParams,
  SessionExecutionMode,
  WorkflowAdapterLoadResult,
} from '@/lib/workflow-adapter/types';

export {
  buildAdapterSteps,
  buildNavigation,
  resolveActiveStep,
  buildAdapterContextFromBundle,
} from '@/lib/workflow-adapter/workflowAdapterBuild';

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function resolveExecutionMode(
  session: LoadAdapterContextParams['session'],
  hasWorkflow: boolean,
  forceLegacy?: boolean,
): SessionExecutionMode {
  if (forceLegacy) return 'legacy';
  if (session.executionMode === 'workflow') return 'workflow';
  if (session.workflowTemplateId && hasWorkflow) return 'workflow';
  return 'legacy';
}

async function loadWorkflowBundle(
  specialtySlug: string,
  session: LoadAdapterContextParams['session'],
  preferWorkflow?: boolean,
  workflowTemplateId?: string,
): Promise<WorkflowTemplateBundle | null> {
  const slug = normalizeSlug(specialtySlug);
  const templateId = workflowTemplateId ?? session.workflowTemplateId;

  if (templateId) {
    return getWorkflowBundle(templateId);
  }

  if (preferWorkflow || session.executionMode === 'workflow') {
    return getDefaultWorkflowForSpecialty(slug);
  }

  return null;
}

export async function isWorkflowAdapterAvailable(specialtySlug: string): Promise<boolean> {
  try {
    return await hasWorkflowForSpecialty(normalizeSlug(specialtySlug));
  } catch {
    return false;
  }
}

export async function loadAdapterContext(
  params: LoadAdapterContextParams,
): Promise<WorkflowAdapterLoadResult> {
  const slug = normalizeSlug(params.specialtySlug);
  let hasWorkflow = false;

  try {
    hasWorkflow = await isWorkflowAdapterAvailable(slug);
  } catch {
    hasWorkflow = false;
  }

  const executionMode = resolveExecutionMode(
    params.session,
    hasWorkflow,
    params.forceLegacy,
  );

  if (executionMode === 'legacy') {
    return {
      executionMode: 'legacy',
      adapterContext: null,
      navigationItems: [],
    };
  }

  let bundle: WorkflowTemplateBundle | null = null;
  try {
    bundle = await loadWorkflowBundle(
      slug,
      params.session,
      params.preferWorkflow,
      params.workflowTemplateId,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'workflow_load_failed';
    return {
      executionMode: 'legacy',
      adapterContext: null,
      navigationItems: [],
      error: message,
    };
  }

  if (!bundle) {
    return {
      executionMode: 'legacy',
      adapterContext: null,
      navigationItems: [],
    };
  }

  const workflowState = hydrateWorkflowStateFromLegacy(params.session, bundle);
  const adapterSteps = buildAdapterSteps(bundle, slug, workflowState);
  const navigationItems = buildNavigation(adapterSteps);
  const sessionContext = buildSessionContextFromWorkflowState(workflowState);

  const adapterContext: AdapterContext = {
    executionMode: 'workflow',
    specialtySlug: slug,
    workflowBundle: bundle,
    adapterSteps,
    workflowState,
    sessionContext,
  };

  return {
    executionMode: 'workflow',
    adapterContext,
    navigationItems,
  };
}

export function getLegacyStageForStepCode(stepCode: string): string | undefined {
  return getMesa35Mapping(stepCode)?.legacyStageCode;
}
