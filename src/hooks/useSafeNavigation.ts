/**
 * useSafeNavigation - Hook spécialisé pour les actions de navigation
 * Version TypeScript
 */

import { useCallback } from 'react';
import useSafeAction from './useSafeAction';

// ============================================
// TYPES
// ============================================

interface UseSafeNavigationOptions {
  debounceMs?: number;
  preventRapidClicks?: boolean;
}

interface UseSafeNavigationReturn {
  navigate: (...args: any[]) => Promise<any>;
  loading: boolean;
  disabled: boolean;
  canNavigate: boolean;
  lastExecuted: number;
  cleanup: () => void;
}

// ============================================
// HOOK
// ============================================

export default function useSafeNavigation(
  navigationAction: (...args: any[]) => any | Promise<any>,
  options: UseSafeNavigationOptions = {}
): UseSafeNavigationReturn {
  const { debounceMs = 200, preventRapidClicks = true } = options;

  const safeAction = useSafeAction(navigationAction, {
    debounceMs: preventRapidClicks ? debounceMs : 0,
    allowConcurrent: false,
    onStart: () => {
      // Navigation démarrée
    },
    onEnd: () => {
      // Navigation terminée
    },
    onError: (error: Error) => {
      console.error('Erreur de navigation:', error);
    }
  });

  const navigate = useCallback(
    async (...args: any[]) => {
      try {
        const result = await safeAction.execute(...args);
        return result;
      } catch (error) {
        // Les erreurs sont déjà gérées par useSafeAction
        return { error: true, message: (error as Error).message };
      }
    },
    [safeAction]
  );

  return {
    navigate,
    loading: safeAction.loading,
    disabled: safeAction.disabled,
    canNavigate: !safeAction.loading,
    lastExecuted: safeAction.lastExecuted,
    cleanup: safeAction.cleanup
  };
}
