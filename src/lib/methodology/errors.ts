export type MethodologyEngineErrorCode =
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'RLS'
  | 'CONFIG'
  | 'UNKNOWN';

export class MethodologyEngineError extends Error {
  readonly code: MethodologyEngineErrorCode;

  constructor(message: string, code: MethodologyEngineErrorCode = 'UNKNOWN') {
    super(message);
    this.name = 'MethodologyEngineError';
    this.code = code;
  }
}

export function isMethodologyEngineError(err: unknown): err is MethodologyEngineError {
  return err instanceof MethodologyEngineError;
}
