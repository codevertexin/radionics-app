/**
 * Normaliza texto para slug URL-safe (ASCII, hífens).
 *
 * @example
 * slugify('Mesa Radiónica da Proteção de Arcanjo Miguel')
 * // → 'mesa-radionica-da-protecao-de-arcanjo-miguel'
 *
 * @example
 * slugify('  MAP — Oficial  ')
 * // → 'map-oficial'
 */
export function slugify(text: string): string {
  const slug = text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'specialty';
}

/** Slug para pedido/especialidade: usa slug explícito ou deriva do nome. */
export function resolveSpecialtySlug(name: string, explicitSlug?: string): string {
  return slugify(explicitSlug?.trim() || name);
}
