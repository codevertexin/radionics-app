import { requireSupabaseClient } from '@/lib/dataMode';
import { requireAuthUserId } from '@/lib/supabase/auth';
import { wrapSupabaseError } from '@/lib/supabase/errors';
import {
  certificationStoragePath,
  fileToMime,
  mapCertDocument,
  mapCertification,
  mimeToFileType,
  type CertDocumentRow,
  type CertificationRow,
} from '@/lib/supabase/mappers';
import type { Certification, CertDocument } from '@/types';

const BUCKET = 'radionics-certifications';
const SIGNED_URL_TTL_SEC = 3600;

async function resolveDocumentUrl(row: CertDocumentRow): Promise<CertDocument> {
  const doc = mapCertDocument(row);
  if (row.file_url) {
    doc.fileUrl = row.file_url;
    return doc;
  }
  if (!row.storage_path) return doc;

  const client = requireSupabaseClient();
  const { data, error } = await client.storage
    .from(BUCKET)
    .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SEC);

  if (error) wrapSupabaseError('resolveDocumentUrl', error);
  doc.fileUrl = data.signedUrl;
  return doc;
}

async function fetchDocumentsForCerts(
  certIds: string[],
): Promise<Map<string, CertDocument[]>> {
  const map = new Map<string, CertDocument[]>();
  if (certIds.length === 0) return map;

  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('therapist_specialty_documents')
    .select('*')
    .in('certification_id', certIds)
    .order('uploaded_at', { ascending: false });

  if (error) wrapSupabaseError('listCertificationDocuments', error);

  for (const row of (data ?? []) as CertDocumentRow[]) {
    const doc = await resolveDocumentUrl(row);
    const list = map.get(row.certification_id) ?? [];
    list.push(doc);
    map.set(row.certification_id, list);
  }
  return map;
}

async function mapCertRows(rows: CertificationRow[]): Promise<Certification[]> {
  const docsMap = await fetchDocumentsForCerts(rows.map(r => r.id));
  return rows.map(row => {
    const cert = mapCertification(row, []);
    cert.documents = docsMap.get(row.id) ?? [];
    return cert;
  });
}

async function mapSingleCert(row: CertificationRow): Promise<Certification> {
  const [cert] = await mapCertRows([row]);
  return cert;
}

export async function listCertifications(): Promise<Certification[]> {
  const client = requireSupabaseClient();
  const userId = await requireAuthUserId(client);

  const { data, error } = await client
    .from('therapist_specialty_certifications')
    .select('*')
    .eq('therapist_id', userId)
    .order('updated_at', { ascending: false });

  if (error) wrapSupabaseError('listCertifications', error);
  return mapCertRows((data ?? []) as CertificationRow[]);
}

export async function adminListCertifications(): Promise<Certification[]> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const { data, error } = await client
    .from('therapist_specialty_certifications')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) wrapSupabaseError('adminListCertifications', error);
  return mapCertRows((data ?? []) as CertificationRow[]);
}

export async function listCertificationDocuments(certificationId: string): Promise<CertDocument[]> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const { data, error } = await client
    .from('therapist_specialty_documents')
    .select('*')
    .eq('certification_id', certificationId)
    .order('uploaded_at', { ascending: false });

  if (error) wrapSupabaseError('listCertificationDocuments', error);
  return Promise.all(((data ?? []) as CertDocumentRow[]).map(resolveDocumentUrl));
}

