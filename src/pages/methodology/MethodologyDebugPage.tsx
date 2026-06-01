import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Layers, AlertCircle, Loader2 } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import {
  getSpecialtyMethodologyBundle,
  isMethodologyEngineError,
} from '@/services/methodologyEngineService';
import type { MethodologyAsset, SpecialtyToolLink } from '@/types';
import { cn } from '@/lib/utils';

export default function MethodologyDebugPage() {
  const { specialtySlug = 'mesa-35' } = useParams<{ specialtySlug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['methodology-debug', specialtySlug, getDataMode()],
    queryFn: () => getSpecialtyMethodologyBundle(specialtySlug),
  });

  const assetsByTool = groupAssetsByTool(data?.tools ?? [], data?.assets ?? []);

  return (
    <div className="min-h-full bg-[var(--color-void)]">
      <div className="px-6 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-amber-400/90 font-medium">
              DEV · Methodology Engine V2.3
            </p>
            <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">
              Debug metodologia
            </h1>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] ml-11">
          Slug: <code className="text-[var(--color-gold)]">{specialtySlug}</code>
          {' · '}
          Modo: <code>{getDataMode()}</code>
        </p>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Loader2 size={16} className="animate-spin" />
            A carregar dados do engine…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-300">Erro ao carregar</p>
              <p className="text-sm text-red-200/80 mt-1">
                {error instanceof Error ? error.message : String(error)}
              </p>
              {isMethodologyEngineError(error) && (
                <p className="text-xs text-red-300/60 mt-1">Código: {error.code}</p>
              )}
            </div>
          </div>
        )}

        {data && (
          <>
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5">
              <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
                Especialidade
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[var(--color-text-muted)]">Nome</dt>
                  <dd className="font-medium text-[var(--color-text-primary)]">{data.context.specialtyName}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">ID</dt>
                  <dd className="font-mono text-xs text-[var(--color-text-secondary)] break-all">
                    {data.context.specialtyId}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5">
              <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
                Ferramentas ligadas ({data.tools.length})
              </h2>
              <div className="space-y-2">
                {data.tools.map(link => (
                  <div
                    key={link.id}
                    className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)]"
                  >
                    <Layers size={14} className="text-[var(--color-gold)]" />
                    <span className="text-sm font-medium">{link.tool.name}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {link.tool.slug} · {link.tool.toolType}
                    </span>
                    {link.isRequired && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-gold)]/15 text-[var(--color-gold)]">
                        obrigatório
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">
                      ordem {link.sortOrder}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5 space-y-4">
              <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-secondary)]">
                Assets por ferramenta ({data.assets.length} total)
              </h2>
              {assetsByTool.map(({ tool, assets }) => (
                <div key={tool.id}>
                  <p className="text-xs font-medium text-[var(--color-gold)] mb-2">
                    {tool.name} ({assets.length})
                  </p>
                  {assets.length === 0 ? (
                    <p className="text-xs text-[var(--color-text-muted)] italic">Sem assets.</p>
                  ) : (
                    <ul className="space-y-1">
                      {assets.map(a => (
                        <li
                          key={a.id}
                          className="text-xs text-[var(--color-text-secondary)] flex gap-2"
                        >
                          <span className="text-[var(--color-text-muted)] w-8">{a.sortOrder}</span>
                          <span className="font-medium">{a.name}</span>
                          <span className="text-[var(--color-text-muted)]">{a.slug}</span>
                          <span
                            className={cn(
                              'px-1 rounded',
                              a.assetType === 'graph' ? 'bg-sky-400/10 text-sky-400' : 'bg-violet-400/10 text-violet-400',
                            )}
                          >
                            {a.assetType}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5">
              <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
                Conteúdo contextual
              </h2>
              <p className="text-2xl font-bold font-cinzel text-[var(--color-gold)]">
                {data.assetContent.length}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Registos em specialty_asset_content para esta especialidade
              </p>
              {data.assetContent.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4">
                  {data.assetContent.map(c => (
                    <li key={c.id} className="text-xs">
                      <span className="font-medium text-[var(--color-text-primary)]">{c.title}</span>
                      {c.clientExplanation && (
                        <p className="text-[var(--color-text-muted)] mt-0.5 line-clamp-2">
                          {c.clientExplanation}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        <p className="text-xs text-[var(--color-text-muted)] text-center pb-8">
          Rota temporária — não exposta na navegação principal. Workspace ainda usa mock-data.
        </p>
      </div>
    </div>
  );
}

function groupAssetsByTool(
  tools: SpecialtyToolLink[],
  assets: MethodologyAsset[],
): { tool: SpecialtyToolLink['tool']; assets: MethodologyAsset[] }[] {
  return tools.map(link => ({
    tool: link.tool,
    assets: assets
      .filter(a => a.toolId === link.toolId)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}
