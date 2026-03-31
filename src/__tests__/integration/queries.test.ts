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
      await getFamiliesForModule(db, 'grammar');
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
      { slug: 'vocab' }, { slug: 'grammar' }, { slug: 'phrase_types' }
    ]);

    const result = await getAvailableModules(db, 'primary', 1);
    expect(result).toEqual(['vocab', 'grammar', 'phrase_types']);
  });

  it('passe identity_id et level_number à la query', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getAvailableModules(db, 'lycee', 3);

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['lycee', 3])
    );
  });

  it('exclut le module "assessment"', async () => {
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce([]);
    await getAvailableModules(db, 'adult', 1);

    const sql = (db.getAllAsync as jest.Mock).mock.calls[0][0] as string;
    expect(sql).toContain("slug != 'assessment'");
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
