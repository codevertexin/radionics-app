import { assertCanSubmitNewCertification } from '@/lib/certificationRules';
import type { CertStatus } from '@/types';

export type SubmitCertPayload = {
  specialtyId: string;
  yearsOfExperience: number;
  experienceDescription?: string;
  trainingInstitution?: string;
  trainingCompletedDate?: string;
  notes?: string;
  submittedAt: string;
  adminNotes: null;
  reviewedAt: null;
  reviewedBy: null;
  status: 'pending';
};

export function buildSubmitPayload(
  input: Omit<SubmitCertPayload, 'submittedAt' | 'adminNotes' | 'reviewedAt' | 'reviewedBy' | 'status'>,
): Pick<
  SubmitCertPayload,
  'yearsOfExperience' | 'experienceDescription' | 'trainingInstitution' | 'trainingCompletedDate' | 'notes' | 'submittedAt' | 'adminNotes' | 'reviewedAt' | 'reviewedBy' | 'status'
> {
  return {
    status: 'pending',
    yearsOfExperience: input.yearsOfExperience,
    experienceDescription: input.experienceDescription,
    trainingInstitution: input.trainingInstitution,
    trainingCompletedDate: input.trainingCompletedDate,
    notes: input.notes,
    submittedAt: new Date().toISOString(),
    adminNotes: null,
    reviewedAt: null,
    reviewedBy: null,
  };
}

export function resolveSubmitAction(existingStatus: CertStatus | undefined): 'create' | 'update' {
  return assertCanSubmitNewCertification(existingStatus);
}
