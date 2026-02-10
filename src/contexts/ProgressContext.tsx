/**
 * ProgressContext - Gestion de la progression utilisateur
 * Version TypeScript
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import { upsertProgress } from '../database/queries';

// ============================================
// TYPES
// ============================================

interface FamilyProgress {
  completed: number;
  total: number;
  lastReviewed?: number;
  nextReview?: number;
}

interface ExerciseProgress {
  [familyId: string]: FamilyProgress;
}

interface LevelProgress {
  vocab: ExerciseProgress;
  grammar: ExerciseProgress;
  phrase_types: ExerciseProgress;
  reading: ExerciseProgress;
  dialogues: ExerciseProgress;
  word_games: ExerciseProgress;
  connector: ExerciseProgress;
  assessment: ExerciseProgress;
  fastvocab: ExerciseProgress;
  [key: string]: ExerciseProgress;
}

interface ProgressState {
  [key: string]: LevelProgress;
}

interface TrackItemPayload {
  levelId: number;
  exerciseType: string;
  familyId: string;
  itemIndex: number;
  totalItems: number;
}

interface UpdateSpacedPayload {
  levelId: number;
  exerciseType: string;
  familyId: string;
  success: boolean;
}

interface ProgressAction {
  type: 'SET_PROGRESS' | 'TRACK_ITEM' | 'UPDATE_SPACED';
  payload?: any;
}

interface ProgressContextValue {
  progress: ProgressState | null;
  isLoading: boolean;
  trackItemCompletion: (levelId: number, exerciseType: string, familyId: string, itemIndex: number, totalItems: number) => void;
  updateSpacedRepetition: (levelId: number, exerciseType: string, familyId: string, success: boolean) => void;
  saveProgressNow: () => Promise<void>;
  getFamilyProgress: (levelId: number, exerciseType: string, familyId: string) => number;
  getExerciseProgress: (levelId: number, exerciseType: string, allFamilyIds?: string[] | null) => number;
  getLevelProgress: (levelId: number) => number;
  getRevisionFamilies: (levelId: number, mode: string) => any[];
  getLastActivity: (levelId: number, exerciseType: string) => { familyId: string; progress: number; lastReviewed: number } | null;
  getRecommendedModule: (levelId: number) => { exerciseType: string; progress: number; lastReviewed: number } | null;
}

// ============================================
// ACTIONS
// ============================================

const progressActions = {
  SET_PROGRESS: 'SET_PROGRESS' as const,
  TRACK_ITEM: 'TRACK_ITEM' as const,
  UPDATE_SPACED: 'UPDATE_SPACED' as const
};

// ============================================
// REDUCER
// ============================================

const progressReducer = (state: ProgressState, action: ProgressAction): ProgressState => {
  switch (action.type) {
    case progressActions.SET_PROGRESS:
      return action.payload;

    case progressActions.TRACK_ITEM: {
      const { levelId, exerciseType, familyId, itemIndex, totalItems } = action.payload as TrackItemPayload;
      const levelKey = `level${levelId}`;

      return {
        ...state,
        [levelKey]: {
          ...state[levelKey],
          [exerciseType]: {
            ...state[levelKey]?.[exerciseType as keyof LevelProgress],
            [familyId]: {
              completed: itemIndex + 1,
              total: totalItems,
              lastReviewed: Date.now()
            }
          }
        }
      };
    }

    case progressActions.UPDATE_SPACED: {
      const { levelId, exerciseType, familyId, success } = action.payload as UpdateSpacedPayload;
      const levelKey = `level${levelId}`;
      const family = state[levelKey]?.[exerciseType as keyof LevelProgress]?.[familyId];

      if (!family) return state;

      const interval = success ? 86400000 : 3600000; // 24h ou 1h

      return {
        ...state,
        [levelKey]: {
          ...state[levelKey],
          [exerciseType]: {
            ...state[levelKey]?.[exerciseType as keyof LevelProgress],
            [familyId]: {
              ...family,
              nextReview: Date.now() + interval
            }
          }
        }
      };
    }

    default:
      return state;
  }
};

// ============================================
// UTILS
// ============================================

const ALL_MODULE_SLUGS = [
  'vocab', 'grammar', 'phrase_types', 'reading', 'dialogues',
  'word_games', 'connector', 'assessment', 'fastvocab',
];

const MAX_LEVELS = 8; // Support up to 8 levels (adult could have 6-7)

/**
 * Décompose une clé composite "familyId-subfamilyId" en 2 entiers.
 * Ex: "1-2" → { familyId: 1, subfamilyId: 2 }
 * Ex: "12"  → { familyId: 12, subfamilyId: 0 }
 */
