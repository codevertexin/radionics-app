import type { CertStatus } from '@/types';

export const CERT_SUBMIT_ERRORS = {
  pending: 'Esta certificação já está em análise.',
  approved: 'Esta especialidade já está ativa.',
  resubmit: 'Use o fluxo de correção/renovação para esta certificação.',
} as const;

/** Throws if a new submit (not resubmit) is not allowed for this status. */
export function assertCanSubmitNewCertification(
  status: CertStatus | undefined,
): 'create' | 'update' {
  if (!status) return 'create';

  switch (status) {
    case 'not_certified':
      return 'update';
    case 'pending':
      throw new Error(CERT_SUBMIT_ERRORS.pending);
    case 'approved':
      throw new Error(CERT_SUBMIT_ERRORS.approved);
    case 'rejected':
    case 'expired':
      throw new Error(CERT_SUBMIT_ERRORS.resubmit);
    default:
      return 'create';
  }
}

export function canOpenInitialSubmitModal(status: CertStatus | undefined): boolean {
  return !status || status === 'not_certified';
}

export function canOpenResubmitModal(status: CertStatus | undefined): boolean {
  return status === 'rejected' || status === 'expired';
}
