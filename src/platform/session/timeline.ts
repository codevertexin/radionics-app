/**
 * Append-oriented, methodology-neutral timeline (F1).
 * Does not model clicks, hover, or autosave noise.
 */

import type { TimelineEventRecord, TimelineEventSource } from '@/platform/session/types';
import { PlatformSessionDomainError } from '@/platform/session/types';

const MEANINGFUL_SOURCES: readonly TimelineEventSource[] = [
  'platform',
  'methodology',
  'therapist',
];

export function isMeaningfulTimelineSource(
  value: string,
): value is TimelineEventSource {
  return (MEANINGFUL_SOURCES as readonly string[]).includes(value);
}

export function createTimelineEvent(input: {
  eventId: string;
  sessionId: string;
  source: TimelineEventSource;
  eventType: string;
  occurredAt: string;
  payload: unknown;
  payloadSchemaVersion: string;
  executionId?: string;
}): TimelineEventRecord {
  if (!isMeaningfulTimelineSource(input.source)) {
    throw new PlatformSessionDomainError(
      'INVALID_TIMELINE_EVENT_SOURCE',
      `Unsupported timeline event source: ${input.source}`,
    );
  }
  if (!input.eventType.trim()) {
    throw new PlatformSessionDomainError(
      'TIMELINE_EVENT_TYPE_REQUIRED',
      'Timeline eventType is required',
    );
  }

  return {
    eventId: input.eventId,
    sessionId: input.sessionId,
    source: input.source,
    eventType: input.eventType,
    occurredAt: input.occurredAt,
    payload: structuredClone(input.payload),
    payloadSchemaVersion: input.payloadSchemaVersion,
    executionId: input.executionId,
  };
}

/** Append-only: returns a new array; never mutates prior events. */
export function appendTimelineEvent(
  timeline: readonly TimelineEventRecord[],
  event: TimelineEventRecord,
): TimelineEventRecord[] {
  return [...timeline, event];
}

export function classifyTimelineEvent(event: TimelineEventRecord): TimelineEventSource {
  return event.source;
}
