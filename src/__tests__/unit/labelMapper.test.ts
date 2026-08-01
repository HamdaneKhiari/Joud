/**
 * Unit tests — labelMapper.ts
 *
 * Couvre : getModuleLabel, getLevelLabel, getAvailableModules, isModuleAvailable,
 *          useModuleLabel hook, useLevelLabel hook.
 */

import { renderHook, act } from '@testing-library/react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

// ============================================
// Mocks
// ============================================

jest.mock('@/database/queries', () => ({
  getModuleLabelWithFallback: jest.fn(),
  getAvailableModules: jest.fn(),
}));

jest.mock('@/contexts/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('@/themes/ThemeContext', () => ({ useTheme: jest.fn() }));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

// ============================================
// Imports — après tous les jest.mock()
// ============================================

import {
  getModuleLabel,
  getLevelLabel,
  getAvailableModules,
  isModuleAvailable,
  useModuleLabel,
  useLevelLabel,
} from '@/utils/labelMapper';

// ============================================
// Helpers
// ============================================

const makeDb = (overrides: Partial<Record<string, jest.Mock>> = {}) => ({
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn().mockResolvedValue([]),
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
  execAsync: jest.fn().mockResolvedValue(undefined),
  ...overrides,
}) as unknown as SQLiteDatabase;

// ============================================
// getModuleLabel
// ============================================

describe('getModuleLabel', () => {
  const mockGetModuleLabelWithFallback = () =>
    require('@/database/queries').getModuleLabelWithFallback as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('db=null → retourne le fallback immédiatement', async () => {
    const result = await getModuleLabel(null, 'vocab', 'college');
    expect(result).toEqual({ title: 'vocab', description: 'Module', icon: 'book' });
    expect(mockGetModuleLabelWithFallback()).not.toHaveBeenCalled();
  });

  it('db=number (invalide) → retourne le fallback', async () => {
    const result = await getModuleLabel(42 as unknown as SQLiteDatabase, 'reading', 'college');
    expect(result).toEqual({ title: 'reading', description: 'Module', icon: 'book' });
  });

  it('cas normal → appelle getModuleLabelWithFallback et mappe le résultat', async () => {
    const db = makeDb();
    mockGetModuleLabelWithFallback().mockResolvedValue({
      display_title: 'Vocabulaire',
      display_description: 'Apprendre les mots',
      icon_name: 'book-open',
    });

    const result = await getModuleLabel(db, 'vocab', 'college');

    expect(mockGetModuleLabelWithFallback()).toHaveBeenCalledWith(db, 'vocab', 'college');
    expect(result).toEqual({
      title: 'Vocabulaire',
      description: 'Apprendre les mots',
      icon: 'book-open',
    });
  });

  it('DB lance une erreur → retourne le fallback sans planter', async () => {
    const db = makeDb();
    mockGetModuleLabelWithFallback().mockRejectedValue(new Error('DB error'));

    const result = await getModuleLabel(db, 'vocab', 'college');

    expect(result).toEqual({ title: 'vocab', description: 'Module', icon: 'book' });
  });

  it('erreur "shared object" → silencieuse (pas de log.error)', async () => {
    const db = makeDb();
    mockGetModuleLabelWithFallback().mockRejectedValue(new Error('shared object closed'));

    await getModuleLabel(db, 'vocab', 'college');

    const { log } = require('@/utils/logUtils');
    expect(log.error).not.toHaveBeenCalled();
  });

  it('erreur standard → loggée', async () => {
    const db = makeDb();
    mockGetModuleLabelWithFallback().mockRejectedValue(new Error('table not found'));

    await getModuleLabel(db, 'vocab', 'college');

    const { log } = require('@/utils/logUtils');
    expect(log.error).toHaveBeenCalled();
  });

  it('en prod (__DEV__=false), une erreur "shared object" est quand même loggée (pas avalée silencieusement)', async () => {
    const originalDev = (global as { __DEV__?: boolean }).__DEV__;
    (global as { __DEV__?: boolean }).__DEV__ = false;
    try {
      const db = makeDb();
      mockGetModuleLabelWithFallback().mockRejectedValue(new Error('shared object closed'));

      await getModuleLabel(db, 'vocab', 'college');

      const { log } = require('@/utils/logUtils');
      expect(log.error).toHaveBeenCalled();
    } finally {
      (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    }
  });
});

// ============================================
// getLevelLabel
// ============================================

describe('getLevelLabel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('db=null → retourne le fallback hardcodé', async () => {
    const result = await getLevelLabel(null, 3, 'college');
    expect(result).toEqual({ title: 'Niveau 3', badge: 'N3', description: 'Niveau' });
  });

  it('trouvé dans level_labels (sans familyId) → retourne les données DB', async () => {
    const db = makeDb({
      getFirstAsync: jest.fn().mockResolvedValue({
        display_title: 'Intermédiaire',
        badge_text: 'INT',
        display_description: 'Niveau intermédiaire',
      }),
    });

    const result = await getLevelLabel(db, 2, 'college');

    expect(result).toEqual({
      title: 'Intermédiaire',
      badge: 'INT',
      description: 'Niveau intermédiaire',
    });
  });

  it('avec familyId → la requête inclut AND family_id = ?', async () => {
    const db = makeDb({
      getFirstAsync: jest.fn().mockResolvedValue({
        display_title: 'Vocab Niveau 1',
        badge_text: 'V1',
        display_description: '',
      }),
    });

    await getLevelLabel(db, 1, 'college', 'fam_101');

    const call = (db.getFirstAsync as jest.Mock).mock.calls[0];
    expect(call[0]).toContain('AND family_id = ?');
    expect(call[1]).toContain('fam_101');
  });

  it('sans familyId → la requête inclut AND family_id IS NULL', async () => {
    const db = makeDb({
      getFirstAsync: jest.fn().mockResolvedValue(null),
      getAllAsync: jest.fn().mockResolvedValue([]),
    });

    await getLevelLabel(db, 1, 'college');

    const call = (db.getFirstAsync as jest.Mock).mock.calls[0];
    expect(call[0]).toContain('AND family_id IS NULL');
  });

  it('absent de level_labels, présent dans levels → fallback levels table', async () => {
    const db = makeDb({
      getFirstAsync: jest.fn()
        .mockResolvedValueOnce(null) // level_labels → rien
        .mockResolvedValueOnce({    // levels → trouvé
          title: 'Niveau Un',
          badge: 'L1',
          description: 'Premier niveau',
        }),
    });

    const result = await getLevelLabel(db, 1, 'college');

    expect(result).toEqual({ title: 'Niveau Un', badge: 'L1', description: 'Premier niveau' });
  });

  it('absent des deux tables → fallback hardcodé', async () => {
    const db = makeDb({
      getFirstAsync: jest.fn().mockResolvedValue(null),
    });

    const result = await getLevelLabel(db, 5, 'college');

    expect(result).toEqual({ title: 'Niveau 5', badge: 'N5', description: 'Niveau' });
  });

  it('avec familyId + absent de level_labels → PAS de fallback levels table (retourne hardcodé)', async () => {
    const db = makeDb({
      getFirstAsync: jest.fn().mockResolvedValue(null),
    });

    const result = await getLevelLabel(db, 2, 'college', 'fam_101');

    // familyId présent → pas de fallback levels, retour hardcodé
    expect(result).toEqual({ title: 'Niveau 2', badge: 'N2', description: 'Niveau' });
    // levels table ne doit PAS être consultée
    expect((db.getFirstAsync as jest.Mock).mock.calls.length).toBe(1);
  });

  it('DB lance une erreur → retourne le fallback hardcodé', async () => {
    const db = makeDb({
      getFirstAsync: jest.fn().mockRejectedValue(new Error('SQL error')),
    });

    const result = await getLevelLabel(db, 2, 'college');

    expect(result).toEqual({ title: 'Niveau 2', badge: 'N2', description: 'Niveau' });
  });
});

