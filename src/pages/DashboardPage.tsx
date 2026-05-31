import { Link } from 'react-router-dom';
import {
  Play, RotateCcw, Clock, FileText, User,
  TrendingUp, ChevronRight, AlertCircle, Plus, Zap
} from 'lucide-react';
import { getDashboardData, HAWKINS_LEVELS } from '@/data/mock-data';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn, SESSION_STATUS_LABELS, SESSION_STATUS_COLORS, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS, CLIENT_TYPE_LABELS, CLIENT_TYPE_COLORS, formatDate, formatTime, METHODOLOGY_COLORS } from '@/lib/utils';

const data = getDashboardData();

function HawkinsBadge({ value }: { value?: number }) {
  if (!value) return null;
  const level = HAWKINS_LEVELS.slice().reverse().find(h => h.value <= value) ?? HAWKINS_LEVELS[0];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
      style={{ background: level.bgColor, color: level.color }}
    >
      {value} · {level.label}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <div className="page-enter min-h-full p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-gold-gradient">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            {new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link to="/sessions/new">
          <Button variant="gold" icon={<Plus size={15} />}>Nova Sessão</Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sessões em Curso', value: data.sessionsInProgress.length, color: 'text-teal-400', icon: Zap, bg: 'bg-teal-900/20 border-teal-800/30' },
          { label: 'Sessões Hoje', value: data.sessionsToday.length, color: 'text-amber-400', icon: Clock, bg: 'bg-amber-900/20 border-amber-800/30' },
          { label: 'Relatórios Pendentes', value: data.pendingReports.length, color: 'text-rose-400', icon: FileText, bg: 'bg-rose-900/20 border-rose-800/30' },
          { label: 'Clientes Ativos', value: 6, color: 'text-violet-400', icon: User, bg: 'bg-violet-900/20 border-violet-800/30' },
        ].map(stat => (
          <div key={stat.label} className={cn('card-surface border p-4 rounded-xl', stat.bg)}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--color-text-tertiary)]">{stat.label}</span>
              <stat.icon size={14} className={stat.color} />
            </div>
            <div className={cn('text-2xl font-bold', stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions in progress */}
        <div className="card-surface rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-teal-400" />
              <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">Sessões em Curso</h2>
            </div>
            <Link to="/sessions">
              <span className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-gold)] cursor-pointer flex items-center gap-1 transition-colors">
                Ver todas <ChevronRight size={12} />
              </span>
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {data.sessionsInProgress.length === 0 ? (
              <div className="px-5 py-8 text-center text-[var(--color-text-tertiary)] text-sm">
                Sem sessões em curso
              </div>
            ) : (
              data.sessionsInProgress.map(session => (
                <div key={session.id} className="px-5 py-4 hover:bg-[var(--color-surface-2)] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={session.clientName} size="md" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">{session.clientName}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">{session.methodologyName}</div>
                        {session.hawkinsInitial && (
                          <div className="mt-1">
                            <HawkinsBadge value={session.hawkinsInitial} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={cn('badge', SESSION_STATUS_COLORS[session.status])}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
                        {SESSION_STATUS_LABELS[session.status]}
                      </span>
                      <Link to={`/sessions/${session.id}`}>
                        <Button variant="teal" size="sm" icon={session.status === 'paused' ? <RotateCcw size={12} /> : <Play size={12} />}>
                          {session.status === 'paused' ? 'Retomar' : 'Continuar'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sessions today */}
        <div className="card-surface rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-amber-400" />
              <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">Sessões de Hoje</h2>
            </div>
            <Link to="/sessions">
              <span className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-gold)] cursor-pointer flex items-center gap-1 transition-colors">
                Ver todas <ChevronRight size={12} />
              </span>
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {data.sessionsToday.map(session => (
              <div key={session.id} className="px-5 py-4 hover:bg-[var(--color-surface-2)] transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-12 rounded-full shrink-0"
                    style={{ background: METHODOLOGY_COLORS[session.methodologyCode] ?? '#8B5CF6' }}
                  />
                  <Avatar name={session.clientName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{session.clientName}</span>
                      {session.scheduledAt && (
                        <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">{formatTime(session.scheduledAt)}</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{session.methodologyName}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={cn('badge', SESSION_STATUS_COLORS[session.status])}>
                        {SESSION_STATUS_LABELS[session.status]}
                      </span>
                    </div>
                  </div>
                  <Link to={`/sessions/${session.id}`}>
                    <ChevronRight size={16} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-gold)] transition-colors" />
                  </Link>
                </div>
              </div>
            ))}
            {data.sessionsToday.length === 0 && (
              <div className="px-5 py-8 text-center text-[var(--color-text-tertiary)] text-sm">Sem sessões hoje</div>
            )}
          </div>
        </div>

        {/* Pending reports */}
        <div className="card-surface rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-400" />
              <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">Relatórios Pendentes</h2>
            </div>
            <Link to="/reports">
              <span className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-gold)] cursor-pointer flex items-center gap-1 transition-colors">
                Ver todos <ChevronRight size={12} />
              </span>
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {data.pendingReports.map(report => (
              <div key={report.id} className="px-5 py-4 hover:bg-[var(--color-surface-2)] transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar name={report.clientName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{report.clientName}</span>
                      <span className={cn('badge', REPORT_STATUS_COLORS[report.status])}>
                        {REPORT_STATUS_LABELS[report.status]}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{report.methodologyName} · {formatDate(report.sessionDate)}</div>
                  </div>
                  <Link to={`/reports/${report.id}`}>
                    <ChevronRight size={16} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-gold)] transition-colors" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent clients */}
        <div className="card-surface rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <User size={15} className="text-violet-400" />
              <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">Clientes Recentes</h2>
            </div>
            <Link to="/clients">
              <span className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-gold)] cursor-pointer flex items-center gap-1 transition-colors">
                Ver todos <ChevronRight size={12} />
              </span>
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {data.recentClients.map(client => (
              <div key={client.id} className="px-5 py-4 hover:bg-[var(--color-surface-2)] transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar name={client.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{client.name}</span>
                      <span className={cn('badge', CLIENT_TYPE_COLORS[client.clientType])}>
                        {CLIENT_TYPE_LABELS[client.clientType]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-[var(--color-text-tertiary)]">{client.sessionCount} sessões</span>
                      {client.lastSessionDate && (
                        <span className="text-xs text-[var(--color-text-tertiary)]">Última: {formatDate(client.lastSessionDate)}</span>
                      )}
                    </div>
                  </div>
                  <Link to={`/clients/${client.id}`}>
                    <ChevronRight size={16} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-gold)] transition-colors" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
