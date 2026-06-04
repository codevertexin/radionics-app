import { Link } from 'react-router-dom';
import { ExternalLink, FileDown, Loader2 } from 'lucide-react';
import { useGraphAssetPdfExport } from '@/hooks/useGraphAssetPdfExport';
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
  const { exportGraphPdf, isExporting, error, warnings, clearWarnings } =
    useGraphAssetPdfExport();
  const previewTo = `/resources/${specialtySlug}/assets/${assetSlug}/print`;

  const handleExport = async () => {
    clearWarnings();
    try {
      await exportGraphPdf({ asset, specialtySlug, assetSlug });
    } catch {
      /* error state on hook */
    }
  };

  const exportControl =
    variant === 'inline' ? (
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px] text-[var(--color-gold)] hover:underline disabled:opacity-50',
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
        disabled={isExporting}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-border)]',
          'text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]',
          'hover:border-[var(--color-gold)]/40 transition-colors disabled:opacity-50',
          className,
        )}
      >
        {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
        {isExporting ? 'A gerar PDF…' : 'Exportar PDF'}
      </button>
    );

  return (
    <div className={cn('flex flex-col gap-1', variant === 'inline' && 'inline-flex')}>
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
      {error ? (
        <p className="text-[10px] text-red-600/90 max-w-md" role="alert">
          {error}
        </p>
      ) : null}
      {warnings.length > 0 ? (
        <ul className="text-[10px] text-amber-800/90 max-w-md space-y-0.5 list-disc list-inside" role="status">
          {warnings.map(w => (
            <li key={w.code}>{w.message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
