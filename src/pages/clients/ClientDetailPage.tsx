import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Mail, Phone, MessageCircle, ChevronRight } from 'lucide-react';
import { getClientById, SESSIONS } from '@/data/mock-data';
import { cn, CLIENT_TYPE_LABELS, CLIENT_TYPE_COLORS, formatDate, SESSION_STATUS_LABELS } from '@/lib/utils';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const client = id ? getClientById(id) : undefined;
  const clientSessions = SESSIONS.filter(s => s.clientId === id);

  if (!client) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">Cliente não encontrado.</p>
        <Link to="/clients" className="text-sm text-[var(--color-gold)] hover:underline mt-2 inline-block">
          Voltar aos clientes
        </Link>
      </div>
    );
  }

  const typeLabel = CLIENT_TYPE_LABELS[client.clientType] ?? client.clientType;
  const typeColor = CLIENT_TYPE_COLORS[client.clientType] ?? 'text-zinc-400 bg-zinc-800';

  return (
    <div className="min-h-full bg-[var(--color-void)]">
      <div className="px-6 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <Link to="/clients" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] mb-4">
          <ArrowLeft size={14} /> Clientes
        </Link>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center text-xl font-bold text-[var(--color-gold)]">
            {client.name[0]}
          </div>
          <div>
            <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">{client.name}</h1>
            <span className={cn('inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full mt-1', typeColor)}>
              {typeLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5 space-y-3">
            <h2 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Contacto</h2>
            {client.email && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Mail size={14} className="text-[var(--color-text-muted)]" /> {client.email}
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Phone size={14} className="text-[var(--color-text-muted)]" /> {client.phone}
              </div>
            )}
            {client.whatsapp && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <MessageCircle size={14} className="text-[var(--color-text-muted)]" /> {client.whatsapp}
              </div>
            )}
            {client.birthDate && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Calendar size={14} className="text-[var(--color-text-muted)]" />
                {formatDate(client.birthDate)}
              </div>
            )}
          </div>

          {client.notes && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5">
              <h2 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Notas</h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{client.notes}</p>
            </div>
          )}

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5 grid grid-cols-2 gap-3">
            <Stat label="Sessões" value={client.sessionCount} />
            <Stat label="Desde" value={formatDate(client.createdAt).split(' ').slice(-2).join(' ')} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
            Histórico de sessões
          </h2>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden">
            {clientSessions.length > 0 ? (
              clientSessions.map(session => (
                <Link
                  key={session.id}
                  to={`/sessions/${session.id}`}
                  className="flex items-center gap-4 px-5 py-4 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-1)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{session.methodologyName}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {session.scheduledAt ? formatDate(session.scheduledAt) : 'Sem data'}
                    </p>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {SESSION_STATUS_LABELS[session.status] ?? session.status}
                  </span>
                  <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
                </Link>
              ))
            ) : (
              <p className="py-12 text-center text-sm text-[var(--color-text-muted)]">Nenhuma sessão registada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold font-cinzel text-[var(--color-text-primary)]">{value}</p>
      <p className="text-[10px] text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}
