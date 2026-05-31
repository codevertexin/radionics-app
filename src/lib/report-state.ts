// ============================================================
// Report State Hook — Phase 5
// Supabase-ready structure, mock implementation
// ============================================================

import { useState, useCallback, useRef } from 'react';
import type {
  ReportV2, ReportSection, ReportSectionCode, SectionVisibility,
  ReportStatus, SourceTrace
} from '@/types';

export type ReportSaveState = 'saved' | 'unsaved' | 'saving';

export interface UseReportStateReturn {
  report: ReportV2;
  saveState: ReportSaveState;
  activeSection: ReportSectionCode | null;
  setActiveSection: (code: ReportSectionCode | null) => void;

  // Section mutations
  updateSectionContent: (code: ReportSectionCode, content: string) => void;
  updateSectionVisibility: (code: ReportSectionCode, visibility: SectionVisibility) => void;
  applyAiDraft: (code: ReportSectionCode) => void;

  // Status flow
  setStatus: (status: ReportStatus) => void;
  saveDraft: () => void;
  submitForReview: () => void;
  approve: () => void;
  reopenForEditing: () => void;

  // Share
  shareViaHub: () => void;
  shareViaEmail: () => void;
  generatePortalLink: () => string;

  // AI
  isGeneratingAI: boolean;
  generateAIDraft: () => void;
}

const AUTO_SAVE_DELAY = 1500;

export function useReportState(initialReport: ReportV2): UseReportStateReturn {
  const [report, setReport] = useState<ReportV2>(initialReport);
  const [saveState, setSaveState] = useState<ReportSaveState>('saved');
  const [activeSection, setActiveSection] = useState<ReportSectionCode | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markUnsaved = useCallback(() => {
    setSaveState('unsaved');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setSaveState('saving');
      setTimeout(() => setSaveState('saved'), 800);
    }, AUTO_SAVE_DELAY);
  }, []);

  const updateSectionContent = useCallback((code: ReportSectionCode, content: string) => {
    setReport(r => ({
      ...r,
      sections: r.sections.map(s =>
        s.code === code
          ? { ...s, content, isDirty: true, sourceTrace: 'therapist_edit' as SourceTrace }
          : s
      ),
    }));
    markUnsaved();
  }, [markUnsaved]);

  const updateSectionVisibility = useCallback((code: ReportSectionCode, visibility: SectionVisibility) => {
    setReport(r => ({
      ...r,
      sections: r.sections.map(s => s.code === code ? { ...s, visibility } : s),
    }));
    markUnsaved();
  }, [markUnsaved]);

  const applyAiDraft = useCallback((code: ReportSectionCode) => {
    setReport(r => ({
      ...r,
      sections: r.sections.map(s =>
        s.code === code && s.aiDraft
          ? { ...s, content: s.aiDraft, sourceTrace: 'ai_draft' as SourceTrace, isDirty: true }
          : s
      ),
    }));
    markUnsaved();
  }, [markUnsaved]);

  const setStatus = useCallback((status: ReportStatus) => {
    setReport(r => ({ ...r, status }));
  }, []);

  const saveDraft = useCallback(() => {
    setSaveState('saving');
    setTimeout(() => setSaveState('saved'), 600);
  }, []);

  const submitForReview = useCallback(() => {
    setReport(r => ({ ...r, status: 'in_review' }));
    setSaveState('saving');
    setTimeout(() => setSaveState('saved'), 600);
  }, []);

  const approve = useCallback(() => {
    setReport(r => ({
      ...r,
      status: 'approved',
      approvedAt: new Date().toISOString(),
    }));
  }, []);

  const reopenForEditing = useCallback(() => {
    setReport(r => ({ ...r, status: 'draft' }));
  }, []);

  const generatePortalLink = useCallback(() => {
    const url = `https://app.radionics.io/report/${report.id}/view`;
    setReport(r => ({
      ...r,
      status: 'shared',
      sharedAt: new Date().toISOString(),
      portalLink: {
        id: `portal-${r.id}`,
        report_id: r.id,
        client_id: r.clientId,
        token: `tok_${r.id}`,
        url,
        created_at: new Date().toISOString(),
      },
    }));
    return url;
  }, [report.id]);

  const shareViaHub = useCallback(() => {
    generatePortalLink();
  }, [generatePortalLink]);

  const shareViaEmail = useCallback(() => {
    generatePortalLink();
  }, [generatePortalLink]);

  const generateAIDraft = useCallback(() => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setReport(r => ({
        ...r,
        sections: r.sections.map(s => {
          if (s.aiDraft && !s.content) {
            return { ...s, content: s.aiDraft, sourceTrace: 'ai_draft' as SourceTrace, isDirty: true };
          }
          return s;
        }),
      }));
      setIsGeneratingAI(false);
      markUnsaved();
    }, 2200);
  }, [markUnsaved]);

  return {
    report,
    saveState,
    activeSection,
    setActiveSection,
    updateSectionContent,
    updateSectionVisibility,
    applyAiDraft,
    setStatus,
    saveDraft,
    submitForReview,
    approve,
    reopenForEditing,
    shareViaHub,
    shareViaEmail,
    generatePortalLink,
    isGeneratingAI,
    generateAIDraft,
  };
}
