import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, GripVertical, Trash2, ChevronDown, Check, Save,
  BookOpen, Zap, SlidersHorizontal, Sparkles, CheckCircle2,
  Layers, Lock, Copy, Eye, EyeOff, Settings2, Library,
  AlertCircle, MoveUp, MoveDown, Monitor, FileText, Users,
  ChevronRight, X, Info, RefreshCw, Loader2,
} from 'lucide-react';
import { METHODOLOGIES } from '@/data/mock-data';
import { useTemplateState, BLOCK_LIBRARY, BLOCK_LIBRARY_CATEGORIES } from '@/lib/template-state';
import { cn } from '@/lib/utils';
import type { TemplateBlock, TemplateField, FieldType, SaveState } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  short_text:       'Texto curto',
  long_text:        'Texto longo',
  number:           'Número',
  date:             'Data',
  single_select:    'Seleção única',
  multi_select:     'Seleção múltipla',
  checkbox:         'Checkbox',
  image:            'Imagem',
  audio:            'Áudio',
  hawkins_selector: 'Hawkins',
  tool_selector:    'Gráficos',
};

const FIELD_TYPES = Object.entries(FIELD_TYPE_LABELS) as [FieldType, string][];

const STAGE_DEFS = [
  { code: 'preparation',  label: 'Preparação',   icon: BookOpen,          color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20', activeBorder: 'border-violet-400/50' },
  { code: 'connection',   label: 'Conexão',       icon: Zap,               color: 'text-sky-400',    bg: 'bg-sky-400/10',    border: 'border-sky-400/20',    activeBorder: 'border-sky-400/50'    },
  { code: 'diagnosis',    label: 'Diagnóstico',   icon: SlidersHorizontal, color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20',  activeBorder: 'border-amber-400/50'  },
  { code: 'activations',  label: 'Ativações',     icon: Sparkles,          color: 'text-emerald-400',bg: 'bg-emerald-400/10',border: 'border-emerald-400/20',activeBorder: 'border-emerald-400/50'},
  { code: 'closing',      label: 'Encerramento',  icon: CheckCircle2,      color: 'text-teal-400',   bg: 'bg-teal-400/10',   border: 'border-teal-400/20',   activeBorder: 'border-teal-400/50'  },
];

// ─── Save Indicator ───────────────────────────────────────────────────────────
function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'saving') return (
    <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
      <Loader2 size={11} className="animate-spin" /> A guardar…
    </span>
  );
  if (state === 'unsaved') return (
    <span className="flex items-center gap-1.5 text-xs text-amber-400">
      <RefreshCw size={11} /> Alterações não guardadas
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
      <Check size={11} /> Guardado
    </span>
  );
}

// ─── Read-Only Banner ─────────────────────────────────────────────────────────
function ReadOnlyBanner({ onDuplicate }: { onDuplicate: () => void }) {
  return (
    <div className="mx-4 mt-4 rounded-xl border border-amber-500/30 bg-amber-500/8 p-3 flex items-start gap-3">
      <Lock size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-amber-300">Template oficial — só leitura</p>
        <p className="text-[11px] text-amber-400/70 mt-0.5">Duplicate para criar a sua própria versão editável.</p>
      </div>
      <button
        onClick={onDuplicate}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-colors flex-shrink-0"
      >
        <Copy size={11} />
        Duplicar
      </button>
    </div>
  );
}

