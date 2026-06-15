/**
 * Mock Workflow Engine data — Mesa 35 only (V3.0C).
 * Service-only; does not alter workspace or wizard behavior.
 */

import type { WorkflowStep, WorkflowTemplate, WorkflowTemplateBundle } from '@/types/workflow-engine';

const NOW = '2024-01-01T00:00:00.000Z';
const MOCK_SPECIALTY_ID = 'spec-rad35';
const MOCK_SPECIALTY_SLUG = 'mesa-35';

export const MOCK_MESA35_WORKFLOW_TEMPLATE_ID = 'mock-wf-mesa35-v1';

export const MOCK_MESA35_WORKFLOW_TEMPLATE: WorkflowTemplate = {
  id: MOCK_MESA35_WORKFLOW_TEMPLATE_ID,
  specialtyId: MOCK_SPECIALTY_ID,
  slug: 'mesa-35-full',
  name: 'Mesa 35 — Sessão completa',
  description: 'Workflow mock V3.0C — preparação, Hawkins, gráficos, chakras e encerramento.',
  version: 'v1',
  status: 'active',
  isDefault: true,
  metadata: { source: 'mock', phase: 'V3.0C' },
  createdAt: NOW,
  updatedAt: NOW,
};

export const MOCK_MESA35_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'mock-wf-step-preparation',
    workflowTemplateId: MOCK_MESA35_WORKFLOW_TEMPLATE_ID,
    stepOrder: 1,
    stepCode: 'preparation',
    stepType: 'preparation',
    label: 'Preparação',
    instructions: 'Definir intenção e preparar o campo da sessão.',
    config: {
      output_schema: { fields: ['intention', 'notes'] },
    },
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'mock-wf-step-connection',
    workflowTemplateId: MOCK_MESA35_WORKFLOW_TEMPLATE_ID,
    stepOrder: 2,
    stepCode: 'connection',
    stepType: 'connection',
    label: 'Conexão',
    instructions: 'Estabelecer ligação radiônica com o cliente.',
    config: {
      output_schema: { fields: ['connection_ok'] },
    },
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'mock-wf-step-hawkins-initial',
    workflowTemplateId: MOCK_MESA35_WORKFLOW_TEMPLATE_ID,
    stepOrder: 3,
    stepCode: 'hawkins_initial',
    stepType: 'measurement',
    label: 'Hawkins inicial',
    instructions: 'Registar leitura inicial na escala de Hawkins.',
    config: {
      measurement: { tool_slug: 'hawkins-scale', mode: 'initial' },
      output_schema: { fields: ['hawkins_value'] },
    },
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'mock-wf-step-graph-diagnosis',
    workflowTemplateId: MOCK_MESA35_WORKFLOW_TEMPLATE_ID,
    stepOrder: 4,
    stepCode: 'graph_diagnosis',
    stepType: 'diagnosis',
    label: 'Diagnóstico por gráficos',
    instructions: 'Selecionar gráficos para análise.',
    config: {
      asset_picker: { tool_slug: 'graph-set-35', multi: true, max: 5 },
      output_schema: { fields: ['selected_graph_ids'] },
    },
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'mock-wf-step-graph-activation',
    workflowTemplateId: MOCK_MESA35_WORKFLOW_TEMPLATE_ID,
    stepOrder: 5,
    stepCode: 'graph_activation',
    stepType: 'activation',
    label: 'Ativação de gráficos',
    instructions: 'Ativar os gráficos selecionados com scripts de ativação.',
    config: {
      asset_picker: { tool_slug: 'graph-set-35', multi: true },
      activation: { require_script_read: false, show_image: true },
      output_schema: { fields: ['activated_graph_ids', 'timestamps'] },
    },
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'mock-wf-step-chakra-selection',
    workflowTemplateId: MOCK_MESA35_WORKFLOW_TEMPLATE_ID,
    stepOrder: 6,
    stepCode: 'chakra_selection',
    stepType: 'selection',
    label: 'Seleção de chakras',
    instructions: 'Selecionar chakras relevantes para harmonização.',
    config: {
      asset_picker: { tool_slug: 'chakra-set', multi: true },
      output_schema: { fields: ['selected_chakra_ids'] },
    },
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'mock-wf-step-hawkins-final',
    workflowTemplateId: MOCK_MESA35_WORKFLOW_TEMPLATE_ID,
    stepOrder: 7,
    stepCode: 'hawkins_final',
    stepType: 'measurement',
    label: 'Hawkins final',
    instructions: 'Registar leitura final na escala de Hawkins.',
    config: {
      measurement: { tool_slug: 'hawkins-scale', mode: 'final' },
      output_schema: { fields: ['hawkins_value'] },
    },
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'mock-wf-step-closing',
    workflowTemplateId: MOCK_MESA35_WORKFLOW_TEMPLATE_ID,
    stepOrder: 8,
    stepCode: 'closing',
    stepType: 'closing',
    label: 'Encerramento',
    instructions: 'Reverberação e notas de encerramento.',
    config: {
      output_schema: { fields: ['reverberation_days', 'closing_notes'] },
    },
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'mock-wf-step-report',
    workflowTemplateId: MOCK_MESA35_WORKFLOW_TEMPLATE_ID,
    stepOrder: 9,
    stepCode: 'report',
    stepType: 'report',
    label: 'Relatório',
    instructions: 'Rever e preparar secções do relatório.',
    config: {
      output_schema: { fields: ['report_draft_refs'] },
    },
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const MOCK_MESA35_WORKFLOW_BUNDLE: WorkflowTemplateBundle = {
  template: MOCK_MESA35_WORKFLOW_TEMPLATE,
  steps: MOCK_MESA35_WORKFLOW_STEPS,
};

