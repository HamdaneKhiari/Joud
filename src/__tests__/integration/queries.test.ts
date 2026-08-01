/**
 * Tests d'intégration — database/queries.ts
 * Utilise le mock expo-sqlite (src/__mocks__/expo-sqlite.ts)
 * Vérifie que chaque query appelle bien le bon SQL avec les bons paramètres
 * et transforme correctement les résultats.
 */

import { openDatabaseAsync } from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import {
  upsertProgress,
  getProgressByFamily,
  getAggregatedFamilyProgress,
  getLevelsByAudience,
  getFamiliesForModule,
  getModuleLabel,
  getModuleLabelWithFallback,
  getLevelLabel,
  getLevelLabelWithFallback,
  getIdentityPalette,
  getAvailableModules,
  isModuleAvailable,
  getModulesByAudience,
  getModuleBySlug,
  getFamiliesByModuleAndLevel,
  getContentByFamilyAndLevel,
  getBrandingById,
  getRecentActivity,
  getFeedbackMessage,
  getFeedbackMessagesByContext,
  getDailyWord,
  getUserBadges,
  getWordsToReview,
  getUserMetrics,
  updateUserMetrics,
  getDailyReviewWords,
  getSpacedReviewWords,
  addWordToSRS,
  updateSpacedRepetitionResult,
  getSpacedReviewCount,
  calculateUserMetrics,
  insertContent,
} from '@/database/queries';

// ============================================
// Setup mock DB
// ============================================

let db: SQLiteDatabase;

beforeEach(async () => {
  db = await openDatabaseAsync('test.db') as unknown as SQLiteDatabase;
  // Réinitialise les mocks entre chaque test
  jest.clearAllMocks();
});

// ============================================
// upsertProgress
// ============================================

describe('upsertProgress', () => {
  it('appelle runAsync avec le bon SQL INSERT OR REPLACE', async () => {
    const progress = {
      user_id: 'user1',
      family_id: 5,
      subfamily_id: 2,
      level: 1,
      completed: 3,
      total: 10,
      score: 30,
    };

    await upsertProgress(db, progress);

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO progress'),
      expect.arrayContaining([
        'user1', 5, 2, 1, 3, 10, 30, expect.any(String),
      ])
    );
  });

  it('inclut le last_accessed (ISO string)', async () => {
    const before = Date.now();
    await upsertProgress(db, {
      user_id: 'u1', family_id: 1, subfamily_id: 0, level: 1,
      completed: 1, total: 5, score: 20,
    });
    const after = Date.now();

    const callArgs = (db.runAsync as jest.Mock).mock.calls[0][1] as unknown[];
    const lastAccessed = new Date(callArgs[7] as string).getTime();
    expect(lastAccessed).toBeGreaterThanOrEqual(before);
    expect(lastAccessed).toBeLessThanOrEqual(after);
  });

  it('inclut subfamily_id = 0 pour les modules sans sous-familles', async () => {
    await upsertProgress(db, {
      user_id: 'u1', family_id: 3, subfamily_id: 0, level: 2,
      completed: 5, total: 5, score: 100,
    });

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining([0])
    );
  });
});

// ============================================
// getProgressByFamily
// ============================================

describe('getProgressByFamily', () => {
  it('appelle getAllAsync avec user_id et family_id', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getProgressByFamily(db, 'user1', 5);

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE user_id = ? AND family_id = ?'),
      expect.arrayContaining(['user1', 5])
    );
  });

  it('inclut subfamily_id dans la query si fourni', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getProgressByFamily(db, 'user1', 5, 2);

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('subfamily_id'),
      expect.arrayContaining(['user1', 5, 2])
    );
  });

  it('ne filtre pas sur subfamily_id si non fourni', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getProgressByFamily(db, 'user1', 5);

    const sql = (db.getAllAsync as jest.Mock).mock.calls[0][0] as string;
    expect(sql).not.toContain('subfamily_id');
  });

  it('retourne les données de la DB', async () => {
    const mockData = [{ id: 1, user_id: 'u1', family_id: 5, completed: 3, total: 10 }];
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce(mockData);

    const result = await getProgressByFamily(db, 'u1', 5);
    expect(result).toEqual(mockData);
  });
});

