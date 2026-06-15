/**
 * Workflow Engine V3.0C — read-only workflow definitions service.
 * Does not execute workflows or modify workspace/sessions/reports.
 */

import { isMockMode, isSupabaseMode } from '@/lib/dataMode';
import { evaluateWorkflowCondition } from '@/lib/workflow/workflowConditions';
import {
  WorkflowEngineError,
  isWorkflowEngineError,
} from '@/lib/workflow/workflowErrors';
import {
  getMockDefaultWorkflowBundle,
  getMockWorkflowBundleBySlug,
  getMockWorkflowBundleByTemplateId,
  getMockWorkflowBundlesForSpecialty,
  mockHasWorkflowForSpecialty,
} from '@/lib/workflow/mockWorkflows';
import { sortWorkflowTemplates } from '@/lib/workflow/workflowMappers';
import {
  getSpecialtyAssets,
  getSpecialtyTools,
} from '@/services/methodologyEngineService';
import { getSpecialtyProtocols } from '@/services/resourceLibraryService';
import { getApprovedSpecialties } from '@/services/specialtiesService';
import * as supabaseWorkflow from '@/services/supabase/workflowEngineSupabase';
import type { Specialty } from '@/types';
import type {
  WorkflowCondition,
  WorkflowConditionEvaluation,
  WorkflowSessionContext,
  WorkflowStep,
  WorkflowStepResolvedContent,
  WorkflowTemplate,
  WorkflowTemplateBundle,
} from '@/types/workflow-engine';

const delay = (ms = 80) => new Promise<void>(r => setTimeout(r, ms));

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

async function assertApprovedSpecialty(specialtySlug: string): Promise<Specialty> {
  const slug = normalizeSlug(specialtySlug);
  const approved = await getApprovedSpecialties();
  const specialty = approved.find(s => s.slug === slug);
  if (!specialty) {
    throw new WorkflowEngineError(
      `Sem certificação aprovada para "${slug}".`,
      'WORKFLOW_FORBIDDEN',
    );
  }
  return specialty;
}

function activeStepsFromBundle(bundle: WorkflowTemplateBundle): WorkflowStep[] {
  return bundle.steps.filter(s => s.status === 'active');
}

export { WorkflowEngineError, isWorkflowEngineError };
export { evaluateWorkflowCondition };

/**
 * Active workflow templates readable by the current user.
 * Ordered: is_default desc, name asc, version desc.
 */
export async function getWorkflowTemplatesForSpecialty(
  specialtySlug: string,
): Promise<WorkflowTemplate[]> {
  await assertApprovedSpecialty(specialtySlug);
  const slug = normalizeSlug(specialtySlug);

  if (isMockMode()) {
    await delay();
    return sortWorkflowTemplates(
      getMockWorkflowBundlesForSpecialty(slug)
        .map(b => b.template)
        .filter(t => t.status === 'active'),
    );
  }

  if (isSupabaseMode()) {
    return supabaseWorkflow.supabaseGetWorkflowTemplatesForSpecialty(slug);
  }

  throw new WorkflowEngineError('VITE_DATA_MODE inválido.', 'WORKFLOW_NOT_AVAILABLE');
}

/** Active default workflow template + ordered active steps, or null. */
export async function getDefaultWorkflowForSpecialty(
  specialtySlug: string,
): Promise<WorkflowTemplateBundle | null> {
  await assertApprovedSpecialty(specialtySlug);
  const slug = normalizeSlug(specialtySlug);

  if (isMockMode()) {
    await delay();
    return getMockDefaultWorkflowBundle(slug);
  }

  if (isSupabaseMode()) {
    return supabaseWorkflow.supabaseGetDefaultWorkflowForSpecialty(slug);
  }

  throw new WorkflowEngineError('VITE_DATA_MODE inválido.', 'WORKFLOW_NOT_AVAILABLE');
}

/**
 * Template + ordered active steps by slug.
 * Without version: prefers active default matching slug, else latest active version.
 */
export async function getWorkflowBySlug(
  specialtySlug: string,
  workflowSlug: string,
  version?: string,
): Promise<WorkflowTemplateBundle | null> {
  await assertApprovedSpecialty(specialtySlug);
  const slug = normalizeSlug(specialtySlug);

  if (isMockMode()) {
    await delay();
    return getMockWorkflowBundleBySlug(slug, workflowSlug, version);
  }

  if (isSupabaseMode()) {
    return supabaseWorkflow.supabaseGetWorkflowBySlug(slug, workflowSlug, version);
  }

  throw new WorkflowEngineError('VITE_DATA_MODE inválido.', 'WORKFLOW_NOT_AVAILABLE');
}

