import {
  DEFAULT_THERAPEUTIC_PRINT_SIZE_CM,
  type TherapeuticPrintSizeCm,
} from '@/lib/pdf/graphPrintConstants';
import { cn } from '@/lib/utils';

interface TherapeuticPrintSizeSelectorProps {
  availableSizes: TherapeuticPrintSizeCm[];
  value: TherapeuticPrintSizeCm;
  onChange: (size: TherapeuticPrintSizeCm) => void;
  compact?: boolean;
  className?: string;
  disabled?: boolean;
}

export function TherapeuticPrintSizeSelector({
  availableSizes,
  value,
  onChange,
  compact = false,
  className,
  disabled = false,
}: TherapeuticPrintSizeSelectorProps) {
  const sizes =
    availableSizes.length > 0 ? availableSizes : [DEFAULT_THERAPEUTIC_PRINT_SIZE_CM];

  return (
    <fieldset
      className={cn(compact ? 'space-y-1' : 'space-y-2', disabled && 'opacity-50', className)}
      aria-label="Tamanho de impressão"
      disabled={disabled}
    >
      <legend
        className={cn(
          'text-[var(--color-text-muted)] uppercase tracking-wide',
          compact ? 'text-[9px] mb-0.5' : 'text-[10px] mb-1',
        )}
      >
        Tamanho de impressão
      </legend>
      <div
        className={cn(
          'flex flex-col gap-1',
          compact && 'flex-row flex-wrap gap-x-3 gap-y-1',
        )}
        role="radiogroup"
      >
        {sizes.map(size => (
          <label
            key={size}
            className={cn(
              'inline-flex items-center gap-2',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              compact ? 'text-[10px] text-[var(--color-text-secondary)]' : 'text-xs',
            )}
          >
            <input
              type="radio"
              name="therapeutic-print-size"
              value={size}
              checked={value === size}
              onChange={() => onChange(size)}
              disabled={disabled}
              className="accent-[var(--color-gold)]"
            />
            <span>
              {size} × {size} cm
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