// ============================================
// getAvailableModules
// ============================================

describe('getAvailableModules', () => {
  const mockGetAvailableModulesFromDB = () =>
    require('@/database/queries').getAvailableModules as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('db=null → retourne []', async () => {
    const result = await getAvailableModules(null, 'college', 1);
    expect(result).toEqual([]);
    expect(mockGetAvailableModulesFromDB()).not.toHaveBeenCalled();
  });

  it('cas normal → délègue à getAvailableModulesFromDB', async () => {
    const db = makeDb();
    mockGetAvailableModulesFromDB().mockResolvedValue(['vocab', 'reading', 'phrase_types']);

    const result = await getAvailableModules(db, 'college', 1);

    expect(mockGetAvailableModulesFromDB()).toHaveBeenCalledWith(db, 'college', 1);
    expect(result).toEqual(['vocab', 'reading', 'phrase_types']);
  });

  it('DB lance une erreur → retourne []', async () => {
    const db = makeDb();
    mockGetAvailableModulesFromDB().mockRejectedValue(new Error('DB error'));

    const result = await getAvailableModules(db, 'college', 1);

    expect(result).toEqual([]);
  });
});

// ============================================
// isModuleAvailable
// ============================================

describe('isModuleAvailable', () => {
  const mockGetAvailableModulesFromDB = () =>
    require('@/database/queries').getAvailableModules as jest.Mock;

  beforeEach(() => jest.clearAllMocks());

  it('module présent dans la liste → true', async () => {
    const db = makeDb();
    mockGetAvailableModulesFromDB().mockResolvedValue(['vocab', 'reading']);

    const result = await isModuleAvailable(db, 'vocab', 'college', 1);
    expect(result).toBe(true);
  });

  it('module absent de la liste → false', async () => {
    const db = makeDb();
    mockGetAvailableModulesFromDB().mockResolvedValue(['vocab', 'reading']);

    const result = await isModuleAvailable(db, 'word_games', 'college', 1);
    expect(result).toBe(false);
  });

  it('db=null → false (liste vide)', async () => {
    const result = await isModuleAvailable(null, 'vocab', 'college', 1);
    expect(result).toBe(false);
  });
});

