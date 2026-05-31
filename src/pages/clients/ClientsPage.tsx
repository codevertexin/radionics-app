import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Search, Plus, User, Mail, Phone, Calendar, MessageCircle,
  MoreHorizontal, Filter, ChevronRight, Sparkles
} from 'lucide-react';
import { CLIENTS } from '@/data/mock-data';
import { cn } from '@/lib/utils';
import type { Client, ClientType } from '@/types';

const CLIENT_TYPE_LABELS: Record<ClientType, { label: string; color: string }> = {
  contact_only:        { label: 'Contacto', color: 'text-[var(--color-text-muted)] border-[var(--color-border)]' },
  contact_with_email:  { label: 'Com email', color: 'text-sky-400 border-sky-500/40' },
  hub_user:            { label: 'Hub User', color: 'text-[var(--color-gold)] border-[var(--color-gold)]/40' },
};

function CreateClientModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', whatsapp: '', notes: '' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-2xl p-6 space-y-5 shadow-2xl">
        <div>
          <h2 className="font-cinzel text-lg font-semibold text-[var(--color-text-primary)]">Novo Cliente</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Adicione um novo cliente ao seu espaço</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Nome completo *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nome do cliente"
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-text-muted)] transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@exemplo.com"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-text-muted)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+351 9xx xxx xxx"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-text-muted)] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Notas</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Contexto inicial, referências, observações..."
              rows={3}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-text-muted)] transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Criar Cliente
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientRow({ client, onClick }: { client: Client; onClick: () => void }) {
  const typeConfig = CLIENT_TYPE_LABELS[client.clientType];

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--color-surface-1)] transition-colors cursor-pointer border-b border-[var(--color-border)] last:border-0"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-sm font-bold text-[var(--color-gold)] flex-shrink-0">
        {client.name[0]}
      </div>

      {/* Name & email */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{client.name}</p>
        <p className="text-xs text-[var(--color-text-muted)] truncate">
          {client.email || client.phone || 'Sem contacto'}
        </p>
      </div>

      {/* Type badge */}
      <span className={cn(
        'hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border',
        typeConfig.color
      )}>
        {typeConfig.label}
      </span>

      {/* Session count */}
      <div className="hidden md:flex items-center gap-1.5 text-[var(--color-text-muted)]">
        <Sparkles size={11} />
        <span className="text-xs">{client.sessionCount} sessões</span>
      </div>

      {/* Last session */}
      <div className="hidden lg:flex items-center gap-1.5 text-[var(--color-text-muted)]">
        <Calendar size={11} />
        <span className="text-xs">
          {client.lastSessionDate
            ? new Date(client.lastSessionDate).toLocaleDateString('pt-PT')
            : 'Nunca'}
        </span>
      </div>

      <ChevronRight size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
    </div>
  );
}

export default function ClientsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ClientType | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = CLIENTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.email?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchType = typeFilter === 'all' || c.clientType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-full bg-[var(--color-void)]">
      {showCreate && <CreateClientModal onClose={() => setShowCreate(false)} />}

      {/* Header */}
      <div className="px-6 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">Clientes</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{CLIENTS.length} clientes no seu espaço</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            Novo Cliente
          </button>
        </div>

        {/* Search + filters */}
        <div className="flex gap-3 mt-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Pesquisar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-text-muted)] transition-colors"
            />
          </div>

          <div className="flex gap-1.5">
            {(['all', 'contact_only', 'contact_with_email', 'hub_user'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-medium border transition-all',
                  typeFilter === t
                    ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]'
                )}
              >
                {t === 'all' ? 'Todos' :
                 t === 'contact_only' ? 'Contacto' :
                 t === 'contact_with_email' ? 'Com email' : 'Hub'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 border-b border-[var(--color-border)]">
        {[
          { label: 'Total', value: CLIENTS.length },
          { label: 'Hub Users', value: CLIENTS.filter(c => c.clientType === 'hub_user').length },
          { label: 'Sessões este mês', value: 12 },
        ].map(stat => (
          <div key={stat.label} className="px-6 py-4 text-center border-r last:border-0 border-[var(--color-border)]">
            <p className="text-xl font-bold font-cinzel text-[var(--color-text-primary)]">{stat.value}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-[var(--color-surface-0)] m-6 rounded-2xl border border-[var(--color-border)] overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map(client => (
            <ClientRow
              key={client.id}
              client={client}
              onClick={() => navigate(`/clients/${client.id}`)}
            />
          ))
        ) : (
          <div className="py-16 text-center">
            <User size={40} className="mx-auto text-[var(--color-text-muted)] opacity-30 mb-3" />
            <p className="text-sm text-[var(--color-text-muted)]">Nenhum cliente encontrado</p>
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-[var(--color-gold)] hover:underline mt-2">
                Limpar pesquisa
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
