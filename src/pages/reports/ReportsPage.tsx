import { Link } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';
import { REPORTS } from '@/data/mock-data';
import { cn, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS, formatDate } from '@/lib/utils';

export default function ReportsPage() {
  return (
    <div className="min-h-full bg-[var(--color-void)]">
      <div className="px-6 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">Relatórios</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{REPORTS.length} relatórios</p>
      </div>

      <div className="p-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden">
          {REPORTS.map(report => {
            const statusLabel = REPORT_STATUS_LABELS[report.status] ?? report.status;
            const statusColor = REPORT_STATUS_COLORS[report.status] ?? 'text-zinc-400 bg-zinc-800';

            return (
              <Link
                key={report.id}
                to={`/reports/${report.id}`}
                className="flex items-center gap-4 px-5 py-4 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-1)] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-[var(--color-gold)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{report.clientName}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">
                    {report.methodologyName} · {formatDate(report.sessionDate)}
                  </p>
                </div>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0', statusColor)}>
                  {statusLabel}
                </span>
                <ChevronRight size={14} className="text-[var(--color-text-muted)] shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
