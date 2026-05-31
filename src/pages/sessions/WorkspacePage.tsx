import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, Mic, MicOff, Save, CheckCircle2,
  Clock, User, Zap, BookOpen, AlertCircle, Info, Sparkles,
  ArrowLeft, X, Play, Square, RotateCcw, FileText, ChevronDown,
  Eye, Check, SlidersHorizontal, List, LayoutGrid, Search,
  Filter, Hash, Layers, Pencil, AudioLines, Volume2, Radio,
  Flame, TrendingUp, Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_SAVE_LABELS } from '@/lib/dataMode';
import { HAWKINS_LEVELS, getToolsByMethodology, TOOLS_RAD35 } from '@/data/mock-data';
import { getSessionById, updateSession } from '@/services/sessionsService';
import { useSessionState } from '@/lib/session-state';
import type { Session, SessionStage, ToolResult, HawkinsLevel, Tool, ToolIntensity } from '@/types';

// ─── Tool status config ────────────────────────────────────────
const TOOL_STATUS_STYLES: Record<string, { border: string; bg: string; label: string; dot: string; badge: string }> = {
  not_analyzed: { border: 'border-[var(--color-border)]',  bg: 'bg-transparent',      label: 'Não analisado', dot: 'bg-[var(--color-text-muted)]',   badge: 'border-zinc-700 text-zinc-500' },
  in_analysis:  { border: 'border-amber-500/70',           bg: 'bg-amber-500/8',       label: 'Em análise',    dot: 'bg-amber-400',                    badge: 'border-amber-700 text-amber-400' },
  identified:   { border: 'border-sky-400/70',             bg: 'bg-sky-400/8',         label: 'Identificado',  dot: 'bg-sky-400',                      badge: 'border-sky-700 text-sky-400' },
  activated:    { border: 'border-emerald-400/70',         bg: 'bg-emerald-400/8',     label: 'Ativado',       dot: 'bg-emerald-400',                  badge: 'border-emerald-700 text-emerald-400' },
  skipped:      { border: 'border-[var(--color-border)]',  bg: 'bg-transparent',       label: 'Ignorado',      dot: 'bg-[var(--color-text-muted)]',   badge: 'border-zinc-700 text-zinc-500' },
};

// ─── Intensity config ──────────────────────────────────────────
const INTENSITY_CONFIG: Record<ToolIntensity, { label: string; icon: React.ReactNode; color: string; border: string; bg: string }> = {
  low:    { label: 'Baixa',  icon: <Minus size={11} />,      color: 'text-sky-400',     border: 'border-sky-700',     bg: 'bg-sky-400/10' },
  medium: { label: 'Média',  icon: <TrendingUp size={11} />, color: 'text-amber-400',   border: 'border-amber-700',   bg: 'bg-amber-400/10' },
  high:   { label: 'Alta',   icon: <Flame size={11} />,      color: 'text-red-400',     border: 'border-red-700',     bg: 'bg-red-400/10' },
};

