/**
 * Camada de apresentação do wizard — nomes amigáveis ao terapeuta.
 * Slugs/IDs internos permanecem inalterados.
 */

export interface SessionTypeDisplay {
  title: string;
  badge?: string;
  description: string;
}

const COMPLETE_DESCRIPTION =
  'Processo completo incluindo preparação energética, medições, diagnóstico, ativações e relatório.';

const EXPRESS_DESCRIPTION =
  'Abordagem simplificada para sessões mais rápidas.';

export function getWorkflowTemplateDisplay(
  slug: string,
  internalName: string,
  internalDescription?: string,
): SessionTypeDisplay {
  switch (slug) {
    case 'mesa-35-full':
      return {
        title: 'Sessão Completa',
        badge: 'Recomendado',
        description: COMPLETE_DESCRIPTION,
      };
    default:
      return {
        title: internalName.replace(/^Mesa 35 — /i, '').trim() || internalName,
        description: internalDescription?.trim() || COMPLETE_DESCRIPTION,
      };
  }
}

export function getLegacyTemplateDisplay(
  templateId: string,
  internalName: string,
  internalDescription?: string,
): SessionTypeDisplay {
  switch (templateId) {
    case 'tmpl-rad35-official':
      return {
        title: 'Sessão Completa (modelo clássico)',
        description: internalDescription?.trim() || COMPLETE_DESCRIPTION,
      };
    case 'tmpl-rad35-express':
      return {
        title: 'Sessão Express',
        description: internalDescription?.trim() || EXPRESS_DESCRIPTION,
      };
    default:
      return {
        title: internalName.replace(/^Mesa 35 — /i, '').trim() || internalName,
        description: internalDescription?.trim() || '',
      };
  }
}

export function getSessionTypeSummaryLabel(
  kind: 'workflow' | 'legacy-template',
  display: SessionTypeDisplay,
): string {
  return display.title;
}
