/**
 * Template Creation Wizard — 4 steps:
 * 1. Select methodology
 * 2. Choose starting point (official / duplicate / blank)
 * 3. Template basics (name, description, status)
 * 4. Opens builder
 */

import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  X, ChevronRight, ChevronLeft, Star, Layers, FileText,
  BookOpen, Zap, SlidersHorizontal, Sparkles, CheckCircle2, Check,
  Copy, PlusCircle,
} from 'lucide-react';
import { METHODOLOGIES, TEMPLATES } from '@/data/mock-data';
import { cn } from '@/lib/utils';
import type { Methodology, Template } from '@/types';

type WizardStep = 'methodology' | 'starting_point' | 'basics';

type StartingPoint = 'official' | 'duplicate' | 'blank';

// ─── Step indicators ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 'methodology',     label: 'Metodologia' },
  { id: 'starting_point',  label: 'Ponto de partida' },
  { id: 'basics',          label: 'Detalhes' },
];

function StepBar({ current }: { current: WizardStep }) {
  const idx = STEPS.findIndex(s => s.id === current);
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all text-xs font-bold',
                done   ? 'border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-void)]'
                : active ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
              )}>
                {done ? <Check size={13} /> : i + 1}
              </div>
              <span className={cn('text-[9px] font-medium whitespace-nowrap', active ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-muted)]')}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px mx-2 mb-4', i < idx ? 'bg-[var(--color-gold)]/40' : 'bg-[var(--color-border)]')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Methodology ──────────────────────────────────────────────────────
