import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Share2, Eye, FileText, Sparkles,
  Lock, EyeOff, Globe, ChevronRight, Save, RotateCcw,
  MessageSquare, Mic, User2, Wand2, Send, Download, Link2,
  AlertCircle, Clock, Copy, Check, Mail, MessageCircle,
  Phone, ExternalLink, Info, Pencil, ShieldCheck, Calendar,
  XCircle, AlertTriangle, History,
} from 'lucide-react';
import { getReportV2ById, getClientById, SESSIONS } from '@/data/mock-data';
import { useReportState } from '@/lib/report-state';
import { cn } from '@/lib/utils';
import type {
  ReportSectionCode, SectionVisibility, ReportStatus, SourceTrace, ReportV2, ReportSection
} from '@/types';

// ─── CONSTANTS ────────────────────────────────────────────────

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; bg: string; border: string }> = {
  draft:     { label: 'Rascunho',    color: 'text-[var(--color-text-muted)]',  bg: 'bg-transparent',                     border: 'border-[var(--color-border)]' },
  in_review: { label: 'Em revisão',  color: 'text-amber-400',                  bg: 'bg-amber-500/10',                    border: 'border-amber-500/40' },
  approved:  { label: 'Aprovado',    color: 'text-emerald-400',                bg: 'bg-emerald-500/10',                  border: 'border-emerald-500/40' },
  shared:    { label: 'Partilhado',  color: 'text-[var(--color-gold)]',        bg: 'bg-[var(--color-gold)]/10',          border: 'border-[var(--color-gold)]/40' },
};

const STATUS_STEPS: ReportStatus[] = ['draft', 'in_review', 'approved', 'shared'];

const SECTION_ORDER: ReportSectionCode[] = [
  'client', 'session_objective', 'hawkins_evolution',
  'identified_tools', 'activated_tools', 'therapist_notes',
  'final_interpretation', 'recommendations', 'reverberation', 'next_steps',
];

const REQUIRED_SECTIONS: ReportSectionCode[] = [
  'session_objective', 'hawkins_evolution', 'final_interpretation', 'recommendations',
];

const VISIBILITY_CONFIG: Record<SectionVisibility, { label: string; icon: React.ReactNode; color: string }> = {
  included:           { label: 'Incluído',             icon: <Globe size={11} />,   color: 'text-emerald-400' },
  hidden_from_client: { label: 'Oculto ao cliente',    icon: <EyeOff size={11} />,  color: 'text-amber-400' },
  private:            { label: 'Privado',               icon: <Lock size={11} />,    color: 'text-[var(--color-text-muted)]' },
};

// Source badge styles
const SOURCE_BADGE: Record<SourceTrace, { label: string; bg: string; text: string; border: string }> = {
  session_field:    { label: 'Da Sessão',      bg: 'bg-sky-500/10',    text: 'text-sky-400',    border: 'border-sky-500/30' },
  tool_note:        { label: 'Nota de Gráfico', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  voice_transcript: { label: 'Transcrição',    bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/30' },
  therapist_edit:   { label: 'Terapeuta',      bg: 'bg-[var(--color-gold)]/10', text: 'text-[var(--color-gold)]', border: 'border-[var(--color-gold)]/30' },
  ai_draft:         { label: 'Rascunho IA',    bg: 'bg-teal-500/10',   text: 'text-teal-400',   border: 'border-teal-500/30' },
};

const SECTION_EMPTY_HINT: Partial<Record<ReportSectionCode, string>> = {
  session_objective:   'Descreve o objetivo principal desta sessão para o cliente.',
  hawkins_evolution:   'Regista a evolução do nível Hawkins medido antes e após a sessão.',
  identified_tools:    'Lista os gráficos identificados durante a sessão.',
  activated_tools:     'Descreve as ferramentas ativadas e como foram usadas.',
  therapist_notes:     'Adiciona notas internas relevantes para acompanhamento.',
  final_interpretation:'Partilha a tua interpretação final do trabalho realizado.',
  recommendations:     'Indica as recomendações para o cliente seguir após a sessão.',
  reverberation:       'Descreve o processo de reverberação e duração esperada.',
  next_steps:          'Indica os próximos passos e sugestões para a próxima sessão.',
};

// ─── HELPERS ──────────────────────────────────────────────────

function SaveBadge({ state }: { state: 'saved' | 'unsaved' | 'saving' }) {
  if (state === 'saving') return (
    <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      A guardar...
    </span>
  );
  if (state === 'unsaved') return (
    <span className="flex items-center gap-1 text-[10px] text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Não guardado
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
      <Check size={10} className="text-emerald-400" />
      Guardado
    </span>
  );
}

function SourceBadge({ source }: { source: SourceTrace }) {
  const cfg = SOURCE_BADGE[source];
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border',
      cfg.bg, cfg.text, cfg.border
    )}>
      <Info size={9} />
      {cfg.label}
    </span>
  );
}

