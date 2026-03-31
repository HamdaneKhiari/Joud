/**
 * Tests unitaires — progressUtils.ts
 * Couvre : parseCompositeKey, createEmptyLevelProgress, createInitialProgress,
 *          progressReducer, filterRevisionFamilies
 */

import {
  parseCompositeKey,
  createEmptyLevelProgress,
  createInitialProgress,
  progressReducer,
  filterRevisionFamilies,
  getStorageKey,
  ALL_MODULE_SLUGS,
} from '@/contexts/progressUtils';
import type { ProgressState } from '@/contexts/progressTypes';

// ============================================
// getStorageKey
// ============================================

describe('getStorageKey', () => {
  it('génère une clé unique par userId', () => {
    expect(getStorageKey('user123')).toBe('JOUD_PROGRESS_user123');
    expect(getStorageKey('abc')).toBe('JOUD_PROGRESS_abc');
  });

  it('deux userId différents → clés différentes', () => {
    expect(getStorageKey('user1')).not.toBe(getStorageKey('user2'));
  });
});

// ============================================
// parseCompositeKey
// ============================================

describe('parseCompositeKey', () => {
  it('clé simple → familyId seul, subfamilyId = 0', () => {
    expect(parseCompositeKey('42')).toEqual({ familyId: 42, subfamilyId: 0 });
  });

  it('clé composite "familyId-subfamilyId" → décomposition correcte', () => {
    expect(parseCompositeKey('12-3')).toEqual({ familyId: 12, subfamilyId: 3 });
  });

  it('clé "5-0" → subfamilyId = 0', () => {
    expect(parseCompositeKey('5-0')).toEqual({ familyId: 5, subfamilyId: 0 });
  });

  it('clé "1-1" → familyId 1, subfamilyId 1', () => {
    expect(parseCompositeKey('1-1')).toEqual({ familyId: 1, subfamilyId: 1 });
  });

  it('clé sans tiret "7" → familyId 7, subfamilyId 0', () => {
    expect(parseCompositeKey('7')).toEqual({ familyId: 7, subfamilyId: 0 });
  });
});

// ============================================
// createEmptyLevelProgress
// ============================================

describe('createEmptyLevelProgress', () => {
  it('contient tous les modules déclarés dans ALL_MODULE_SLUGS', () => {
    const lp = createEmptyLevelProgress();
    ALL_MODULE_SLUGS.forEach(slug => {
      expect(lp).toHaveProperty(slug);
    });
  });

  it('chaque module est initialisé avec un objet vide', () => {
    const lp = createEmptyLevelProgress();
    ALL_MODULE_SLUGS.forEach(slug => {
      expect(lp[slug]).toEqual({});
    });
  });

  it('contient exactement les 7 modules attendus', () => {
    expect(ALL_MODULE_SLUGS).toHaveLength(7);
    expect(ALL_MODULE_SLUGS).toContain('vocab');
    expect(ALL_MODULE_SLUGS).toContain('grammar');
    expect(ALL_MODULE_SLUGS).toContain('phrase_types');
    expect(ALL_MODULE_SLUGS).toContain('reading');
    expect(ALL_MODULE_SLUGS).toContain('dialogues');
    expect(ALL_MODULE_SLUGS).toContain('word_games');
    expect(ALL_MODULE_SLUGS).toContain('connector');
  });
});

// ============================================
// createInitialProgress
// ============================================

describe('createInitialProgress', () => {
  it('crée 8 niveaux (level1 → level8)', () => {
    const state = createInitialProgress();
    for (let i = 1; i <= 8; i++) {
      expect(state).toHaveProperty(`level${i}`);
    }
  });

  it('ne crée pas de niveau 0 ni de niveau 9', () => {
    const state = createInitialProgress();
    expect(state).not.toHaveProperty('level0');
    expect(state).not.toHaveProperty('level9');
  });

  it('chaque niveau contient les modules vides', () => {
    const state = createInitialProgress();
    ALL_MODULE_SLUGS.forEach(slug => {
      expect(state['level1']).toHaveProperty(slug);
      expect(state['level1'][slug]).toEqual({});
    });
  });
});

// ============================================
// progressReducer — SET_PROGRESS
// ============================================

describe('progressReducer — SET_PROGRESS', () => {
  const initial = createInitialProgress();

  it('remplace tout l\'état par le payload', () => {
    const newState: ProgressState = {
      level1: { vocab: { '5': { completed: 3, total: 10 } } } as ProgressState['level1'],
    };
    const result = progressReducer(initial, { type: 'SET_PROGRESS', payload: newState });
    expect(result).toEqual(newState);
  });

  it('ne mute pas l\'état précédent', () => {
    const newState: ProgressState = { level2: { grammar: {} } as ProgressState['level2'] };
    const result = progressReducer(initial, { type: 'SET_PROGRESS', payload: newState });
    expect(result).not.toBe(initial);
  });
});

// ============================================
// progressReducer — TRACK_ITEM
// ============================================

