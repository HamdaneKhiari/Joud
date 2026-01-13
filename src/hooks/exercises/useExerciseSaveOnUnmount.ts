/**
 * ============================================
 * HOOK: useExerciseSaveOnUnmount
 * Sauvegarde automatiquement la progression quand l'utilisateur quitte l'écran.
 * ============================================
 */

import { useEffect } from 'react';
import { useProgress } from '../../contexts/ProgressContext';

export const useExerciseSaveOnUnmount = () => {
  const { saveProgressNow } = useProgress();

  useEffect(() => {
    // Fonction de nettoyage appelée au démontage du composant
    return () => {
      console.log('💾 Sauvegarde automatique à la sortie...');
      saveProgressNow();
    };
  }, [saveProgressNow]);
};

export default useExerciseSaveOnUnmount;
