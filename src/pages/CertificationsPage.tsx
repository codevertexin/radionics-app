import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2, Clock, Lock, Award, ChevronRight,
  FileText, Send, X, AlertCircle, Upload, Trash2, Info,
  Plus, XCircle, ShieldCheck, RefreshCw, ThumbsUp, ThumbsDown,
  Sparkles, Star, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveSpecialtySlug } from '@/lib/slug';
import {
  getSpecialties,
  getMySpecialtyRequests,
  getAllSpecialtyRequests,
  proposeSpecialty,
  reviewSpecialtyRequest,
} from '@/services/specialtiesService';
import {
  getMyCertifications,
  getAllCertifications,
  submitCertification,
  uploadCertDocument,
  resubmitCertification,
  reviewCertification,
} from '@/services/certificationsService';
import { isCurrentUserRadionicsAdmin } from '@/services/adminService';
import { canOpenInitialSubmitModal, canOpenResubmitModal } from '@/lib/certificationRules';
import type { Specialty, SpecialtyRequest, Certification, CertDocument, CertStatus, SpecialtyRequestStatus } from '@/types';

// ─── Status configs ───────────────────────────────────────────
const CERT_STATUS_CONFIG: Record<CertStatus, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = {
  approved: {
    label: 'Ativa',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-700/30',
  },
  pending: {
    label: 'Em análise',
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/30',
  },
  rejected: {
    label: 'Rejeitado',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-900/20',
    border: 'border-red-700/30',
  },
  expired: {
    label: 'Expirado',
    icon: RefreshCw,
    color: 'text-orange-400',
    bg: 'bg-orange-900/20',
    border: 'border-orange-700/30',
  },
  not_certified: {
    label: 'Sem certificação',
    icon: Lock,
    color: 'text-[var(--color-text-muted)]',
    bg: 'bg-[var(--color-surface-1)]',
    border: 'border-[var(--color-border)]',
  },
};

const SREQ_STATUS_CONFIG: Record<SpecialtyRequestStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  pending_review: {
    label: 'Em revisão',
    color: 'text-amber-400',
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/30',
  },
  approved: {
    label: 'Aprovada',
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-700/30',
  },
  rejected: {
    label: 'Rejeitada',
    color: 'text-red-400',
    bg: 'bg-red-900/20',
    border: 'border-red-700/30',
  },
};

const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXT_LABEL = 'PDF, JPG, PNG';

// ─── File size formatter ──────────────────────────────────────
function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Doc row ──────────────────────────────────────────────────
function DocRow({ doc, onRemove }: { doc: CertDocument; onRemove?: () => void }) {
  const isImg = doc.fileType === 'jpg' || doc.fileType === 'jpeg' || doc.fileType === 'png';
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] px-3 py-2">
      <FileText size={13} className={isImg ? 'text-sky-400' : 'text-amber-400'} />
      <span className="flex-1 min-w-0 text-xs text-[var(--color-text-secondary)] truncate">{doc.fileName}</span>
      {doc.fileSize && (
        <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">{fmtSize(doc.fileSize)}</span>
      )}
      <span className="text-[9px] font-mono uppercase text-[var(--color-text-muted)] shrink-0 px-1.5 py-0.5 rounded bg-[var(--color-surface-2)]">
        {doc.fileType}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors shrink-0"
          title="Remover documento"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Certification action by status (unique cert per specialty) ─
function CertificationStatusAction({
  status,
  onSubmitCert,
  variant = 'panel',
}: {
  status: CertStatus;
  onSubmitCert: () => void;
  variant?: 'panel' | 'row';
}) {
  const rowClass = 'text-[10px] transition-colors underline underline-offset-2';
  const panelBtn = 'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium';

  if (variant === 'row') {
    switch (status) {
      case 'not_certified':
        return (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onSubmitCert(); }}
            className={cn(rowClass, 'text-[var(--color-text-muted)] hover:text-[var(--color-gold)]')}
          >
            Solicitar certificação
          </button>
        );
      case 'pending':
        return <span className="text-[10px] text-amber-500 animate-pulse">Em análise</span>;
      case 'approved':
        return <span className="text-[10px] text-emerald-500">Ativa</span>;
      case 'rejected':
        return (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onSubmitCert(); }}
            className={cn(rowClass, 'text-amber-400 hover:text-amber-300')}
          >
            Corrigir e resubmeter
          </button>
        );
      case 'expired':
        return (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onSubmitCert(); }}
            className={cn(rowClass, 'text-orange-400 hover:text-orange-300')}
          >
            Corrigir e renovar
          </button>
        );
      default:
        return null;
    }
  }

  switch (status) {
    case 'not_certified':
      return (
        <button type="button" onClick={onSubmitCert} className={cn(panelBtn, 'bg-[var(--color-gold)] text-[var(--color-void)] font-semibold hover:opacity-90')}>
          <Award size={14} />
          Solicitar certificação
        </button>
      );
    case 'pending':
      return (
        <div className={cn(panelBtn, 'border border-amber-700/40 text-amber-400 bg-amber-900/10 cursor-default')}>
          <Clock size={13} />
          Em análise
        </div>
      );
    case 'approved':
      return (
        <div className={cn(panelBtn, 'border border-emerald-700/40 text-emerald-400 bg-emerald-900/10 cursor-default')}>
          <CheckCircle2 size={13} />
          Ativa
        </div>
      );
    case 'rejected':
      return (
        <button type="button" onClick={onSubmitCert} className={cn(panelBtn, 'border border-amber-700/40 bg-amber-900/10 text-amber-400 hover:bg-amber-900/20')}>
          <RefreshCw size={13} />
          Corrigir e resubmeter
        </button>
      );
    case 'expired':
      return (
        <button type="button" onClick={onSubmitCert} className={cn(panelBtn, 'border border-orange-700/40 bg-orange-900/10 text-orange-400 hover:bg-orange-900/20')}>
          <RefreshCw size={13} />
          Corrigir e renovar
        </button>
      );
    default:
      return null;
  }
}

