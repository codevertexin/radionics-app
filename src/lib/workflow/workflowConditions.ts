import type {
  WorkflowCondition,
  WorkflowConditionEvaluation,
  WorkflowSessionContext,
} from '@/types/workflow-engine';

function normalizeAssetType(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Evaluates simple v1 workflow conditions (no rule engine).
 * Unknown keys are ignored; empty condition is satisfied.
 */
export function evaluateWorkflowCondition(
  condition: WorkflowCondition | undefined,
  sessionContext?: WorkflowSessionContext,
): WorkflowConditionEvaluation {
  if (!condition || Object.keys(condition).length === 0) {
    return {
      condition: condition ?? {},
      satisfied: true,
      reason: 'no_condition',
    };
  }

  const ctx = sessionContext ?? {};

  if (condition.requires_protocol_selected === true) {
    const satisfied = Boolean(ctx.selectedProtocolId);
    return {
      condition,
      satisfied,
      reason: satisfied ? 'protocol_selected' : 'protocol_not_selected',
    };
  }

  if (condition.requires_asset_type) {
    const required = normalizeAssetType(condition.requires_asset_type);
    const types = (ctx.selectedProtocolAssetTypes ?? []).map(normalizeAssetType);
    const satisfied = types.includes(required);
    return {
      condition,
      satisfied,
      reason: satisfied
        ? `asset_type_${required}_present`
        : `asset_type_${required}_missing`,
    };
  }

  return {
    condition,
    satisfied: true,
    reason: 'unknown_condition_keys_ignored',
  };
}
