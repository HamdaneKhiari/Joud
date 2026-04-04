/**
 * Tests de hooks — useSafeAction
 * Couvre : debounce, loading state, callbacks (onStart, onEnd, onError), cleanup
 */

import { renderHook, act } from '@testing-library/react-native';
import useSafeAction from '@/hooks/useSafeAction';

// Helper pour attendre l'expiration du debounce interne (100ms max)
const flushDebounce = () => new Promise<void>(resolve => setTimeout(resolve, 150));

// ============================================
// État initial
// ============================================

describe('useSafeAction — état initial', () => {
  it('loading démarre à false', () => {
    const { result } = renderHook(() => useSafeAction());
    expect(result.current.loading).toBe(false);
  });

  it('disabled démarre à false', () => {
    const { result } = renderHook(() => useSafeAction());
    expect(result.current.disabled).toBe(false);
  });

  it('lastExecuted démarre à 0', () => {
    const { result } = renderHook(() => useSafeAction());
    expect(result.current.lastExecuted).toBe(0);
  });
});

// ============================================
// Exécution de l'action
// ============================================

describe('useSafeAction — exécution', () => {
  it('exécute l\'action initiale', async () => {
    const action = jest.fn().mockResolvedValue('ok');
    const { result } = renderHook(() => useSafeAction(action));

    await act(async () => {
      await result.current.execute();
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('exécute une action dynamique passée à execute()', async () => {
    const initial = jest.fn().mockResolvedValue('initial');
    const dynamic = jest.fn().mockResolvedValue('dynamic');
    const { result } = renderHook(() => useSafeAction(initial));

    await act(async () => {
      await result.current.execute(dynamic);
    });

    expect(dynamic).toHaveBeenCalledTimes(1);
    expect(initial).not.toHaveBeenCalled();
  });

  it('ne plante pas si aucune action fournie', async () => {
    const { result } = renderHook(() => useSafeAction());

    await act(async () => {
      // Ne doit pas throw
      await result.current.execute();
    });
    // Aucune erreur → test réussi
  });

  it('retourne le résultat de l\'action', async () => {
    const action = jest.fn().mockResolvedValue(42);
    const { result } = renderHook(() => useSafeAction(action));

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.execute();
    });

    expect(returnValue).toBe(42);
  });
});

// ============================================
// Debounce
// ============================================

describe('useSafeAction — debounce', () => {
  it('bloque un deuxième appel immédiat (debounce)', async () => {
    jest.useFakeTimers();
    const action = jest.fn().mockResolvedValue('ok');
    const { result } = renderHook(() => useSafeAction(action, { debounceMs: 300 }));

    // Premier appel
    await act(async () => {
      result.current.execute();
    });

    // Deuxième appel immédiat — doit être ignoré
    await act(async () => {
      result.current.execute();
    });

    expect(action).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});

// ============================================
// Callbacks
// ============================================

describe('useSafeAction — callbacks', () => {
  it('appelle onStart avant l\'action', async () => {
    const sequence: string[] = [];
    const action = jest.fn().mockImplementation(async () => {
      sequence.push('action');
      return 'done';
    });
    const onStart = jest.fn().mockImplementation(() => sequence.push('onStart'));

    const { result } = renderHook(() =>
      useSafeAction(action, { onStart, debounceMs: 0 })
    );

    await act(async () => {
      await result.current.execute();
      await flushDebounce();
    });

    expect(sequence.indexOf('onStart')).toBeLessThan(sequence.indexOf('action'));
  });

  it('appelle onEnd avec le résultat', async () => {
    const onEnd = jest.fn();
    const action = jest.fn().mockResolvedValue('result_value');

    const { result } = renderHook(() =>
      useSafeAction(action, { onEnd, debounceMs: 0 })
    );

    await act(async () => {
      await result.current.execute();
      await flushDebounce();
    });

    expect(onEnd).toHaveBeenCalledWith('result_value');
  });

  it('appelle onError si l\'action lance une exception', async () => {
    const error = new Error('test error');
    const action = jest.fn().mockRejectedValue(error);
    const onError = jest.fn();

    const { result } = renderHook(() =>
      useSafeAction(action, { onError, debounceMs: 0 })
    );

    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // erreur attendue, propagée depuis le hook
      }
      await flushDebounce();
    });

    expect(onError).toHaveBeenCalledWith(error);
  });
});

// ============================================
// Cleanup
// ============================================

describe('useSafeAction — cleanup', () => {
  it('cleanup() s\'exécute sans erreur', () => {
    const { result } = renderHook(() => useSafeAction());
    expect(() => result.current.cleanup()).not.toThrow();
  });
});
