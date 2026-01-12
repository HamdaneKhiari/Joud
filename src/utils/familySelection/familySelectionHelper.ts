/**
 * Family Selection Helper - Helpers pour la gestion des familles d'exercices
 * Version TypeScript
 */

import type AsyncStorage from '@react-native-async-storage/async-storage';

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

interface FamilyProgressData {
  progress: number;
  completed: number;
  totalWords: number;
}

interface StorageKeys {
  PROGRESS: string;
  FAMILY_PROGRESS?: string;
  [key: string]: string | undefined;
}

interface GetCompletedWordsParams {
  asyncStorage: typeof AsyncStorage;
  levelId: number;
  mode: string;
  STORAGE_KEYS: StorageKeys;
}

interface SaveFamilyProgressParams {
  familyProgress: Record<string, FamilyProgressData>;
  asyncStorage: typeof AsyncStorage;
  STORAGE_KEYS: StorageKeys;
}

// ============================================
// HELPERS
// ============================================

/**
 * Récupère les mots complétés pour un niveau
 */
export const getCompletedWordsForLevel = async (
  params: GetCompletedWordsParams
): Promise<Set<string>> => {
  const { asyncStorage, levelId, mode, STORAGE_KEYS } = params;

  try {
    const storageKey = STORAGE_KEYS.PROGRESS || 'JOUDPRIMARY_PROGRESS';
    const data = await asyncStorage.getItem(storageKey);

    if (!data) return new Set();

    const progress = JSON.parse(data);
    const levelKey = `level${levelId}`;
    const levelData = progress[levelKey];

    if (!levelData) return new Set();

    const completedWords = new Set<string>();

    // Parcourir tous les exercices et familles pour collecter les mots complétés
    Object.values(levelData).forEach((exerciseData: any) => {
      Object.entries(exerciseData).forEach(([familyId, family]: [string, any]) => {
        if (family.completed > 0) {
          // Ajouter les mots complétés (simulé avec des IDs)
          for (let i = 0; i < family.completed; i++) {
            completedWords.add(`${familyId}_word_${i}`);
          }
        }
      });
    });

    return completedWords;
  } catch (error) {
    console.error('Erreur getCompletedWordsForLevel:', error);
    return new Set();
  }
};

/**
 * Enrichit les familles avec les badges et la progression
 */
export const enrichFamiliesWithProgress = (
  families: Family[],
  completedWords: Set<string>
): EnrichedFamily[] => {
  return families.map(family => {
    const totalWords = family.totalWords || family.words?.length || 0;
    const completed = family.words?.filter(word => completedWords.has(word)).length || 0;
    const progress = totalWords > 0 ? Math.round((completed / totalWords) * 100) : 0;

    // Badge selon progression
    let badge: string | null = null;
    if (progress >= 100) badge = '⭐ OR';
    else if (progress >= 70) badge = '🥈 ARGENT';
    else if (progress >= 30) badge = '🥉 BRONZE';
    else if (progress > 0) badge = 'NOUVEAU';

    return {
      ...family,
      progress,
      completed,
      badge
    };
  });
};

/**
 * Sauvegarde la progression des familles
 */
export const saveFamilyProgress = async (
  params: SaveFamilyProgressParams
): Promise<void> => {
  const { familyProgress, asyncStorage, STORAGE_KEYS } = params;

  try {
    const storageKey = STORAGE_KEYS.FAMILY_PROGRESS || 'FAMILY_PROGRESS_CACHE';
    await asyncStorage.setItem(storageKey, JSON.stringify(familyProgress));
  } catch (error) {
    console.error('Erreur saveFamilyProgress:', error);
  }
};
