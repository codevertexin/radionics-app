import { queryClient } from '@/lib/queryClient';
import { resetCertificationsStore } from '@/services/certificationsService';
import { resetSessionsStore } from '@/services/sessionsService';
import { resetSpecialtiesStores } from '@/services/specialtiesService';

const SENSITIVE_QUERY_PREFIXES = [
  'sessions',
  'session',
  'specialties',
  'my-certifications',
  'all-certifications',
  'my-specialty-requests',
  'all-specialty-requests',
  'approved-specialties',
  'profile',
  'certifications',
] as const;

/** Wipe client-side user data after logout (cache + in-memory mock stores). */
export function clearUserState(): void {
  queryClient.clear();

  for (const prefix of SENSITIVE_QUERY_PREFIXES) {
    queryClient.removeQueries({ queryKey: [prefix] });
  }

  resetSessionsStore();
  resetSpecialtiesStores();
  resetCertificationsStore();
}
