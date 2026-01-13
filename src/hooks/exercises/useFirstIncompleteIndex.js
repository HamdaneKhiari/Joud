// ============================================
// HOOK: useFirstIncompleteIndex
// Trouve le premier item non complété dans un exercice
// ============================================

import { useCallback } from 'react';
import { useProgress } from '../../contexts/ProgressContext';

/**
 * Hook pour trouver le premier item non complété d'une famille d'exercices
 *
 * @param {number} levelId - ID du niveau
 * @param {string} exerciseType - Type d'exercice (vocab, reading, etc.)
 * @param {string} familyId - ID de la famille
 * @param {number} totalItems - Nombre total d'items dans la famille
 * @returns {function} Fonction pour obtenir l'index du premier item non complété
 */
export const useFirstIncompleteIndex = (levelId, exerciseType, familyId, totalItems) => {
  const { progress } = useProgress();

  const getFirstIncompleteIndex = useCallback(() => {
    if (!totalItems || totalItems === 0) return 0;

    const levelKey = `level${levelId}`;
    const familyData = progress[levelKey]?.[exerciseType]?.[familyId];

    if (!familyData?.items) return 0;

    // Chercher le premier item non complété
    for (let i = 0; i < totalItems; i++) {
      if (!familyData.items[i]) return i;
    }

    // Si tous sont complétés, retourner le dernier
    return Math.max(0, totalItems - 1);
  }, [progress, levelId, exerciseType, familyId, totalItems]);

  return getFirstIncompleteIndex;
};

export default useFirstIncompleteIndex;
