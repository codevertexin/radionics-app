/**
 * Sessions service — mock-backed, Supabase-ready.
 */

import { SESSIONS, TEMPLATES, CLIENTS, METHODOLOGIES } from '@/data/mock-data';
import { isSupabaseMode, supabaseNotWired } from '@/lib/dataMode';
import type { Session, SessionMode } from '@/types';

const delay = (ms = 100) => new Promise<void>(r => setTimeout(r, ms));

/** Shared in-memory store — seeded from mock-data, mutated at runtime in mock mode. */
let sessionsStore: Session[] = SESSIONS.map(s => ({ ...s }));

function cloneSession(session: Session): Session {
  return {
    ...session,
    stages: session.stages.map(stage => ({
      ...stage,
      steps: stage.steps?.map(step => ({ ...step })) ?? [],
    })),
  };
}

export async function listSessions(): Promise<Session[]> {
  if (isSupabaseMode()) supabaseNotWired('sessions.listSessions');
  await delay();
  return sessionsStore.map(cloneSession);
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  if (isSupabaseMode()) supabaseNotWired('sessions.getSessionById');
  await delay();
  const session = sessionsStore.find(s => s.id === id);
  return session ? cloneSession(session) : undefined;
}

export async function createSession(input: {
  clientId: string;
  specialtyId: string;
  templateId: string;
  sessionMode?: SessionMode;
  intention?: string;
}): Promise<Session> {
  if (isSupabaseMode()) supabaseNotWired('sessions.createSession');
  await delay();

  const client = CLIENTS.find(c => c.id === input.clientId);
  const methodology = METHODOLOGIES.find(m => m.id === input.specialtyId);
  const template = TEMPLATES.find(t => t.id === input.templateId);

  if (!client || !methodology || !template) {
    throw new Error('Invalid client, specialty or template');
  }

  const session: Session = {
    id: `sess-${Date.now()}`,
    clientId: client.id,
    clientName: client.name,
    therapistId: 'therapist-001',
    methodologyId: methodology.id,
    methodologyName: methodology.name,
    methodologyCode: methodology.code,
    templateId: template.id,
    templateName: template.name,
    status: 'draft',
    sessionMode: input.sessionMode ?? 'distance',
    intention: input.intention,
    stages: [
      { code: 'preparation', label: 'Preparação', status: 'not_started', steps: [] },
      { code: 'connection', label: 'Conexão', status: 'not_started', steps: [] },
      { code: 'diagnosis', label: 'Diagnóstico', status: 'not_started', steps: [] },
      { code: 'activations', label: 'Ativações', status: 'not_started', steps: [] },
      { code: 'closing', label: 'Encerramento', status: 'not_started', steps: [] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: new Date().toISOString(),
  };

  sessionsStore = [session, ...sessionsStore];
  return cloneSession(session);
}

/** Persist session changes to the in-memory mock store. */
export async function updateSession(id: string, patch: Partial<Session>): Promise<Session | undefined> {
  if (isSupabaseMode()) supabaseNotWired('sessions.updateSession');
  await delay();

  const idx = sessionsStore.findIndex(s => s.id === id);
  if (idx === -1) return undefined;

  sessionsStore[idx] = {
    ...sessionsStore[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return cloneSession(sessionsStore[idx]);
}

/** Reset store to seed data — useful for tests/dev. */
export function resetSessionsStore(): void {
  sessionsStore = SESSIONS.map(s => ({ ...s }));
}
