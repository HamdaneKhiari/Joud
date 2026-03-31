/**
 * Tests de hooks — useExerciseContent
 * Couvre : sélection de requête SQL selon subfamilyId, gestion d'erreur, parsing JSON
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { openDatabaseAsync } from 'expo-sqlite';

// ============================================
// Mocks
// ============================================

const mockDb = {
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
  runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
};

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn().mockReturnValue({ db: mockDb, user: { id: 1 } }),
}));

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

import { useExerciseContent } from '@/hooks/exercises/useExerciseContent';

// ============================================
// Helpers
// ============================================

const makeFamilyRow = (id = 10, module_slug = 'vocab') => ({
  id,
  module_slug,
  name: 'Test Family',
  order_index: 1,
});

const makeModuleRow = (slug = 'vocab') => ({
  id: 1,
  slug,
  name: 'Vocabulaire',
});

// ============================================
// Pas de DB disponible
// ============================================

describe('useExerciseContent — sans DB', () => {
  beforeEach(() => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: null, user: null });
  });

  it('isLoading passe à false sans planter', async () => {
    const { result } = renderHook(() => useExerciseContent(1, 0));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.contentItems).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('familyId <= 0 → pas de requête', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });

    const { result } = renderHook(() => useExerciseContent(0, 0));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockDb.getFirstAsync).not.toHaveBeenCalled();
  });
});

// ============================================
// Requête subfamilyId = 0
// ============================================

describe('useExerciseContent — subfamilyId = 0', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    mockDb.getFirstAsync
      .mockResolvedValueOnce(makeFamilyRow())   // famille
      .mockResolvedValueOnce(makeModuleRow());   // module
    mockDb.getAllAsync.mockResolvedValue([
      { id: 1, data: JSON.stringify({ english: 'cat', french: 'chat' }) },
    ]);
  });

  it('utilise la requête NULL / 0 pour subfamilyId=0', async () => {
    const { result } = renderHook(() => useExerciseContent(10, 0));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const [sql] = mockDb.getAllAsync.mock.calls[0];
    expect(sql).toContain('subfamily_id IS NULL OR subfamily_id = 0');
    expect(sql).not.toContain('subfamily_id = ?');
  });

  it('retourne les items parsés', async () => {
    const { result } = renderHook(() => useExerciseContent(10, 0));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.contentItems).toHaveLength(1);
    expect((result.current.contentItems[0].data as { english: string }).english).toBe('cat');
  });

  it('popule family et module', async () => {
    const { result } = renderHook(() => useExerciseContent(10, 0));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.family?.id).toBe(10);
    expect(result.current.module?.slug).toBe('vocab');
  });
});

// ============================================
// Requête subfamilyId > 0
// ============================================

describe('useExerciseContent — subfamilyId > 0', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    mockDb.getFirstAsync
      .mockResolvedValueOnce(makeFamilyRow())
      .mockResolvedValueOnce(makeModuleRow());
    mockDb.getAllAsync.mockResolvedValue([
      { id: 2, data: JSON.stringify({ english: 'dog', french: 'chien' }) },
    ]);
  });

  it('utilise la requête subfamily_id = ? (paramétrique)', async () => {
    const { result } = renderHook(() => useExerciseContent(10, 3));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const [sql, params] = mockDb.getAllAsync.mock.calls[0];
    expect(sql).toContain('subfamily_id = ?');
    expect(sql).not.toContain('IS NULL');
    expect(params).toContain(3);
  });
});

// ============================================
// Famille introuvable
// ============================================

describe('useExerciseContent — famille introuvable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    mockDb.getFirstAsync.mockResolvedValue(null); // famille absente
  });

  it('définit error si la famille est introuvable', async () => {
    const { result } = renderHook(() => useExerciseContent(999, 0));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('999');
  });

  it('contentItems reste vide', async () => {
    const { result } = renderHook(() => useExerciseContent(999, 0));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.contentItems).toEqual([]);
  });
});

// ============================================
// JSON invalide dans content
// ============================================

describe('useExerciseContent — JSON invalide', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    mockDb.getFirstAsync
      .mockResolvedValueOnce(makeFamilyRow())
      .mockResolvedValueOnce(makeModuleRow());
    mockDb.getAllAsync.mockResolvedValue([
      { id: 1, data: 'INVALID_JSON' },
      { id: 2, data: JSON.stringify({ english: 'ok' }) },
    ]);
  });

  it('filtre les items avec JSON invalide sans planter', async () => {
    const { result } = renderHook(() => useExerciseContent(10, 0));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // L'item invalide est filtré, seul l'item 2 reste
    expect(result.current.contentItems).toHaveLength(1);
    expect(result.current.contentItems[0].id).toBe(2);
    expect(result.current.error).toBeNull(); // pas d'erreur globale
  });
});
