/**
 * Tests de hooks — useLastActivity
 * Couvre : recordActivity (SQL insert + décomposition composite key),
 *          fetchLastActivity (reconstruction composite key), guard DB null
 */

import { renderHook, act } from '@testing-library/react-native';

// ============================================
// Mocks
// ============================================

const mockDb = {
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
  getFirstAsync: jest.fn().mockResolvedValue(null),
};

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn().mockReturnValue({ db: mockDb }),
}));

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

import { useLastActivity, ActivityData } from '@/hooks/useLastActivity';

const makeActivity = (overrides: Partial<ActivityData> = {}): ActivityData => ({
  moduleSlug: 'vocab',
  familyId: '5',
  level: 1,
  familyName: 'Les Animaux',
  icon: '🐾',
  progress: 60,
  ...overrides,
});

// ============================================
// Guard DB null
// ============================================

describe('useLastActivity — guard DB null', () => {
  it('recordActivity ne plante pas si db est null', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: null });

    const { result } = renderHook(() => useLastActivity());

    await act(async () => {
      await result.current.recordActivity(makeActivity());
    });

    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });

  it('fetchLastActivity ne plante pas si db est null', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: null });

    const { result } = renderHook(() => useLastActivity());

    await act(async () => {
      await result.current.fetchLastActivity();
    });

    expect(result.current.lastActivity).toBeNull();
  });
});

// ============================================
// recordActivity — familyId simple
// ============================================

describe('useLastActivity — recordActivity avec familyId simple', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb });
    mockDb.runAsync.mockResolvedValue({ changes: 1 });
  });

  it('appelle db.runAsync avec un INSERT OR REPLACE', async () => {
    const { result } = renderHook(() => useLastActivity());

    await act(async () => {
      await result.current.recordActivity(makeActivity({ familyId: '5' }));
    });

    expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
    const [sql] = mockDb.runAsync.mock.calls[0];
    expect(sql).toContain('INSERT OR REPLACE');
    expect(sql).toContain('activity_log');
  });

  it('familyId="5" → family_id=5, subfamily_id=0', async () => {
    const { result } = renderHook(() => useLastActivity());

    await act(async () => {
      await result.current.recordActivity(makeActivity({ familyId: '5' }));
    });

    const [, params] = mockDb.runAsync.mock.calls[0];
    // params: [moduleSlug, family_id, subfamily_id, level, ...]
    expect(params[1]).toBe(5);   // family_id
    expect(params[2]).toBe(0);   // subfamily_id
  });
});

// ============================================
// recordActivity — clé composite "X-Y"
// ============================================

describe('useLastActivity — recordActivity avec clé composite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb });
    mockDb.runAsync.mockResolvedValue({ changes: 1 });
  });

  it('familyId="12-3" → family_id=12, subfamily_id=3', async () => {
    const { result } = renderHook(() => useLastActivity());

    await act(async () => {
      await result.current.recordActivity(makeActivity({ familyId: '12-3' }));
    });

    const [, params] = mockDb.runAsync.mock.calls[0];
    expect(params[1]).toBe(12);  // family_id
    expect(params[2]).toBe(3);   // subfamily_id
  });

  it('familyId="100-0" → family_id=100, subfamily_id=0', async () => {
    const { result } = renderHook(() => useLastActivity());

    await act(async () => {
      await result.current.recordActivity(makeActivity({ familyId: '100-0' }));
    });

    const [, params] = mockDb.runAsync.mock.calls[0];
    expect(params[1]).toBe(100);
    expect(params[2]).toBe(0);
  });

  it('erreur DB → ne plante pas', async () => {
    mockDb.runAsync.mockRejectedValue(new Error('DB error'));
    const { result } = renderHook(() => useLastActivity());

    await expect(
      act(async () => {
        await result.current.recordActivity(makeActivity());
      })
    ).resolves.not.toThrow();
  });
});

// ============================================
// fetchLastActivity — reconstruction du familyId
// ============================================

describe('useLastActivity — fetchLastActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb });
  });

  it('retourne null si aucune activité en DB', async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);
    const { result } = renderHook(() => useLastActivity());

    await act(async () => {
      await result.current.fetchLastActivity();
    });

    expect(result.current.lastActivity).toBeNull();
  });

  it('familyId simple → String(familyId)', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      moduleSlug: 'vocab',
      familyId: 5,
      subfamilyId: 0,
      level: 1,
      familyName: 'Animaux',
      icon: '🐾',
      progress: 50,
    });

    const { result } = renderHook(() => useLastActivity());
    await act(async () => {
      await result.current.fetchLastActivity();
    });

    expect(result.current.lastActivity?.familyId).toBe('5');
  });

  it('clé composite → reconstruit "familyId-subfamilyId"', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      moduleSlug: 'grammar',
      familyId: 12,
      subfamilyId: 3,
      level: 2,
      familyName: 'Les Verbes',
      icon: '📖',
      progress: 75,
    });

    const { result } = renderHook(() => useLastActivity());
    await act(async () => {
      await result.current.fetchLastActivity();
    });

    expect(result.current.lastActivity?.familyId).toBe('12-3');
  });

  it('isLoading passe à false après fetch', async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);
    const { result } = renderHook(() => useLastActivity());

    await act(async () => {
      await result.current.fetchLastActivity();
    });

    expect(result.current.isLoading).toBe(false);
  });
});