export async function submitCertification(input: {
  specialtyId: string;
  yearsOfExperience: number;
  experienceDescription?: string;
  trainingInstitution?: string;
  trainingCompletedDate?: string;
  notes?: string;
}): Promise<Certification> {
  const client = requireSupabaseClient();
  const userId = await requireAuthUserId(client);

  const { data: existing, error: existingError } = await client
    .from('therapist_specialty_certifications')
    .select('*')
    .eq('therapist_id', userId)
    .eq('specialty_id', input.specialtyId)
    .maybeSingle();

  if (existingError) wrapSupabaseError('submitCertification.lookup', existingError);

  const existingRow = existing as CertificationRow | null;
  if (existingRow && (existingRow.status === 'approved' || existingRow.status === 'pending')) {
    throw new Error('Certification already submitted or approved');
  }

  const payload = {
    therapist_id: userId,
    specialty_id: input.specialtyId,
    status: 'pending' as const,
    years_of_experience: input.yearsOfExperience,
    experience_description: input.experienceDescription ?? null,
    training_institution: input.trainingInstitution ?? null,
    training_completed_date: input.trainingCompletedDate ?? null,
    notes: input.notes ?? null,
    submitted_at: new Date().toISOString(),
    admin_notes: null,
    reviewed_at: null,
    reviewed_by: null,
  };

  let certRow: CertificationRow;

  if (existingRow) {
    const { data, error } = await client
      .from('therapist_specialty_certifications')
      .update(payload)
      .eq('id', existingRow.id)
      .select('*')
      .single();
    if (error) wrapSupabaseError('submitCertification.update', error);
    certRow = data as CertificationRow;
  } else {
    const { data, error } = await client
      .from('therapist_specialty_certifications')
      .insert(payload)
      .select('*')
      .single();
    if (error) wrapSupabaseError('submitCertification.insert', error);
    certRow = data as CertificationRow;
  }

  return mapSingleCert(certRow);
}

export async function uploadCertificationDocument(
  certId: string,
  file: File,
): Promise<CertDocument> {
  const client = requireSupabaseClient();
  const userId = await requireAuthUserId(client);

  const { data: cert, error: certError } = await client
    .from('therapist_specialty_certifications')
    .select('id, therapist_id, status')
    .eq('id', certId)
    .single();

  if (certError) wrapSupabaseError('uploadCertificationDocument.lookup', certError);
  if (cert.therapist_id !== userId) {
    throw new Error('[Supabase] Cannot upload document for another therapist certification');
  }
  if (cert.status === 'approved') {
    throw new Error('[Supabase] Cannot add documents to an approved certification');
  }

  const mimeType = fileToMime(file);
  const fileType = mimeToFileType(mimeType);
  const storagePath = certificationStoragePath(userId, certId, file.name);

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: mimeType, upsert: false });

  if (uploadError) wrapSupabaseError('uploadCertificationDocument.storage', uploadError);

  const { data: docRow, error: insertError } = await client
    .from('therapist_specialty_documents')
    .insert({
      certification_id: certId,
      storage_path: storagePath,
      file_url: null,
      file_name: file.name,
      mime_type: mimeType,
      file_type: fileType,
      file_size: file.size,
    })
    .select('*')
    .single();

  if (insertError) {
    await client.storage.from(BUCKET).remove([storagePath]);
    wrapSupabaseError('uploadCertificationDocument.insert', insertError);
  }

  return resolveDocumentUrl(docRow as CertDocumentRow);
}

export async function uploadCertificationDocuments(
  certId: string,
  files: File[],
): Promise<CertDocument[]> {
  const results: CertDocument[] = [];
  for (const file of files) {
    results.push(await uploadCertificationDocument(certId, file));
  }
  return results;
}

export async function addCertificationDocuments(
  certId: string,
  files: File[],
): Promise<CertDocument[]> {
  return uploadCertificationDocuments(certId, files);
}

export async function adminReviewCertification(
  id: string,
  status: 'approved' | 'rejected',
  adminNotes?: string,
): Promise<Certification> {
  const client = requireSupabaseClient();
  const userId = await requireAuthUserId(client);

  const expiresAt =
    status === 'approved'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const { data, error } = await client
    .from('therapist_specialty_certifications')
    .update({
      status,
      admin_notes: adminNotes ?? null,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      expires_at: expiresAt,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) wrapSupabaseError('adminReviewCertification', error);

  return mapSingleCert(data as CertificationRow);
}
