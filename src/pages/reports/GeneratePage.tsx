// ============================================================
// Report Generate Page — Session Snapshot → Draft Report
// Triggered from session "completed" state
// ============================================================

import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Sparkles, User2, Calendar,
  Zap, Clock, AlertCircle, FileText, ChevronRight, Wand2
} from 'lucide-react';
import { getSessionById, getClientById, getSnapshotBySessionId } from '@/data/mock-data';
import { buildSnapshotFromState } from '@/lib/snapshot-builder';
import { cn } from '@/lib/utils';

type GenerateStep = 'snapshot' | 'preview' | 'generating' | 'done';

export default function ReportGeneratePage() {
  const { id: sessionId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = getSessionById(sessionId);
  const client = session ? getClientById(session.clientId) : null;
  const snapshot = getSnapshotBySessionId(sessionId);

  // When live state is available (e.g. from useSessionState), prefer buildSnapshotFromState.
  // For now, the page reads from pre-built mock snapshots; this ref ensures the builder
  // is imported and available for future wiring.
  const _buildSnapshot = buildSnapshotFromState;
  const [step, setStep] = useState<GenerateStep>('snapshot');
  const [genProgress, setGenProgress] = useState(0);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-full bg-[var(--color-void)]">
        <div className="text-center space-y-3">
          <AlertCircle size={32} className="mx-auto text-amber-400 opacity-60" />
          <p className="text-[var(--color-text-primary)] font-medium">Sessão não encontrada</p>
          <button onClick={() => navigate('/sessions')} className="text-sm text-[var(--color-gold)] hover:underline">
            Voltar às sessões
          </button>
        </div>
      </div>
    );
  }

  if (session.status !== 'completed' && session.status !== 'reported') {
    return (
      <div className="flex items-center justify-center min-h-full bg-[var(--color-void)]">
        <div className="text-center space-y-3 max-w-sm">
          <AlertCircle size={32} className="mx-auto text-amber-400 opacity-60" />
          <p className="text-[var(--color-text-primary)] font-medium font-cinzel">Sessão não concluída</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            A sessão tem de estar concluída para gerar o relatório.
          </p>
          <button onClick={() => navigate(`/sessions/${sessionId}`)} className="text-sm text-[var(--color-gold)] hover:underline">
            Voltar à sessão
          </button>
        </div>
      </div>
    );
  }

  const handleGenerate = () => {
    setStep('generating');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setStep('done'), 400);
      }
      setGenProgress(Math.min(progress, 100));
    }, 200);
  };

  return (
    <div className="min-h-full bg-[var(--color-void)]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <button
          onClick={() => step === 'snapshot' ? navigate(`/sessions/${sessionId}`) : setStep('snapshot')}
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-3"
        >
          <ArrowLeft size={12} />
          {step === 'snapshot' ? 'Sessão' : 'Snapshot'}
        </button>
        <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">Gerar Relatório</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{session.clientName} · {session.methodologyName}</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          {(['snapshot', 'preview', 'done'] as const).map((s, idx) => {
            const labels = ['Snapshot da Sessão', 'Pré-visualização', 'Relatório Gerado'];
            const isDone = step === 'done' || (step === 'preview' && idx === 0) || (step === 'generating' && idx <= 1);
            const isActive = step === s || (step === 'generating' && s === 'preview');
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all',
                  isDone && !isActive ? 'text-emerald-400 border-emerald-500/30' :
                  isActive ? 'text-[var(--color-gold)] border-[var(--color-gold)] bg-[var(--color-gold)]/10' :
                  'text-[var(--color-text-muted)] border-[var(--color-border)]'
                )}>
                  {isDone && !isActive && <CheckCircle2 size={9} />}
                  {labels[idx]}
                </div>
                {idx < 2 && <div className={cn('w-4 h-px', isDone ? 'bg-emerald-500/40' : 'bg-[var(--color-border)]')} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* STEP: SNAPSHOT */}
        {step === 'snapshot' && snapshot && (
          <>
            <div className="space-y-1">
              <h2 className="text-sm font-medium text-[var(--color-text-primary)]">Snapshot da Sessão</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Dados recolhidos durante a sessão. Estes serão a base do relatório.
              </p>
            </div>

            {/* Client card */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4 space-y-3">
              <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Cliente</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-sm font-bold text-[var(--color-gold)]">
                  {snapshot.client_name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{snapshot.client_name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{snapshot.methodology_name}</p>
                </div>
              </div>
            </div>

            {/* Key data */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4">
                <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Hawkins</p>
                {snapshot.hawkins_initial !== null ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-cinzel text-[var(--color-text-secondary)]">{snapshot.hawkins_initial}</span>
                    {snapshot.hawkins_final && <>
                      <span className="text-[var(--color-text-muted)]">→</span>
                      <span className="text-xl font-bold font-cinzel" style={{ color: 'var(--color-teal)' }}>{snapshot.hawkins_final}</span>
                    </>}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)] opacity-60">Não registado</p>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4">
                <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Reverberação</p>
                {snapshot.reverberation_days ? (
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[var(--color-gold)]" />
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{snapshot.reverberation_days} dias</span>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)] opacity-60">Não registado</p>
                )}
              </div>
            </div>

            {/* Intention */}
            {snapshot.intention && (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4">
                <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Intenção</p>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic">"{snapshot.intention}"</p>
              </div>
            )}

            {/* Tools */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4 space-y-2">
              <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Gráficos</p>
              {snapshot.tool_results.map(tr => (
                <div key={tr.toolId} className="flex items-center gap-3 py-1.5 border-b border-[var(--color-border)] last:border-0">
                  <div className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    tr.status === 'activated' ? 'bg-emerald-400' :
                    tr.status === 'identified' ? 'bg-sky-400' : 'bg-[var(--color-text-muted)]'
                  )} />
                  <span className="text-sm text-[var(--color-text-secondary)] flex-1">{tr.toolName}</span>
                  {tr.notes && <span className="text-[10px] text-[var(--color-text-muted)] max-w-[160px] truncate">{tr.notes}</span>}
                  <span className={cn(
                    'text-[10px] font-medium',
                    tr.status === 'activated' ? 'text-emerald-400' :
                    tr.status === 'identified' ? 'text-sky-400' : 'text-[var(--color-text-muted)]'
                  )}>
                    {tr.status === 'activated' ? 'Ativado' : tr.status === 'identified' ? 'Identificado' : 'Em análise'}
                  </span>
                </div>
              ))}
            </div>

            {/* Notes / voice notes */}
            {(snapshot.therapist_notes || snapshot.voice_notes?.length) && (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4 space-y-3">
                {snapshot.therapist_notes && (
                  <div>
                    <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Notas do Terapeuta</p>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{snapshot.therapist_notes}</p>
                  </div>
                )}
                {snapshot.voice_notes?.map((note, i) => (
                  <div key={note.id}>
                    <p className="text-[9px] font-medium text-amber-400 uppercase tracking-wider mb-1.5">
                      Nota de Voz #{i + 1}{note.toolName ? ` · ${note.toolName}` : ''}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic">"{note.transcript}"</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep('preview')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[var(--color-gold)] text-[var(--color-void)] font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Continuar
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* STEP: PREVIEW */}
        {step === 'preview' && (
          <>
            <div className="space-y-1">
              <h2 className="text-sm font-medium text-[var(--color-text-primary)]">Gerar Rascunho do Relatório</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                O rascunho será gerado a partir do snapshot da sessão. Poderás editar tudo antes de aprovar.
              </p>
            </div>

            {/* What will be generated */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4 space-y-2">
              <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">O que será gerado</p>
              {[
                { label: 'Dados do cliente', source: 'Campo de sessão', auto: true },
                { label: 'Objetivo da sessão', source: 'Campo de sessão', auto: true },
                { label: 'Evolução de Hawkins', source: 'Campo de sessão', auto: true },
                { label: 'Gráficos identificados e ativados', source: 'Campo de sessão', auto: true },
                { label: 'Interpretação final', source: 'Rascunho IA', auto: false },
                { label: 'Recomendações', source: 'Rascunho IA', auto: false },
                { label: 'Próximos passos', source: 'Rascunho IA', auto: false },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 py-1 border-b border-[var(--color-border)] last:border-0">
                  <CheckCircle2 size={12} className={item.auto ? 'text-emerald-400' : 'text-teal-400'} />
                  <span className="text-xs text-[var(--color-text-secondary)] flex-1">{item.label}</span>
                  <span className={cn('text-[10px]', item.auto ? 'text-emerald-400' : 'text-teal-400')}>
                    {item.source}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 flex items-start gap-2">
              <Wand2 size={13} className="text-teal-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                <span className="text-teal-400 font-medium">Rascunho IA:</span> As secções marcadas como "Rascunho IA" são sugestões automáticas baseadas nos dados da sessão. O terapeuta deve sempre rever e personalizar antes de aprovar.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[var(--color-gold)] text-[var(--color-void)] font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Sparkles size={16} />
              Gerar Rascunho do Relatório
            </button>
          </>
        )}

        {/* STEP: GENERATING */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="w-16 h-16 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 flex items-center justify-center">
              <Sparkles size={24} className="text-[var(--color-gold)] animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-cinzel text-base font-semibold text-[var(--color-text-primary)]">A gerar relatório...</p>
              <p className="text-xs text-[var(--color-text-muted)]">Estruturando dados da sessão</p>
            </div>
            <div className="w-full max-w-xs">
              <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-gold)] rounded-full transition-all duration-200"
                  style={{ width: `${genProgress}%` }}
                />
              </div>
              <p className="text-right text-[10px] text-[var(--color-text-muted)] mt-1">{Math.round(genProgress)}%</p>
            </div>
          </div>
        )}

        {/* STEP: DONE */}
        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-cinzel text-base font-semibold text-[var(--color-text-primary)]">Rascunho gerado</p>
              <p className="text-xs text-[var(--color-text-muted)]">Abre o editor para rever e personalizar antes de aprovar</p>
            </div>

            <div className="w-full max-w-sm space-y-2">
              {/* Navigate to the report that matches this session */}
              <button
                onClick={() => {
                  // find report for this session
                  const repId = sessionId === 'sess-005' ? 'rep-001'
                    : sessionId === 'sess-003' ? 'rep-002'
                    : sessionId === 'sess-001' ? 'rep-003'
                    : sessionId === 'sess-002' ? 'rep-004' : 'rep-003';
                  navigate(`/reports/${repId}`);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[var(--color-gold)] text-[var(--color-void)] font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <FileText size={15} />
                Abrir Editor de Relatório
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="w-full py-2.5 rounded-2xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
              >
                Ver todos os relatórios
              </button>
            </div>
          </div>
        )}

        {/* No snapshot fallback */}
        {step === 'snapshot' && !snapshot && (
          <div className="text-center space-y-3 py-8">
            <AlertCircle size={32} className="mx-auto text-amber-400 opacity-60" />
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Sem snapshot disponível</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Não foram encontrados dados registados para esta sessão.
            </p>
            <button onClick={() => navigate(`/sessions/${sessionId}`)} className="text-sm text-[var(--color-gold)] hover:underline">
              Voltar à sessão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
