import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import { ResourceBackLink } from '@/components/resources/ResourceBackLink';
import { ResourceGraphPdfButton } from '@/components/resources/ResourceGraphPdfButton';
import { getAssetResourceDetail, getSpecialtyProtocolDetail } from '@/services/resourceLibraryService';
import { cn } from '@/lib/utils';

function MetadataItem({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)] mb-0.5">{label}</dt>
      <dd className="text-sm text-[var(--color-text-secondary)]">{value}</dd>
    </div>
  );
}

export default function ResourceAssetDetailPage() {
  const { specialtySlug, assetSlug } = useParams<{ specialtySlug: string; assetSlug: string }>();

  const { data: asset, isLoading } = useQuery({
    queryKey: ['resource-asset-detail', specialtySlug, assetSlug, getDataMode()],
    queryFn: () => getAssetResourceDetail(specialtySlug!, assetSlug!),
    enabled: Boolean(specialtySlug && assetSlug),
  });

  const { data: relatedProtocols } = useQuery({
    queryKey: ['resource-protocols-for-asset', specialtySlug, asset?.relatedProtocolSlugs, getDataMode()],
    queryFn: async () => {
      if (!asset?.relatedProtocolSlugs?.length) return [];
      const details = await Promise.all(
        asset.relatedProtocolSlugs.map(slug =>
          getSpecialtyProtocolDetail(specialtySlug!, slug),
        ),
      );
      return details.filter(Boolean);
    },
    enabled: Boolean(asset?.relatedProtocolSlugs?.length),
  });

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center text-[var(--color-text-muted)]">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-6 text-sm text-[var(--color-text-muted)]">
        Asset não encontrado.{' '}
        <Link to={`/resources/${specialtySlug}/assets`} className="text-[var(--color-gold)]">
          Voltar
        </Link>
      </div>
    );
  }

  const meta = (asset.content?.metadata ?? asset.metadata) as Record<string, unknown>;
  const color = typeof meta.color === 'string' ? meta.color : undefined;
  const element = typeof meta.element === 'string' ? meta.element : undefined;
  const organs = meta.organs as string | string[] | undefined;
  const imbalances = meta.imbalances as string | string[] | undefined;
  const howToBalance = typeof meta.how_to_balance === 'string' ? meta.how_to_balance : undefined;

  const isGraph = asset.assetType === 'graph';
  const assetsListPath = `/resources/${specialtySlug}/assets`;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <ResourceBackLink fallbackTo={assetsListPath} />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden">
          <div
            className={cn(
              'aspect-square flex items-center justify-center overflow-hidden',
              isGraph ? 'bg-[#f4f2ec]' : 'bg-[var(--color-surface-1)]',
            )}
          >
            {asset.imageUrlResolved ? (
              <img
                src={asset.imageUrlResolved}
                alt={asset.name}
                className={cn(
                  'w-full h-full',
                  isGraph ? 'object-contain p-4' : 'object-cover',
                )}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs">
                Sem imagem
              </div>
            )}
          </div>
          <div className="p-4 space-y-1">
            <h1 className="font-cinzel text-lg font-semibold">{asset.name}</h1>
            {asset.originalName && (
              <p className="text-sm text-[var(--color-gold)]">{asset.originalName}</p>
            )}
            {(asset.aliases ?? []).length > 0 && (
              <p className="text-xs text-[var(--color-text-muted)]">{(asset.aliases ?? []).join(' · ')}</p>
            )}
            {isGraph && (
              <div className="pt-2">
                <ResourceGraphPdfButton
                  specialtySlug={specialtySlug!}
                  assetSlug={asset.slug}
                  asset={asset}
                  showPreviewLink
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {asset.baseDescription && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5">
              <h2 className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-2">O que é</h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{asset.baseDescription}</p>
            </section>
          )}

          {asset.content?.therapistExplanation && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5">
              <h2 className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-2">Explicação terapeuta</h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                {asset.content.therapistExplanation}
              </p>
            </section>
          )}

          {asset.content?.clientExplanation && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5">
              <h2 className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-2">Explicação cliente</h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                {asset.content.clientExplanation}
              </p>
            </section>
          )}

          {(asset.content?.activationText) && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5">
              <h2 className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-2">Ativação</h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                {asset.content.activationText}
              </p>
            </section>
          )}

          {(color || element || organs || imbalances || howToBalance || asset.content?.recommendedUse) && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5">
              <h2 className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-3">Metadados</h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                <MetadataItem label="Cor" value={color} />
                <MetadataItem label="Elemento" value={element} />
                <MetadataItem
                  label="Órgãos"
                  value={Array.isArray(organs) ? organs.join(', ') : organs}
                />
                <MetadataItem
                  label="Desequilíbrios"
                  value={Array.isArray(imbalances) ? imbalances.join(', ') : imbalances}
                />
                <MetadataItem
                  label="Como equilibrar"
                  value={howToBalance ?? asset.content?.recommendedUse}
                />
              </dl>
            </section>
          )}

          {relatedProtocols && relatedProtocols.length > 0 && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5">
              <h2 className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-3">Protocolos relacionados</h2>
              <ul className="space-y-2">
                {relatedProtocols.map(p => p && (
                  <li key={p.id}>
                    <Link
                      to={`/resources/${specialtySlug}/protocols/${p.slug}`}
                      className="flex items-center justify-between text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]"
                    >
                      {p.name}
                      <ChevronRight size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
