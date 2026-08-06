/**
 * F0 characterization + F1 platform session domain validation.
 * Pattern: assert-based runner (no Vitest), same as validateV30d2.
 *
 * Run: node scripts/validate-platform-session-f0-f1.mjs
 *  or: npx tsx --tsconfig tsconfig.app.json src/platform/session/validatePlatformSessionF0F1.ts
 */

import { cloneToolResults, normalizeSessionWorkspace } from '@/lib/sessionWorkspace';
import { initializeWorkflowStateForSession } from '@/lib/workflow-adapter/initializeWorkflowState';
import {
  createEmptyWorkflowState,
  hydrateWorkflowStateFromLegacy,
  syncWorkflowStateToLegacy,
  toLegacySessionSnapshot,
} from '@/lib/workflow-adapter/legacyBridge';
import { computeAdapterStageCompletion } from '@/lib/workflow-adapter/stepCompletion';
import { prepareWorkflowPersist } from '@/lib/workflow-adapter/workflowStatePersist';
import { buildAdapterSteps } from '@/lib/workflow-adapter/workflowAdapterBuild';
import { MOCK_MESA35_WORKFLOW_BUNDLE } from '@/lib/workflow/mockWorkflows';
import type { SessionLike } from '@/lib/workflow-adapter/types';
import type { Session, ToolResult } from '@/types';
import type { CreateSessionInput } from '@/services/sessionsService';

import {
  LEGACY_ONLY_SESSION_STATUSES,
  PLATFORM_SESSION_LIFECYCLE_STATUSES,
  assertArchiveIndependentOfReportTemplate,
  assertApprovedRenditionImmutable,
  assertAtMostOneActiveExecution,
  assertAtMostOneActiveExecutionPerSession,
  assertLifecycleTransition,
  assertRequiredIdentityFields,
  assertSealedArchiveImmutable,
  assertSessionAndReportLifecyclesIndependent,
  activateExecution,
  advanceReportLifecycle,
  appendTimelineEvent,
  applyProfileEditWithoutMutatingTestimony,
  canTransitionLifecycle,
  capabilityFromHostContract,
  classifyTimelineEvent,
  cloneExecutionState,
  createApprovedReportRendition,
  createIsolatedExecutionState,
  createMethodologyWorkspaceHostContract,
  createMinimalMethodologyCapability,
  createReportContribution,
  createReportProjectionDraft,
  createSessionArchiveAssembly,
  createSessionNote,
  createSessionPlan,
  createTestimonySnapshot,
  createTimelineEvent,
  findUnplannedInvocations,
  hostContractOmitsOptionalCapabilities,
  isContributionIncluded,
  isNoteEligibleForReportInclusion,
  isOptionalContactField,
  isPlatformSessionLifecycleStatus,
  isReportedASessionOrReportStatus,
  isSealedCanonicalArchive,
  isTerminalLifecycleStatus,
  listAllowedLifecycleTargets,
  listActiveExecutionsForSession,
  listInvokedMethodologyIds,
  listPlannedMethodologyIds,
  methodologyOmitsOptionalCapabilities,
  sealCompletedSessionArchive,
  setContributionInclusion,
  setNoteDisposition,
  startTranscriptCapture,
  stopTranscriptCapture,
  transitionLifecycle,
  PlatformSessionDomainError,
  type ClientIdentityProfile,
  type MethodologyExecutionRecord,
  type PlatformSessionLifecycleStatus,
  type PlatformSessionRecord,
} from '@/platform/session';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    failed += 1;
    throw new Error(message);
  }
  passed += 1;
}

function expectThrow(fn: () => void, codeOrMessage?: string): void {
  try {
    fn();
    throw new Error(`Expected throw${codeOrMessage ? `: ${codeOrMessage}` : ''}`);
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Expected throw')) throw e;
    if (codeOrMessage && e instanceof PlatformSessionDomainError) {
      assert(e.code === codeOrMessage, `expected code ${codeOrMessage}, got ${e.code}`);
      return;
    }
    passed += 1;
  }
}

function sampleIdentity(overrides?: Partial<ClientIdentityProfile>): ClientIdentityProfile {
  return {
    displayName: 'Ana',
    fullName: 'Ana Silva Costa',
    dateOfBirth: '1985-04-12',
    address: 'Rua A, 1',
    locality: 'Lisboa',
    country: 'PT',
    postalCode: '1000-001',
    ...overrides,
  };
}