// ============================================
// getAggregatedFamilyProgress
// ============================================

describe('getAggregatedFamilyProgress', () => {
  it('retourne completed et total agrégés', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce({ completed: 15, total: 40 });

    const result = await getAggregatedFamilyProgress(db, 'u1', 3, 1);
    expect(result).toEqual({ completed: 15, total: 40 });
  });

  it('retourne { completed: 0, total: 0 } si aucune donnée', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);

    const result = await getAggregatedFamilyProgress(db, 'u1', 99, 1);
    expect(result).toEqual({ completed: 0, total: 0 });
  });

  it('passe user_id, family_id et level à la query', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce({ completed: 0, total: 0 });
    await getAggregatedFamilyProgress(db, 'user42', 7, 3);

    expect(db.getFirstAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['user42', 7, 3])
    );
  });
});

// ============================================
// getLevelsByAudience
// ============================================

describe('getLevelsByAudience', () => {
  it('filtre par audience', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getLevelsByAudience(db, 'primary');

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE target_audience = ?'),
      ['primary']
    );
  });

  it('retourne les niveaux triés', async () => {
    const levels = [{ level: 1 }, { level: 2 }];
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce(levels);

    const result = await getLevelsByAudience(db, 'college');
    expect(result).toEqual(levels);
  });

  it('retourne [] en cas d\'erreur SQL', async () => {
    (db.getAllAsync as jest.Mock).mockRejectedValueOnce(new Error('DB not ready'));

    const result = await getLevelsByAudience(db, 'adult');
    expect(result).toEqual([]);
  });
});

// ============================================
// getFamiliesForModule
// ============================================

describe('getFamiliesForModule', () => {
  it('filtre par module_slug', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getFamiliesForModule(db, 'vocab');

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE module_slug = ?'),
      ['vocab']
    );
  });

  it('retourne les familles triées par order_index', async () => {
    const sql = (await (async () => {
      (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
      await getFamiliesForModule(db, 'reading');
      return (db.getAllAsync as jest.Mock).mock.calls[0][0] as string;
    })());
    expect(sql).toContain('ORDER BY order_index');
  });
});

// ============================================
// getModuleLabel
// ============================================

describe('getModuleLabel', () => {
  it('appelle getFirstAsync avec module_slug et identity_id', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);
    await getModuleLabel(db, 'vocab', 'primary');

    expect(db.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE module_slug = ? AND identity_id = ?'),
      ['vocab', 'primary']
    );
  });

  it('retourne le label trouvé', async () => {
    const mockLabel = { id: 1, module_slug: 'vocab', identity_id: 'primary', display_title: 'Vocabulaire' };
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(mockLabel);

    const result = await getModuleLabel(db, 'vocab', 'primary');
    expect(result).toEqual(mockLabel);
  });

  it('retourne null si non trouvé', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);

    const result = await getModuleLabel(db, 'unknown', 'primary');
    expect(result).toBeNull();
  });
});

// ============================================
// getModuleLabelWithFallback
// ============================================

describe('getModuleLabelWithFallback', () => {
  it('retourne le label spécifique s\'il existe', async () => {
    const mockLabel = {
      id: 1, module_slug: 'vocab', identity_id: 'primary',
      display_title: 'Vocabulaire', display_description: 'Apprends du vocab', icon_name: 'book'
    };
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(mockLabel);

    const result = await getModuleLabelWithFallback(db, 'vocab', 'primary');
    expect(result.display_title).toBe('Vocabulaire');
    expect(result.icon_name).toBe('book');
  });

  it('fallback sur le module si pas de label spécifique', async () => {
    // Premier appel (getModuleLabel) → null
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);
    // Deuxième appel (getModuleBySlug) → module
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce({
      slug: 'vocab', name: 'Vocabulary', display_title: 'My Vocab',
      display_description: 'desc', icon_name: 'star', icon: 'star'
    });

    const result = await getModuleLabelWithFallback(db, 'vocab', 'adult');
    expect(result.display_title).toBe('My Vocab');
  });

  it('fallback ultime si ni label ni module trouvé', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValue(null);

    const result = await getModuleLabelWithFallback(db, 'unknown_slug', 'adult');
    expect(result.display_title).toBe('unknown_slug');
    expect(result.icon_name).toBe('book');
  });
});

