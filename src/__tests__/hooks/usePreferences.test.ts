/**
 * Tests de hooks — usePreferences
 * Couvre : valeurs par défaut, lecture AsyncStorage, updatePref, loaded state
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

// ============================================
// Mock AsyncStorage
// ============================================

const mockGetItem = jest.fn();
const mockSetItem = jest.fn().mockResolvedValue(undefined);

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

import { usePreferences } from '@/hooks/usePreferences';

// ============================================
// Valeurs par défaut
// ============================================

describe('usePreferences — valeurs par défaut', () => {
  beforeEach(() => {
    mockGetItem.mockResolvedValue(null); // Rien en storage
  });

  it('hapticsEnabled = true par défaut', async () => {
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.prefs.hapticsEnabled).toBe(true);
  });

  it('loaded démarre à false, passe à true après lecture', async () => {
    const { result } = renderHook(() => usePreferences());
    // loaded commence à false (avant l'effet)
    await waitFor(() => expect(result.current.loaded).toBe(true));
  });
});

// ============================================
// Lecture depuis AsyncStorage
// ============================================

describe('usePreferences — lecture AsyncStorage', () => {
  it('charge les préférences stockées', async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify({ hapticsEnabled: false })
    );

    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    expect(result.current.prefs.hapticsEnabled).toBe(false);
  });

  it('prefs partielles sont complétées par les défauts', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({}));

    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    expect(result.current.prefs.hapticsEnabled).toBe(true); // valeur par défaut
  });

  it('JSON invalide → loaded=true, valeurs par défaut', async () => {
    mockGetItem.mockResolvedValue('NOT_VALID_JSON');

    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    // Valeurs par défaut conservées
    expect(result.current.prefs.hapticsEnabled).toBe(true);
  });

  it('erreur AsyncStorage → loaded=true, valeurs par défaut', async () => {
    mockGetItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    expect(result.current.prefs.hapticsEnabled).toBe(true);
  });
});

// ============================================
// updatePref
// ============================================

describe('usePreferences — updatePref', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
  });

  it('met à jour hapticsEnabled immédiatement', async () => {
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.updatePref('hapticsEnabled', false);
    });

    expect(result.current.prefs.hapticsEnabled).toBe(false);
  });

  it('persiste la mise à jour dans AsyncStorage', async () => {
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.updatePref('hapticsEnabled', false);
    });

    await waitFor(() => expect(mockSetItem).toHaveBeenCalled());
    const [, json] = mockSetItem.mock.calls[0];
    const saved = JSON.parse(json);
    expect(saved.hapticsEnabled).toBe(false);
  });
});