function sampleExecution(
  overrides: Partial<MethodologyExecutionRecord> & Pick<MethodologyExecutionRecord, 'executionId' | 'status'>,
): MethodologyExecutionRecord {
  return {
    sessionId: 'sess-1',
    methodology: {
      methodologyId: 'meth-map',
      methodologySlug: 'map',
      methodologyName: 'MAP',
    },
    role: 'primary',
    sequenceOrder: 1,
    state: createIsolatedExecutionState({ opaque: true }),
    ...overrides,
  };
}

// ─── F0 Characterization ───────────────────────────────────────────────────

function runF0Characterization(): void {
  console.log('\n[F0] Characterization — existing adapter/session behaviour\n');

  const bundle = MOCK_MESA35_WORKFLOW_BUNDLE;

  // 1. Workflow-state initialization
  const empty = createEmptyWorkflowState(bundle);
  assert(empty.templateId === bundle.template.id, 'F0 init: templateId from bundle');
  assert(empty.legacy?.executionMode === 'workflow', 'F0 init: executionMode workflow');
  assert(Boolean(empty.currentStepCode), 'F0 init: currentStepCode set');
  assert(
    Object.keys(empty.steps).length > 0,
    'F0 init: step stubs created',
  );

  const withIntention = initializeWorkflowStateForSession(bundle, {
    workflowTemplateId: bundle.template.id,
    intention: 'Equilíbrio',
  });
  assert(
    withIntention.steps.preparation?.outputs?.intention === 'Equilíbrio',
    'F0 init: intention on preparation',
  );

  const fallback = initializeWorkflowStateForSession(null, {
    workflowTemplateId: 'wf-x',
    workflowTemplateSlug: 'slug-x',
    workflowVersion: 'v9',
  });
  assert(fallback.templateId === 'wf-x', 'F0 init fallback: templateId');
  assert(fallback.workflowVersion === 'v9', 'F0 init fallback: version');
  assert(fallback.legacy?.executionMode === 'workflow', 'F0 init fallback: mode');

  // 2. Serialization / persistence preparation
  const adapterSteps = buildAdapterSteps(bundle, 'mesa-35');
  const sessionLike: SessionLike = {
    id: 'f0-sess',
    specialtySlug: 'mesa-35',
    methodologyId: 'meth-rad35',
    intention: 'Test',
    hawkinsInitial: 200,
    hawkinsFinal: undefined,
    reverberationDays: undefined,
    currentStageCode: 'diagnosis',
    toolResults: [
      {
        toolId: 'g1',
        toolName: 'G1',
        toolImageUrl: '',
        status: 'identified',
      },
    ] as ToolResult[],
    fieldValues: {},
    workflowTemplateId: bundle.template.id,
    executionMode: 'workflow',
  };

  const hydrated = hydrateWorkflowStateFromLegacy(sessionLike, bundle);
  const persist = prepareWorkflowPersist(sessionLike, adapterSteps, hydrated, {
    toolResults: sessionLike.toolResults ?? [],
    fieldValues: {},
    hawkinsInitial: 200,
    hawkinsFinal: 350,
    reverbDays: 21,
    currentStageCode: 'closing',
    intention: 'Test',
  });
  assert(
    persist.workflowState.steps.hawkins_final?.outputs?.hawkins_value === 350,
    'F0 persist: hawkins_final in workflow state',
  );
  assert(persist.legacy.hawkinsFinal === 350, 'F0 persist: legacy hawkinsFinal');
  assert(typeof persist.stageCompletion.diagnosis === 'boolean', 'F0 persist: stageCompletion');

  // 3. Workflow ↔ legacy compatibility
  const synced = syncWorkflowStateToLegacy(hydrated, adapterSteps, sessionLike);
  assert(synced.hawkinsInitial === 200, 'F0 bridge: sync hawkinsInitial');
  const roundTrip = hydrateWorkflowStateFromLegacy(
    {
      ...sessionLike,
      hawkinsInitial: synced.hawkinsInitial ?? undefined,
      toolResults: synced.toolResults,
      fieldValues: synced.fieldValues,
    },
    bundle,
  );
  assert(
    roundTrip.steps.hawkins_initial?.outputs?.hawkins_value === 200,
    'F0 bridge: round-trip hawkins',
  );

  // 4. Session workspace normalization + tool-result cloning
  const rawSession = {
    id: 'norm-1',
    clientId: 'c1',
    clientName: 'C',
    therapistId: 't1',
    specialtyId: 's1',
    specialtyName: 'S',
    specialtySlug: 'mesa-35',
    methodologyId: 'meth-rad35',
    methodologyName: 'Mesa 35',
    methodologyCode: 'RAD35',
    templateId: 'tmpl',
    templateName: 'T',
    status: 'in_progress',
    sessionMode: 'distance',
    stages: [
      {
        code: 'diagnosis',
        label: 'Diagnóstico',
        status: 'in_progress',
        steps: [
          {
            id: 'st1',
            toolResults: [
              {
                toolId: 'from-stage',
                toolName: 'From Stage',
                toolImageUrl: '',
                status: 'identified',
              },
            ],
          },
        ],
      },
    ],
    toolResults: [
      {
        toolId: 'top',
        toolName: 'Top',
        toolImageUrl: '',
        status: 'activated',
        voiceNotes: [{
          id: 'vn1',
          transcript: 'note',
          durationSeconds: 1,
          createdAt: '2026-01-01',
        }],
      },
    ],
    fieldValues: undefined,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  } as unknown as Session;

  const normalized = normalizeSessionWorkspace(rawSession);
  assert(
    (normalized.toolResults ?? []).some(t => t.toolId === 'top'),
    'F0 normalize: top-level toolResults kept',
  );
  assert(
    (normalized.toolResults ?? []).some(t => t.toolId === 'from-stage'),
    'F0 normalize: stage toolResults merged',
  );
  assert(normalized.fieldValues !== undefined, 'F0 normalize: fieldValues defaulted');

  const cloned = cloneToolResults(normalized.toolResults ?? []);
  assert(cloned[0] !== (normalized.toolResults ?? [])[0], 'F0 clone: new array items');
  const top = cloned.find(t => t.toolId === 'top');
  if (top?.voiceNotes?.[0]) {
    top.voiceNotes[0].transcript = 'mutated';
  }
  const originalTop = (normalized.toolResults ?? []).find(t => t.toolId === 'top');
  assert(
    originalTop?.voiceNotes?.[0]?.transcript === 'note',
    'F0 clone: voiceNotes isolated',
  );

  // 5. Stage-completion derivation (legacy adapter behaviour)
  const stageCompletion = computeAdapterStageCompletion({
    adapterSteps,
    workflowState: persist.workflowState,
    executionMode: 'workflow',
  });
  assert(typeof stageCompletion.preparation === 'boolean', 'F0 stageCompletion: preparation');
  assert(typeof stageCompletion.diagnosis === 'boolean', 'F0 stageCompletion: diagnosis');
  assert(typeof stageCompletion.closing === 'boolean', 'F0 stageCompletion: closing');

  // 6. Snapshot compatibility consumed by reports
  const snapshot = toLegacySessionSnapshot(hydrated, adapterSteps, sessionLike);
  assert(snapshot.session_id === 'f0-sess', 'F0 snapshot: session_id');
  assert(Array.isArray(snapshot.tool_results), 'F0 snapshot: tool_results');
  assert(typeof snapshot.stage_completion === 'object', 'F0 snapshot: stage_completion');
  assert('hawkins_initial' in snapshot, 'F0 snapshot: hawkins_initial field');

  // 7. Session creation metadata contract (shape required by existing workflows)
  const createMeta: CreateSessionInput = {
    clientId: 'client-001',
    specialtyId: 'spec-mesa-35',
    specialtyName: 'Mesa Radiónica 35',
    specialtySlug: 'mesa-35',
    templateId: bundle.template.id,
    templateName: bundle.template.name,
    executionMode: 'workflow',
    workflowTemplateId: bundle.template.id,
    workflowTemplateSlug: bundle.template.slug,
    workflowVersion: bundle.template.version,
    workflowState: initializeWorkflowStateForSession(bundle, {
      workflowTemplateId: bundle.template.id,
    }),
    intention: 'Harmonização',
    sessionMode: 'distance',
  };
  assert(createMeta.executionMode === 'workflow', 'F0 create meta: executionMode');
  assert(Boolean(createMeta.workflowTemplateId), 'F0 create meta: workflowTemplateId');
  assert(createMeta.workflowState?.legacy?.executionMode === 'workflow', 'F0 create meta: state');
  assert(createMeta.specialtySlug === 'mesa-35', 'F0 create meta: specialtySlug');

  console.log('[F0] Characterization OK');
}

