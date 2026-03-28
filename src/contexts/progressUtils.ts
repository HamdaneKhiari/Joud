/**
 * Fonctions pures pour ProgressContext
 * Reducer, initialisation, persistance SQLite, helpers de calcul
 */

import type { SQLiteDatabase } from 'expo-sqlite';
import { log } from '@/utils/logUtils';
import type {
  ProgressState, LevelProgress, ExerciseProgress,
  ProgressAction, TrackItemPayload,
} from './progressTypes';

// ============================================
// CONSTANTS
// ============================================

export const ALL_MODULE_SLUGS = [
  'vocab', 'grammar', 'phrase_types', 'reading', 'dialogues',
  'word_games', 'connector',
];

const MAX_LEVELS = 8;

// ============================================
// STORAGE KEY
// ============================================

export const getStorageKey = (userId: string) => `JOUD_PROGRESS_${userId}`;

// ============================================
// COMPOSITE KEY PARSING
// ============================================

export const parseCompositeKey = (key: string): { familyId: number; subfamilyId: number } => {
  if (key.includes('-')) {
    const [fam, sub] = key.split('-');
    return { familyId: Number(fam), subfamilyId: Number(sub) || 0 };
  }
  return { familyId: Number(key), subfamilyId: 0 };
};

// ============================================
// STATE INITIALISATION
// ============================================

export const createEmptyLevelProgress = (): LevelProgress => {
  const lp: any = {};
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

// ============================================
// REDUCER
// ============================================

export const progressReducer = (state: ProgressState, action: ProgressAction): ProgressState => {
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

// ============================================
// SQLITE LOADING
// ============================================

export const loadFromSQLite = async (
  db: SQLiteDatabase,
  userId: string
): Promise<ProgressState | null> => {
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

// ============================================
// REVISION HELPER
// ============================================

export const filterRevisionFamilies = (progress: ProgressState | null, levelId: number): any[] => {
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
