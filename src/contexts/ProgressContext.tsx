/**
 * ProgressContext - Gestion de la progression utilisateur
 * SQLite = source de vérité, AsyncStorage = cache rapide
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import { upsertProgress } from '../database/queries';
import type { SQLiteDatabase } from 'expo-sqlite';
import { log } from '@/utils/logUtils';

// ============================================
// TYPES
// ============================================

interface FamilyProgress {
  completed: number;
  total: number;
  lastReviewed?: number;
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

interface ProgressAction {
  type: 'SET_PROGRESS' | 'TRACK_ITEM';
  payload?: any;
}

interface ProgressContextValue {
  progress: ProgressState | null;
  isLoading: boolean;
  trackItemCompletion: (levelId: number, exerciseType: string, familyId: string, itemIndex: number, totalItems: number) => void;
  saveProgressNow: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  resetProgress: () => Promise<void>;
  getFamilyProgress: (levelId: number, exerciseType: string, familyId: string) => number;
  getExerciseProgress: (levelId: number, exerciseType: string, allFamilyIds?: string[] | null) => number;
  getLevelProgress: (levelId: number) => number;
  getRevisionFamilies: (levelId: number) => any[];
  getLastActivity: (levelId: number, exerciseType: string) => { familyId: string; progress: number; lastReviewed: number } | null;
  getRecommendedModule: (levelId: number) => { exerciseType: string; progress: number; lastReviewed: number } | null;
}

// ============================================
// REDUCER
// ============================================

const progressReducer = (state: ProgressState, action: ProgressAction): ProgressState => {
  switch (action.type) {
    case 'SET_PROGRESS':
      return action.payload;

    case 'TRACK_ITEM': {
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

    default:
      return state;
  }
};

// ============================================
// UTILS
// ============================================

const ALL_MODULE_SLUGS = [
  'vocab', 'grammar', 'phrase_types', 'reading', 'dialogues',
  'word_games', 'connector', 'fastvocab',
];

const MAX_LEVELS = 8;

const getStorageKey = (userId: string) => `JOUD_PROGRESS_${userId}`;

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

/**
 * Load progress from SQLite (source of truth) and rebuild ProgressState
 */
const loadFromSQLite = async (db: SQLiteDatabase, userId: string): Promise<ProgressState | null> => {
  try {
    const rows = await db.getAllAsync<{
      family_id: number; subfamily_id: number; level: number;
      completed: number; total: number; last_accessed: string;
    }>(
      `SELECT p.family_id, p.subfamily_id, p.level, p.completed, p.total, p.last_accessed,
              f.module_slug
       FROM progress p
       INNER JOIN families f ON f.id = p.family_id
       WHERE p.user_id = ?`,
      [userId]
    );

    if (!rows || rows.length === 0) return null;

    const state = createInitialProgress();

    for (const row of rows) {
      const levelKey = `level${row.level}`;
      const moduleSlug = (row as any).module_slug;
      if (!state[levelKey] || !moduleSlug) continue;

      const compositeKey = row.subfamily_id > 0
        ? `${row.family_id}-${row.subfamily_id}`
        : `${row.family_id}`;

      if (!state[levelKey][moduleSlug]) {
        state[levelKey][moduleSlug] = {};
      }

      state[levelKey][moduleSlug][compositeKey] = {
        completed: row.completed,
        total: row.total || row.completed,
        lastReviewed: row.last_accessed ? new Date(row.last_accessed).getTime() : undefined,
      };
    }

    return state;
  } catch (e) {
    log.warn('[ProgressContext] loadFromSQLite error:', e);
    return null;
  }
};

const filterRevisionFamilies = (progress: ProgressState | null, levelId: number): any[] => {
  if (!progress) return [];
  const levelData = progress[`level${levelId}`];
  if (!levelData) return [];

  const families: any[] = [];
  Object.entries(levelData).forEach(([exerciseType, exerciseData]) => {
    Object.entries(exerciseData as ExerciseProgress).forEach(([familyId, family]) => {
      if (family.completed > 0) {
        families.push({ exerciseType, familyId, ...family });
      }
    });
  });
  return families;
};

// ============================================
// CONTEXT
// ============================================