// ─── Field Editor (right panel) ───────────────────────────────────────────────
function FieldEditor({
  field,
  blockTitle,
  isReadOnly,
  onUpdate,
  onDelete,
  onClose,
}: {
  field: TemplateField;
  blockTitle: string;
  isReadOnly: boolean;
  onUpdate: (updates: Partial<TemplateField>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-primary)]">Editar Campo</p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate max-w-[160px]">{blockTitle}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors">
          <X size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Label */}
        <div>
          <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Label</label>
          <input
            value={field.label}
            onChange={e => !isReadOnly && onUpdate({ label: e.target.value })}
            disabled={isReadOnly}
            className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors disabled:opacity-50"
            placeholder="Label do campo…"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Tipo</label>
          <select
            value={field.fieldType}
            onChange={e => !isReadOnly && onUpdate({ fieldType: e.target.value as FieldType })}
            disabled={isReadOnly}
            className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors disabled:opacity-50"
          >
            {FIELD_TYPES.map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
        </div>

        {/* Placeholder */}
        {['short_text', 'long_text', 'number'].includes(field.fieldType) && (
          <div>
            <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Placeholder</label>
            <input
              value={field.placeholder || ''}
              onChange={e => !isReadOnly && onUpdate({ placeholder: e.target.value })}
              disabled={isReadOnly}
              className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors disabled:opacity-50"
              placeholder="Texto de exemplo…"
            />
          </div>
        )}

        {/* Help text */}
        <div>
          <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Texto de Ajuda</label>
          <input
            value={field.helpText || ''}
            onChange={e => !isReadOnly && onUpdate({ helpText: e.target.value })}
            disabled={isReadOnly}
            className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors disabled:opacity-50"
            placeholder="Dica para o utilizador…"
          />
        </div>

        {/* Options for select types */}
        {['single_select', 'multi_select'].includes(field.fieldType) && (
          <div>
            <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Opções (uma por linha)</label>
            <textarea
              value={(field.options || []).join('\n')}
              onChange={e => !isReadOnly && onUpdate({ options: e.target.value.split('\n').filter(Boolean) })}
              disabled={isReadOnly}
              rows={4}
              className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none disabled:opacity-50"
              placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
            />
          </div>
        )}

        {/* Required */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)]">
          <div>
            <p className="text-xs font-medium text-[var(--color-text-primary)]">Obrigatório</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Campo deve ser preenchido</p>
          </div>
          <button
            onClick={() => !isReadOnly && onUpdate({ isRequired: !field.isRequired })}
            disabled={isReadOnly}
            className={cn(
              'w-9 h-5 rounded-full transition-all relative flex-shrink-0 disabled:opacity-50',
              field.isRequired ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-surface-2)]'
            )}
          >
            <div className={cn(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm',
              field.isRequired ? 'left-[calc(100%-18px)]' : 'left-0.5'
            )} />
          </button>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Visibilidade</label>
          <div className="space-y-2">
            {[
              { key: 'showInSession', icon: Monitor, label: 'Sessão', desc: 'Visível durante a sessão' },
              { key: 'showInReport',  icon: FileText, label: 'Relatório', desc: 'Incluído no relatório' },
              { key: 'showInHub',     icon: Users,    label: 'Hub do Cliente', desc: 'Visível ao cliente' },
            ].map(({ key, icon: Icon, label, desc }) => {
              const val = field[key as keyof TemplateField] as boolean ?? (key === 'showInSession');
              return (
                <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <Icon size={12} className="text-[var(--color-text-muted)]" />
                    <div>
                      <p className="text-xs text-[var(--color-text-primary)]">{label}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !isReadOnly && onUpdate({ [key]: !val })}
                    disabled={isReadOnly}
                    className={cn(
                      'w-8 rounded-full transition-all relative flex-shrink-0 disabled:opacity-50',
                      val ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-surface-2)]'
                    )}
                    style={{ width: 32, height: 18 }}
                  >
                    <div className={cn(
                      'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm',
                      val ? 'left-[calc(100%-16px)]' : 'left-0.5'
                    )} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delete */}
      {!isReadOnly && (
        <div className="p-4 border-t border-[var(--color-border)] flex-shrink-0">
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-red-900/50 text-xs text-red-400 hover:bg-red-500/8 transition-colors"
          >
            <Trash2 size={12} />
            Remover Campo
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Block Config (right panel) ───────────────────────────────────────────────
function BlockConfig({
  block,
  isReadOnly,
  onUpdate,
  onDuplicate,
  onDelete,
  onClose,
  onAddField,
  onSelectField,
}: {
  block: TemplateBlock;
  isReadOnly: boolean;
  onUpdate: (updates: Partial<TemplateBlock>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
  onAddField: () => void;
  onSelectField: (fieldId: string) => void;
}) {
  const stage = STAGE_DEFS.find(s => s.code === block.stageCode);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {stage && (
            <div className={cn('w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0', stage.bg)}>
              <stage.icon size={11} className={stage.color} />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{block.title}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Configuração do bloco</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors flex-shrink-0">
          <X size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Título</label>
          <input
            value={block.title}
            onChange={e => !isReadOnly && onUpdate({ title: e.target.value })}
            disabled={isReadOnly}
            className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors disabled:opacity-50"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Descrição</label>
          <textarea
            value={block.description || ''}
            onChange={e => !isReadOnly && onUpdate({ description: e.target.value })}
            disabled={isReadOnly}
            rows={2}
            className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none disabled:opacity-50"
            placeholder="Descrição breve do bloco…"
          />
        </div>

        {/* Required */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)]">
          <div>
            <p className="text-xs font-medium text-[var(--color-text-primary)]">Bloco Obrigatório</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Não pode ser removido da sessão</p>
          </div>
          <button
            onClick={() => !isReadOnly && onUpdate({ isRequired: !block.isRequired })}
            disabled={isReadOnly}
            className={cn('w-9 h-5 rounded-full transition-all relative flex-shrink-0 disabled:opacity-50', block.isRequired ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-surface-2)]')}
          >
            <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm', block.isRequired ? 'left-[calc(100%-18px)]' : 'left-0.5')} />
          </button>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Visibilidade do Bloco</label>
          <div className="space-y-2">
            {[
              { key: 'showInSession', icon: Monitor,  label: 'Sessão',         desc: 'Visível na sessão' },
              { key: 'showInReport',  icon: FileText,  label: 'Relatório',      desc: 'No relatório final' },
              { key: 'showInHub',     icon: Users,     label: 'Hub do Cliente', desc: 'Visível ao cliente' },
              { key: 'isPrivate',     icon: Lock,      label: 'Privado',        desc: 'Apenas terapeuta', red: true },
            ].map(({ key, icon: Icon, label, desc, red }) => {
              const val = block[key as keyof TemplateBlock] as boolean;
              return (
                <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <Icon size={12} className={red && val ? 'text-amber-400' : 'text-[var(--color-text-muted)]'} />
                    <div>
                      <p className="text-xs text-[var(--color-text-primary)]">{label}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !isReadOnly && onUpdate({ [key]: !val })}
                    disabled={isReadOnly}
                    style={{ width: 32, height: 18 }}
                    className={cn(
                      'rounded-full transition-all relative flex-shrink-0 disabled:opacity-50',
                      val ? (red ? 'bg-amber-500' : 'bg-[var(--color-gold)]') : 'bg-[var(--color-surface-2)]'
                    )}
                  >
                    <div className={cn('absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm', val ? 'left-[calc(100%-16px)]' : 'left-0.5')} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fields list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Campos ({block.fields.length})</label>
            {!isReadOnly && (
              <button
                onClick={onAddField}
                className="flex items-center gap-1 text-[10px] text-[var(--color-gold)] hover:opacity-80 transition-opacity"
              >
                <Plus size={10} /> Adicionar
              </button>
            )}
          </div>
          {block.fields.length === 0 ? (
            <div className="text-center py-4 text-[11px] text-[var(--color-text-muted)]">
              Nenhum campo. Adicione campos ao bloco.
            </div>
          ) : (
            <div className="space-y-1.5">
              {block.fields.map(f => (
                <button
                  key={f.id}
                  onClick={() => onSelectField(f.id)}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--color-text-primary)] truncate">{f.label}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{FIELD_TYPE_LABELS[f.fieldType]}</p>
                  </div>
                  {f.isRequired && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--color-gold)]/30 text-[var(--color-gold)] flex-shrink-0">Obrig.</span>
                  )}
                  <ChevronRight size={10} className="text-[var(--color-text-muted)] flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isReadOnly && (
        <div className="p-4 border-t border-[var(--color-border)] flex-shrink-0 space-y-2">
          <button
            onClick={onDuplicate}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <Copy size={12} />
            Duplicar Bloco
          </button>
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-red-900/50 text-xs text-red-400 hover:bg-red-500/8 transition-colors"
          >
            <Trash2 size={12} />
            Remover Bloco
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Block Library Drawer ─────────────────────────────────────────────────────
function BlockLibraryDrawer({
  open,
  activeStageCode,
  onClose,
  onAdd,
}: {
  open: boolean;
  activeStageCode: string;
  onClose: () => void;
  onAdd: (libBlockId: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = BLOCK_LIBRARY.filter(b => {
    if (activeCategory !== 'all' && b.category !== activeCategory) return false;
    return true;
  });

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={onClose} />}

      {/* Drawer */}
      <div className={cn(
        'fixed top-0 left-0 h-full w-80 z-40 bg-[var(--color-surface-0)] border-r border-[var(--color-border)] flex flex-col transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Biblioteca de Blocos</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Clique para adicionar à etapa</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 p-3 border-b border-[var(--color-border)] flex-shrink-0 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn('px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors', activeCategory === 'all' ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]')}
          >
            Todos
          </button>
          {BLOCK_LIBRARY_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn('px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors', activeCategory === cat.id ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]')}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {BLOCK_LIBRARY_CATEGORIES.filter(cat => activeCategory === 'all' || cat.id === activeCategory).map(cat => {
            const items = filtered.filter(b => b.category === cat.id);
            if (items.length === 0) return null;
            return (
              <div key={cat.id}>
                <p className={cn('text-[9px] font-semibold uppercase tracking-wider mb-1.5 px-1', cat.color)}>{cat.label}</p>
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { onAdd(item.id); onClose(); }}
                    className="w-full text-left p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-all mb-1.5 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-gold)] transition-colors">{item.title}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{item.description}</p>
                        <p className="text-[9px] text-[var(--color-text-muted)] mt-1">{item.defaultFields.length} campo{item.defaultFields.length !== 1 ? 's' : ''}</p>
                      </div>
                      <Plus size={12} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-gold)] transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Block Card ───────────────────────────────────────────────────────────────
function BlockCard({
  block,
  isReadOnly,
  isSelected,
  onSelect,
  onUpdate,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddField,
  onSelectField,
}: {
  block: TemplateBlock;
  isReadOnly: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TemplateBlock>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddField: () => void;
  onSelectField: (fieldId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const visChips = [
    { show: block.showInSession, label: 'S', title: 'Sessão',    active: 'bg-[var(--color-gold)]/15 border-[var(--color-gold)]/40 text-[var(--color-gold)]' },
    { show: block.showInReport,  label: 'R', title: 'Relatório', active: 'bg-sky-400/15 border-sky-400/40 text-sky-400' },
    { show: block.showInHub,     label: 'H', title: 'Hub',       active: 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400' },
    { show: block.isPrivate,     label: 'P', title: 'Privado',   active: 'bg-amber-400/15 border-amber-400/40 text-amber-400' },
  ];

  return (
    <div
      className={cn(
        'group rounded-2xl border bg-[var(--color-surface-0)] overflow-hidden transition-all',
        isSelected ? 'border-[var(--color-gold)]/60 ring-1 ring-[var(--color-gold)]/20' : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-[var(--color-surface-1)] transition-colors"
        onClick={() => { onSelect(); setExpanded(e => !e); }}
      >
        {!isReadOnly && (
          <div
            className="cursor-grab text-[var(--color-text-muted)] flex-shrink-0 hover:text-[var(--color-text-secondary)]"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{block.title}</p>
            {block.isRequired && (
              <span className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--color-gold)]/30 text-[var(--color-gold)] flex-shrink-0">Obrig.</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] text-[var(--color-text-muted)]">{block.fields.length} campo{block.fields.length !== 1 ? 's' : ''}</span>
            <span className="text-[var(--color-text-muted)]">·</span>
            <div className="flex items-center gap-1">
              {visChips.filter(v => v.show).map(v => (
                <span key={v.label} title={v.title} className={cn('text-[9px] w-4 h-4 rounded flex items-center justify-center border font-bold', v.active)}>
                  {v.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {!isReadOnly && (
            <>
              <button onClick={onMoveUp} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors opacity-0 group-hover:opacity-100" title="Mover cima">
                <MoveUp size={12} />
              </button>
              <button onClick={onMoveDown} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors opacity-0 group-hover:opacity-100" title="Mover baixo">
                <MoveDown size={12} />
              </button>
            </>
          )}
          <button onClick={onSelect} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors" title="Configurar">
            <Settings2 size={12} />
          </button>
          <div className={cn('w-5 h-5 flex items-center justify-center text-[var(--color-text-muted)] transition-transform', !expanded && '-rotate-90')}>
            <ChevronDown size={12} />
          </div>
        </div>
      </div>

      {/* Fields */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-void)] p-3 space-y-1.5">
          {block.description && (
            <p className="text-[11px] text-[var(--color-text-muted)] mb-2 px-1 leading-relaxed">{block.description}</p>
          )}

          {block.fields.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-[11px] text-[var(--color-text-muted)]">Sem campos. Adicione campos a este bloco.</p>
              {!isReadOnly && (
                <button
                  onClick={onAddField}
                  className="mt-2 text-[11px] text-[var(--color-gold)] hover:opacity-80 transition-opacity"
                >
                  + Adicionar campo
                </button>
              )}
            </div>
          ) : (
            <>
              {block.fields.map(field => (
                <button
                  key={field.id}
                  onClick={() => onSelectField(field.id)}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] transition-all text-left group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--color-text-primary)] truncate">{field.label}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{FIELD_TYPE_LABELS[field.fieldType]}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {field.isRequired && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--color-gold)]/30 text-[var(--color-gold)]">Obrig.</span>
                    )}
                    <ChevronRight size={10} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
              {!isReadOnly && (
                <button
                  onClick={onAddField}
                  className="w-full flex items-center gap-2 py-2 rounded-xl border border-dashed border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)] transition-all"
                >
                  <Plus size={10} className="ml-3" />
                  Adicionar campo
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({
  open,
  onClose,
  templateName,
  blocksByStage,
}: {
  open: boolean;
  onClose: () => void;
  templateName: string;
  blocksByStage: (stageCode: string) => TemplateBlock[];
}) {
  const [previewTab, setPreviewTab] = useState<'session' | 'report' | 'hub'>('session');
  if (!open) return null;

  const filterFn = (block: TemplateBlock) => {
    if (previewTab === 'session') return block.showInSession;
    if (previewTab === 'report') return block.showInReport;
    if (previewTab === 'hub') return block.showInHub && !block.isPrivate;
    return false;
  };

  const allBlocks = STAGE_DEFS.flatMap(s => blocksByStage(s.code)).filter(filterFn);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[var(--color-surface-0)] rounded-2xl border border-[var(--color-border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] flex-shrink-0">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Pré-visualização</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-cinzel">{templateName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-border)] overflow-hidden">
              {[
                { key: 'session', label: 'Sessão',    icon: Monitor },
                { key: 'report',  label: 'Relatório', icon: FileText },
                { key: 'hub',     label: 'Hub',        icon: Users },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setPreviewTab(key as any)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                    previewTab === key ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  )}
                >
                  <Icon size={11} />
                  {label}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {allBlocks.length === 0 ? (
            <div className="text-center py-12">
              <Eye size={32} className="mx-auto text-[var(--color-text-muted)] opacity-30 mb-3" />
              <p className="text-sm text-[var(--color-text-muted)]">Nenhum bloco visível nesta vista</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Configure a visibilidade dos blocos no builder.</p>
            </div>
          ) : (
            allBlocks.map(block => (
              <div key={block.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{block.title}</p>
                    {block.description && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{block.description}</p>}
                  </div>
                  {block.isPrivate && (
                    <span className="flex items-center gap-1 text-[9px] text-amber-400 border border-amber-400/30 rounded px-1.5 py-0.5">
                      <Lock size={8} />
                      Privado
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {block.fields.map(field => (
                    <div key={field.id}>
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                        {field.label}
                        {field.isRequired && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {field.fieldType === 'short_text' && (
                        <div className="h-8 rounded-lg bg-[var(--color-surface-0)] border border-[var(--color-border)] px-3 flex items-center">
                          <span className="text-[10px] text-[var(--color-text-muted)]">{field.placeholder || 'Texto…'}</span>
                        </div>
                      )}
                      {field.fieldType === 'long_text' && (
                        <div className="h-16 rounded-lg bg-[var(--color-surface-0)] border border-[var(--color-border)] p-2">
                          <span className="text-[10px] text-[var(--color-text-muted)]">{field.placeholder || 'Texto…'}</span>
                        </div>
                      )}
                      {field.fieldType === 'number' && (
                        <div className="h-8 w-24 rounded-lg bg-[var(--color-surface-0)] border border-[var(--color-border)] px-3 flex items-center">
                          <span className="text-[10px] text-[var(--color-text-muted)]">{field.placeholder || '0'}</span>
                        </div>
                      )}
                      {field.fieldType === 'date' && (
                        <div className="h-8 w-40 rounded-lg bg-[var(--color-surface-0)] border border-[var(--color-border)] px-3 flex items-center">
                          <span className="text-[10px] text-[var(--color-text-muted)]">dd/mm/aaaa</span>
                        </div>
                      )}
                      {field.fieldType === 'checkbox' && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border border-[var(--color-border)] bg-[var(--color-surface-0)]" />
                          <span className="text-[11px] text-[var(--color-text-muted)]">{field.label}</span>
                        </div>
                      )}
                      {['single_select', 'multi_select'].includes(field.fieldType) && (
                        <div className="flex flex-wrap gap-1.5">
                          {(field.options || ['Opção 1', 'Opção 2', 'Opção 3']).map(opt => (
                            <span key={opt} className="px-2.5 py-1 rounded-full border border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface-0)]">{opt}</span>
                          ))}
                        </div>
                      )}
                      {field.fieldType === 'hawkins_selector' && (
                        <div className="h-8 rounded-lg bg-[var(--color-surface-0)] border border-[var(--color-border)] px-3 flex items-center justify-between">
                          <span className="text-[10px] text-[var(--color-text-muted)]">Nível Hawkins</span>
                          <span className="text-[10px] text-[var(--color-gold)]">0 — 1000</span>
                        </div>
                      )}
                      {field.fieldType === 'tool_selector' && (
                        <div className="h-8 rounded-lg bg-[var(--color-surface-0)] border border-[var(--color-border)] px-3 flex items-center">
                          <span className="text-[10px] text-[var(--color-text-muted)]">Seletor de Gráficos Radiônicos</span>
                        </div>
                      )}
                      {field.fieldType === 'audio' && (
                        <div className="h-8 rounded-lg bg-[var(--color-surface-0)] border border-[var(--color-border)] px-3 flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          </div>
                          <span className="text-[10px] text-[var(--color-text-muted)]">Nota de voz</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Builder ─────────────────────────────────────────────────────────────
export default function TemplateBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    template, updateTemplate, saveState,
    addBlock, updateBlock, deleteBlock, duplicateBlock, moveBlock,
    addField, updateField, deleteField,
    blocksByStage, totalBlocks, totalFields,
    isReadOnly,
  } = useTemplateState(id);

  const [activeStage, setActiveStage] = useState('preparation');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [libOpen, setLibOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const selectedBlock = selectedBlockId
    ? template.blocks.find(b => b.id === selectedBlockId) ?? null
    : null;

  const selectedField = selectedBlock && selectedFieldId
    ? selectedBlock.fields.find(f => f.id === selectedFieldId) ?? null
    : null;

  const stageBlocks = blocksByStage(activeStage);

  const handleAddBlock = (libBlockId?: string) => {
    const newId = addBlock(activeStage, libBlockId);
    setSelectedBlockId(newId);
    setSelectedFieldId(null);
  };

  const handleAddField = (blockId: string) => {
    const block = template.blocks.find(b => b.id === blockId);
    if (!block) return;
    setSelectedBlockId(blockId);
    const newFieldId = addField(blockId);
    setSelectedFieldId(newFieldId);
  };

  const handleDuplicate = () => {
    navigate(`/templates/new?from=${id}`);
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--color-void)] overflow-hidden">
      {/* ── Top Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-0)] flex-shrink-0">
        <button
          onClick={() => navigate('/templates')}
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={14} />
          Templates
        </button>
        <div className="w-px h-4 bg-[var(--color-border)]" />

        {isReadOnly ? (
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-[var(--color-text-muted)]" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)] font-cinzel">{template.name}</span>
          </div>
        ) : (
          <input
            value={template.name}
            onChange={e => updateTemplate({ name: e.target.value })}
            className="flex-1 bg-transparent text-sm font-semibold text-[var(--color-text-primary)] focus:outline-none font-cinzel placeholder:text-[var(--color-text-muted)] min-w-0"
            placeholder="Nome do template…"
          />
        )}

        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          <SaveIndicator state={saveState} />

          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <Eye size={13} />
            Pré-visualizar
          </button>

          {isReadOnly ? (
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Copy size={13} />
              Duplicar
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--color-surface-2)] text-xs text-[var(--color-text-muted)]">
              <Check size={13} className="text-emerald-400" />
              Auto-guardado
            </div>
          )}
        </div>
      </div>

      {/* Read-only banner */}
      {isReadOnly && (
        <div className="flex-shrink-0 mx-4 mt-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-3 flex items-center gap-3">
            <Lock size={13} className="text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-300 flex-1">Template oficial — apenas leitura. Duplique para criar a sua versão.</p>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-colors flex-shrink-0"
            >
              <Copy size={11} />
              Duplicar template
            </button>
          </div>
        </div>
      )}

      {/* ── 3-Column Layout ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* ── LEFT: Stage Navigation ────────────────────────────────────────────── */}
        <div className="w-52 flex-shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-0)] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[var(--color-border)] flex-shrink-0">
            <p className="text-[9px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Etapas</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {STAGE_DEFS.map(stage => {
              const count = blocksByStage(stage.code).length;
              const isActive = activeStage === stage.code;
              return (
                <button
                  key={stage.code}
                  onClick={() => setActiveStage(stage.code)}
                  className={cn(
                    'w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-left',
                    isActive
                      ? `${stage.bg} ${stage.activeBorder} border`
                      : 'hover:bg-[var(--color-surface-1)] border border-transparent'
                  )}
                >
                  <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0', isActive ? stage.bg : 'bg-[var(--color-surface-2)]')}>
                    <stage.icon size={12} className={isActive ? stage.color : 'text-[var(--color-text-muted)]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-medium truncate', isActive ? stage.color : 'text-[var(--color-text-secondary)]')}>
                      {stage.label}
                    </p>
                  </div>
                  <span className={cn(
                    'text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0',
                    count > 0 ? `${stage.bg} ${stage.color}` : 'text-[var(--color-text-muted)]'
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stats */}
          <div className="p-3 border-t border-[var(--color-border)] space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--color-text-muted)]">Blocos</span>
              <span className="text-[10px] font-semibold text-[var(--color-text-primary)]">{totalBlocks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--color-text-muted)]">Campos</span>
              <span className="text-[10px] font-semibold text-[var(--color-text-primary)]">{totalFields}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--color-text-muted)]">Etapas</span>
              <span className="text-[10px] font-semibold text-[var(--color-text-primary)]">5</span>
            </div>

            {/* Visibility legend */}
            <div className="pt-2 border-t border-[var(--color-border)] space-y-1">
              {[
                { key: 'S', label: 'Sessão',    color: 'text-[var(--color-gold)]' },
                { key: 'R', label: 'Relatório', color: 'text-sky-400' },
                { key: 'H', label: 'Hub',       color: 'text-emerald-400' },
                { key: 'P', label: 'Privado',   color: 'text-amber-400' },
              ].map(v => (
                <div key={v.key} className="flex items-center gap-2">
                  <span className={cn('text-[9px] font-bold w-4 h-4 rounded flex items-center justify-center bg-[var(--color-surface-2)]', v.color)}>{v.key}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTER: Blocks ─────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Center header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
            {(() => {
              const s = STAGE_DEFS.find(s => s.code === activeStage)!;
              return (
                <div className="flex items-center gap-2.5">
                  <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center', s.bg, s.border, 'border')}>
                    <s.icon size={14} className={s.color} />
                  </div>
                  <div>
                    <p className={cn('text-sm font-semibold', s.color)}>{s.label}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{stageBlocks.length} bloco{stageBlocks.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              );
            })()}

            {!isReadOnly && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLibOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
                >
                  <Library size={12} />
                  Biblioteca
                </button>
                <button
                  onClick={() => handleAddBlock()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/30 text-xs text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 transition-colors"
                >
                  <Plus size={12} />
                  Novo Bloco
                </button>
              </div>
            )}
          </div>

          {/* Blocks list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {stageBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <Layers size={40} className="text-[var(--color-text-muted)] opacity-20 mb-4" />
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Sem blocos nesta etapa</p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1 max-w-xs">
                  {isReadOnly ? 'Este template não tem blocos configurados para esta etapa.' : 'Adicione blocos personalizados ou escolha da biblioteca.'}
                </p>
                {!isReadOnly && (
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => setLibOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
                    >
                      <Library size={13} />
                      Usar Biblioteca
                    </button>
                    <button
                      onClick={() => handleAddBlock()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/30 text-xs text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 transition-colors"
                    >
                      <Plus size={13} />
                      Bloco em Branco
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {stageBlocks.map(block => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    isReadOnly={isReadOnly}
                    isSelected={selectedBlockId === block.id}
                    onSelect={() => {
                      setSelectedBlockId(block.id);
                      setSelectedFieldId(null);
                    }}
                    onUpdate={updates => updateBlock(block.id, updates)}
                    onDuplicate={() => duplicateBlock(block.id)}
                    onDelete={() => { deleteBlock(block.id); if (selectedBlockId === block.id) setSelectedBlockId(null); }}
                    onMoveUp={() => moveBlock(block.id, 'up')}
                    onMoveDown={() => moveBlock(block.id, 'down')}
                    onAddField={() => handleAddField(block.id)}
                    onSelectField={fieldId => { setSelectedBlockId(block.id); setSelectedFieldId(fieldId); }}
                  />
                ))}

                {!isReadOnly && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setLibOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)] transition-all"
                    >
                      <Library size={12} />
                      Da biblioteca
                    </button>
                    <button
                      onClick={() => handleAddBlock()}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/40 hover:text-[var(--color-gold)] transition-all"
                    >
                      <Plus size={12} />
                      Bloco em branco
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: Config Panel ────────────────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface-0)] flex flex-col overflow-hidden">
          {selectedField && selectedBlock ? (
            <FieldEditor
              field={selectedField}
              blockTitle={selectedBlock.title}
              isReadOnly={isReadOnly}
              onUpdate={updates => updateField(selectedBlock.id, selectedField.id, updates)}
              onDelete={() => { deleteField(selectedBlock.id, selectedField.id); setSelectedFieldId(null); }}
              onClose={() => setSelectedFieldId(null)}
            />
          ) : selectedBlock ? (
            <BlockConfig
              block={selectedBlock}
              isReadOnly={isReadOnly}
              onUpdate={updates => updateBlock(selectedBlock.id, updates)}
              onDuplicate={() => duplicateBlock(selectedBlock.id)}
              onDelete={() => { deleteBlock(selectedBlock.id); setSelectedBlockId(null); }}
              onClose={() => setSelectedBlockId(null)}
              onAddField={() => handleAddField(selectedBlock.id)}
              onSelectField={fieldId => setSelectedFieldId(fieldId)}
            />
          ) : (
            /* Default right panel */
            <div className="h-full flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">Configuração</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Selecione um bloco ou campo</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Template config */}
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Metodologia</label>
                  <select
                    value={template.methodologyId}
                    onChange={e => !isReadOnly && updateTemplate({ methodologyId: e.target.value })}
                    disabled={isReadOnly}
                    className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors disabled:opacity-50"
                  >
                    <option value="">Selecionar…</option>
                    {METHODOLOGIES.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Descrição</label>
                  <textarea
                    value={template.description || ''}
                    onChange={e => !isReadOnly && updateTemplate({ description: e.target.value })}
                    disabled={isReadOnly}
                    rows={3}
                    className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none disabled:opacity-50"
                    placeholder="Descrição do template…"
                  />
                </div>

                {!isReadOnly && (
                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Estado</label>
                    <div className="flex gap-2">
                      {(['active', 'archived'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => updateTemplate({ status: s })}
                          className={cn(
                            'flex-1 py-2 rounded-xl border text-xs font-medium transition-colors',
                            template.status === s
                              ? s === 'active' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                              : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)]'
                          )}
                        >
                          {s === 'active' ? 'Ativo' : 'Arquivado'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick hint */}
                <div className="rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] p-3">
                  <p className="text-[10px] font-semibold text-[var(--color-text-muted)] mb-2">Como usar</p>
                  <ul className="space-y-1.5 text-[10px] text-[var(--color-text-muted)]">
                    <li className="flex items-start gap-1.5"><span className="text-[var(--color-gold)] mt-0.5">1.</span>Selecione uma etapa na coluna esquerda</li>
                    <li className="flex items-start gap-1.5"><span className="text-[var(--color-gold)] mt-0.5">2.</span>Adicione blocos da biblioteca ou em branco</li>
                    <li className="flex items-start gap-1.5"><span className="text-[var(--color-gold)] mt-0.5">3.</span>Clique num bloco para configurar</li>
                    <li className="flex items-start gap-1.5"><span className="text-[var(--color-gold)] mt-0.5">4.</span>Clique num campo para editar detalhes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Block Library Drawer ────────────────────────────────────────────────── */}
      <BlockLibraryDrawer
        open={libOpen}
        activeStageCode={activeStage}
        onClose={() => setLibOpen(false)}
        onAdd={libBlockId => handleAddBlock(libBlockId)}
      />

      {/* ── Preview Modal ────────────────────────────────────────────────────────── */}
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        templateName={template.name}
        blocksByStage={blocksByStage}
      />
    </div>
  );
}
