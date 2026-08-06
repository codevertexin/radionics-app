/**
 * Methodology execution records + one-active-execution invariant (F1).
 * Invariant is explicitly scoped by sessionId.
 */

import {
  PlatformSessionDomainError,
  type MethodologyExecutionRecord,
  type MethodologyExecutionStateEnvelope,
} from '@/platform/session/types';

export function cloneExecutionState(
  state: MethodologyExecutionStateEnvelope,
): MethodologyExecutionStateEnvelope {
  return {
    schemaVersion: state.schemaVersion,
    adapterId: state.adapterId,
    adapterVersion: state.adapterVersion,
    workflowTemplateId: state.workflowTemplateId,
    workflowVersion: state.workflowVersion,
    payload: structuredClone(state.payload),
  };
}

export function createIsolatedExecutionState(
  payload: unknown,
  meta?: Partial<Omit<MethodologyExecutionStateEnvelope, 'payload' | 'schemaVersion'>>,
): MethodologyExecutionStateEnvelope {
  return {
    schemaVersion: meta?.adapterVersion
      ? `execution-state/${meta.adapterVersion}`
      : 'execution-state/v1',
    adapterId: meta?.adapterId,
    adapterVersion: meta?.adapterVersion,
    workflowTemplateId: meta?.workflowTemplateId,
    workflowVersion: meta?.workflowVersion,
    payload: structuredClone(payload),
  };
}

export function listActiveExecutionsForSession(
  executions: readonly MethodologyExecutionRecord[],
  sessionId: string,
): MethodologyExecutionRecord[] {
  return executions.filter(
    e => e.sessionId === sessionId && e.status === 'active',
  );
}

/**
 * Invariant: within a single sessionId, at most one execution may be active.
 * Active executions belonging to other sessions must not cause a conflict.
 */
export function assertAtMostOneActiveExecution(
  executions: readonly MethodologyExecutionRecord[],
  sessionId: string,
): void {
  const active = listActiveExecutionsForSession(executions, sessionId);
  if (active.length > 1) {
    throw new PlatformSessionDomainError(
      'MULTIPLE_ACTIVE_EXECUTIONS',
      `Expected at most one active methodology execution for session ${sessionId}, found ${active.length}`,
    );
  }
}

/**
 * Validates the one-active invariant independently for every sessionId present.
 */
export function assertAtMostOneActiveExecutionPerSession(
  executions: readonly MethodologyExecutionRecord[],
): void {
  const sessionIds = new Set(executions.map(e => e.sessionId));
  for (const sessionId of sessionIds) {
    assertAtMostOneActiveExecution(executions, sessionId);
  }
}

/**
 * Activates one execution within its session; other actives in the same session pause.
 * Does not alter active executions belonging to other sessions.
 */
export function activateExecution(
  executions: MethodologyExecutionRecord[],
  executionId: string,
): MethodologyExecutionRecord[] {
  const target = executions.find(e => e.executionId === executionId);
  if (!target) {
    throw new PlatformSessionDomainError(
      'EXECUTION_NOT_FOUND',
      `Methodology execution not found: ${executionId}`,
    );
  }

  const sessionId = target.sessionId;
  const next = executions.map(e => {
    if (e.executionId === executionId) {
      return { ...e, status: 'active' as const };
    }
    if (e.sessionId === sessionId && e.status === 'active') {
      return { ...e, status: 'paused' as const };
    }
    return e;
  });

  assertAtMostOneActiveExecution(next, sessionId);
  return next;
}
