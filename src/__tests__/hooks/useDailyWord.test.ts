/**
 * Tests de hooks — useDailyWord
 * Couvre : mot du jour, fallback si absent, fallback si DB indisponible, gestion d'erreur
 */

import { renderHook, waitFor } from '@testing-library/react-native';

// ============================================
// Mocks
// ============================================

const mockDb = {
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn().mockResolvedValue([]),
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
};

const mockGetDailyWord = jest.fn();

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn().mockReturnValue({ db: mockDb, user: { id: 1 } }),
}));

jest.mock('@/themes/ThemeContext', () => ({
  useTheme: jest.fn().mockReturnValue({ identity: { id: 'jana' } }),
}));

jest.mock('@/database/queries', () => ({
  getDailyWord: (...args: unknown[]) => mockGetDailyWord(...args),
}));

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

import { useDailyWord } from '@/hooks/dashboard/useDailyWord';

const DEFAULT_WORD = { english: 'Learn', french: 'Apprendre', emoji: '🎓' };

// ============================================
// Sans DB
// ============================================

describe('useDailyWord — sans DB', () => {
  it('isLoading passe à false et dailyWord est null', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: null });

    const { result } = renderHook(() => useDailyWord());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.dailyWord).toBeNull();
  });
});

// ============================================
// Mot retourné par la DB
// ============================================

describe('useDailyWord — mot présent en DB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    mockGetDailyWord.mockResolvedValue({ english: 'House', french: 'Maison' });
  });

  it('dailyWord.english et .french sont corrects', async () => {
    const { result } = renderHook(() => useDailyWord());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.dailyWord?.english).toBe('House');
    expect(result.current.dailyWord?.french).toBe('Maison');
  });

  it('emoji est toujours défini (📖)', async () => {
    const { result } = renderHook(() => useDailyWord());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.dailyWord?.emoji).toBe('📖');
  });

  it('error est null', async () => {
    const { result } = renderHook(() => useDailyWord());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
  });

  it('getDailyWord est appelé avec db et identityId', async () => {
    const { result } = renderHook(() => useDailyWord());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetDailyWord).toHaveBeenCalledWith(mockDb, 'jana', 'fr-en');
  });
});

// ============================================
// Aucun mot retourné (DB vide)
// ============================================

describe('useDailyWord — aucun mot en DB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    mockGetDailyWord.mockResolvedValue(null);
  });

  it('retourne le mot par défaut "Learn / Apprendre"', async () => {
    const { result } = renderHook(() => useDailyWord());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.dailyWord).toEqual(DEFAULT_WORD);
  });
});

// ============================================
// Erreur réseau / DB
// ============================================

describe('useDailyWord — erreur DB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    mockGetDailyWord.mockRejectedValue(new Error('DB error'));
  });

  it('retourne le mot par défaut en cas d\'erreur', async () => {
    const { result } = renderHook(() => useDailyWord());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.dailyWord).toEqual(DEFAULT_WORD);
  });

  it('error contient un message', async () => {
    const { result } = renderHook(() => useDailyWord());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeTruthy();
  });
});
