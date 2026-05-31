import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'teal' | 'amber' | 'rose' | 'emerald' | 'violet' | 'sky' | 'muted';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const VARIANTS = {
  default: 'bg-zinc-800 text-zinc-300',
  gold: 'bg-amber-900/40 text-amber-300 border border-amber-800/50',
  teal: 'bg-teal-900/40 text-teal-300 border border-teal-800/50',
  amber: 'bg-orange-900/40 text-orange-300 border border-orange-800/50',
  rose: 'bg-rose-900/40 text-rose-300 border border-rose-800/50',
  emerald: 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50',
  violet: 'bg-violet-900/40 text-violet-300 border border-violet-800/50',
  sky: 'bg-sky-900/40 text-sky-300 border border-sky-800/50',
  muted: 'bg-zinc-900 text-zinc-500',
};

const DOT_COLORS = {
  default: 'bg-zinc-400',
  gold: 'bg-amber-400',
  teal: 'bg-teal-400',
  amber: 'bg-orange-400',
  rose: 'bg-rose-400',
  emerald: 'bg-emerald-400',
  violet: 'bg-violet-400',
  sky: 'bg-sky-400',
  muted: 'bg-zinc-600',
};

export function Badge({ children, variant = 'default', size = 'sm', className, dot }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      VARIANTS[variant],
      className,
    )}>
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', DOT_COLORS[variant])} />
      )}
      {children}
    </span>
  );
}
