/**
 * ProgressContext - Gestion de la progression utilisateur
 * SQLite = source de vérité, AsyncStorage = cache rapide
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import { upsertProgress } from '../database/queries';
import { log } from '@/utils/logUtils';

import type { ProgressState, LevelProgress, ProgressContextValue } from './progressTypes';
import {
  ALL_MODULE_SLUGS,
  getStorageKey,
  parseCompositeKey,
  createInitialProgress,
  progressReducer,
  loadFromSQLite,
  filterRevisionFamilies,
} from './progressUtils';

// ============================================
// CONTEXT
// ============================================

export const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db, user } = useUser();
  const [progress, dispatch] = useReducer(progressReducer, null, () => createInitialProgress());
  const [isLoading, setIsLoading] = React.useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());

  // =================== CHARGEMENT ===================
  // Priorité : SQLite (source de vérité) → AsyncStorage (cache) → migration ancienne clé
  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setIsLoading(false); return; }

      try {
        if (db) {
          const sqliteState = await loadFromSQLite(db, user.id);
          if (sqliteState) {
            dispatch({ type: 'SET_PROGRESS', payload: sqliteState });
            await AsyncStorage.setItem(getStorageKey(user.id), JSON.stringify(sqliteState));
            setIsLoading(false);
            return;
          }
        }

        const saved = await AsyncStorage.getItem(getStorageKey(user.id));
        if (saved) {
          const parsed = JSON.parse(saved) as ProgressState;
          // Migration: "sentences" → "phrase_types"
          for (const levelKey of Object.keys(parsed)) {
            const level = parsed[levelKey];
            if (level && 'sentences' in level && !('phrase_types' in level)) {
              (level as any).phrase_types = (level as any).sentences;
              delete (level as any).sentences;
            }
          }
          dispatch({ type: 'SET_PROGRESS', payload: parsed });
        }

        // Migration ancienne clé non scopée
        const oldKey = 'JOUDPRIMARY_PROGRESS';
        const oldSaved = await AsyncStorage.getItem(oldKey);
        if (oldSaved && !saved) {
          await AsyncStorage.setItem(getStorageKey(user.id), oldSaved);
          await AsyncStorage.removeItem(oldKey);
          dispatch({ type: 'SET_PROGRESS', payload: JSON.parse(oldSaved) as ProgressState });
        }
      } catch (e) {
        log.error('[ProgressContext] Load error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [db, user?.id]);

  // =================== AUTO-SAVE (debounced 1500ms) ===================
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

    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [progress, isLoading, user?.id]);

  // =================== SYNC SQLITE ===================
  // Série les appels pour éviter "cannot start a transaction within a transaction"
  // (ex: auto-save + useExerciseSaveOnUnmount déclenchés en parallèle)
  const syncToSQLite = useCallback(async (state: ProgressState) => {
    if (!db || typeof db === 'number' || !user) return;

    const runTransaction = async () => {
      await db.execAsync('BEGIN TRANSACTION');
      try {
        for (const [levelKey, levelData] of Object.entries(state)) {
          const levelNum = Number.parseInt(levelKey.replace('level', ''), 10);
          if (Number.isNaN(levelNum) || !levelData) continue;

          for (const [, exerciseData] of Object.entries(levelData)) {
            for (const [compositeKey, family] of Object.entries(exerciseData)) {
              if (!family || family.total === 0) continue;
              const { familyId, subfamilyId } = parseCompositeKey(compositeKey);
              if (Number.isNaN(familyId) || familyId <= 0) continue;
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
        await db.execAsync('COMMIT');
      } catch (e) {
        await db.execAsync('ROLLBACK');
        log.warn('[syncToSQLite] Transaction rollback:', e);
      }
    };

    const prev = saveChainRef.current;
    saveChainRef.current = prev.then(runTransaction);
    await saveChainRef.current;
  }, [db, user]);

  // =================== ACTIONS ===================
  const saveProgressNow = useCallback(async () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    try {
      if (user?.id) await AsyncStorage.setItem(getStorageKey(user.id), JSON.stringify(progress));
      if (progress && db) await syncToSQLite(progress);
    } catch (e) {
      log.error('[ProgressContext] Save error:', e);
    }
  }, [progress, syncToSQLite, user?.id]);

  const refreshProgress = useCallback(async () => {
    if (!db || typeof db === 'number' || !user?.id) return;
    const freshState = await loadFromSQLite(db, user.id);
    if (freshState) dispatch({ type: 'SET_PROGRESS', payload: freshState });
  }, [db, user?.id]);

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

  const trackItemCompletion = useCallback((
    levelId: number, exerciseType: string, familyId: string,
    itemIndex: number, totalItems: number
  ) => {
    dispatch({ type: 'TRACK_ITEM', payload: { levelId, exerciseType, familyId, itemIndex, totalItems } });
  }, []);

  // =================== CALCULS ===================
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
    return Math.round(ids.reduce((sum, id) => sum + getFamilyProgress(levelId, exerciseType, id), 0) / ids.length);
  }, [progress, getFamilyProgress]);

  const getLevelProgress = useCallback((levelId: number): number => {
    const levelData = progress?.[`level${levelId}`];
    if (!levelData) return 0;
    let total = 0;
    for (const slug of ALL_MODULE_SLUGS) {
      const ids = Object.keys(levelData[slug] || {});
      if (ids.length > 0) total += getExerciseProgress(levelId, slug, ids);
    }
    return Math.round(total / ALL_MODULE_SLUGS.length);
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
        mostRecent = { familyId, progress: Math.round((family.completed / family.total) * 100), lastReviewed: family.lastReviewed };
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
      Object.values(exerciseData).forEach(family => {
        if (family.lastReviewed && (!mostRecent || family.lastReviewed > mostRecent.lastReviewed)) {
          mostRecent = { exerciseType, progress: getExerciseProgress(levelId, exerciseType, null), lastReviewed: family.lastReviewed };
        }
      });
    });
    return mostRecent;
  }, [progress, getExerciseProgress]);

  const value = useMemo<ProgressContextValue>(() => ({
    progress, isLoading, trackItemCompletion, saveProgressNow, refreshProgress, resetProgress,
    getFamilyProgress, getExerciseProgress, getLevelProgress,
    getRevisionFamilies, getLastActivity, getRecommendedModule,
  }), [
    progress, isLoading, trackItemCompletion, saveProgressNow, refreshProgress, resetProgress,
    getFamilyProgress, getExerciseProgress, getLevelProgress,
    getRevisionFamilies, getLastActivity, getRecommendedModule,
  ]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = (): ProgressContextValue => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within a ProgressProvider');
  return context;
};
