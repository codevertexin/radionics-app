import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';
import { clearUserState } from '@/lib/auth/clearUserState';
import { isSupabaseMode } from '@/lib/dataMode';
import { supabase } from '@/lib/supabaseClient';

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabaseMode = isSupabaseMode();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseMode);

  useEffect(() => {
    if (!supabaseMode || !supabase) {
      setSession(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        clearUserState();
        setLoading(false);
        return;
      }

      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseMode]);

  const signInWithEmailPassword = useCallback(async (email: string, password: string) => {
    if (!supabaseMode || !supabase) {
      throw new Error('Login disponível apenas com VITE_DATA_MODE=supabase');
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, [supabaseMode]);

  const signOut = useCallback(async () => {
    if (!supabaseMode || !supabase) return;

    setSession(null);
    setLoading(false);
    clearUserState();

    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;

    navigate('/auth/login', { replace: true });
  }, [supabaseMode, navigate]);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;

    return {
      user,
      session,
      loading: supabaseMode ? loading : false,
      isAuthenticated: supabaseMode ? !!session : true,
      signInWithEmailPassword,
      signOut,
    };
  }, [session, loading, supabaseMode, signInWithEmailPassword, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
