import { useCallback, useState } from 'react';
import { exportGraphAssetPdf, GraphPdfExportError } from '@/lib/pdf/graphAssetPdf';
import { buildGraphPdfFilename, downloadBlob } from '@/lib/pdf/downloadBlob';
import { buildGraphPrintSpec } from '@/lib/pdf/graphPrintTypes';
import type { GraphPrintWarning } from '@/lib/pdf/graphPrintWarnings';
import { getAssetResourceDetail } from '@/services/resourceLibraryService';
import type { ResourceAssetView } from '@/types';

export interface GraphAssetPdfExportParams {
  asset?: ResourceAssetView | null;
  specialtySlug?: string;
  assetSlug?: string;
}

export function useGraphAssetPdfExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<GraphPrintWarning[]>([]);

  const exportGraphPdf = useCallback(async (params: GraphAssetPdfExportParams) => {
    setError(null);
    setWarnings([]);
    setIsExporting(true);

    try {
      let asset = params.asset ?? null;

      if (!asset && params.specialtySlug && params.assetSlug) {
        asset = await getAssetResourceDetail(params.specialtySlug, params.assetSlug);
      }

      if (!asset || asset.assetType !== 'graph') {
        throw new GraphPdfExportError(
          'Exportação PDF disponível apenas para gráficos radiônicos.',
          'RENDER_FAILED',
        );
      }

      const spec = buildGraphPrintSpec(asset);
      if (!spec) {
        throw new GraphPdfExportError('Imagem do gráfico não disponível.', 'NO_IMAGE');
      }

      const { pdfBytes, warnings: exportWarnings } = await exportGraphAssetPdf(spec);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, buildGraphPdfFilename(spec.filenameBase));
      setWarnings(exportWarnings);
      return { warnings: exportWarnings };
    } catch (err) {
      const message =
        err instanceof GraphPdfExportError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Erro ao exportar PDF.';
      setError(message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearWarnings = useCallback(() => setWarnings([]), []);

  return {
    exportGraphPdf,
    isExporting,
    error,
    warnings,
    clearError,
    clearWarnings,
  };
}
