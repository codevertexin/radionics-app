import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import { matchActivationSearch } from '@/lib/resources/resourceSearch';
import { getSpecialtyActivationScripts } from '@/services/resourceLibraryService';
import { ResourceSearchBox } from '@/components/resources/ResourceSearchBox';

const TYPE_LABELS: Record<string, string> = {
  graph: 'Gráficos',
  angel: 'Anjos',
  archangel: 'Arcanjos',
  chakra: 'Chakras',
};

export default function ResourceActivationsPage() {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();
  const [query, setQuery] = useState('');

  const { data: scripts, isLoading } = useQuery({
    queryKey: ['resource-activations', specialtySlug, getDataMode()],
    queryFn: () => getSpecialtyActivationScripts(specialtySlug!),
    enabled: Boolean(specialtySlug),
  });

  const filtered = useMemo(() => {
    if (!scripts) return [];
    const q = query.trim();
    if (!q) return scripts;
    return scripts.filter(s => matchActivationSearch(q, s));
  }, [scripts, query]);

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const script of filtered) {
      const key = script.assetType ?? 'other';
      const list = groups.get(key) ?? [];
      list.push(script);
      groups.set(key, list);
    }
    return groups;
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center text-[var(--color-text-muted)]">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
        [...grouped.entries()].map(([type, items]) => (
          <section key={type}>
            <h2 className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-3">
              {TYPE_LABELS[type] ?? type}
            </h2>
            <div className="space-y-3">
              {items.map(script => (
                <article
                  key={script.id}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-medium text-sm text-[var(--color-text-primary)]">{script.name}</h3>
                    {script.assetName && (
                      <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">
                        {script.assetName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {script.content}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
