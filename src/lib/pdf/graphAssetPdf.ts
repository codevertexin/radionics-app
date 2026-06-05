import { GraphPdfExportError } from '@/lib/pdf/graphPdfErrors';
import { exportRasterTherapeuticPdf } from '@/lib/pdf/graphPrintRaster';
import { exportSvgTherapeuticPdf } from '@/lib/pdf/graphPrintSvg';
import type { GraphPdfExportResult, GraphPrintSpec } from '@/lib/pdf/graphPrintTypes';

export { GraphPdfExportError } from '@/lib/pdf/graphPdfErrors';
export type { GraphPdfExportResult } from '@/lib/pdf/graphPrintTypes';

/**
 * Therapeutic PDF export — works for graphs, symbols, chakras, MAP assets, etc.
 * Dispatches to vector (SVG) or raster (PNG/JPG) pipeline.
 */
export async function exportTherapeuticAssetPdf(
  spec: GraphPrintSpec,
): Promise<GraphPdfExportResult> {
  if (spec.printAssetType === 'svg') {
    return exportSvgTherapeuticPdf(spec);
  }
  return exportRasterTherapeuticPdf(spec);
}

/** @alias exportTherapeuticAssetPdf */
export const exportGraphAssetPdf = exportTherapeuticAssetPdf;
