/**
 * useSessionState — central session state hook
 *
 * Owns all mutable session data. Computes stage completion rules.
 * Produces a Supabase-ready snapshot (field names match radionics_session_details).
 *
 * NOTE: Browser audio API not wired — voice note recording is mock-only.
 */
import { useState, useCallback, useMemo } from 'react';
import type { ToolResult, ToolIntensity, VoiceNote, SessionStateSnapshot, FieldValue } from '@/types';
import { getToolsByMethodology } from '@/data/mock-data';

// ── Stage completion rules ─────────────────────────────────────
export interface StageCompletion {
  preparation: boolean;  // hawkinsInitial set
  connection: boolean;   // always passable (no required inputs)
  diagnosis: boolean;    // every tool is analyzed/skipped (none left as not_analyzed or in_analysis)
  activations: boolean;  // every identified tool has been activated or skipped in activations
  closing: boolean;      // hawkinsFinal set AND reverbDays set
}

// ── Hook return type ───────────────────────────────────────────
export interface SessionState {
  toolResults: ToolResult[];
  hawkinsInitial: number | null;
  hawkinsFinal: number | null;
  reverbDays: number | null;
  fieldValues: Record<string, FieldValue>;

  setToolResult: (toolId: string, patch: Partial<Omit<ToolResult, 'toolId'>>) => void;
  setHawkinsInitial: (v: number | null) => void;
  setHawkinsFinal: (v: number | null) => void;
  setReverbDays: (v: number | null) => void;

  /** Set a field value by fieldCode */
  setFieldValue: (fieldId: string, value: FieldValue) => void;
  /** Get a field value by fieldCode (undefined if not set) */
  getFieldValue: (fieldId: string) => FieldValue | undefined;

  /** Upsert a voice note on a tool result */
  addVoiceNote: (toolId: string, note: Omit<VoiceNote, 'id' | 'createdAt'>) => void;

  stageCompletion: StageCompletion;
  sessionSnapshot: SessionStateSnapshot;
}

let _noteId = 0;
const nextNoteId = () => `vn-${++_noteId}-${Date.now()}`;

export function useSessionState(session: {
  id: string;
  methodologyId: string;
  hawkinsInitial?: number;
  hawkinsFinal?: number;
  reverberationDays?: number;
}): SessionState {
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const [hawkinsInitial, setHawkinsInitial] = useState<number | null>(session.hawkinsInitial ?? null);
  const [hawkinsFinal, setHawkinsFinal] = useState<number | null>(session.hawkinsFinal ?? null);
  const [reverbDays, setReverbDays] = useState<number | null>(session.reverberationDays ?? null);
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>({});

  // ── Upsert a ToolResult ──────────────────────────────────────
  const setToolResult = useCallback((toolId: string, patch: Partial<Omit<ToolResult, 'toolId'>>) => {
    setToolResults(prev => {
      const existing = prev.find(r => r.toolId === toolId);
      if (existing) {
        return prev.map(r => r.toolId === toolId ? { ...r, ...patch } : r);
      }
      // Bootstrap from mock tool data
      const tools = getToolsByMethodology(session.methodologyId);
      const tool = tools.find(t => t.id === toolId);
      const base: ToolResult = {
        toolId,
        toolName: tool?.name ?? toolId,
        toolImageUrl: tool?.imageUrl ?? '',
        status: 'not_analyzed',
        ...patch,
      };
      return [...prev, base];
    });
  }, [session.methodologyId]);

  // ── Field values ─────────────────────────────────────────────
  const setFieldValue = useCallback((fieldId: string, value: FieldValue) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  const getFieldValue = useCallback((fieldId: string): FieldValue | undefined => {
    return fieldValues[fieldId];
  }, [fieldValues]);

  // ── Add voice note ───────────────────────────────────────────
  const addVoiceNote = useCallback((toolId: string, note: Omit<VoiceNote, 'id' | 'createdAt'>) => {
    const full: VoiceNote = { ...note, id: nextNoteId(), createdAt: new Date().toISOString() };
    setToolResult(toolId, {});  // ensure entry exists
    setToolResults(prev => prev.map(r =>
      r.toolId === toolId
        ? { ...r, voiceNotes: [...(r.voiceNotes ?? []), full] }
        : r
    ));
  }, [setToolResult]);

  // ── Stage completion ─────────────────────────────────────────
  const stageCompletion = useMemo<StageCompletion>(() => {
    const tools = getToolsByMethodology(session.methodologyId);

    // diagnosis: all tools must not be 'not_analyzed' or 'in_analysis'
    const diagnosisDone = tools.length > 0 && tools.every(t => {
      const r = toolResults.find(x => x.toolId === t.id);
      const s = r?.status ?? 'not_analyzed';
      return s !== 'not_analyzed' && s !== 'in_analysis';
    });

    // activations: every tool that was 'identified' must now be 'activated' or 'skipped'
    // (tools that were directly 'activated' in diagnosis also count)
    const identifiedInDiagnosis = toolResults.filter(r =>
      r.status === 'identified' || r.status === 'activated'
    );
    const activationsDone = identifiedInDiagnosis.length > 0 &&
      identifiedInDiagnosis.every(r => r.status === 'activated' || r.status === 'skipped');

    return {
      preparation: hawkinsInitial !== null,
      connection: true,
      diagnosis: diagnosisDone,
      activations: activationsDone,
      closing: hawkinsFinal !== null && reverbDays !== null,
    };
  }, [toolResults, hawkinsInitial, hawkinsFinal, reverbDays, session.methodologyId]);

  // ── Supabase-ready snapshot ──────────────────────────────────
  const sessionSnapshot = useMemo<SessionStateSnapshot>(() => ({
    session_id: session.id,
    hawkins_initial: hawkinsInitial,
    hawkins_final: hawkinsFinal,
    reverberation_days: reverbDays,
    tool_results: toolResults,
    identified_tool_ids: toolResults.filter(r => r.status === 'identified' || r.status === 'activated').map(r => r.toolId),
    activated_tool_ids: toolResults.filter(r => r.status === 'activated').map(r => r.toolId),
    field_values: fieldValues,
    stage_completion: { ...stageCompletion },
    updated_at: new Date().toISOString(),
  }), [session.id, hawkinsInitial, hawkinsFinal, reverbDays, toolResults, fieldValues, stageCompletion]);

  return {
    toolResults,
    hawkinsInitial,
    hawkinsFinal,
    reverbDays,
    fieldValues,
    setToolResult,
    setHawkinsInitial,
    setHawkinsFinal,
    setReverbDays,
    setFieldValue,
    getFieldValue,
    addVoiceNote,
    stageCompletion,
    sessionSnapshot,
  };
}