// ============================================
// getLevelLabel
// ============================================

describe('getLevelLabel', () => {
  it('appelle getFirstAsync avec level_number et identity_id', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);
    await getLevelLabel(db, 1, 'primary');

    expect(db.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE level_number = ? AND identity_id = ?'),
      [1, 'primary']
    );
  });

  it('retourne le label trouvé', async () => {
    const mockLabel = { id: 1, level_number: 1, identity_id: 'primary', display_title: 'Les Bases' };
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(mockLabel);

    const result = await getLevelLabel(db, 1, 'primary');
    expect(result).toEqual(mockLabel);
  });
});

// ============================================
// getLevelLabelWithFallback
// ============================================

describe('getLevelLabelWithFallback', () => {
  it('retourne le label spécifique s\'il existe', async () => {
    const mockLabel = {
      id: 1, level_number: 1, identity_id: 'primary',
      display_title: 'Les Bases', badge_text: 'N1', display_description: 'Pour démarrer'
    };
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(mockLabel);

    const result = await getLevelLabelWithFallback(db, 1, 'primary');
    expect(result.display_title).toBe('Les Bases');
    expect(result.badge_text).toBe('N1');
  });

  it('fallback sur les données du level si pas de label', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([{
      level: 2, title: 'Niveau 2 Titre', display_title: 'L\'Essentiel',
      badge: 'N2', description: 'desc', display_description: 'desc2'
    }]);

    const result = await getLevelLabelWithFallback(db, 2, 'college');
    expect(result.display_title).toBe('L\'Essentiel');
    expect(result.badge_text).toBe('N2');
  });

  it('fallback ultime avec "Niveau N" si rien trouvé', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);

    const result = await getLevelLabelWithFallback(db, 5, 'adult');
    expect(result.display_title).toBe('Niveau 5');
    expect(result.badge_text).toBe('N5');
  });
});

// ============================================
// getIdentityPalette
// ============================================

describe('getIdentityPalette', () => {
  it('retourne un tableau de color_value', async () => {
    const mockPalette = [
      { id: 1, identity_id: 'primary', color_index: 0, color_value: '#FF5733' },
      { id: 2, identity_id: 'primary', color_index: 1, color_value: '#33FF57' },
      { id: 3, identity_id: 'primary', color_index: 2, color_value: '#3357FF' },
    ];
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce(mockPalette);

    const result = await getIdentityPalette(db, 'primary');
    expect(result).toEqual(['#FF5733', '#33FF57', '#3357FF']);
  });

  it('retourne [] si aucune palette', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);

    const result = await getIdentityPalette(db, 'unknown');
    expect(result).toEqual([]);
  });

  it('filtre par identity_id', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getIdentityPalette(db, 'lycee');

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE identity_id = ?'),
      ['lycee']
    );
  });

  it('trie par color_index', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getIdentityPalette(db, 'adult');

    const sql = (db.getAllAsync as jest.Mock).mock.calls[0][0] as string;
    expect(sql).toContain('ORDER BY color_index');
  });
});

// ============================================
// getAvailableModules
// ============================================

describe('getAvailableModules', () => {
  it('retourne les slugs des modules disponibles', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([
      { slug: 'vocab' }, { slug: 'reading' }, { slug: 'phrase_types' }
    ]);

    const result = await getAvailableModules(db, 'primary', 1);
    expect(result).toEqual(['vocab', 'reading', 'phrase_types']);
  });

  it('passe identity_id et level_number à la query', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getAvailableModules(db, 'lycee', 3);

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['lycee', 3])
    );
  });

  it("ne filtre plus par slug (le module assessment n'existe plus en base)", async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getAvailableModules(db, 'adult', 1);

    const sql = (db.getAllAsync as jest.Mock).mock.calls[0][0] as string;
    expect(sql).not.toContain('slug !=');
  });

  it('retourne [] si aucun module disponible', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);

    const result = await getAvailableModules(db, 'unknown', 99);
    expect(result).toEqual([]);
  });
});

// ============================================
// isModuleAvailable
// ============================================

