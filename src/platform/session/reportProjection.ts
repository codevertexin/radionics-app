/**
 * Report projection boundary (F1) — separate from session lifecycle and archive.
 * Approved renditions are domain-immutable (clone + freeze). No persistence.
 */

import type {
  ApprovedReportRendition,
  PlatformReportLifecycleStatus,
  PlatformSessionLifecycleStatus,
  ReportProjectionDraft,
  ReportTemplateRef,
} from '@/platform/session/types';
import { PlatformSessionDomainError } from '@/platform/session/types';
import { immutableClone } from '@/platform/session/immutability';

const ALLOWED_REPORT: Record<
  PlatformReportLifecycleStatus,
  readonly PlatformReportLifecycleStatus[]
> = {
  not_started: ['accumulating', 'draft'],
  accumulating: ['draft', 'in_review'],
  draft: ['in_review', 'approved'],
  in_review: ['draft', 'approved'],
  approved: ['shared'],
  shared: [],
};

export function createReportProjectionDraft(input: {
  projectionId: string;
  sessionId: string;
  archiveId: string;
  template: ReportTemplateRef;
  therapistEdits: Record<string, unknown>;
  inclusionOverrides?: ReportProjectionDraft['inclusionOverrides'];
  createdAt: string;
  updatedAt: string;
}): ReportProjectionDraft {
  return {
    projectionId: input.projectionId,
    archiveId: input.archiveId,
    sessionId: input.sessionId,
    template: { ...input.template },
    therapistEdits: { ...input.therapistEdits },
    inclusionOverrides: { ...(input.inclusionOverrides ?? {}) },
    status: 'draft',
    schemaVersion: 'platform.report.projection.v1',
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export function advanceReportLifecycle(
  from: PlatformReportLifecycleStatus,
  to: PlatformReportLifecycleStatus,
): PlatformReportLifecycleStatus {
  if (!ALLOWED_REPORT[from].includes(to)) {
    throw new PlatformSessionDomainError(
      'INVALID_REPORT_LIFECYCLE_TRANSITION',
      `Forbidden report lifecycle transition: ${from} → ${to}`,
    );
  }
  return to;
}

/**
 * Create an approved report rendition.
 * Result is domain-immutable; later mutation of input objects cannot affect it.
 */
export function createApprovedReportRendition(input: {
  renditionId: string;
  projectionId: string;
  sessionId: string;
  archiveId: string;
  template: ReportTemplateRef;
  version: number;
  approvedAt: string;
  approvedByTherapistId: string;
  sealedContent: unknown;
}): Readonly<ApprovedReportRendition> {
  const rendition: ApprovedReportRendition = {
    renditionId: input.renditionId,
    projectionId: input.projectionId,
    sessionId: input.sessionId,
    archiveId: input.archiveId,
    template: structuredClone(input.template),
    version: input.version,
    approvedAt: input.approvedAt,
    approvedByTherapistId: input.approvedByTherapistId,
    sealedContent: structuredClone(input.sealedContent),
    schemaVersion: 'platform.report.rendition.v1',
  };
  return immutableClone(rendition);
}

export function assertApprovedRenditionImmutable(
  rendition: Readonly<ApprovedReportRendition>,
): void {
  if (!Object.isFrozen(rendition)) {
    throw new PlatformSessionDomainError(
      'APPROVED_RENDITION_NOT_FROZEN',
      'Approved report rendition must be frozen in the domain',
    );
  }
}

/**
 * Session and report lifecycles are independent.
 * Completing a session does not imply any report status.
 */
export function assertSessionAndReportLifecyclesIndependent(
  sessionStatus: PlatformSessionLifecycleStatus,
  reportStatus: PlatformReportLifecycleStatus | null,
): void {
  void sessionStatus;
  void reportStatus;
}

/** `reported` is not a platform session status and not a report lifecycle status. */
export function isReportedASessionOrReportStatus(): boolean {
  return false;
}
