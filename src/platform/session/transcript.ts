/**
 * Transcript capture boundary (F1) — contracts only.
 * No browser recording, STT, storage, or consent UI.
 */

import type {
  TranscriptCaptureSession,
  TranscriptSegment,
} from '@/platform/session/types';
import { PlatformSessionDomainError } from '@/platform/session/types';

export function startTranscriptCapture(input: {
  captureId: string;
  sessionId: string;
  startedAt: string;
  executionId?: string;
  consentRecorded?: boolean;
  privacyLabel?: string;
}): TranscriptCaptureSession {
  return {
    captureId: input.captureId,
    sessionId: input.sessionId,
    executionId: input.executionId,
    status: 'listening',
    startedAt: input.startedAt,
    stoppedAt: undefined,
    consentRecorded: input.consentRecorded ?? false,
    privacyLabel: input.privacyLabel,
    schemaVersion: 'platform.session.transcriptCapture.v1',
  };
}

export function stopTranscriptCapture(
  state: TranscriptCaptureSession,
  stoppedAt: string,
): TranscriptCaptureSession {
  if (state.status !== 'listening' && state.status !== 'paused') {
    throw new PlatformSessionDomainError(
      'TRANSCRIPT_NOT_ACTIVE',
      'Cannot stop transcript capture that is not listening or paused',
    );
  }
  return {
    ...state,
    status: 'stopped',
    stoppedAt,
  };
}

export function createTranscriptSegment(input: {
  segmentId: string;
  captureId: string;
  sessionId: string;
  text: string;
  startedAt: string;
  endedAt?: string;
  inclusion: TranscriptSegment['inclusion'];
  provenance: TranscriptSegment['provenance'];
  executionId?: string;
}): TranscriptSegment {
  return { ...input };
}
