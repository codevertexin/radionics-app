/**
 * Radionics admin role — dev Supabase uses is_radionics_admin() / allowlist.
 * Production: replace with HUB/Auth Core claims (see docs).
 */

import { isMockMode, isSupabaseMode, requireSupabaseClient } from '@/lib/dataMode';
import { requireAuthUserId } from '@/lib/supabase/auth';

export type RadionicsRole = 'admin' | 'therapist';

/** Mock: true for local QA. Supabase: RPC is_radionics_admin() only. */
export async function isCurrentUserRadionicsAdmin(): Promise<boolean> {
  if (isMockMode()) return true;

  if (!isSupabaseMode()) return false;

  const client = requireSupabaseClient();

  try {
    await requireAuthUserId(client);
  } catch {
    return false;
  }

  const { data, error } = await client.rpc('is_radionics_admin');

  if (error) {
    console.warn('[Supabase] isCurrentUserRadionicsAdmin:', error.message);
    return false;
  }

  return Boolean(data);
}

export async function getCurrentUserRadionicsRole(): Promise<RadionicsRole> {
  const isAdmin = await isCurrentUserRadionicsAdmin();
  return isAdmin ? 'admin' : 'therapist';
}
