import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ExternalLink, FileDown, Loader2 } from 'lucide-react';
import { TherapeuticPrintSizeSelector } from '@/components/resources/TherapeuticPrintSizeSelector';
import { getDataMode } from '@/lib/dataMode';
import {
  DEFAULT_THERAPEUTIC_PRINT_SIZE_CM,
  getAvailablePrintSizesCm,
  normalizePrintMaxSizeCm,
  type TherapeuticPrintSizeCm,
} from '@/lib/pdf/graphPrintConstants';
import {
  PRINT_LAYOUT_UNAVAILABLE_MESSAGE,
  isAppProduction,
} from '@/lib/pdf/graphPrintEnvironment';
import {
  hasPrintImageUrl,
  parseGraphAssetPrintMetadata,
} from '@/lib/pdf/graphPrintTypes';
import { useGraphAssetPdfExport } from '@/hooks/useGraphAssetPdfExport';
import { getAssetResourceDetail } from '@/services/resourceLibraryService';
import { cn } from '@/lib/utils';
import type { ResourceAssetView } from '@/types';

interface ResourceGraphPdfButtonProps {
  specialtySlug: string;
  assetSlug: string;
  asset?: ResourceAssetView | null;
  className?: string;
  variant?: 'inline' | 'button';
  showPreviewLink?: boolean;
}

export function ResourceGraphPdfButton({
  specialtySlug,
  assetSlug,
  asset,
  className,
  variant = 'button',
  showPreviewLink = false,
}: ResourceGraphPdfButtonProps) {
  const { data: fetchedAsset } = useQuery({
    queryKey: ['resource-asset-print-availability', specialtySlug, assetSlug, getDataMode()],
    queryFn: () => getAssetResourceDetail(specialtySlug, assetSlug),
    enabled: !asset && Boolean(specialtySlug && assetSlug),
    staleTime: 60_000,
  });

  const resolvedAsset = asset ?? fetchedAsset ?? null;

  const meta = useMemo(
    () => parseGraphAssetPrintMetadata(resolvedAsset?.metadata),
    [resolvedAsset?.metadata],
  );
  const printMaxSizeCm = normalizePrintMaxSizeCm(meta.print_max_size_cm);
  const availableSizes = useMemo(
    () => getAvailablePrintSizesCm(printMaxSizeCm),
    [printMaxSizeCm],
  );

  const [printSizeCm, setPrintSizeCm] = useState<TherapeuticPrintSizeCm>(
    DEFAULT_THERAPEUTIC_PRINT_SIZE_CM,
  );

  const effectiveSize = availableSizes.includes(printSizeCm)
    ? printSizeCm
    : availableSizes[0] ?? DEFAULT_THERAPEUTIC_PRINT_SIZE_CM;

  const { exportGraphPdf, isExporting, error, warnings, clearWarnings } =
    useGraphAssetPdfExport();
  const previewTo = `/resources/${specialtySlug}/assets/${assetSlug}/print`;

  const hasPrintLayout = hasPrintImageUrl(meta);
  const printUnavailableInProduction = isAppProduction() && !hasPrintLayout;
  const isDevPreviewFallback = !isAppProduction() && !hasPrintLayout;

  const handleExport = async () => {
    if (printUnavailableInProduction) return;
    clearWarnings();
    try {
      await exportGraphPdf({
        asset: resolvedAsset,
        specialtySlug,
        assetSlug,
        printSizeCm: effectiveSize,
      });
    } catch {
      /* error state on hook */
    }
  };

  const exportControl =
    variant === 'inline' ? (
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting || printUnavailableInProduction}
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px] text-[var(--color-gold)] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed',
          className,
        )}
      >
        {isExporting ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />}
        {isExporting ? 'A gerar…' : 'Exportar PDF'}
      </button>
    ) : (
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting || printUnavailableInProduction}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-border)]',
          'text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]',
          'hover:border-[var(--color-gold)]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center',
          className,
        )}
      >
        {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
        {isExporting ? 'A gerar PDF…' : 'Exportar PDF'}
      </button>
    );

  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        variant === 'inline' && 'inline-flex flex-wrap items-end gap-x-3',
      )}
    >
      <TherapeuticPrintSizeSelector
        availableSizes={availableSizes}
        value={effectiveSize}
        onChange={setPrintSizeCm}
        compact={variant === 'inline'}
        disabled={printUnavailableInProduction}
      />

      {isDevPreviewFallback && variant === 'button' ? (
        <p className="text-[10px] text-amber-700/90">
          [DEV] Sem layout de impressão — exportação usa imagem de visualização.
        </p>
      ) : null}

      <div className={cn('flex flex-wrap items-center gap-3', variant === 'inline' && 'inline-flex')}>
        {exportControl}
        {showPreviewLink && (
          <Link
            to={previewTo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-gold)]"
          >
            <ExternalLink size={10} />
            Pré-visualizar
          </Link>
        )}
      </div>

      {printUnavailableInProduction ? (
        <p className="text-[10px] text-[var(--color-text-muted)] max-w-md" role="status">
          {PRINT_LAYOUT_UNAVAILABLE_MESSAGE}
        </p>
      ) : null}

      {error && !printUnavailableInProduction ? (
        <p className="text-[10px] text-red-600/90 max-w-md" role="alert">
          {error}
        </p>
      ) : null}

      {!isAppProduction() && warnings.length > 0 ? (
        <ul
          className="text-[10px] text-amber-800/90 max-w-md space-y-0.5 list-disc list-inside"
          role="status"
        >
          {warnings.map(w => (
            <li key={w.code}>{w.message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
