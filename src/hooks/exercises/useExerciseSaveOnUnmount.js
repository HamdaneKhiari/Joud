// ============================================
// HOOK: useExerciseSaveOnUnmount
// Sauvegarde automatiquement la progression quand le composant se démonte
// ============================================

import { useEffect } from 'react';
import { useProgress } from '../../contexts/ProgressContext';

/**
 * Hook pour sauvegarder automatiquement la progression au démontage du composant
 * Garantit que les progrès ne sont pas perdus quand l'utilisateur quitte l'exercice
 */
export const useExerciseSaveOnUnmount = () => {
  const { saveProgressNow } = useProgress();

  useEffect(() => {
    // Cleanup function appelée au démontage
    return () => {
      saveProgressNow();
    };
  }, [saveProgressNow]);
};

export default useExerciseSaveOnUnmount;
