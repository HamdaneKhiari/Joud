/**
 * ============================================
 * HOOK: useExerciseActivity
 * Calcule la progression locale et enregistre l'activité.
 * ✅ Universel : Fonctionne pour Vocab, Sentences, Grammaire, etc.
 * ============================================
 */

import { useEffect, useRef } from 'react';
import { useLastActivity } from '@/hooks/useLastActivity';

interface UseExerciseActivityProps {
  moduleSlug: string;    // ex: 'vocab', 'sentences', 'grammar'
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
  
  // Utilisation d'un ref pour éviter des appels en boucle si recordActivity change
  const lastRecordedIndex = useRef<number>(-1);

  useEffect(() => {
    // On n'enregistre que si :
    // 1. Le hook est activé
    // 2. On a des items à traiter
    // 3. L'index a réellement changé (évite les doublons au montage)
    if (enabled && totalItems > 0 && currentIndex !== lastRecordedIndex.current) {
      
      // Calcul du pourcentage : (nb complétés / total) * 100
      // On utilise currentIndex + 1 car l'index 0 signifie qu'on a terminé le 1er item
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