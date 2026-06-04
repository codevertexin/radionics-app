import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import { filterResourcesDisplayActivations } from '@/lib/resources/resourceFilters';
import {
  getSpecialtyActivationScripts,
  groupActivationsByTool,
} from '@/services/resourceLibraryService';
import { ResourceSearchBox } from '@/components/resources/ResourceSearchBox';
import { ResourceActivationCard } from '@/components/resources/ResourceActivationCard';
import { matchActivationSearch } from '@/lib/resources/resourceSearch';

export default function ResourceActivationsPage() {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();
  const [query, setQuery] = useState('');

  const { data: scripts, isLoading } = useQuery({
    queryKey: ['resource-activations', specialtySlug, getDataMode()],
    queryFn: () => getSpecialtyActivationScripts(specialtySlug!),
    enabled: Boolean(specialtySlug),
  });

  const filtered = useMemo(() => {
    const visible = filterResourcesDisplayActivations(scripts ?? []);
    const q = query.trim();
    if (!q) return visible;
    return visible.filter(s => matchActivationSearch(q, s));
  }, [scripts, query]);

  const groups = useMemo(() => groupActivationsByTool(filtered), [filtered]);

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center text-[var(--color-text-muted)]">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <ResourceSearchBox
        value={query}
        onChange={setQuery}
        placeholder="Pesquisar ativações por nome ou conteúdo…"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-12">
          {scripts?.length ? `Nenhuma ativação para "${query}".` : 'Nenhuma ativação disponível.'}
        </p>
      ) : (
        groups.map(group => (
          <section key={group.groupKey}>
            <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)] mb-4">
              {group.label}
              <span className="ml-2 text-xs font-normal text-[var(--color-text-muted)]">
                ({group.items.length})
              </span>
            </h2>
            <div className="space-y-4">
              {group.items.map(script => (
                <ResourceActivationCard
                  key={script.id}
                  script={script}
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
