/**
 * Methodology workspace — declarative capability + operational host contract (F1).
 * Framework-neutral: no React, no methodology imports.
 */

import type {
  MethodologyIdentity,
  MethodologyWorkspaceCapability,
  MethodologyWorkspaceHostContract,
  MethodologyExecutionStateEnvelope,
  MethodologyNavigationItem,
  MethodologyWorkspaceContentDescriptor,
  MethodologyExecutionProgress,
  MethodologyCompletionAwareness,
  MethodologyTimelineEmissionInput,
  MethodologyReportContributionEmissionInput,
} from '@/platform/session/types';
import { cloneExecutionState } from '@/platform/session/methodologyExecution';

export function createMinimalMethodologyCapability(input: {
  identity: MethodologyIdentity;
  state: MethodologyExecutionStateEnvelope;
  hasWorkspaceContent?: boolean;
}): MethodologyWorkspaceCapability {
  return {
    identity: input.identity,
    hasWorkspaceContent: input.hasWorkspaceContent ?? true,
    state: input.state,
  };
}

export function methodologyOmitsOptionalCapabilities(
  capability: MethodologyWorkspaceCapability,
): boolean {
  return (
    capability.hasInternalNavigation !== true
    && capability.hasStages !== true
    && capability.hasProgress !== true
    && capability.hasCompletionAwareness !== true
    && capability.hasVisualResources !== true
    && capability.emitsTimelineEvents !== true
    && capability.emitsReportContributions !== true
    && capability.hasComplementaryRelationships !== true
  );
}

export interface CreateMethodologyWorkspaceHostContractInput {
  identity: MethodologyIdentity;
  state: MethodologyExecutionStateEnvelope;
  describeWorkspaceContent?: () => MethodologyWorkspaceContentDescriptor;
  getNavigation?: () => MethodologyNavigationItem[];
  getProgress?: () => MethodologyExecutionProgress;
  getCompletionAwareness?: () => MethodologyCompletionAwareness;
  emitTimelineEvent?: (input: MethodologyTimelineEmissionInput) => void;
  emitReportContribution?: (
    input: MethodologyReportContributionEmissionInput,
  ) => void;
}

/**
 * Builds an operational host↔methodology contract.
 * Required surface: identity, isolated state, serializeState.
 */
export function createMethodologyWorkspaceHostContract(
  input: CreateMethodologyWorkspaceHostContractInput,
): MethodologyWorkspaceHostContract {
  const state = cloneExecutionState(input.state);

  const contract: MethodologyWorkspaceHostContract = {
    identity: { ...input.identity },
    getIsolatedState: () => cloneExecutionState(state),
    serializeState: () => structuredClone(state.payload),
  };

  if (input.describeWorkspaceContent) {
    contract.describeWorkspaceContent = input.describeWorkspaceContent;
  }
  if (input.getNavigation) contract.getNavigation = input.getNavigation;
  if (input.getProgress) contract.getProgress = input.getProgress;
  if (input.getCompletionAwareness) {
    contract.getCompletionAwareness = input.getCompletionAwareness;
  }
  if (input.emitTimelineEvent) contract.emitTimelineEvent = input.emitTimelineEvent;
  if (input.emitReportContribution) {
    contract.emitReportContribution = input.emitReportContribution;
  }

  return contract;
}

export function hostContractOmitsOptionalCapabilities(
  contract: MethodologyWorkspaceHostContract,
): boolean {
  return (
    contract.getNavigation === undefined
    && contract.getProgress === undefined
    && contract.getCompletionAwareness === undefined
    && contract.emitTimelineEvent === undefined
    && contract.emitReportContribution === undefined
  );
}

/** Derive declarative capability flags from an operational host contract. */
export function capabilityFromHostContract(
  contract: MethodologyWorkspaceHostContract,
): MethodologyWorkspaceCapability {
  const content = contract.describeWorkspaceContent?.();
  return {
    identity: contract.identity,
    hasWorkspaceContent: content?.contentKind !== 'none',
    state: contract.getIsolatedState(),
    hasInternalNavigation: contract.getNavigation !== undefined,
    hasProgress: contract.getProgress !== undefined,
    hasCompletionAwareness: contract.getCompletionAwareness !== undefined,
    emitsTimelineEvents: contract.emitTimelineEvent !== undefined,
    emitsReportContributions: contract.emitReportContribution !== undefined,
  };
}