// ─── F1 Platform contracts ──────────────────────────────────────────────────

function runF1Lifecycle(): void {
  console.log('\n[F1] Lifecycle\n');

  assert(!PLATFORM_SESSION_LIFECYCLE_STATUSES.includes('reported' as never), 'no reported in platform');
  assert(
    LEGACY_ONLY_SESSION_STATUSES.includes('reported'),
    'reported is legacy-only',
  );
  assert(!isReportedASessionOrReportStatus(), 'reported not session/report platform status');
  assert(!isPlatformSessionLifecycleStatus('reported'), 'reported not platform status');

  const allowedPairs: [PlatformSessionLifecycleStatus, PlatformSessionLifecycleStatus][] = [
    ['draft', 'in_progress'],
    ['draft', 'cancelled'],
    ['in_progress', 'paused'],
    ['in_progress', 'closing'],
    ['in_progress', 'cancelled'],
    ['paused', 'in_progress'],
    ['paused', 'closing'],
    ['paused', 'cancelled'],
    ['closing', 'in_progress'],
    ['closing', 'completed'],
  ];

  for (const [from, to] of allowedPairs) {
    assert(canTransitionLifecycle(from, to), `allowed ${from}→${to}`);
    assert(transitionLifecycle(from, to) === to, `transition ${from}→${to}`);
  }

  assert(
    listAllowedLifecycleTargets('closing').includes('in_progress'),
    'closing reversible to in_progress',
  );

  const forbidden: [PlatformSessionLifecycleStatus, PlatformSessionLifecycleStatus][] = [
    ['draft', 'completed'],
    ['draft', 'paused'],
    ['draft', 'closing'],
    ['completed', 'in_progress'],
    ['completed', 'cancelled'],
    ['cancelled', 'draft'],
    ['cancelled', 'in_progress'],
    ['closing', 'cancelled'],
    ['closing', 'paused'],
    ['in_progress', 'draft'],
  ];

  for (const [from, to] of forbidden) {
    assert(!canTransitionLifecycle(from, to), `forbidden ${from}→${to}`);
    expectThrow(() => assertLifecycleTransition(from, to), 'INVALID_LIFECYCLE_TRANSITION');
  }

  assert(isTerminalLifecycleStatus('completed'), 'completed terminal');
  assert(isTerminalLifecycleStatus('cancelled'), 'cancelled terminal');
  assert(listAllowedLifecycleTargets('completed').length === 0, 'completed no exits');
  assert(listAllowedLifecycleTargets('cancelled').length === 0, 'cancelled no exits');
}

