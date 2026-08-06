/**
 * Session Plan — intended methodologies before start (F1).
 * Distinct from workflow templates, report templates, and actual executions.
 */

import type {
  MethodologyExecutionRecord,
  SessionPlan,
  SessionPlanItem,
} from '@/platform/session/types';

const SESSION_PLAN_SCHEMA_VERSION = 'platform.session.plan.v1';

export function createSessionPlan(
  sessionId: string,
  items: SessionPlanItem[],
): SessionPlan {
  return {
    sessionId,
    items: items.map(i => ({ ...i })),
    schemaVersion: SESSION_PLAN_SCHEMA_VERSION,
  };
}

/** Planned methodology IDs are independent from invoked execution methodology IDs. */
export function listPlannedMethodologyIds(plan: SessionPlan): string[] {
  return plan.items.map(i => i.methodologyId);
}

export function listInvokedMethodologyIds(
  executions: MethodologyExecutionRecord[],
): string[] {
  return executions.map(e => e.methodology.methodologyId);
}

export function findUnplannedInvocations(
  plan: SessionPlan,
  executions: MethodologyExecutionRecord[],
): MethodologyExecutionRecord[] {
  const planned = new Set(listPlannedMethodologyIds(plan));
  return executions.filter(e => !planned.has(e.methodology.methodologyId));
}
