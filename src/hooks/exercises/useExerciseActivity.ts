// Calcule la progression locale et enregistre l'activité — universel, tous modules

import { useEffect, useRef } from 'react';
import { useLastActivity } from '@/hooks/useLastActivity';

interface UseExerciseActivityProps {
  moduleSlug: string;   
  familyId: string;
  levelId: number;
  familyName: string;
  icon?: string;
  currentIndex: number;
  totalItems: number;
  enabled: boolean;      // Pour éviter d'enregistrer pendant le chargement
}

export const useExerciseActivity = ({
  moduleSlug,
  familyId,
  levelId,
  familyName,
  icon = 'book',
  currentIndex,
  totalItems,
  enabled
}: UseExerciseActivityProps) => {
  const { recordActivity } = useLastActivity();

  // Ref (pas state) pour éviter des appels en boucle si recordActivity change d'identité
  const lastRecordedIndex = useRef<number>(-1);

  useEffect(() => {
    // N'enregistre que si activé, avec des items, et si l'index a réellement changé (évite les doublons au montage)
    if (enabled && totalItems > 0 && currentIndex !== lastRecordedIndex.current) {
      // currentIndex + 1 car l'index 0 signifie qu'on a terminé le 1er item
      const progressPercent = Math.min(
        100, 
        Math.round(((currentIndex + 1) / totalItems) * 100)
      );
      
      recordActivity({
        moduleSlug,
        familyId,
        level: levelId,
        familyName,
        icon,
        progress: progressPercent
      });

      lastRecordedIndex.current = currentIndex;
    }
  }, [
    currentIndex, 
    enabled, 
    familyId, 
    familyName, 
    icon, 
    levelId, 
    recordActivity, 
    totalItems, 
    moduleSlug
  ]);
};