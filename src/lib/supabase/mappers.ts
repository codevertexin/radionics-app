import type { Certification, CertDocument, DocFileType, Specialty, SpecialtyRequest } from '@/types';

export type SpecialtyRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  color: string | null;
  requires_certification: boolean;
  tool_count: number;
  status: string;
  created_at: string;
};

export type SpecialtyRequestRow = {
  id: string;
  therapist_id: string;
  proposed_name: string;
  proposed_slug: string | null;
  description: string | null;
  category: string | null;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  submitted_at: string;
  created_at: string;
};

export type CertificationRow = {
  id: string;
  therapist_id: string;
  specialty_id: string;
  status: string;
  years_of_experience: number;
  experience_description: string | null;
  training_institution: string | null;
  training_completed_date: string | null;
  certificate_number: string | null;
  certified_by: string | null;
  admin_notes: string | null;
  notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CertDocumentRow = {
  id: string;
  certification_id: string;
  storage_path: string | null;
  file_url: string | null;
  file_name: string;
  mime_type: string;
  file_type: string;
  file_size: number | null;
  uploaded_at: string;
};

export function mapSpecialty(row: SpecialtyRow): Specialty {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    color: row.color ?? undefined,
    category: row.category ?? undefined,
    requiresCertification: row.requires_certification,
    isActive: row.status === 'active',
    toolCount: row.tool_count,
    status: row.status as Specialty['status'],
    createdAt: row.created_at,
  };
}

export function mapSpecialtyRequest(row: SpecialtyRequestRow): SpecialtyRequest {
  return {
    id: row.id,
    therapistId: row.therapist_id,
    proposedName: row.proposed_name,
    proposedSlug: row.proposed_slug ?? undefined,
    description: row.description ?? undefined,
    category: row.category ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status as SpecialtyRequest['status'],
    adminNotes: row.admin_notes ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
  };
}

export function mapCertDocument(row: CertDocumentRow): CertDocument {
  return {
    id: row.id,
    certificationId: row.certification_id,
    fileUrl: row.file_url ?? row.storage_path ?? '',
    fileName: row.file_name,
    fileType: row.file_type as DocFileType,
    fileSize: row.file_size ?? undefined,
    uploadedAt: row.uploaded_at,
  };
}

export function mapCertification(row: CertificationRow, documents: CertDocumentRow[] = []): Certification {
  return {
    id: row.id,
    therapistId: row.therapist_id,
    specialtyId: row.specialty_id,
    status: row.status as Certification['status'],
    yearsOfExperience: row.years_of_experience,
    experienceDescription: row.experience_description ?? undefined,
    trainingInstitution: row.training_institution ?? undefined,
    trainingCompletedDate: row.training_completed_date ?? undefined,
    certificateNumber: row.certificate_number ?? undefined,
    certifiedBy: row.certified_by ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
    notes: row.notes ?? undefined,
    submittedAt: row.submitted_at ?? row.created_at,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    documents: documents.map(mapCertDocument),
  };
}

export function mimeToFileType(mime: string): DocFileType {
  switch (mime) {
    case 'application/pdf':
      return 'pdf';
    case 'image/jpeg':
      return 'jpeg';
    case 'image/png':
      return 'png';
    default:
      throw new Error(`[Supabase] MIME type not allowed: ${mime}`);
  }
}

export function fileToMime(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  throw new Error(`[Supabase] Cannot infer MIME type for file: ${file.name}`);
}

export function safeFilename(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
  return base.slice(0, 200) || 'document';
}

export function certificationStoragePath(
  therapistId: string,
  certificationId: string,
  filename: string,
): string {
  return `radionics/certifications/${therapistId}/${certificationId}/${safeFilename(filename)}`;
}
