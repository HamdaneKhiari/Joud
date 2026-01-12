/**
 * useSafeAction - Hook pour sécuriser les actions (debounce, prévention double-clic)
 * Version TypeScript
 */

import { useCallback, useRef, useState } from 'react';

// ============================================
// TYPES
// ============================================

interface UseSafeActionOptions {
  debounceMs?: number;
  allowConcurrent?: boolean;
  onStart?: (...args: any[]) => void;
  onEnd?: (result?: any, ...args: any[]) => void;
  onError?: (error: Error, ...args: any[]) => void;
}

interface UseSafeActionReturn {
  execute: (dynamicAction?: (...args: any[]) => any | Promise<any>, ...args: any[]) => Promise<any>;
  loading: boolean;
  disabled: boolean;
  lastExecuted: number;
  cleanup: () => void;
}

// ============================================
// HOOK
// ============================================

export default function useSafeAction(
  initialAction?: (...args: any[]) => any | Promise<any>,
  options: UseSafeActionOptions = {}
): UseSafeActionReturn {
  const {
    debounceMs = 300,
    allowConcurrent = false,
    onStart,
    onEnd,
    onError
  } = options;

  const [loading, setLoading] = useState(false);
  const lastExecutedRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const execute = useCallback(
    async (dynamicAction?: (...args: any[]) => any | Promise<any>, ...args: any[]) => {
      const now = Date.now();

      // Vérifier si on est déjà en cours d'exécution
      if (loading && !allowConcurrent) {
        return;
      }

      // Vérifier le debounce
      const timeSinceLastExecution = now - lastExecutedRef.current;
      if (timeSinceLastExecution < debounceMs) {
        return;
      }

      // Logique de priorité : Action dynamique > Action initiale
      const actionToRun = typeof dynamicAction === 'function' ? dynamicAction : initialAction;

      // Erreur si aucune fonction n'est fournie
      if (typeof actionToRun !== 'function') {
        console.error('Erreur useSafeAction : Aucune fonction action fournie.');
        return;
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      try {
        setLoading(true);
        lastExecutedRef.current = now;

        if (onStart) onStart(...args);

        // Exécuter l'action (dynamique ou initiale)
        const result = await actionToRun(...args);

        if (onEnd) onEnd(result, ...args);
        return result;
      } catch (error) {
        console.error('Erreur dans useSafeAction:', error);
        if (onError) onError(error as Error, ...args);
        throw error;
      } finally {
        timeoutRef.current = setTimeout(() => {
          setLoading(false);
        }, Math.min(debounceMs, 100));
      }
    },
    [initialAction, loading, allowConcurrent, debounceMs, onStart, onEnd, onError]
  );

  const cleanup = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return {
    execute,
    loading,
    disabled: loading,
    lastExecuted: lastExecutedRef.current,
    cleanup
  };
}
