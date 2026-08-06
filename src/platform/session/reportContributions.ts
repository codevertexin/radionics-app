/**
 * Reportable contributions — candidates for reports, not approved sections (F1).
 */

import type {
  ContributionInclusion,
  ReportContributionRecord,
} from '@/platform/session/types';
import { PlatformSessionDomainError } from '@/platform/session/types';

export function createReportContribution(input: {
  contributionId: string;
  sessionId: string;
  source: string;
  structuredValue: unknown;
  inclusion: ContributionInclusion;
  provenance: ReportContributionRecord['provenance'];
  createdAt: string;
  updatedAt: string;
  executionId?: string;
  methodologyId?: string;
  humanReadableValue?: string;
  schemaVersion?: string;
}): ReportContributionRecord {
  if (!input.source.trim()) {
    throw new PlatformSessionDomainError(
      'CONTRIBUTION_SOURCE_REQUIRED',
      'Report contribution source is required',
    );
  }

  return {
    contributionId: input.contributionId,
    sessionId: input.sessionId,
    source: input.source,
    executionId: input.executionId,
    methodologyId: input.methodologyId,
    structuredValue: structuredClone(input.structuredValue),
    humanReadableValue: input.humanReadableValue,
    schemaVersion: input.schemaVersion ?? 'platform.session.reportContribution.v1',
    inclusion: input.inclusion,
    provenance: input.provenance,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export function setContributionInclusion(
  contribution: ReportContributionRecord,
  inclusion: ContributionInclusion,
  updatedAt: string,
): ReportContributionRecord {
  return { ...contribution, inclusion, updatedAt };
}

export function isContributionIncluded(
  contribution: ReportContributionRecord,
): boolean {
  return contribution.inclusion === 'included';
}
