import { isSupabaseMode, requireSupabaseClient } from '@/lib/dataMode';

export const REQUESTER_UNAVAILABLE_NAME = 'Nome indisponível';
export const REQUESTER_UNAVAILABLE_EMAIL = 'Email indisponível';

export type RequesterProfile = {
  userId: string;
  requesterName: string;
  requesterEmail: string;
};

/** Mock/dev display only — not source of truth. */
const MOCK_THERAPIST_PROFILES: Record<string, RequesterProfile> = {
  'therapist-001': {
    userId: 'therapist-001',
    requesterName: 'Ana Beatriz Santos',
    requesterEmail: 'ana.santos@radionics.io',
  },
};

type RequesterRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
};

export async function fetchRequesterProfiles(userIds: string[]): Promise<Map<string, RequesterProfile>> {
  const map = new Map<string, RequesterProfile>();
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return map;

  if (!isSupabaseMode()) {
    for (const id of unique) {
      const mock = MOCK_THERAPIST_PROFILES[id];
      map.set(id, mock ?? {
        userId: id,
        requesterName: REQUESTER_UNAVAILABLE_NAME,
        requesterEmail: REQUESTER_UNAVAILABLE_EMAIL,
      });
    }
    return map;
  }

  const client = requireSupabaseClient();
  const { data, error } = await client.rpc('radionics_admin_requester_profiles', {
    p_user_ids: unique,
  });

  if (error) {
    console.warn('[Supabase] radionics_admin_requester_profiles:', error.message);
    for (const id of unique) {
      map.set(id, {
        userId: id,
        requesterName: REQUESTER_UNAVAILABLE_NAME,
        requesterEmail: REQUESTER_UNAVAILABLE_EMAIL,
      });
    }
    return map;
  }

  for (const row of (data ?? []) as RequesterRow[]) {
    map.set(row.user_id, {
      userId: row.user_id,
      requesterName: row.display_name?.trim() || REQUESTER_UNAVAILABLE_NAME,
      requesterEmail: row.email?.trim() || REQUESTER_UNAVAILABLE_EMAIL,
    });
  }

  for (const id of unique) {
    if (!map.has(id)) {
      map.set(id, {
        userId: id,
        requesterName: REQUESTER_UNAVAILABLE_NAME,
        requesterEmail: REQUESTER_UNAVAILABLE_EMAIL,
      });
    }
  }

  return map;
}

export function attachRequesterFields<T extends { therapistId: string }>(
  items: T[],
  profiles: Map<string, RequesterProfile>,
): (T & { requesterName: string; requesterEmail: string })[] {
  return items.map(item => {
    const profile = profiles.get(item.therapistId);
    return {
      ...item,
      requesterName: profile?.requesterName ?? REQUESTER_UNAVAILABLE_NAME,
      requesterEmail: profile?.requesterEmail ?? REQUESTER_UNAVAILABLE_EMAIL,
    };
  });
}
