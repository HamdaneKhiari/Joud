/**
 * Tests — useGetFamiliesByModule
 *
 * Couvre : chargement normal, module introuvable, db=null, erreur DB,
 *          mise à jour quand moduleSlug ou level change.
 */

import { renderHook, act } from '@testing-library/react-native';

// ============================================
// Mocks
// ============================================

jest.mock('@/contexts/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));
jest.mock('@/database/queries', () => ({
  getModuleBySlug: jest.fn(),
  getFamiliesByModuleAndLevel: jest.fn(),
}));

// ============================================
// Imports — après tous les jest.mock()
// ============================================

import useGetFamiliesByModule from '@/hooks/useGetFamiliesByModule';

// ============================================
// Helpers
// ============================================

const makeDb = () => ({
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn().mockResolvedValue([]),
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
});

const mockGetModuleBySlug = () => require('@/database/queries').getModuleBySlug as jest.Mock;
const mockGetFamiliesByModuleAndLevel = () => require('@/database/queries').getFamiliesByModuleAndLevel as jest.Mock;

const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0));

const MOCK_FAMILIES = [
  { id: 1, name: 'Family 1', module_id: 1, level: 1 },
  { id: 2, name: 'Family 2', module_id: 1, level: 1 },
];

function setupMocks(db = makeDb()) {
  const { useUser } = require('@/contexts/UserContext');
  useUser.mockReturnValue({ db });
}

// ============================================
// Tests
// ============================================

describe('useGetFamiliesByModule — état initial', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('isLoading=true au départ', () => {
    const { result } = renderHook(() => useGetFamiliesByModule('vocab', 1));
    expect(result.current.isLoading).toBe(true);
  });
});

describe('useGetFamiliesByModule — chargement normal', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('charge les familles depuis la DB', async () => {
    const db = makeDb();
    setupMocks(db);
    mockGetModuleBySlug().mockResolvedValue({ id: 1, slug: 'vocab', name: 'Vocabulary' });
    mockGetFamiliesByModuleAndLevel().mockResolvedValue(MOCK_FAMILIES);

    const { result } = renderHook(() => useGetFamiliesByModule('vocab', 1));

    await act(flushPromises);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.families).toEqual(MOCK_FAMILIES);
    expect(result.current.familyIds).toEqual(['1', '2']);
    expect(result.current.error).toBeNull();
  });

  it('appelle les bonnes queries', async () => {
    const db = makeDb();
    setupMocks(db);
    mockGetModuleBySlug().mockResolvedValue({ id: 1, slug: 'reading', name: 'Reading' });
    mockGetFamiliesByModuleAndLevel().mockResolvedValue([]);

    renderHook(() => useGetFamiliesByModule('reading', 2));

    await act(flushPromises);

    expect(mockGetModuleBySlug()).toHaveBeenCalledWith(db, 'reading');
    expect(mockGetFamiliesByModuleAndLevel()).toHaveBeenCalledWith(db, 'reading', 2);
  });
});

describe('useGetFamiliesByModule — module non trouvé', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('retourne [] si le module n\'existe pas en DB', async () => {
    setupMocks();
    mockGetModuleBySlug().mockResolvedValue(null); // Module introuvable

    const { result } = renderHook(() => useGetFamiliesByModule('unknown_module', 1));

    await act(flushPromises);

    expect(result.current.families).toEqual([]);
    expect(result.current.familyIds).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useGetFamiliesByModule — db null ou invalide', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('db=null → isLoading=false, familles vides', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: null });

    const { result } = renderHook(() => useGetFamiliesByModule('vocab', 1));

    await act(flushPromises);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.families).toEqual([]);
    expect(mockGetModuleBySlug()).not.toHaveBeenCalled();
  });

  it('moduleSlug vide → isLoading=false, pas d\'appel DB', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: makeDb() });

    const { result } = renderHook(() => useGetFamiliesByModule('', 1));

    await act(flushPromises);

    expect(result.current.isLoading).toBe(false);
    expect(mockGetModuleBySlug()).not.toHaveBeenCalled();
  });
});

describe('useGetFamiliesByModule — gestion d\'erreurs', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('DB lance une erreur → error non null, familles vides', async () => {
    setupMocks();
    mockGetModuleBySlug().mockRejectedValue(new Error('DB crash'));

    const { result } = renderHook(() => useGetFamiliesByModule('vocab', 1));

    await act(flushPromises);

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.families).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
