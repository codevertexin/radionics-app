/**
 * Certifications service — mock-backed, Supabase-ready.
 */

import { CERTIFICATIONS } from '@/data/mock-data';
import { isSupabaseMode, supabaseNotWired } from '@/lib/dataMode';
import type { Certification, CertDocument, DocFileType } from '@/types';

const delay = (ms = 120) => new Promise<void>(r => setTimeout(r, ms));

let certsStore = CERTIFICATIONS.map(c => ({
  ...c,
  documents: [...c.documents],
}));

function cloneCert(cert: Certification): Certification {
  return { ...cert, documents: cert.documents.map(d => ({ ...d })) };
}

export async function getMyCertifications(): Promise<Certification[]> {
  if (isSupabaseMode()) supabaseNotWired('certifications.getMyCertifications');
  await delay();
  return certsStore
    .filter(c => c.therapistId === 'therapist-001')
    .map(cloneCert);
}

export async function getAllCertifications(): Promise<Certification[]> {
  if (isSupabaseMode()) supabaseNotWired('certifications.getAllCertifications');
  await delay();
  return certsStore.map(cloneCert);
}

export async function submitCertification(input: {
  specialtyId: string;
  yearsOfExperience: number;
  experienceDescription?: string;
  trainingInstitution?: string;
  trainingCompletedDate?: string;
  notes?: string;
}): Promise<Certification> {
  if (isSupabaseMode()) supabaseNotWired('certifications.submitCertification');
  await delay();

  const existing = certsStore.find(
    c => c.therapistId === 'therapist-001' && c.specialtyId === input.specialtyId,
  );

  if (existing && (existing.status === 'approved' || existing.status === 'pending')) {
    throw new Error('Certification already submitted or approved');
  }

  const cert: Certification = {
    id: existing?.id ?? `cert-${Date.now()}`,
    therapistId: 'therapist-001',
    specialtyId: input.specialtyId,
    status: 'pending',
    yearsOfExperience: input.yearsOfExperience,
    experienceDescription: input.experienceDescription,
    trainingInstitution: input.trainingInstitution,
    trainingCompletedDate: input.trainingCompletedDate,
    notes: input.notes,
    submittedAt: new Date().toISOString(),
    documents: existing?.documents ?? [],
  };

  if (existing) {
    certsStore = certsStore.map(c => (c.id === existing.id ? cert : c));
  } else {
    certsStore = [cert, ...certsStore];
  }

  return cloneCert(cert);
}

export async function uploadCertDocument(certId: string, file: File): Promise<CertDocument> {
  if (isSupabaseMode()) supabaseNotWired('certifications.uploadCertDocument');
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

export async function reviewCertification(
  id: string,
  status: 'approved' | 'rejected',
  adminNotes?: string,
): Promise<Certification> {
  if (isSupabaseMode()) supabaseNotWired('certifications.reviewCertification');
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
