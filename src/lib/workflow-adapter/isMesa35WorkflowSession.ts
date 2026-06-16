import type { Session } from '@/types';
import type { SessionLike } from '@/lib/workflow-adapter/types';

/** Guard: apenas sessões workflow Mesa 35 (V3.0D.4). */
export function isMesa35WorkflowSession(
  session: Session | SessionLike | null | undefined,
): boolean {
  if (!session) return false;
  return session.executionMode === 'workflow' && session.specialtySlug === 'mesa-35';
}
