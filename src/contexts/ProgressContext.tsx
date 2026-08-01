/**
 * ProgressContext - Gestion de la progression utilisateur
 * SQLite = source de vérité, AsyncStorage = cache rapide
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import { upsertProgress } from '../database/queries';
import { log } from '@/utils/logUtils';

import type { ProgressState, LevelProgress, ProgressContextValue, ExerciseProgress, RevisionFamily } from './progressTypes';
import {
  getApplicableModules,
  getStorageKey,
  parseCompositeKey,
  createInitialProgress,
  progressReducer,
  loadFromSQLite,
  filterRevisionFamilies,
} from './progressUtils';

export const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db, user } = useUser();
  const [progress, dispatch] = useReducer(progressReducer, null, () => createInitialProgress());
  const [isLoading, setIsLoading] = React.useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());

  // Priorité de chargement : SQLite (source de vérité) → AsyncStorage (cache) → migration ancienne clé
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
              const lvl = level as Record<string, ExerciseProgress>;
              lvl['phrase_types'] = lvl['sentences'];
              delete lvl['sentences'];
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

  // Auto-save débouncée (1500ms)
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
    // db and syncToSQLite intentionally omitted: syncToSQLite is defined after this effect;
    // adding it would cause unnecessary re-subscriptions on every identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, isLoading, user?.id]);

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
                last_accessed: family.lastReviewed ? new Date(family.lastReviewed).toISOString() : undefined,
              });
            }
          }
        }
        await db.execAsync('COMMIT');
      } catch (e) {
        await db.execAsync('ROLLBACK');
        throw e;
      }
    };

    const prev = saveChainRef.current;
    saveChainRef.current = prev.then(runTransaction).catch((e) => {
      log.warn('[syncToSQLite] Transaction rollback:', e);
    });
    await saveChainRef.current;
  }, [db, user]);

  const saveProgressNow = useCallback(async () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    try {
      if (user?.id) await AsyncStorage.setItem(getStorageKey(user.id), JSON.stringify(progress));
      if (progress && db) await syncToSQLite(progress);
    } catch (e) {
      log.error('[ProgressContext] Save error:', e);
    }
  }, [db, progress, syncToSQLite, user?.id]);

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

  const getFamilyProgress = useCallback((levelId: number, exerciseType: string, familyId: string): number => {
    const exerciseData = progress?.[`level${levelId}`]?.[exerciseType as keyof LevelProgress] || {};

    // familyId peut être une clé simple ("3", modules sans sous-famille) ou composite
    // ("3-1", modules avec sous-famille — vocab/phrase_types/reading/dialogues). Un appelant
    // qui ne connaît que l'id de famille brut (ex: ModuleItem, qui liste les modules par
    // famille top-level) doit quand même trouver la progression stockée sous "3-1"/"3-2".
    // On agrège donc toutes les entrées qui correspondent exactement OU qui appartiennent à
    // cette famille (préfixe "familyId-").
    const matchingEntries = Object.entries(exerciseData).filter(
      ([key]) => key === familyId || key.startsWith(`${familyId}-`)
    );
    if (matchingEntries.length === 0) return 0;

    const totalCompleted = matchingEntries.reduce((sum, [, f]) => sum + f.completed, 0);
    const totalItems = matchingEntries.reduce((sum, [, f]) => sum + f.total, 0);
    return totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
  }, [progress]);

  const getExerciseProgress = useCallback((
    levelId: number, exerciseType: string, allFamilyIds: string[] | null = null
  ): number => {
    const exerciseData = progress?.[`level${levelId}`]?.[exerciseType as keyof LevelProgress] || {};
    const ids = allFamilyIds || Object.keys(exerciseData);
    if (ids.length === 0) return 0;
    return Math.round(ids.reduce((sum, id) => sum + getFamilyProgress(levelId, exerciseType, id), 0) / ids.length);
  }, [progress, getFamilyProgress]);

  // familyIdsByModule (optionnel) : liste complète des familles existantes par module pour ce
  // niveau (touchées ou non), fournie par l'appelant — cf. Dashboard.tsx qui la récupère en
  // base, comme le fait déjà ModuleItem pour le pourcentage de module. Sans ça, seules les
  // familles déjà commencées entrent dans la moyenne (une famille jamais ouverte est absente
  // du calcul au lieu de compter 0%), ce qui gonfle le pourcentage du niveau par rapport à ce
  // que montrent les cartes famille/module en dessous.
  const getLevelProgress = useCallback((
    levelId: number, familyIdsByModule?: Record<string, string[]>
  ): number => {
    const levelData = progress?.[`level${levelId}`];
    const applicableModules = getApplicableModules(user?.audience);
    let total = 0;
    for (const slug of applicableModules) {
      const ids = familyIdsByModule?.[slug] ?? Object.keys(levelData?.[slug] || {});
      if (ids.length > 0) total += getExerciseProgress(levelId, slug, ids);
    }
    return applicableModules.length > 0 ? Math.round(total / applicableModules.length) : 0;
  }, [progress, getExerciseProgress, user?.audience]);

  const getRevisionFamilies = useCallback((levelId: number): RevisionFamily[] => {
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

  const value = useMemo<ProgressContextValue>(() => ({
    progress, isLoading, trackItemCompletion, saveProgressNow, refreshProgress, resetProgress,
    getFamilyProgress, getExerciseProgress, getLevelProgress,
    getRevisionFamilies, getLastActivity,
  }), [
    progress, isLoading, trackItemCompletion, saveProgressNow, refreshProgress, resetProgress,
    getFamilyProgress, getExerciseProgress, getLevelProgress,
    getRevisionFamilies, getLastActivity,
  ]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = (): ProgressContextValue => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within a ProgressProvider');
  return context;
};
