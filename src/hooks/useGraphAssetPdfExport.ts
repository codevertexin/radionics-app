import { useCallback, useState } from 'react';
import { exportTherapeuticAssetPdf, GraphPdfExportError } from '@/lib/pdf/graphAssetPdf';
import type { TherapeuticPrintSizeCm } from '@/lib/pdf/graphPrintConstants';
import { buildGraphPdfFilename, downloadBlob } from '@/lib/pdf/downloadBlob';
import {
  PRINT_LAYOUT_UNAVAILABLE_MESSAGE,
  isAppProduction,
} from '@/lib/pdf/graphPrintEnvironment';
import {
  buildGraphPrintSpec,
  hasPrintImageUrl,
  isTherapeuticPdfAssetType,
  parseGraphAssetPrintMetadata,
} from '@/lib/pdf/graphPrintTypes';
import { filterWarningsForTherapist, type GraphPrintWarning } from '@/lib/pdf/graphPrintWarnings';
import { getAssetResourceDetail } from '@/services/resourceLibraryService';
import type { ResourceAssetView } from '@/types';

export interface GraphAssetPdfExportParams {
  asset?: ResourceAssetView | null;
  specialtySlug?: string;
  assetSlug?: string;
  printSizeCm: TherapeuticPrintSizeCm;
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

      if (!asset || !isTherapeuticPdfAssetType(asset.assetType)) {
        throw new GraphPdfExportError(
          'Este tipo de asset não suporta exportação PDF terapêutica.',
          'RENDER_FAILED',
        );
      }

      const meta = parseGraphAssetPrintMetadata(asset.metadata);
      if (isAppProduction() && !hasPrintImageUrl(meta)) {
        throw new GraphPdfExportError(PRINT_LAYOUT_UNAVAILABLE_MESSAGE, 'NO_PRINT_LAYOUT');
      }

      const spec = buildGraphPrintSpec(asset, { printSizeCm: params.printSizeCm });
      if (!spec) {
        throw new GraphPdfExportError(
          isAppProduction()
            ? PRINT_LAYOUT_UNAVAILABLE_MESSAGE
            : 'Imagem do gráfico não disponível.',
          'NO_IMAGE',
        );
      }

      const { pdfBytes, warnings: exportWarnings } = await exportTherapeuticAssetPdf(spec);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, buildGraphPdfFilename(spec.filenameBase, spec.printSizeCm));

      const visibleWarnings = filterWarningsForTherapist(exportWarnings, isAppProduction());
      setWarnings(visibleWarnings);
      return { warnings: visibleWarnings };
    } catch (err) {
      if (err instanceof GraphPdfExportError && err.code === 'NO_PRINT_LAYOUT') {
        setError(PRINT_LAYOUT_UNAVAILABLE_MESSAGE);
        throw err;
      }
      const message =
        err instanceof GraphPdfExportError
          ? isAppProduction() && err.code !== 'NO_PRINT_LAYOUT'
            ? 'Não foi possível gerar o PDF. Tente novamente mais tarde.'
            : err.message
          : err instanceof Error
            ? isAppProduction()
              ? 'Não foi possível gerar o PDF. Tente novamente mais tarde.'
              : err.message
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