// ─── COMPLETION CARD ──────────────────────────────────────────

function CompletionCard({ sections }: { sections: ReportV2['sections'] }) {
  const nonPrivate = sections.filter(s => s.visibility !== 'private');
  const withContent = nonPrivate.filter(s => s.content.trim() !== '');
  const score = nonPrivate.length > 0 ? Math.round((withContent.length / nonPrivate.length) * 100) : 0;

  const color =
    score >= 80 ? 'text-emerald-400' :
    score >= 50 ? 'text-amber-400' :
    'text-red-400';

  const barColor =
    score >= 80 ? 'bg-emerald-400' :
    score >= 50 ? 'bg-amber-400' :
    'bg-red-400';

  const label =
    score === 100 ? 'Completo' :
    score >= 80 ? 'Quase pronto' :
    score >= 50 ? 'Em progresso' :
    'Incompleto';

  return (
    <div className="p-3 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Completude</p>
        <span className={cn('text-sm font-bold font-cinzel', color)}>{score}%</span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className={cn('text-[10px] font-medium', color)}>{label}</span>
        <span className="text-[10px] text-[var(--color-text-muted)]">{withContent.length}/{nonPrivate.length} secções</span>
      </div>
    </div>
  );
}

// ─── CLIENT HISTORY CARD ──────────────────────────────────────

