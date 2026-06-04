export class GraphPdfExportError extends Error {
  constructor(
    message: string,
    readonly code: 'NO_IMAGE' | 'FETCH_FAILED' | 'UNSUPPORTED_FORMAT' | 'RENDER_FAILED',
  ) {
    super(message);
    this.name = 'GraphPdfExportError';
  }
}
