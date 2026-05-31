import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { isSupabaseMode } from '@/lib/dataMode';

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-void)]">
      <div className="flex flex-col items-center gap-3 text-[var(--color-text-muted)]">
        <Loader2 size={28} className="animate-spin text-[var(--color-gold)]" />
        <p className="text-sm">A verificar sessão…</p>
      </div>
    </div>
  );
}

export function RequireSupabaseAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (!isSupabaseMode()) return <>{children}</>;

  if (loading) return <AuthLoadingScreen />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  return <>{children}</>;
}
