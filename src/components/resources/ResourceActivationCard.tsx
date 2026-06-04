import { Link } from 'react-router-dom';
import type { ActivationScriptResource } from '@/types';
import { ResourceActivationImage } from '@/components/resources/ResourceActivationImage';
import { ResourceGraphPdfButton } from '@/components/resources/ResourceGraphPdfButton';

interface ResourceActivationCardProps {
  script: ActivationScriptResource;
  specialtySlug: string;
}

export function ResourceActivationCard({ script, specialtySlug }: ResourceActivationCardProps) {
  const title = script.assetName ?? script.name;
  const isGraph = script.assetType === 'graph';

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-5">
        <ResourceActivationImage imageUrl={script.imageUrl} alt={title} />
        <div className="flex-1 min-w-0 space-y-3">
          <h3 className="font-medium text-sm text-[var(--color-text-primary)]">{title}</h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
            {script.content}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {script.assetSlug && (
              <Link
                to={`/resources/${specialtySlug}/assets/${script.assetSlug}`}
                className="text-[11px] text-[var(--color-gold)] hover:underline"
              >
                Ver asset
              </Link>
            )}
            {isGraph && script.assetSlug && (
              <ResourceGraphPdfButton
                specialtySlug={specialtySlug}
                assetSlug={script.assetSlug}
                variant="inline"
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
