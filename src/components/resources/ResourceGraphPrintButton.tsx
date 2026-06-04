import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourceGraphPrintButtonProps {
  specialtySlug: string;
  assetSlug: string;
  className?: string;
  variant?: 'inline' | 'button';
}

export function ResourceGraphPrintButton({
  specialtySlug,
  assetSlug,
  className,
  variant = 'button',
}: ResourceGraphPrintButtonProps) {
  const to = `/resources/${specialtySlug}/assets/${assetSlug}/print`;

  if (variant === 'inline') {
    return (
      <Link
        to={to}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px] text-[var(--color-gold)] hover:underline',
          className,
        )}
      >
        <Printer size={12} />
        Imprimir
      </Link>
    );
  }

  return (
    <Link
      to={to}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-border)]',
        'text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]',
        'hover:border-[var(--color-gold)]/40 transition-colors',
        className,
      )}
    >
      <Printer size={14} />
      Imprimir
    </Link>
  );
}
