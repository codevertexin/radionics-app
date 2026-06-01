/**
 * Specialties service — mock-backed or Supabase (VITE_DATA_MODE).
 */

import { SPECIALTIES, SPECIALTY_REQUESTS } from '@/data/mock-data';
import { isSupabaseMode } from '@/lib/dataMode';
import { resolveSpecialtySlug } from '@/lib/slug';
import { getMyCertifications } from '@/services/certificationsService';
import * as supabaseSpecialties from '@/services/supabase/specialtiesSupabase';
import type { Specialty, SpecialtyRequest } from '@/types';

const delay = (ms = 120) => new Promise<void>(r => setTimeout(r, ms));

let specialtiesStore = [...SPECIALTIES];
let requestsStore = [...SPECIALTY_REQUESTS];

// ─── Mock implementations ─────────────────────────────────────

async function mockGetSpecialties(): Promise<Specialty[]> {
  await delay();
  return specialtiesStore.map(s => ({ ...s }));
}

async function mockGetMySpecialtyRequests(): Promise<SpecialtyRequest[]> {
  await delay();
  return requestsStore.filter(r => r.therapistId === 'therapist-001').map(r => ({ ...r }));
}

async function mockGetAllSpecialtyRequests(): Promise<SpecialtyRequest[]> {
  await delay();
  return requestsStore.map(r => ({ ...r }));
}

async function mockProposeSpecialty(input: {
  proposedName: string;
  proposedSlug?: string;
  description?: string;
  category?: string;
  notes?: string;
}): Promise<SpecialtyRequest> {
  await delay();

  const req: SpecialtyRequest = {
    id: `sreq-${Date.now()}`,
    therapistId: 'therapist-001',
    proposedName: input.proposedName,
    proposedSlug: resolveSpecialtySlug(input.proposedName, input.proposedSlug),
    description: input.description,
    category: input.category,
    notes: input.notes,
    status: 'pending_review',
    submittedAt: new Date().toISOString(),
  };
  requestsStore = [req, ...requestsStore];
  return req;
}

async function mockReviewSpecialtyRequest(
  id: string,
  status: 'approved' | 'rejected',
  adminNotes?: string,
): Promise<SpecialtyRequest> {
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
    const slug = resolveSpecialtySlug(updated.proposedName, updated.proposedSlug);
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

// ─── Public API (Phase 2A names + UI aliases) ─────────────────

export async function listSpecialties(): Promise<Specialty[]> {
  if (isSupabaseMode()) return supabaseSpecialties.listSpecialties();
  return mockGetSpecialties();
}

export async function listSpecialtyRequests(): Promise<SpecialtyRequest[]> {
  if (isSupabaseMode()) return supabaseSpecialties.listSpecialtyRequests();
  return mockGetMySpecialtyRequests();
}

export async function adminListSpecialtyRequests(): Promise<SpecialtyRequest[]> {
  if (isSupabaseMode()) return supabaseSpecialties.adminListSpecialtyRequests();
  return mockGetAllSpecialtyRequests();
}

export async function proposeSpecialty(input: {
  proposedName: string;
  proposedSlug?: string;
  description?: string;
  category?: string;
  notes?: string;
}): Promise<SpecialtyRequest> {
  const normalized = {
    ...input,
    proposedSlug: resolveSpecialtySlug(input.proposedName, input.proposedSlug),
  };
  if (isSupabaseMode()) return supabaseSpecialties.proposeSpecialty(normalized);
  return mockProposeSpecialty(normalized);
}

export async function adminReviewSpecialtyRequest(
  id: string,
  status: 'approved' | 'rejected',
  adminNotes?: string,
): Promise<SpecialtyRequest> {
  if (isSupabaseMode()) return supabaseSpecialties.adminReviewSpecialtyRequest(id, status, adminNotes);
  return mockReviewSpecialtyRequest(id, status, adminNotes);
}

/** @deprecated Use listSpecialties — kept for existing UI imports */
export const getSpecialties = listSpecialties;

/** @deprecated Use listSpecialtyRequests */
export const getMySpecialtyRequests = listSpecialtyRequests;

/** @deprecated Use adminListSpecialtyRequests */
export const getAllSpecialtyRequests = adminListSpecialtyRequests;

/** @deprecated Use adminReviewSpecialtyRequest */
export const reviewSpecialtyRequest = adminReviewSpecialtyRequest;

export async function getApprovedSpecialties(): Promise<Specialty[]> {
  const [specialties, certs] = await Promise.all([listSpecialties(), getMyCertifications()]);
  const approvedIds = new Set(
    certs.filter(c => c.status === 'approved').map(c => c.specialtyId),
  );
  return specialties.filter(s => approvedIds.has(s.id));
}

/** Reset in-memory mock stores — e.g. after logout. */
export function resetSpecialtiesStores(): void {
  specialtiesStore = [...SPECIALTIES];
  requestsStore = [...SPECIALTY_REQUESTS];
}
