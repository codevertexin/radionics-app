import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import { filterResourcesDisplayAssets } from '@/lib/resources/resourceFilters';
import { filterAssetsBySearch } from '@/lib/resources/resourceSearch';
import {
  getSpecialtyAssets,
  groupAssetsByTool,
} from '@/services/resourceLibraryService';
import { ResourceSearchBox } from '@/components/resources/ResourceSearchBox';
import { ResourceAssetCard } from '@/components/resources/ResourceAssetCard';
import { cn } from '@/lib/utils';

export default function ResourceAssetsPage() {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();
  const [query, setQuery] = useState('');
  const [activeToolFilter, setActiveToolFilter] = useState<string | null>(null);

  const { data: assets, isLoading, isError, error } = useQuery({
    queryKey: ['resource-assets', specialtySlug, getDataMode()],
    queryFn: () => getSpecialtyAssets(specialtySlug!),
    enabled: Boolean(specialtySlug),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const filtered = useMemo(() => {
    const visible = filterResourcesDisplayAssets(assets ?? []);
    if (!query.trim()) return visible;
    const ids = new Set(filterAssetsBySearch(query, visible).map(r => r.asset.id));
    return visible.filter(a => ids.has(a.id));
  }, [assets, query]);

  const groups = useMemo(() => groupAssetsByTool(filtered), [filtered]);

  const visibleGroups = useMemo(() => {
    if (!activeToolFilter) return groups;
    return groups.filter(g => g.toolSlug === activeToolFilter);
  }, [groups, activeToolFilter]);

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center text-[var(--color-text-muted)]">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">
        Não foi possível carregar os assets.
        {error instanceof Error && (
          <p className="mt-2 text-xs opacity-70">{error.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ResourceSearchBox value={query} onChange={setQuery} />

      {groups.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveToolFilter(null)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              activeToolFilter === null
                ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-amber-500/10'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            Todos
          </button>
          {groups.map(group => (
            <button
              key={group.toolSlug}
              type="button"
              onClick={() => setActiveToolFilter(group.toolSlug)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                activeToolFilter === group.toolSlug
                  ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-amber-500/10'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
              )}
            >
              {group.label}
              <span className="ml-1 opacity-60">({group.assets.length})</span>
            </button>
          ))}
        </div>
      )}

      {visibleGroups.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-12">
          {query.trim()
            ? `Nenhum asset encontrado para "${query}".`
            : 'Nenhum asset disponível.'}
        </p>
      ) : (
        visibleGroups.map(group => (
          <section key={group.toolSlug} className="space-y-4">
            <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">
              {group.label}
              <span className="ml-2 text-xs font-normal text-[var(--color-text-muted)]">
                ({group.assets.length})
              </span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.assets.map(asset => (
                <ResourceAssetCard
                  key={asset.id}
                  asset={asset}
                  specialtySlug={specialtySlug!}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