// ─── Tool Detail Drawer ────────────────────────────────────────
function ToolDetailDrawer({
  tool, result, onClose, onStatusChange, onIntensityChange, onNoteSave,
}: {
  tool: Tool;
  result?: ToolResult;
  onClose: () => void;
  onStatusChange: (status: ToolResult['status']) => void;
  onIntensityChange: (intensity: ToolIntensity) => void;
  onNoteSave: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(result?.notes || '');
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState(result?.transcript || '');
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, [recording]);

  const startRecording = () => {
    setRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };
  const stopRecording = () => {
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    // Mock transcript — browser audio API not wired
    setTranscript(prev => (prev ? prev + ' ' : '') + 'Campo identificado com frequência elevada. Necessária ativação imediata com intenção clara.');
  };

  const status = result?.status || 'not_analyzed';
  const intensity = result?.intensity;
  const styles = TOOL_STATUS_STYLES[status];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="w-[480px] flex flex-col h-full bg-[var(--color-surface-0)] border-l border-[var(--color-border)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)] flex-shrink-0">
          <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', styles.dot)} />
          <div className="flex-1 min-w-0">
            <h3 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)] truncate">{tool.name}</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Gráfico {String(tool.sortOrder).padStart(2, '0')}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero image */}
          <div className="relative h-44 overflow-hidden">
            <img src={tool.imageUrl} alt={tool.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-[var(--color-void)]/30 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{tool.description}</p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Status picker */}
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Estado</p>
              <div className="flex gap-1.5 flex-wrap">
                {(['not_analyzed', 'in_analysis', 'identified', 'activated', 'skipped'] as ToolResult['status'][]).map(s => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(s)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      status === s
                        ? `${TOOL_STATUS_STYLES[s].border} ${TOOL_STATUS_STYLES[s].bg} text-[var(--color-text-primary)]`
                        : 'border-transparent hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                    )}
                  >
                    <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', TOOL_STATUS_STYLES[s].dot)} />
                    {TOOL_STATUS_STYLES[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity selector — only relevant when identified or activated */}
            {(status === 'identified' || status === 'activated') && (
              <div>
                <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Intensidade</p>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as ToolIntensity[]).map(lvl => {
                    const cfg = INTENSITY_CONFIG[lvl];
                    const isSelected = intensity === lvl;
                    return (
                      <button
                        key={lvl}
                        onClick={() => onIntensityChange(lvl)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all flex-1 justify-center',
                          isSelected
                            ? `${cfg.border} ${cfg.bg} ${cfg.color}`
                            : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
                        )}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* What it does */}
            <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-4 space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">O que faz</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{tool.whatItDoes}</p>
              </div>
              <div className="border-t border-[var(--color-border)] pt-3">
                <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Quando usar</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{tool.example}</p>
              </div>
              <div className="border-t border-[var(--color-border)] pt-3">
                <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Ativação</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{tool.suggestedActivation}</p>
              </div>
            </div>

            {/* Voice dictation */}
            <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Nota de Voz</p>
                {recording && (
                  <span className="text-[10px] text-red-400 font-mono">
                    {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all flex-shrink-0',
                    recording
                      ? 'border-red-500 bg-red-500/15 text-red-400'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]'
                  )}
                >
                  {recording ? <Square size={12} fill="currentColor" /> : <Mic size={12} />}
                  {recording ? 'Parar' : 'Gravar'}
                </button>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-[2px] h-8">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const h = recording
                        ? 4 + Math.abs(Math.sin(tick * 0.3 + i * 0.5)) * 20
                        : 3;
                      return (
                        <div
                          key={i}
                          className={cn('w-[2px] rounded-full transition-all duration-75', recording ? 'bg-red-400' : 'bg-[var(--color-border)]')}
                          style={{ height: `${h}px` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {transcript && (
                <div className="rounded-lg bg-[var(--color-surface-2)] px-3 py-2">
                  <p className="text-[10px] font-medium text-[var(--color-text-muted)] mb-1">Transcrição automática</p>
                  <p className="text-xs text-[var(--color-text-secondary)] italic leading-relaxed">"{transcript}"</p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Notas da análise</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] resize-none focus:outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-[var(--color-text-muted)]"
                placeholder="Observações desta análise..."
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-[var(--color-border)] flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onStatusChange('identified')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-sky-500/50 bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20 transition-all"
          >
            <Check size={14} />
            Identificar
          </button>
          <button
            onClick={() => onStatusChange('activated')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all"
          >
            <Zap size={14} />
            Ativar
          </button>
          <button
            onClick={() => { onNoteSave(notes); onClose(); }}
            className="px-4 py-2.5 rounded-xl bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/30 text-[var(--color-gold)] text-sm font-medium hover:bg-[var(--color-gold)]/25 transition-all"
          >
            <Save size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Report Preview Modal ──────────────────────────────────────
function ReportPreviewModal({
  session, snapshot, onClose, onGenerate,
}: {
  session: Session;
  snapshot: ReturnType<typeof useSessionState>['sessionSnapshot'];
  onClose: () => void;
  onGenerate: () => void;
}) {
  const { hawkins_initial, hawkins_final, reverberation_days, tool_results } = snapshot;
  const identified = tool_results.filter(r => r.status === 'identified' || r.status === 'activated');
  const activated = tool_results.filter(r => r.status === 'activated');
  const delta = hawkins_initial && hawkins_final ? hawkins_final - hawkins_initial : null;
  const initialLevel = HAWKINS_LEVELS.find(h => h.value === hawkins_initial);
  const finalLevel = HAWKINS_LEVELS.find(h => h.value === hawkins_final);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[var(--color-surface-0)] border border-[var(--color-border)] overflow-hidden shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-0)] flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center">
            <FileText size={15} style={{ color: 'var(--color-gold)' }} />
          </div>
          <div>
            <h3 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">Pré-visualização do Relatório</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">{session.clientName} · {session.methodologyName}</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title block */}
          <div className="rounded-2xl border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 p-5 text-center">
            <p className="text-[10px] font-medium text-[var(--color-gold)] uppercase tracking-widest mb-2">Relatório de Sessão Radiônica</p>
            <h2 className="font-cinzel text-lg font-semibold text-[var(--color-text-primary)] mb-1">{session.clientName}</h2>
            <p className="text-xs text-[var(--color-text-muted)]">{session.methodologyName}</p>
          </div>

          {/* Hawkins delta */}
          {hawkins_initial && hawkins_final && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5">
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Evolução Vibracional</p>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-[10px] text-[var(--color-text-muted)] mb-1">Início</p>
                  <p className="text-3xl font-bold font-cinzel" style={{ color: initialLevel?.color }}>{hawkins_initial}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: initialLevel?.color }}>{initialLevel?.label}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-px w-12 bg-[var(--color-border)]" />
                  <p className={cn('text-xl font-bold font-cinzel', delta! > 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {delta! > 0 ? '+' : ''}{delta}
                  </p>
                  <div className="h-px w-12 bg-[var(--color-border)]" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[var(--color-text-muted)] mb-1">Final</p>
                  <p className="text-3xl font-bold font-cinzel" style={{ color: finalLevel?.color }}>{hawkins_final}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: finalLevel?.color }}>{finalLevel?.label}</p>
                </div>
              </div>
            </div>
          )}

          {/* Intention */}
          {session.intention && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Intenção da Sessão</p>
              <p className="text-sm text-[var(--color-text-secondary)] italic leading-relaxed">"{session.intention}"</p>
            </div>
          )}

          {/* Tools summary */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
            <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Gráficos Trabalhados</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-lg bg-sky-400/10 border border-sky-400/20 p-3 text-center">
                <p className="text-2xl font-bold font-cinzel text-sky-400">{identified.length}</p>
                <p className="text-[10px] text-sky-400/70 mt-0.5">Identificados</p>
              </div>
              <div className="rounded-lg bg-emerald-400/10 border border-emerald-400/20 p-3 text-center">
                <p className="text-2xl font-bold font-cinzel text-emerald-400">{activated.length}</p>
                <p className="text-[10px] text-emerald-400/70 mt-0.5">Ativados</p>
              </div>
            </div>
            {identified.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {identified.map(r => (
                  <span
                    key={r.toolId}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full border font-medium',
                      r.status === 'activated' ? 'border-emerald-700 text-emerald-400 bg-emerald-400/5' : 'border-sky-700 text-sky-400 bg-sky-400/5'
                    )}
                  >
                    {r.toolName}
                    {r.intensity && (
                      <span className="ml-1 opacity-60">· {INTENSITY_CONFIG[r.intensity].label}</span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)] italic">Nenhum gráfico registado nesta sessão.</p>
            )}
          </div>

          {/* Notes from tools */}
          {tool_results.filter(r => r.notes).length > 0 && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Observações</p>
              <div className="space-y-2">
                {tool_results.filter(r => r.notes).map(r => (
                  <div key={r.toolId} className="border-l-2 border-[var(--color-gold)]/40 pl-3">
                    <p className="text-[10px] font-medium text-[var(--color-gold)]">{r.toolName}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-0.5">{r.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reverberation */}
          {reverberation_days && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)]/10 border border-[var(--color-teal)]/20 flex items-center justify-center flex-shrink-0">
                <Radio size={16} style={{ color: 'var(--color-teal)' }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">Período de Reverberação</p>
                <p className="text-sm font-bold font-cinzel" style={{ color: 'var(--color-teal)' }}>{reverberation_days} dias</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-all">
            Cancelar
          </button>
          <button
            onClick={onGenerate}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-bold hover:brightness-110 transition-all"
          >
            <FileText size={14} />
            Gerar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hawkins Card ──────────────────────────────────────────────
function HawkinsCard({ level, selected, onClick }: { level: HawkinsLevel; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 text-left w-full hover:scale-[1.02] active:scale-[0.98]',
        selected
          ? 'border-[var(--color-gold)] shadow-lg shadow-[var(--color-gold)]/20'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
      )}
      style={{ background: selected ? level.bgColor : 'var(--color-surface-1)' }}
    >
      {selected && (
        <div className="absolute top-1.5 right-1.5">
          <CheckCircle2 size={12} style={{ color: 'var(--color-gold)' }} />
        </div>
      )}
      <span className="text-lg font-bold font-cinzel" style={{ color: level.color }}>{level.value}</span>
      <span className="text-[10px] font-semibold mt-0.5 text-center leading-tight" style={{ color: level.color }}>{level.label}</span>
    </button>
  );
}

// ─── Tool Grid Card ────────────────────────────────────────────
function ToolGridCard({ tool, result, onClick }: { tool: Tool; result?: ToolResult; onClick: () => void }) {
  const status = result?.status || 'not_analyzed';
  const styles = TOOL_STATUS_STYLES[status];
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left group',
        styles.border, styles.bg,
        status === 'skipped' && 'opacity-40'
      )}
    >
      <div className="relative h-20 overflow-hidden">
        <img src={tool.imageUrl} alt={tool.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)]/90 to-transparent" />
        <div className={cn('absolute top-2 right-2 w-2 h-2 rounded-full', styles.dot)} />
        <span className="absolute bottom-1.5 left-2 text-[8px] font-mono text-white/40">{String(tool.sortOrder).padStart(2, '0')}</span>
      </div>
      <div className="p-2">
        <p className="text-[11px] font-semibold text-[var(--color-text-primary)] leading-tight">{tool.name}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className={cn('inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full border', styles.badge)}>
            {styles.label}
          </span>
          {result?.intensity && (
            <span className={cn('inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full border', INTENSITY_CONFIG[result.intensity].border, INTENSITY_CONFIG[result.intensity].color, INTENSITY_CONFIG[result.intensity].bg)}>
              {INTENSITY_CONFIG[result.intensity].label}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Stage Sidebar ─────────────────────────────────────────────
function StageSidebar({ stages, currentStage, stageCompletion, onSelectStage }: {
  stages: SessionStage[];
  currentStage: string;
  stageCompletion: Record<string, boolean>;
  onSelectStage: (code: string) => void;
}) {
  const stageIcons: Record<string, React.ReactNode> = {
    preparation:  <BookOpen size={13} />,
    connection:   <Zap size={13} />,
    diagnosis:    <SlidersHorizontal size={13} />,
    activations:  <Sparkles size={13} />,
    closing:      <CheckCircle2 size={13} />,
  };

  const stageRequirements: Record<string, string> = {
    preparation: 'Definir nível Hawkins inicial',
    connection:  'Concluir respiração guiada',
    diagnosis:   'Analisar todos os gráficos',
    activations: 'Ativar ou ignorar todos identificados',
    closing:     'Hawkins final + reverberação',
  };

  return (
    <div className="w-56 flex-shrink-0 border-r border-[var(--color-border)] flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Etapas</p>
      </div>
      <div className="flex-1 p-2 space-y-0.5">
        {stages.map(stage => {
          const isActive = stage.code === currentStage;
          const isComplete = stageCompletion[stage.code] ?? false;

          return (
            <button
              key={stage.code}
              onClick={() => onSelectStage(stage.code)}
              className={cn(
                'w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left',
                isActive
                  ? 'bg-[var(--color-teal)]/12 border border-[var(--color-teal)]/25'
                  : 'hover:bg-[var(--color-surface-1)] border border-transparent'
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                isActive    ? 'bg-[var(--color-teal)]/20 text-[var(--color-teal)]' :
                isComplete  ? 'bg-emerald-500/15 text-emerald-400' :
                              'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
              )}>
                {isComplete ? <Check size={11} /> : (stageIcons[stage.code] || <Hash size={11} />)}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  'text-xs font-medium truncate',
                  isActive    ? 'text-[var(--color-teal)]' :
                  isComplete  ? 'text-[var(--color-text-primary)]' :
                                'text-[var(--color-text-muted)]'
                )}>{stage.label}</p>
                {!isComplete && isActive && (
                  <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5 leading-tight">
                    {stageRequirements[stage.code]}
                  </p>
                )}
                {isComplete && (
                  <p className="text-[9px] text-emerald-400/70 mt-0.5">Concluído</p>
                )}
              </div>
              {isActive && <div className="w-1 h-1 rounded-full bg-[var(--color-teal)] flex-shrink-0 mt-2 animate-pulse" />}
            </button>
          );
        })}
      </div>
      <div className="p-3 border-t border-[var(--color-border)] space-y-1.5">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <Clock size={11} />
          <span className="text-[10px]">Sessão em curso</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <Save size={11} />
          <span className="text-[10px]">{MOCK_SAVE_LABELS.autoSave}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Options Step ──────────────────────────────────────────────
function OptionsStep({ label, options, selected, multi, onSelect }: {
  label: string;
  options: { value: string; label: string; description?: string; icon?: React.ReactNode }[];
  selected: string[];
  multi: boolean;
  onSelect: (values: string[]) => void;
}) {
  const toggle = (val: string) => {
    if (multi) {
      onSelect(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
    } else {
      onSelect(selected[0] === val ? [] : [val]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{label}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map(opt => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={cn(
                'relative flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99]',
                isSelected
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/8 shadow-lg shadow-[var(--color-gold)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
              )}
            >
              {opt.icon && <div className={cn('opacity-70', isSelected && 'opacity-100 text-[var(--color-gold)]')}>{opt.icon}</div>}
              <div>
                <p className={cn('text-xs font-semibold', isSelected ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-primary)]')}>
                  {opt.label}
                </p>
                {opt.description && (
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{opt.description}</p>
                )}
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 size={12} style={{ color: 'var(--color-gold)' }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stage: Preparation ────────────────────────────────────────
function PreparationStage({ session, hawkinsInitial, onHawkinsSelect }: {
  session: Session;
  hawkinsInitial: number | null;
  onHawkinsSelect: (value: number) => void;
}) {
  const [intentionOptions, setIntentionOptions] = useState<string[]>([]);
  const [intention, setIntention] = useState(session.intention || '');
  const [sessionMode, setSessionMode] = useState<string[]>([session.sessionMode || 'distance']);

  const INTENTION_OPTS = [
    { value: 'harmonization', label: 'Harmonização', description: 'Equilíbrio energético geral', icon: <Sparkles size={14} /> },
    { value: 'protection', label: 'Proteção', description: 'Proteção de interferências', icon: <Layers size={14} /> },
    { value: 'prosperity', label: 'Prosperidade', description: 'Desbloqueio de abundância', icon: <Zap size={14} /> },
    { value: 'health', label: 'Saúde', description: 'Suporte à cura física', icon: <Radio size={14} /> },
    { value: 'relationships', label: 'Relacionamentos', description: 'Harmonização afetiva', icon: <User size={14} /> },
    { value: 'spiritual', label: 'Espiritual', description: 'Evolução e despertar', icon: <Eye size={14} /> },
  ];

  const MODE_OPTS = [
    { value: 'distance', label: 'Distância', description: 'Trabalho radiônico remoto' },
    { value: 'presential', label: 'Presencial', description: 'Cliente presente' },
    { value: 'online', label: 'Online', description: 'Videochamada' },
  ];

  return (
    <div className="space-y-7 max-w-3xl">
      <div>
        <h3 className="font-cinzel text-base font-semibold text-[var(--color-text-primary)] mb-0.5">Preparação da Sessão</h3>
        <p className="text-sm text-[var(--color-text-muted)]">Configure a intenção e o contexto antes de iniciar</p>
      </div>

      <OptionsStep label="Modo da Sessão" options={MODE_OPTS} selected={sessionMode} multi={false} onSelect={setSessionMode} />
      <OptionsStep label="Área de Intenção (pode selecionar várias)" options={INTENTION_OPTS} selected={intentionOptions} multi={true} onSelect={setIntentionOptions} />

      <div>
        <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Intenção personalizada</p>
        <textarea
          value={intention}
          onChange={e => setIntention(e.target.value)}
          rows={3}
          className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] resize-none focus:outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-[var(--color-text-muted)]"
          placeholder="Descreva a intenção específica desta sessão..."
        />
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Nível Hawkins Inicial</h4>
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {HAWKINS_LEVELS.map(level => (
            <HawkinsCard key={level.value} level={level} selected={hawkinsInitial === level.value} onClick={() => onHawkinsSelect(level.value)} />
          ))}
        </div>
        {hawkinsInitial && (
          <div className="mt-3 rounded-xl border border-[var(--color-gold)]/25 bg-[var(--color-gold)]/5 p-3 flex items-center gap-3">
            <p className="text-lg font-bold font-cinzel" style={{ color: HAWKINS_LEVELS.find(h => h.value === hawkinsInitial)?.color }}>
              {hawkinsInitial}
            </p>
            <div>
              <p className="text-sm font-semibold" style={{ color: HAWKINS_LEVELS.find(h => h.value === hawkinsInitial)?.color }}>
                {HAWKINS_LEVELS.find(h => h.value === hawkinsInitial)?.label}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {HAWKINS_LEVELS.find(h => h.value === hawkinsInitial)?.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stage: Connection ─────────────────────────────────────────
function ConnectionStage({ session }: { session: Session }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('rest');
  const [breathCount, setBreathCount] = useState(0);

  const startBreathWork = () => {
    setConnecting(true);
    const phases: Array<['inhale' | 'hold' | 'exhale' | 'rest', number]> = [
      ['inhale', 4000], ['hold', 4000], ['exhale', 6000], ['rest', 2000],
    ];
    let cycle = 0;
    const runCycle = () => {
      phases.reduce((promise, [phase, ms]) => {
        return promise.then(() => new Promise<void>(resolve => {
          setBreathPhase(phase);
          setTimeout(resolve, ms);
        }));
      }, Promise.resolve()).then(() => {
        cycle++;
        setBreathCount(cycle);
        if (cycle < 3) runCycle();
        else { setBreathPhase('rest'); setConnected(true); setConnecting(false); }
      });
    };
    runCycle();
  };

  return (
    <div className="space-y-7 max-w-2xl">
      <div>
        <h3 className="font-cinzel text-base font-semibold text-[var(--color-text-primary)] mb-0.5">Estabelecer Conexão</h3>
        <p className="text-sm text-[var(--color-text-muted)]">Sintonize com o campo energético do cliente</p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5 flex items-center gap-4">
        <div className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold font-cinzel flex-shrink-0 border-2 transition-all',
          connected ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400 shadow-lg shadow-emerald-400/20' : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)]'
        )}>
          {session.clientName[0]}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[var(--color-text-primary)]">{session.clientName}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{session.methodologyName}</p>
          {session.intention && <p className="text-xs text-[var(--color-text-muted)] mt-1 italic">"{session.intention}"</p>}
        </div>
        <div className={cn(
          'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border',
          connected ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
        )}>
          <div className={cn('w-1.5 h-1.5 rounded-full', connected ? 'bg-emerald-400 animate-pulse' : 'bg-[var(--color-text-muted)]')} />
          {connected ? 'Conectado' : 'Desconectado'}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 text-center">
        <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-5">Respiração Guiada</p>

        <div className={cn(
          'w-24 h-24 rounded-full mx-auto border-4 flex items-center justify-center mb-4 transition-all duration-1000',
          breathPhase === 'inhale' ? 'border-sky-400 scale-125 bg-sky-400/10' :
          breathPhase === 'hold' ? 'border-[var(--color-gold)] scale-125 bg-[var(--color-gold)]/10' :
          breathPhase === 'exhale' ? 'border-teal-400 scale-100 bg-teal-400/10' :
          'border-[var(--color-border)] scale-100 bg-[var(--color-surface-2)]'
        )}>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            {breathPhase === 'rest' ? (connected ? '✓' : '···') :
             breathPhase === 'inhale' ? 'Inspira' :
             breathPhase === 'hold' ? 'Segura' : 'Expira'}
          </p>
        </div>

        {breathCount > 0 && !connected && (
          <p className="text-xs text-[var(--color-text-muted)] mb-4">Ciclo {breathCount} de 3</p>
        )}

        {!connected && !connecting && (
          <button
            onClick={startBreathWork}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-[var(--color-teal)]/15 border border-[var(--color-teal)]/30 text-sm font-medium text-[var(--color-teal)] hover:bg-[var(--color-teal)]/25 transition-all"
          >
            <Play size={13} />
            Iniciar Respiração
          </button>
        )}
        {connected && (
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">Conexão estabelecida</span>
          </div>
        )}
      </div>

      <OptionsStep
        label="Foco da Conexão"
        options={[
          { value: 'energetic', label: 'Energético', description: 'Campo áurico e vitalidade' },
          { value: 'emotional', label: 'Emocional', description: 'Padrões emocionais' },
          { value: 'mental', label: 'Mental', description: 'Crenças e pensamentos' },
          { value: 'spiritual', label: 'Espiritual', description: 'Dimensão espiritual' },
          { value: 'karmic', label: 'Kármico', description: 'Padrões kármicos' },
          { value: 'ancestral', label: 'Ancestral', description: 'Herança familiar' },
        ]}
        selected={[]}
        multi={true}
        onSelect={() => {}}
      />
    </div>
  );
}

// ─── Stage: Diagnosis ──────────────────────────────────────────
function DiagnosisStage({ session, toolResults, onToolResultChange }: {
  session: Session;
  toolResults: ToolResult[];
  onToolResultChange: (toolId: string, patch: Partial<Omit<ToolResult, 'toolId'>>) => void;
}) {
  const tools = getToolsByMethodology(session.methodologyId);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = tools.filter(t => {
    const status = toolResults.find(r => r.toolId === t.id)?.status || 'not_analyzed';
    const matchFilter = filterStatus === 'all' || status === filterStatus;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    total: tools.length,
    identified: toolResults.filter(r => r.status === 'identified').length,
    activated: toolResults.filter(r => r.status === 'activated').length,
  };

  const selectedResult = selectedTool ? toolResults.find(r => r.toolId === selectedTool.id) : undefined;

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4 flex-shrink-0 flex-wrap">
          <div>
            <h3 className="font-cinzel text-base font-semibold text-[var(--color-text-primary)]">
              Diagnóstico — {session.methodologyName}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">Clique num gráfico para analisar em detalhe</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {[
              { status: 'identified', count: counts.identified, label: 'Identificados', color: 'text-sky-400 bg-sky-400/10 border-sky-700' },
              { status: 'activated',  count: counts.activated,  label: 'Ativados',      color: 'text-emerald-400 bg-emerald-400/10 border-emerald-700' },
            ].map(s => (
              <button
                key={s.status}
                onClick={() => setFilterStatus(filterStatus === s.status ? 'all' : s.status)}
                className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all', s.color, filterStatus === s.status && 'ring-1 ring-current')}
              >
                {s.count} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 flex-1 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2">
            <Search size={12} className="text-[var(--color-text-muted)] flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-xs text-[var(--color-text-primary)] focus:outline-none flex-1 placeholder:text-[var(--color-text-muted)]"
              placeholder="Pesquisar gráfico..."
            />
          </div>
          <div className="flex items-center border border-[var(--color-border)] rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={cn('px-2.5 py-2 transition-colors', viewMode === 'grid' ? 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)]')}>
              <LayoutGrid size={13} />
            </button>
            <button onClick={() => setViewMode('list')} className={cn('px-2.5 py-2 transition-colors', viewMode === 'list' ? 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)]')}>
              <List size={13} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              {filtered.map(tool => (
                <ToolGridCard
                  key={tool.id}
                  tool={tool}
                  result={toolResults.find(r => r.toolId === tool.id)}
                  onClick={() => setSelectedTool(tool)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map(tool => {
                const result = toolResults.find(r => r.toolId === tool.id);
                const status = result?.status || 'not_analyzed';
                const styles = TOOL_STATUS_STYLES[status];
                return (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool)}
                    className={cn('w-full flex items-center gap-3 p-3 rounded-xl border transition-all hover:bg-[var(--color-surface-1)] text-left', styles.border, styles.bg)}
                  >
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0', styles.dot)} />
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] w-6 flex-shrink-0">{String(tool.sortOrder).padStart(2, '0')}</span>
                    <img src={tool.imageUrl} alt={tool.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{tool.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">{tool.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', styles.badge)}>
                        {styles.label}
                      </span>
                      {result?.intensity && (
                        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', INTENSITY_CONFIG[result.intensity].border, INTENSITY_CONFIG[result.intensity].color)}>
                          {INTENSITY_CONFIG[result.intensity].label}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedTool && (
        <ToolDetailDrawer
          tool={selectedTool}
          result={selectedResult}
          onClose={() => setSelectedTool(null)}
          onStatusChange={status => onToolResultChange(selectedTool.id, { status })}
          onIntensityChange={intensity => onToolResultChange(selectedTool.id, { intensity })}
          onNoteSave={notes => { onToolResultChange(selectedTool.id, { notes }); setSelectedTool(null); }}
        />
      )}
    </>
  );
}

// ─── Activation Card ───────────────────────────────────────────
function ActivationCard({ tool, result, onActivate, onSkip, onOpenDetail }: {
  tool: Tool;
  result?: ToolResult;
  onActivate: () => void;
  onSkip: () => void;
  onOpenDetail: () => void;
}) {
  const status = result?.status ?? 'identified';
  const isDone = status === 'activated' || status === 'skipped';

  return (
    <div className={cn(
      'rounded-2xl border transition-all overflow-hidden',
      status === 'activated' ? 'border-emerald-400/40 bg-emerald-400/5' :
      status === 'skipped'   ? 'border-[var(--color-border)] bg-transparent opacity-50' :
                               'border-sky-400/40 bg-sky-400/5'
    )}>
      <div className="flex items-start gap-4 p-4">
        {/* Tool image */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          <img src={tool.imageUrl} alt={tool.name} className="w-full h-full object-cover" />
          {isDone && (
            <div className={cn(
              'absolute inset-0 flex items-center justify-center',
              status === 'activated' ? 'bg-emerald-900/70' : 'bg-zinc-900/70'
            )}>
              {status === 'activated'
                ? <CheckCircle2 size={22} className="text-emerald-400" />
                : <X size={22} className="text-zinc-500" />
              }
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">{tool.name}</h4>
              <p className="text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">Gráfico {String(tool.sortOrder).padStart(2, '0')}</p>
            </div>
            {/* Intensity badge */}
            {result?.intensity && (
              <span className={cn(
                'flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0',
                INTENSITY_CONFIG[result.intensity].border,
                INTENSITY_CONFIG[result.intensity].color,
                INTENSITY_CONFIG[result.intensity].bg
              )}>
                {INTENSITY_CONFIG[result.intensity].icon}
                {INTENSITY_CONFIG[result.intensity].label}
              </span>
            )}
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed line-clamp-2">{tool.suggestedActivation}</p>

          {result?.notes && (
            <div className="mt-2 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border)] px-2.5 py-1.5">
              <p className="text-[10px] text-[var(--color-text-muted)] italic leading-relaxed">"{result.notes}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isDone ? (
        <div className="flex items-center gap-2 px-4 pb-4">
          <button
            onClick={onActivate}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all"
          >
            <Zap size={14} />
            Ativar
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm font-medium hover:bg-[var(--color-surface-2)] transition-all"
          >
            Ignorar
          </button>
          <button
            onClick={onOpenDetail}
            className="px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-all"
            title="Ver detalhes"
          >
            <SlidersHorizontal size={13} />
          </button>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <div className={cn(
            'flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border',
            status === 'activated'
              ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
          )}>
            {status === 'activated' ? <CheckCircle2 size={12} /> : <X size={12} />}
            {status === 'activated' ? 'Ativado com sucesso' : 'Ignorado nesta sessão'}
            <button
              onClick={onOpenDetail}
              className="ml-auto text-[10px] opacity-60 hover:opacity-100 transition-opacity"
            >
              Editar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stage: Activations ────────────────────────────────────────
function ActivationsStage({ session, toolResults, onToolResultChange }: {
  session: Session;
  toolResults: ToolResult[];
  onToolResultChange: (toolId: string, patch: Partial<Omit<ToolResult, 'toolId'>>) => void;
}) {
  const tools = getToolsByMethodology(session.methodologyId);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  // Only tools that were identified in diagnosis (or already activated there)
  const candidateTools = tools.filter(t => {
    const r = toolResults.find(x => x.toolId === t.id);
    return r?.status === 'identified' || r?.status === 'activated';
  });

  // Skipped in activations: status changed to 'skipped' during this stage
  // We show pending (identified) separately from done (activated/skipped)
  const pendingTools   = candidateTools.filter(t => toolResults.find(r => r.toolId === t.id)?.status === 'identified');
  const completedTools = candidateTools.filter(t => {
    const s = toolResults.find(r => r.toolId === t.id)?.status;
    return s === 'activated' || s === 'skipped';
  });

  const totalCount     = candidateTools.length;
  const activatedCount = completedTools.filter(t => toolResults.find(r => r.toolId === t.id)?.status === 'activated').length;

  const selectedResult = selectedTool ? toolResults.find(r => r.toolId === selectedTool.id) : undefined;

  if (candidateTools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border)] flex items-center justify-center">
          <Sparkles size={24} className="text-[var(--color-text-muted)]" />
        </div>
        <div className="text-center">
          <p className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">Nenhum gráfico identificado</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Volte ao Diagnóstico e identifique os gráficos relevantes.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h3 className="font-cinzel text-base font-semibold text-[var(--color-text-primary)]">Ativações</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Ative os gráficos identificados no diagnóstico</p>
          </div>
          {/* X of Y counter */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)]">
            <Zap size={13} className="text-emerald-400" />
            <span className="text-sm font-bold font-cinzel text-emerald-400">{activatedCount}</span>
            <span className="text-xs text-[var(--color-text-muted)]">de</span>
            <span className="text-sm font-bold font-cinzel text-[var(--color-text-primary)]">{totalCount}</span>
            <span className="text-xs text-[var(--color-text-muted)]">ativados</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-5 flex-shrink-0">
          <div className="h-1.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: totalCount > 0 ? `${(activatedCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-[var(--color-text-muted)]">Progresso das ativações</span>
            <span className="text-[10px] font-semibold text-emerald-400">
              {totalCount > 0 ? Math.round((activatedCount / totalCount) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {/* Pending */}
          {pendingTools.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-0.5">
                Pendentes ({pendingTools.length})
              </p>
              {pendingTools.map(tool => (
                <ActivationCard
                  key={tool.id}
                  tool={tool}
                  result={toolResults.find(r => r.toolId === tool.id)}
                  onActivate={() => onToolResultChange(tool.id, { status: 'activated', activatedAt: new Date().toISOString() })}
                  onSkip={() => onToolResultChange(tool.id, { status: 'skipped' })}
                  onOpenDetail={() => setSelectedTool(tool)}
                />
              ))}
            </div>
          )}

          {/* Completed */}
          {completedTools.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-0.5 mt-4">
                Concluídos ({completedTools.length})
              </p>
              {completedTools.map(tool => (
                <ActivationCard
                  key={tool.id}
                  tool={tool}
                  result={toolResults.find(r => r.toolId === tool.id)}
                  onActivate={() => onToolResultChange(tool.id, { status: 'activated', activatedAt: new Date().toISOString() })}
                  onSkip={() => onToolResultChange(tool.id, { status: 'skipped' })}
                  onOpenDetail={() => setSelectedTool(tool)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTool && (
        <ToolDetailDrawer
          tool={selectedTool}
          result={selectedResult}
          onClose={() => setSelectedTool(null)}
          onStatusChange={status => onToolResultChange(selectedTool.id, { status })}
          onIntensityChange={intensity => onToolResultChange(selectedTool.id, { intensity })}
          onNoteSave={notes => { onToolResultChange(selectedTool.id, { notes }); setSelectedTool(null); }}
        />
      )}
    </>
  );
}

// ─── Stage: Closing ────────────────────────────────────────────
function ClosingStage({ session, hawkinsFinal, reverbDays, onHawkinsFinalSelect, onReverberationSelect, onOpenReport }: {
  session: Session;
  hawkinsFinal: number | null;
  reverbDays: number | null;
  onHawkinsFinalSelect: (value: number) => void;
  onReverberationSelect: (days: number) => void;
  onOpenReport: () => void;
}) {
  const reverbOptions = [7, 14, 21, 28, 35, 42];
  const [closingNotes, setClosingNotes] = useState('');
  const [closingOptions, setClosingOptions] = useState<string[]>([]);

  const CLOSING_OPTS = [
    { value: 'gratitude', label: 'Gratidão', description: 'Oração de gratidão' },
    { value: 'seal', label: 'Selagem', description: 'Selagem energética' },
    { value: 'protection', label: 'Proteção Final', description: 'Escudo protetor' },
    { value: 'anchor', label: 'Ancoragem', description: 'Ancoragem no físico' },
  ];

  return (
    <div className="space-y-7 max-w-3xl">
      <div>
        <h3 className="font-cinzel text-base font-semibold text-[var(--color-text-primary)] mb-0.5">Encerramento</h3>
        <p className="text-sm text-[var(--color-text-muted)]">Finalize a sessão e defina os parâmetros de reverberação</p>
      </div>

      <OptionsStep label="Rituais de Encerramento" options={CLOSING_OPTS} selected={closingOptions} multi={true} onSelect={setClosingOptions} />

      <div>
        <h4 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Nível Hawkins Final</h4>
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {HAWKINS_LEVELS.map(level => (
            <HawkinsCard key={level.value} level={level} selected={hawkinsFinal === level.value} onClick={() => onHawkinsFinalSelect(level.value)} />
          ))}
        </div>
      </div>

      {hawkinsFinal && session.hawkinsInitial && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5">
          <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Evolução Vibracional</p>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] text-[var(--color-text-muted)] mb-1">Inicial</p>
              <p className="text-3xl font-bold font-cinzel" style={{ color: HAWKINS_LEVELS.find(h => h.value === session.hawkinsInitial)?.color }}>
                {session.hawkinsInitial}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: HAWKINS_LEVELS.find(h => h.value === session.hawkinsInitial)?.color }}>
                {HAWKINS_LEVELS.find(h => h.value === session.hawkinsInitial)?.label}
              </p>
            </div>
            <div className="text-[var(--color-text-muted)] text-sm">→</div>
            <div className="text-center">
              <p className="text-[10px] text-[var(--color-text-muted)] mb-1">Final</p>
              <p className="text-3xl font-bold font-cinzel" style={{ color: HAWKINS_LEVELS.find(h => h.value === hawkinsFinal)?.color }}>
                {hawkinsFinal}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: HAWKINS_LEVELS.find(h => h.value === hawkinsFinal)?.color }}>
                {HAWKINS_LEVELS.find(h => h.value === hawkinsFinal)?.label}
              </p>
            </div>
            <div className="ml-auto text-center">
              <p className="text-[10px] text-[var(--color-text-muted)] mb-1">Evolução</p>
              <p className={cn('text-3xl font-bold font-cinzel', hawkinsFinal > session.hawkinsInitial ? 'text-emerald-400' : 'text-red-400')}>
                {hawkinsFinal > session.hawkinsInitial ? '+' : ''}{hawkinsFinal - session.hawkinsInitial}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Período de Reverberação</h4>
        <div className="flex gap-2 flex-wrap">
          {reverbOptions.map(days => (
            <button
              key={days}
              onClick={() => onReverberationSelect(days)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all hover:scale-[1.02]',
                reverbDays === days
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/12 text-[var(--color-gold)] shadow-lg shadow-[var(--color-gold)]/15'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
              )}
            >
              {days} dias
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Notas de Encerramento</p>
        <textarea
          value={closingNotes}
          onChange={e => setClosingNotes(e.target.value)}
          rows={4}
          className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] resize-none focus:outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-[var(--color-text-muted)]"
          placeholder="Observações finais sobre a sessão..."
        />
      </div>

      <button
        onClick={onOpenReport}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-[var(--color-gold)]/30 bg-[var(--color-gold)]/8 text-[var(--color-gold)] font-semibold hover:bg-[var(--color-gold)]/15 transition-all hover:scale-[1.005]"
      >
        <FileText size={18} />
        <span>Gerar Pré-visualização do Relatório</span>
      </button>
    </div>
  );
}

// ─── Voice Note Bar ────────────────────────────────────────────
function VoiceNoteBar({ globalRecording, onToggleRecording, savedAt }: {
  globalRecording: boolean;
  onToggleRecording: () => void;
  savedAt: string;
}) {
  const [tick, setTick] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!globalRecording) { setTime(0); return; }
    const id = setInterval(() => { setTick(t => t + 1); setTime(t => t + 1); }, 100);
    return () => clearInterval(id);
  }, [globalRecording]);

  return (
    <div className="border-t border-[var(--color-border)] px-5 py-2.5 flex items-center gap-3 bg-[var(--color-surface-0)] flex-shrink-0">
      <button
        onClick={onToggleRecording}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex-shrink-0',
          globalRecording
            ? 'border-red-500 bg-red-500/12 text-red-400'
            : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]'
        )}
      >
        {globalRecording ? <Square size={11} fill="currentColor" /> : <Mic size={11} />}
        {globalRecording ? 'Parar' : 'Nota de voz'}
      </button>

      <div className="flex items-center gap-[2px] h-6 flex-1">
        {Array.from({ length: 32 }).map((_, i) => {
          const h = globalRecording
            ? 2 + Math.abs(Math.sin(tick * 0.25 + i * 0.4)) * 16
            : 2;
          return (
            <div
              key={i}
              className={cn('w-[2px] rounded-full transition-all duration-75', globalRecording ? 'bg-red-400' : 'bg-[var(--color-border)]')}
              style={{ height: `${h}px` }}
            />
          );
        })}
      </div>

      {globalRecording && (
        <span className="text-[10px] font-mono text-red-400 flex-shrink-0">
          {String(Math.floor(time / 10 / 60)).padStart(2, '0')}:{String(Math.floor(time / 10) % 60).padStart(2, '0')}
        </span>
      )}

      <div className="ml-auto flex items-center gap-1.5 text-[var(--color-text-muted)] flex-shrink-0">
        <Save size={11} />
        <span className="text-[10px]">{MOCK_SAVE_LABELS.savedAt(savedAt)}</span>
      </div>
    </div>
  );
}

// ─── AI Assistant Panel ────────────────────────────────────────
function AssistantPanel({ session, currentStage, toolResults }: { session: Session; currentStage: string; toolResults: ToolResult[] }) {
  const stageGuidance: Record<string, { title: string; tips: string[] }> = {
    preparation: { title: 'Preparação', tips: ['Centre-se e estabeleça a intenção.', 'Reveja o histórico do cliente.', 'Defina o nível Hawkins inicial.'] },
    connection:  { title: 'Conexão',    tips: ['Estabeleça a ligação radiônica.', 'Respire fundo e sintonize com o campo.', 'Aguarde confirmação de ligação.'] },
    diagnosis:   { title: 'Diagnóstico', tips: ['Analise cada gráfico com neutralidade.', 'Identifique antes de ativar.', 'Registe padrões que emergem.'] },
    activations: { title: 'Ativações',  tips: ['Ative apenas os gráficos identificados.', 'Intenção clara em cada ativação.', 'Siga a ordem de prioridade.'] },
    closing:     { title: 'Encerramento', tips: ['Registe o Hawkins final.', 'Defina o período de reverberação.', 'Finalize com oração de encerramento.'] },
  };

  const guidance = stageGuidance[currentStage] || stageGuidance.preparation;
  const identifiedCount  = toolResults.filter(r => r.status === 'identified').length;
  const activatedCount   = toolResults.filter(r => r.status === 'activated').length;
  const hasActivity      = identifiedCount > 0 || activatedCount > 0;

  return (
    <div className="w-64 flex-shrink-0 border-l border-[var(--color-border)] flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center">
            <Sparkles size={13} style={{ color: 'var(--color-gold)' }} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-primary)]">Assistente</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Orientação em tempo real</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-3">
          <p className="text-[9px] font-bold text-[var(--color-gold)] uppercase tracking-widest mb-2">{guidance.title}</p>
          <ul className="space-y-1.5">
            {guidance.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--color-gold)] mt-1.5 flex-shrink-0" />
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">{tip}</p>
              </li>
            ))}
          </ul>
        </div>

        {hasActivity && (
          <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-3">
            <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Gráficos</p>
            <div className="flex gap-2">
              <div className="flex-1 text-center">
                <p className="text-lg font-bold font-cinzel text-sky-400">{identifiedCount}</p>
                <p className="text-[9px] text-sky-400/70">Ident.</p>
              </div>
              <div className="w-px bg-[var(--color-border)]" />
              <div className="flex-1 text-center">
                <p className="text-lg font-bold font-cinzel text-emerald-400">{activatedCount}</p>
                <p className="text-[9px] text-emerald-400/70">Ativos</p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-3 space-y-1.5">
          <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Contexto</p>
          <div className="flex items-center gap-2">
            <User size={10} className="text-[var(--color-text-muted)]" />
            <span className="text-[11px] text-[var(--color-text-secondary)]">{session.clientName}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={10} className="text-[var(--color-text-muted)]" />
            <span className="text-[11px] text-[var(--color-text-secondary)]">{session.methodologyName}</span>
          </div>
          {session.hawkinsInitial && (
            <div className="flex items-center gap-2">
              <Info size={10} className="text-[var(--color-text-muted)]" />
              <span className="text-[11px] text-[var(--color-text-secondary)]">Hawkins: {session.hawkinsInitial}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Workspace ────────────────────────────────────────────
export default function WorkspacePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', id],
    queryFn: () => getSessionById(id),
    enabled: !!id,
  });

  const [currentStage, setCurrentStage] = useState(session?.currentStageCode || 'preparation');
  const [saved, setSaved] = useState(false);
  const [globalRecording, setGlobalRecording] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [savedAt, setSavedAt] = useState(
    () => new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
  );

  useEffect(() => {
    if (session?.currentStageCode) {
      setCurrentStage(session.currentStageCode);
    }
  }, [session?.id, session?.currentStageCode]);

  // ── Central session state ──────────────────────────────────
  const sessionState = useSessionState(session ?? { id, methodologyId: '' });
  const {
    toolResults,
    hawkinsInitial,
    hawkinsFinal,
    reverbDays,
    setToolResult,
    setHawkinsInitial,
    setHawkinsFinal,
    setReverbDays,
    stageCompletion,
    sessionSnapshot,
  } = sessionState;

  const stageCompletionMap: Record<string, boolean> = { ...stageCompletion };

  // Unified handler — used by both Diagnosis and Activations
  const handleToolResultChange = useCallback((toolId: string, patch: Partial<Omit<ToolResult, 'toolId'>>) => {
    setToolResult(toolId, patch);
  }, [setToolResult]);

  const handleSave = async () => {
    if (!session) return;
    await updateSession(id, {
      hawkinsInitial: hawkinsInitial ?? undefined,
      hawkinsFinal: hawkinsFinal ?? undefined,
      reverberationDays: reverbDays ?? undefined,
      currentStageCode: currentStage,
      status: session.status === 'draft' ? 'in_progress' : session.status,
    });
    await queryClient.invalidateQueries({ queryKey: ['session', id] });
    await queryClient.invalidateQueries({ queryKey: ['sessions'] });
    const now = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    setSavedAt(now);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-void)]">
        <p className="text-sm text-[var(--color-text-muted)]">A carregar sessão…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-void)]">
        <div className="text-center space-y-3">
          <AlertCircle size={40} className="mx-auto text-[var(--color-text-muted)]" />
          <p className="text-[var(--color-text-primary)] font-medium">Sessão não encontrada</p>
          <button onClick={() => navigate('/sessions')} className="text-sm text-[var(--color-gold)] hover:underline">
            Voltar às sessões
          </button>
        </div>
      </div>
    );
  }

  const stages: SessionStage[] = session.stages.length > 0 ? session.stages : [
    { code: 'preparation', label: 'Preparação',  status: 'in_progress', steps: [] },
    { code: 'connection',  label: 'Conexão',      status: 'not_started', steps: [] },
    { code: 'diagnosis',   label: 'Diagnóstico',  status: 'not_started', steps: [] },
    { code: 'activations', label: 'Ativações',    status: 'not_started', steps: [] },
    { code: 'closing',     label: 'Encerramento', status: 'not_started', steps: [] },
  ];

  const currentIdx  = stages.findIndex(s => s.code === currentStage);
  const activeStage = stages[currentIdx] || stages[0];
  const canGoNext   = currentIdx < stages.length - 1;
  const canGoPrev   = currentIdx > 0;

  return (
    <div className="flex flex-col h-screen bg-[var(--color-void)] overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-0)] flex-shrink-0">
        <button
          onClick={() => navigate('/sessions')}
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Sessões</span>
        </button>
        <div className="w-px h-4 bg-[var(--color-border)]" />
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-gold)] flex-shrink-0">
            {session.clientName[0]}
          </div>
          <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{session.clientName}</span>
          <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline">· {session.methodologyName}</span>
        </div>

        {/* Stage breadcrumb */}
        <div className="hidden lg:flex items-center gap-1 mx-2">
          {stages.map(s => (
            <button
              key={s.code}
              onClick={() => setCurrentStage(s.code)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all',
                s.code === currentStage
                  ? 'bg-[var(--color-teal)]/15 text-[var(--color-teal)]'
                  : stageCompletionMap[s.code]
                    ? 'text-emerald-400 hover:bg-[var(--color-surface-1)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)]'
              )}
            >
              {stageCompletionMap[s.code] && s.code !== currentStage && <Check size={9} />}
              {s.code === currentStage && <div className="w-1 h-1 rounded-full bg-[var(--color-teal)]" />}
              {s.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setCurrentStage(stages[Math.max(0, currentIdx - 1)].code)} disabled={!canGoPrev} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] disabled:opacity-30">
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium hidden md:block w-24 text-center">{activeStage.label}</span>
          <button onClick={() => setCurrentStage(stages[Math.min(stages.length - 1, currentIdx + 1)].code)} disabled={!canGoNext} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] disabled:opacity-30">
            <ChevronRight size={14} />
          </button>

          <div className="w-px h-4 bg-[var(--color-border)] mx-1" />

          <button
            onClick={handleSave}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
              saved ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
            )}
          >
            {saved ? <CheckCircle2 size={11} /> : <Save size={11} />}
            {saved ? MOCK_SAVE_LABELS.saved : 'Guardar'}
          </button>

          <button
            onClick={() => setShowReportPreview(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-gold)]/35 bg-[var(--color-gold)]/8 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/15 transition-all"
          >
            <FileText size={11} />
            <span className="hidden sm:inline">Relatório</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <StageSidebar
          stages={stages}
          currentStage={currentStage}
          stageCompletion={stageCompletionMap}
          onSelectStage={setCurrentStage}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5">
            {currentStage === 'preparation' && (
              <PreparationStage session={session} hawkinsInitial={hawkinsInitial} onHawkinsSelect={setHawkinsInitial} />
            )}
            {currentStage === 'connection' && (
              <ConnectionStage session={session} />
            )}
            {currentStage === 'diagnosis' && (
              <DiagnosisStage session={session} toolResults={toolResults} onToolResultChange={handleToolResultChange} />
            )}
            {currentStage === 'activations' && (
              <ActivationsStage session={session} toolResults={toolResults} onToolResultChange={handleToolResultChange} />
            )}
            {currentStage === 'closing' && (
              <ClosingStage
                session={session}
                hawkinsFinal={hawkinsFinal}
                reverbDays={reverbDays}
                onHawkinsFinalSelect={setHawkinsFinal}
                onReverberationSelect={setReverbDays}
                onOpenReport={() => setShowReportPreview(true)}
              />
            )}
          </div>
          <VoiceNoteBar globalRecording={globalRecording} onToggleRecording={() => setGlobalRecording(r => !r)} savedAt={savedAt} />
        </div>

        <AssistantPanel session={session} currentStage={currentStage} toolResults={toolResults} />
      </div>

      {/* Report Preview Modal */}
      {showReportPreview && (
        <ReportPreviewModal
          session={session}
          snapshot={sessionSnapshot}
          onClose={() => setShowReportPreview(false)}
          onGenerate={() => { setShowReportPreview(false); navigate('/reports'); }}
        />
      )}
    </div>
  );
}
