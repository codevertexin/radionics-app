export class GraphPdfExportError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'NO_IMAGE'
      | 'NO_PRINT_LAYOUT'
      | 'FETCH_FAILED'
      | 'UNSUPPORTED_FORMAT'
      | 'RENDER_FAILED',
  ) {
    super(message);
    this.name = 'GraphPdfExportError';
  }
}
