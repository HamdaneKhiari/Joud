/**
 * Tests de smoke — Dispatch par audience
 *
 * Vérifie que les règles pédagogiques validées sont encodées correctement
 * dans la configuration et le moteur de progression pour chaque public.
 *
 * Règles documentées (wordGamesConfig.ts) :
 *   primary → 4 jeux (definition, audio_match, speed, blanks)
 *   college → 6 jeux (+ sentence, detective)
 *   lycee   → 8 jeux (+ transformer, reply)
 *   adult   → 8 jeux (idem lycee)
 *
 * Règles de progression (progressUtils.ts) :
 *   - 8 niveaux disponibles dans le slot mémoire, indépendamment du public
 *   - createInitialProgress crée toujours les 8 slots (filtrage = côté DB)
 */

import {
  getGameTypesForAudience,
  isGameTypeAvailableFor,
  GAME_COUNT_BY_AUDIENCE,
} from '@/config/wordGamesConfig';
import type { AudienceSlug } from '@/config/wordGamesConfig';
import type { GameType } from '@/screens/WordGames/schema';

import {
  createInitialProgress,
  ALL_MODULE_SLUGS,
  progressReducer,
} from '@/contexts/progressUtils';

// ============================================
// Dispatch Word Games — Nombre de jeux par public
// ============================================

describe('Dispatch Word Games — nombre de jeux', () => {
  it('primary → 4 jeux', () => {
    expect(GAME_COUNT_BY_AUDIENCE.primary).toBe(4);
    expect(getGameTypesForAudience('primary')).toHaveLength(4);
  });

  it('college → 6 jeux', () => {
    expect(GAME_COUNT_BY_AUDIENCE.college).toBe(6);
    expect(getGameTypesForAudience('college')).toHaveLength(6);
  });

  it('lycee → 8 jeux', () => {
    expect(GAME_COUNT_BY_AUDIENCE.lycee).toBe(8);
    expect(getGameTypesForAudience('lycee')).toHaveLength(8);
  });

  it('adult → 8 jeux', () => {
    expect(GAME_COUNT_BY_AUDIENCE.adult).toBe(8);
    expect(getGameTypesForAudience('adult')).toHaveLength(8);
  });
});

// ============================================
// Dispatch Word Games — Jeux fondamentaux (tous les publics)
// ============================================

const CORE_GAMES: GameType[] = ['definition', 'audio_match', 'speed', 'blanks'];
const AUDIENCES: AudienceSlug[] = ['primary', 'college', 'lycee', 'adult'];

describe('Dispatch Word Games — jeux fondamentaux (tous publics)', () => {
  CORE_GAMES.forEach(game => {
    AUDIENCES.forEach(audience => {
      it(`"${game}" disponible pour ${audience}`, () => {
        expect(isGameTypeAvailableFor(game, audience)).toBe(true);
      });
    });
  });
});

// ============================================
// Dispatch Word Games — Jeux collège et supérieur
// ============================================

const COLLEGE_GAMES: GameType[] = ['sentence', 'detective'];

describe('Dispatch Word Games — jeux collège+', () => {
  it('primary → "sentence" non disponible', () => {
    expect(isGameTypeAvailableFor('sentence', 'primary')).toBe(false);
  });

  it('primary → "detective" non disponible', () => {
    expect(isGameTypeAvailableFor('detective', 'primary')).toBe(false);
  });

  COLLEGE_GAMES.forEach(game => {
    ['college', 'lycee', 'adult'].forEach(audience => {
      it(`"${game}" disponible pour ${audience}`, () => {
        expect(isGameTypeAvailableFor(game, audience)).toBe(true);
      });
    });
  });
});

// ============================================
// Dispatch Word Games — Jeux lycée et adulte uniquement
// ============================================

const ADVANCED_GAMES: GameType[] = ['transformer', 'reply'];

