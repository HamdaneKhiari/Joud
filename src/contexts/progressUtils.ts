/**
 * Fonctions pures pour ProgressContext
 * Reducer, initialisation, persistance SQLite, helpers de calcul
 */

import type { SQLiteDatabase } from 'expo-sqlite';
import { log } from '@/utils/logUtils';
import type {
  ProgressState, LevelProgress, ExerciseProgress,
  ProgressAction, TrackItemPayload, RevisionFamily,
} from './progressTypes';

export const ALL_MODULE_SLUGS = [
  'vocab', 'phrase_types', 'reading', 'dialogues',
  'word_games', 'connector',
];

const MAX_LEVELS = 8;

// connector n'est disponible que pour lycee/adult (cf. seed module_availability,
// migration 002) — à garder synchronisé si la disponibilité par audience change en base.
export const getApplicableModules = (audience?: string): string[] =>
  ALL_MODULE_SLUGS.filter(slug => slug !== 'connector' || audience === 'lycee' || audience === 'adult');

export const getStorageKey = (userId: string) => `JOUD_PROGRESS_${userId}`;

export const parseCompositeKey = (key: string): { familyId: number; subfamilyId: number } => {
  if (key.includes('-')) {
    const [fam, sub] = key.split('-');
    return { familyId: Number(fam), subfamilyId: Number(sub) || 0 };
  }
  return { familyId: Number(key), subfamilyId: 0 };
};

export const makeCompositeFamilyId = (familyId: string | number, subfamilyId: string | number): string =>
  `${familyId}-${subfamilyId}`;

export const createEmptyLevelProgress = (): LevelProgress => {
  const lp: Record<string, ExerciseProgress> = {};
  ALL_MODULE_SLUGS.forEach(slug => { lp[slug] = {}; });
  return lp as LevelProgress;
};

export const createInitialProgress = (): ProgressState => {
  const base: ProgressState = {};
  for (let i = 1; i <= MAX_LEVELS; i++) {
    base[`level${i}`] = createEmptyLevelProgress();
  }
  return base;
};

export const progressReducer = (state: ProgressState, action: ProgressAction): ProgressState => {
  switch (action.type) {
    case 'SET_PROGRESS':
      return action.payload as ProgressState;

    case 'TRACK_ITEM': {
      if (!action.payload) return state;
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
              lastReviewed: Date.now(),
            },
          },
        },
      };
    }

    default:
      return state;
  }
};

export const loadFromSQLite = async (
  db: SQLiteDatabase,
  userId: string
): Promise<ProgressState | null> => {
  try {
    const rows = await db.getAllAsync<{
      family_id: number; subfamily_id: number; level: number;
      completed: number; total: number; last_accessed: string; module_slug: string;
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
      const moduleSlug = row.module_slug;
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

export const filterRevisionFamilies = (progress: ProgressState | null, levelId: number): RevisionFamily[] => {
  if (!progress) return [];
  const levelData = progress[`level${levelId}`];
  if (!levelData) return [];

  const families: RevisionFamily[] = [];
  Object.entries(levelData).forEach(([exerciseType, exerciseData]) => {
    Object.entries(exerciseData as ExerciseProgress).forEach(([familyId, family]) => {
      if (family.completed > 0) {
        families.push({ exerciseType, familyId, ...family });
      }
    });
  });
  return families;
};
