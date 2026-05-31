/**
 * Specialties service — mock-backed, Supabase-ready.
 * Replace mock implementations with supabase queries when credentials exist.
 */

import {
  SPECIALTIES,
  SPECIALTY_REQUESTS,
} from '@/data/mock-data';
import { supabase } from '@/lib/supabaseClient';
import { getMyCertifications } from '@/services/certificationsService';
import type { Specialty, SpecialtyRequest } from '@/types';

const delay = (ms = 120) => new Promise<void>(r => setTimeout(r, ms));

let specialtiesStore = [...SPECIALTIES];
let requestsStore = [...SPECIALTY_REQUESTS];

export async function getSpecialties(): Promise<Specialty[]> {
  if (supabase) {
    // TODO: const { data } = await supabase.from('radionics_specialties').select('*').eq('is_active', true);
    throw new Error('Supabase not wired yet');
  }
  await delay();
  return specialtiesStore.map(s => ({ ...s }));
}

export async function getMySpecialtyRequests(): Promise<SpecialtyRequest[]> {
  if (supabase) throw new Error('Supabase not wired yet');
  await delay();
  return requestsStore.filter(r => r.therapistId === 'therapist-001').map(r => ({ ...r }));
}

export async function getAllSpecialtyRequests(): Promise<SpecialtyRequest[]> {
  if (supabase) throw new Error('Supabase not wired yet');
  await delay();
  return requestsStore.map(r => ({ ...r }));
}

export async function proposeSpecialty(input: {
  proposedName: string;
  proposedSlug?: string;
  description?: string;
  category?: string;
  notes?: string;
}): Promise<SpecialtyRequest> {
  if (supabase) throw new Error('Supabase not wired yet');
  await delay();

  const req: SpecialtyRequest = {
    id: `sreq-${Date.now()}`,
    therapistId: 'therapist-001',
    proposedName: input.proposedName,
    proposedSlug: input.proposedSlug,
    description: input.description,
    category: input.category,
    notes: input.notes,
    status: 'pending_review',
    submittedAt: new Date().toISOString(),
  };
  requestsStore = [req, ...requestsStore];
  return req;
}

export async function reviewSpecialtyRequest(
  id: string,
  status: 'approved' | 'rejected',
  adminNotes?: string,
): Promise<SpecialtyRequest> {
  if (supabase) throw new Error('Supabase not wired yet');
  await delay();

  const idx = requestsStore.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Request not found');

  const updated: SpecialtyRequest = {
    ...requestsStore[idx],
    status,
    adminNotes,
    reviewedBy: 'admin-001',
    reviewedAt: new Date().toISOString(),
  };
  requestsStore[idx] = updated;

  if (status === 'approved') {
    const slug = updated.proposedSlug ?? updated.proposedName.toLowerCase().replace(/\s+/g, '-');
    specialtiesStore = [
      ...specialtiesStore,
      {
        id: `spec-${Date.now()}`,
        name: updated.proposedName,
        slug,
        description: updated.description,
        category: updated.category,
        requiresCertification: true,
        isActive: true,
        toolCount: 0,
        certificationStatus: 'not_certified',
      },
    ];
  }

  return updated;
}

/** Approved specialties only — for session wizard */
export async function getApprovedSpecialties(): Promise<Specialty[]> {
  const [specialties, certs] = await Promise.all([getSpecialties(), getMyCertifications()]);
  const approvedIds = new Set(
    certs.filter(c => c.status === 'approved').map(c => c.specialtyId),
  );
  return specialties.filter(s => approvedIds.has(s.id));
}
