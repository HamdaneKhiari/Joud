/**
 * Tests de hooks — useFamiliesWithProgress
 * Couvre : query params (user présent/absent), résultat, état initial, refresh
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

// Override expo-router so useFocusEffect fires once (like useEffect) instead of on every render
// The global mock calls cb() synchronously on each render → infinite re-renders with state updates
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => {
    require('react').useEffect(() => { cb(); }, []);
  },
}));

// ============================================
// Mocks
// ============================================

const mockDb = {
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
};

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

// useFocusEffect est déjà mocké dans expo-router mock pour appeler le callback immédiatement

import useFamiliesWithProgress from '@/hooks/familySelection/useFamiliesWithProgress';
import type { FamilyWithProgress } from '@/hooks/familySelection/useFamiliesWithProgress';

const mockUser = { id: 7, audience: 'college', username: 'test' };

const makeFamilyRow = (id: number): FamilyWithProgress => ({
  id,
  module_slug: 'vocab',
  name: `Family ${id}`,
  icon: '📚',
  emoji: '📚',
  description: '',
  order_index: id,
  completed: 3,
  total: 10,
  progress: 30,
});

// ============================================
// Sans user / DB
// ============================================

describe('useFamiliesWithProgress — sans user ou DB', () => {
  it('isLoading=false et families=[] si DB null', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: null, user: mockUser });

    const { result } = renderHook(() => useFamiliesWithProgress('vocab', 1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.families).toEqual([]);
  });

  it('isLoading=false si user null', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: null });

    const { result } = renderHook(() => useFamiliesWithProgress('vocab', 1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.families).toEqual([]);
    expect(mockDb.getAllAsync).not.toHaveBeenCalled();
  });
});

// ============================================
// Avec user — params de la requête
// ============================================

describe('useFamiliesWithProgress — paramètres SQL avec user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: mockUser });
    mockDb.getAllAsync.mockResolvedValue([makeFamilyRow(1), makeFamilyRow(2)]);
  });

  it('passe levelId et userId dans les params', async () => {
    const { result } = renderHook(() => useFamiliesWithProgress('vocab', 3));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const [, params] = mockDb.getAllAsync.mock.calls[0];
    expect(params).toContain(3);    // levelId
    expect(params).toContain(7);    // userId
  });

  it('passe moduleId dans les params (slug et cast)', async () => {
    const { result } = renderHook(() => useFamiliesWithProgress('reading', 1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const [, params] = mockDb.getAllAsync.mock.calls[0];
    expect(params).toContain('reading');
  });

  it('retourne les familles parsées', async () => {
    const { result } = renderHook(() => useFamiliesWithProgress('vocab', 1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.families).toHaveLength(2);
    expect(result.current.families[0].id).toBe(1);
    expect(result.current.families[1].id).toBe(2);
  });

  it('progress et completed sont transmis', async () => {
    const { result } = renderHook(() => useFamiliesWithProgress('vocab', 1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const family = result.current.families[0];
    expect(family.progress).toBe(30);
    expect(family.completed).toBe(3);
    expect(family.total).toBe(10);
  });
});

// ============================================
// moduleId numérique
// ============================================

describe('useFamiliesWithProgress — moduleId numérique', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: mockUser });
    mockDb.getAllAsync.mockResolvedValue([]);
  });

  it('convertit moduleId numérique en string pour les params', async () => {
    const { result } = renderHook(() => useFamiliesWithProgress(5, 1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const [, params] = mockDb.getAllAsync.mock.calls[0];
    expect(params).toContain('5');
  });
});

// ============================================
// Erreur DB
// ============================================

describe('useFamiliesWithProgress — erreur DB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: mockUser });
    mockDb.getAllAsync.mockRejectedValue(new Error('DB error'));
  });

  it('families reste [] sans planter', async () => {
    const { result } = renderHook(() => useFamiliesWithProgress('vocab', 1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.families).toEqual([]);
  });
});

// ============================================
// refresh()
// ============================================

describe('useFamiliesWithProgress — refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb, user: mockUser });
    mockDb.getAllAsync.mockResolvedValue([]);
  });

  it('refresh() déclenche un nouveau fetch', async () => {
    const { result } = renderHook(() => useFamiliesWithProgress('vocab', 1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const callsBefore = mockDb.getAllAsync.mock.calls.length;

    await act(async () => {
      await result.current.refresh();
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockDb.getAllAsync.mock.calls.length).toBeGreaterThan(callsBefore);
  });
});
