import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, hint, leftIcon, rightIcon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
            {leftIcon}
          </span>
        )}
        <input
          className={cn(
            'input-surface w-full px-3 py-2 text-sm',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-rose-600 focus:border-rose-500',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--color-text-tertiary)]">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</label>}
      <textarea
        className={cn(
          'input-surface w-full px-3 py-2 text-sm resize-none',
          error && 'border-rose-600',
          className,
        )}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--color-text-tertiary)]">{hint}</p>}
    </div>
  );
}
