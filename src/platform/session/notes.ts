/**
 * Platform session notes (F1) — contracts + disposition helpers.
 * No audio recording or transcription implementation.
 */

import type {
  NoteDisposition,
  NoteKind,
  SessionNoteProvenance,
  SessionNoteRecord,
} from '@/platform/session/types';
import { PlatformSessionDomainError } from '@/platform/session/types';

export function createSessionNote(input: {
  noteId: string;
  sessionId: string;
  kind: NoteKind;
  body: string;
  disposition: NoteDisposition;
  provenance: SessionNoteProvenance;
  createdAt: string;
  updatedAt: string;
  executionId?: string;
}): SessionNoteRecord {
  if (!input.body.trim() && input.kind !== 'transcript_excerpt') {
    throw new PlatformSessionDomainError(
      'NOTE_BODY_REQUIRED',
      'Session note body is required for written and dictated notes',
    );
  }

  return {
    noteId: input.noteId,
    sessionId: input.sessionId,
    kind: input.kind,
    body: input.body,
    disposition: input.disposition,
    provenance: input.provenance,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    executionId: input.executionId,
  };
}

export function setNoteDisposition(
  note: SessionNoteRecord,
  disposition: NoteDisposition,
  updatedAt: string,
): SessionNoteRecord {
  return { ...note, disposition, updatedAt };
}

export function isNoteEligibleForReportInclusion(note: SessionNoteRecord): boolean {
  return (
    note.disposition === 'review_for_report'
    || note.disposition === 'included_in_report'
  );
}
