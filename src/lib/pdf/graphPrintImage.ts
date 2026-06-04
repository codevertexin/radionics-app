import { GraphPdfExportError } from '@/lib/pdf/graphPdfErrors';

export type PrintImageFormat = 'png' | 'jpg';

export interface LoadedPrintImage {
  bytes: Uint8Array;
  widthPx: number;
  heightPx: number;
  format: PrintImageFormat;
}

export function detectImageFormat(bytes: Uint8Array): PrintImageFormat | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'png';
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpg';
  }
  return null;
}

async function fetchImageBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
  if (!response.ok) {
    throw new GraphPdfExportError(
      'Não foi possível carregar a imagem do gráfico (rede ou permissões).',
      'FETCH_FAILED',
    );
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function readImageDimensionsFromBytes(bytes: Uint8Array): Promise<{
  widthPx: number;
  heightPx: number;
}> {
  const blob = new Blob([bytes]);
  const bitmap = await createImageBitmap(blob);
  const { width, height } = bitmap;
  bitmap.close();
  return { widthPx: width, heightPx: height };
}

/** Fetches print image bytes and reads intrinsic pixel dimensions (no upscale). */
export async function loadPrintImage(url: string): Promise<LoadedPrintImage> {
  const bytes = await fetchImageBytes(url);
  const format = detectImageFormat(bytes);
  if (!format) {
    throw new GraphPdfExportError(
      'Formato de imagem não suportado para PDF (use PNG ou JPEG).',
      'UNSUPPORTED_FORMAT',
    );
  }

  const { widthPx, heightPx } = await readImageDimensionsFromBytes(bytes);
  return { bytes, widthPx, heightPx, format };
}
