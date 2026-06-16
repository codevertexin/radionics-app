import { useCallback, useEffect, useState } from 'react';
import {
  loadAdapterContext,
  resolveActiveStep,
} from '@/lib/workflow-adapter/workflowAdapter';
import type {
  AdapterContext,
  AdapterNavItem,
  AdapterStepView,
  SessionExecutionMode,
  SessionLike,
} from '@/lib/workflow-adapter/types';

export interface UseWorkflowAdapterOptions {
  session: SessionLike;
  specialtySlug: string;
  currentNavId?: string;
  forceLegacy?: boolean;
  preferWorkflow?: boolean;
  workflowTemplateId?: string;
  enabled?: boolean;
}

export interface UseWorkflowAdapterResult {
  executionMode: SessionExecutionMode;
  adapterContext: AdapterContext | null;
  navigationItems: AdapterNavItem[];
  activeStep: AdapterStepView | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Read-only hook — loads workflow adapter context without mutating session or workspace.
 * Not wired into WorkspacePage in V3.0D.2.
 */
export function useWorkflowAdapter(
  options: UseWorkflowAdapterOptions,
): UseWorkflowAdapterResult {
  const {
    session,
    specialtySlug,
    currentNavId,
    forceLegacy,
    preferWorkflow,
    workflowTemplateId,
    enabled = true,
  } = options;

  const [executionMode, setExecutionMode] = useState<SessionExecutionMode>('legacy');
  const [adapterContext, setAdapterContext] = useState<AdapterContext | null>(null);
  const [navigationItems, setNavigationItems] = useState<AdapterNavItem[]>([]);
  const [activeStep, setActiveStep] = useState<AdapterStepView | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken(t => t + 1);
  }, []);

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
        const result = await loadAdapterContext({
          specialtySlug,
          session,
          forceLegacy,
          preferWorkflow,
          workflowTemplateId,
        });

        if (cancelled) return;

        setExecutionMode(result.executionMode);
        setAdapterContext(result.adapterContext);
        setNavigationItems(result.navigationItems);
        setError(result.error ?? null);

        if (result.adapterContext) {
          const navId =
            currentNavId
            ?? session.currentStageCode
            ?? result.navigationItems[0]?.navId
            ?? 'preparation';
          setActiveStep(resolveActiveStep(result.adapterContext, navId));
        } else {
          setActiveStep(null);
        }
      } catch (err) {
        if (cancelled) return;
        setExecutionMode('legacy');
        setAdapterContext(null);
        setNavigationItems([]);
        setActiveStep(null);
        setError(err instanceof Error ? err.message : 'adapter_load_failed');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    specialtySlug,
    session.id,
    session.workflowTemplateId,
    session.executionMode,
    currentNavId,
    forceLegacy,
    preferWorkflow,
    workflowTemplateId,
    reloadToken,
  ]);

  return {
    executionMode,
    adapterContext,
    navigationItems,
    activeStep,
    isLoading,
    error,
    reload,
  };
}