describe('isModuleAvailable', () => {
  it('retourne true si count > 0', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce({ count: 1 });

    const result = await isModuleAvailable(db, 'vocab', 'primary', 1);
    expect(result).toBe(true);
  });

  it('retourne false si count = 0', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce({ count: 0 });

    const result = await isModuleAvailable(db, 'connector', 'primary', 1);
    expect(result).toBe(false);
  });

  it('retourne false si résultat null', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);

    const result = await isModuleAvailable(db, 'word_games', 'primary', 1);
    expect(result).toBe(false);
  });
});

// ============================================
// getModulesByAudience
// ============================================

describe('getModulesByAudience', () => {
  it('inclut les modules pour cette audience et les modules "all"', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getModulesByAudience(db, 'college');

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining("target_audience = ? OR target_audience = 'all'"),
      ['college']
    );
  });
});

// ============================================
// getModuleBySlug
// ============================================

describe('getModuleBySlug', () => {
  it('retourne le module correspondant', async () => {
    const mockModule = { id: 1, slug: 'vocab', name: 'Vocabulary' };
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(mockModule);

    const result = await getModuleBySlug(db, 'vocab');
    expect(result).toEqual(mockModule);
  });

  it('retourne null si module non trouvé', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);

    const result = await getModuleBySlug(db, 'nonexistent');
    expect(result).toBeNull();
  });
});

// ============================================
// getFamiliesByModuleAndLevel
// ============================================

describe('getFamiliesByModuleAndLevel', () => {
  it('appelle getAllAsync avec le bon module slug et level', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getFamiliesByModuleAndLevel(db, 'vocab', 2);
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('module_slug = ? AND c.level = ?'),
      ['vocab', 2]
    );
  });
});

// ============================================
// getContentByFamilyAndLevel
// ============================================

describe('getContentByFamilyAndLevel', () => {
  it('sans audience → query simple', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getContentByFamilyAndLevel(db, 1, 1);
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('family_id = ? AND level = ?'),
      [1, 1]
    );
  });

  it('avec audience → filtre target_audience', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getContentByFamilyAndLevel(db, 1, 1, 'adult');
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('target_audience'),
      [1, 1, 'adult']
    );
  });
});

// ============================================
// getBrandingById
// ============================================

describe('getBrandingById', () => {
  it('retourne le branding correspondant', async () => {
    const brand = { id: 'jana', primary_color: '#1F6FEB' };
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(brand);
    const result = await getBrandingById(db, 'jana');
    expect(result).toEqual(brand);
  });

  it('retourne null si erreur DB', async () => {
    (db.getFirstAsync as jest.Mock).mockRejectedValueOnce(new Error('not ready'));
    const result = await getBrandingById(db, 'jana');
    expect(result).toBeNull();
  });
});

// ============================================
// getRecentActivity
// ============================================

describe('getRecentActivity', () => {
  it('utilise la limite par défaut 10', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getRecentActivity(db);
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('LIMIT ?'),
      [10]
    );
  });

  it('utilise la limite personnalisée', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getRecentActivity(db, 5);
    expect(db.getAllAsync).toHaveBeenCalledWith(expect.any(String), [5]);
  });
});

// ============================================
// getFeedbackMessage / getFeedbackMessagesByContext
// ============================================

describe('getFeedbackMessage', () => {
  it('requête avec identityId, context, state', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);
    await getFeedbackMessage(db, 'jana', 'exercise', 'correct');
    expect(db.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('feedback_messages'),
      ['jana', 'exercise', 'correct']
    );
  });
});

describe('getFeedbackMessagesByContext', () => {
  it('retourne tous les feedbacks pour un contexte', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([{ id: 1 }]);
    const result = await getFeedbackMessagesByContext(db, 'jana', 'exercise');
    expect(result).toHaveLength(1);
  });
});

// ============================================
// getDailyWord
// ============================================

