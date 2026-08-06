/**
 * Client identity + testimony snapshot contracts (F1).
 * Does not reinterpret legacy Client.name as both display and full name.
 */

import type { ClientIdentityProfile, ClientTestimonySnapshot } from '@/platform/session/types';
import { PlatformSessionDomainError } from '@/platform/session/types';

const TESTIMONY_SCHEMA_VERSION = 'platform.session.testimony.v1';

export function assertRequiredIdentityFields(
  identity: ClientIdentityProfile,
): void {
  const required: (keyof ClientIdentityProfile)[] = [
    'displayName',
    'fullName',
    'dateOfBirth',
    'address',
    'locality',
    'country',
  ];
  for (const field of required) {
    const value = identity[field];
    if (typeof value !== 'string' || !value.trim()) {
      throw new PlatformSessionDomainError(
        'IDENTITY_FIELD_REQUIRED',
        `${field} is required for testimony-ready identity`,
      );
    }
  }
}

export function isOptionalContactField(
  field: keyof ClientIdentityProfile,
): boolean {
  return field === 'phone' || field === 'whatsapp' || field === 'email';
}

export function createTestimonySnapshot(input: {
  snapshotId: string;
  sessionId: string;
  clientId: string;
  capturedAt: string;
  identity: ClientIdentityProfile;
}): ClientTestimonySnapshot {
  assertRequiredIdentityFields(input.identity);
  return {
    snapshotId: input.snapshotId,
    sessionId: input.sessionId,
    clientId: input.clientId,
    capturedAt: input.capturedAt,
    identity: { ...input.identity },
    schemaVersion: TESTIMONY_SCHEMA_VERSION,
  };
}

/**
 * Later profile edits must not mutate a sealed testimony snapshot.
 * Returns a new profile object; snapshot remains unchanged.
 */
export function applyProfileEditWithoutMutatingTestimony(
  snapshot: ClientTestimonySnapshot,
  nextProfile: ClientIdentityProfile,
): { snapshot: ClientTestimonySnapshot; profile: ClientIdentityProfile } {
  return {
    snapshot: {
      ...snapshot,
      identity: { ...snapshot.identity },
    },
    profile: { ...nextProfile },
  };
}
