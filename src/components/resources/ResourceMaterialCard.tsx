import type { ComponentType } from 'react';
import {
  ExternalLink,
  FileText,
  Headphones,
  ImageIcon,
  Link2,
  Package,
  Play,
  Video,
} from 'lucide-react';
import type { LibraryMaterial, LibraryMaterialType } from '@/types/materials-library';
import {
  formatDuration,
  formatFileSize,
  formatMaterialSourceLabel,
  getMaterialActionLabel,
  getMaterialOpenUrl,
  truncateDescription,
} from '@/lib/materials/materialDisplay';
import { cn } from '@/lib/utils';

const TYPE_FALLBACK_ICONS: Record<
  LibraryMaterialType,
  ComponentType<{ size?: number; className?: string }>
> = {
  pdf: FileText,
  image: ImageIcon,
  video: Video,
  audio: Headphones,
  link: Link2,
  document: FileText,
  other: Package,
};

export interface ResourceMaterialCardProps {
  material: LibraryMaterial;
  specialtySlug: string;
  /** Reserved V2.8+ — favorites */
  showFavoriteAction?: boolean;
  /** Reserved V2.8+ — download button */
  showDownloadAction?: boolean;
  /** Reserved V2.8+ — progress indicator */
  showProgress?: boolean;
  className?: string;
}

export function ResourceMaterialCard({
  material,
  specialtySlug,
  showFavoriteAction = false,
  showDownloadAction = false,
  showProgress = false,
  className,
}: ResourceMaterialCardProps) {
  const openUrl = getMaterialOpenUrl(material);
  const actionLabel = getMaterialActionLabel(material);
  const sourceLabel = formatMaterialSourceLabel(material);
  const description = truncateDescription(material.description);
  const duration = formatDuration(material.durationSeconds);
  const fileSize = formatFileSize(material.fileSizeBytes);
  const FallbackIcon = TYPE_FALLBACK_ICONS[material.materialType];
  const canOpen = Boolean(openUrl);

  void specialtySlug;
  void showFavoriteAction;
  void showDownloadAction;
  void showProgress;

  return (
    <article
      className={cn(
        'flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden',
        className,
      )}
      data-material-id={material.id}
      data-material-slug={material.slug}
      data-material-type={material.materialType}
    >
      <div className="aspect-[4/3] bg-[var(--color-surface-1)] overflow-hidden flex items-center justify-center relative">
        {material.thumbnailUrl ? (
          <img
            src={material.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-[var(--color-text-muted)]">
            <FallbackIcon size={32} className="opacity-40" />
            <span className="text-[10px] uppercase tracking-wide opacity-60">
              {material.materialType}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-medium text-sm text-[var(--color-text-primary)] leading-snug">
          {material.title}
        </h3>

        {description && (
          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}

        {sourceLabel && (
          <p className="text-[11px] text-[var(--color-gold)]">{sourceLabel}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
          <span className="px-2 py-0.5 rounded-full border border-[var(--color-border)]">
            {material.language}
          </span>
          <span className="px-2 py-0.5 rounded-full border border-[var(--color-border)]">
            {material.contentVersion}
          </span>
          {duration && (
            <span className="px-2 py-0.5 rounded-full border border-[var(--color-border)]">
              {duration}
            </span>
          )}
          {fileSize && (
            <span className="px-2 py-0.5 rounded-full border border-[var(--color-border)]">
              {fileSize}
            </span>
          )}
        </div>

        <div className="mt-auto pt-2">
          {canOpen ? (
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                'border border-[var(--color-border)] text-[var(--color-text-secondary)]',
                'hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/40 transition-colors',
              )}
            >
              {material.materialType === 'link' ? (
                <ExternalLink size={13} />
              ) : material.materialType === 'video' ? (
                <Play size={13} />
              ) : (
                <ExternalLink size={13} />
              )}
              {actionLabel}
            </a>
          ) : (
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]"
              title="Ficheiro ainda não disponível"
            >
              {actionLabel} — em breve
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