function runF1TestimonyAndPlan(): void {
  console.log('\n[F1] Testimony + Session Plan\n');

  const identity = sampleIdentity();
  assertRequiredIdentityFields(identity);
  assert(isOptionalContactField('phone'), 'phone optional');
  assert(isOptionalContactField('whatsapp'), 'whatsapp optional');
  assert(isOptionalContactField('email'), 'email optional');
  assert(!isOptionalContactField('displayName'), 'displayName not optional contact');
  assert(!isOptionalContactField('fullName'), 'fullName not optional contact');
  assert(identity.displayName !== identity.fullName, 'display ≠ full name');

  expectThrow(
    () => assertRequiredIdentityFields(sampleIdentity({ displayName: '' })),
    'IDENTITY_FIELD_REQUIRED',
  );
  expectThrow(
    () => assertRequiredIdentityFields(sampleIdentity({ fullName: '   ' })),
    'IDENTITY_FIELD_REQUIRED',
  );

  const snapshot = createTestimonySnapshot({
    snapshotId: 'snap-1',
    sessionId: 'sess-1',
    clientId: 'client-1',
    capturedAt: '2026-08-03T10:00:00Z',
    identity,
  });
  const edited = applyProfileEditWithoutMutatingTestimony(
    snapshot,
    sampleIdentity({ displayName: 'Ana M.', fullName: 'Ana Maria Silva Costa' }),
  );
  assert(edited.snapshot.identity.displayName === 'Ana', 'testimony frozen displayName');
  assert(edited.profile.displayName === 'Ana M.', 'profile editable');

  const plan = createSessionPlan('sess-1', [
    {
      planItemId: 'pi-1',
      methodologyId: 'meth-map',
      methodologySlug: 'map',
      methodologyName: 'MAP',
      role: 'primary',
      sequenceOrder: 1,
    },
  ]);
  const executions = [
    sampleExecution({
      executionId: 'ex-1',
      status: 'completed',
      methodology: {
        methodologyId: 'meth-map',
        methodologySlug: 'map',
        methodologyName: 'MAP',
      },
    }),
    sampleExecution({
      executionId: 'ex-2',
      status: 'active',
      sequenceOrder: 2,
      role: 'complementary',
      methodology: {
        methodologyId: 'meth-49-angels',
        methodologySlug: '49-angels',
        methodologyName: '49 Angels',
      },
    }),
  ];
  assert(listPlannedMethodologyIds(plan).includes('meth-map'), 'planned map');
  assert(listInvokedMethodologyIds(executions).includes('meth-49-angels'), 'invoked angels');
  const unplanned = findUnplannedInvocations(plan, executions);
  assert(unplanned.length === 1, 'one unplanned invocation');
  assert(unplanned[0].methodology.methodologyId === 'meth-49-angels', 'unplanned is angels');
}

