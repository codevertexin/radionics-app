import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, Star, CheckCircle2,
  Edit2, Save, Camera, Award, Sparkles, Globe, Instagram,
  Clock, Lock, ChevronRight, LogOut, ExternalLink, AlertTriangle
} from 'lucide-react';
import { METHODOLOGIES } from '@/data/mock-data';
import { cn } from '@/lib/utils';

const THERAPIST = {
  name: 'Ana Beatriz Santos',
  email: 'ana.santos@radionics.io',
  phone: '+351 912 345 678',
  location: 'Lisboa, Portugal',
  bio: 'Terapeuta radiônica certificada com mais de 8 anos de experiência em harmonização energética e trabalho vibracional. Especializada nas metodologias MAP e Mesa dos 35 Gráficos.',
  website: 'www.anasantos-radionics.pt',
  instagram: '@ana.radionics',
  memberSince: '2021-03-15',
  sessionsCount: 347,
  clientsCount: 89,
  avgHawkinsElevation: 142,
};

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(THERAPIST);
  const [saved, setSaved] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-full bg-[var(--color-void)]">
      {/* Logout confirm modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-700/40 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-400" />
            </div>
            <h3 className="font-cinzel text-base font-semibold text-[var(--color-text-primary)] mb-2">Terminar sessão</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Tem a certeza que quer terminar a sessão? Esta acção é apenas um mock.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-red-800/40 border border-red-700/40 text-sm font-semibold text-red-300 hover:bg-red-800/60 transition-colors"
              >
                Terminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">Perfil</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Gerencie o seu perfil e certificações</p>
          </div>
          {editMode ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditMode(false)}
                className="px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Save size={14} />
                Guardar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
            >
              <Edit2 size={14} />
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar + stats */}
        <div className="space-y-4">
          {/* Avatar */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-6 flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center text-2xl font-bold text-[var(--color-gold)] mb-4">
                {THERAPIST.name[0]}
              </div>
              {editMode && (
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-gold)] text-[var(--color-void)] flex items-center justify-center">
                  <Camera size={12} />
                </button>
              )}
            </div>
            <h2 className="font-cinzel text-base font-semibold text-[var(--color-text-primary)]">{form.name}</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Terapeuta Radiônica</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
              Membro desde {new Date(THERAPIST.memberSince).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4">
            <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Estatísticas</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Sessões', value: THERAPIST.sessionsCount },
                { label: 'Clientes', value: THERAPIST.clientsCount },
                { label: 'Hawkins +', value: THERAPIST.avgHawkinsElevation },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl bg-[var(--color-surface-1)] p-3 text-center">
                  <p className="text-lg font-bold font-cinzel text-[var(--color-text-primary)]">{stat.value}</p>
                  <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Auth link */}
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-0)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
          >
            <ExternalLink size={13} className="text-[var(--color-text-muted)]" />
            <span>Editar perfil global no Auth</span>
          </button>

          {/* Certifications */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Especialidades</h3>
              <Award size={13} className="text-[var(--color-text-muted)]" />
            </div>
            <div className="space-y-2.5">
              {METHODOLOGIES.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}40` }}
                  >
                    {m.code.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{m.shortName}</p>
                  </div>
                  {m.certificationStatus === 'approved' && (
                    <span title="Certificado"><CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" /></span>
                  )}
                  {m.certificationStatus === 'pending' && (
                    <span title="Em análise"><Clock size={13} className="text-amber-400 flex-shrink-0" /></span>
                  )}
                  {m.certificationStatus === 'not_certified' && (
                    <span title="Sem certificação"><Lock size={12} className="text-[var(--color-text-muted)] flex-shrink-0 opacity-50" /></span>
                  )}
                </div>
              ))}
            </div>
            <Link
              to="/certifications"
              className="mt-4 flex items-center justify-between w-full px-3 py-2 rounded-xl bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors text-xs font-medium text-[var(--color-text-secondary)] group"
            >
              <span>Gerir especialidades</span>
              <ChevronRight size={13} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors" />
            </Link>
          </div>
        </div>

        {/* Right: Editable info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal info */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4">
            <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Informação Pessoal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: 'Nome completo', key: 'name', type: 'text' },
                { icon: Mail, label: 'Email', key: 'email', type: 'email' },
                { icon: Phone, label: 'Telefone', key: 'phone', type: 'tel' },
                { icon: MapPin, label: 'Localização', key: 'location', type: 'text' },
                { icon: Globe, label: 'Website', key: 'website', type: 'text' },
                { icon: Instagram, label: 'Instagram', key: 'instagram', type: 'text' },
              ].map(({ icon: Icon, label, key, type }) => (
                <div key={key}>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    <Icon size={11} />
                    {label}
                  </label>
                  {editMode ? (
                    <input
                      type={type}
                      value={form[key as keyof typeof form] as string}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                    />
                  ) : (
                    <p className="text-sm text-[var(--color-text-secondary)] px-1">
                      {form[key as keyof typeof form] as string || '—'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4">
            <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Biografia</h3>
            {editMode ? (
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={4}
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
              />
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{form.bio}</p>
            )}
          </div>

          {/* Account settings */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-4">
            <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Conta</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Alterar password', desc: 'Atualize a sua password de acesso' },
                { label: 'Notificações', desc: 'Configure os seus alertas e lembretes' },
                { label: 'Privacidade', desc: 'Controle o que é partilhado no Hub' },
                { label: 'Plano', desc: 'Radionics Pro · Renovação em 30 jun 2025' },
              ].map(item => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-surface-1)] transition-colors text-left"
                >
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[var(--color-text-primary)]">{item.label}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{item.desc}</p>
                  </div>
                  <Edit2 size={12} className="text-[var(--color-text-muted)]" />
                </button>
              ))}
              <div className="border-t border-[var(--color-border)] pt-2 mt-1">
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-900/20 transition-colors text-left"
                >
                  <LogOut size={13} className="text-red-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-red-400">Terminar sessão</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Sair da sua conta Radionics</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
