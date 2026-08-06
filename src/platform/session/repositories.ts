/**
 * Repository interfaces for future mock / Supabase implementations (F1).
 * Must not import Supabase client or mock data modules.
 * PlatformSessionRecord aligns with permanent PlatformSessionFacts.
 */

import type {
  ClientIdentityProfile,
  ClientTestimonySnapshot,
  MethodologyExecutionRecord,
  PlatformSessionFacts,
  PlatformSessionLifecycleStatus,
  ReportContributionRecord,
  SealedCanonicalSessionArchive,
  SessionArchiveAssembly,
  SessionNoteRecord,
  SessionPlan,
  TimelineEventRecord,
  TranscriptCaptureSession,
  TranscriptSegment,
} from '@/platform/session/types';

/**
 * Persistent-session shape aligned with PlatformSessionFacts.
 * Optional schedulingTimezone complements scheduledAt without being lifecycle state.
 */
export type PlatformSessionRecord = PlatformSessionFacts & {
  schedulingTimezone?: string | null;
};

export interface PlatformSessionRepository {
  getById(sessionId: string): Promise<PlatformSessionRecord | null>;
  save(session: PlatformSessionRecord): Promise<void>;
  transitionLifecycle(
    sessionId: string,
    to: PlatformSessionLifecycleStatus,
  ): Promise<PlatformSessionRecord>;
}

export interface ClientIdentityRepository {
  getProfile(clientId: string): Promise<ClientIdentityProfile | null>;
  saveProfile(clientId: string, profile: ClientIdentityProfile): Promise<void>;
  getTestimonySnapshot(
    sessionId: string,
  ): Promise<ClientTestimonySnapshot | null>;
  saveTestimonySnapshot(snapshot: ClientTestimonySnapshot): Promise<void>;
}

export interface SessionPlanRepository {
  get(sessionId: string): Promise<SessionPlan | null>;
  save(plan: SessionPlan): Promise<void>;
}

export interface MethodologyExecutionRepository {
  listBySession(sessionId: string): Promise<MethodologyExecutionRecord[]>;
  save(execution: MethodologyExecutionRecord): Promise<void>;
}

export interface SessionNotesRepository {
  listBySession(sessionId: string): Promise<SessionNoteRecord[]>;
  save(note: SessionNoteRecord): Promise<void>;
}

export interface TranscriptRepository {
  getCapture(sessionId: string): Promise<TranscriptCaptureSession | null>;
  saveCapture(state: TranscriptCaptureSession): Promise<void>;
  listSegments(captureId: string): Promise<TranscriptSegment[]>;
  saveSegment(segment: TranscriptSegment): Promise<void>;
}

export interface TimelineRepository {
  listBySession(sessionId: string): Promise<TimelineEventRecord[]>;
  append(event: TimelineEventRecord): Promise<void>;
}

export interface ReportContributionRepository {
  listBySession(sessionId: string): Promise<ReportContributionRecord[]>;
  save(contribution: ReportContributionRecord): Promise<void>;
}

export interface SessionArchiveRepository {
  getAssembly(archiveId: string): Promise<SessionArchiveAssembly | null>;
  saveAssembly(archive: SessionArchiveAssembly): Promise<void>;
  getSealed(archiveId: string): Promise<SealedCanonicalSessionArchive | null>;
  saveSealed(archive: Readonly<SealedCanonicalSessionArchive>): Promise<void>;
}