function runF1ExecutionsAndWorkspace(): void {
  console.log('\n[F1] Executions + host contract + session-scoped active invariant\n');

  const sameSessionA = sampleExecution({
    executionId: 'a',
    status: 'active',
    sessionId: 'sess-1',
  });
  const sameSessionB = sampleExecution({
    executionId: 'b',
    status: 'active',
    sessionId: 'sess-1',
    sequenceOrder: 2,
    methodology: {
      methodologyId: 'meth-graphs',
      methodologySlug: '35-graphs',
      methodologyName: '35 Graphs',
    },
  });
  expectThrow(
    () => assertAtMostOneActiveExecution([sameSessionA, sameSessionB], 'sess-1'),
    'MULTIPLE_ACTIVE_EXECUTIONS',
  );

  const sess1Active = sampleExecution({
    executionId: 'ex-s1',
    status: 'active',
    sessionId: 'sess-1',
  });
  const sess2Active = sampleExecution({
    executionId: 'ex-s2',
    status: 'active',
    sessionId: 'sess-2',
    methodology: {
      methodologyId: 'meth-angels',
      methodologySlug: '49-angels',
      methodologyName: '49 Angels',
    },
  });
  assertAtMostOneActiveExecution([sess1Active, sess2Active], 'sess-1');
  assertAtMostOneActiveExecution([sess1Active, sess2Active], 'sess-2');
  assertAtMostOneActiveExecutionPerSession([sess1Active, sess2Active]);
  assert(
    listActiveExecutionsForSession([sess1Active, sess2Active], 'sess-1').length === 1,
    'sess-1 has one active',
  );
  assert(
    listActiveExecutionsForSession([sess1Active, sess2Active], 'sess-2').length === 1,
    'sess-2 has one active',
  );

  const pausedSecond = { ...sameSessionB, status: 'paused' as const };
  assertAtMostOneActiveExecution([sameSessionA, pausedSecond], 'sess-1');

  const activated = activateExecution(
    [
      { ...sameSessionA, status: 'paused' },
      pausedSecond,
      sess2Active,
    ],
    'b',
  );
  assert(
    listActiveExecutionsForSession(activated, 'sess-1').length === 1,
    'one active in sess-1 after activate',
  );
  assert(
    activated.find(e => e.executionId === 'b')?.status === 'active',
    'b is active',
  );
  assert(
    activated.find(e => e.executionId === 'ex-s2')?.status === 'active',
    'other session active preserved',
  );

  const state = createIsolatedExecutionState({ score: 1 });
  const cloned = cloneExecutionState(state);
  (cloned.payload as { score: number }).score = 99;
  assert((state.payload as { score: number }).score === 1, 'execution state isolated');

  const minimal = createMinimalMethodologyCapability({
    identity: {
      methodologyId: 'meth-plain',
      methodologySlug: 'plain',
      methodologyName: 'Plain Method',
    },
    state: createIsolatedExecutionState({}),
  });
  assert(methodologyOmitsOptionalCapabilities(minimal), 'no stages/visuals/progress');
  assert(minimal.hasStages !== true, 'hasStages absent');
  assert(minimal.hasVisualResources !== true, 'hasVisualResources absent');

  const mutablePayload = { n: 1 };
  const host = createMethodologyWorkspaceHostContract({
    identity: {
      methodologyId: 'meth-plain',
      methodologySlug: 'plain',
      methodologyName: 'Plain Method',
    },
    state: createIsolatedExecutionState(mutablePayload),
  });
  assert(host.identity.methodologyId === 'meth-plain', 'host identity');
  assert(typeof host.getIsolatedState === 'function', 'host getIsolatedState required');
  assert(typeof host.serializeState === 'function', 'host serializeState required');
  assert(hostContractOmitsOptionalCapabilities(host), 'host omits optional ops');
  mutablePayload.n = 99;
  assert(
    (host.getIsolatedState().payload as { n: number }).n === 1,
    'host state isolated from input mutation',
  );
  assert((host.serializeState() as { n: number }).n === 1, 'serialize isolated');

  const richHost = createMethodologyWorkspaceHostContract({
    identity: host.identity,
    state: createIsolatedExecutionState({}),
    getNavigation: () => [{ id: 'n1', label: 'Step' }],
    getProgress: () => ({ ratio: 0.5 }),
    getCompletionAwareness: () => ({ isComplete: false }),
    emitTimelineEvent: () => undefined,
    emitReportContribution: () => undefined,
  });
  assert(!hostContractOmitsOptionalCapabilities(richHost), 'rich host has optionals');
  const derived = capabilityFromHostContract(host);
  assert(derived.hasWorkspaceContent === true, 'capability from host');
}

