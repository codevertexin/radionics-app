import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import { getSpecialtyProtocols } from '@/services/resourceLibraryService';

export default function ResourceProtocolsPage() {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();

  const { data: protocols, isLoading } = useQuery({
    queryKey: ['resource-protocols', specialtySlug, getDataMode()],
    queryFn: () => getSpecialtyProtocols(specialtySlug!),
    enabled: Boolean(specialtySlug),
  });

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center text-[var(--color-text-muted)]">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!protocols?.length) {
    return (
      <div className="p-6 text-sm text-[var(--color-text-muted)] text-center py-12">
        Nenhum protocolo disponível para esta especialidade.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      {protocols.map(protocol => (
        <Link
          key={protocol.id}
          to={`/resources/${specialtySlug}/protocols/${protocol.slug}`}
          className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5 hover:border-[var(--color-border-strong)] transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-violet-300">{protocol.code}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-[var(--color-text-primary)]">{protocol.name}</h3>
            {protocol.description && (
              <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mt-1">{protocol.description}</p>
            )}
          </div>
          <ChevronRight
            size={16}
            className="text-[var(--color-text-muted)] group-hover:text-[var(--color-gold)] shrink-0"
          />
        </Link>
      ))}
    </div>
  );
}
