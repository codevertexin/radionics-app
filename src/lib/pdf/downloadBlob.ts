import type { TherapeuticPrintSizeCm } from '@/lib/pdf/graphPrintConstants';

/** Trigger a file download in the browser. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Safe PDF filename from asset slug and physical size. */
export function buildGraphPdfFilename(
  base: string,
  sizeCm: TherapeuticPrintSizeCm,
): string {
  const sanitized = base
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${sanitized || 'grafico'}-${sizeCm}cm.pdf`;
}
