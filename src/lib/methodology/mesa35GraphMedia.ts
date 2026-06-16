/**
 * Imagens Bunny dos 35 gráficos Mesa 35 — paridade V2.5A / Resources.
 */

const CDN_BASE = 'https://radionics.b-cdn.net/tools/map_outros/graphics';

/** Converte slug do asset (anti-magia) para código legado (anti_magia). */
export function mesa35SlugToLegacyGraphicCode(slug: string): string {
  return slug.trim().toLowerCase().replace(/-/g, '_');
}

/** URL primária Bunny para um gráfico Mesa 35. */
export function mesa35GraphCdnImageUrl(slug: string): string {
  return `${CDN_BASE}/${mesa35SlugToLegacyGraphicCode(slug)}.jpg`;
}