describe('getDailyWord', () => {
  it('retourne un mot parsé depuis les données JSON', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce({
      data: JSON.stringify({ word: 'apple', translation: 'pomme' }),
    });
    const result = await getDailyWord(db, 'jana', 'fr-en');
    expect(result).toEqual({ english: 'apple', french: 'pomme' });
  });

  it('fallback si première query retourne null', async () => {
    (db.getFirstAsync as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ data: JSON.stringify({ word: 'cat', translation: 'chat' }) });
    const result = await getDailyWord(db, 'jana', 'fr-en');
    expect(result).toEqual({ english: 'cat', french: 'chat' });
  });

  it('retourne null si aucun mot trouvé', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValue(null);
    const result = await getDailyWord(db, 'jana', 'fr-en');
    expect(result).toBeNull();
  });
});

// ============================================
// getUserBadges
// ============================================

describe('getUserBadges', () => {
  it('retourne les badges de l\'utilisateur', async () => {
    const badges = [{ id: 1, user_id: 'u1', badge_type: 'streak_7' }];
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce(badges);
    const result = await getUserBadges(db, 'u1');
    expect(result).toEqual(badges);
  });
});

// ============================================
// getWordsToReview / getSpacedReviewCount
// ============================================

describe('getWordsToReview', () => {
  it('retourne le nombre de mots à réviser', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce({ count: 5 });
    const result = await getWordsToReview(db, 'u1');
    expect(result).toBe(5);
  });

  it('retourne 0 si aucun résultat', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);
    const result = await getWordsToReview(db, 'u1');
    expect(result).toBe(0);
  });
});

describe('getSpacedReviewCount', () => {
  it('délègue à getWordsToReview', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce({ count: 3 });
    const result = await getSpacedReviewCount(db, 'u1');
    expect(result).toBe(3);
  });
});

// ============================================
// getUserMetrics / updateUserMetrics
// ============================================

describe('getUserMetrics', () => {
  it('retourne les métriques existantes', async () => {
    const metrics = { user_id: 'u1', words_learned: 10, exercises_completed: 5, current_streak: 3, longest_streak: 7, total_time_minutes: 20 };
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(metrics);
    const result = await getUserMetrics(db, 'u1');
    expect(result.words_learned).toBe(10);
  });

  it('crée les métriques si absentes', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined);
    const result = await getUserMetrics(db, 'u1');
    expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO user_metrics'), expect.any(Array));
    expect(result.words_learned).toBe(0);
  });
});

describe('updateUserMetrics', () => {
  it('ne fait rien si pas de champs à mettre à jour', async () => {
    await updateUserMetrics(db, 'u1', {});
    expect(db.runAsync).not.toHaveBeenCalled();
  });

  it('appelle runAsync avec les bons champs', async () => {
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined);
    await updateUserMetrics(db, 'u1', { words_learned: 15 });
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('words_learned = ?'),
      expect.arrayContaining([15])
    );
  });
});

// ============================================
// getDailyReviewWords / getSpacedReviewWords
// ============================================

describe('getDailyReviewWords', () => {
  it('utilise la limite selon l\'audience', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getDailyReviewWords(db, 'u1', 'lycee', 2, 'fr-en');
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('LIMIT ?'),
      expect.arrayContaining([15])
    );
  });
});

describe('getSpacedReviewWords', () => {
  it('sans audience → query de base', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getSpacedReviewWords(db, 'u1', 'fr-en');
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('spaced_repetition'),
      expect.arrayContaining(['u1'])
    );
  });

  it('avec audience → filtre target_audience', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getSpacedReviewWords(db, 'u1', 'fr-en', 'adult');
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('target_audience'),
      expect.arrayContaining(['u1', 'adult'])
    );
  });
});

// ============================================
// addWordToSRS / updateSpacedRepetitionResult
// ============================================

describe('addWordToSRS', () => {
  it('insère le mot dans spaced_repetition', async () => {
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined);
    await addWordToSRS(db, 'u1', 42);
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR IGNORE INTO spaced_repetition'),
      expect.arrayContaining(['u1', 42])
    );
  });
});

