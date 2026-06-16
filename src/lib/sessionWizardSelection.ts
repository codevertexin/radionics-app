/** Discriminated selection in the new-session wizard (V3.0D.3). */

export type SessionWizardWorkflowSelection = {
  kind: 'workflow';
  workflowTemplateId: string;
  slug: string;
  name: string;
  version: string;
};

export type SessionWizardLegacyTemplateSelection = {
  kind: 'legacy-template';
  templateId: string;
  name: string;
};

export type SessionWizardSelection =
  | SessionWizardWorkflowSelection
  | SessionWizardLegacyTemplateSelection;

export function isWorkflowWizardSelection(
  selection: SessionWizardSelection,
): selection is SessionWizardWorkflowSelection {
  return selection.kind === 'workflow';
}

export function wizardSelectionLabel(selection: SessionWizardSelection): string {
  return selection.name;
}
