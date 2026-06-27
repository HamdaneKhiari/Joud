/**
 * Unit tests — moduleHelper.ts
 *
 * Couvre : getModuleColor, getModuleIcon, isValidLevel, getMaxLevels,
 *          useIdentityPalette hook, globalPaletteCache (comportement de cache).
 */

import { renderHook, act } from '@testing-library/react-native';

// ============================================
// Mocks
// ============================================

jest.mock('@/database/queries', () => ({
  getIdentityPalette: jest.fn(),
  getModuleLabelWithFallback: jest.fn(),
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
  getModuleColor,
  getModuleIcon,
  isValidLevel,
  getMaxLevels,
  useIdentityPalette,
} from '@/utils/moduleHelper';

// ============================================
// Helpers
// ============================================

const makeDb = (overrides: Partial<Record<string, jest.Mock>> = {}) => ({
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn().mockResolvedValue([]),
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
  execAsync: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const mockGetIdentityPalette = () =>
  require('@/database/queries').getIdentityPalette as jest.Mock;

const mockGetModuleLabelWithFallback = () =>
  require('@/database/queries').getModuleLabelWithFallback as jest.Mock;

// ============================================
// getModuleColor
// ============================================

describe('getModuleColor', () => {
  // Chaque test utilise un identityId unique pour éviter les interférences de cache
  let identityCounter = 0;
  const nextId = () => `test_identity_${identityCounter++}`;

  beforeEach(() => jest.clearAllMocks());

  it('db=null → retourne "#34495E" (fallback)', async () => {
    const result = await getModuleColor('vocab', nextId(), null, ['vocab']);
    expect(result).toBe('#34495E');
    expect(mockGetIdentityPalette()).not.toHaveBeenCalled();
  });

  it('db=number (invalide) → retourne "#34495E"', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getModuleColor('vocab', nextId(), 42 as any, ['vocab']);
    expect(result).toBe('#34495E');
  });

  it('palette vide → retourne "#34495E"', async () => {
    const db = makeDb();
    const id = nextId();
    mockGetIdentityPalette().mockResolvedValue([]);

    const result = await getModuleColor('vocab', id, db as any, ['vocab']);
    expect(result).toBe('#34495E');
  });

  it('module en index 0 → retourne palette[0]', async () => {
    const db = makeDb();
    const id = nextId();
    mockGetIdentityPalette().mockResolvedValue(['#AA0000', '#BB0000', '#CC0000']);

    const result = await getModuleColor('vocab', id, db as any, ['vocab', 'reading', 'dialogues']);
    expect(result).toBe('#AA0000');
  });

  it('module en index 2 → retourne palette[2]', async () => {
    const db = makeDb();
    const id = nextId();
    mockGetIdentityPalette().mockResolvedValue(['#AA0000', '#BB0000', '#CC0000']);

    const result = await getModuleColor('reading', id, db as any, ['vocab', 'reading', 'dialogues']);
    expect(result).toBe('#CC0000');
  });

  it('modulo : index > taille palette → revient au début', async () => {
    const db = makeDb();
    const id = nextId();
    mockGetIdentityPalette().mockResolvedValue(['#AA0000', '#BB0000']); // 2 couleurs

    // 4e module, index=3 → 3 % 2 = 1 → palette[1]
    const modules = ['vocab', 'reading', 'dialogues', 'phrase_types'];
    const result = await getModuleColor('dialogues', id, db as any, modules);
    expect(result).toBe('#BB0000');
  });

  it('module non trouvé dans availableModules (index=-1) → retourne palette[0]', async () => {
    const db = makeDb();
    const id = nextId();
    mockGetIdentityPalette().mockResolvedValue(['#AA0000', '#BB0000', '#CC0000']);

    const result = await getModuleColor('unknown_module', id, db as any, ['vocab', 'reading']);
    expect(result).toBe('#AA0000');
  });

  it('cache : deuxième appel avec même identityId n\'appelle pas getIdentityPalette', async () => {
    const db = makeDb();
    const id = nextId();
    mockGetIdentityPalette().mockResolvedValue(['#DD0000', '#EE0000']);

    await getModuleColor('vocab', id, db as any, ['vocab']);
    await getModuleColor('reading', id, db as any, ['vocab', 'reading']);

    // getIdentityPalette ne doit être appelé qu'une seule fois (cache hit au 2e appel)
    expect(mockGetIdentityPalette()).toHaveBeenCalledTimes(1);
  });

  it('DB lance une erreur → retourne "#34495E"', async () => {
    const db = makeDb();
    const id = nextId();
    mockGetIdentityPalette().mockRejectedValue(new Error('DB crash'));

    const result = await getModuleColor('vocab', id, db as any, ['vocab']);
    expect(result).toBe('#34495E');
  });
});

// ============================================
// getModuleIcon
// ============================================

describe('getModuleIcon', () => {
  beforeEach(() => jest.clearAllMocks());

  it('db=null → retourne "book"', async () => {
    const result = await getModuleIcon('vocab', 'college', null);
    expect(result).toBe('book');
  });

  it('db=number → retourne "book"', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getModuleIcon('vocab', 'college', 42 as any);
    expect(result).toBe('book');
  });

  // NOTE: le cas "normal" de getModuleIcon utilise `await import()` dynamique.
  // Dans l'environnement Jest (babel-preset-expo + metro caller), le dynamic import
  // ne passe pas par le système de mocks CommonJS de Jest → non testable ici.
  // Les cas limites (db null, erreur) couvrent suffisamment la robustesse.

  it('DB lance une erreur → retourne "book"', async () => {
    const db = makeDb();
    mockGetModuleLabelWithFallback().mockRejectedValue(new Error('import failed'));

    const result = await getModuleIcon('vocab', 'college', db as any);
    expect(result).toBe('book');
  });
});

// ============================================
// isValidLevel
// ============================================

describe('isValidLevel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('db=null, niveau 1 → true (fallback conservateur 1-4)', async () => {
    const result = await isValidLevel(1, 'college', null);
    expect(result).toBe(true);
  });

  it('db=null, niveau 4 → true', async () => {
    const result = await isValidLevel(4, 'college', null);
    expect(result).toBe(true);
  });

  it('db=null, niveau 5 → false', async () => {
    const result = await isValidLevel(5, 'college', null);
    expect(result).toBe(false);
  });

  it('niveau trouvé dans DB → true', async () => {
    const db = makeDb({
      getAllAsync: jest.fn().mockResolvedValue([{ level: 2 }]),
    });

    const result = await isValidLevel(2, 'college', db as any);
    expect(result).toBe(true);
    expect((db.getAllAsync as jest.Mock)).toHaveBeenCalledWith(
      expect.stringContaining('levels WHERE level = ?'),
      [2, 'college']
    );
  });

  it('niveau absent de DB → false', async () => {
    const db = makeDb({
      getAllAsync: jest.fn().mockResolvedValue([]),
    });

    const result = await isValidLevel(10, 'college', db as any);
    expect(result).toBe(false);
  });

  it('DB lance une erreur → fallback (1-4 = true)', async () => {
    const db = makeDb({
      getAllAsync: jest.fn().mockRejectedValue(new Error('SQL error')),
    });

    expect(await isValidLevel(3, 'college', db as any)).toBe(true);
    expect(await isValidLevel(5, 'college', db as any)).toBe(false);
  });
});