describe('updateSpacedRepetitionResult', () => {
  it('si absent du SRS → appelle addWordToSRS', async () => {
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(null);
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined);
    await updateSpacedRepetitionResult(db, 'u1', 42, true);
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR IGNORE INTO spaced_repetition'),
      expect.any(Array)
    );
  });

  it('réponse correcte → augmente ease_factor, calcule intervalle', async () => {
    const current = { user_id: 'u1', content_id: 42, ease_factor: 2.5, review_count: 2, correct_count: 2 };
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(current);
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined);
    await updateSpacedRepetitionResult(db, 'u1', 42, true);
    const [, params] = (db.runAsync as jest.Mock).mock.calls[0];
    const newEaseFactor = params[0];
    expect(newEaseFactor).toBeGreaterThan(2.5);
  });

  it('réponse incorrecte → diminue ease_factor, intervalle=1', async () => {
    const current = { user_id: 'u1', content_id: 42, ease_factor: 2.5, review_count: 3, correct_count: 2 };
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(current);
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined);
    await updateSpacedRepetitionResult(db, 'u1', 42, false);
    const [, params] = (db.runAsync as jest.Mock).mock.calls[0];
    const newEaseFactor = params[0];
    expect(newEaseFactor).toBeLessThan(2.5);
  });

  it('review_count=0 (premier révision correcte) → intervalle=1', async () => {
    const current = { user_id: 'u1', content_id: 5, ease_factor: 2.5, review_count: 0, correct_count: 0 };
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(current);
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined);
    await updateSpacedRepetitionResult(db, 'u1', 5, true);
    expect(db.runAsync).toHaveBeenCalled();
  });

  it('review_count=1 (deuxième révision correcte) → intervalle=3', async () => {
    const current = { user_id: 'u1', content_id: 6, ease_factor: 2.5, review_count: 1, correct_count: 1 };
    (db.getFirstAsync as jest.Mock).mockResolvedValueOnce(current);
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined);
    await updateSpacedRepetitionResult(db, 'u1', 6, true);
    expect(db.runAsync).toHaveBeenCalled();
  });
});

// ============================================
// insertContent
// ============================================

describe('insertContent', () => {
  it('insère du contenu dans la table content', async () => {
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined);
    await insertContent(db, { family_id: 1, level: 1, content_type: 'word', data: '{"word":"cat"}', difficulty: 'easy', target_audience: 'all', course: 'fr-en' });
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO content'),
      expect.arrayContaining([1, 1, 'word'])
    );
  });
});

// ============================================
// calculateUserMetrics
// ============================================

describe('calculateUserMetrics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calcule les métriques depuis DB avec activité', async () => {
    (db.getFirstAsync as jest.Mock)
      .mockResolvedValueOnce({ count: 15 })  // wordsResult
      .mockResolvedValueOnce({ total: 30 })  // exercisesResult
      .mockResolvedValueOnce({ count: 2 })   // activeDaysResult
      .mockResolvedValueOnce({ count: 10 }); // activityCount
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined); // updateUserMetrics

    const result = await calculateUserMetrics(db, 'u1');
    expect(result.words_learned).toBe(15);
    expect(result.exercises_completed).toBe(30);
    expect(result.total_time_minutes).toBe(20); // 10 * 2
    expect(result.current_streak).toBe(2);
  });

  // Un jour d'activité ancien (non consécutif à aujourd'hui) compte quand même dans le total
  // cumulé : contrairement à un streak, ce chiffre ne retombe jamais à 0 tant qu'il y a eu
  // au moins une activité un jour donné.
  it('un jour actif ancien compte dans le total cumulé (pas de notion de streak cassé)', async () => {
    (db.getFirstAsync as jest.Mock)
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ total: 0 })
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await calculateUserMetrics(db, 'u1');
    expect(result.current_streak).toBe(1);
  });

  it('aucune activité → jours=0, total_time=0', async () => {
    (db.getFirstAsync as jest.Mock)
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ total: null })
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 0 });
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await calculateUserMetrics(db, 'u1');
    expect(result.current_streak).toBe(0);
    expect(result.total_time_minutes).toBe(0);
  });

  it('plusieurs jours actifs, même non consécutifs → current_streak = longest_streak = total', async () => {
    (db.getFirstAsync as jest.Mock)
      .mockResolvedValueOnce({ count: 5 })
      .mockResolvedValueOnce({ total: 10 })
      .mockResolvedValueOnce({ count: 3 })
      .mockResolvedValueOnce({ count: 3 });
    (db.runAsync as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await calculateUserMetrics(db, 'u1');
    expect(result.current_streak).toBe(3);
    expect(result.longest_streak).toBe(3);
  });
});
