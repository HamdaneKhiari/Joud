/**
 * Tests — CurrentLevelContext
 *
 * Couvre : chargement initial (AsyncStorage), fallback DB, setCurrentLevel,
 *          validation des bornes (1-4), useCurrentLevel hors Provider.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';

// ============================================
// Mocks
// ============================================

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/contexts/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

// ============================================
// Imports — après tous les jest.mock()
// ============================================

import { CurrentLevelProvider, useCurrentLevel } from '@/contexts/CurrentLevelContext';

// ============================================
// Helpers
// ============================================

const makeDb = (overrides: Partial<Record<string, jest.Mock>> = {}) => ({
  getFirstAsync: jest.fn().mockResolvedValue(null),
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
  getAllAsync: jest.fn().mockResolvedValue([]),
  ...overrides,
});

const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CurrentLevelProvider>{children}</CurrentLevelProvider>
);

function setupUser(db: ReturnType<typeof makeDb> | null = makeDb(), user = { id: 'u1', audience: 'college' }) {
  const { useUser } = require('@/contexts/UserContext');
  useUser.mockReturnValue({ db, user });
}

// ============================================
// Tests
// ============================================

describe('CurrentLevelContext — état initial', () => {
  beforeEach(() => jest.clearAllMocks());

  it('niveau initial = 1 (valeur par défaut)', async () => {
    setupUser(makeDb());
    mockGetItem.mockResolvedValue(null);

    const { result } = renderHook(() => useCurrentLevel(), { wrapper });

    expect(result.current.currentLevel).toBe(1);
  });

  it('levelLabel = "Level 1" par défaut', async () => {
    setupUser(makeDb());
    mockGetItem.mockResolvedValue(null);

    const { result } = renderHook(() => useCurrentLevel(), { wrapper });
    expect(result.current.levelLabel).toBe('Level 1');
  });
});

describe('CurrentLevelContext — chargement AsyncStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetItem.mockResolvedValue(undefined);
  });

  it('charge le niveau depuis AsyncStorage si valide (1-4)', async () => {
    setupUser(makeDb());
    mockGetItem.mockResolvedValue('3');

    const { result } = renderHook(() => useCurrentLevel(), { wrapper });

    await act(flushPromises);

    expect(result.current.currentLevel).toBe(3);
  });

  it('ignore AsyncStorage si valeur invalide (> 4) → fallback DB ou 1', async () => {
    const db = makeDb({ getFirstAsync: jest.fn().mockResolvedValue(null) });
    setupUser(db);
    mockGetItem.mockResolvedValue('10'); // Hors bornes

    const { result } = renderHook(() => useCurrentLevel(), { wrapper });

    await act(flushPromises);

    // Valeur invalide → reste à 1 ou prend le fallback DB (null ici → 1)
    expect(result.current.currentLevel).toBe(1);
  });

  it('ignore AsyncStorage si valeur = 0 (< 1)', async () => {
    const db = makeDb({ getFirstAsync: jest.fn().mockResolvedValue(null) });
    setupUser(db);
    mockGetItem.mockResolvedValue('0');

    const { result } = renderHook(() => useCurrentLevel(), { wrapper });
    await act(flushPromises);

    expect(result.current.currentLevel).toBe(1);
  });
});

describe('CurrentLevelContext — fallback DB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null); // AsyncStorage vide
    mockSetItem.mockResolvedValue(undefined);
  });

  it('charge le niveau depuis activity_log si AsyncStorage vide', async () => {
    const db = makeDb({
      getFirstAsync: jest.fn().mockResolvedValue({ level: 2 }),
    });
    setupUser(db);

    const { result } = renderHook(() => useCurrentLevel(), { wrapper });
    await act(flushPromises);

    expect(result.current.currentLevel).toBe(2);
    // Sauvegarde aussi dans AsyncStorage
    expect(mockSetItem).toHaveBeenCalledWith('JOUD_CURRENT_LEVEL', '2');
  });

  it('reste à 1 si activity_log vide et AsyncStorage vide', async () => {
    const db = makeDb({ getFirstAsync: jest.fn().mockResolvedValue(null) });
    setupUser(db);

    const { result } = renderHook(() => useCurrentLevel(), { wrapper });
    await act(flushPromises);

    expect(result.current.currentLevel).toBe(1);
  });

  it('reste à 1 si db=null', async () => {
    setupUser(null);

    const { result } = renderHook(() => useCurrentLevel(), { wrapper });
    await act(flushPromises);

    expect(result.current.currentLevel).toBe(1);
  });
});

describe('CurrentLevelContext — setCurrentLevel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
  });

  it('met à jour le niveau et persiste dans AsyncStorage', async () => {
    setupUser(makeDb());

    const { result } = renderHook(() => useCurrentLevel(), { wrapper });
    await act(flushPromises);

    await act(async () => {
      await result.current.setCurrentLevel(4);
    });

    expect(result.current.currentLevel).toBe(4);
    expect(mockSetItem).toHaveBeenCalledWith('JOUD_CURRENT_LEVEL', '4');
  });

  it('ignore les valeurs hors bornes (< 1 ou > 4)', async () => {
    setupUser(makeDb());

    const { result } = renderHook(() => useCurrentLevel(), { wrapper });
    await act(flushPromises);

    await act(async () => {
      await result.current.setCurrentLevel(0);
      await result.current.setCurrentLevel(5);
    });

    expect(result.current.currentLevel).toBe(1); // Inchangé
    expect(mockSetItem).not.toHaveBeenCalledWith('JOUD_CURRENT_LEVEL', '0');
    expect(mockSetItem).not.toHaveBeenCalledWith('JOUD_CURRENT_LEVEL', '5');
  });

  it('ne plante pas si AsyncStorage.setItem échoue', async () => {
    setupUser(makeDb());
    mockSetItem.mockRejectedValue(new Error('Storage full'));

    const { result } = renderHook(() => useCurrentLevel(), { wrapper });

    await act(async () => {
      await expect(result.current.setCurrentLevel(2)).resolves.not.toThrow();
    });
  });
});

describe('useCurrentLevel — hors Provider', () => {
  it('lance une erreur si utilisé hors Provider', () => {
    // Silence l'erreur React console
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useCurrentLevel())).toThrow(
      'useCurrentLevel must be used within CurrentLevelProvider'
    );
    jest.restoreAllMocks();
  });
});
