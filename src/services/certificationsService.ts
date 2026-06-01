/**
 * Certifications service — mock-backed or Supabase (VITE_DATA_MODE).
 */

import { CERTIFICATIONS } from '@/data/mock-data';
import { isSupabaseMode } from '@/lib/dataMode';
import { attachRequesterFields, fetchRequesterProfiles } from '@/lib/requesterProfiles';
import { resolveSubmitAction, buildSubmitPayload } from '@/services/certificationSubmit';
import * as supabaseCerts from '@/services/supabase/certificationsSupabase';
import type { Certification, CertDocument, DocFileType } from '@/types';

const delay = (ms = 120) => new Promise<void>(r => setTimeout(r, ms));

let certsStore = CERTIFICATIONS.map(c => ({
  ...c,
  documents: [...c.documents],
}));

function cloneCert(cert: Certification): Certification {
  return { ...cert, documents: cert.documents.map(d => ({ ...d })) };
}

// ─── Mock implementations ─────────────────────────────────────

async function mockGetMyCertifications(): Promise<Certification[]> {
  await delay();
  return certsStore
    .filter(c => c.therapistId === 'therapist-001')
    .map(cloneCert);
}

async function mockGetAllCertifications(): Promise<Certification[]> {
  await delay();
  return certsStore.map(cloneCert);
}

async function mockSubmitCertification(input: {
  specialtyId: string;
  yearsOfExperience: number;
  experienceDescription?: string;
  trainingInstitution?: string;
  trainingCompletedDate?: string;
  notes?: string;
}): Promise<Certification> {
  await delay();

  const existing = certsStore.find(
    c => c.therapistId === 'therapist-001' && c.specialtyId === input.specialtyId,
  );

  const action = resolveSubmitAction(existing?.status);
  const submitFields = buildSubmitPayload(input);

  const cert: Certification = {
    id: existing?.id ?? `cert-${Date.now()}`,
    therapistId: 'therapist-001',
    specialtyId: input.specialtyId,
    status: submitFields.status,
    yearsOfExperience: submitFields.yearsOfExperience,
    experienceDescription: submitFields.experienceDescription,
    trainingInstitution: submitFields.trainingInstitution,
    trainingCompletedDate: submitFields.trainingCompletedDate,
    notes: submitFields.notes,
    submittedAt: submitFields.submittedAt,
    adminNotes: undefined,
    reviewedBy: undefined,
    reviewedAt: undefined,
    documents: existing?.documents ?? [],
  };

  if (action === 'update' && existing) {
    certsStore = certsStore.map(c => (c.id === existing.id ? cert : c));
  } else {
    certsStore = [cert, ...certsStore];
  }

  return cloneCert(cert);
}

async function mockUploadCertDocument(certId: string, file: File): Promise<CertDocument> {
  await delay(200);

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf';
  const fileType = (['pdf', 'jpg', 'jpeg', 'png'].includes(ext) ? ext : 'pdf') as DocFileType;

  const doc: CertDocument = {
    id: `cdoc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    certificationId: certId,
    fileUrl: `mock://certifications/${certId}/${file.name}`,
    fileName: file.name,
    fileType,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
  };

  certsStore = certsStore.map(c =>
    c.id === certId ? { ...c, documents: [...c.documents, doc] } : c,
  );

  return doc;
}

async function mockUpdateCertification(
  certId: string,
  input: {
    yearsOfExperience: number;
    experienceDescription?: string;
    trainingInstitution?: string;
    trainingCompletedDate?: string;
    notes?: string;
  },
): Promise<Certification> {
  await delay();
  const idx = certsStore.findIndex(c => c.id === certId && c.therapistId === 'therapist-001');
  if (idx === -1) throw new Error('Certification not found');
  if (certsStore[idx].status === 'approved') {
    throw new Error('Cannot update approved certification');
  }

  certsStore[idx] = {
    ...certsStore[idx],
    yearsOfExperience: input.yearsOfExperience,
    experienceDescription: input.experienceDescription,
    trainingInstitution: input.trainingInstitution,
    trainingCompletedDate: input.trainingCompletedDate,
    notes: input.notes,
    updatedAt: new Date().toISOString(),
  };
  return cloneCert(certsStore[idx]);
}

async function mockRemoveCertificationDocument(documentId: string): Promise<void> {
  await delay();
  const cert = certsStore.find(c => c.documents.some(d => d.id === documentId));
  if (!cert || cert.therapistId !== 'therapist-001') throw new Error('Document not found');
  if (cert.status === 'approved') throw new Error('Cannot remove document from approved certification');

  certsStore = certsStore.map(c =>
    c.id === cert.id
      ? { ...c, documents: c.documents.filter(d => d.id !== documentId) }
      : c,
  );
}

