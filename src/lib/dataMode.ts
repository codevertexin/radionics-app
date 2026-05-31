import { supabase } from '@/lib/supabaseClient';

export type DataMode = 'mock' | 'supabase';

/** Explicit data source — defaults to mock. */
export function getDataMode(): DataMode {
  const mode = import.meta.env.VITE_DATA_MODE as string | undefined;
  return mode === 'supabase' ? 'supabase' : 'mock';
}

export function isMockMode(): boolean {
  return getDataMode() === 'mock';
}

export function isSupabaseMode(): boolean {
  return getDataMode() === 'supabase';
}

/** Call at the start of Supabase branches in services. */
export function requireSupabaseClient(): NonNullable<typeof supabase> {
  if (!isSupabaseMode()) {
    throw new Error('Supabase path invoked while VITE_DATA_MODE=mock');
  }
  if (!supabase) {
    throw new Error(
      'VITE_DATA_MODE=supabase but VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing',
    );
  }
  return supabase;
}

/** Standard error when Supabase mode is on but queries are not implemented yet. */
export function supabaseNotWired(feature: string): never {
  throw new Error(
    `[Supabase] ${feature} is not implemented yet. Apply migrations and wire the service, or set VITE_DATA_MODE=mock.`,
  );
}

/** UI copy — mock saves are in-memory only (lost on full page refresh). */
export const MOCK_SAVE_LABELS = {
  saved: 'Guardado localmente',
  saving: 'A guardar localmente…',
  unsaved: 'Alterações não guardadas',
  unsavedShort: 'Não guardado',
  savedNow: 'Guardado localmente agora',
  savedAgo: (seconds: number) =>
    seconds < 60 ? `Guardado localmente há ${seconds}s` : `Guardado localmente há ${Math.floor(seconds / 60)}m`,
  autoSave: 'Auto-guardado local',
  savedAt: (time: string) => `Guardado localmente às ${time}`,
} as const;
