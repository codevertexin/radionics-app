/**
 * snapshot-builder — pure functions for building Supabase-ready snapshots
 *
 * These helpers are side-effect-free and framework-agnostic.
 * They exist so report generation and export paths can build snapshots
 * without depending on the React hook (useSessionState).
 */

import type {
  SessionStateSnapshot,
  SessionSnapshot,
  Session,
  Client,
  FieldValue,
  ToolResult,
} from '@/types';

// ─── buildSnapshotFromState ────────────────────────────────────────────────────
/**
 * Construct a `SessionStateSnapshot` (radionics_session_details shape) from
 * raw state values. Use this in report generation and export paths where you
 * already have the data but not a live hook instance.
 */
export function buildSnapshotFromState(params: {
  sessionId: string;
  hawkinsInitial: number | null;
  hawkinsFinal: number | null;
  reverbDays: number | null;
  toolResults: ToolResult[];
  fieldValues?: Record<string, FieldValue>;
  stageCompletion?: Record<string, boolean>;
}): SessionStateSnapshot {
  const {
    sessionId,
    hawkinsInitial,
    hawkinsFinal,
    reverbDays,
    toolResults,
    fieldValues = {},
    stageCompletion = {},
  } = params;

  return {
    session_id: sessionId,
    hawkins_initial: hawkinsInitial,
    hawkins_final: hawkinsFinal,
    reverberation_days: reverbDays,
    tool_results: toolResults,
    identified_tool_ids: toolResults
      .filter(r => r.status === 'identified' || r.status === 'activated')
      .map(r => r.toolId),
    activated_tool_ids: toolResults
      .filter(r => r.status === 'activated')
      .map(r => r.toolId),
    field_values: fieldValues,
    stage_completion: stageCompletion,
    updated_at: new Date().toISOString(),
  };
}

// ─── buildSessionSnapshot ─────────────────────────────────────────────────────
/**
 * Construct a `SessionSnapshot` (radionics_session_snapshots shape) from a
 * completed `Session` + `Client`. Useful when persisting a snapshot at session
 * completion time from existing data rather than live hook state.
 */
export function buildSessionSnapshot(
  session: Session,
  client: Client,
  toolResults: ToolResult[],
  options: {
    therapistNotes?: string;
    fieldValues?: Record<string, FieldValue>;
  } = {}
): SessionSnapshot {
  const identified = toolResults.filter(r => r.status === 'identified' || r.status === 'activated');
  const activated = toolResults.filter(r => r.status === 'activated');

  return {
    session_id: session.id,
    client_id: client.id,
    client_name: client.name,
    client_email: client.email,
    client_whatsapp: client.whatsapp,
    client_telegram: client.telegram,
    client_type: client.clientType,
    methodology_name: session.methodologyName,
    methodology_code: session.methodologyCode,
    session_date: (session.completedAt ?? session.createdAt).slice(0, 10),
    intention: session.intention,
    hawkins_initial: session.hawkinsInitial ?? null,
    hawkins_final: session.hawkinsFinal ?? null,
    reverberation_days: session.reverberationDays ?? null,
    tool_results: toolResults,
    identified_tool_names: identified.map(r => r.toolName),
    activated_tool_names: activated.map(r => r.toolName),
    therapist_notes: options.therapistNotes,
    created_at: new Date().toISOString(),
  };
}
