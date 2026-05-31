/**
 * Template state management
 * Supabase-ready: state shape maps to radionics_session_templates + radionics_template_blocks + radionics_template_fields
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Template, TemplateBlock, TemplateField, SaveState } from '@/types';
import { TEMPLATES } from '@/data/mock-data';

// ─── Block Library ────────────────────────────────────────────────────────────
export const BLOCK_LIBRARY = [
  // ── Common ──────────────────────────────────────────────────────────────────
  {
    id: 'lib-client-id',
    category: 'common' as const,
    title: 'Identificação do Cliente',
    description: 'Nome, data de nascimento, localização',
    suggestedStages: ['preparation'],
    defaultFields: [
      { fieldCode: 'full_name', label: 'Nome Completo', fieldType: 'short_text' as const, orderIndex: 0, isRequired: true, placeholder: 'Nome completo' },
      { fieldCode: 'birth_date', label: 'Data de Nascimento', fieldType: 'date' as const, orderIndex: 1, isRequired: false },
      { fieldCode: 'location', label: 'Localização', fieldType: 'short_text' as const, orderIndex: 2, isRequired: false, placeholder: 'Cidade, País' },
    ],
  },
  {
    id: 'lib-main-concern',
    category: 'common' as const,
    title: 'Preocupação Principal',
    description: 'O que traz o cliente à sessão',
    suggestedStages: ['preparation'],
    defaultFields: [
      { fieldCode: 'main_concern', label: 'Preocupação Principal', fieldType: 'long_text' as const, orderIndex: 0, isRequired: true, placeholder: 'Descreva a principal preocupação...' },
    ],
  },
  {
    id: 'lib-session-intention',
    category: 'common' as const,
    title: 'Intenção da Sessão',
    description: 'Objetivo terapêutico da sessão',
    suggestedStages: ['preparation'],
    defaultFields: [
      { fieldCode: 'intention', label: 'Intenção Terapêutica', fieldType: 'long_text' as const, orderIndex: 0, isRequired: true, placeholder: 'Descreva o objetivo principal desta sessão...' },
    ],
  },
  {
    id: 'lib-health-notes',
    category: 'common' as const,
    title: 'Notas de Saúde',
    description: 'Condições de saúde relevantes',
    suggestedStages: ['preparation'],
    defaultFields: [
      { fieldCode: 'health_notes', label: 'Notas de Saúde', fieldType: 'long_text' as const, orderIndex: 0, isRequired: false, placeholder: 'Condições relevantes de saúde...' },
    ],
  },
  {
    id: 'lib-emotional-history',
    category: 'common' as const,
    title: 'Histórico Emocional',
    description: 'Padrões e histórico emocional do cliente',
    suggestedStages: ['preparation', 'diagnosis'],
    defaultFields: [
      { fieldCode: 'emotional_history', label: 'Histórico Emocional', fieldType: 'long_text' as const, orderIndex: 0, isRequired: false, placeholder: 'Padrões emocionais observados...' },
    ],
  },
  {
    id: 'lib-energetic-history',
    category: 'common' as const,
    title: 'Histórico Energético',
    description: 'Sessões anteriores e evolução energética',
    suggestedStages: ['preparation'],
    defaultFields: [
      { fieldCode: 'energetic_history', label: 'Histórico Energético', fieldType: 'long_text' as const, orderIndex: 0, isRequired: false, placeholder: 'Sessões anteriores, evolução observada...' },
    ],
  },
  {
    id: 'lib-consent',
    category: 'common' as const,
    title: 'Consentimento',
    description: 'Confirmação de consentimento informado',
    suggestedStages: ['preparation'],
    defaultFields: [
      { fieldCode: 'consent', label: 'Cliente deu consentimento informado', fieldType: 'checkbox' as const, orderIndex: 0, isRequired: true },
    ],
  },

  // ── Therapeutic ─────────────────────────────────────────────────────────────
  {
    id: 'lib-hawkins-initial',
    category: 'therapeutic' as const,
    title: 'Hawkins Inicial',
    description: 'Nível energético no início da sessão',
    suggestedStages: ['preparation', 'diagnosis'],
    defaultFields: [
      { fieldCode: 'hawkins_initial', label: 'Nível Hawkins Inicial', fieldType: 'hawkins_selector' as const, orderIndex: 0, isRequired: false },
    ],
  },
  {
    id: 'lib-hawkins-final',
    category: 'therapeutic' as const,
    title: 'Hawkins Final',
    description: 'Nível energético no encerramento',
    suggestedStages: ['closing'],
    defaultFields: [
      { fieldCode: 'hawkins_final', label: 'Nível Hawkins Final', fieldType: 'hawkins_selector' as const, orderIndex: 0, isRequired: false },
    ],
  },
  {
    id: 'lib-tool-selection',
    category: 'therapeutic' as const,
    title: 'Seleção de Gráficos',
    description: 'Gráficos/símbolos identificados no diagnóstico',
    suggestedStages: ['diagnosis'],
    defaultFields: [
      { fieldCode: 'selected_tools', label: 'Gráficos Identificados', fieldType: 'tool_selector' as const, orderIndex: 0, isRequired: false },
      { fieldCode: 'diagnosis_notes', label: 'Observações do Diagnóstico', fieldType: 'long_text' as const, orderIndex: 1, isRequired: false, placeholder: 'Padrões observados...' },
    ],
  },
  {
    id: 'lib-tool-activations',
    category: 'therapeutic' as const,
    title: 'Registro de Ativações',
    description: 'Gráficos ativados e observações',
    suggestedStages: ['activations'],
    defaultFields: [
      { fieldCode: 'activation_notes', label: 'Observações de Ativação', fieldType: 'long_text' as const, orderIndex: 0, isRequired: false, placeholder: 'Observações durante as ativações...' },
    ],
  },
  {
    id: 'lib-chakras',
    category: 'therapeutic' as const,
    title: 'Chakras',
    description: 'Análise e balanceamento de chakras',
    suggestedStages: ['diagnosis', 'activations'],
    defaultFields: [
      { fieldCode: 'chakras_notes', label: 'Observações de Chakras', fieldType: 'long_text' as const, orderIndex: 0, isRequired: false, placeholder: 'Chakras trabalhados e observações...' },
    ],
  },
  {
    id: 'lib-angel-symbols',
    category: 'therapeutic' as const,
    title: 'Símbolos Angelicais',
    description: 'Trabalho com símbolos angelicais',
    suggestedStages: ['diagnosis', 'activations'],
    defaultFields: [
      { fieldCode: 'angel_symbols', label: 'Símbolos Utilizados', fieldType: 'tool_selector' as const, orderIndex: 0, isRequired: false },
      { fieldCode: 'angel_notes', label: 'Mensagens e Observações', fieldType: 'long_text' as const, orderIndex: 1, isRequired: false, placeholder: 'Mensagens recebidas, observações...' },
    ],
  },
  {
    id: 'lib-graphs',
    category: 'therapeutic' as const,
    title: 'Gráficos Radiônicos',
    description: 'Análise geral de gráficos radiônicos',
    suggestedStages: ['diagnosis'],
    defaultFields: [
      { fieldCode: 'graphs_tools', label: 'Gráficos', fieldType: 'tool_selector' as const, orderIndex: 0, isRequired: false },
    ],
  },

  // ── Report ───────────────────────────────────────────────────────────────────
  {
    id: 'lib-final-interpretation',
    category: 'report' as const,
    title: 'Interpretação Final',
    description: 'Análise terapêutica do terapeuta',
    suggestedStages: ['closing'],
    defaultFields: [
      { fieldCode: 'interpretation', label: 'Interpretação do Terapeuta', fieldType: 'long_text' as const, orderIndex: 0, isRequired: false, placeholder: 'Interpretação e observações finais...' },
    ],
  },
  {
    id: 'lib-recommendations',
    category: 'report' as const,
    title: 'Recomendações',
    description: 'Recomendações para o período de reverberação',
    suggestedStages: ['closing'],
    defaultFields: [
      { fieldCode: 'recommendations', label: 'Recomendações', fieldType: 'long_text' as const, orderIndex: 0, isRequired: false, placeholder: 'Hidratação, meditação, observações...' },
    ],
  },
  {
    id: 'lib-reverberation',
    category: 'report' as const,
    title: 'Reverberação',
    description: 'Período de reverberação e próximos passos',
    suggestedStages: ['closing'],
    defaultFields: [
      { fieldCode: 'reverberation_days', label: 'Dias de Reverberação', fieldType: 'number' as const, orderIndex: 0, isRequired: false, placeholder: '21' },
      { fieldCode: 'next_session_notes', label: 'Notas para Próxima Sessão', fieldType: 'long_text' as const, orderIndex: 1, isRequired: false, placeholder: 'Temas a explorar...' },
    ],
  },
  {
    id: 'lib-next-steps',
    category: 'report' as const,
    title: 'Próximos Passos',
    description: 'Orientações para o período pós-sessão',
    suggestedStages: ['closing'],
    defaultFields: [
      { fieldCode: 'next_steps', label: 'Próximos Passos', fieldType: 'long_text' as const, orderIndex: 0, isRequired: false, placeholder: 'Ações recomendadas...' },
    ],
  },

  // ── Private ──────────────────────────────────────────────────────────────────
  {
    id: 'lib-private-notes',
    category: 'private' as const,
    title: 'Notas Privadas do Terapeuta',
    description: 'Notas visíveis apenas para o terapeuta',
    suggestedStages: ['preparation', 'closing'],
    defaultFields: [
      { fieldCode: 'private_notes', label: 'Notas do Terapeuta', fieldType: 'long_text' as const, orderIndex: 0, isRequired: false, placeholder: 'Observações internas...' },
    ],
  },
];

export const BLOCK_LIBRARY_CATEGORIES = [
  { id: 'common', label: 'Comuns', color: 'text-sky-400' },
  { id: 'therapeutic', label: 'Terapêuticos', color: 'text-violet-400' },
  { id: 'report', label: 'Relatório', color: 'text-amber-400' },
  { id: 'private', label: 'Privados', color: 'text-rose-400' },
];

// ─── useTemplateState hook ────────────────────────────────────────────────────
function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function useTemplateState(initialTemplateId?: string) {
  const existingTemplate = initialTemplateId
    ? TEMPLATES.find(t => t.id === initialTemplateId) ?? null
    : null;

  const [template, setTemplate] = useState<Template>(() => {
    if (existingTemplate) return deepClone(existingTemplate);
    return {
      id: generateId('tmpl'),
      name: 'Novo Template',
      description: '',
      methodologyId: '',
      methodologyName: '',
      isBaseTemplate: false,
      templateType: 'custom',
      status: 'active',
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
  });

  const [saveState, setSaveState] = useState<SaveState>('saved');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save simulation
  const triggerSave = useCallback(() => {
    setSaveState('unsaved');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveState('saving');
      setTimeout(() => setSaveState('saved'), 800);
    }, 1500);
  }, []);

  const updateTemplate = useCallback((updates: Partial<Template>) => {
    setTemplate(t => ({ ...t, ...updates, updatedAt: new Date().toISOString() }));
    triggerSave();
  }, [triggerSave]);

  // ── Block operations ────────────────────────────────────────────────────────
  const addBlock = useCallback((stageCode?: string, libBlockId?: string) => {
    const libBlock = libBlockId ? BLOCK_LIBRARY.find(b => b.id === libBlockId) : null;

    const newBlock: TemplateBlock = {
      id: generateId('blk'),
      blockCode: libBlock ? libBlock.id.replace('lib-', '') : `block_${Date.now()}`,
      title: libBlock?.title ?? 'Novo Bloco',
      description: libBlock?.description,
      orderIndex: template.blocks.filter(b => b.stageCode === stageCode).length,
      stageCode,
      isRequired: false,
      showInSession: true,
      showInReport: false,
      showInHub: false,
      isPrivate: libBlock?.category === 'private' ? true : false,
      fields: (libBlock?.defaultFields ?? []).map((f, i) => ({
        ...f,
        id: generateId('fld'),
        orderIndex: i,
      })),
    };

    setTemplate(t => ({
      ...t,
      blocks: [...t.blocks, newBlock],
      updatedAt: new Date().toISOString(),
    }));
    triggerSave();
    return newBlock.id;
  }, [template.blocks, triggerSave]);

  const updateBlock = useCallback((blockId: string, updates: Partial<TemplateBlock>) => {
    setTemplate(t => ({
      ...t,
      blocks: t.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b),
      updatedAt: new Date().toISOString(),
    }));
    triggerSave();
  }, [triggerSave]);

  const deleteBlock = useCallback((blockId: string) => {
    setTemplate(t => ({
      ...t,
      blocks: t.blocks.filter(b => b.id !== blockId),
      updatedAt: new Date().toISOString(),
    }));
    triggerSave();
  }, [triggerSave]);

  const duplicateBlock = useCallback((blockId: string) => {
    const block = template.blocks.find(b => b.id === blockId);
    if (!block) return;
    const newBlock: TemplateBlock = {
      ...deepClone(block),
      id: generateId('blk'),
      title: `${block.title} (cópia)`,
      orderIndex: block.orderIndex + 0.5,
      fields: block.fields.map(f => ({ ...f, id: generateId('fld') })),
    };
    setTemplate(t => ({
      ...t,
      blocks: [...t.blocks, newBlock].sort((a, b) => a.orderIndex - b.orderIndex),
      updatedAt: new Date().toISOString(),
    }));
    triggerSave();
  }, [template.blocks, triggerSave]);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    setTemplate(t => {
      const block = t.blocks.find(b => b.id === blockId);
      if (!block) return t;
      const stageBlocks = t.blocks
        .filter(b => b.stageCode === block.stageCode)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      const idx = stageBlocks.findIndex(b => b.id === blockId);
      if (direction === 'up' && idx === 0) return t;
      if (direction === 'down' && idx === stageBlocks.length - 1) return t;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      const newBlocks = [...t.blocks];
      const a = newBlocks.find(b => b.id === stageBlocks[idx].id)!;
      const b2 = newBlocks.find(b => b.id === stageBlocks[swapIdx].id)!;
      const tmpOrder = a.orderIndex;
      a.orderIndex = b2.orderIndex;
      b2.orderIndex = tmpOrder;
      return { ...t, blocks: newBlocks, updatedAt: new Date().toISOString() };
    });
    triggerSave();
  }, [triggerSave]);

  // ── Field operations ────────────────────────────────────────────────────────
  const addField = useCallback((blockId: string) => {
    const newField: TemplateField = {
      id: generateId('fld'),
      fieldCode: `field_${Date.now()}`,
      label: 'Novo Campo',
      fieldType: 'short_text',
      orderIndex: 0,
      isRequired: false,
      showInSession: true,
      showInReport: true,
      showInHub: false,
    };
    setTemplate(t => ({
      ...t,
      blocks: t.blocks.map(b => b.id === blockId
        ? { ...b, fields: [...b.fields, { ...newField, orderIndex: b.fields.length }] }
        : b
      ),
      updatedAt: new Date().toISOString(),
    }));
    triggerSave();
    return newField.id;
  }, [triggerSave]);

  const updateField = useCallback((blockId: string, fieldId: string, updates: Partial<TemplateField>) => {
    setTemplate(t => ({
      ...t,
      blocks: t.blocks.map(b => b.id === blockId
        ? { ...b, fields: b.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f) }
        : b
      ),
      updatedAt: new Date().toISOString(),
    }));
    triggerSave();
  }, [triggerSave]);

  const deleteField = useCallback((blockId: string, fieldId: string) => {
    setTemplate(t => ({
      ...t,
      blocks: t.blocks.map(b => b.id === blockId
        ? { ...b, fields: b.fields.filter(f => f.id !== fieldId) }
        : b
      ),
      updatedAt: new Date().toISOString(),
    }));
    triggerSave();
  }, [triggerSave]);

  // ── Computed ────────────────────────────────────────────────────────────────
  const blocksByStage = (stageCode: string) =>
    template.blocks
      .filter(b => b.stageCode === stageCode)
      .sort((a, b) => a.orderIndex - b.orderIndex);

  const totalBlocks = template.blocks.length;
  const totalFields = template.blocks.reduce((s, b) => s + b.fields.length, 0);

  // Supabase-ready snapshot
  const snapshot = {
    // radionics_session_templates
    id: template.id,
    name: template.name,
    description: template.description,
    methodology_id: template.methodologyId,
    is_base_template: template.isBaseTemplate,
    template_type: template.templateType,
    status: template.status,
    version: template.version ?? 1,
    parent_template_id: template.parentTemplateId ?? null,
    created_at: template.createdAt,
    updated_at: template.updatedAt,
    // radionics_template_blocks (nested)
    blocks: template.blocks.map(b => ({
      id: b.id,
      template_id: template.id,
      block_code: b.blockCode,
      title: b.title,
      description: b.description ?? null,
      order_index: b.orderIndex,
      stage_code: b.stageCode ?? null,
      is_required: b.isRequired,
      show_in_session: b.showInSession,
      show_in_report: b.showInReport,
      show_in_hub: b.showInHub,
      is_private: b.isPrivate,
      // radionics_template_fields (nested)
      fields: b.fields.map(f => ({
        id: f.id,
        block_id: b.id,
        field_code: f.fieldCode,
        label: f.label,
        field_type: f.fieldType,
        order_index: f.orderIndex,
        is_required: f.isRequired,
        placeholder: f.placeholder ?? null,
        help_text: f.helpText ?? null,
        options: f.options ?? null,
        show_in_session: f.showInSession ?? true,
        show_in_report: f.showInReport ?? true,
        show_in_hub: f.showInHub ?? false,
      })),
    })),
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return {
    template,
    setTemplate,
    updateTemplate,
    saveState,
    // block ops
    addBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    // field ops
    addField,
    updateField,
    deleteField,
    // computed
    blocksByStage,
    totalBlocks,
    totalFields,
    snapshot,
    isReadOnly: template.isBaseTemplate,
  };
}
