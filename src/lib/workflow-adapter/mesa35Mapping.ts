import type { WorkflowStep } from '@/types/workflow-engine';
import type {
  AdapterComponentKey,
  AdapterStepView,
  LegacyStageCode,
} from '@/lib/workflow-adapter/types';

export interface Mesa35StepMapping {
  stepCode: string;
  legacyStageCode: LegacyStageCode;
  componentKey: AdapterComponentKey;
  isSubStep: boolean;
  subStepOrder: number;
  navLabel?: string;
}

/** Static Mesa 35 workflow step → legacy stage mapping (V3.0C mock). */
export const MESA35_STEP_MAPPINGS: Mesa35StepMapping[] = [
  {
    stepCode: 'preparation',
    legacyStageCode: 'preparation',
    componentKey: 'preparation',
    isSubStep: false,
    subStepOrder: 0,
  },
  {
    stepCode: 'connection',
    legacyStageCode: 'connection',
    componentKey: 'connection',
    isSubStep: false,
    subStepOrder: 0,
  },
  {
    stepCode: 'hawkins_initial',
    legacyStageCode: 'preparation',
    componentKey: 'hawkins_initial',
    isSubStep: true,
    subStepOrder: 1,
    navLabel: 'Hawkins inicial',
  },
  {
    stepCode: 'graph_diagnosis',
    legacyStageCode: 'diagnosis',
    componentKey: 'diagnosis',
    isSubStep: false,
    subStepOrder: 0,
  },
  {
    stepCode: 'graph_activation',
    legacyStageCode: 'activations',
    componentKey: 'activations',
    isSubStep: false,
    subStepOrder: 0,
  },
  {
    stepCode: 'chakra_selection',
    legacyStageCode: 'diagnosis',
    componentKey: 'selection',
    isSubStep: true,
    subStepOrder: 1,
    navLabel: 'Seleção de chakras',
  },
  {
    stepCode: 'hawkins_final',
    legacyStageCode: 'closing',
    componentKey: 'hawkins_final',
    isSubStep: true,
    subStepOrder: 1,
    navLabel: 'Hawkins final',
  },
  {
    stepCode: 'closing',
    legacyStageCode: 'closing',
    componentKey: 'closing',
    isSubStep: false,
    subStepOrder: 0,
  },
  {
    stepCode: 'report',
    legacyStageCode: 'report',
    componentKey: 'report_modal',
    isSubStep: false,
    subStepOrder: 0,
    navLabel: 'Relatório',
  },
];

export const MESA35_EXPECTED_STEP_CODES = MESA35_STEP_MAPPINGS.map(m => m.stepCode);

const mappingByStepCode = new Map(
  MESA35_STEP_MAPPINGS.map(m => [m.stepCode, m]),
);

export function getMesa35Mapping(stepCode: string): Mesa35StepMapping | undefined {
  return mappingByStepCode.get(stepCode);
}

export function mapWorkflowStepToAdapterView(
  step: WorkflowStep,
  visibility: AdapterStepView['visibility'] = 'visible',
  conditionReason?: string,
): AdapterStepView | null {
  const mapping = getMesa35Mapping(step.stepCode);
  if (!mapping) return null;

  const navId = mapping.isSubStep
    ? `${mapping.legacyStageCode}:${step.stepCode}`
    : mapping.legacyStageCode;

  return {
    stepCode: step.stepCode,
    stepType: step.stepType,
    label: mapping.navLabel ?? step.label,
    stepOrder: step.stepOrder,
    legacyStageCode: mapping.legacyStageCode,
    isSubStep: mapping.isSubStep,
    subStepOrder: mapping.subStepOrder,
    componentKey: mapping.componentKey,
    navId,
    visibility,
    conditionReason,
    workflowStep: step,
  };
}

export function isMesa35WorkflowBundle(bundleSlug: string): boolean {
  return bundleSlug.trim().toLowerCase() === 'mesa-35-full';
}