function runF1SessionRecordAlignment(): void {
  console.log('\n[F1] PlatformSessionRecord ↔ PlatformSessionFacts\n');

  const record: PlatformSessionRecord = {
    sessionId: 'sess-1',
    therapistId: 'th-1',
    clientId: 'cl-1',
    lifecycleStatus: 'in_progress',
    sessionMode: 'online',
    intention: 'Equilíbrio',
    scheduledAt: '2026-08-03T09:00:00Z',
    schedulingTimezone: 'Europe/Lisbon',
    activeExecutionId: 'ex-1',
    accumulatedActiveDurationMs: 120000,
    createdAt: '2026-08-03T08:00:00Z',
    updatedAt: '2026-08-03T10:00:00Z',
    startedAt: '2026-08-03T09:05:00Z',
    closingEnteredAt: undefined,
    completedAt: undefined,
    cancelledAt: undefined,
  };

  assert(record.sessionMode === 'online', 'record sessionMode');
  assert(record.intention === 'Equilíbrio', 'record intention');
  assert(record.scheduledAt === '2026-08-03T09:00:00Z', 'record scheduledAt');
  assert(record.activeExecutionId === 'ex-1', 'record activeExecutionId');
  assert(record.accumulatedActiveDurationMs === 120000, 'record duration');
  assert(record.startedAt === '2026-08-03T09:05:00Z', 'record startedAt');
  assert(record.schedulingTimezone === 'Europe/Lisbon', 'scheduling timezone complement');
}

function runF1NotesTimelineContributions(): void {
  console.log('\n[F1] Notes, timeline, contributions\n');

  const note = createSessionNote({
    noteId: 'n1',
    sessionId: 'sess-1',
    kind: 'written',
    body: 'Observação',
    disposition: 'private',
    provenance: { source: 'therapist', captureMethod: 'written' },
    createdAt: '2026-08-03T10:00:00Z',
    updatedAt: '2026-08-03T10:00:00Z',
    executionId: 'ex-1',
  });
  assert(!isNoteEligibleForReportInclusion(note), 'private not eligible');
  const reviewed = setNoteDisposition(note, 'review_for_report', '2026-08-03T11:00:00Z');
  assert(isNoteEligibleForReportInclusion(reviewed), 'review eligible');
  const included = setNoteDisposition(reviewed, 'included_in_report', '2026-08-03T12:00:00Z');
  assert(included.disposition === 'included_in_report', 'included disposition');
  assert(included.provenance.source === 'therapist', 'note provenance');

  const ev1 = createTimelineEvent({
    eventId: 'e1',
    sessionId: 'sess-1',
    source: 'platform',
    eventType: 'session.started',
    occurredAt: '2026-08-03T10:00:00Z',
    payload: {},
    payloadSchemaVersion: 'v1',
  });
  const ev2 = createTimelineEvent({
    eventId: 'e2',
    sessionId: 'sess-1',
    source: 'methodology',
    eventType: 'execution.completed',
    occurredAt: '2026-08-03T11:00:00Z',
    payload: { executionId: 'ex-1' },
    payloadSchemaVersion: 'v1',
    executionId: 'ex-1',
  });
  const ev3 = createTimelineEvent({
    eventId: 'e3',
    sessionId: 'sess-1',
    source: 'therapist',
    eventType: 'note.added',
    occurredAt: '2026-08-03T11:05:00Z',
    payload: { noteId: 'n1' },
    payloadSchemaVersion: 'v1',
  });
  assert(classifyTimelineEvent(ev1) === 'platform', 'class platform');
  assert(classifyTimelineEvent(ev2) === 'methodology', 'class methodology');
  assert(classifyTimelineEvent(ev3) === 'therapist', 'class therapist');
  const timeline = appendTimelineEvent(appendTimelineEvent([ev1], ev2), ev3);
  assert(timeline.length === 3, 'append timeline');
  assert(timeline[0].eventId === 'e1', 'append preserves order');

  let contrib = createReportContribution({
    contributionId: 'c1',
    sessionId: 'sess-1',
    source: 'methodology.adapter',
    structuredValue: { key: 'v' },
    humanReadableValue: 'Valor',
    inclusion: 'candidate',
    provenance: { emittedBy: 'adapter', emittedAt: '2026-08-03T10:00:00Z' },
    createdAt: '2026-08-03T10:00:00Z',
    updatedAt: '2026-08-03T10:00:00Z',
    executionId: 'ex-1',
    methodologyId: 'meth-map',
  });
  assert(!isContributionIncluded(contrib), 'candidate not included');
  contrib = setContributionInclusion(contrib, 'included', '2026-08-03T12:00:00Z');
  assert(isContributionIncluded(contrib), 'included');
  assert(contrib.provenance.emittedBy === 'adapter', 'contribution provenance');
}