export const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db, user } = useUser();
  const [progress, dispatch] = useReducer(progressReducer, null, () => createInitialProgress());
  const [isLoading, setIsLoading] = React.useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // P0+P1+P3: Load from SQLite first, fallback to AsyncStorage (scoped per user)
  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Try SQLite (source of truth)
        if (db) {
          const sqliteState = await loadFromSQLite(db, user.id);
          if (sqliteState) {
            dispatch({ type: 'SET_PROGRESS', payload: sqliteState });
            // Also update AsyncStorage cache
            await AsyncStorage.setItem(getStorageKey(user.id), JSON.stringify(sqliteState));
            setIsLoading(false);
            return;
          }
        }

        // 2. Fallback: AsyncStorage cache (scoped per user)
        const saved = await AsyncStorage.getItem(getStorageKey(user.id));
        if (saved) {
          const parsed = JSON.parse(saved) as ProgressState;

          // Migration: rename "sentences" → "phrase_types"
          for (const levelKey of Object.keys(parsed)) {
            const level = parsed[levelKey];
            if (level && 'sentences' in level && !('phrase_types' in level)) {
              (level as any).phrase_types = (level as any).sentences;
              delete (level as any).sentences;
            }
          }

          dispatch({ type: 'SET_PROGRESS', payload: parsed });
        }

        // 3. Migrate old non-scoped key if exists
        const oldKey = 'JOUDPRIMARY_PROGRESS';
        const oldSaved = await AsyncStorage.getItem(oldKey);
        if (oldSaved && !saved) {
          await AsyncStorage.setItem(getStorageKey(user.id), oldSaved);
          await AsyncStorage.removeItem(oldKey);
          const parsed = JSON.parse(oldSaved) as ProgressState;
          dispatch({ type: 'SET_PROGRESS', payload: parsed });
        }
      } catch (e) {
        console.error('[ProgressContext] Load error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [db, user?.id]);

  // P2: Auto save to AsyncStorage + SQLite (debounced)
  useEffect(() => {
    if (isLoading || !progress || !user?.id) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(getStorageKey(user.id), JSON.stringify(progress));
        if (db) await syncToSQLite(progress);
      } catch (e) {
        log.warn('[ProgressContext] Auto-save error:', e);
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [progress, isLoading, user?.id]);

  // Sync to SQLite
  const syncToSQLite = useCallback(async (state: ProgressState) => {
    if (!db || typeof db === 'number' || !user) return;

    for (const [levelKey, levelData] of Object.entries(state)) {
      const levelNum = Number.parseInt(levelKey.replace('level', ''), 10);
      if (Number.isNaN(levelNum) || !levelData) continue;

      for (const [, exerciseData] of Object.entries(levelData)) {
        for (const [compositeKey, family] of Object.entries(exerciseData)) {
          if (!family || family.total === 0) continue;

          const { familyId, subfamilyId } = parseCompositeKey(compositeKey);
          if (Number.isNaN(familyId) || familyId <= 0) continue;

          try {
            await upsertProgress(db, {
              user_id: user.id,
              family_id: familyId,
              subfamily_id: subfamilyId,
              level: levelNum,
              completed: family.completed,
              total: family.total,
              score: Math.round((family.completed / family.total) * 100),
            });
          } catch (e) {
            log.warn(`[syncToSQLite] Skip key="${compositeKey}" (family_id=${familyId}):`, e);
          }
        }
      }
    }
  }, [db, user]);

  // Manual save
  const saveProgressNow = useCallback(async () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    try {
      if (user?.id) {
        await AsyncStorage.setItem(getStorageKey(user.id), JSON.stringify(progress));
      }
      if (progress && db) await syncToSQLite(progress);
    } catch (e) {
      console.error('[ProgressContext] Save error:', e);
    }
  }, [progress, syncToSQLite, user?.id]);

  // Refresh progress from SQLite (called on screen focus)
  const refreshProgress = useCallback(async () => {
    if (!db || typeof db === 'number' || !user?.id) return;
    const freshState = await loadFromSQLite(db, user.id);
    if (freshState) {
      dispatch({ type: 'SET_PROGRESS', payload: freshState });
    }
  }, [db, user?.id]);

  // Reset all progress (Settings → Réinitialiser)
  const resetProgress = useCallback(async () => {
    if (!db || typeof db === 'number' || !user?.id) return;
    try {
      await db.runAsync('DELETE FROM progress WHERE user_id = ?', [user.id]);
      await AsyncStorage.removeItem(getStorageKey(user.id));
      dispatch({ type: 'SET_PROGRESS', payload: createInitialProgress() });
    } catch (e) {
      log.warn('[ProgressContext] Reset error:', e);
    }
  }, [db, user?.id]);

  // Actions
  const trackItemCompletion = useCallback((
    levelId: number, exerciseType: string, familyId: string,
    itemIndex: number, totalItems: number
  ) => {
    dispatch({
      type: 'TRACK_ITEM',
      payload: { levelId, exerciseType, familyId, itemIndex, totalItems }
    });
  }, []);

  // Calculations
  const getFamilyProgress = useCallback((levelId: number, exerciseType: string, familyId: string): number => {
    const family = progress?.[`level${levelId}`]?.[exerciseType as keyof LevelProgress]?.[familyId];
    return family ? Math.round((family.completed / family.total) * 100) : 0;
  }, [progress]);

  const getExerciseProgress = useCallback((
    levelId: number, exerciseType: string, allFamilyIds: string[] | null = null
  ): number => {
    const exerciseData = progress?.[`level${levelId}`]?.[exerciseType as keyof LevelProgress] || {};
    const ids = allFamilyIds || Object.keys(exerciseData);
    if (ids.length === 0) return 0;
    const total = ids.reduce((sum, id) => sum + getFamilyProgress(levelId, exerciseType, id), 0);
    return Math.round(total / ids.length);
  }, [progress, getFamilyProgress]);

  const getLevelProgress = useCallback((levelId: number): number => {
    const levelData = progress?.[`level${levelId}`];
    if (!levelData) return 0;

    let totalProgress = 0;

    for (const moduleSlug of ALL_MODULE_SLUGS) {
      const exerciseData = levelData[moduleSlug] || {};
      const familyIds = Object.keys(exerciseData);
      if (familyIds.length > 0) {
        totalProgress += getExerciseProgress(levelId, moduleSlug, familyIds);
      }
    }

    // Divise par le nombre total de modules (pas seulement les démarrés)
    return Math.round(totalProgress / ALL_MODULE_SLUGS.length);
  }, [progress, getExerciseProgress]);

  const getRevisionFamilies = useCallback((levelId: number): any[] => {
    return filterRevisionFamilies(progress, levelId);
  }, [progress]);

  const getLastActivity = useCallback((
    levelId: number, exerciseType: string
  ): { familyId: string; progress: number; lastReviewed: number } | null => {
    const exerciseData = progress?.[`level${levelId}`]?.[exerciseType as keyof LevelProgress];
    if (!exerciseData) return null;

    let mostRecent: { familyId: string; progress: number; lastReviewed: number } | null = null;
    Object.entries(exerciseData).forEach(([familyId, family]) => {
      if (family.lastReviewed && (!mostRecent || family.lastReviewed > mostRecent.lastReviewed)) {
        mostRecent = {
          familyId,
          progress: Math.round((family.completed / family.total) * 100),
          lastReviewed: family.lastReviewed,
        };
      }
    });
    return mostRecent;
  }, [progress]);

  const getRecommendedModule = useCallback((
    levelId: number
  ): { exerciseType: string; progress: number; lastReviewed: number } | null => {
    const levelData = progress?.[`level${levelId}`];
    if (!levelData) return null;

    let mostRecent: { exerciseType: string; progress: number; lastReviewed: number } | null = null;
    Object.entries(levelData).forEach(([exerciseType, exerciseData]) => {
      Object.entries(exerciseData as ExerciseProgress).forEach(([, family]) => {
        if (family.lastReviewed && (!mostRecent || family.lastReviewed > mostRecent.lastReviewed)) {
          mostRecent = {
            exerciseType,
            progress: getExerciseProgress(levelId, exerciseType, null),
            lastReviewed: family.lastReviewed,
          };
        }
      });
    });
    return mostRecent;
  }, [progress, getExerciseProgress]);

  const value = useMemo<ProgressContextValue>(() => ({
    progress, isLoading, trackItemCompletion, saveProgressNow, refreshProgress, resetProgress,
    getFamilyProgress, getExerciseProgress, getLevelProgress,
    getRevisionFamilies, getLastActivity, getRecommendedModule
  }), [
    progress, isLoading, trackItemCompletion, saveProgressNow, refreshProgress, resetProgress,
    getFamilyProgress, getExerciseProgress, getLevelProgress,
    getRevisionFamilies, getLastActivity, getRecommendedModule
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
