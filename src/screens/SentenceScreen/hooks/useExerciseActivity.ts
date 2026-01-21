/**
 * ============================================
 * HOOK: useExerciseActivity
 * Calcule la progression locale et délègue l'enregistrement à useLastActivity.
 * ============================================
 */

import { useEffect } from 'react';
import { useLastActivity } from '../../../hooks/useLastActivity';

interface UseExerciseActivityProps {
  type: string;
  levelId: number;
  familyId: string;
  familyName: string;
  icon: string;
  currentIndex: number;
  totalItems: number;
  enabled: boolean;
}

export const useExerciseActivity = ({
  type,
  levelId,
  familyId,
  familyName,
  icon,
  currentIndex,
  totalItems,
  enabled
}: UseExerciseActivityProps) => {
  const { recordActivity } = useLastActivity();

  useEffect(() => {
    if (enabled && totalItems > 0) {
      const progressPercent = Math.round(((currentIndex + 1) / totalItems) * 100);
      
      recordActivity({
        moduleSlug: type,
        familyId,
        level: levelId,
        familyName,
        icon,
        progress: progressPercent
      });
    }
  }, [currentIndex, enabled, familyId, familyName, icon, levelId, recordActivity, totalItems, type]);
};
