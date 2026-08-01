/**
 * Tests de hooks — useUserMetrics
 * Couvre : mapping DB → métriques UI, fallback à 0, refresh, user absent
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

// ============================================
// Mocks
// ============================================

const mockDb = {
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn().mockResolvedValue([]),
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
};

const mockCalculateUserMetrics = jest.fn();

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('@/database/queries', () => ({
  calculateUserMetrics: (...args: unknown[]) => mockCalculateUserMetrics(...args),
}));

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

import { useUserMetrics } from '@/hooks/dashboard/useUserMetrics';

const mockUser = { id: 42, audience: 'adult', username: 'test' };

const makeMetrics = (overrides = {}) => ({
  user_id: 42,
  words_learned: 100,
  exercises_completed: 50,
  current_streak: 7,
  longest_streak: 14,
  total_time_minutes: 300,
  ...overrides,
});

// ============================================
// Sans user / DB
// ============================================

describe('useUserMetrics — sans user ou DB', () => {
  it('retourne 0 pour toutes les métriques si pas de user', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: null });

    const { result } = renderHook(() => useUserMetrics());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.wordsLearned).toBe(0);
    expect(result.current.exercisesCompleted).toBe(0);
    expect(result.current.streak).toBe(0);
  });

  it('retourne 0 si db est null', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: null, user: mockUser });

    const { result } = renderHook(() => useUserMetrics());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.wordsLearned).toBe(0);
  });
});

// ============================================
// Métriques depuis la DB
// ============================================

describe('useUserMetrics — métriques depuis la DB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: mockUser });
    mockCalculateUserMetrics.mockResolvedValue(makeMetrics());
  });

  it('wordsLearned = words_learned depuis la DB', async () => {
    const { result } = renderHook(() => useUserMetrics());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.wordsLearned).toBe(100);
  });

  it('exercisesCompleted = exercises_completed depuis la DB', async () => {
    const { result } = renderHook(() => useUserMetrics());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.exercisesCompleted).toBe(50);
  });

  it('streak = current_streak depuis la DB', async () => {
    const { result } = renderHook(() => useUserMetrics());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.streak).toBe(7);
  });

  it('calculateUserMetrics est appelé avec db et userId', async () => {
    const { result } = renderHook(() => useUserMetrics());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockCalculateUserMetrics).toHaveBeenCalledWith(mockDb, 42);
  });
});

// ============================================
// Fallback si DB plante
// ============================================

describe('useUserMetrics — erreur DB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: mockUser });
    mockCalculateUserMetrics.mockRejectedValue(new Error('DB error'));
  });

  it('retourne 0 sans planter en cas d\'erreur', async () => {
    const { result } = renderHook(() => useUserMetrics());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.wordsLearned).toBe(0);
    expect(result.current.streak).toBe(0);
  });
});

// ============================================
// refresh()
// ============================================

describe('useUserMetrics — refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: mockUser });
    mockCalculateUserMetrics.mockResolvedValue(makeMetrics());
    mockDb.getFirstAsync.mockResolvedValue({ count: 0 });
  });

  it('refresh() déclenche un nouveau fetch', async () => {
    const { result } = renderHook(() => useUserMetrics());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const callsBefore = mockCalculateUserMetrics.mock.calls.length;

    await act(async () => {
      result.current.refresh();
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockCalculateUserMetrics.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('conserve la même référence de refresh entre deux renders (db/user inchangés)', async () => {
    // Régression : une référence instable ici, combinée à un useFocusEffect qui la liste en
    // dépendance (cf. Dashboard.tsx), reproduit la même boucle de re-render infinie que le fix
    // de useFeedbackMessages.getFeedback — refresh() déclenche setIsLoading, qui re-render,
    // qui recrée refresh, qui redéclenche l'effet de focus, etc.
    const { result, rerender } = renderHook(() => useUserMetrics());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const firstRef = result.current.refresh;

    rerender({});

    expect(result.current.refresh).toBe(firstRef);
  });
});
