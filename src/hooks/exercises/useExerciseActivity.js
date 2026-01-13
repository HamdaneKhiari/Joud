// ============================================
// HOOK: useExerciseActivity
// Sauvegarde automatiquement l'activité courante pour le Dashboard
// ============================================

import { useEffect } from 'react';
import useLastActivity from '../dashboard/useLastActivity';

/**
 * Hook pour sauvegarder automatiquement l'activité en cours
 * Permet au Dashboard de proposer "Continuer l'apprentissage"
 *
 * @param {Object} params - Paramètres de l'activité
 * @param {string} params.type - Type d'exercice (vocab, reading, grammar, etc.)
 * @param {number} params.levelId - ID du niveau
 * @param {string} params.familyId - ID de la famille
 * @param {string} params.moduleId - ID du module (optionnel)
 * @param {string} params.familyName - Nom de la famille
 * @param {string} params.icon - Icône de l'exercice
 * @param {number} params.currentIndex - Index actuel (question, mot, etc.)
 * @param {number} params.totalItems - Nombre total d'items
 * @param {boolean} params.enabled - Si false, ne sauvegarde pas (défaut: true)
 */
export const useExerciseActivity = ({
  type,
  levelId,
  familyId,
  moduleId,
  familyName,
  icon,
  currentIndex,
  totalItems,
  enabled = true,
}) => {
  const { saveActivity } = useLastActivity();

  useEffect(() => {
    if (!enabled || !familyName) return;

    saveActivity({
      type,
      levelId,
      familyId,
      moduleId,
      familyName,
      icon,
      timestamp: Date.now(),
      metadata: {
        currentIndex,
        totalItems,
      },
    });
  }, [
    type,
    levelId,
    familyId,
    moduleId,
    familyName,
    icon,
    currentIndex,
    totalItems,
    enabled,
    saveActivity,
  ]);
};

export default useExerciseActivity;
