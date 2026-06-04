import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import { filterAssetsBySearch } from '@/lib/resources/resourceSearch';
import { getSpecialtyAssets } from '@/services/resourceLibraryService';
import { ResourceSearchBox } from '@/components/resources/ResourceSearchBox';
import { cn } from '@/lib/utils';

const ASSET_TYPE_LABELS: Record<string, string> = {
  graph: 'Gráfico',
  angel: 'Anjo',
  archangel: 'Arcanjo',
  chakra: 'Chakra',
  hawkins_level: 'Hawkins',
};

export default function ResourceAssetsPage() {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();
  const [query, setQuery] = useState('');

  const { data: assets, isLoading } = useQuery({
    queryKey: ['resource-assets', specialtySlug, getDataMode()],
    queryFn: () => getSpecialtyAssets(specialtySlug!),
    enabled: Boolean(specialtySlug),
  });

  const filtered = useMemo(() => {
    if (!assets) return [];
    if (!query.trim()) return assets;
    const ids = new Set(filterAssetsBySearch(query, assets).map(r => r.asset.id));
    return assets.filter(a => ids.has(a.id));
  }, [assets, query]);

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center text-[var(--color-text-muted)]">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ResourceSearchBox value={query} onChange={setQuery} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(asset => (
          <Link
            key={asset.id}
            to={`/resources/${specialtySlug}/assets/${asset.slug}`}
            className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden hover:border-[var(--color-border-strong)] transition-all"
          >
            <div className="aspect-square bg-[var(--color-surface-1)] overflow-hidden">
              {asset.imageUrlResolved ? (
                <img
                  src={asset.imageUrlResolved}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs">
                  Sem imagem
                </div>
              )}
            </div>
            <div className="p-4 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm text-[var(--color-text-primary)] leading-tight">
                  {asset.name}
                </h3>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded border shrink-0',
                  'text-[var(--color-text-muted)] border-[var(--color-border)]',
                )}>
                  {ASSET_TYPE_LABELS[asset.assetType] ?? asset.assetType}
                </span>
              </div>
              {asset.originalName && (
                <p className="text-xs text-[var(--color-gold)]">{asset.originalName}</p>
              )}
              {asset.aliases.length > 0 && (
                <p className="text-[10px] text-[var(--color-text-muted)] line-clamp-2">
                  {asset.aliases.join(' · ')}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-12">
          Nenhum asset encontrado para &quot;{query}&quot;.
        </p>
      )}
    </div>
  );
}
