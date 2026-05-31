import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  side?: 'right' | 'left';
  width?: string;
}

export function Drawer({ isOpen, onClose, title, subtitle, children, side = 'right', width = 'w-96' }: DrawerProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      )}
      <div className={cn(
        'fixed top-0 bottom-0 z-50 flex flex-col bg-[var(--color-surface-1)] border-[var(--color-border)]',
        'transition-transform duration-300 ease-in-out',
        width,
        side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
        isOpen
          ? 'translate-x-0'
          : side === 'right' ? 'translate-x-full' : '-translate-x-full',
      )}>
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
            <div>
              {title && <h3 className="font-cinzel text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>}
              {subtitle && <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors shrink-0 ml-3"
            >
              <X size={15} />
            </button>
          </div>
        )}
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </>
  );
}
