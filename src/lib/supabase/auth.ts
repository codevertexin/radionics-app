import type { SupabaseClient } from '@supabase/supabase-js';
import { throwSupabaseError } from '@/lib/supabase/errors';

export async function requireAuthUserId(client: SupabaseClient): Promise<string> {
  const { data, error } = await client.auth.getUser();
  if (error) throwSupabaseError('auth.getUser', error);
  if (!data.user) {
    throw new Error(
      '[Supabase Auth] Sessão não autenticada. Inicie sessão Supabase para usar VITE_DATA_MODE=supabase.',
    );
  }
  return data.user.id;
}
