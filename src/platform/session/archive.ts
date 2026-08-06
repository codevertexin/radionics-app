/**
 * Canonical session archive envelope (F1) — contracts only.
 * Distinguishes in-assembly archives from sealed immutable archives.
 * Archive is independent of report templates. No persistence.
 */

import type {
  ArchiveSealingMetadata,
  ClientTestimonySnapshot,
  ReportTemplateRef,
  SealedCanonicalSessionArchive,
  SessionArchiveAssembly,
  SessionArchiveBase,
} from '@/platform/session/types';
import { PlatformSessionDomainError } from '@/platform/session/types';
import { immutableClone } from '@/platform/session/immutability';

const ARCHIVE_SCHEMA_VERSION = 'platform.session.archive.v1';

type AssemblyInput = Omit<
  SessionArchiveBase,
  'schemaVersion' | 'reportTemplateAuthority'
>;

/** Create a mutable-in-concept archive still in assembly (not sealed). */
export function createSessionArchiveAssembly(
  input: AssemblyInput,
): SessionArchiveAssembly {
  return {
    ...deepCloneArchiveFields(input),
    schemaVersion: ARCHIVE_SCHEMA_VERSION,
    reportTemplateAuthority: null,
    assemblyStatus: 'in_assembly',
  };
}

/** @deprecated Prefer createSessionArchiveAssembly */
export function createCanonicalSessionArchive(
  input: AssemblyInput,
): SessionArchiveAssembly {
  return createSessionArchiveAssembly(input);
}

function deepCloneArchiveFields(input: AssemblyInput): AssemblyInput {
  return structuredClone(input);
}

/**
 * Changing a report template must not change the archive.
 * Returns a new archive object identical in facts; template ref is ignored.
 */
export function assertArchiveIndependentOfReportTemplate<
  T extends SessionArchiveAssembly | SealedCanonicalSessionArchive,
>(archive: T, _template: ReportTemplateRef): T {
  if (archive.reportTemplateAuthority !== null) {
    throw new PlatformSessionDomainError(
      'ARCHIVE_BOUND_TO_REPORT_TEMPLATE',
      'Canonical archive must not treat a report template as data authority',
    );
  }
  return {
    ...archive,
    reportTemplateAuthority: null,
  };
}

/**
 * Seal a completed-session archive.
 * Requires testimony snapshot + sealing metadata. Result is domain-immutable.
 */
export function sealCompletedSessionArchive(
  assembly: SessionArchiveAssembly,
  input: {
    sealing: ArchiveSealingMetadata;
    testimonySnapshot: ClientTestimonySnapshot;
  },
): Readonly<SealedCanonicalSessionArchive> {
  if (assembly.assemblyStatus !== 'in_assembly') {
    throw new PlatformSessionDomainError(
      'ARCHIVE_NOT_IN_ASSEMBLY',
      'Only an in-assembly archive can be sealed',
    );
  }
  if (assembly.platformFacts.lifecycleStatus !== 'completed') {
    throw new PlatformSessionDomainError(
      'ARCHIVE_SEAL_REQUIRES_COMPLETED_SESSION',
      'Sealing a completed-session archive requires lifecycleStatus completed',
    );
  }
  if (!input.testimonySnapshot) {
    throw new PlatformSessionDomainError(
      'ARCHIVE_SEAL_REQUIRES_TESTIMONY',
      'Sealed archive for a completed session requires testimony snapshot',
    );
  }
  if (input.testimonySnapshot.sessionId !== assembly.sessionId) {
    throw new PlatformSessionDomainError(
      'ARCHIVE_TESTIMONY_SESSION_MISMATCH',
      'Testimony snapshot sessionId must match archive sessionId',
    );
  }

  const sealed: SealedCanonicalSessionArchive = {
    ...structuredClone(assembly),
    assemblyStatus: 'sealed',
    testimonySnapshot: structuredClone(input.testimonySnapshot),
    sealing: { ...input.sealing },
    reportTemplateAuthority: null,
  };

  return immutableClone(sealed);
}

/**
 * Attach sealing metadata during assembly without producing a sealed archive.
 * Prefer sealCompletedSessionArchive for completed sessions.
 */
export function attachAssemblySealingDraft(
  assembly: SessionArchiveAssembly,
  sealing: ArchiveSealingMetadata,
): SessionArchiveAssembly {
  return {
    ...assembly,
    sealing: { ...sealing },
  };
}

/** @deprecated Use sealCompletedSessionArchive for completed sessions. */
export function sealArchiveMetadata(
  assembly: SessionArchiveAssembly,
  sealing: ArchiveSealingMetadata,
): SessionArchiveAssembly {
  return attachAssemblySealingDraft(assembly, sealing);
}

export function isSealedCanonicalArchive(
  archive: SessionArchiveAssembly | SealedCanonicalSessionArchive,
): archive is SealedCanonicalSessionArchive {
  return archive.assemblyStatus === 'sealed';
}

export function assertSealedArchiveImmutable(
  archive: Readonly<SealedCanonicalSessionArchive>,
): void {
  if (!Object.isFrozen(archive)) {
    throw new PlatformSessionDomainError(
      'SEALED_ARCHIVE_NOT_FROZEN',
      'Sealed canonical archive must be frozen in the domain',
    );
  }
  if (!archive.sealing) {
    throw new PlatformSessionDomainError(
      'SEALED_ARCHIVE_MISSING_SEALING',
      'Sealed archive requires sealing metadata',
    );
  }
  if (
    archive.platformFacts.lifecycleStatus === 'completed'
    && !archive.testimonySnapshot
  ) {
    throw new PlatformSessionDomainError(
      'SEALED_ARCHIVE_MISSING_TESTIMONY',
      'Sealed archive for completed session requires testimony snapshot',
    );
  }
}
