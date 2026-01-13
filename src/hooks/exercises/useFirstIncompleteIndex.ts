/**
 * ============================================
 * HOOK: useFirstIncompleteIndex
 * Trouve le premier item non complété dans un exercice.
 * Permet de reprendre exactement là où l'utilisateur s'est arrêté.
 * ============================================
 */

import { useCallback } from 'react';
import { useProgress } from '../../contexts/ProgressContext';

export const useFirstIncompleteIndex = (
  levelId: number,
  exerciseType: string,
  familyId: string,
  totalItems: number
) => {
  const { progress } = useProgress();

  const getFirstIncompleteIndex = useCallback((): number => {
    if (!totalItems || totalItems === 0) return 0;

    // Construction de la clé de niveau (ex: 'level1')
    const levelKey = `level${levelId}`;
    
    // Accès sécurisé à la progression de la famille
    // Structure: progress.level1.vocab.familyId.items
    const familyData = progress?.[levelKey]?.[exerciseType]?.[familyId];

    // Si aucune donnée, on commence au début
    if (!familyData?.items) return 0;

    // On parcourt les items pour trouver le premier 'false' ou 'undefined'
    for (let i = 0; i < totalItems; i++) {
      if (!familyData.items[i]) {
        return i;
      }
    }

    // Si tout est fini, on retourne 0 pour permettre de réviser (ou totalItems - 1)
    return 0;
  }, [progress, levelId, exerciseType, familyId, totalItems]);

  return getFirstIncompleteIndex;
};

export default useFirstIncompleteIndex;