const MOCK_BUNDLES_BY_SPECIALTY: Record<string, WorkflowTemplateBundle[]> = {
  [MOCK_SPECIALTY_SLUG]: [MOCK_MESA35_WORKFLOW_BUNDLE],
};

const MOCK_BUNDLES_BY_TEMPLATE_ID: Record<string, WorkflowTemplateBundle> = {
  [MOCK_MESA35_WORKFLOW_TEMPLATE_ID]: MOCK_MESA35_WORKFLOW_BUNDLE,
};

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function getMockWorkflowBundlesForSpecialty(specialtySlug: string): WorkflowTemplateBundle[] {
  return MOCK_BUNDLES_BY_SPECIALTY[normalizeSlug(specialtySlug)] ?? [];
}

export function getMockWorkflowBundleByTemplateId(
  templateId: string,
): WorkflowTemplateBundle | null {
  return MOCK_BUNDLES_BY_TEMPLATE_ID[templateId] ?? null;
}

export function getMockDefaultWorkflowBundle(specialtySlug: string): WorkflowTemplateBundle | null {
  const bundles = getMockWorkflowBundlesForSpecialty(specialtySlug);
  const activeDefault = bundles.find(
    b => b.template.status === 'active' && b.template.isDefault,
  );
  if (activeDefault) {
    return {
      template: activeDefault.template,
      steps: activeDefault.steps.filter(s => s.status === 'active'),
    };
  }
  return null;
}

export function getMockWorkflowBundleBySlug(
  specialtySlug: string,
  workflowSlug: string,
  version?: string,
): WorkflowTemplateBundle | null {
  const bundles = getMockWorkflowBundlesForSpecialty(specialtySlug).filter(
    b => b.template.status === 'active' && b.template.slug === workflowSlug.trim().toLowerCase(),
  );
  if (bundles.length === 0) return null;

  let match: WorkflowTemplateBundle | undefined;
  if (version) {
    match = bundles.find(b => b.template.version === version);
  } else {
    match = bundles.find(b => b.template.isDefault)
      ?? [...bundles].sort((a, b) => b.template.version.localeCompare(a.template.version, 'pt'))[0];
  }

  if (!match) return null;

  return {
    template: match.template,
    steps: match.steps.filter(s => s.status === 'active'),
  };
}

export function mockHasWorkflowForSpecialty(specialtySlug: string): boolean {
  return getMockWorkflowBundlesForSpecialty(specialtySlug).some(
    b => b.template.status === 'active',
  );
}