describe('progressReducer — TRACK_ITEM', () => {
  const initial = createInitialProgress();

  it('enregistre la progression d\'un item au bon endroit', () => {
    const result = progressReducer(initial, {
      type: 'TRACK_ITEM',
      payload: { levelId: 1, exerciseType: 'vocab', familyId: '5', itemIndex: 2, totalItems: 10 },
    });
    const entry = result['level1']['vocab']['5'];
    expect(entry).toBeDefined();
    expect(entry.completed).toBe(3); // itemIndex + 1
    expect(entry.total).toBe(10);
    expect(entry.lastReviewed).toBeGreaterThan(0);
  });

  it('completed = itemIndex + 1 (ex: index 0 → completed 1)', () => {
    const result = progressReducer(initial, {
      type: 'TRACK_ITEM',
      payload: { levelId: 1, exerciseType: 'grammar', familyId: '8', itemIndex: 0, totalItems: 5 },
    });
    expect(result['level1']['grammar']['8'].completed).toBe(1);
  });

  it('ne modifie pas les autres modules du même niveau', () => {
    const result = progressReducer(initial, {
      type: 'TRACK_ITEM',
      payload: { levelId: 1, exerciseType: 'vocab', familyId: '1', itemIndex: 0, totalItems: 5 },
    });
    expect(result['level1']['grammar']).toEqual({});
    expect(result['level1']['reading']).toEqual({});
  });

  it('ne modifie pas les autres niveaux', () => {
    const result = progressReducer(initial, {
      type: 'TRACK_ITEM',
      payload: { levelId: 1, exerciseType: 'vocab', familyId: '1', itemIndex: 0, totalItems: 5 },
    });
    expect(result['level2']['vocab']).toEqual({});
    expect(result['level3']['vocab']).toEqual({});
  });

  it('met à jour une entrée existante sans effacer les autres familles', () => {
    const stateWithData = progressReducer(initial, {
      type: 'TRACK_ITEM',
      payload: { levelId: 1, exerciseType: 'vocab', familyId: '3', itemIndex: 4, totalItems: 10 },
    });
    const result = progressReducer(stateWithData, {
      type: 'TRACK_ITEM',
      payload: { levelId: 1, exerciseType: 'vocab', familyId: '7', itemIndex: 1, totalItems: 8 },
    });
    expect(result['level1']['vocab']['3'].completed).toBe(5);
    expect(result['level1']['vocab']['7'].completed).toBe(2);
  });

  it('utilise une clé composite pour les sous-familles', () => {
    const result = progressReducer(initial, {
      type: 'TRACK_ITEM',
      payload: { levelId: 2, exerciseType: 'phrase_types', familyId: '10-2', itemIndex: 5, totalItems: 20 },
    });
    expect(result['level2']['phrase_types']['10-2']).toBeDefined();
    expect(result['level2']['phrase_types']['10-2'].completed).toBe(6);
  });

  it('ne modifie pas l\'état pour une action inconnue', () => {
    const result = progressReducer(initial, { type: 'UNKNOWN_ACTION' } as unknown as Parameters<typeof progressReducer>[1]);
    expect(result).toBe(initial);
  });
});

// ============================================
// filterRevisionFamilies
// ============================================

describe('filterRevisionFamilies', () => {
  it('retourne [] si progress est null', () => {
    expect(filterRevisionFamilies(null, 1)).toEqual([]);
  });

  it('retourne [] si le level n\'existe pas', () => {
    const state = createInitialProgress();
    expect(filterRevisionFamilies(state, 99)).toEqual([]);
  });

  it('retourne [] si aucune famille n\'a de progression', () => {
    const state = createInitialProgress();
    expect(filterRevisionFamilies(state, 1)).toEqual([]);
  });

  it('retourne les familles avec completed > 0', () => {
    const state = progressReducer(createInitialProgress(), {
      type: 'TRACK_ITEM',
      payload: { levelId: 1, exerciseType: 'vocab', familyId: '5', itemIndex: 2, totalItems: 10 },
    });
    const families = filterRevisionFamilies(state, 1);
    expect(families).toHaveLength(1);
    expect(families[0].familyId).toBe('5');
    expect(families[0].exerciseType).toBe('vocab');
    expect(families[0].completed).toBe(3);
  });

  it('retourne toutes les familles de tous les modules du niveau', () => {
    let state = createInitialProgress();
    state = progressReducer(state, {
      type: 'TRACK_ITEM',
      payload: { levelId: 1, exerciseType: 'vocab', familyId: '1', itemIndex: 0, totalItems: 5 },
    });
    state = progressReducer(state, {
      type: 'TRACK_ITEM',
      payload: { levelId: 1, exerciseType: 'grammar', familyId: '2', itemIndex: 1, totalItems: 8 },
    });
    const families = filterRevisionFamilies(state, 1);
    expect(families).toHaveLength(2);
    expect(families.map(f => f.exerciseType)).toContain('vocab');
    expect(families.map(f => f.exerciseType)).toContain('grammar');
  });

  it('n\'inclut pas les familles d\'un autre niveau', () => {
    const state = progressReducer(createInitialProgress(), {
      type: 'TRACK_ITEM',
      payload: { levelId: 2, exerciseType: 'vocab', familyId: '5', itemIndex: 0, totalItems: 5 },
    });
    expect(filterRevisionFamilies(state, 1)).toHaveLength(0);
    expect(filterRevisionFamilies(state, 2)).toHaveLength(1);
  });

  it('chaque entrée contient exerciseType, familyId, completed, total, lastReviewed', () => {
    const state = progressReducer(createInitialProgress(), {
      type: 'TRACK_ITEM',
      payload: { levelId: 1, exerciseType: 'reading', familyId: '9', itemIndex: 3, totalItems: 12 },
    });
    const [entry] = filterRevisionFamilies(state, 1);
    expect(entry).toHaveProperty('exerciseType', 'reading');
    expect(entry).toHaveProperty('familyId', '9');
    expect(entry).toHaveProperty('completed', 4);
    expect(entry).toHaveProperty('total', 12);
    expect(entry).toHaveProperty('lastReviewed');
  });
});
