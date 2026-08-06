/**
 * Platform Session domain contracts — methodology-neutral (F1).
 * Product authority: Platform Session Experience + Implementation Readiness.
 * Must not import Mesa 35 / methodology-specific therapeutic fields.
 */

/** Canonical platform session lifecycle (excludes report states). */
export type PlatformSessionLifecycleStatus =
  | 'draft'
  | 'in_progress'
  | 'paused'
  | 'closing'
  | 'completed'
  | 'cancelled';

/** Report lifecycle is independent from session lifecycle. */
export type PlatformReportLifecycleStatus =
  | 'not_started'
  | 'accumulating'
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'shared';

export type SessionMode = 'presential' | 'online' | 'distance';

export type MethodologyExecutionRole = 'primary' | 'complementary';

export type MethodologyExecutionStatus =
  | 'not_started'
  | 'active'
  | 'paused'
  | 'completed'
  | 'abandoned';

export type NoteKind = 'written' | 'dictated' | 'transcript_excerpt';

export type NoteDisposition =
  | 'private'
  | 'review_for_report'
  | 'included_in_report';

export type TimelineEventSource =
  | 'platform'
  | 'methodology'
  | 'therapist';

export type ContributionInclusion =
  | 'candidate'
  | 'included'
  | 'excluded'
  | 'pending_review';

export type TranscriptCaptureStatus =
  | 'idle'
  | 'listening'
  | 'paused'
  | 'stopped';

export type TranscriptSegmentInclusion =
  | 'retained'
  | 'excluded'
  | 'pending_review';

/**
 * Editable client profile identity (platform).
 * displayName and fullName are distinct — do not reinterpret legacy Client.name as both.
 * Required identity: displayName, fullName, dateOfBirth, address, locality, country.
 * postalCode when applicable; contacts optional.
 */
