export type GraphPrintWarningCode =
  | 'PREVIEW_IMAGE_FALLBACK'
  | 'LOW_PRINT_RESOLUTION';

export interface GraphPrintWarning {
  code: GraphPrintWarningCode;
  message: string;
}

export const PREVIEW_IMAGE_FALLBACK_MESSAGE =
  'Está a ser utilizada a imagem de pré-visualização. Recomenda-se um ficheiro preparado para impressão.';

export function previewImageFallbackWarning(): GraphPrintWarning {
  return {
    code: 'PREVIEW_IMAGE_FALLBACK',
    message: PREVIEW_IMAGE_FALLBACK_MESSAGE,
  };
}

export function lowPrintResolutionWarning(
  widthPx: number,
  heightPx: number,
  targetPx: number,
  sizeCm: number,
  dpi: number,
): GraphPrintWarning {
  return {
    code: 'LOW_PRINT_RESOLUTION',
    message:
      `A resolução da imagem (${widthPx}×${heightPx} px) está abaixo do recomendado para ${sizeCm} cm @ ${dpi} DPI (mín. ~${targetPx} px por lado). A impressão pode perder nitidez.`,
  };
}

export function mergeGraphPrintWarnings(
  ...groups: (GraphPrintWarning | GraphPrintWarning[] | undefined)[]
): GraphPrintWarning[] {
  const seen = new Set<GraphPrintWarningCode>();
  const out: GraphPrintWarning[] = [];

  for (const group of groups) {
    const list = Array.isArray(group) ? group : group ? [group] : [];
    for (const w of list) {
      if (seen.has(w.code)) continue;
      seen.add(w.code);
      out.push(w);
    }
  }

  return out;
}
