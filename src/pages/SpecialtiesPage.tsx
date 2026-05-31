import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Lock, CheckCircle2, Star, Layers, ChevronRight, Sparkles, Clock
} from 'lucide-react';
import { METHODOLOGIES, getToolsByMethodology } from '@/data/mock-data';
import { cn } from '@/lib/utils';
import type { Methodology } from '@/types';

const CERT_CONFIG = {
  approved:       { label: 'Certificado', color: 'text-emerald-400 border-emerald-500/40' },
  pending:        { label: 'Pendente', color: 'text-amber-400 border-amber-500/40' },
  not_certified:  { label: 'Não certificado', color: 'text-[var(--color-text-muted)] border-[var(--color-border)]' },
  rejected:       { label: 'Rejeitado', color: 'text-red-400 border-red-500/40' },
  expired:        { label: 'Expirado', color: 'text-orange-400 border-orange-500/40' },
};

function MethodologyCard({ methodology, onSelect }: { methodology: Methodology; onSelect: () => void }) {
  const tools = getToolsByMethodology(methodology.id);
  const certConfig = CERT_CONFIG[methodology.certificationStatus || 'not_certified'];

  return (
    <div
      onClick={onSelect}
      className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden cursor-pointer hover:border-[var(--color-border-strong)] transition-all duration-300 hover:shadow-xl hover:shadow-black/30"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={methodology.imageUrl}
          alt={methodology.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-[var(--color-void)]/40 to-transparent" />

        {/* Color strip */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: methodology.color }}
        />

        {/* Cert badge */}
        <div className="absolute top-3 right-3">
          <span className={cn(
            'flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border bg-[var(--color-void)]/80 backdrop-blur-sm',
            certConfig.color
          )}>
            {methodology.certificationStatus === 'approved' ? <CheckCircle2 size={9} /> : <Lock size={9} />}
            {certConfig.label}
          </span>
        </div>

        {/* Code */}
        <div className="absolute bottom-3 left-3">
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-lg"
            style={{ background: `${methodology.color}30`, color: methodology.color, border: `1px solid ${methodology.color}40` }}
          >
            {methodology.code}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)] leading-tight mb-1.5">
          {methodology.name}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-3">
          {methodology.description}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
          <Layers size={11} />
          <span className="text-xs">{methodology.toolCount} gráficos</span>
        </div>
        {methodology.requiresCertification && (
          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
            <Star size={11} />
            <span className="text-xs">Certificação obrigatória</span>
          </div>
        )}
        <div className="ml-auto">
          <ChevronRight size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-gold)] transition-colors" />
        </div>
      </div>
    </div>
  );
}

function ToolPreview({ methodologyId }: { methodologyId: string }) {
  const tools = getToolsByMethodology(methodologyId);

  if (tools.length === 0) return (
    <div className="py-8 text-center text-[var(--color-text-muted)] text-sm opacity-60">
      Pré-visualização indisponível
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {tools.slice(0, 6).map(tool => (
        <div key={tool.id} className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface-1)]">
          <img src={tool.imageUrl} alt={tool.name} className="w-full h-20 object-cover" />
          <div className="p-2">
            <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{tool.name}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] line-clamp-2 mt-0.5">{tool.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MethodologiesPage() {
  const [selected, setSelected] = useState<Methodology | null>(null);

  return (
    <div className="min-h-full bg-[var(--color-void)]">
      {/* Header */}
      <div className="px-6 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">Especialidades</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          {METHODOLOGIES.length} especialidades disponíveis no seu espaço
        </p>
      </div>

      <div className="p-6 flex gap-6">
        {/* Cards grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {METHODOLOGIES.map(m => (
            <MethodologyCard
              key={m.id}
              methodology={m}
              onSelect={() => setSelected(s => s?.id === m.id ? null : m)}
            />
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 flex-shrink-0">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden sticky top-6">
              {/* Header */}
              <div className="relative h-32 overflow-hidden">
                <img src={selected.imageUrl} alt={selected.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] to-transparent" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[var(--color-void)]/70 text-[var(--color-text-muted)] hover:text-white flex items-center justify-center text-lg"
                >
                  ×
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">{selected.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">{selected.description}</p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <p className="font-bold text-[var(--color-text-primary)]">{selected.toolCount}</p>
                    <p className="text-[var(--color-text-muted)]">Gráficos</p>
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      'font-bold',
                      selected.certificationStatus === 'approved' ? 'text-emerald-400' : 'text-amber-400'
                    )}>
                      {selected.certificationStatus === 'approved' ? '✓' : '○'}
                    </p>
                    <p className="text-[var(--color-text-muted)]">Certificação</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Gráficos</p>
                  <ToolPreview methodologyId={selected.id} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
