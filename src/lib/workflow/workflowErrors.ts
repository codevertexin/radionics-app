export type WorkflowEngineErrorCode =
  | 'WORKFLOW_NOT_AVAILABLE'
  | 'WORKFLOW_NOT_FOUND'
  | 'WORKFLOW_FORBIDDEN'
  | 'WORKFLOW_SCHEMA_MISSING'
  | 'CONFIG';

export class WorkflowEngineError extends Error {
  readonly code: WorkflowEngineErrorCode;

  constructor(message: string, code: WorkflowEngineErrorCode) {
    super(message);
    this.name = 'WorkflowEngineError';
    this.code = code;
  }
}

export function isWorkflowEngineError(err: unknown): err is WorkflowEngineError {
  return err instanceof WorkflowEngineError;
}

export function mapWorkflowSupabaseError(
  context: string,
  error: { message: string; code?: string },
): never {
  const msg = error.message.toLowerCase();

  if (
    error.code === '42P01'
    || (msg.includes('does not exist') && msg.includes('workflow_'))
  ) {
    throw new WorkflowEngineError(
      `[${context}] Schema Workflow Engine não encontrado. Aplique a migração V3.0B.`,
      'WORKFLOW_SCHEMA_MISSING',
    );
  }

  if (
    error.code === '42501'
    || msg.includes('row-level security')
    || msg.includes('permission denied')
  ) {
    throw new WorkflowEngineError(
      `[${context}] Sem permissão para ler este workflow.`,
      'WORKFLOW_FORBIDDEN',
    );
  }

  throw new WorkflowEngineError(
    `[${context}] ${error.message}`,
    'WORKFLOW_NOT_AVAILABLE',
  );
}