// ============================================
// getMaxLevels
// ============================================

describe('getMaxLevels', () => {
  beforeEach(() => jest.clearAllMocks());

  it('db=null → retourne 4 (fallback)', async () => {
    const result = await getMaxLevels('college', null);
    expect(result).toBe(4);
  });

  it('DB retourne des niveaux → retourne le max', async () => {
    const db = makeDb({
      getAllAsync: jest.fn().mockResolvedValue([{ level: 6 }]),
    });

    const result = await getMaxLevels('adult', db as any);
    expect(result).toBe(6);
  });

  it('DB retourne une liste vide → retourne 4 (fallback)', async () => {
    const db = makeDb({
      getAllAsync: jest.fn().mockResolvedValue([]),
    });

    const result = await getMaxLevels('college', db as any);
    expect(result).toBe(4);
  });

  it('DB lance une erreur → retourne 4', async () => {
    const db = makeDb({
      getAllAsync: jest.fn().mockRejectedValue(new Error('DB error')),
    });

    const result = await getMaxLevels('college', db as any);
    expect(result).toBe(4);
  });

  it('la requête filtre par target_audience et retourne LIMIT 1', async () => {
    const db = makeDb({
      getAllAsync: jest.fn().mockResolvedValue([{ level: 3 }]),
    });

    await getMaxLevels('primary', db as any);

    const call = (db.getAllAsync as jest.Mock).mock.calls[0];
    expect(call[0]).toContain('ORDER BY level DESC LIMIT 1');
    expect(call[1]).toContain('primary');
  });
});

// ============================================
// useIdentityPalette hook
// ============================================

describe('useIdentityPalette', () => {
  let identityCounter = 100;
  const nextId = () => `hook_identity_${identityCounter++}`;

  function setupHookMocks(db: ReturnType<typeof makeDb> | null, currentApp = 'college') {
    const { useUser } = require('@/contexts/UserContext');
    const { useTheme } = require('@/themes/ThemeContext');
    useUser.mockReturnValue({ db });
    useTheme.mockReturnValue({ currentApp });
  }

  beforeEach(() => jest.clearAllMocks());

  it('état initial = [] (pas de cache)', () => {
    const id = nextId();
    setupHookMocks(null, id);

    const { result } = renderHook(() => useIdentityPalette());
    expect(result.current).toEqual([]);
  });

  it('db=null → reste sur [] après effet', async () => {
    const id = nextId();
    setupHookMocks(null, id);

    const { result } = renderHook(() => useIdentityPalette());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toEqual([]);
    expect(mockGetIdentityPalette()).not.toHaveBeenCalled();
  });

  it('db valide → charge la palette depuis la DB', async () => {
    const id = nextId();
    const db = makeDb();
    setupHookMocks(db, id);
    mockGetIdentityPalette().mockResolvedValue(['#111111', '#222222', '#333333']);

    const { result } = renderHook(() => useIdentityPalette());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toEqual(['#111111', '#222222', '#333333']);
  });

  it('DB lance une erreur → reste sur []', async () => {
    const id = nextId();
    const db = makeDb();
    setupHookMocks(db, id);
    mockGetIdentityPalette().mockRejectedValue(new Error('DB fail'));

    const { result } = renderHook(() => useIdentityPalette());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toEqual([]);
  });
});