function ClientHistoryCard({ clientId, currentSessionId }: { clientId: string; currentSessionId: string }) {
  const pastSessions = SESSIONS
    .filter(s => s.clientId === clientId && s.id !== currentSessionId)
    .sort((a, b) => {
      const da = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const db = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      return db - da;
    })
    .slice(0, 3);

  if (pastSessions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <History size={10} className="text-[var(--color-text-muted)]" />
        <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Sessões anteriores</p>
      </div>
      <div className="space-y-1.5">
        {pastSessions.map(s => (
          <div key={s.id} className="flex items-start gap-2 p-2 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border)]">
            <Calendar size={10} className="text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[var(--color-text-secondary)] truncate">{s.methodologyName}</p>
              <p className="text-[9px] text-[var(--color-text-muted)]">
                {s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString('pt-PT') : '—'}
              </p>
            </div>
            <span className={cn(
              'text-[9px] px-1.5 py-0.5 rounded-md border flex-shrink-0',
              s.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
              s.status === 'in_progress' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
              'text-[var(--color-text-muted)] bg-[var(--color-surface-2)] border-[var(--color-border)]'
            )}>
              {s.status === 'completed' ? 'Concluída' : s.status === 'in_progress' ? 'Em curso' : 'Agendada'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VALIDATION MODAL ─────────────────────────────────────────

function ValidationModal({
  sections,
  onConfirm,
  onClose,
}: {
  sections: ReportV2['sections'];
  onConfirm: () => void;
  onClose: () => void;
}) {
  const checks = REQUIRED_SECTIONS.map(code => {
    const s = sections.find(sec => sec.code === code);
    return {
      code,
      title: s?.title ?? code,
      ok: !!(s?.content?.trim()),
    };
  });

  const allOk = checks.every(c => c.ok);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            {allOk ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={16} className="text-amber-400" />
            )}
            <h3 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">
              {allOk ? 'Pronto para submeter' : 'Verificar antes de submeter'}
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] ml-6">
            {allOk
              ? 'Todas as secções obrigatórias estão preenchidas.'
              : 'Algumas secções importantes estão em falta. Podes submeter mesmo assim.'}
          </p>
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          {checks.map(c => (
            <div key={c.code} className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--color-surface-2)]">
              {c.ok ? (
                <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
              )}
              <span className={cn('text-xs', c.ok ? 'text-[var(--color-text-secondary)]' : 'text-amber-300')}>
                {c.title}
              </span>
              {!c.ok && (
                <span className="text-[9px] text-amber-400 ml-auto">Vazio</span>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={cn(
              'w-full py-2.5 rounded-xl text-sm font-medium transition-colors',
              allOk
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]/80'
            )}
          >
            {allOk ? 'Submeter para revisão' : 'Submeter mesmo assim'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            Revisar primeiro
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SHARE MODAL ─────────────────────────────────────────────

function ShareModal({
  report,
  onClose,
  onShare,
}: {
  report: ReportV2;
  onClose: () => void;
  onShare: (method: 'hub' | 'email' | 'link') => void;
}) {
  const client = getClientById(report.clientId);
  const [copied, setCopied] = useState(false);
  const portalUrl = `https://app.radionics.io/report/${report.id}/view`;

  const hasHub = client?.clientType === 'hub_user';
  const hasEmail = !!client?.email;
  const hasWhatsapp = !!client?.whatsapp;
  const hasTelegram = !!client?.telegram;

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (report.status !== 'approved') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-sm bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertCircle size={18} />
            <h3 className="font-cinzel font-semibold text-sm">Relatório não aprovado</h3>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            Aprova o relatório antes de o partilhar com o cliente.
          </p>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-5">
        <div>
          <h3 className="font-cinzel text-base font-semibold text-[var(--color-text-primary)]">Partilhar Relatório</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Escolha como partilhar com {report.clientName}
          </p>
        </div>

        {/* Portal link */}
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Link do portal</p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <Link2 size={13} className="text-[var(--color-text-muted)] flex-shrink-0" />
            <span className="text-xs text-[var(--color-text-muted)] flex-1 truncate">{portalUrl}</span>
            <button onClick={handleCopy} className={cn('text-xs flex items-center gap-1 transition-colors flex-shrink-0', copied ? 'text-emerald-400' : 'text-[var(--color-gold)] hover:opacity-80')}>
              {copied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
            </button>
          </div>
        </div>

        {/* Share options */}
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Enviar para</p>
          <div className="space-y-2">
            {hasHub && (
              <button
                onClick={() => onShare('hub')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center">
                  <Globe size={15} className="text-[var(--color-gold)]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">HUB do Cliente</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Disponível na área pessoal do cliente</p>
                </div>
                <ChevronRight size={13} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-gold)] transition-colors" />
              </button>
            )}
            {hasEmail && (
              <button
                onClick={() => onShare('email')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:border-sky-500/40 hover:bg-sky-500/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                  <Mail size={15} className="text-sky-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Email</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{client?.email}</p>
                </div>
                <ChevronRight size={13} className="text-[var(--color-text-muted)] group-hover:text-sky-400 transition-colors" />
              </button>
            )}
            {hasWhatsapp && (
              <button
                onClick={() => { handleCopy(); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <MessageCircle size={15} className="text-emerald-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">WhatsApp</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{client?.whatsapp} · Copiar link</p>
                </div>
                <ChevronRight size={13} className="text-[var(--color-text-muted)] group-hover:text-emerald-400 transition-colors" />
              </button>
            )}
            {hasTelegram && (
              <button
                onClick={() => { handleCopy(); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:border-sky-400/40 hover:bg-sky-400/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center">
                  <Send size={15} className="text-sky-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Telegram</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{client?.telegram} · Copiar link</p>
                </div>
                <ChevronRight size={13} className="text-[var(--color-text-muted)] group-hover:text-sky-400 transition-colors" />
              </button>
            )}
            {!hasHub && !hasEmail && !hasWhatsapp && !hasTelegram && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <AlertCircle size={13} className="text-amber-400 flex-shrink-0" />
                <p className="text-xs text-[var(--color-text-muted)]">Sem contacto registado para este cliente. Copia o link manualmente.</p>
              </div>
            )}
            {/* PDF export always available */}
            <button
              onClick={onClose}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)] transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center">
                <Download size={15} className="text-[var(--color-text-muted)]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Exportar PDF</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">Download do relatório formatado</p>
              </div>
              <ChevronRight size={13} className="text-[var(--color-text-muted)] transition-colors" />
            </button>
          </div>
        </div>

        <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors">
          Fechar
        </button>
      </div>
    </div>
  );
}

// ─── SECTION EDITOR (CENTER) ──────────────────────────────────

function SectionEditor({
  section,
  onContentChange,
  onVisibilityChange,
  onApplyDraft,
}: {
  section: ReportSection;
  onContentChange: (content: string) => void;
  onVisibilityChange: (v: SectionVisibility) => void;
  onApplyDraft: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* Section meta bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Visibility picker */}
        <div className="flex items-center gap-1">
          {(['included', 'hidden_from_client', 'private'] as SectionVisibility[]).map(v => {
            const cfg = VISIBILITY_CONFIG[v];
            return (
              <button
                key={v}
                onClick={() => onVisibilityChange(v)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-all',
                  section.visibility === v
                    ? `${cfg.color} border-current bg-current/10`
                    : 'text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                )}
              >
                {cfg.icon}
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Source badge */}
        <span className="ml-auto">
          <SourceBadge source={section.sourceTrace} />
        </span>
      </div>

      {/* Content */}
      {section.isReadOnly ? (
        <div className="relative">
          {section.content ? (
            <div className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-secondary)] min-h-[80px] whitespace-pre-wrap leading-relaxed">
              {section.content}
            </div>
          ) : (
            <div className="w-full bg-[var(--color-surface-1)] border border-dashed border-[var(--color-border)] rounded-xl px-3 py-6 text-center space-y-2">
              <Lock size={18} className="mx-auto text-[var(--color-text-muted)] opacity-40" />
              <p className="text-xs text-[var(--color-text-muted)] opacity-60">Sem dados registados</p>
              {SECTION_EMPTY_HINT[section.code as ReportSectionCode] && (
                <p className="text-[10px] text-[var(--color-text-muted)] opacity-40 max-w-xs mx-auto">
                  {SECTION_EMPTY_HINT[section.code as ReportSectionCode]}
                </p>
              )}
            </div>
          )}
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded-md border border-[var(--color-border)]">
            <Lock size={8} />
            Só leitura
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
            Para corrigir estes dados, edita a sessão diretamente.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {!section.content && !section.aiDraft && (
            <div className="p-3 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-1)]/40 text-center space-y-1 mb-1">
              <Pencil size={14} className="mx-auto text-[var(--color-text-muted)] opacity-30" />
              <p className="text-[10px] text-[var(--color-text-muted)] opacity-50">
                {SECTION_EMPTY_HINT[section.code as ReportSectionCode] ?? 'Esta secção ainda está vazia.'}
              </p>
            </div>
          )}
          <textarea
            value={section.content}
            onChange={e => onContentChange(e.target.value)}
            placeholder={section.aiDraft ? 'Escreve ou usa o rascunho IA abaixo...' : 'Escreve aqui...'}
            rows={5}
            className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-text-muted)] transition-colors resize-none leading-relaxed"
          />
          {/* AI draft hint */}
          {section.aiDraft && !section.content && (
            <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Wand2 size={11} className="text-teal-400" />
                <span className="text-[10px] font-medium text-teal-400 uppercase tracking-wider">Sugestão IA · Rascunho para revisão</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">{section.aiDraft}</p>
              <button
                onClick={onApplyDraft}
                className="flex items-center gap-1 text-xs text-teal-400 hover:opacity-80 transition-opacity"
              >
                <Check size={11} />
                Usar este rascunho
              </button>
            </div>
          )}
          {section.aiDraft && section.content && section.sourceTrace === 'ai_draft' && (
            <p className="text-[10px] text-teal-400 flex items-center gap-1">
              <Wand2 size={9} />
              Baseado em rascunho IA · Edita para personalizar
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────

export default function ReportDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const initial = getReportV2ById(id);
  const [showShare, setShowShare] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  if (!initial) {
    return (
      <div className="flex items-center justify-center min-h-full bg-[var(--color-void)]">
        <div className="text-center space-y-3">
          <FileText size={40} className="mx-auto text-[var(--color-text-muted)] opacity-30" />
          <p className="text-[var(--color-text-primary)] font-medium">Relatório não encontrado</p>
          <button onClick={() => navigate('/reports')} className="text-sm text-[var(--color-gold)] hover:underline">
            Voltar aos relatórios
          </button>
        </div>
      </div>
    );
  }

  const {
    report, saveState, activeSection, setActiveSection,
    updateSectionContent, updateSectionVisibility, applyAiDraft,
    saveDraft, submitForReview, approve, reopenForEditing,
    shareViaHub, shareViaEmail, generatePortalLink,
    isGeneratingAI, generateAIDraft,
  } = useReportState(initial);

  const currentStepIdx = STATUS_STEPS.indexOf(report.status);
  const sections = SECTION_ORDER.map(code => report.sections.find(s => s.code === code)).filter(Boolean) as typeof report.sections;
  const activeS = activeSection ? sections.find(s => s.code === activeSection) || sections[0] : sections[0];

  const handleShare = (method: 'hub' | 'email' | 'link') => {
    if (method === 'hub') shareViaHub();
    if (method === 'email') shareViaEmail();
    if (method === 'link') generatePortalLink();
    setShowShare(false);
    setShareSuccess(method === 'hub' ? 'Partilhado no HUB do cliente' : method === 'email' ? 'Email enviado' : 'Link copiado');
    setTimeout(() => setShareSuccess(null), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-void)] overflow-hidden">
      {/* Share modal */}
      {showShare && (
        <ShareModal report={report} onClose={() => setShowShare(false)} onShare={handleShare} />
      )}

      {/* Validation modal */}
      {showValidation && (
        <ValidationModal
          sections={report.sections}
          onConfirm={submitForReview}
          onClose={() => setShowValidation(false)}
        />
      )}

      {/* Toast */}
      {shareSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface-1)] border border-emerald-500/40 rounded-full shadow-xl">
          <Check size={13} className="text-emerald-400" />
          <span className="text-sm text-[var(--color-text-primary)]">{shareSuccess}</span>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <div className="flex items-center justify-between gap-3">
          {/* Left: breadcrumb + title */}
          <div className="min-w-0">
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-1.5"
            >
              <ArrowLeft size={12} />
              Relatórios
            </button>
            <h1 className="font-cinzel text-lg font-semibold text-[var(--color-text-primary)] truncate">
              {report.clientName}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {report.methodologyName} · {new Date(report.sessionDate).toLocaleDateString('pt-PT')}
            </p>
          </div>

          {/* Right: status + actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SaveBadge state={saveState} />

            {/* Status flow pills */}
            <div className="hidden md:flex items-center gap-1">
              {STATUS_STEPS.map((step, idx) => {
                const cfg = STATUS_CONFIG[step];
                const isActive = step === report.status;
                const isPast = idx < currentStepIdx;
                return (
                  <div key={step} className="flex items-center gap-0.5">
                    <div className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all',
                      isActive ? `${cfg.color} ${cfg.bg} ${cfg.border}` :
                      isPast ? 'text-emerald-400 border-emerald-500/30' :
                      'text-[var(--color-text-muted)] border-[var(--color-border)]'
                    )}>
                      {isPast && <CheckCircle2 size={9} />}
                      {cfg.label}
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={cn('w-3 h-px', idx < currentStepIdx ? 'bg-emerald-500/40' : 'bg-[var(--color-border)]')} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            {report.status === 'draft' && (
              <>
                <button onClick={saveDraft} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors">
                  <Save size={12} />
                  Guardar
                </button>
                <button
                  onClick={() => setShowValidation(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <Eye size={12} />
                  Submeter
                </button>
              </>
            )}
            {report.status === 'in_review' && (
              <>
                <button onClick={reopenForEditing} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors">
                  <RotateCcw size={12} />
                  Reabrir
                </button>
                <button onClick={approve} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                  <ShieldCheck size={12} />
                  Aprovar
                </button>
              </>
            )}
            {report.status === 'approved' && (
              <>
                <button onClick={reopenForEditing} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors">
                  <RotateCcw size={12} />
                  Reabrir
                </button>
                <button
                  onClick={() => navigate(`/reports/${id}/pdf`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
                >
                  <FileText size={12} />
                  PDF
                </button>
                <button
                  onClick={() => navigate(`/reports/${id}/preview`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
                >
                  <Eye size={12} />
                  Ver como cliente
                </button>
                <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-xs font-semibold hover:opacity-90 transition-opacity">
                  <Share2 size={12} />
                  Partilhar
                </button>
              </>
            )}
            {report.status === 'shared' && (
              <>
                <button
                  onClick={() => navigate(`/reports/${id}/pdf`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
                >
                  <FileText size={12} />
                  PDF
                </button>
                <button
                  onClick={() => navigate(`/reports/${id}/preview`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
                >
                  <Eye size={12} />
                  Ver como cliente
                </button>
                <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-xs font-medium text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 transition-colors">
                  <Share2 size={12} />
                  Partilhado
                </button>
              </>
            )}
          </div>
        </div>

        {/* AI draft bar */}
        {(report.status === 'draft' || report.status === 'in_review') && (
          <div className="mt-3 flex items-center gap-3 p-2.5 rounded-xl bg-teal-500/5 border border-teal-500/20">
            <Wand2 size={13} className="text-teal-400 flex-shrink-0" />
            <span className="text-xs text-[var(--color-text-muted)] flex-1">
              Gerar rascunho IA a partir da sessão
            </span>
            <button
              onClick={generateAIDraft}
              disabled={isGeneratingAI}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 border border-teal-500/30 text-xs font-medium text-teal-400 hover:bg-teal-500/30 disabled:opacity-50 transition-all"
            >
              {isGeneratingAI ? (
                <><span className="w-2.5 h-2.5 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" /> A gerar...</>
              ) : (
                <><Sparkles size={11} /> Gerar rascunho IA</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── 3-COLUMN BODY ──────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* COL 1 — Sections nav */}
        <div className="w-56 flex-shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-y-auto">
          <div className="p-3 space-y-0.5">
            <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-2 mb-2">Secções</p>
            {sections.map(s => {
              const vis = VISIBILITY_CONFIG[s.visibility];
              const isActive = s.code === (activeSection || sections[0]?.code);
              const hasContent = !!s.content;
              const isRequired = REQUIRED_SECTIONS.includes(s.code as ReportSectionCode);
              return (
                <button
                  key={s.code}
                  onClick={() => setActiveSection(s.code)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all',
                    isActive
                      ? 'bg-[var(--color-gold)]/10 text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)] hover:text-[var(--color-text-secondary)]'
                  )}
                >
                  <span className={cn('flex-shrink-0', vis.color)}>{vis.icon}</span>
                  <span className="text-xs flex-1 truncate">{s.title}</span>
                  {!hasContent && isRequired && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 flex-shrink-0" />
                  )}
                  {hasContent && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]/40 flex-shrink-0" />
                  )}
                  {isActive && <ChevronRight size={11} className="text-[var(--color-gold)] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* COL 2 — Editable content */}
        <div className="flex-1 min-w-0 overflow-y-auto p-6">
          {activeS ? (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h2 className="font-cinzel text-base font-semibold text-[var(--color-text-primary)]">{activeS.title}</h2>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                  {activeS.isReadOnly ? 'Dados da sessão · não editável aqui' : 'Editável pelo terapeuta'}
                </p>
              </div>
              <SectionEditor
                section={activeS}
                onContentChange={(content) => updateSectionContent(activeS.code, content)}
                onVisibilityChange={(v) => updateSectionVisibility(activeS.code, v)}
                onApplyDraft={() => applyAiDraft(activeS.code)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[var(--color-text-muted)]">Seleciona uma secção</p>
            </div>
          )}
        </div>

        {/* COL 3 — Right sidebar */}
        <div className="w-64 flex-shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-y-auto">
          <div className="p-4 space-y-4">
            <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Resumo da Sessão</p>

            {/* Client */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-xs font-bold text-[var(--color-gold)]">
                  {report.clientName[0]}
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-primary)]">{report.clientName}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{report.methodologyName}</p>
                </div>
              </div>
            </div>

            {/* Completion card */}
            <CompletionCard sections={report.sections} />

            {/* Hawkins */}
            {(report.hawkinsInitial || report.hawkinsFinal) && (
              <div className="p-3 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)]">
                <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Hawkins</p>
                <div className="flex items-center gap-2">
                  {report.hawkinsInitial && (
                    <div className="text-center flex-1">
                      <p className="text-[9px] text-[var(--color-text-muted)]">Inicial</p>
                      <p className="text-lg font-bold font-cinzel text-[var(--color-text-secondary)]">{report.hawkinsInitial}</p>
                    </div>
                  )}
                  {report.hawkinsInitial && report.hawkinsFinal && (
                    <span className="text-[var(--color-text-muted)] text-xs">→</span>
                  )}
                  {report.hawkinsFinal && (
                    <div className="text-center flex-1">
                      <p className="text-[9px] text-[var(--color-text-muted)]">Final</p>
                      <p className="text-lg font-bold font-cinzel" style={{ color: 'var(--color-teal)' }}>{report.hawkinsFinal}</p>
                    </div>
                  )}
                </div>
                {report.hawkinsInitial && report.hawkinsFinal && (
                  <p className={cn(
                    'text-center text-xs font-medium mt-1',
                    report.hawkinsFinal > report.hawkinsInitial ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {report.hawkinsFinal > report.hawkinsInitial ? '+' : ''}{report.hawkinsFinal - report.hawkinsInitial}
                  </p>
                )}
              </div>
            )}

            {/* Intention */}
            {report.intention && (
              <div className="space-y-1">
                <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Intenção</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic">
                  "{report.intention}"
                </p>
              </div>
            )}

            {/* Tools */}
            {report.snapshot && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Gráficos</p>
                {report.snapshot.tool_results.map(tr => (
                  <div key={tr.toolId} className="flex items-start gap-2 py-1">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-1 flex-shrink-0',
                      tr.status === 'activated' ? 'bg-emerald-400' :
                      tr.status === 'identified' ? 'bg-sky-400' : 'bg-[var(--color-text-muted)]'
                    )} />
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--color-text-secondary)] truncate">{tr.toolName}</p>
                      {tr.notes && <p className="text-[10px] text-[var(--color-text-muted)] leading-snug">{tr.notes}</p>}
                    </div>
                    <span className={cn(
                      'text-[9px] flex-shrink-0',
                      tr.status === 'activated' ? 'text-emerald-400' :
                      tr.status === 'identified' ? 'text-sky-400' : 'text-[var(--color-text-muted)]'
                    )}>
                      {tr.status === 'activated' ? 'Ativado' : tr.status === 'identified' ? 'Identif.' : 'Análise'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Voice transcripts */}
            {report.snapshot?.voice_notes?.length ? (
              <div className="space-y-1.5">
                <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Transcrições</p>
                {report.snapshot.voice_notes.map((note, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border)]">
                    <Mic size={10} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">{note.transcript}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Reverberation */}
            {report.reverberationDays && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border)]">
                <Clock size={11} className="text-[var(--color-text-muted)]" />
                <span className="text-xs text-[var(--color-text-secondary)]">{report.reverberationDays} dias de reverberação</span>
              </div>
            )}

            {/* Client history */}
            <ClientHistoryCard clientId={report.clientId} currentSessionId={report.sessionId} />

            {/* Session link */}
            <button
              onClick={() => navigate(`/sessions/${report.sessionId}`)}
              className="w-full flex items-center gap-2 p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-1)] transition-colors text-left"
            >
              <ExternalLink size={11} className="text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)]">Ver sessão completa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
