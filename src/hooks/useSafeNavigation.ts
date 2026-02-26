/**
 * ============================================
 * HOOK: useSafeNavigation
 * Version TypeScript Premium
 * Gère les transitions de navigation de manière sécurisée (anti-double clic)
 * ============================================
 */

import { log } from '@/utils/logUtils';
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import useSafeAction from './useSafeAction';

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

/**
 * @param navigationAction - Optionnel. L'action à sécuriser. Par défaut: navigation.goBack()
 * @param options - Options de debounce et sécurité
 */
export default function useSafeNavigation(
  navigationAction?: (...args: any[]) => any | Promise<any>, // Rendu optionnel avec le "?"
  options: UseSafeNavigationOptions = {}
): UseSafeNavigationReturn {
  const navigation = useNavigation();
  const { debounceMs = 250, preventRapidClicks = true } = options;

  // Si aucune action n'est fournie, on définit le goBack par défaut
  const defaultAction = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  // On utilise l'action fournie OU l'action par défaut
  const actionToExecute = navigationAction || defaultAction;

  const safeAction = useSafeAction(actionToExecute, {
    debounceMs: preventRapidClicks ? debounceMs : 0,
    allowConcurrent: false,
    onError: (error: Error) => {
      log.error('[SafeNavigation] Erreur:', error);
    }
  });

  const navigate = useCallback(
    async (...args: any[]) => {
      try {
        const result = await safeAction.execute(...args);
        return result;
      } catch (error) {
        // Retourne un objet d'erreur structuré au lieu de faire crasher l'appelant
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