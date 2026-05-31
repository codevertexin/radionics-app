import { Link } from 'react-router-dom';
import { Plus, Layers, Star, ChevronRight } from 'lucide-react';
import { TEMPLATES } from '@/data/mock-data';
import { cn } from '@/lib/utils';

export default function TemplatesPage() {
  return (
    <div className="min-h-full bg-[var(--color-void)]">
      <div className="px-6 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">Templates</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{TEMPLATES.length} templates disponíveis</p>
          </div>
          <Link
            to="/templates/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            Novo Template
          </Link>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TEMPLATES.map(tmpl => (
          <Link
            key={tmpl.id}
            to={`/templates/${tmpl.id}/edit`}
            className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5 hover:border-[var(--color-border-strong)] transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center">
                <Layers size={18} className="text-[var(--color-gold)]" />
              </div>
              {tmpl.templateType === 'official' && (
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border border-amber-700/40 text-amber-400 bg-amber-900/20">
                  <Star size={9} /> Oficial
                </span>
              )}
            </div>
            <h3 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)] mb-1">{tmpl.name}</h3>
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">{tmpl.description}</p>
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>{tmpl.methodologyName}</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full',
                tmpl.status === 'active' ? 'text-emerald-400 bg-emerald-900/20' : 'text-zinc-400 bg-zinc-800',
              )}>
                {tmpl.status === 'active' ? 'Ativo' : 'Arquivado'}
              </span>
            </div>
            <ChevronRight size={14} className="text-[var(--color-text-muted)] mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}
