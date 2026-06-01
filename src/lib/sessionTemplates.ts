/**
 * Associação especialidade → templates (mock / pré-Supabase).
 * Preferência: specialty_id explícito no template; slug; methodologyId legado.
 */

import { TEMPLATES } from '@/data/mock-data';
import type { Specialty, Template } from '@/types';

/** Chave interna de sessão/mock (meth-map, meth-rad35, meth-rad49). */
export type SessionMethodologyKey =
  | 'meth-map'
  | 'meth-rad35'
  | 'meth-rad49';

const SLUG_TO_METHODOLOGY: Record<string, SessionMethodologyKey> = {
  map: 'meth-map',
  'mesa-35': 'meth-rad35',
  'mesa-49': 'meth-rad49',
};

/** IDs mock legados (spec-*) → methodology. */
const LEGACY_SPECIALTY_ID_TO_METHODOLOGY: Record<string, SessionMethodologyKey> = {
  'spec-map': 'meth-map',
  'spec-rad35': 'meth-rad35',
  'spec-rad49': 'meth-rad49',
};

/**
 * Resolve a especialidade para a chave usada em templates e createSession (mock).
 * Usa slug (Supabase seed) e IDs legados mock; devolve o id original se desconhecido.
 */
export function resolveSpecialtyToMethodologyId(
  specialty: Pick<Specialty, 'id' | 'slug'>,
): string {
  const fromSlug = SLUG_TO_METHODOLOGY[specialty.slug];
  if (fromSlug) return fromSlug;

  const fromLegacy = LEGACY_SPECIALTY_ID_TO_METHODOLOGY[specialty.id];
  if (fromLegacy) return fromLegacy;

  return specialty.id;
}

function templateMatchesSpecialty(template: Template, specialty: Specialty): boolean {
  if (template.specialtyIds?.includes(specialty.id)) return true;
  if (template.specialtySlugs?.includes(specialty.slug)) return true;

  const methKey = resolveSpecialtyToMethodologyId(specialty);
  return template.methodologyId === methKey;
}

/** Templates ativos compatíveis com a especialidade (fonte: mock-data, sem Supabase). */
export function getActiveTemplatesForSpecialty(specialty: Specialty): Template[] {
  return TEMPLATES.filter(
    t => t.status === 'active' && templateMatchesSpecialty(t, specialty),
  );
}
