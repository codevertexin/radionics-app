import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { isCurrentUserRadionicsAdmin } from '@/services/adminService';
import { isMockMode } from '@/lib/dataMode';

/**
 * Dev-only / admin methodology debug routes.
 * Not linked from main navigation.
 */
export function MethodologyDebugGate({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(isMockMode() ? true : null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      setAllowed(true);
      return;
    }
    if (isMockMode()) {
      setAllowed(true);
      return;
    }
    let cancelled = false;
    isCurrentUserRadionicsAdmin()
      .then(isAdmin => {
        if (!cancelled) setAllowed(isAdmin);
      })
      .catch(() => {
        if (!cancelled) setAllowed(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
