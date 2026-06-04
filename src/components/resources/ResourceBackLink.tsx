import { useNavigate } from 'react-router-dom';

interface ResourceBackLinkProps {
  /** Fallback when there is no browser history (e.g. opened in new tab). */
  fallbackTo: string;
  className?: string;
}

export function ResourceBackLink({ fallbackTo, className }: ResourceBackLinkProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate(fallbackTo);
        }
      }}
      className={
        className
        ?? 'text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors'
      }
    >
      ← Voltar
    </button>
  );
}
