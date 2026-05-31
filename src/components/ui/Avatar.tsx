import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
};

const COLORS = [
  'from-violet-600 to-violet-800',
  'from-teal-600 to-teal-800',
  'from-amber-600 to-amber-800',
  'from-rose-600 to-rose-800',
  'from-sky-600 to-sky-800',
  'from-emerald-600 to-emerald-800',
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({ name, imageUrl, size = 'md', className }: AvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn('rounded-full object-cover', SIZES[size], className)}
      />
    );
  }

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold text-white shrink-0',
      `bg-gradient-to-br ${getColor(name)}`,
      SIZES[size],
      className,
    )}>
      {getInitials(name)}
    </div>
  );
}