// ─── Submit cert modal ────────────────────────────────────────
interface PendingFile {
  id: string;
  file: File;
}

function SubmitCertModal({
  specialty,
  certification,
  onClose,
  onSubmit,
}: {
  specialty: Specialty;
  certification?: Certification;
  onClose: () => void;
  onSubmit: (data: {
    specialtyId: string;
    certificationId?: string;
    years: number;
    files: File[];
    removeDocumentIds: string[];
    institution: string;
    trainingDate: string;
    notes: string;
  }) => void;
}) {
  const isResubmit = Boolean(certification);
  const [years, setYears] = useState(
    certification?.yearsOfExperience !== undefined ? String(certification.yearsOfExperience) : '',
  );
  const [institution, setInstitution] = useState(certification?.trainingInstitution ?? '');
  const [trainingDate, setTrainingDate] = useState(certification?.trainingCompletedDate ?? '');
  const [notes, setNotes] = useState(certification?.notes ?? '');
  const [removedDocIds, setRemovedDocIds] = useState<string[]>([]);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [fileError, setFileError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const keptExistingDocs = (certification?.documents ?? []).filter(d => !removedDocIds.includes(d.id));

  const acceptFile = useCallback((file: File) => {
    if (!ALLOWED_MIME.includes(file.type)) {
      setFileError('Formato inválido. Aceite apenas PDF, JPG ou PNG.');
      return;
    }
    setFileError('');
    setFiles(prev => [...prev, { id: `f-${Date.now()}-${Math.random()}`, file }]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    Array.from(e.dataTransfer.files).forEach(acceptFile);
  }, [acceptFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(acceptFile);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!years || isNaN(Number(years)) || Number(years) < 1) {
      errs.years = 'Insira anos de experiência válidos (mínimo 1)';
    }
    if (keptExistingDocs.length + files.length === 0) {
      errs.files = 'Mantenha ou adicione pelo menos um documento';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      specialtyId: specialty.id,
      certificationId: certification?.id,
      years: Number(years),
      files: files.map(f => f.file),
      removeDocumentIds: removedDocIds,
      institution,
      trainingDate,
      notes,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-900/30 border border-amber-700/40 flex items-center justify-center mx-auto mb-4">
            <Clock size={28} className="text-amber-400" />
          </div>
          <h3 className="font-cinzel text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            {isResubmit ? 'Pedido reenviado' : 'Pedido enviado'}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">
            {isResubmit ? (
              <>
                A certificação em{' '}
                <span className="text-[var(--color-text-primary)] font-medium">{specialty.name}</span>{' '}
                foi corrigida e reenviada para análise.
              </>
            ) : (
              <>
                O seu pedido de certificação em{' '}
                <span className="text-[var(--color-text-primary)] font-medium">{specialty.name}</span>{' '}
                foi submetido. Receberá uma notificação quando for aprovado.
              </>
            )}
          </p>
          <div className="rounded-xl border border-amber-700/30 bg-amber-900/10 p-4 mb-6 text-left space-y-1.5">
            <p className="text-xs font-medium text-amber-300">Próximos passos</p>
            <p className="text-xs text-[var(--color-text-muted)]">1. Análise do pedido pela equipa Radionics</p>
            <p className="text-xs text-[var(--color-text-muted)]">2. Validação dos documentos submetidos</p>
            <p className="text-xs text-[var(--color-text-muted)]">3. Aprovação e activação da especialidade</p>
          </div>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-semibold hover:opacity-90 transition-opacity">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h3 className="font-cinzel text-base font-semibold text-[var(--color-text-primary)]">
              {isResubmit ? 'Corrigir e resubmeter' : 'Submeter Certificação'}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{specialty.name}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] flex items-center justify-center transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Info banner */}
          {isResubmit && certification?.adminNotes && (
            <div className="rounded-xl border border-red-700/40 bg-red-900/15 p-3">
              <p className="text-[10px] font-medium text-red-300 uppercase tracking-wider mb-1">Motivo da rejeição</p>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{certification.adminNotes}</p>
            </div>
          )}

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-3 flex gap-2.5">
            <Info size={14} className="text-[var(--color-text-muted)] mt-0.5 shrink-0" />
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {isResubmit
                ? 'Corrija os dados abaixo, remova ou adicione documentos e reenvie para análise. É obrigatório manter pelo menos um documento.'
                : 'Submeta a sua documentação de certificação. Pode anexar múltiplos documentos (diploma, certificado de formação, etc.).'}
            </p>
          </div>

          {/* Years */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Anos de experiência <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={years}
              onChange={e => setYears(e.target.value)}
              placeholder="Ex: 3"
              className={cn(
                'w-full bg-[var(--color-surface-1)] border rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none transition-colors',
                errors.years ? 'border-red-600/60 focus:border-red-500' : 'border-[var(--color-border)] focus:border-[var(--color-gold)]',
              )}
            />
            {errors.years && <p className="text-[11px] text-red-400 mt-1">{errors.years}</p>}
          </div>

          {/* Institution + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Instituição de formação</label>
              <input
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                placeholder="Ex: Instituto Radiônico"
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Data de conclusão</label>
              <input
                type="date"
                value={trainingDate}
                onChange={e => setTrainingDate(e.target.value)}
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>
          </div>

          {/* Documents */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Documentos <span className="text-red-400">*</span>
            </label>

            {keptExistingDocs.length > 0 && (
              <div className="space-y-1.5 mb-2">
                <p className="text-[10px] text-[var(--color-text-muted)]">Documentos actuais</p>
                {keptExistingDocs.map(doc => (
                  <DocRow
                    key={doc.id}
                    doc={doc}
                    onRemove={() => setRemovedDocIds(prev => [...prev, doc.id])}
                  />
                ))}
              </div>
            )}

            {/* New files */}
            {files.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {files.map(({ id, file }) => (
                  <div key={id} className="flex items-center gap-2.5 rounded-lg border border-emerald-700/40 bg-emerald-900/10 px-3 py-2">
                    <FileText size={13} className="text-emerald-400 shrink-0" />
                    <span className="flex-1 min-w-0 text-xs text-emerald-300 truncate">{file.name}</span>
                    <button onClick={() => removeFile(id)} className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-4 cursor-pointer transition-all duration-150',
                dragOver
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5'
                  : errors.files
                  ? 'border-red-600/60 bg-red-900/10 hover:border-red-500/80'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-1)] hover:border-[var(--color-border-strong)]',
              )}
            >
              <Upload size={18} className={errors.files ? 'text-red-400' : 'text-[var(--color-text-muted)]'} />
              <p className="text-xs text-[var(--color-text-secondary)]">
                {files.length > 0 ? 'Adicionar mais documentos' : 'Carregue os seus documentos'}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{ALLOWED_EXT_LABEL} · clique ou arraste</p>
            </div>

            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="sr-only" onChange={handleFileChange} />
            {errors.files && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <AlertCircle size={11} className="text-red-400 shrink-0" />
                <p className="text-[11px] text-red-400">{errors.files}</p>
              </div>
            )}
            {fileError && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <AlertCircle size={11} className="text-red-400 shrink-0" />
                <p className="text-[11px] text-red-400">{fileError}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Notas adicionais <span className="text-[var(--color-text-muted)]">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Ex: Formação presencial de 40h concluída com distinção..."
              className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-5 py-4 border-t border-[var(--color-border)] shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Send size={13} />
            {isResubmit ? 'Reenviar para análise' : 'Submeter pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Propose specialty modal ──────────────────────────────────
function ProposeSpecialtyModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; category: string; notes: string }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nome obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ name: name.trim(), description, category, notes });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-900/30 border border-amber-700/40 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-amber-400" />
          </div>
          <h3 className="font-cinzel text-lg font-semibold text-[var(--color-text-primary)] mb-2">Proposta enviada</h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">
            A sua proposta de nova especialidade foi submetida para revisão. Será notificado quando for analisada.
          </p>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-semibold hover:opacity-90 transition-opacity">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div>
            <h3 className="font-cinzel text-base font-semibold text-[var(--color-text-primary)]">Propor Nova Especialidade</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Sugira uma especialidade para o catálogo Radionics</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] flex items-center justify-center">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Nome da especialidade <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Terapia Floral de Bach"
              className={cn(
                'w-full bg-[var(--color-surface-1)] border rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none transition-colors',
                errors.name ? 'border-red-600/60' : 'border-[var(--color-border)] focus:border-[var(--color-gold)]',
              )}
            />
            {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Categoria</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Ex: Terapias Florais"
              className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Descreva brevemente esta especialidade..."
              className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Informação adicional relevante..."
              className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2.5 px-5 py-4 border-t border-[var(--color-border)]">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-semibold hover:opacity-90 transition-opacity">
            <Star size={13} />
            Enviar proposta
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cert detail panel ────────────────────────────────────────
function CertDetailPanel({
  specialty,
  certification,
  onAddDoc,
  onClose,
  onSubmitCert,
}: {
  specialty: Specialty;
  certification: Certification | undefined;
  onAddDoc: () => void;
  onClose: () => void;
  onSubmitCert: () => void;
}) {
  const status = certification?.status ?? 'not_certified';
  const cfg = CERT_STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden sticky top-6">
      {/* Header strip */}
      <div className="relative px-4 py-4 border-b border-[var(--color-border)]" style={{ background: 'var(--color-surface-1)' }}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] flex items-center justify-center transition-colors"
        >
          <X size={14} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-gold)', border: '1px solid var(--color-border)' }}
          >
            {specialty.name.slice(0, 3)}
          </div>
          <div>
            <h3 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">{specialty.name}</h3>
            {specialty.category && (
              <p className="text-[10px] text-[var(--color-text-muted)]">{specialty.category}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status badge */}
        <div className={cn('flex items-center gap-2.5 rounded-xl border p-3', cfg.bg, cfg.border)}>
          <StatusIcon size={15} className={cfg.color} />
          <div className="flex-1 min-w-0">
            <p className={cn('text-xs font-semibold', cfg.color)}>{cfg.label}</p>
            {status === 'approved' && certification?.reviewedAt && (
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                Aprovado em {new Date(certification.reviewedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            )}
            {status === 'pending' && certification?.submittedAt && (
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                Submetido em {new Date(certification.submittedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            )}
            {status === 'expired' && certification?.expiresAt && (
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                Expirou em {new Date(certification.expiresAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            )}
            {status === 'rejected' && certification?.submittedAt && (
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                Última submissão: {new Date(certification.submittedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Cert meta */}
        {certification && certification.status !== 'not_certified' && (
          <div className="space-y-2">
            {certification.yearsOfExperience !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Experiência</span>
                <span className="text-[var(--color-text-primary)] font-medium">{certification.yearsOfExperience} anos</span>
              </div>
            )}
            {certification.trainingInstitution && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Instituição</span>
                <span className="text-[var(--color-text-secondary)] text-right ml-4 leading-tight text-[11px]">{certification.trainingInstitution}</span>
              </div>
            )}
            {certification.trainingCompletedDate && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Conclusão formação</span>
                <span className="text-[var(--color-text-secondary)] text-[11px]">
                  {new Date(certification.trainingCompletedDate).toLocaleDateString('pt-PT')}
                </span>
              </div>
            )}
            {certification.certificateNumber && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Nº Cert.</span>
                <span className="font-mono text-[var(--color-text-primary)] text-[11px]">{certification.certificateNumber}</span>
              </div>
            )}
            {certification.expiresAt && status === 'approved' && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Validade</span>
                <span className="text-emerald-400 text-[11px]">
                  {new Date(certification.expiresAt).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        {certification && certification.documents.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Documentos</p>
            <div className="space-y-1.5">
              {certification.documents.map(doc => (
                <DocRow key={doc.id} doc={doc} />
              ))}
            </div>
            {(status === 'approved' || status === 'pending') && (
              <button
                onClick={onAddDoc}
                className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
              >
                <Plus size={10} />
                Adicionar documento
              </button>
            )}
          </div>
        )}

        {/* Rejection reason */}
        {status === 'rejected' && certification?.adminNotes && (
          <div className="rounded-lg border border-red-700/40 bg-red-900/15 p-2.5">
            <p className="text-[10px] font-medium text-red-300 mb-1">Motivo da rejeição</p>
            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">{certification.adminNotes}</p>
          </div>
        )}

        {/* Notes */}
        {certification?.notes && (
          <div className="rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border)] p-2.5">
            <p className="text-[10px] font-medium text-[var(--color-text-muted)] mb-1">Notas</p>
            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">{certification.notes}</p>
          </div>
        )}

        {/* Actions — one certification row per specialty */}
        <CertificationStatusAction status={status} onSubmitCert={onSubmitCert} variant="panel" />
      </div>
    </div>
  );
}

// ─── Specialty row ────────────────────────────────────────────
function SpecialtyRow({
  specialty,
  certification,
  isSelected,
  onSelect,
  onSubmitCert,
}: {
  specialty: Specialty;
  certification: Certification | undefined;
  isSelected: boolean;
  onSelect: () => void;
  onSubmitCert: () => void;
}) {
  const status = certification?.status ?? 'not_certified';
  const cfg = CERT_STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group rounded-xl border bg-[var(--color-surface-0)] overflow-hidden cursor-pointer transition-all duration-200',
        isSelected
          ? 'border-[var(--color-gold)]/50 shadow-lg shadow-black/20'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-gold)', border: '1px solid var(--color-border)' }}
        >
          {specialty.name.slice(0, 3)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{specialty.name}</p>
              {specialty.category && (
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{specialty.category}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn('flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border', cfg.bg, cfg.border, cfg.color)}>
                <StatusIcon size={9} />
                {cfg.label}
              </span>
              <ChevronRight size={13} className={cn('transition-colors', isSelected ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-muted)]')} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-[var(--color-text-muted)]">{specialty.toolCount} ferramentas</span>
            {status === 'approved' && certification?.certificateNumber && (
              <span className="text-[10px] font-mono text-[var(--color-text-muted)]">#{certification.certificateNumber}</span>
            )}
            {status === 'approved' && certification?.reviewedAt && (
              <span className="text-[10px] text-emerald-500">
                Desde {new Date(certification.reviewedAt).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}
              </span>
            )}
            <CertificationStatusAction status={status} onSubmitCert={onSubmitCert} variant="row" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Specialty request row ────────────────────────────────────
function SpecialtyRequestRow({ req }: { req: SpecialtyRequest }) {
  const cfg = SREQ_STATUS_CONFIG[req.status];
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-0)] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Star size={11} className="text-[var(--color-gold)] shrink-0" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{req.proposedName}</p>
          </div>
          {req.description && (
            <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed line-clamp-2 mt-0.5">{req.description}</p>
          )}
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
            Proposta em {new Date(req.submittedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <span className={cn('flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border shrink-0', cfg.bg, cfg.border, cfg.color)}>
          <Clock size={9} />
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

// ─── Admin: cert review card ──────────────────────────────────
function AdminCertCard({
  certification,
  specialty,
  onApprove,
  onReject,
}: {
  certification: Certification;
  specialty: Specialty | undefined;
  onApprove: (id: string) => void;
  onReject: (id: string, notes: string) => void;
}) {
  const [rejectNotes, setRejectNotes] = useState('');
  const [showReject, setShowReject] = useState(false);

  return (
    <div className="rounded-xl border border-amber-700/30 bg-[var(--color-surface-0)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-amber-900/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{specialty?.name ?? 'Especialidade desconhecida'}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
              Submetido em {new Date(certification.submittedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border bg-amber-900/20 border-amber-700/30 text-amber-400">
            <Clock size={9} />
            Em análise
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Details */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <div>
            <span className="text-[var(--color-text-muted)]">Experiência</span>
            <p className="font-medium text-[var(--color-text-primary)]">{certification.yearsOfExperience} anos</p>
          </div>
          {certification.trainingInstitution && (
            <div>
              <span className="text-[var(--color-text-muted)]">Instituição</span>
              <p className="font-medium text-[var(--color-text-primary)] truncate">{certification.trainingInstitution}</p>
            </div>
          )}
          {certification.trainingCompletedDate && (
            <div>
              <span className="text-[var(--color-text-muted)]">Conclusão formação</span>
              <p className="font-medium text-[var(--color-text-primary)]">
                {new Date(certification.trainingCompletedDate).toLocaleDateString('pt-PT')}
              </p>
            </div>
          )}
        </div>

        {/* Documents */}
        {certification.documents.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Documentos</p>
            <div className="space-y-1.5">
              {certification.documents.map(doc => (
                <DocRow key={doc.id} doc={doc} />
              ))}
            </div>
          </div>
        )}

        {certification.notes && (
          <div className="rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border)] p-2.5">
            <p className="text-[10px] font-medium text-[var(--color-text-muted)] mb-1">Notas do terapeuta</p>
            <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">{certification.notes}</p>
          </div>
        )}

        {/* Reject form */}
        {showReject && (
          <div className="rounded-lg border border-red-700/30 bg-red-900/10 p-3 space-y-2">
            <label className="text-xs font-medium text-red-300">Motivo da rejeição</label>
            <textarea
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
              rows={2}
              placeholder="Explique o motivo da rejeição..."
              className="w-full bg-[var(--color-surface-2)] border border-red-700/30 rounded-lg px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-red-500 resize-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!showReject ? (
            <>
              <button
                onClick={() => setShowReject(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-700/40 bg-red-900/10 text-xs font-medium text-red-400 hover:bg-red-900/20 transition-colors"
              >
                <ThumbsDown size={12} />
                Rejeitar
              </button>
              <button
                onClick={() => onApprove(certification.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-emerald-700/40 bg-emerald-900/20 text-xs font-medium text-emerald-400 hover:bg-emerald-900/30 transition-colors"
              >
                <ThumbsUp size={12} />
                Aprovar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowReject(false)}
                className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => onReject(certification.id, rejectNotes)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-800/40 border border-red-700/40 text-xs font-semibold text-red-300 hover:bg-red-800/60 transition-colors"
              >
                <ThumbsDown size={12} />
                Confirmar rejeição
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Admin: specialty request card ───────────────────────────
function AdminSpecialtyReqCard({
  req,
  onApprove,
  onReject,
}: {
  req: SpecialtyRequest;
  onApprove: (id: string) => void;
  onReject: (id: string, notes: string) => void;
}) {
  const [rejectNotes, setRejectNotes] = useState('');
  const [showReject, setShowReject] = useState(false);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={13} className="text-[var(--color-gold)]" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{req.proposedName}</p>
          </div>
          <span className="text-[10px] text-amber-400 bg-amber-900/20 border border-amber-700/30 px-2 py-0.5 rounded-full">Nova especialidade</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          {req.category && (
            <div>
              <span className="text-[var(--color-text-muted)]">Categoria</span>
              <p className="font-medium text-[var(--color-text-primary)]">{req.category}</p>
            </div>
          )}
          <div>
            <span className="text-[var(--color-text-muted)]">Proposta por</span>
            <p className="font-medium text-[var(--color-text-primary)]">Ana Beatriz Santos</p>
          </div>
        </div>
        {req.description && (
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{req.description}</p>
        )}
        {req.notes && (
          <div className="rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border)] p-2.5">
            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">{req.notes}</p>
          </div>
        )}
        {showReject && (
          <div className="rounded-lg border border-red-700/30 bg-red-900/10 p-3 space-y-2">
            <label className="text-xs font-medium text-red-300">Motivo da rejeição</label>
            <textarea
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
              rows={2}
              placeholder="Explique o motivo..."
              className="w-full bg-[var(--color-surface-2)] border border-red-700/30 rounded-lg px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-red-500 resize-none"
            />
          </div>
        )}
        <div className="flex gap-2">
          {!showReject ? (
            <>
              <button onClick={() => setShowReject(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-700/40 bg-red-900/10 text-xs font-medium text-red-400 hover:bg-red-900/20 transition-colors">
                <ThumbsDown size={12} />Rejeitar
              </button>
              <button onClick={() => onApprove(req.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-emerald-700/40 bg-emerald-900/20 text-xs font-medium text-emerald-400 hover:bg-emerald-900/30 transition-colors">
                <ThumbsUp size={12} />Aprovar
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowReject(false)} className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors">
                Cancelar
              </button>
              <button onClick={() => onReject(req.id, rejectNotes)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-800/40 border border-red-700/40 text-xs font-semibold text-red-300 hover:bg-red-800/60 transition-colors">
                <ThumbsDown size={12} />Confirmar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function CertificationsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'mine' | 'admin'>('mine');
  const [selected, setSelected] = useState<Specialty | null>(null);
  const [certModal, setCertModal] = useState<{
    specialty: Specialty;
    certification?: Certification;
  } | null>(null);

  const openCertModal = (specialty: Specialty) => {
    const cert = myCerts.find(c => c.specialtyId === specialty.id);
    const status = cert?.status;

    if (canOpenResubmitModal(status)) {
      setCertModal({ specialty, certification: cert });
      return;
    }
    if (canOpenInitialSubmitModal(status)) {
      setCertModal({ specialty });
      return;
    }
    // pending / approved — no new submit modal
  };
  const [showProposeModal, setShowProposeModal] = useState(false);

  const { data: isAdmin = false, isLoading: loadingAdminRole } = useQuery({
    queryKey: ['radionics-admin'],
    queryFn: isCurrentUserRadionicsAdmin,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!loadingAdminRole && !isAdmin && activeTab === 'admin') {
      setActiveTab('mine');
    }
  }, [isAdmin, activeTab, loadingAdminRole]);

  // ── Queries ──
  const { data: specialties = [], isLoading: loadingSpecialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: getSpecialties,
  });

  const { data: myCerts = [], isLoading: loadingCerts } = useQuery({
    queryKey: ['my-certifications'],
    queryFn: getMyCertifications,
  });

  const { data: allCerts = [], isLoading: loadingAllCerts } = useQuery({
    queryKey: ['all-certifications'],
    queryFn: getAllCertifications,
    enabled: isAdmin && activeTab === 'admin',
  });

  const { data: mySReqs = [] } = useQuery({
    queryKey: ['my-specialty-requests'],
    queryFn: getMySpecialtyRequests,
  });

  const { data: allSReqs = [], isLoading: loadingAllSReqs } = useQuery({
    queryKey: ['all-specialty-requests'],
    queryFn: getAllSpecialtyRequests,
    enabled: isAdmin && activeTab === 'admin',
  });

  // ── Helpers ──
  const getCertification = (specialtyId: string) =>
    myCerts.find(c => c.specialtyId === specialtyId);

  const approved = specialties.filter(s => getCertification(s.id)?.status === 'approved');
  const pending = specialties.filter(s => getCertification(s.id)?.status === 'pending');
  const rejected = specialties.filter(s => getCertification(s.id)?.status === 'rejected');
  const expired = specialties.filter(s => getCertification(s.id)?.status === 'expired');
  const notCertified = specialties.filter(s => {
    const c = getCertification(s.id);
    return !c || c.status === 'not_certified';
  });
  const specialtyRequests = mySReqs.filter(r => r.status === 'pending_review');
  const pendingAdminCerts = allCerts.filter(c => c.status === 'pending');
  const pendingAdminSReqs = allSReqs.filter(r => r.status === 'pending_review');
  const adminQueueCount = pendingAdminCerts.length + pendingAdminSReqs.length;

  // ── Mutations ──
  const submitCertMutation = useMutation({
    mutationFn: async (data: {
      specialtyId: string;
      certificationId?: string;
      years: number;
      files: File[];
      removeDocumentIds: string[];
      institution: string;
      trainingDate: string;
      notes: string;
    }) => {
      const payload = {
        yearsOfExperience: data.years,
        trainingInstitution: data.institution || undefined,
        trainingCompletedDate: data.trainingDate || undefined,
        notes: data.notes || undefined,
      };

      if (data.certificationId) {
        return resubmitCertification(data.certificationId, payload, {
          removeDocumentIds: data.removeDocumentIds,
          newFiles: data.files,
        });
      }

      const cert = await submitCertification({
        specialtyId: data.specialtyId,
        ...payload,
      });
      await Promise.all(data.files.map(f => uploadCertDocument(cert.id, f)));
      return cert;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['specialties'] });
      qc.invalidateQueries({ queryKey: ['my-certifications'] });
      qc.invalidateQueries({ queryKey: ['all-certifications'] });
    },
  });

  const proposeMutation = useMutation({
    mutationFn: (data: { name: string; description: string; category: string; notes: string }) =>
      proposeSpecialty({
        proposedName: data.name,
        proposedSlug: resolveSpecialtySlug(data.name),
        description: data.description || undefined,
        category: data.category || undefined,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-specialty-requests'] });
      qc.invalidateQueries({ queryKey: ['all-specialty-requests'] });
    },
  });

  const approveCertMutation = useMutation({
    mutationFn: (certId: string) => reviewCertification(certId, 'approved'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['specialties'] });
      qc.invalidateQueries({ queryKey: ['my-certifications'] });
      qc.invalidateQueries({ queryKey: ['all-certifications'] });
    },
  });

  const rejectCertMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      reviewCertification(id, 'rejected', notes || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['specialties'] });
      qc.invalidateQueries({ queryKey: ['my-certifications'] });
      qc.invalidateQueries({ queryKey: ['all-certifications'] });
    },
  });

  const approveSReqMutation = useMutation({
    mutationFn: (reqId: string) => reviewSpecialtyRequest(reqId, 'approved'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-specialty-requests'] });
      qc.invalidateQueries({ queryKey: ['my-specialty-requests'] });
      qc.invalidateQueries({ queryKey: ['specialties'] });
    },
  });

  const rejectSReqMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      reviewSpecialtyRequest(id, 'rejected', notes || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-specialty-requests'] });
      qc.invalidateQueries({ queryKey: ['my-specialty-requests'] });
    },
  });

  // ── Handlers ──
  const handleSubmitCert = (data: {
    specialtyId: string;
    certificationId?: string;
    years: number;
    files: File[];
    removeDocumentIds: string[];
    institution: string;
    trainingDate: string;
    notes: string;
  }) => {
    submitCertMutation.mutate(data);
  };

  const handlePropose = (data: { name: string; description: string; category: string; notes: string }) => {
    proposeMutation.mutate(data);
  };

  const handleAdminApproveCert = (certId: string) => {
    approveCertMutation.mutate(certId);
  };

  const handleAdminRejectCert = (certId: string, notes: string) => {
    rejectCertMutation.mutate({ id: certId, notes });
  };

  const handleAdminApproveSReq = (reqId: string) => {
    approveSReqMutation.mutate(reqId);
  };

  const handleAdminRejectSReq = (reqId: string, notes: string) => {
    rejectSReqMutation.mutate({ id: reqId, notes });
  };

  const isLoading = loadingSpecialties || loadingCerts;

  if (isLoading) {
    return (
      <div className="min-h-full bg-[var(--color-void)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">A carregar especialidades...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-void)]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-surface-0)]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-cinzel text-xl font-semibold text-[var(--color-text-primary)]">
              Especialidades e Certificações
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              Gerencie as suas especialidades e certificações activas
            </p>
          </div>
          {/* Summary chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border bg-emerald-900/20 border-emerald-700/30 text-emerald-400">
              <CheckCircle2 size={11} />
              {approved.length} activas
            </span>
            {pending.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border bg-amber-900/20 border-amber-700/30 text-amber-400">
                <Clock size={11} />
                {pending.length} em análise
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4">
          <button
            onClick={() => setActiveTab('mine')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'mine'
                ? 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            As minhas especialidades
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === 'admin'
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
              )}
            >
              Admin
              {adminQueueCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center">
                  {adminQueueCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Tab: Mine ── */}
      {activeTab === 'mine' && (
        <div className="p-6 flex gap-6">
          {/* Left list */}
          <div className="flex-1 space-y-8 min-w-0">

            {/* Certified */}
            {approved.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Activas</h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-700/30">{approved.length}</span>
                </div>
                <div className="space-y-2">
                  {approved.map(s => (
                    <SpecialtyRow
                      key={s.id}
                      specialty={s}
                      certification={getCertification(s.id)}
                      isSelected={selected?.id === s.id}
                      onSelect={() => setSelected(prev => prev?.id === s.id ? null : s)}
                      onSubmitCert={() => openCertModal(s)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Pending */}
            {pending.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={13} className="text-amber-400" />
                  <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Em análise</h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-900/30 text-amber-400 border border-amber-700/30 animate-pulse">{pending.length}</span>
                </div>
                <div className="space-y-2">
                  {pending.map(s => (
                    <SpecialtyRow
                      key={s.id}
                      specialty={s}
                      certification={getCertification(s.id)}
                      isSelected={selected?.id === s.id}
                      onSelect={() => setSelected(prev => prev?.id === s.id ? null : s)}
                      onSubmitCert={() => openCertModal(s)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Rejected */}
            {rejected.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle size={13} className="text-red-400" />
                  <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Rejeitadas</h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-700/30">{rejected.length}</span>
                </div>
                <div className="space-y-2">
                  {rejected.map(s => (
                    <SpecialtyRow key={s.id} specialty={s} certification={getCertification(s.id)}
                      isSelected={selected?.id === s.id}
                      onSelect={() => setSelected(prev => prev?.id === s.id ? null : s)}
                      onSubmitCert={() => openCertModal(s)} />
                  ))}
                </div>
              </section>
            )}

            {/* Expired */}
            {expired.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCw size={13} className="text-orange-400" />
                  <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Expiradas</h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-900/30 text-orange-400 border border-orange-700/30">{expired.length}</span>
                </div>
                <div className="space-y-2">
                  {expired.map(s => (
                    <SpecialtyRow key={s.id} specialty={s} certification={getCertification(s.id)}
                      isSelected={selected?.id === s.id}
                      onSelect={() => setSelected(prev => prev?.id === s.id ? null : s)}
                      onSubmitCert={() => openCertModal(s)} />
                  ))}
                </div>
              </section>
            )}

            {/* Not certified */}
            {notCertified.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={13} className="text-[var(--color-text-muted)]" />
                  <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Sem certificação</h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]">{notCertified.length}</span>
                </div>
                <div className="space-y-2">
                  {notCertified.map(s => (
                    <SpecialtyRow key={s.id} specialty={s} certification={getCertification(s.id)}
                      isSelected={selected?.id === s.id}
                      onSelect={() => setSelected(prev => prev?.id === s.id ? null : s)}
                      onSubmitCert={() => openCertModal(s)} />
                  ))}
                </div>
              </section>
            )}

            {/* Specialty requests */}
            {specialtyRequests.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Star size={13} className="text-[var(--color-gold)]" />
                  <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Propostas pendentes</h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-900/20 text-amber-400 border border-amber-700/30">{specialtyRequests.length}</span>
                </div>
                <div className="space-y-2">
                  {specialtyRequests.map(r => (
                    <SpecialtyRequestRow key={r.id} req={r} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {approved.length === 0 && pending.length === 0 && rejected.length === 0 && expired.length === 0 && notCertified.length === 0 && (
              <div className="py-16 text-center">
                <Award size={40} className="text-[var(--color-text-muted)] opacity-40 mx-auto mb-4" />
                <p className="text-sm text-[var(--color-text-muted)]">Nenhuma especialidade no catálogo</p>
              </div>
            )}

            {/* Propose button */}
            <div className="pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowProposeModal(true)}
                className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
              >
                <Plus size={13} />
                Propor nova especialidade
              </button>
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-72 flex-shrink-0">
              <CertDetailPanel
                specialty={selected}
                certification={getCertification(selected.id)}
                onAddDoc={() => openCertModal(selected)}
                onClose={() => setSelected(null)}
                onSubmitCert={() => openCertModal(selected)}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Admin ── */}
      {isAdmin && activeTab === 'admin' && (
        <div className="p-6 space-y-8">
          {/* Info */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4 flex items-start gap-3">
            <ShieldCheck size={16} className="text-[var(--color-gold)] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-[var(--color-text-primary)] mb-0.5">Painel de revisão</p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Reveja e aprove pedidos de certificação e propostas de novas especialidades enviadas pelos terapeutas.
              </p>
            </div>
          </div>

          {/* Loading admin data */}
          {(loadingAllCerts || loadingAllSReqs) && (
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
              <Loader2 size={14} className="animate-spin" />
              A carregar dados...
            </div>
          )}

          {/* Pending certs */}
          {pendingAdminCerts.length > 0 ? (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Award size={14} className="text-amber-400" />
                <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Pedidos de certificação</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-900/20 text-amber-400 border border-amber-700/30">{pendingAdminCerts.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAdminCerts.map(cert => (
                  <AdminCertCard
                    key={cert.id}
                    certification={cert}
                    specialty={specialties.find(s => s.id === cert.specialtyId)}
                    onApprove={handleAdminApproveCert}
                    onReject={handleAdminRejectCert}
                  />
                ))}
              </div>
            </section>
          ) : !loadingAllCerts && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-6 text-center">
              <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm text-[var(--color-text-muted)]">Nenhum pedido de certificação pendente</p>
            </div>
          )}

          {/* Pending specialty requests */}
          {pendingAdminSReqs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Star size={14} className="text-[var(--color-gold)]" />
                <h2 className="font-cinzel text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Propostas de especialidade</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-900/20 text-amber-400 border border-amber-700/30">{pendingAdminSReqs.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAdminSReqs.map(req => (
                  <AdminSpecialtyReqCard
                    key={req.id}
                    req={req}
                    onApprove={handleAdminApproveSReq}
                    onReject={handleAdminRejectSReq}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Submit cert modal */}
      {certModal && (
        <SubmitCertModal
          specialty={certModal.specialty}
          certification={certModal.certification}
          onClose={() => setCertModal(null)}
          onSubmit={data => handleSubmitCert(data)}
        />
      )}

      {/* Propose specialty modal */}
      {showProposeModal && (
        <ProposeSpecialtyModal
          onClose={() => setShowProposeModal(false)}
          onSubmit={handlePropose}
        />
      )}
    </div>
  );
}
