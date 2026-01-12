/**
 * ProgressContext - Gestion de la progression utilisateur
 * Version TypeScript
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

interface ProgressState {
  level1: LevelProgress;
  level2: LevelProgress;
  level3: LevelProgress;
  level4: LevelProgress;
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

const createInitialProgress = (): ProgressState => {
  const levels = ['level1', 'level2', 'level3', 'level4'];
  const base: any = {};

  levels.forEach(l => {
    base[l] = {
      vocab: {},
      grammar: {},
      phrase_types: {},
      reading: {},
      dialogues: {},
      word_games: {}
    };
  });

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
  const [progress, dispatch] = useReducer(progressReducer, null, () => createInitialProgress());
  const [isLoading, setIsLoading] = React.useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Chargement initial
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          dispatch({ type: progressActions.SET_PROGRESS, payload: JSON.parse(saved) });
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

  // Sauvegarde manuelle
  const saveProgressNow = useCallback(async () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Erreur sauvegarde manuelle:', e);
    }
  }, [progress]);

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
    const types = ['vocab', 'grammar', 'phrase_types', 'reading', 'dialogues', 'word_games'];

    const sum = types.reduce((total, type) => {
      return total + getExerciseProgress(levelId, type, null);
    }, 0);

    return Math.round(sum / types.length);
  }, [getExerciseProgress]);

  const getRevisionFamilies = useCallback((levelId: number, mode: string): any[] => {
    return filterRevisionFamilies(progress, levelId, mode);
  }, [progress]);

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
    getRevisionFamilies
  }), [
    progress,
    isLoading,
    trackItemCompletion,
    updateSpacedRepetition,
    saveProgressNow,
    getFamilyProgress,
    getExerciseProgress,
    getLevelProgress,
    getRevisionFamilies
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
