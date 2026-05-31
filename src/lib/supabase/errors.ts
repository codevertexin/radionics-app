import type { AuthError, PostgrestError } from '@supabase/supabase-js';

export function throwSupabaseError(context: string, error: PostgrestError | AuthError | { message: string }): never {
  const details = 'details' in error && error.details ? ` — ${error.details}` : '';
  const hint = 'hint' in error && error.hint ? ` (${error.hint})` : '';
  throw new Error(`[Supabase] ${context}: ${error.message}${details}${hint}`);
}

export function wrapSupabaseError(context: string, error: PostgrestError | { message: string; code?: string }): never {
  if ('code' in error && error.code === '42P01') {
    throw new Error(
      `[Supabase] ${context}: database schema not found. Apply Phase 1 migrations or set VITE_DATA_MODE=mock.`,
    );
  }
  if (error.message.includes('does not exist')) {
    throw new Error(
      `[Supabase] ${context}: database schema not found. Apply Phase 1 migrations or set VITE_DATA_MODE=mock.`,
    );
  }
  throwSupabaseError(context, error);
}
