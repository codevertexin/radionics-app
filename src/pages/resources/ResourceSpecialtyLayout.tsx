import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import { isMethodologyEngineError } from '@/services/resourceLibraryService';
import { getSpecialtyResources } from '@/services/resourceLibraryService';
import { CertificationRequired } from '@/components/resources/CertificationRequired';
import { ResourceSpecialtyTabs } from '@/components/resources/ResourceSpecialtyTabs';

export default function ResourceSpecialtyLayout() {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['resource-specialty', specialtySlug, getDataMode()],
    queryFn: () => getSpecialtyResources(specialtySlug!),
    enabled: Boolean(specialtySlug),
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
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {summary.assetCount} assets · {summary.protocolCount} protocolos · {summary.activationCount} ativações
        </p>
      </header>

      <ResourceSpecialtyTabs />

      <Outlet context={{ summary }} />
    </div>
  );
}

export function ResourceSpecialtyIndexRedirect() {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();
  return <Navigate to={`/resources/${specialtySlug}/assets`} replace />;
}
