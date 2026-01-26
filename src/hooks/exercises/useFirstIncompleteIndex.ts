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
    // Structure: progress.level1.vocab.familyId
    const familyData = progress?.[levelKey as keyof typeof progress]?.[exerciseType as keyof typeof progress[keyof typeof progress]]?.[familyId];

    // Si aucune donnée, on commence au début
    if (!familyData) return 0;

    // FamilyProgress a completed (nombre d'items complétés) et total
    // Si completed < totalItems, on retourne completed (prochain item à faire)
    // Si completed >= totalItems, tout est fini, on retourne 0 pour réviser
    if (familyData.completed < totalItems) {
      return familyData.completed;
    }

    // Si tout est fini, on retourne 0 pour permettre de réviser
    return 0;
  }, [progress, levelId, exerciseType, familyId, totalItems]);

  return getFirstIncompleteIndex;
};

export default useFirstIncompleteIndex;
