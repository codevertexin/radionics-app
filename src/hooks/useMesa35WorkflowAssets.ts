import { useEffect, useState } from 'react';
import {
  loadMesa35WorkspaceBundle,
  type Mesa35WorkspaceBundle,
} from '@/lib/workflow-adapter/mesa35WorkspaceAssets';

export interface UseMesa35WorkflowAssetsResult {
  bundle: Mesa35WorkspaceBundle | null;
  isLoading: boolean;
  error: string | null;
}

/** Carrega assets Mesa 35 do Methodology Engine — apenas para sessões workflow. */
export function useMesa35WorkflowAssets(enabled: boolean): UseMesa35WorkflowAssetsResult {
  const [bundle, setBundle] = useState<Mesa35WorkspaceBundle | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loaded = await loadMesa35WorkspaceBundle();
        if (!cancelled) {
          setBundle(loaded);
        }
      } catch (err) {
        if (!cancelled) {
          setBundle(null);
          setError(err instanceof Error ? err.message : 'mesa35_assets_load_failed');
          console.warn('[mesa35-workflow] Falha ao carregar assets do Methodology Engine:', err);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { bundle, isLoading, error };
}