const parseCompositeKey = (key: string): { familyId: number; subfamilyId: number } => {
  if (key.includes('-')) {
    const [fam, sub] = key.split('-');
    return { familyId: Number(fam), subfamilyId: Number(sub) || 0 };
  }
  return { familyId: Number(key), subfamilyId: 0 };
};

const createEmptyLevelProgress = (): LevelProgress => {
  const lp: any = {};
  ALL_MODULE_SLUGS.forEach(slug => { lp[slug] = {}; });
  return lp as LevelProgress;
};

const createInitialProgress = (): ProgressState => {
  const base: ProgressState = {};
  for (let i = 1; i <= MAX_LEVELS; i++) {
    base[`level${i}`] = createEmptyLevelProgress();
  }
  return base;
};

const filterRevisionFamilies = (progress: ProgressState | null, levelId: number, mode: string): any[] => {
  if (!progress) return [];

  const levelKey = `level${levelId}`;
  const levelData = progress[levelKey];

  if (!levelData) return [];

  const families: any[] = [];
  const now = Date.now();

  Object.entries(levelData).forEach(([exerciseType, exerciseData]) => {
    Object.entries(exerciseData as ExerciseProgress).forEach(([familyId, family]) => {
      if (mode === 'review' && family.nextReview && family.nextReview <= now) {
        families.push({ exerciseType, familyId, ...family });
      }
    });
  });

  return families;
};

// ============================================
// CONTEXT
// ============================================

const STORAGE_KEY = 'JOUDPRIMARY_PROGRESS';

