import { mapWorkflowSupabaseError } from '@/lib/workflow/workflowErrors';
import {
  mapWorkflowStep,
  mapWorkflowTemplate,
  sortWorkflowSteps,
  sortWorkflowTemplates,
  type WorkflowStepRow,
  type WorkflowTemplateRow,
} from '@/lib/workflow/workflowMappers';
import { requireSupabaseClient } from '@/lib/dataMode';
import { requireAuthUserId } from '@/lib/supabase/auth';
import { resolveSpecialtyBySlug } from '@/services/supabase/methodologyEngineSupabase';
import type { WorkflowStep, WorkflowTemplate, WorkflowTemplateBundle } from '@/types/workflow-engine';

async function fetchActiveStepsForTemplate(templateId: string): Promise<WorkflowStep[]> {
  const client = requireSupabaseClient();

  const { data, error } = await client
    .from('workflow_steps')
    .select('*')
    .eq('workflow_template_id', templateId)
    .eq('status', 'active')
    .order('step_order', { ascending: true });

  if (error) mapWorkflowSupabaseError('fetchActiveStepsForTemplate', error);

  return sortWorkflowSteps(
    ((data ?? []) as WorkflowStepRow[]).map(mapWorkflowStep),
  );
}

async function fetchActiveTemplatesForSpecialty(
  specialtyId: string,
): Promise<WorkflowTemplate[]> {
  const client = requireSupabaseClient();

  const { data, error } = await client
    .from('workflow_templates')
    .select('*')
    .eq('specialty_id', specialtyId)
    .eq('status', 'active');

  if (error) mapWorkflowSupabaseError('fetchActiveTemplatesForSpecialty', error);

  return sortWorkflowTemplates(
    ((data ?? []) as WorkflowTemplateRow[]).map(mapWorkflowTemplate),
  );
}

export async function supabaseGetWorkflowTemplatesForSpecialty(
  specialtySlug: string,
): Promise<WorkflowTemplate[]> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const context = await resolveSpecialtyBySlug(specialtySlug);
  return fetchActiveTemplatesForSpecialty(context.specialtyId);
}

export async function supabaseGetDefaultWorkflowForSpecialty(
  specialtySlug: string,
): Promise<WorkflowTemplateBundle | null> {
  const templates = await supabaseGetWorkflowTemplatesForSpecialty(specialtySlug);
  const defaultTemplate = templates.find(t => t.isDefault);
  if (!defaultTemplate) return null;

  const steps = await fetchActiveStepsForTemplate(defaultTemplate.id);
  return { template: defaultTemplate, steps };
}

export async function supabaseGetWorkflowBySlug(
  specialtySlug: string,
  workflowSlug: string,
  version?: string,
): Promise<WorkflowTemplateBundle | null> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const context = await resolveSpecialtyBySlug(specialtySlug);
  const normalizedSlug = workflowSlug.trim().toLowerCase();

  let builder = client
    .from('workflow_templates')
    .select('*')
    .eq('specialty_id', context.specialtyId)
    .eq('slug', normalizedSlug)
    .eq('status', 'active');

  if (version) {
    builder = builder.eq('version', version);
  }

  const { data, error } = await builder;

  if (error) mapWorkflowSupabaseError('getWorkflowBySlug', error);

  const rows = ((data ?? []) as WorkflowTemplateRow[]).map(mapWorkflowTemplate);
  if (rows.length === 0) return null;

  let template: WorkflowTemplate | undefined;
  if (version) {
    template = rows[0];
  } else {
    template = rows.find(t => t.isDefault)
      ?? sortWorkflowTemplates(rows)[0];
  }

  if (!template) return null;

  const steps = await fetchActiveStepsForTemplate(template.id);
  return { template, steps };
}

export async function supabaseGetWorkflowBundle(
  templateId: string,
): Promise<WorkflowTemplateBundle | null> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const { data, error } = await client
    .from('workflow_templates')
    .select('*')
    .eq('id', templateId)
    .maybeSingle();

  if (error) mapWorkflowSupabaseError('getWorkflowBundle', error);
  if (!data) return null;

  const template = mapWorkflowTemplate(data as WorkflowTemplateRow);
  const steps = await fetchActiveStepsForTemplate(template.id);
  return { template, steps };
}

export async function supabaseHasWorkflowForSpecialty(
  specialtySlug: string,
): Promise<boolean> {
  const templates = await supabaseGetWorkflowTemplatesForSpecialty(specialtySlug);
  return templates.length > 0;
}
