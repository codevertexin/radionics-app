/** True in Vite production builds — therapists see production UX rules. */
export function isAppProduction(): boolean {
  return import.meta.env.PROD;
}

export const PRINT_LAYOUT_UNAVAILABLE_MESSAGE =
  'Versão de impressão ainda não disponível.';
