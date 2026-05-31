/**
 * Sessions service — mock-backed, Supabase-ready.
 */

import {
  SESSIONS,
  getSessionById as getMockSessionById,
  TEMPLATES,
  CLIENTS,
  METHODOLOGIES,
} from '@/data/mock-data';
import { supabase } from '@/lib/supabaseClient';
import type { Session, SessionMode } from '@/types';

const delay = (ms = 100) => new Promise<void>(r => setTimeout(r, ms));

let sessionsStore = [...SESSIONS];

export async function listSessions(): Promise<Session[]> {
  if (supabase) throw new Error('Supabase not wired yet');
  await delay();
  return sessionsStore.map(s => ({ ...s }));
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  if (supabase) throw new Error('Supabase not wired yet');
  await delay();
  return getMockSessionById(id) ?? sessionsStore.find(s => s.id === id);
}

export async function createSession(input: {
  clientId: string;
  specialtyId: string;
  templateId: string;
  sessionMode?: SessionMode;
  intention?: string;
}): Promise<Session> {
  if (supabase) throw new Error('Supabase not wired yet');
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
  return session;
}
