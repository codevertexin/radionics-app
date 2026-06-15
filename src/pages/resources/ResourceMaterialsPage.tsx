import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { getDataMode } from '@/lib/dataMode';
import { formatGroupHeading } from '@/lib/materials/materialDisplay';
import { isMaterialsLibraryError } from '@/lib/materials/materialsErrors';
import { ResourceMaterialCard } from '@/components/resources/ResourceMaterialCard';
import { ResourceMaterialsPageSkeleton } from '@/components/resources/ResourceMaterialsPageSkeleton';
import {
  groupMaterialsByType,
  listMaterialsForSpecialty,
} from '@/services/materialsLibraryService';

export default function ResourceMaterialsPage() {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();

  const { data: materials, isLoading, isError, error } = useQuery({
    queryKey: ['resource-materials', specialtySlug, getDataMode()],
    queryFn: () => listMaterialsForSpecialty(specialtySlug!),
    enabled: Boolean(specialtySlug),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const groups = useMemo(
    () => groupMaterialsByType(materials ?? []),
    [materials],
  );

  if (isLoading) {
    return <ResourceMaterialsPageSkeleton />;
  }

  if (isError) {
    const message =
      isMaterialsLibraryError(error)
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Não foi possível carregar os materiais.';

    return (
      <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
        <AlertCircle size={28} className="text-[var(--color-text-muted)] opacity-50" />
        <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
          Ainda não existem materiais disponíveis para esta especialidade.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {groups.map(group => (
        <section key={group.type} className="space-y-4" aria-labelledby={`materials-group-${group.type}`}>
          <h2
            id={`materials-group-${group.type}`}
            className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {formatGroupHeading(group.type, group.label)}
            <span className="ml-2 text-xs font-normal text-[var(--color-text-muted)]">
              ({group.materials.length})
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.materials.map(material => (
              <ResourceMaterialCard
                key={material.id}
                material={material}
                specialtySlug={specialtySlug!}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
