import { requireSupabaseClient } from '@/lib/dataMode';
import { resolveSpecialtySlug } from '@/lib/slug';
import { requireAuthUserId } from '@/lib/supabase/auth';
import { wrapSupabaseError } from '@/lib/supabase/errors';
import {
  mapSpecialty,
  mapSpecialtyRequest,
  type SpecialtyRequestRow,
  type SpecialtyRow,
} from '@/lib/supabase/mappers';
import type { Specialty, SpecialtyRequest } from '@/types';

export async function listSpecialties(): Promise<Specialty[]> {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('radionics_specialties')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) wrapSupabaseError('listSpecialties', error);
  return (data as SpecialtyRow[]).map(mapSpecialty);
}

export async function listSpecialtyRequests(): Promise<SpecialtyRequest[]> {
  const client = requireSupabaseClient();
  const userId = await requireAuthUserId(client);

  const { data, error } = await client
    .from('radionics_specialty_requests')
    .select('*')
    .eq('therapist_id', userId)
    .order('submitted_at', { ascending: false });

  if (error) wrapSupabaseError('listSpecialtyRequests', error);
  return (data as SpecialtyRequestRow[]).map(mapSpecialtyRequest);
}

export async function adminListSpecialtyRequests(): Promise<SpecialtyRequest[]> {
  const client = requireSupabaseClient();
  await requireAuthUserId(client);

  const { data, error } = await client
    .from('radionics_specialty_requests')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) wrapSupabaseError('adminListSpecialtyRequests', error);
  return (data as SpecialtyRequestRow[]).map(mapSpecialtyRequest);
}

export async function proposeSpecialty(input: {
  proposedName: string;
  proposedSlug?: string;
  description?: string;
  category?: string;
  notes?: string;
}): Promise<SpecialtyRequest> {
  const client = requireSupabaseClient();
  const userId = await requireAuthUserId(client);

  const proposedSlug = resolveSpecialtySlug(input.proposedName, input.proposedSlug);

  const { data, error } = await client
    .from('radionics_specialty_requests')
    .insert({
      therapist_id: userId,
      proposed_name: input.proposedName,
      proposed_slug: proposedSlug,
      description: input.description,
      category: input.category,
      notes: input.notes,
      status: 'pending_review',
    })
    .select('*')
    .single();

  if (error) wrapSupabaseError('proposeSpecialty', error);
  return mapSpecialtyRequest(data as SpecialtyRequestRow);
}

export async function adminReviewSpecialtyRequest(
  id: string,
  status: 'approved' | 'rejected',
  adminNotes?: string,
): Promise<SpecialtyRequest> {
  const client = requireSupabaseClient();
  const userId = await requireAuthUserId(client);

  const { data: existing, error: fetchError } = await client
    .from('radionics_specialty_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) wrapSupabaseError('adminReviewSpecialtyRequest.fetch', fetchError);

  const { data, error } = await client
    .from('radionics_specialty_requests')
    .update({
      status,
      admin_notes: adminNotes ?? null,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) wrapSupabaseError('adminReviewSpecialtyRequest.update', error);

  if (status === 'approved') {
    const row = existing as SpecialtyRequestRow;
    const slug = resolveSpecialtySlug(row.proposed_name, row.proposed_slug ?? undefined);

    const { error: insertError } = await client.from('radionics_specialties').insert({
      name: row.proposed_name,
      slug,
      description: row.description,
      category: row.category,
      requires_certification: true,
      tool_count: 0,
      status: 'active',
    });

    if (insertError && insertError.code !== '23505') {
      wrapSupabaseError('adminReviewSpecialtyRequest.createSpecialty', insertError);
    }
  }

  return mapSpecialtyRequest(data as SpecialtyRequestRow);
}
