import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Lock, Mail, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { isSupabaseMode } from '@/lib/dataMode';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type LoginLocationState = {
  from?: string;
};

export default function LoginPage() {
  const { isAuthenticated, loading: authLoading, signInWithEmailPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LoginLocationState | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isSupabaseMode()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-void)]">
        <Loader2 size={28} className="animate-spin text-[var(--color-gold)]" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmailPassword(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar sessão';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-void)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center mx-auto mb-4">
            <Zap size={22} className="text-amber-100" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold text-gold-gradient">RADIONICS</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            Login dev — testar Supabase RLS
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] p-6 space-y-4"
        >
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-800/40 bg-red-900/20 px-3 py-2.5 text-sm text-red-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            leftIcon={<Mail size={14} />}
            placeholder="terapeuta@exemplo.com"
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            leftIcon={<Lock size={14} />}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            variant="gold"
            size="lg"
            loading={submitting}
            className="w-full"
          >
            Iniciar sessão
          </Button>

          <p className="text-[11px] text-[var(--color-text-tertiary)] text-center leading-relaxed">
            Auth temporário para desenvolvimento. Utilizadores devem ser criados no Supabase Dashboard.
            A integração final será via HUB/Auth Core.
          </p>
        </form>
      </div>
    </div>
  );
}
