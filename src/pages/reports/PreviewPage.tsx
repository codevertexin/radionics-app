// ============================================================
// Report Preview — "View as Client"
// Client-facing view of an approved/shared report
// ============================================================

import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft, Globe, Lock, EyeOff, CheckCircle2,
  Sparkles, Calendar, User2, Zap, Clock, ExternalLink
} from 'lucide-react';
import { getReportV2ById } from '@/data/mock-data';
import { cn } from '@/lib/utils';
import type { ReportSectionCode } from '@/types';

const SECTION_LABELS: Record<ReportSectionCode, string> = {
  client:              'Cliente',
  session_objective:   'Objetivo da Sessão',
  hawkins_evolution:   'Evolução de Hawkins',
  identified_tools:    'Gráficos Identificados',
  activated_tools:     'Gráficos Ativados',
  therapist_notes:     'Notas do Terapeuta',
  final_interpretation:'Interpretação Final',
  recommendations:     'Recomendações',
  reverberation:       'Reverberação',
  next_steps:          'Próximos Passos',
};

export default function ReportPreviewPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const report = getReportV2ById(id);

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-full bg-[var(--color-void)]">
        <div className="text-center space-y-3">
          <p className="text-[var(--color-text-primary)] font-medium">Relatório não encontrado</p>
          <button onClick={() => navigate('/reports')} className="text-sm text-[var(--color-gold)] hover:underline">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (report.status === 'draft' || report.status === 'in_review') {
    return (
      <div className="flex items-center justify-center min-h-full bg-[var(--color-void)]">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
            <EyeOff size={20} className="text-amber-400" />
          </div>
          <p className="text-[var(--color-text-primary)] font-medium font-cinzel">Relatório não aprovado</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Este relatório ainda está em rascunho. Aprova-o antes de o visualizar como cliente.
          </p>
          <button
            onClick={() => navigate(`/reports/${id}`)}
            className="flex items-center gap-2 mx-auto text-sm text-[var(--color-gold)] hover:underline"
          >
            <ArrowLeft size={13} />
            Voltar ao editor
          </button>
        </div>
      </div>
    );
  }

  // Filter sections visible to client
  const clientSections = report.sections.filter(s => s.visibility === 'included' && s.content);

  return (
    <div className="min-h-full bg-[var(--color-void)]">
      {/* Preview banner */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-2.5 bg-[var(--color-surface-1)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-medium text-amber-400">Pré-visualização · Vista do cliente</span>
        </div>
        <button
          onClick={() => navigate(`/reports/${id}`)}
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft size={12} />
          Voltar ao editor
        </button>
      </div>

      {/* Client report body */}
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 pb-6 border-b border-[var(--color-border)]">
          <div className="w-14 h-14 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 flex items-center justify-center mx-auto">
            <Sparkles size={22} className="text-[var(--color-gold)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Relatório de Sessão</p>
            <h1 className="font-cinzel text-2xl font-semibold text-[var(--color-text-primary)]">{report.clientName}</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{report.methodologyName}</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(report.sessionDate).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {report.status === 'shared' && (
              <span className="flex items-center gap-1 text-[var(--color-gold)]">
                <CheckCircle2 size={11} />
                Aprovado e partilhado
              </span>
            )}
          </div>
        </div>

        {/* Hawkins highlight if present */}
        {report.hawkinsInitial && report.hawkinsFinal && (
          <div className="flex items-center gap-6 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)]">
            <div className="text-center flex-1">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Nível Inicial</p>
              <p className="text-4xl font-bold font-cinzel text-[var(--color-text-secondary)]">{report.hawkinsInitial}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'text-sm font-bold',
                report.hawkinsFinal > report.hawkinsInitial ? 'text-emerald-400' : 'text-red-400'
              )}>
                {report.hawkinsFinal > report.hawkinsInitial ? '+' : ''}{report.hawkinsFinal - report.hawkinsInitial}
              </div>
              <div className="text-[var(--color-text-muted)] text-lg">→</div>
            </div>
            <div className="text-center flex-1">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Nível Final</p>
              <p className="text-4xl font-bold font-cinzel" style={{ color: 'var(--color-teal)' }}>{report.hawkinsFinal}</p>
            </div>
          </div>
        )}

        {/* Sections */}
        {clientSections.map(s => (
          <div key={s.code} className="space-y-2">
            <h2 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              {SECTION_LABELS[s.code]}
            </h2>
            {s.code === 'identified_tools' || s.code === 'activated_tools' ? (
              <div className="flex flex-wrap gap-2">
                {s.content.split('\n').filter(Boolean).map(tool => (
                  <span
                    key={tool}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border',
                      s.code === 'activated_tools'
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5'
                        : 'border-sky-500/40 text-sky-400 bg-sky-500/5'
                    )}
                  >
                    <Zap size={10} />
                    {tool}
                  </span>
                ))}
              </div>
            ) : s.code === 'recommendations' || s.code === 'next_steps' ? (
              <ul className="space-y-1.5">
                {s.content.split('\n').filter(Boolean).map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--color-teal)' }} />
                    {line}
                  </li>
                ))}
              </ul>
            ) : s.code === 'reverberation' ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)]">
                <Clock size={14} className="text-[var(--color-gold)]" />
                <p className="text-sm text-[var(--color-text-secondary)]">{s.content}</p>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                {s.content}
              </p>
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="pt-6 border-t border-[var(--color-border)] text-center space-y-2">
          <p className="text-xs text-[var(--color-text-muted)]">
            Gerado pela plataforma Radionics
          </p>
          {report.portalLink && (
            <p className="text-[10px] text-[var(--color-text-muted)] opacity-50">
              {report.portalLink.url}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
