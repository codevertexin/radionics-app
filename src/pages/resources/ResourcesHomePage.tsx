import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Layers, Loader2 } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import { getAvailableSpecialties, getSpecialtyResources } from '@/services/resourceLibraryService';
import { CertificationRequired } from '@/components/resources/CertificationRequired';

function SpecialtyResourceCard({ slug, name, description }: {
  slug: string;
  name: string;
  description?: string;
}) {
  const { data: summary } = useQuery({
    queryKey: ['resource-summary', slug, getDataMode()],
    queryFn: () => getSpecialtyResources(slug),
  });

  return (
    <Link
      to={`/resources/${slug}/assets`}
      className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5 hover:border-[var(--color-border-strong)] transition-all hover:shadow-xl hover:shadow-black/20"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <BookOpen size={18} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-cinzel text-base font-semibold text-[var(--color-text-primary)] mb-1">
            {name}
          </h3>
          {description && (
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">{description}</p>
          )}
          <div className="flex flex-wrap gap-3 text-[11px] text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1">
              <Layers size={11} />
              {summary ? `${summary.assetCount} assets` : '…'}
            </span>
            {summary && summary.protocolCount > 0 && (
              <span>{summary.protocolCount} protocolos</span>
            )}
            {summary && summary.activationCount > 0 && (
              <span>{summary.activationCount} ativações</span>
            )}
          </div>
        </div>
        <ChevronRight
          size={16}
          className="text-[var(--color-text-muted)] group-hover:text-[var(--color-gold)] transition-colors shrink-0 mt-1"
        />
      </div>
    </Link>
  );
}

export default function ResourcesHomePage() {
  const { data: specialties, isLoading, error } = useQuery({
    queryKey: ['resource-specialties', getDataMode()],
    queryFn: getAvailableSpecialties,
  });

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center text-[var(--color-text-muted)]">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <CertificationRequired />;
  }

  if (!specialties?.length) {
    return <CertificationRequired />;
  }

  return (
    <div className="min-h-full bg-[var(--color-void)]">
      <header className="px-6 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">
          Recursos
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Consulte a metodologia certificada — independente do workspace e das sessões.
        </p>
      </header>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {specialties.map(s => (
            <SpecialtyResourceCard
              key={s.id}
              slug={s.slug}
              name={s.name}
              description={s.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
