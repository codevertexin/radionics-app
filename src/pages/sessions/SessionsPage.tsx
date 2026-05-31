import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Play, Clock, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { listSessions } from '@/services/sessionsService';
import { cn, SESSION_STATUS_LABELS, SESSION_STATUS_COLORS, formatDate, formatTime } from '@/lib/utils';
import type { Session } from '@/types';

export default function SessionsPage() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: listSessions,
  });

  const today = new Date().toISOString().slice(0, 10);
  const scheduled = sessions.filter(s => s.scheduledAt?.startsWith(today));
  const inProgress = sessions.filter(s => s.status === 'in_progress' || s.status === 'paused');
  const recent = sessions.filter(s => s.status === 'completed' || s.status === 'reported');
  const drafts = sessions.filter(s => s.status === 'draft');

  return (
    <div className="min-h-full bg-[var(--color-void)]">
      <div className="px-6 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">Sessões</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Gerir e iniciar sessões terapêuticas</p>
          </div>
          <Link
            to="/sessions/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            Nova Sessão
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Loader2 size={16} className="animate-spin" />
            A carregar sessões…
          </div>
        )}

        {!isLoading && drafts.length > 0 && (
          <section>
            <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
              Rascunhos
            </h2>
            <div className="space-y-2">
              {drafts.map(session => (
                <SessionRow key={session.id} session={session} />
              ))}
            </div>
          </section>
        )}

        {inProgress.length > 0 && (
          <section>
            <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Play size={13} className="text-teal-400" /> Em curso
            </h2>
            <div className="space-y-2">
              {inProgress.map(session => (
                <SessionRow key={session.id} session={session} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar size={13} className="text-amber-400" /> Hoje
          </h2>
          <div className="space-y-2">
            {scheduled.length > 0 ? (
              scheduled.map(session => <SessionRow key={session.id} session={session} />)
            ) : (
              <p className="text-sm text-[var(--color-text-muted)] py-4">Nenhuma sessão agendada para hoje.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock size={13} /> Recentes
          </h2>
          <div className="space-y-2">
            {recent.length > 0 ? (
              recent.map(session => (
                <SessionRow key={session.id} session={session} />
              ))
            ) : (
              <p className="text-sm text-[var(--color-text-muted)] py-4">Nenhuma sessão concluída recentemente.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: Session }) {
  const statusLabel = SESSION_STATUS_LABELS[session.status] ?? session.status;
  const statusColor = SESSION_STATUS_COLORS[session.status] ?? 'text-zinc-400 bg-zinc-800';

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] hover:border-[var(--color-border-strong)] transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{session.clientName}</p>
        <p className="text-xs text-[var(--color-text-muted)] truncate">
          {session.methodologyName}
          {session.scheduledAt && ` · ${formatDate(session.scheduledAt)} ${formatTime(session.scheduledAt)}`}
        </p>
      </div>
      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', statusColor)}>
        {statusLabel}
      </span>
      <ChevronRight size={14} className="text-[var(--color-text-muted)] shrink-0" />
    </Link>
  );
}