describe('Dispatch Word Games — jeux lycée/adult uniquement', () => {
  ADVANCED_GAMES.forEach(game => {
    it(`"${game}" NON disponible pour primary`, () => {
      expect(isGameTypeAvailableFor(game, 'primary')).toBe(false);
    });

    it(`"${game}" NON disponible pour college`, () => {
      expect(isGameTypeAvailableFor(game, 'college')).toBe(false);
    });

    it(`"${game}" disponible pour lycee`, () => {
      expect(isGameTypeAvailableFor(game, 'lycee')).toBe(true);
    });

    it(`"${game}" disponible pour adult`, () => {
      expect(isGameTypeAvailableFor(game, 'adult')).toBe(true);
    });
  });
});

// ============================================
// Dispatch Word Games — Audience inconnue → fallback adult
// ============================================

describe('Dispatch Word Games — audience inconnue', () => {
  it('audience inconnue → fallback sur adult (8 jeux)', () => {
    const games = getGameTypesForAudience('unknown_audience');
    expect(games).toHaveLength(8);
    expect(games).toEqual(getGameTypesForAudience('adult'));
  });
});

// ============================================
// Progression — Structure commune à tous les publics
// ============================================

describe('Progression — structure initiale commune', () => {
  it('createInitialProgress crée 8 niveaux (indépendant du public)', () => {
    const state = createInitialProgress();
    const levelKeys = Object.keys(state).filter(k => k.startsWith('level'));
    expect(levelKeys).toHaveLength(8);
  });

  it('chaque niveau contient tous les modules de ALL_MODULE_SLUGS', () => {
    const state = createInitialProgress();
    const level1 = state['level1'];
    ALL_MODULE_SLUGS.forEach(slug => {
      expect(level1).toHaveProperty(slug);
    });
  });

  it('la progression peut être trackée pour n\'importe quel niveau (1-8)', () => {
    let state = createInitialProgress();
    for (let levelId = 1; levelId <= 8; levelId++) {
      state = progressReducer(state, {
        type: 'TRACK_ITEM',
        payload: { levelId, exerciseType: 'vocab', familyId: '1', itemIndex: 0, totalItems: 5 },
      });
      expect(state[`level${levelId}`]['vocab']['1'].completed).toBe(1);
    }
  });
});

// ============================================
// ALL_MODULE_SLUGS — Cohérence avec les slugs attendus
// ============================================

describe('ALL_MODULE_SLUGS — cohérence des slugs', () => {
  const EXPECTED_MODULES = [
    'vocab',
    'phrase_types',
    'grammar',
    'dialogues',
    'reading',
    'word_games',
    'connector',
  ];

  EXPECTED_MODULES.forEach(slug => {
    it(`contient "${slug}"`, () => {
      expect(ALL_MODULE_SLUGS).toContain(slug);
    });
  });

  it('ne contient aucun doublon', () => {
    const unique = new Set(ALL_MODULE_SLUGS);
    expect(unique.size).toBe(ALL_MODULE_SLUGS.length);
  });
});

// ============================================
// Isolation entre audiences — progression indépendante
// ============================================

describe('Isolation — la progression d\'un niveau n\'affecte pas les autres', () => {
  it('tracker level1/vocab ne touche pas level2/vocab', () => {
    const initial = createInitialProgress();
    const result = progressReducer(initial, {
      type: 'TRACK_ITEM',
      payload: { levelId: 1, exerciseType: 'vocab', familyId: '1', itemIndex: 2, totalItems: 10 },
    });

    // level2 vocab doit être vide
    expect(result['level2']['vocab']).toEqual({});
  });

  it('tracker level1/vocab ne touche pas level1/grammar', () => {
    const initial = createInitialProgress();
    const result = progressReducer(initial, {
      type: 'TRACK_ITEM',
      payload: { levelId: 1, exerciseType: 'vocab', familyId: '1', itemIndex: 0, totalItems: 5 },
    });

    // grammar du même niveau doit être vide
    expect(result['level1']['grammar']).toEqual({});
  });
});
