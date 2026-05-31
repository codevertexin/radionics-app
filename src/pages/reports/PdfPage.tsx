import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Printer, Globe, EyeOff, Lock } from 'lucide-react';
import { getReportV2ById, getClientById } from '@/data/mock-data';
import { cn } from '@/lib/utils';
import type { ReportSectionCode, SectionVisibility } from '@/types';

// ─── CONSTANTS ────────────────────────────────────────────────

const SECTION_ORDER: ReportSectionCode[] = [
  'client', 'session_objective', 'hawkins_evolution',
  'identified_tools', 'activated_tools', 'therapist_notes',
  'final_interpretation', 'recommendations', 'reverberation', 'next_steps',
];

const VISIBILITY_LABEL: Record<SectionVisibility, { label: string; color: string }> = {
  included:           { label: 'Incluído',          color: 'text-emerald-600' },
  hidden_from_client: { label: 'Oculto ao cliente', color: 'text-amber-600' },
  private:            { label: 'Privado',            color: 'text-gray-400' },
};

// ─── PDF PREVIEW PAGE ─────────────────────────────────────────

export default function ReportPdfPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const report = getReportV2ById(id);
  const client = report ? getClientById(report.clientId) : undefined;

  if (!report) {
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

  const sections = SECTION_ORDER
    .map(code => report.sections.find(s => s.code === code))
    .filter(Boolean) as typeof report.sections;

  const visibleSections = sections.filter(s => s.visibility !== 'private' && s.content.trim() !== '');
  const sessionDate = new Date(report.sessionDate).toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const hawkinsDelta = report.hawkinsInitial && report.hawkinsFinal
    ? report.hawkinsFinal - report.hawkinsInitial
    : null;

  return (
    <div className="min-h-full bg-[var(--color-void)] flex flex-col">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-0)] flex items-center gap-3 print:hidden">
        <button
          onClick={() => navigate(`/reports/${id}`)}
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft size={13} />
          Voltar ao relatório
        </button>
        <div className="flex-1" />
        <p className="text-xs text-[var(--color-text-muted)]">Pré-visualização A4</p>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-gold)] text-[var(--color-void)] text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <Printer size={12} />
          Imprimir / PDF
        </button>
      </div>

      {/* ── A4 Canvas ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-8 px-4 flex justify-center bg-[var(--color-void)] print:py-0 print:px-0">
        <div
          className="bg-white shadow-2xl print:shadow-none"
          style={{ width: '210mm', minHeight: '297mm' }}
        >
          {/* Page padding */}
          <div className="px-14 py-12 space-y-8" style={{ fontFamily: 'Georgia, serif', color: '#1a1a2e' }}>

            {/* ── Header ──────────────────────────────────────── */}
            <div className="flex items-start justify-between border-b-2 pb-6" style={{ borderColor: '#c9a84c' }}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {/* Logo mark */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#c9a84c', color: '#0d0d1a' }}
                  >
                    R
                  </div>
                  <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#c9a84c', fontFamily: 'Georgia, serif' }}>
                    Radionics
                  </span>
                </div>
                <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: 'Georgia, serif', color: '#1a1a2e' }}>
                  Relatório de Sessão
                </h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                  {report.methodologyName}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs" style={{ color: '#6b7280' }}>Data da sessão</p>
                <p className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{sessionDate}</p>
                {report.reverberationDays && (
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    Reverberação: {report.reverberationDays} dias
                  </p>
                )}
              </div>
            </div>

            {/* ── Client info ─────────────────────────────────── */}
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#f8f8fc', border: '1px solid #e5e7eb' }}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{ background: '#c9a84c20', color: '#c9a84c', border: '2px solid #c9a84c40' }}
              >
                {report.clientName[0]}
              </div>
              <div className="flex-1">
                <p className="font-bold text-base" style={{ color: '#1a1a2e' }}>{report.clientName}</p>
                {client?.email && (
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{client.email}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#9ca3af' }}>Estado</p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: report.status === 'shared' || report.status === 'approved' ? '#16a34a20' : '#f59e0b20',
                    color: report.status === 'shared' || report.status === 'approved' ? '#16a34a' : '#d97706',
                  }}
                >
                  {report.status === 'draft' ? 'Rascunho' :
                   report.status === 'in_review' ? 'Em revisão' :
                   report.status === 'approved' ? 'Aprovado' : 'Partilhado'}
                </span>
              </div>
            </div>

            {/* ── Hawkins block ────────────────────────────────── */}
            {(report.hawkinsInitial || report.hawkinsFinal) && (
              <div className="p-5 rounded-xl text-center" style={{ background: '#0d0d1a', color: '#fff' }}>
                <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: '#c9a84c' }}>
                  Escala de Consciência — David R. Hawkins
                </p>
                <div className="flex items-center justify-center gap-8">
                  {report.hawkinsInitial && (
                    <div>
                      <p className="text-[10px] mb-1" style={{ color: '#9ca3af' }}>Nível Inicial</p>
                      <p className="text-4xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#e5e7eb' }}>
                        {report.hawkinsInitial}
                      </p>
                    </div>
                  )}
                  {report.hawkinsInitial && report.hawkinsFinal && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-px" style={{ background: '#c9a84c' }} />
                      {hawkinsDelta !== null && (
                        <p
                          className="text-sm font-bold"
                          style={{ color: hawkinsDelta >= 0 ? '#4ade80' : '#f87171' }}
                        >
                          {hawkinsDelta >= 0 ? '+' : ''}{hawkinsDelta}
                        </p>
                      )}
                    </div>
                  )}
                  {report.hawkinsFinal && (
                    <div>
                      <p className="text-[10px] mb-1" style={{ color: '#9ca3af' }}>Nível Final</p>
                      <p className="text-4xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#5eead4' }}>
                        {report.hawkinsFinal}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Intention ────────────────────────────────────── */}
            {report.intention && (
              <div className="text-center py-2">
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Intenção da Sessão</p>
                <p className="text-sm italic leading-relaxed" style={{ color: '#374151' }}>
                  "{report.intention}"
                </p>
              </div>
            )}

            {/* ── Sections ─────────────────────────────────────── */}
            <div className="space-y-6">
              {visibleSections.length > 0 ? (
                visibleSections.map(section => {
                  const visLabel = VISIBILITY_LABEL[section.visibility];
                  return (
                    <div key={section.code} className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <h2
                          className="text-sm font-bold uppercase tracking-wider"
                          style={{ color: '#c9a84c', borderBottom: '1px solid #c9a84c30', paddingBottom: '4px', flex: 1 }}
                        >
                          {section.title}
                        </h2>
                        {section.visibility === 'hidden_from_client' && (
                          <span className="text-[9px] ml-3 text-amber-600 flex-shrink-0">Oculto ao cliente</span>
                        )}
                      </div>
                      <p
                        className="text-sm leading-relaxed whitespace-pre-wrap"
                        style={{ color: '#374151' }}
                      >
                        {section.content}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8" style={{ color: '#9ca3af' }}>
                  <p className="text-sm">Nenhuma secção com conteúdo visível.</p>
                </div>
              )}
            </div>

            {/* ── Tools list ───────────────────────────────────── */}
            {report.snapshot && report.snapshot.tool_results.length > 0 && (
              <div className="space-y-3">
                <h2
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: '#c9a84c', borderBottom: '1px solid #c9a84c30', paddingBottom: '4px' }}
                >
                  Gráficos Utilizados
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {report.snapshot.tool_results.map(tr => (
                    <div
                      key={tr.toolId}
                      className="flex items-start gap-2 p-2.5 rounded-lg"
                      style={{ background: '#f8f8fc', border: '1px solid #e5e7eb' }}
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                        style={{
                          background: tr.status === 'activated' ? '#4ade80' :
                                      tr.status === 'identified' ? '#38bdf8' : '#9ca3af'
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium" style={{ color: '#1a1a2e' }}>{tr.toolName}</p>
                        {tr.notes && (
                          <p className="text-[10px] mt-0.5 leading-snug" style={{ color: '#6b7280' }}>{tr.notes}</p>
                        )}
                      </div>
                      <span
                        className="text-[9px] flex-shrink-0 px-1.5 py-0.5 rounded-full"
                        style={{
                          background: tr.status === 'activated' ? '#4ade8020' :
                                      tr.status === 'identified' ? '#38bdf820' : '#9ca3af20',
                          color: tr.status === 'activated' ? '#16a34a' :
                                 tr.status === 'identified' ? '#0284c7' : '#6b7280',
                        }}
                      >
                        {tr.status === 'activated' ? 'Ativado' : tr.status === 'identified' ? 'Identif.' : 'Análise'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Footer ───────────────────────────────────────── */}
            <div
              className="pt-6 mt-8 flex items-center justify-between text-[10px]"
              style={{ borderTop: '1px solid #e5e7eb', color: '#9ca3af' }}
            >
              <span>Radionics · Relatório gerado em {new Date().toLocaleDateString('pt-PT')}</span>
              <span>Confidencial · Uso terapêutico</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