export const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db, user } = useUser();
  const [progress, dispatch] = useReducer(progressReducer, null, () => createInitialProgress());
  const [isLoading, setIsLoading] = React.useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Chargement initial (avec migration sentences → phrase_types)
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as ProgressState;

          // Migration : renommer "sentences" en "phrase_types" dans chaque niveau
          for (const levelKey of Object.keys(parsed)) {
            const level = parsed[levelKey];
            if (level && 'sentences' in level && !('phrase_types' in level)) {
              (level as any).phrase_types = (level as any).sentences;
              delete (level as any).sentences;
            }
          }

          dispatch({ type: progressActions.SET_PROGRESS, payload: parsed });
        }
      } catch (e) {
        console.error('Erreur chargement progress:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Sauvegarde automatique (Debounce)
  useEffect(() => {
    if (isLoading || !progress) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [progress, isLoading]);

  // Sync vers SQLite (source de vérité persistante)
  const syncToSQLite = useCallback(async (state: ProgressState) => {
    if (!db || !user) return;

    for (const [levelKey, levelData] of Object.entries(state)) {
      const levelNum = Number.parseInt(levelKey.replace('level', ''), 10);
      if (Number.isNaN(levelNum) || !levelData) continue;

      for (const [, exerciseData] of Object.entries(levelData)) {
        for (const [compositeKey, family] of Object.entries(exerciseData)) {
          if (!family || family.total === 0) continue;

          const { familyId, subfamilyId } = parseCompositeKey(compositeKey);
          if (Number.isNaN(familyId)) continue;

          await upsertProgress(db, {
            user_id: user.id,
            family_id: familyId,
            subfamily_id: subfamilyId,
            level: levelNum,
            completed: family.completed,
            total: family.total,
            score: Math.round((family.completed / family.total) * 100),
          });
        }
      }
    }
  }, [db, user]);

  // Sauvegarde manuelle : AsyncStorage + sync SQLite
  const saveProgressNow = useCallback(async () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      if (progress) await syncToSQLite(progress);
    } catch (e) {
      console.error('Erreur sauvegarde progress:', e);
    }
  }, [progress, syncToSQLite]);

  // Actions
  const trackItemCompletion = useCallback((
    levelId: number,
    exerciseType: string,
    familyId: string,
    itemIndex: number,
    totalItems: number
  ) => {
    dispatch({
      type: progressActions.TRACK_ITEM,
      payload: { levelId, exerciseType, familyId, itemIndex, totalItems }
    });
  }, []);

  const updateSpacedRepetition = useCallback((
    levelId: number,
    exerciseType: string,
    familyId: string,
    success: boolean
  ) => {
    dispatch({
      type: progressActions.UPDATE_SPACED,
      payload: { levelId, exerciseType, familyId, success }
    });
  }, []);

  // Calculs
  const getFamilyProgress = useCallback((levelId: number, exerciseType: string, familyId: string): number => {
    const family = progress?.[`level${levelId}`]?.[exerciseType as keyof LevelProgress]?.[familyId];
    return family ? Math.round((family.completed / family.total) * 100) : 0;
  }, [progress]);

  const getExerciseProgress = useCallback((
    levelId: number,
    exerciseType: string,
    allFamilyIds: string[] | null = null
  ): number => {
    const levelKey = `level${levelId}`;
    const exerciseData = progress?.[levelKey]?.[exerciseType as keyof LevelProgress] || {};
    const ids = allFamilyIds || Object.keys(exerciseData);

    if (ids.length === 0) return 0;

    const total = ids.reduce((sum, id) => sum + getFamilyProgress(levelId, exerciseType, id), 0);
    return Math.round(total / ids.length);
  }, [progress, getFamilyProgress]);

  const getLevelProgress = useCallback((levelId: number): number => {
    const levelKey = `level${levelId}`;
    const levelData = progress?.[levelKey];
    if (!levelData) return 0;

    // Ne compter que les modules qui ont au moins une famille avec de la progression
    let activeModules = 0;
    let totalProgress = 0;

    for (const moduleSlug of ALL_MODULE_SLUGS) {
      const exerciseData = levelData[moduleSlug] || {};
      const familyIds = Object.keys(exerciseData);

      if (familyIds.length > 0) {
        activeModules++;
        totalProgress += getExerciseProgress(levelId, moduleSlug, familyIds);
      }
    }

    return activeModules > 0 ? Math.round(totalProgress / activeModules) : 0;
  }, [progress, getExerciseProgress]);

  const getRevisionFamilies = useCallback((levelId: number, mode: string): any[] => {
    return filterRevisionFamilies(progress, levelId, mode);
  }, [progress]);

  const getLastActivity = useCallback((
    levelId: number,
    exerciseType: string
  ): { familyId: string; progress: number; lastReviewed: number } | null => {
    const levelKey = `level${levelId}`;
    const exerciseData = progress?.[levelKey]?.[exerciseType as keyof LevelProgress];

    if (!exerciseData) return null;

    let mostRecent: { familyId: string; progress: number; lastReviewed: number } | null = null;

    Object.entries(exerciseData).forEach(([familyId, family]) => {
      if (family.lastReviewed) {
        if (!mostRecent || family.lastReviewed > mostRecent.lastReviewed) {
          mostRecent = {
            familyId,
            progress: Math.round((family.completed / family.total) * 100),
            lastReviewed: family.lastReviewed,
          };
        }
      }
    });

    return mostRecent;
  }, [progress]);

  const getRecommendedModule = useCallback((
    levelId: number
  ): { exerciseType: string; progress: number; lastReviewed: number } | null => {
    const levelKey = `level${levelId}`;
    const levelData = progress?.[levelKey];

    if (!levelData) return null;

    let mostRecent: { exerciseType: string; progress: number; lastReviewed: number } | null = null;

    Object.entries(levelData).forEach(([exerciseType, exerciseData]) => {
      Object.entries(exerciseData as ExerciseProgress).forEach(([familyId, family]) => {
        if (family.lastReviewed) {
          if (!mostRecent || family.lastReviewed > mostRecent.lastReviewed) {
            const totalProgress = getExerciseProgress(levelId, exerciseType, null);
            mostRecent = {
              exerciseType,
              progress: totalProgress,
              lastReviewed: family.lastReviewed,
            };
          }
        }
      });
    });

    return mostRecent;
  }, [progress, getExerciseProgress]);

  // Valeur du contexte
  const value = useMemo<ProgressContextValue>(() => ({
    progress,
    isLoading,
    trackItemCompletion,
    updateSpacedRepetition,
    saveProgressNow,
    getFamilyProgress,
    getExerciseProgress,
    getLevelProgress,
    getRevisionFamilies,
    getLastActivity,
    getRecommendedModule
  }), [
    progress,
    isLoading,
    trackItemCompletion,
    updateSpacedRepetition,
    saveProgressNow,
    getFamilyProgress,
    getExerciseProgress,
    getLevelProgress,
    getRevisionFamilies,
    getLastActivity,
    getRecommendedModule
  ]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = (): ProgressContextValue => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
