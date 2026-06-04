import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import { getSpecialtyProtocolDetail } from '@/services/resourceLibraryService';

const ROLE_LABELS: Record<string, string> = {
  graph: 'Gráfico',
  angel: 'Anjo',
  archangel: 'Arcanjo',
  chakra: 'Chakra',
};

export default function ResourceProtocolDetailPage() {
  const { specialtySlug, protocolSlug } = useParams<{ specialtySlug: string; protocolSlug: string }>();

  const { data: protocol, isLoading } = useQuery({
    queryKey: ['resource-protocol-detail', specialtySlug, protocolSlug, getDataMode()],
    queryFn: () => getSpecialtyProtocolDetail(specialtySlug!, protocolSlug!),
    enabled: Boolean(specialtySlug && protocolSlug),
  });

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center text-[var(--color-text-muted)]">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!protocol) {
    return (
      <div className="p-6 text-sm text-[var(--color-text-muted)]">
        Protocolo não encontrado.{' '}
        <Link to={`/resources/${specialtySlug}/protocols`} className="text-[var(--color-gold)]">
          Voltar
        </Link>
      </div>
    );
  }

  const angels = protocol.assets.filter(a => a.assetRole === 'angel' || a.assetRole === 'archangel');
  const graphs = protocol.assets.filter(a => a.assetRole === 'graph');

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link
        to={`/resources/${specialtySlug}/protocols`}
        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)]"
      >
        ← Protocolos
      </Link>

      <div>
        <span className="text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
          {protocol.code}
        </span>
        <h1 className="font-cinzel text-xl font-semibold mt-2">{protocol.name}</h1>
      </div>

      {protocol.description && (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5">
          <h2 className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-2">Para quê</h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{protocol.description}</p>
        </section>
      )}

      {protocol.whyActivate && (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5">
          <h2 className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-2">Por que ativar</h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{protocol.whyActivate}</p>
        </section>
      )}

      {protocol.steps.map(step => (
        <section
          key={step.id}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5"
        >
          <h2 className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
            Passo {step.stepNumber} — {step.title}
          </h2>
          {step.instructions && (
            <pre className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap font-sans">
              {step.instructions}
            </pre>
          )}
        </section>
      ))}

      {(angels.length > 0 || graphs.length > 0) && (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5 space-y-4">
          <h2 className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Assets associados</h2>
          {angels.length > 0 && (
            <div>
              <h3 className="text-xs text-[var(--color-gold)] mb-2">Símbolos angelicais</h3>
              <ul className="space-y-1">
                {angels.map(link => (
                  <li key={link.id} className="text-sm text-[var(--color-text-secondary)]">
                    {link.notes ?? link.asset.name}
                    <span className="text-[10px] text-[var(--color-text-muted)] ml-2">
                      ({ROLE_LABELS[link.assetRole] ?? link.assetRole})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {graphs.length > 0 && (
            <div>
              <h3 className="text-xs text-[var(--color-gold)] mb-2">Gráficos radiônicos</h3>
              <ul className="space-y-1">
                {graphs.map(link => (
                  <li key={link.id} className="text-sm text-[var(--color-text-secondary)]">
                    {link.notes ?? link.asset.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