// ============================================
// useModuleLabel hook
// ============================================

describe('useModuleLabel', () => {
  const mockGetModuleLabelWithFallback = () =>
    require('@/database/queries').getModuleLabelWithFallback as jest.Mock;

  function setupHookMocks(db: ReturnType<typeof makeDb> | null, currentApp = 'college') {
    const { useUser } = require('@/contexts/UserContext');
    const { useTheme } = require('@/themes/ThemeContext');
    useUser.mockReturnValue({ db });
    useTheme.mockReturnValue({ currentApp });
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('état initial = fallback { title: slug, description: "Module", icon: "book" }', () => {
    setupHookMocks(null);

    const { result } = renderHook(() => useModuleLabel('vocab'));

    expect(result.current).toEqual({
      title: 'vocab',
      description: 'Module',
      icon: 'book',
    });
  });

  it('db=null → reste sur le fallback (pas de chargement)', async () => {
    setupHookMocks(null);

    const { result } = renderHook(() => useModuleLabel('reading'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.title).toBe('reading');
    expect(mockGetModuleLabelWithFallback()).not.toHaveBeenCalled();
  });

  it('db valide → charge depuis la DB et met à jour le label', async () => {
    const db = makeDb();
    setupHookMocks(db);
    mockGetModuleLabelWithFallback().mockResolvedValue({
      display_title: 'Grammaire',
      display_description: 'Règles de grammaire',
      icon_name: 'pencil',
    });

    const { result } = renderHook(() => useModuleLabel('reading'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toEqual({
      title: 'Grammaire',
      description: 'Règles de grammaire',
      icon: 'pencil',
    });
  });

  it('DB lance une erreur → reste sur le fallback', async () => {
    const db = makeDb();
    setupHookMocks(db);
    mockGetModuleLabelWithFallback().mockRejectedValue(new Error('SQL fail'));

    const { result } = renderHook(() => useModuleLabel('reading'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.title).toBe('reading');
  });
});

// ============================================
// useLevelLabel hook
// ============================================

describe('useLevelLabel', () => {
  function setupHookMocks(db: ReturnType<typeof makeDb> | null, currentApp = 'college') {
    const { useUser } = require('@/contexts/UserContext');
    const { useTheme } = require('@/themes/ThemeContext');
    useUser.mockReturnValue({ db });
    useTheme.mockReturnValue({ currentApp });
  }

  beforeEach(() => jest.clearAllMocks());

  it('état initial = fallback { title: "Niveau N", badge: "NN", description: "Niveau" }', () => {
    setupHookMocks(null);

    const { result } = renderHook(() => useLevelLabel(2));

    expect(result.current).toEqual({
      title: 'Niveau 2',
      badge: 'N2',
      description: 'Niveau',
    });
  });

  it('db=null → reste sur le fallback', async () => {
    setupHookMocks(null);

    const { result } = renderHook(() => useLevelLabel(1));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.title).toBe('Niveau 1');
  });

  it('db valide, trouvé dans level_labels → met à jour le label', async () => {
    const db = makeDb({
      getFirstAsync: jest.fn().mockResolvedValue({
        display_title: 'Débutant',
        badge_text: 'DEB',
        display_description: 'Pour commencer',
      }),
    });
    setupHookMocks(db);

    const { result } = renderHook(() => useLevelLabel(1));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toEqual({
      title: 'Débutant',
      badge: 'DEB',
      description: 'Pour commencer',
    });
  });

  it('avec familyId → getLevelLabel est appelé avec le bon familyId', async () => {
    const db = makeDb({
      getFirstAsync: jest.fn().mockResolvedValue(null),
    });
    setupHookMocks(db);

    renderHook(() => useLevelLabel(1, 'fam_101'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const call = (db.getFirstAsync as jest.Mock).mock.calls[0];
    expect(call[1]).toContain('fam_101');
  });
});
