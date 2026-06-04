import { Link } from 'react-router-dom';
import { Award, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CertificationRequiredProps {
  specialtyName?: string;
}

export function CertificationRequired({ specialtyName }: CertificationRequiredProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-8 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <Lock size={20} className="text-amber-400" />
        </div>
        <h2 className="font-cinzel text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          Certificação necessária
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
          {specialtyName
            ? `Precisa de certificação aprovada em ${specialtyName} para consultar estes recursos.`
            : 'Precisa de certificação aprovada numa especialidade para aceder à biblioteca de recursos.'}
        </p>
        <Link to="/certifications">
          <Button variant="primary" className="inline-flex items-center gap-2">
            <Award size={16} />
            Ver certificações
          </Button>
        </Link>
      </div>
    </div>
  );
}
