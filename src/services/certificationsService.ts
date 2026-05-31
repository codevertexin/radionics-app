/**
 * Certifications service — mock-backed or Supabase (VITE_DATA_MODE).
 */

import { CERTIFICATIONS } from '@/data/mock-data';
import { isSupabaseMode } from '@/lib/dataMode';
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
  return mockGetAllCertifications();
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
