import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Lock, User, Layers, Sparkles,
} from 'lucide-react';
import { CLIENTS } from '@/data/mock-data';
import {
  getActiveTemplatesForSpecialty,
  resolveSpecialtyToMethodologyId,
} from '@/lib/sessionTemplates';
import { getApprovedSpecialties } from '@/services/specialtiesService';
import { createSession } from '@/services/sessionsService';
import { cn } from '@/lib/utils';
import type { Specialty, Template, Client, SessionMode } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type WizardStep = 'specialty' | 'template' | 'client' | 'confirm';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'specialty', label: 'Especialidade' },
  { id: 'template', label: 'Template' },
  { id: 'client', label: 'Cliente' },
  { id: 'confirm', label: 'Confirmar' },
];

export default function NewSessionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<WizardStep>('specialty');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sessionMode, setSessionMode] = useState<SessionMode>('distance');
  const [intention, setIntention] = useState('');
  const [creating, setCreating] = useState(false);

  const { data: approvedSpecialties = [], isLoading } = useQuery({
    queryKey: ['approved-specialties'],
    queryFn: getApprovedSpecialties,
  });

  const availableTemplates = useMemo(() => {
    if (!selectedSpecialty) return [];
    return getActiveTemplatesForSpecialty(selectedSpecialty);
  }, [selectedSpecialty]);

  const stepIndex = STEPS.findIndex(s => s.id === step);

  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.id);
  };

  const goBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev.id);
  };

  const handleStart = async () => {
    if (!selectedSpecialty || !selectedTemplate || !selectedClient) return;
    setCreating(true);
    try {
      const session = await createSession({
        clientId: selectedClient.id,
        specialtyId: resolveSpecialtyToMethodologyId(selectedSpecialty),
        templateId: selectedTemplate.id,
        sessionMode,
        intention: intention || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['sessions'] });
      navigate(`/sessions/${session.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-full bg-[var(--color-void)]">
      <div className="px-6 py-6 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/sessions" className="p-2 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">Nova Sessão</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Apenas especialidades certificadas estão disponíveis</p>
          </div>
        </div>

        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'flex-1 h-1 rounded-full transition-colors',
                i <= stepIndex ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-border)]',
              )}
            />
          ))}
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {step === 'specialty' && (
          <>
            <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-secondary)]">Escolher especialidade</h2>
            {isLoading ? (
              <p className="text-sm text-[var(--color-text-muted)]">A carregar...</p>
            ) : approvedSpecialties.length === 0 ? (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-8 text-center">
                <Lock size={32} className="mx-auto text-[var(--color-text-muted)] opacity-40 mb-3" />
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                  Não tem especialidades certificadas. Submeta uma certificação para iniciar sessões.
                </p>
                <Link to="/certifications" className="text-sm text-[var(--color-gold)] hover:underline">
                  Ir para Especialidades e Certificações
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {approvedSpecialties.map(spec => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => {
                      setSelectedSpecialty(spec);
                      setSelectedTemplate(null);
                      goNext();
                    }}
                    className={cn(
                      'text-left rounded-2xl border p-4 transition-all hover:border-[var(--color-gold)]/50',
                      selectedSpecialty?.id === spec.id
                        ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5'
                        : 'border-[var(--color-border)] bg-[var(--color-surface-0)]',
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-medium">Certificado</span>
                    </div>
                    <p className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">{spec.name}</p>
                    {spec.description && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">{spec.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {step === 'template' && (
          <>
            <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-secondary)]">Escolher template</h2>
            {selectedSpecialty && (
              <p className="text-xs text-[var(--color-text-muted)]">
                Especialidade: <span className="text-[var(--color-text-secondary)]">{selectedSpecialty.name}</span>
              </p>
            )}
            {availableTemplates.length === 0 ? (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-8 text-center">
                <Layers size={32} className="mx-auto text-[var(--color-text-muted)] opacity-40 mb-3" />
                <p className="text-sm text-[var(--color-text-primary)] font-medium mb-2">
                  Nenhum template disponível para esta especialidade.
                </p>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                  Crie um template ou escolha outra especialidade.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/templates/new"
                    className="text-sm text-[var(--color-gold)] hover:underline"
                  >
                    Criar template
                  </Link>
                  <span className="hidden sm:inline text-[var(--color-text-muted)]">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setStep('specialty');
                    }}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  >
                    Escolher outra especialidade
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {availableTemplates.map(tmpl => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => { setSelectedTemplate(tmpl); goNext(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-0)] hover:border-[var(--color-gold)]/50 text-left transition-colors"
                  >
                    <Layers size={16} className="text-[var(--color-gold)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{tmpl.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {tmpl.templateType === 'official' ? 'Oficial' : 'Personalizado'}
                        {tmpl.description ? ` · ${tmpl.description}` : ''}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {step === 'client' && (
          <>
            <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-secondary)]">Escolher cliente</h2>
            <div className="space-y-2">
              {CLIENTS.map(client => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => { setSelectedClient(client); goNext(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-0)] hover:border-[var(--color-gold)]/50 text-left transition-colors"
                >
                  <User size={16} className="text-[var(--color-text-muted)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{client.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{client.email ?? client.phone ?? 'Sem contacto'}</p>
                  </div>
                  <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'confirm' && selectedSpecialty && selectedTemplate && selectedClient && (
          <>
            <h2 className="font-cinzel text-sm font-semibold text-[var(--color-text-secondary)]">Confirmar sessão</h2>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-5 space-y-4">
              <SummaryRow label="Especialidade" value={selectedSpecialty.name} />
              <SummaryRow label="Template" value={selectedTemplate.name} />
              <SummaryRow label="Cliente" value={selectedClient.name} />
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Modo</label>
                <select
                  value={sessionMode}
                  onChange={e => setSessionMode(e.target.value as SessionMode)}
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)]"
                >
                  <option value="presential">Presencial</option>
                  <option value="online">Online</option>
                  <option value="distance">À distância</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Intenção (opcional)</label>
                <textarea
                  value={intention}
                  onChange={e => setIntention(e.target.value)}
                  rows={3}
                  placeholder="Objetivo terapêutico da sessão..."
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] resize-none"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={creating}
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Sparkles size={16} />
              {creating ? 'A criar...' : 'Iniciar sessão'}
            </button>
          </>
        )}

        {stepIndex > 0 && step !== 'confirm' && (
          <button type="button" onClick={goBack} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
            ← Voltar
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="font-medium text-[var(--color-text-primary)] text-right">{value}</span>
    </div>
  );
}
