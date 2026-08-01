// Sauvegarde automatiquement la progression quand l'utilisateur quitte l'écran

import { useEffect } from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import { log } from '@/utils/logUtils';

export const useExerciseSaveOnUnmount = () => {
  const { saveProgressNow } = useProgress();

  useEffect(() => {
    return () => {
      log.debug('💾 Sauvegarde automatique à la sortie...');
      saveProgressNow().catch((e) => log.warn('[useExerciseSaveOnUnmount] Save error:', e));
    };
  }, [saveProgressNow]);
};
