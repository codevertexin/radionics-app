import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { truncatePreview } from '@/lib/resources/resourceGrouping';
import type { ResourceAssetView } from '@/types';
import { cn } from '@/lib/utils';

const isGraphAsset = (asset: ResourceAssetView) => asset.assetType === 'graph';

interface ResourceAssetCardProps {
  asset: ResourceAssetView;
  specialtySlug: string;
}

export function ResourceAssetCard({ asset, specialtySlug }: ResourceAssetCardProps) {
  const activationPreview = asset.content?.activationText;

  return (
    <Link
      to={`/resources/${specialtySlug}/assets/${asset.slug}`}
      className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden hover:border-[var(--color-border-strong)] transition-all"
    >
      <div
        className={cn(
          'overflow-hidden flex items-center justify-center',
          isGraphAsset(asset) ? 'aspect-square bg-[#f4f2ec]' : 'aspect-[4/3] bg-[var(--color-surface-1)]',
        )}
      >
        {asset.imageUrlResolved ? (
          <img
            src={asset.imageUrlResolved}
            alt={asset.name}
            className={cn(
              'w-full h-full transition-transform duration-500 group-hover:scale-105',
              isGraphAsset(asset) ? 'object-contain p-3' : 'object-cover',
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs">
            Sem imagem
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-medium text-sm text-[var(--color-text-primary)] leading-tight">
          {asset.name}
        </h3>
        {asset.originalName && (
          <p className="text-xs text-[var(--color-gold)]">{asset.originalName}</p>
        )}
        {(asset.aliases ?? []).length > 0 && (
          <p className="text-[10px] text-[var(--color-text-muted)] line-clamp-2">
            {(asset.aliases ?? []).join(' · ')}
          </p>
        )}
        {activationPreview && (
          <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 italic">
            {truncatePreview(activationPreview, 100)}
          </p>
        )}
        <span
          className={cn(
            'mt-auto inline-flex items-center gap-1 text-[11px] text-[var(--color-gold)]',
            'opacity-0 group-hover:opacity-100 transition-opacity',
          )}
        >
          Ver detalhe
          <ChevronRight size={12} />
        </span>
      </div>
    </Link>
  );
}
