/**
 * V3.0D.2 — Workflow adapter self-check (no test runner).
 * Run: npx tsx src/lib/workflow-adapter/validateV30d2.ts
 */
import { MOCK_MESA35_WORKFLOW_BUNDLE } from '@/lib/workflow/mockWorkflows';
import {
  MESA35_EXPECTED_STEP_CODES,
  MESA35_STEP_MAPPINGS,
} from '@/lib/workflow-adapter/mesa35Mapping';
import {
  buildAdapterContextFromBundle,
  buildAdapterSteps,
  buildNavigation,
} from '@/lib/workflow-adapter/workflowAdapterBuild';
import {
  hydrateWorkflowStateFromLegacy,
  syncWorkflowStateToLegacy,
  toLegacySessionSnapshot,
} from '@/lib/workflow-adapter/legacyBridge';
import {
  computeAdapterStageCompletion,
  computeWorkflowStepCompletion,
} from '@/lib/workflow-adapter/stepCompletion';
import type { SessionLike } from '@/lib/workflow-adapter/types';
import type { ToolResult } from '@/types';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function runValidation(): void {
  const bundle = MOCK_MESA35_WORKFLOW_BUNDLE;
  const session: SessionLike = {
    id: 'validate-sess-001',
    specialtySlug: 'mesa-35',
    methodologyId: 'meth-rad35',
    intention: 'Harmonização energética',
    hawkinsInitial: 200,
    hawkinsFinal: 400,
    reverberationDays: 21,
    currentStageCode: 'diagnosis',
    toolResults: [
      {
        toolId: 'asset-graph-1',
        toolName: 'Anti Magia',
        toolImageUrl: '',
        status: 'identified',
      },
      {
        toolId: 'asset-graph-2',
        toolName: 'Luxor',
        toolImageUrl: '',
        status: 'activated',
        activatedAt: '2026-01-01T00:00:00Z',
      },
    ] as ToolResult[],
    fieldValues: {
      selected_chakras: { type: 'multi_select', value: ['chakra-1', 'chakra-2'] },
    },
    workflowTemplateId: bundle.template.id,
    executionMode: 'workflow',
  };

  const adapterSteps = buildAdapterSteps(bundle, 'mesa-35');
  assert(adapterSteps.length === 9, `expected 9 adapter steps, got ${adapterSteps.length}`);
  assert(
    adapterSteps.every(s => MESA35_EXPECTED_STEP_CODES.includes(s.stepCode)),
    'adapter steps must match Mesa 35 step codes',
  );

  const navigationItems = buildNavigation(adapterSteps);
  const legacyStageCodes = new Set(
    navigationItems
      .filter(n => n.legacyStageCode !== 'report')
      .map(n => n.legacyStageCode),
  );
  assert(legacyStageCodes.size === 5, `expected 5 legacy stages, got ${legacyStageCodes.size}`);
  assert(
    navigationItems.some(n => n.legacyStageCode === 'report'),
    'expected report/modal nav item',
  );

  const hydrated = hydrateWorkflowStateFromLegacy(session, bundle);
  assert(
    hydrated.steps.hawkins_initial?.outputs?.hawkins_value === 200,
    'hydrate hawkins_initial',
  );
  assert(
    (hydrated.steps.graph_diagnosis?.outputs?.selected_asset_ids as string[])?.length === 2,
    'hydrate graph_diagnosis',
  );

  const synced = syncWorkflowStateToLegacy(hydrated, adapterSteps, session);
  assert(synced.hawkinsInitial === 200, 'sync hawkinsInitial');
  assert(synced.hawkinsFinal === 400, 'sync hawkinsFinal');
  assert(synced.reverberationDays === 21, 'sync reverberationDays');
  assert(synced.toolResults.length >= 2, 'sync toolResults');
  assert(
    synced.fieldValues.selected_chakras?.type === 'multi_select',
    'sync selected_chakras field',
  );

  const roundTrip = hydrateWorkflowStateFromLegacy(
    {
      ...session,
      hawkinsInitial: synced.hawkinsInitial ?? undefined,
      hawkinsFinal: synced.hawkinsFinal ?? undefined,
      reverberationDays: synced.reverberationDays ?? undefined,
      toolResults: synced.toolResults,
      fieldValues: synced.fieldValues,
    },
    bundle,
  );
  const reSynced = syncWorkflowStateToLegacy(roundTrip, adapterSteps, session);
  assert(reSynced.hawkinsInitial === 200, 'round-trip hawkinsInitial');
  assert(reSynced.hawkinsFinal === 400, 'round-trip hawkinsFinal');

  const diagnosisComplete = computeWorkflowStepCompletion(
    adapterSteps.find(s => s.stepCode === 'graph_diagnosis')!,
    hydrated,
  );
  assert(diagnosisComplete, 'graph_diagnosis should be complete');

  const partialActivationState = {
    ...hydrated,
    steps: {
      ...hydrated.steps,
      graph_activation: {
        status: 'in_progress' as const,
        outputs: { activated_asset_ids: ['asset-graph-2'] },
      },
    },
  };
  const activationIncomplete = computeWorkflowStepCompletion(
    adapterSteps.find(s => s.stepCode === 'graph_activation')!,
    partialActivationState,
  );
  assert(!activationIncomplete, 'graph_activation incomplete when not all activated');

  const fullActivationState = {
    ...hydrated,
    steps: {
      ...hydrated.steps,
      graph_activation: {
        status: 'completed' as const,
        outputs: { activated_asset_ids: ['asset-graph-1', 'asset-graph-2'] },
      },
    },
  };
  const activationComplete = computeWorkflowStepCompletion(
    adapterSteps.find(s => s.stepCode === 'graph_activation')!,
    fullActivationState,
  );
  assert(activationComplete, 'graph_activation complete when all selected activated');

  const bundleWithCondition = {
    ...bundle,
    steps: bundle.steps.map(s =>
      s.stepCode === 'chakra_selection'
        ? {
            ...s,
            config: {
              ...s.config,
              condition: { requires_asset_type: 'graph' },
            },
          }
        : s,
    ),
  };
  const stepsWithCondition = buildAdapterSteps(
    bundleWithCondition,
    'mesa-35',
    hydrated,
  );
  const hidden = stepsWithCondition.find(s => s.stepCode === 'chakra_selection');
  assert(hidden?.visibility === 'hidden', 'condition false should hide step');

  const snapshot = toLegacySessionSnapshot(hydrated, adapterSteps, session);
  assert(snapshot.session_id === session.id, 'snapshot session_id');
  assert(snapshot.hawkins_initial === 200, 'snapshot hawkins_initial');
  assert(Array.isArray(snapshot.tool_results), 'snapshot tool_results array');
  assert(typeof snapshot.stage_completion === 'object', 'snapshot stage_completion');

  const loadResult = buildAdapterContextFromBundle('mesa-35', bundle, session);
  assert(loadResult.executionMode === 'workflow', 'buildAdapterContextFromBundle mode');
  assert(loadResult.adapterContext?.adapterSteps.length === 9, 'adapter context steps');

  const stageCompletion = computeAdapterStageCompletion(loadResult.adapterContext!);
  assert(stageCompletion.connection === true, 'connection stage complete by default');

  console.log(JSON.stringify({
    ok: true,
    adapter_step_count: adapterSteps.length,
    navigation_item_count: navigationItems.length,
    mapping_count: MESA35_STEP_MAPPINGS.length,
    legacy_stage_count: legacyStageCodes.size,
    snapshot_keys: Object.keys(snapshot),
    stage_completion: stageCompletion,
  }, null, 2));
}

try {
  runValidation();
} catch (err) {
  console.error('[validate-v30d2] FAILED:', err instanceof Error ? err.message : err);
  throw err;
}
