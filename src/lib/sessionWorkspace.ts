/**
 * Workspace ↔ sessions store — normalização, contagens e transições de status.
 */

import type { Session, SessionStatus, ToolResult, FieldValue } from '@/types';
import type { StageCompletion } from '@/lib/session-state';

export interface ToolWorkCounts {
  /** identified + activated (trabalhados no diagnóstico) */
  identified: number;
  /** apenas activated */
  activated: number;
}

export function countToolWork(toolResults: ToolResult[]): ToolWorkCounts {
  const identified = toolResults.filter(
    r => r.status === 'identified' || r.status === 'activated',
  ).length;
  const activated = toolResults.filter(r => r.status === 'activated').length;
  return { identified, activated };
}

/** Agrega toolResults de todos os steps (seed legado). */
export function collectToolResultsFromStages(session: Session): ToolResult[] {
  const byId = new Map<string, ToolResult>();
  for (const stage of session.stages) {
    for (const step of stage.steps ?? []) {
      for (const tr of step.toolResults ?? []) {
        const prev = byId.get(tr.toolId);
        byId.set(tr.toolId, prev ? { ...prev, ...tr } : { ...tr });
      }
    }
  }
  return [...byId.values()];
}

export function mergeToolResults(
  primary: ToolResult[],
  secondary: ToolResult[],
): ToolResult[] {
  const byId = new Map<string, ToolResult>();
  for (const tr of secondary) byId.set(tr.toolId, { ...tr });
  for (const tr of primary) {
    const prev = byId.get(tr.toolId);
    byId.set(tr.toolId, prev ? { ...prev, ...tr } : { ...tr });
  }
  return [...byId.values()];
}

/** Garante toolResults no topo da sessão (store + seed). */
export function normalizeSessionWorkspace(session: Session): Session {
  const fromStages = collectToolResultsFromStages(session);
  const toolResults = session.toolResults?.length
    ? mergeToolResults(session.toolResults, fromStages)
    : fromStages;

  return {
    ...session,
    toolResults,
    fieldValues: session.fieldValues ?? {},
  };
}

export function hasMeaningfulWorkspaceActivity(input: {
  toolResults: ToolResult[];
  hawkinsInitial: number | null;
  hawkinsFinal: number | null;
  reverbDays: number | null;
  currentStageCode?: string;
}): boolean {
  if (input.hawkinsInitial !== null || input.hawkinsFinal !== null || input.reverbDays !== null) {
    return true;
  }
  if (input.currentStageCode && input.currentStageCode !== 'preparation') {
    return true;
  }
  return input.toolResults.some(r => r.status !== 'not_analyzed');
}

export function deriveSessionStatus(
  current: SessionStatus,
  input: {
    stageCompletion: StageCompletion;
    toolResults: ToolResult[];
    hawkinsInitial: number | null;
    hawkinsFinal: number | null;
    reverbDays: number | null;
    currentStageCode?: string;
    forceCompleted?: boolean;
  },
): SessionStatus {
  if (current === 'reported') return 'reported';

  if (input.forceCompleted || input.stageCompletion.closing) {
    return 'completed';
  }

  if (hasMeaningfulWorkspaceActivity(input)) {
    if (current === 'draft' || current === 'paused') return 'in_progress';
    return current;
  }

  return current;
}

export interface WorkspacePersistPayload {
  toolResults: ToolResult[];
  fieldValues: Record<string, FieldValue>;
  hawkinsInitial: number | null;
  hawkinsFinal: number | null;
  reverbDays: number | null;
  currentStageCode: string;
  stageCompletion: StageCompletion;
  status: SessionStatus;
  completedAt?: string;
}

export function buildWorkspacePersistPayload(
  session: Session,
  input: Omit<WorkspacePersistPayload, 'status' | 'completedAt'> & {
    forceCompleted?: boolean;
  },
): WorkspacePersistPayload {
  const status = deriveSessionStatus(session.status, {
    stageCompletion: input.stageCompletion,
    toolResults: input.toolResults,
    hawkinsInitial: input.hawkinsInitial,
    hawkinsFinal: input.hawkinsFinal,
    reverbDays: input.reverbDays,
    currentStageCode: input.currentStageCode,
    forceCompleted: input.forceCompleted,
  });

  const completedAt =
    status === 'completed' && !session.completedAt
      ? new Date().toISOString()
      : session.completedAt;

  return {
    ...input,
    status,
    completedAt: status === 'completed' ? completedAt : session.completedAt,
  };
}
