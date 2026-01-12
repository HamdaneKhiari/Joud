/**
 * useFamiliesWithProgress - Hook pour charger les familles avec progression
 * Version TypeScript
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCompletedWordsForLevel,
  enrichFamiliesWithProgress,
  saveFamilyProgress
} from '@/utils/familySelection/familySelectionHelper';

// ============================================
// TYPES
// ============================================

interface Family {
  id: string;
  name?: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  words?: any[];
  totalWords?: number;
}

interface EnrichedFamily extends Family {
  progress: number;
  completed: number;
  badge: string | null;
}

interface UseFamiliesWithProgressReturn {
  families: EnrichedFamily[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

// ============================================
// STORAGE KEYS (Temporaire - à remplacer par import si existe)
// ============================================

const STORAGE_KEYS = {
  PROGRESS: 'JOUDPRIMARY_PROGRESS',
  FAMILY_PROGRESS: 'FAMILY_PROGRESS_CACHE'
};

// ============================================
// HOOK
// ============================================

const useFamiliesWithProgress = (
  moduleId: string,
  levelId: number
): UseFamiliesWithProgressReturn => {
  const [families, setFamilies] = useState<EnrichedFamily[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFamiliesWithProgress = useCallback(async () => {
    try {
      setIsLoading(true);

      // TODO: Remplacer par getFamiliesByModule depuis SQLite
      // Pour l'instant, retourne un tableau vide
      const staticFamilies: Family[] = [];

      if (!staticFamilies || staticFamilies.length === 0) {
        setFamilies([]);
        return;
      }

      // 1. Récupération des mots complétés
      const completedWords = await getCompletedWordsForLevel({
        asyncStorage: AsyncStorage,
        levelId,
        mode: 'classic',
        STORAGE_KEYS
      });

      // 2. Enrichissement (Badge + % + Completed)
      const enrichedFamilies = enrichFamiliesWithProgress(staticFamilies, completedWords);
      setFamilies(enrichedFamilies);

      // 3. Sauvegarde automatique du cache de progression
      const familyProgressMap = enrichedFamilies.reduce((acc, family) => {
        acc[`${family.id}_L${levelId}`] = {
          progress: family.progress,
          completed: family.completed,
          totalWords: family.totalWords || family.words?.length || 0
        };
        return acc;
      }, {} as Record<string, any>);

      await saveFamilyProgress({
        familyProgress: familyProgressMap,
        asyncStorage: AsyncStorage,
        STORAGE_KEYS
      });
    } catch (error) {
      console.error('[Hook] Erreur chargement families:', error);
    } finally {
      setIsLoading(false);
    }
  }, [moduleId, levelId]);

  useEffect(() => {
    loadFamiliesWithProgress();
  }, [loadFamiliesWithProgress]);

  return {
    families,
    isLoading,
    refresh: loadFamiliesWithProgress
  };
};

export default useFamiliesWithProgress;
