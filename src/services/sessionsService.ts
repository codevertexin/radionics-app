/**
 * Sessions service — in-memory mock store (Phase 3A).
 *
 * VITE_DATA_MODE=supabase: specialties/certifications use Supabase; sessions still
 * use this store until radionics_sessions is wired (no supabaseNotWired throw).
 */

import { SESSIONS, TEMPLATES, METHODOLOGIES } from '@/data/mock-data';
import { getClientById } from '@/services/clientsService';
import { resolveSpecialtyToMethodologyId } from '@/lib/sessionTemplates';
import { cloneToolResults, normalizeSessionWorkspace } from '@/lib/sessionWorkspace';
import type { Session, SessionMode } from '@/types';
import type { WorkflowStateDraft } from '@/lib/workflow-adapter/types';

const delay = (ms = 100) => new Promise<void>(r => setTimeout(r, ms));

/** Shared in-memory store — seeded from mock-data, mutated at runtime. */
let sessionsStore: Session[] = SESSIONS.map(s => ({ ...s }));

function cloneSession(session: Session): Session {
  return normalizeSessionWorkspace({
    ...session,
    stages: session.stages.map(stage => ({
      ...stage,
      steps: stage.steps?.map(step => ({
        ...step,
        toolResults: step.toolResults?.map(tr => ({ ...tr })),
      })) ?? [],
    })),
    toolResults: session.toolResults?.map(tr => ({ ...tr })),
    fieldValues: session.fieldValues ? { ...session.fieldValues } : undefined,
    workflowState: session.workflowState
      ? {
          ...session.workflowState,
          steps: Object.fromEntries(
            Object.entries(session.workflowState.steps).map(([code, step]) => [
              code,
              {
                ...step,
                outputs: step.outputs ? { ...step.outputs } : undefined,
              },
            ]),
          ),
          legacy: session.workflowState.legacy
            ? { ...session.workflowState.legacy }
            : undefined,
        }
      : undefined,
  });
}

export async function listSessions(): Promise<Session[]> {
  await delay();
  return sessionsStore.map(cloneSession);
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  await delay();
  const session = sessionsStore.find(s => s.id === id);
  return session ? cloneSession(session) : undefined;
}

export interface CreateSessionInput {
  clientId: string;
  specialtyId: string;
  specialtyName: string;
  specialtySlug: string;
  templateId: string;
  templateName: string;
  sessionMode?: SessionMode;
  intention?: string;
  executionMode?: 'legacy' | 'workflow';
  workflowTemplateId?: string;
  workflowTemplateSlug?: string;
  workflowTemplateName?: string;
  workflowVersion?: string;
  workflowState?: WorkflowStateDraft;
}

export async function createSession(input: CreateSessionInput): Promise<Session> {
  await delay();

  const client = await getClientById(input.clientId);
  if (!client) {
    throw new Error('Cliente inválido');
  }

  const isWorkflow = input.executionMode === 'workflow';

  if (!isWorkflow) {
    const template = TEMPLATES.find(t => t.id === input.templateId);
    if (!template) {
      throw new Error('Cliente ou template inválido');
    }
  }

  const methodologyKey = resolveSpecialtyToMethodologyId({
    id: input.specialtyId,
    slug: input.specialtySlug,
  });
  const methodology = METHODOLOGIES.find(m => m.id === methodologyKey);

  const now = new Date().toISOString();

  const session: Session = {
    id: `sess-${Date.now()}`,
    clientId: client.id,
    clientName: client.name,
    therapistId: 'therapist-001',
    specialtyId: input.specialtyId,
    specialtyName: input.specialtyName,
    specialtySlug: input.specialtySlug,
    methodologyId: methodology?.id ?? methodologyKey,
    methodologyName: methodology?.name ?? input.specialtyName,
    methodologyCode: methodology?.code ?? input.specialtySlug.toUpperCase().replace(/-/g, '_'),
    templateId: input.templateId,
    templateName: input.templateName,
    status: 'draft',
    sessionMode: input.sessionMode ?? 'distance',
    intention: input.intention,
    executionMode: input.executionMode ?? 'legacy',
    stages: [
      { code: 'preparation', label: 'Preparação', status: 'not_started', steps: [] },
      { code: 'connection', label: 'Conexão', status: 'not_started', steps: [] },
      { code: 'diagnosis', label: 'Diagnóstico', status: 'not_started', steps: [] },
      { code: 'activations', label: 'Ativações', status: 'not_started', steps: [] },
      { code: 'closing', label: 'Encerramento', status: 'not_started', steps: [] },
    ],
    toolResults: [],
    fieldValues: {},
    createdAt: now,
    updatedAt: now,
    scheduledAt: now,
  };

  if (isWorkflow) {
    session.executionMode = 'workflow';
    session.workflowTemplateId = input.workflowTemplateId;
    session.workflowTemplateSlug = input.workflowTemplateSlug;
    session.workflowTemplateName = input.workflowTemplateName ?? input.templateName;
    session.workflowVersion = input.workflowVersion;
    session.workflowState = input.workflowState
      ? {
          ...input.workflowState,
          legacy: {
            ...input.workflowState.legacy,
            executionMode: 'workflow',
          },
        }
      : undefined;
  }

  sessionsStore = [session, ...sessionsStore];
  return cloneSession(session);
}

/** Persist session changes to the in-memory mock store. */
export async function updateSession(id: string, patch: Partial<Session>): Promise<Session | undefined> {
  await delay();

  const idx = sessionsStore.findIndex(s => s.id === id);
  if (idx === -1) return undefined;

  const prev = sessionsStore[idx];
  sessionsStore[idx] = normalizeSessionWorkspace({
    ...prev,
    ...patch,
    toolResults: patch.toolResults !== undefined
      ? cloneToolResults(patch.toolResults)
      : prev.toolResults,
    fieldValues: patch.fieldValues !== undefined
      ? { ...patch.fieldValues }
      : prev.fieldValues,
    updatedAt: new Date().toISOString(),
  });
  return cloneSession(sessionsStore[idx]);
}

/** Reset store to seed data — useful for tests/dev/logout. */
export function resetSessionsStore(): void {
  sessionsStore = SESSIONS.map(s => ({ ...s }));
}
