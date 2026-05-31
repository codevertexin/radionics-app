import { useState } from 'react';
import { Mic, MicOff, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_TRANSCRIPTIONS = [
  'Identificada influência energética externa associada a ambiente competitivo e desgastante.',
  'Conexão estabelecida rapidamente. Resposta energética estável e receptiva.',
  'Cliente apresenta melhoria significativa da resposta energética.',
  'Padrão emocional identificado relacionado com questões de valorização pessoal.',
  'Necessidade de reverberação prolongada. Campo vibracional requer estabilização.',
];

interface VoiceNoteProps {
  onTranscription?: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function VoiceNote({ onTranscription, className, size = 'md' }: VoiceNoteProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'done'>('idle');
  const [transcript, setTranscript] = useState('');

  const handleClick = () => {
    if (state === 'idle') {
      setState('recording');
      setTimeout(() => {
        const text = MOCK_TRANSCRIPTIONS[Math.floor(Math.random() * MOCK_TRANSCRIPTIONS.length)];
        setTranscript(text);
        setState('done');
        onTranscription?.(text);
      }, 2500);
    } else if (state === 'done') {
      setState('idle');
      setTranscript('');
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={handleClick}
        className={cn(
          'voice-btn relative shrink-0',
          state === 'recording' && 'recording',
          size === 'sm' && 'w-7 h-7',
        )}
        title={state === 'idle' ? 'Iniciar ditado' : state === 'recording' ? 'A gravar...' : 'Gravação concluída'}
      >
        {state === 'done' ? (
          <Check size={size === 'sm' ? 12 : 14} />
        ) : state === 'recording' ? (
          <MicOff size={size === 'sm' ? 12 : 14} />
        ) : (
          <Mic size={size === 'sm' ? 12 : 14} />
        )}
      </button>
      {state === 'recording' && (
        <span className="text-xs text-rose-400 animate-pulse">A gravar...</span>
      )}
      {transcript && state === 'done' && (
        <span className="text-xs text-[var(--color-text-tertiary)] italic truncate max-w-48">
          "{transcript.substring(0, 40)}..."
        </span>
      )}
    </div>
  );
}
