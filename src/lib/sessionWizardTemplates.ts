/**
 * Wizard template lists — evita duplicar «Sessão Completa» workflow vs legado.
 */

import type { Specialty, Template } from '@/types';
import type { WorkflowTemplate } from '@/types/workflow-engine';

/** Template legado oficial Mesa 35 — substituído pelo workflow recomendado no wizard. */
export const MESA35_LEGACY_OFFICIAL_TEMPLATE_ID = 'tmpl-rad35-official';

/**
 * Remove o template legado oficial quando existe workflow ativo para a especialidade.
 * Evita dois cartões «Sessão Completa» com handlers diferentes.
 */
export function getWizardLegacyTemplates(
  specialty: Specialty,
  legacyTemplates: Template[],
  workflowTemplates: WorkflowTemplate[],
): Template[] {
  if (workflowTemplates.length === 0) return legacyTemplates;
  if (specialty.slug !== 'mesa-35') return legacyTemplates;

  return legacyTemplates.filter(t => t.id !== MESA35_LEGACY_OFFICIAL_TEMPLATE_ID);
}