export interface ClientIdentityProfile {
  displayName: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  locality: string;
  country: string;
  postalCode?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

/**
 * Immutable-at-start testimony snapshot of client identity.
 * Captured at explicit Start Session; separable from later profile edits.
 */
export interface ClientTestimonySnapshot {
  snapshotId: string;
  sessionId: string;
  clientId: string;
  capturedAt: string;
  identity: ClientIdentityProfile;
  /** Schema version of this snapshot envelope. */
  schemaVersion: string;
}

/** Methodologies intended before start — not a workflow or report template. */
export interface SessionPlanItem {
  planItemId: string;
  methodologyId: string;
  methodologySlug: string;
  methodologyName: string;
  role: MethodologyExecutionRole;
  sequenceOrder: number;
}

export interface SessionPlan {
  sessionId: string;
  items: SessionPlanItem[];
  schemaVersion: string;
}

export interface MethodologyIdentity {
  methodologyId: string;
  methodologySlug: string;
  methodologyName: string;
  specialtyId?: string;
  specialtySlug?: string;
}

/** Opaque, versioned, serializable methodology execution state. */
export interface MethodologyExecutionStateEnvelope {
  schemaVersion: string;
  adapterId?: string;
  adapterVersion?: string;
  workflowTemplateId?: string;
  workflowVersion?: string;
  /** Opaque payload — platform must not interpret methodology fields. */
  payload: unknown;
}

export interface MethodologyExecutionProgress {
  label?: string;
  ratio?: number;
  currentLabel?: string;
}

export interface MethodologyCompletionAwareness {
  isComplete: boolean;
  summary?: string;
  missingOptional?: string[];
}

export interface MethodologyExecutionRecord {
  executionId: string;
  sessionId: string;
  methodology: MethodologyIdentity;
  role: MethodologyExecutionRole;
  sequenceOrder: number;
  status: MethodologyExecutionStatus;
  state: MethodologyExecutionStateEnvelope;
  startedAt?: string;
  pausedAt?: string;
  resumedAt?: string;
  completedAt?: string;
  progress?: MethodologyExecutionProgress;
  completionAwareness?: MethodologyCompletionAwareness;
}

/**
 * Declarative capability flags (complementary to the operational host contract).
 * Only identity, content capability flag, and isolated state are required.
 */
export interface MethodologyWorkspaceCapability {
  identity: MethodologyIdentity;
  /** Whether the methodology provides workspace content to host. */
  hasWorkspaceContent: boolean;
  /** Isolated serializable state envelope (required when execution exists). */
  state: MethodologyExecutionStateEnvelope;
  /** Optional capabilities — omit when absent; platform must not invent UI. */
  hasInternalNavigation?: boolean;
  hasStages?: boolean;
  hasProgress?: boolean;
  hasCompletionAwareness?: boolean;
  hasVisualResources?: boolean;
  emitsTimelineEvents?: boolean;
  emitsReportContributions?: boolean;
  hasComplementaryRelationships?: boolean;
}

/** Framework-neutral navigation item — not a React route or component. */
export interface MethodologyNavigationItem {
  id: string;
  label: string;
  code?: string;
  order?: number;
}

/**
 * Opaque workspace content descriptor.
 * Host decides presentation; methodologies must not return framework UI trees here.
 */
export interface MethodologyWorkspaceContentDescriptor {
  contentKind: 'none' | 'opaque';
  contentRef?: string;
  description?: string;
}

export interface MethodologyTimelineEmissionInput {
  eventType: string;
  occurredAt: string;
  payloadSchemaVersion: string;
  payload: unknown;
  executionId?: string;
}

export interface MethodologyReportContributionEmissionInput {
  source: string;
  structuredValue: unknown;
  humanReadableValue?: string;
  schemaVersion?: string;
  inclusion?: ContributionInclusion;
  executionId?: string;
  methodologyId?: string;
}

/**
 * Operational, framework-neutral contract between Platform Workspace Host
 * and a methodology. No React. No methodology-specific therapeutic fields.
 *
 * Required: identity, isolated state, serialization.
 * Optional: navigation, progress, completion awareness, timeline, report contributions.
 */
export interface MethodologyWorkspaceHostContract {
  identity: MethodologyIdentity;
  /** Current isolated serializable state. */
  getIsolatedState(): MethodologyExecutionStateEnvelope;
  /** Serialize current isolated state for persistence preparation. */
  serializeState(): unknown;
  /** Optional opaque content descriptor (not a UI tree). */
  describeWorkspaceContent?(): MethodologyWorkspaceContentDescriptor;
  getNavigation?(): MethodologyNavigationItem[];
  getProgress?(): MethodologyExecutionProgress;
  getCompletionAwareness?(): MethodologyCompletionAwareness;
  emitTimelineEvent?(input: MethodologyTimelineEmissionInput): void;
  emitReportContribution?(input: MethodologyReportContributionEmissionInput): void;
}

export interface SessionNoteProvenance {
  source: 'therapist' | 'system' | 'transcript';
  captureMethod?: NoteKind;
  deviceOrChannel?: string;
}

export interface SessionNoteRecord {
  noteId: string;
  sessionId: string;
  executionId?: string;
  kind: NoteKind;
  body: string;
  disposition: NoteDisposition;
  provenance: SessionNoteProvenance;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptCaptureSession {
  captureId: string;
  sessionId: string;
  executionId?: string;
  status: TranscriptCaptureStatus;
  startedAt?: string;
  stoppedAt?: string;
  consentRecorded: boolean;
  privacyLabel?: string;
  schemaVersion: string;
}

export interface TranscriptSegment {
  segmentId: string;
  captureId: string;
  sessionId: string;
  executionId?: string;
  text: string;
  startedAt: string;
  endedAt?: string;
  inclusion: TranscriptSegmentInclusion;
  provenance: {
    engine?: string;
    confidence?: number;
  };
}

export interface TimelineEventRecord {
  eventId: string;
  sessionId: string;
  executionId?: string;
  source: TimelineEventSource;
  /** Meaningful event type — not clicks/hover/autosave. */
  eventType: string;
  occurredAt: string;
  payloadSchemaVersion: string;
  payload: unknown;
}

export interface ReportContributionRecord {
  contributionId: string;
  sessionId: string;
  executionId?: string;
  methodologyId?: string;
  source: string;
  structuredValue: unknown;
  humanReadableValue?: string;
  schemaVersion: string;
  inclusion: ContributionInclusion;
  provenance: {
    emittedBy: string;
    emittedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ArchiveSealingMetadata {
  sealedAt: string;
  sealedByTherapistId: string;
  archiveSchemaVersion: string;
}

/**
 * Shared archive payload fields.
 * Preserves more than any one report displays.
 * Must not treat report template as data authority.
 */
export interface SessionArchiveBase {
  archiveId: string;
  sessionId: string;
  schemaVersion: string;
  platformFacts: PlatformSessionFacts;
  testimonySnapshot?: ClientTestimonySnapshot;
  sessionPlan?: SessionPlan;
  methodologyExecutions: MethodologyExecutionRecord[];
  notes: SessionNoteRecord[];
  transcriptCaptures: TranscriptCaptureSession[];
  transcriptSegments: TranscriptSegment[];
  timeline: TimelineEventRecord[];
  reportContributions: ReportContributionRecord[];
  provenance: {
    assembledAt: string;
    assembledBy: string;
  };
  /**
   * Always null: archive must not treat a report template as data authority.
   * Changing a report template must not change the archive.
   */
  reportTemplateAuthority: null;
}

/** Archive while still being assembled — not yet sealed. */
export interface SessionArchiveAssembly extends SessionArchiveBase {
  assemblyStatus: 'in_assembly';
  sealing?: ArchiveSealingMetadata;
}

/**
 * Sealed canonical archive — immutable in the domain after sealing.
 * Completed sessions require testimonySnapshot + sealing metadata.
 */
export interface SealedCanonicalSessionArchive extends SessionArchiveBase {
  assemblyStatus: 'sealed';
  sealing: ArchiveSealingMetadata;
  /** Required when platformFacts.lifecycleStatus === 'completed'. */
  testimonySnapshot?: ClientTestimonySnapshot;
}

/** @deprecated Prefer SessionArchiveAssembly | SealedCanonicalSessionArchive */
export type CanonicalSessionArchive =
  | SessionArchiveAssembly
  | SealedCanonicalSessionArchive;

export interface PlatformSessionFacts {
  sessionId: string;
  therapistId: string;
  clientId: string;
  lifecycleStatus: PlatformSessionLifecycleStatus;
  sessionMode: SessionMode;
  intention?: string;
  scheduledAt?: string;
  activeExecutionId?: string | null;
  accumulatedActiveDurationMs?: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  closingEnteredAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface ReportTemplateRef {
  templateId: string;
  templateVersion: string;
  name: string;
}

/** Projection draft — template applied to archive; edits separate from archive facts. */
export interface ReportProjectionDraft {
  projectionId: string;
  archiveId: string;
  sessionId: string;
  template: ReportTemplateRef;
  therapistEdits: Record<string, unknown>;
  inclusionOverrides: Record<string, ContributionInclusion>;
  status: PlatformReportLifecycleStatus;
  schemaVersion: string;
  createdAt: string;
  updatedAt: string;
}

/** Immutable approved report rendition (conceptual). */
export interface ApprovedReportRendition {
  renditionId: string;
  projectionId: string;
  archiveId: string;
  sessionId: string;
  template: ReportTemplateRef;
  version: number;
  approvedAt: string;
  approvedByTherapistId: string;
  /** Opaque sealed payload of the approved presentation. */
  sealedContent: unknown;
  schemaVersion: string;
}

export class PlatformSessionDomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'PlatformSessionDomainError';
    this.code = code;
  }
}