function runF1ArchiveAndReportBoundary(): void {
  console.log('\n[F1] Archive assembly vs sealed + report projection\n');

  const testimony = createTestimonySnapshot({
    snapshotId: 'snap-1',
    sessionId: 'sess-1',
    clientId: 'cl-1',
    capturedAt: '2026-08-03T09:05:00Z',
    identity: sampleIdentity(),
  });

  const assembly = createSessionArchiveAssembly({
    archiveId: 'arch-1',
    sessionId: 'sess-1',
    platformFacts: {
      sessionId: 'sess-1',
      therapistId: 'th-1',
      clientId: 'cl-1',
      lifecycleStatus: 'completed',
      sessionMode: 'distance',
      createdAt: '2026-08-03T09:00:00Z',
      updatedAt: '2026-08-03T12:00:00Z',
      completedAt: '2026-08-03T12:00:00Z',
    },
    methodologyExecutions: [],
    notes: [],
    transcriptCaptures: [],
    transcriptSegments: [],
    timeline: [],
    reportContributions: [],
    provenance: {
      assembledAt: '2026-08-03T12:00:00Z',
      assembledBy: 'platform',
    },
  });
  assert(assembly.assemblyStatus === 'in_assembly', 'archive in assembly');
  assert(assembly.reportTemplateAuthority === null, 'archive has no template authority');
  assert(!isSealedCanonicalArchive(assembly), 'assembly not sealed');

  expectThrow(
    () => sealCompletedSessionArchive(assembly, {
      sealing: {
        sealedAt: '2026-08-03T12:01:00Z',
        sealedByTherapistId: 'th-1',
        archiveSchemaVersion: 'platform.session.archive.v1',
      },
      testimonySnapshot: undefined as never,
    }),
    'ARCHIVE_SEAL_REQUIRES_TESTIMONY',
  );

  const sealing = {
    sealedAt: '2026-08-03T12:01:00Z',
    sealedByTherapistId: 'th-1',
    archiveSchemaVersion: 'platform.session.archive.v1',
  };
  const sealed = sealCompletedSessionArchive(assembly, {
    sealing,
    testimonySnapshot: testimony,
  });
  assert(isSealedCanonicalArchive(sealed), 'sealed archive');
  assertSealedArchiveImmutable(sealed);
  assert(sealed.testimonySnapshot?.snapshotId === 'snap-1', 'sealed has testimony');
  assert(sealed.sealing.sealedAt === sealing.sealedAt, 'sealed has sealing');

  sealing.sealedAt = 'mutated';
  (testimony.identity as { displayName: string }).displayName = 'MUTATED';
  assert(sealed.sealing.sealedAt === '2026-08-03T12:01:00Z', 'sealing input mutation isolated');
  assert(
    sealed.testimonySnapshot?.identity.displayName === 'Ana',
    'testimony input mutation isolated',
  );

  expectThrow(() => {
    (sealed as { archiveId: string }).archiveId = 'hacked';
  });

  const inProgressAssembly = createSessionArchiveAssembly({
    ...assembly,
    platformFacts: {
      ...assembly.platformFacts,
      lifecycleStatus: 'in_progress',
      completedAt: undefined,
    },
  });
  expectThrow(
    () => sealCompletedSessionArchive(inProgressAssembly, {
      sealing: {
        sealedAt: '2026-08-03T12:01:00Z',
        sealedByTherapistId: 'th-1',
        archiveSchemaVersion: 'platform.session.archive.v1',
      },
      testimonySnapshot: testimony,
    }),
    'ARCHIVE_SEAL_REQUIRES_COMPLETED_SESSION',
  );

  const templateA = { templateId: 'rpt-a', templateVersion: '1', name: 'A' };
  const templateB = { templateId: 'rpt-b', templateVersion: '2', name: 'B' };
  const afterA = assertArchiveIndependentOfReportTemplate(sealed, templateA);
  const afterB = assertArchiveIndependentOfReportTemplate(afterA, templateB);
  assert(
    JSON.stringify(afterA.platformFacts) === JSON.stringify(afterB.platformFacts),
    'archive facts unchanged across templates',
  );
  assert(afterB.reportTemplateAuthority === null, 'still null authority');

  const draft = createReportProjectionDraft({
    projectionId: 'proj-1',
    sessionId: 'sess-1',
    archiveId: sealed.archiveId,
    template: templateA,
    therapistEdits: { title: 'Custom' },
    createdAt: '2026-08-03T12:30:00Z',
    updatedAt: '2026-08-03T12:30:00Z',
  });
  assert(draft.therapistEdits.title === 'Custom', 'edits on projection');
  assert(sealed.platformFacts.lifecycleStatus === 'completed', 'archive untouched');

  assertSessionAndReportLifecyclesIndependent('completed', null);
  assertSessionAndReportLifecyclesIndependent('completed', 'not_started');
  assertSessionAndReportLifecyclesIndependent('in_progress', 'draft');
  assert(advanceReportLifecycle('draft', 'in_review') === 'in_review', 'report lifecycle');
  expectThrow(
    () => advanceReportLifecycle('shared', 'draft'),
    'INVALID_REPORT_LIFECYCLE_TRANSITION',
  );

  const mutableContent = { section: 'A' };
  const mutableTemplate = { templateId: 'rpt-a', templateVersion: '1', name: 'A' };
  const rendition = createApprovedReportRendition({
    renditionId: 'ren-1',
    projectionId: 'proj-1',
    sessionId: 'sess-1',
    archiveId: sealed.archiveId,
    template: mutableTemplate,
    version: 1,
    approvedAt: '2026-08-03T13:00:00Z',
    approvedByTherapistId: 'th-1',
    sealedContent: mutableContent,
  });
  assertApprovedRenditionImmutable(rendition);
  mutableContent.section = 'HACKED';
  mutableTemplate.name = 'HACKED';
  assert(
    (rendition.sealedContent as { section: string }).section === 'A',
    'rendition content isolated from input mutation',
  );
  assert(rendition.template.name === 'A', 'rendition template isolated');
  expectThrow(() => {
    (rendition as { version: number }).version = 99;
  });

  const capture = startTranscriptCapture({
    captureId: 'cap-1',
    sessionId: 'sess-1',
    startedAt: '2026-08-03T10:00:00Z',
    consentRecorded: true,
  });
  assert(capture.status === 'listening', 'transcript listening');
  const stopped = stopTranscriptCapture(capture, '2026-08-03T11:00:00Z');
  assert(stopped.status === 'stopped', 'transcript stopped');
}

function main(): void {
  console.log('=== Platform Session F0 + F1 validation ===');
  try {
    runF0Characterization();
    runF1Lifecycle();
    runF1TestimonyAndPlan();
    runF1ExecutionsAndWorkspace();
    runF1SessionRecordAlignment();
    runF1NotesTimelineContributions();
    runF1ArchiveAndReportBoundary();
    console.log(`\nPASSED assertions: ${passed}`);
    console.log('=== F0 + F1 VALIDATION OK ===\n');
  } catch (err) {
    console.error('\nFAILED:', err instanceof Error ? err.message : err);
    console.error(`Assertions passed before failure: ${passed}; failed bucket: ${failed}`);
    (globalThis as { process?: { exit: (code: number) => void } }).process?.exit(1);
    throw err;
  }
}

main();