/** Template + ordered active steps by template id (RLS in Supabase mode). */
export async function getWorkflowBundle(
  templateId: string,
): Promise<WorkflowTemplateBundle | null> {
  if (!templateId.trim()) {
    throw new WorkflowEngineError('templateId é obrigatório.', 'CONFIG');
  }

  if (isMockMode()) {
    await delay();
    const bundle = getMockWorkflowBundleByTemplateId(templateId);
    if (!bundle) return null;

    const approved = await getApprovedSpecialties();
    const approvedIds = new Set(approved.map(s => s.id));
    if (!approvedIds.has(bundle.template.specialtyId)) {
      throw new WorkflowEngineError(
        'Sem permissão para ler este workflow.',
        'WORKFLOW_FORBIDDEN',
      );
    }

    return {
      template: bundle.template,
      steps: activeStepsFromBundle(bundle),
    };
  }

  if (isSupabaseMode()) {
    const bundle = await supabaseWorkflow.supabaseGetWorkflowBundle(templateId);
    if (!bundle) return null;
    return {
      template: bundle.template,
      steps: activeStepsFromBundle(bundle),
    };
  }

  throw new WorkflowEngineError('VITE_DATA_MODE inválido.', 'WORKFLOW_NOT_AVAILABLE');
}

/**
 * Read-only resolver: interprets step.config and returns lightweight content references.
 * Does not execute the workflow or mutate session state.
 */
export async function resolveStepContent(
  step: WorkflowStep,
  specialtySlug: string,
  sessionContext?: WorkflowSessionContext,
): Promise<WorkflowStepResolvedContent> {
  await assertApprovedSpecialty(specialtySlug);
  const slug = normalizeSlug(specialtySlug);
  const config = step.config ?? {};

  const resolved: WorkflowStepResolvedContent = {
    stepId: step.id,
    stepCode: step.stepCode,
    stepType: step.stepType,
  };

  if (config.condition) {
    resolved.condition = evaluateWorkflowCondition(config.condition, sessionContext);
  }

  const tools = await getSpecialtyTools(slug).catch(() => []);
  const assets = await getSpecialtyAssets(slug).catch(() => []);

  if (config.measurement?.tool_slug) {
    const toolSlug = config.measurement.tool_slug;
    const link = tools.find(t => t.tool.slug === toolSlug);
    resolved.measurement = {
      toolSlug,
      mode: config.measurement.mode,
      available: Boolean(link),
      toolId: link?.toolId,
    };
  }

  if (config.asset_picker?.tool_slug) {
    const toolSlug = config.asset_picker.tool_slug;
    const link = tools.find(t => t.tool.slug === toolSlug);
    const toolId = link?.toolId;
    const assetCount = toolId
      ? assets.filter(a => a.toolId === toolId && a.status === 'active').length
      : 0;

    resolved.assetPicker = {
      toolSlug,
      multi: config.asset_picker.multi,
      max: config.asset_picker.max,
      available: Boolean(link),
      toolId,
      assetCount,
    };
  }

  if (config.protocol) {
    const allowBrowse = config.protocol.allow_browse ?? false;
    let protocolCount: number | undefined;
    let available = true;

    if (allowBrowse) {
      const protocols = await getSpecialtyProtocols(slug).catch(() => []);
      protocolCount = protocols.length;
      available = protocols.length > 0;
    }

    resolved.protocol = {
      allowBrowse,
      filterBySpecialty: config.protocol.filter_by_specialty ?? true,
      inline: config.protocol.inline ?? true,
      available,
      protocolCount,
    };
  }

  return resolved;
}

/** Boolean helper for wizard fallback (workflow vs legacy template). */
export async function hasWorkflowForSpecialty(specialtySlug: string): Promise<boolean> {
  try {
    await assertApprovedSpecialty(specialtySlug);
  } catch (err) {
    if (isWorkflowEngineError(err) && err.code === 'WORKFLOW_FORBIDDEN') {
      return false;
    }
    throw err;
  }

  const slug = normalizeSlug(specialtySlug);

  if (isMockMode()) {
    await delay();
    return mockHasWorkflowForSpecialty(slug);
  }

  if (isSupabaseMode()) {
    return supabaseWorkflow.supabaseHasWorkflowForSpecialty(slug);
  }

  throw new WorkflowEngineError('VITE_DATA_MODE inválido.', 'WORKFLOW_NOT_AVAILABLE');
}

export type {
  WorkflowCondition,
  WorkflowConditionEvaluation,
  WorkflowSessionContext,
  WorkflowStepResolvedContent,
  WorkflowTemplate,
  WorkflowTemplateBundle,
};