async function mockResubmitCertification(
  certId: string,
  input: {
    yearsOfExperience: number;
    experienceDescription?: string;
    trainingInstitution?: string;
    trainingCompletedDate?: string;
    notes?: string;
  },
  options: { removeDocumentIds?: string[]; newFiles?: File[] } = {},
): Promise<Certification> {
  await delay();
  const idx = certsStore.findIndex(c => c.id === certId && c.therapistId === 'therapist-001');
  if (idx === -1) throw new Error('Certification not found');
  const cert = certsStore[idx];
  if (cert.status !== 'rejected' && cert.status !== 'expired') {
    throw new Error('Only rejected or expired certifications can be resubmitted');
  }

  const removeIds = new Set(options.removeDocumentIds ?? []);
  let documents = cert.documents.filter(d => !removeIds.has(d.id));

  if (options.newFiles?.length) {
    for (const file of options.newFiles) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf';
      const fileType = (['pdf', 'jpg', 'jpeg', 'png'].includes(ext) ? ext : 'pdf') as DocFileType;
      documents = [
        ...documents,
        {
          id: `cdoc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          certificationId: certId,
          fileUrl: `mock://certifications/${certId}/${file.name}`,
          fileName: file.name,
          fileType,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        },
      ];
    }
  }

  if (documents.length < 1) {
    throw new Error('É necessário pelo menos um documento para resubmeter a certificação');
  }

  const updated: Certification = {
    ...cert,
    status: 'pending',
    yearsOfExperience: input.yearsOfExperience,
    experienceDescription: input.experienceDescription,
    trainingInstitution: input.trainingInstitution,
    trainingCompletedDate: input.trainingCompletedDate,
    notes: input.notes,
    adminNotes: undefined,
    reviewedBy: undefined,
    reviewedAt: undefined,
    expiresAt: undefined,
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documents,
  };
  certsStore[idx] = updated;
  return cloneCert(updated);
}

async function mockReviewCertification(
  id: string,
  status: 'approved' | 'rejected',
  adminNotes?: string,
): Promise<Certification> {
  await delay();

  const idx = certsStore.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Certification not found');

  const updated: Certification = {
    ...certsStore[idx],
    status,
    adminNotes,
    reviewedBy: 'admin-001',
    reviewedAt: new Date().toISOString(),
    expiresAt: status === 'approved'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : certsStore[idx].expiresAt,
  };
  certsStore[idx] = updated;
  return cloneCert(updated);
}

// ─── Public API (Phase 2A names + UI aliases) ─────────────────

export async function listCertifications(): Promise<Certification[]> {
  if (isSupabaseMode()) return supabaseCerts.listCertifications();
  return mockGetMyCertifications();
}

export async function adminListCertifications(): Promise<Certification[]> {
  if (isSupabaseMode()) return supabaseCerts.adminListCertifications();
  const certs = await mockGetAllCertifications();
  const profiles = await fetchRequesterProfiles(certs.map(c => c.therapistId));
  return attachRequesterFields(certs, profiles);
}

export async function listCertificationDocuments(certificationId: string): Promise<CertDocument[]> {
  if (isSupabaseMode()) return supabaseCerts.listCertificationDocuments(certificationId);
  await delay();
  const cert = certsStore.find(c => c.id === certificationId);
  return cert ? cert.documents.map(d => ({ ...d })) : [];
}

export async function submitCertification(input: {
  specialtyId: string;
  yearsOfExperience: number;
  experienceDescription?: string;
  trainingInstitution?: string;
  trainingCompletedDate?: string;
  notes?: string;
}): Promise<Certification> {
  if (isSupabaseMode()) return supabaseCerts.submitCertification(input);
  return mockSubmitCertification(input);
}

export async function uploadCertificationDocuments(
  certId: string,
  files: File[],
): Promise<CertDocument[]> {
  if (isSupabaseMode()) return supabaseCerts.uploadCertificationDocuments(certId, files);
  return Promise.all(files.map(f => mockUploadCertDocument(certId, f)));
}

export async function addCertificationDocuments(
  certId: string,
  files: File[],
): Promise<CertDocument[]> {
  return uploadCertificationDocuments(certId, files);
}

export async function uploadCertDocument(certId: string, file: File): Promise<CertDocument> {
  if (isSupabaseMode()) return supabaseCerts.uploadCertificationDocument(certId, file);
  return mockUploadCertDocument(certId, file);
}

export async function updateCertification(
  certId: string,
  input: {
    yearsOfExperience: number;
    experienceDescription?: string;
    trainingInstitution?: string;
    trainingCompletedDate?: string;
    notes?: string;
  },
): Promise<Certification> {
  if (isSupabaseMode()) return supabaseCerts.updateCertification(certId, input);
  return mockUpdateCertification(certId, input);
}

export async function removeCertificationDocument(documentId: string): Promise<void> {
  if (isSupabaseMode()) return supabaseCerts.removeCertificationDocument(documentId);
  return mockRemoveCertificationDocument(documentId);
}

export async function resubmitCertification(
  certId: string,
  input: {
    yearsOfExperience: number;
    experienceDescription?: string;
    trainingInstitution?: string;
    trainingCompletedDate?: string;
    notes?: string;
  },
  options: { removeDocumentIds?: string[]; newFiles?: File[] } = {},
): Promise<Certification> {
  if (isSupabaseMode()) return supabaseCerts.resubmitCertification(certId, input, options);
  return mockResubmitCertification(certId, input, options);
}

export async function adminReviewCertification(
  id: string,
  status: 'approved' | 'rejected',
  adminNotes?: string,
): Promise<Certification> {
  if (isSupabaseMode()) return supabaseCerts.adminReviewCertification(id, status, adminNotes);
  return mockReviewCertification(id, status, adminNotes);
}

/** @deprecated Use listCertifications */
export const getMyCertifications = listCertifications;

/** @deprecated Use adminListCertifications */
export const getAllCertifications = adminListCertifications;

/** @deprecated Use adminReviewCertification */
export const reviewCertification = adminReviewCertification;

/** Reset in-memory mock store — e.g. after logout. */
export function resetCertificationsStore(): void {
  certsStore = CERTIFICATIONS.map(c => ({
    ...c,
    documents: [...c.documents],
  }));
}