function StepMethodology({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const active = METHODOLOGIES.filter(m => m.isActive);
  return (
    <div>
      <h2 className="text-lg font-semibold font-cinzel text-[var(--color-text-primary)] mb-1">Selecione a metodologia</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">O template será associado a esta metodologia.</p>

      <div className="space-y-3">
        {active.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left',
              selected === m.id
                ? 'border-[var(--color-gold)]/60 bg-[var(--color-gold)]/8 ring-1 ring-[var(--color-gold)]/20'
                : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-surface-0)]'
            )}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${m.color}20`, border: `1px solid ${m.color}40` }}
            >
              <Layers size={18} style={{ color: m.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{m.name}</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 line-clamp-1">{m.description}</p>
            </div>
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
              selected === m.id ? 'border-[var(--color-gold)] bg-[var(--color-gold)]' : 'border-[var(--color-border)]'
            )}>
              {selected === m.id && <Check size={11} className="text-[var(--color-void)]" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Starting Point ───────────────────────────────────────────────────
function StepStartingPoint({
  methodologyId,
  selected,
  selectedTemplateId,
  onSelect,
  onSelectTemplate,
}: {
  methodologyId: string;
  selected: StartingPoint | null;
  selectedTemplateId: string;
  onSelect: (s: StartingPoint) => void;
  onSelectTemplate: (id: string) => void;
}) {
  const officialTemplate = TEMPLATES.find(t => t.methodologyId === methodologyId && t.isBaseTemplate);
  const customTemplates = TEMPLATES.filter(t => t.methodologyId === methodologyId && !t.isBaseTemplate);
  const allTemplates = TEMPLATES.filter(t => t.methodologyId === methodologyId);

  const options = [
    {
      id: 'official' as StartingPoint,
      icon: Star,
      label: 'Template oficial',
      desc: officialTemplate
        ? `Começar a partir de "${officialTemplate.name}"`
        : 'Não existe template oficial para esta metodologia',
      disabled: !officialTemplate,
      color: 'text-[var(--color-gold)]',
      bg: 'bg-[var(--color-gold)]/10',
      border: 'border-[var(--color-gold)]/30',
    },
    {
      id: 'duplicate' as StartingPoint,
      icon: Copy,
      label: 'Duplicar existente',
      desc: allTemplates.length > 0
        ? `${allTemplates.length} template${allTemplates.length !== 1 ? 's' : ''} disponíve${allTemplates.length !== 1 ? 'is' : 'l'}`
        : 'Nenhum template disponível',
      disabled: allTemplates.length === 0,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
      border: 'border-sky-400/30',
    },
    {
      id: 'blank' as StartingPoint,
      icon: PlusCircle,
      label: 'Começar em branco',
      desc: 'Template sem blocos pré-definidos',
      disabled: false,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/30',
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold font-cinzel text-[var(--color-text-primary)] mb-1">Ponto de partida</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">Como quer começar o seu template?</p>

      <div className="space-y-3 mb-5">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => !opt.disabled && onSelect(opt.id)}
            disabled={opt.disabled}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left',
              selected === opt.id
                ? `${opt.bg} ${opt.border} ring-1 ring-[var(--color-gold)]/20`
                : opt.disabled
                ? 'border-[var(--color-border)] opacity-40 cursor-not-allowed'
                : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-surface-0)]'
            )}
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', selected === opt.id ? opt.bg : 'bg-[var(--color-surface-2)]', 'border', selected === opt.id ? opt.border : 'border-[var(--color-border)]')}>
              <opt.icon size={18} className={selected === opt.id ? opt.color : 'text-[var(--color-text-muted)]'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{opt.label}</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{opt.desc}</p>
            </div>
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
              selected === opt.id ? 'border-[var(--color-gold)] bg-[var(--color-gold)]' : 'border-[var(--color-border)]'
            )}>
              {selected === opt.id && <Check size={11} className="text-[var(--color-void)]" />}
            </div>
          </button>
        ))}
      </div>

      {/* Template selector for duplicate */}
      {selected === 'duplicate' && allTemplates.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Selecione o template base</p>
          <div className="space-y-2">
            {allTemplates.map(t => (
              <button
                key={t.id}
                onClick={() => onSelectTemplate(t.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                  selectedTemplateId === t.id
                    ? 'border-[var(--color-gold)]/50 bg-[var(--color-gold)]/8'
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                )}
              >
                {t.isBaseTemplate
                  ? <Star size={13} className="text-[var(--color-gold)] flex-shrink-0" />
                  : <Layers size={13} className="text-[var(--color-text-muted)] flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{t.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{t.blocks.length} blocos · {t.blocks.reduce((s, b) => s + b.fields.length, 0)} campos</p>
                </div>
                {selectedTemplateId === t.id && <Check size={12} className="text-[var(--color-gold)] flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Basics ───────────────────────────────────────────────────────────
function StepBasics({
  name,
  description,
  status,
  onChange,
}: {
  name: string;
  description: string;
  status: 'active' | 'archived';
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold font-cinzel text-[var(--color-text-primary)] mb-1">Detalhes do template</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">Dê um nome e descrição ao seu template.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
            Nome <span className="text-red-400">*</span>
          </label>
          <input
            value={name}
            onChange={e => onChange('name', e.target.value)}
            className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors font-cinzel"
            placeholder="Ex: Mesa 35 — Sessão Express"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Descrição</label>
          <textarea
            value={description}
            onChange={e => onChange('description', e.target.value)}
            rows={3}
            className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
            placeholder="Descreva o objetivo deste template…"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Estado inicial</label>
          <div className="flex gap-2">
            {[
              { val: 'active',   label: 'Ativo',    desc: 'Disponível para uso imediato' },
              { val: 'archived', label: 'Rascunho',  desc: 'Guardar sem disponibilizar' },
            ].map(s => (
              <button
                key={s.val}
                onClick={() => onChange('status', s.val)}
                className={cn(
                  'flex-1 p-3 rounded-xl border text-left transition-colors',
                  status === s.val
                    ? s.val === 'active'
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'
                    : 'border-[var(--color-border)] hover:bg-[var(--color-surface-1)]'
                )}
              >
                <p className={cn('text-xs font-semibold', status === s.val && s.val === 'active' ? 'text-emerald-400' : 'text-[var(--color-text-primary)]')}>{s.label}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Wizard Modal ─────────────────────────────────────────────────────────────
export default function TemplateWizard() {
  const navigate = useNavigate();

  const [step, setStep] = useState<WizardStep>('methodology');
  const [methodologyId, setMethodologyId] = useState('');
  const [startingPoint, setStartingPoint] = useState<StartingPoint | null>(null);
  const [baseTemplateId, setBaseTemplateId] = useState('');
  const [name, setName] = useState('Novo Template');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');

  // Pre-fill name when methodology changes
  const handleMethodologySelect = (id: string) => {
    setMethodologyId(id);
    const m = METHODOLOGIES.find(m => m.id === id);
    if (m) setName(`${m.shortName} — Novo Template`);
  };

  const canNext = () => {
    if (step === 'methodology') return !!methodologyId;
    if (step === 'starting_point') {
      if (!startingPoint) return false;
      if (startingPoint === 'duplicate' && !baseTemplateId) return false;
      return true;
    }
    if (step === 'basics') return name.trim().length > 0;
    return false;
  };

  const handleNext = () => {
    if (step === 'methodology') {
      setStep('starting_point');
      // auto-select official if exists
      const official = TEMPLATES.find(t => t.methodologyId === methodologyId && t.isBaseTemplate);
      if (official && !startingPoint) {
        setStartingPoint('official');
        setBaseTemplateId(official.id);
      }
    } else if (step === 'starting_point') {
      setStep('basics');
    } else if (step === 'basics') {
      // Navigate to builder with params
      const from = startingPoint === 'blank' ? '' : baseTemplateId || TEMPLATES.find(t => t.methodologyId === methodologyId && t.isBaseTemplate)?.id || '';
      if (from) {
        navigate(`/templates/${from}/edit?new=1&name=${encodeURIComponent(name)}`);
      } else {
        navigate(`/templates/new?methodologyId=${methodologyId}&name=${encodeURIComponent(name)}`);
      }
    }
  };

  const handleBack = () => {
    if (step === 'starting_point') setStep('methodology');
    if (step === 'basics') setStep('starting_point');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[var(--color-surface-0)] rounded-2xl border border-[var(--color-border)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div>
            <p className="text-sm font-semibold font-cinzel text-[var(--color-text-primary)]">Novo Template</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Passo {STEPS.findIndex(s => s.id === step) + 1} de {STEPS.length}</p>
          </div>
          <button
            onClick={() => navigate('/templates')}
            className="p-2 rounded-xl hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <StepBar current={step} />

          {step === 'methodology' && (
            <StepMethodology selected={methodologyId} onSelect={handleMethodologySelect} />
          )}
          {step === 'starting_point' && (
            <StepStartingPoint
              methodologyId={methodologyId}
              selected={startingPoint}
              selectedTemplateId={baseTemplateId}
              onSelect={s => {
                setStartingPoint(s);
                if (s === 'official') {
                  const t = TEMPLATES.find(t => t.methodologyId === methodologyId && t.isBaseTemplate);
                  if (t) setBaseTemplateId(t.id);
                } else if (s === 'blank') {
                  setBaseTemplateId('');
                }
              }}
              onSelectTemplate={setBaseTemplateId}
            />
          )}
          {step === 'basics' && (
            <StepBasics
              name={name}
              description={description}
              status={status}
              onChange={(field, value) => {
                if (field === 'name') setName(value);
                if (field === 'description') setDescription(value);
                if (field === 'status') setStatus(value as any);
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={step === 'methodology' ? () => navigate('/templates') : handleBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
          >
            <ChevronLeft size={14} />
            {step === 'methodology' ? 'Cancelar' : 'Anterior'}
          </button>

          <button
            onClick={handleNext}
            disabled={!canNext()}
            className={cn(
              'flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition-all',
              canNext()
                ? step === 'basics'
                  ? 'bg-[var(--color-gold)] text-[var(--color-void)] hover:opacity-90'
                  : 'bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/40 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] cursor-not-allowed'
            )}
          >
            {step === 'basics' ? 'Abrir Builder' : 'Seguinte'}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
