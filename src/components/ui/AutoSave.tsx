import { useState, useEffect } from 'react';
import { Check, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_SAVE_LABELS } from '@/lib/dataMode';

interface AutoSaveProps {
  lastSaved?: Date;
  isSaving?: boolean;
  className?: string;
}

export function AutoSave({ lastSaved, isSaving, className }: AutoSaveProps) {
  const [text, setText] = useState<string>(MOCK_SAVE_LABELS.saved);

  useEffect(() => {
    if (isSaving) {
      setText(MOCK_SAVE_LABELS.saving);
    } else if (lastSaved) {
      const diff = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      if (diff < 5) setText(MOCK_SAVE_LABELS.savedNow);
      else setText(MOCK_SAVE_LABELS.savedAgo(diff));
    }
  }, [lastSaved, isSaving]);

  return (
    <div className={cn(
      'flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]',
      className,
    )}>
      {isSaving ? (
        <Cloud size={12} className="animate-pulse text-[var(--color-gold-dim)]" />
      ) : (
        <Check size={12} className="text-emerald-600" />
      )}
      <span>{text}</span>
    </div>
  );
}
