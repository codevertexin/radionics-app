/**
 * Centralized platform session lifecycle transitions (F1).
 * Fail-closed: unknown or forbidden transitions throw.
 */

import {
  PlatformSessionDomainError,
  type PlatformSessionLifecycleStatus,
} from '@/platform/session/types';

const ALLOWED: Record<
  PlatformSessionLifecycleStatus,
  readonly PlatformSessionLifecycleStatus[]
> = {
  draft: ['in_progress', 'cancelled'],
  in_progress: ['paused', 'closing', 'cancelled'],
  paused: ['in_progress', 'closing', 'cancelled'],
  closing: ['in_progress', 'completed'],
  completed: [],
  cancelled: [],
};

export const PLATFORM_SESSION_LIFECYCLE_STATUSES: readonly PlatformSessionLifecycleStatus[] = [
  'draft',
  'in_progress',
  'paused',
  'closing',
  'completed',
  'cancelled',
] as const;

/** Legacy session statuses that must not appear in platform lifecycle. */
export const LEGACY_ONLY_SESSION_STATUSES = ['reported'] as const;

export function isPlatformSessionLifecycleStatus(
  value: string,
): value is PlatformSessionLifecycleStatus {
  return (PLATFORM_SESSION_LIFECYCLE_STATUSES as readonly string[]).includes(value);
}

export function isTerminalLifecycleStatus(
  status: PlatformSessionLifecycleStatus,
): boolean {
  return status === 'completed' || status === 'cancelled';
}

export function canTransitionLifecycle(
  from: PlatformSessionLifecycleStatus,
  to: PlatformSessionLifecycleStatus,
): boolean {
  if (from === to) return false;
  return ALLOWED[from].includes(to);
}

export function assertLifecycleTransition(
  from: PlatformSessionLifecycleStatus,
  to: PlatformSessionLifecycleStatus,
): void {
  if (!canTransitionLifecycle(from, to)) {
    throw new PlatformSessionDomainError(
      'INVALID_LIFECYCLE_TRANSITION',
      `Forbidden lifecycle transition: ${from} → ${to}`,
    );
  }
}

/**
 * Apply a lifecycle transition. Returns the next status.
 * Does not mutate storage — pure domain command.
 */
export function transitionLifecycle(
  from: PlatformSessionLifecycleStatus,
  to: PlatformSessionLifecycleStatus,
): PlatformSessionLifecycleStatus {
  assertLifecycleTransition(from, to);
  return to;
}

export function listAllowedLifecycleTargets(
  from: PlatformSessionLifecycleStatus,
): readonly PlatformSessionLifecycleStatus[] {
  return ALLOWED[from];
}
