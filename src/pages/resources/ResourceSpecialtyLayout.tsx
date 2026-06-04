import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import {
  getDefaultResourceTab,
  getSpecialtyResources,
  hasAnyResourceContent,
  isMethodologyEngineError,
} from '@/services/resourceLibraryService';
import { CertificationRequired } from '@/components/resources/CertificationRequired';
import { ResourceSpecialtyTabs } from '@/components/resources/ResourceSpecialtyTabs';

export default function ResourceSpecialtyLayout() {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['resource-specialty', specialtySlug, getDataMode()],
    queryFn: () => getSpecialtyResources(specialtySlug!),
    enabled: Boolean(specialtySlug),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center text-[var(--color-text-muted)]">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (error && isMethodologyEngineError(error) && error.code === 'FORBIDDEN') {
    return <CertificationRequired specialtyName={specialtySlug} />;
  }

  if (error || !summary) {
    return <CertificationRequired specialtyName={specialtySlug} />;
  }

  const hasContent = hasAnyResourceContent(summary);

  return (
    <div className="min-h-full bg-[var(--color-void)]">
      <header className="px-6 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] mb-3"
        >
          <ArrowLeft size={14} />
          Recursos
        </Link>
        <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">
          {summary.specialtyName}
        </h1>
        {hasContent && (
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {summary.assetCount > 0 && `${summary.assetCount} assets`}
            {summary.assetCount > 0 && summary.protocolCount > 0 && ' · '}
            {summary.protocolCount > 0 && `${summary.protocolCount} protocolos`}
            {(summary.assetCount > 0 || summary.protocolCount > 0) && summary.activationCount > 0 && ' · '}
            {summary.activationCount > 0 && `${summary.activationCount} ativações`}
          </p>
        )}
      </header>

      {hasContent ? (
        <>
          <ResourceSpecialtyTabs summary={summary} />
          <Outlet context={{ summary }} />
        </>
      ) : (
        <div className="p-12 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Recursos ainda não configurados para esta especialidade.
          </p>
        </div>
      )}
    </div>
  );
}

export function ResourceSpecialtyIndexRedirect() {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['resource-specialty', specialtySlug, getDataMode()],
    queryFn: () => getSpecialtyResources(specialtySlug!),
    enabled: Boolean(specialtySlug),
  });

  if (isLoading || !summary) {
    return (
      <div className="p-12 flex justify-center text-[var(--color-text-muted)]">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!hasAnyResourceContent(summary)) {
    return null;
  }

  return <Navigate to={`/resources/${specialtySlug}/${getDefaultResourceTab(summary)}`} replace />;
}
