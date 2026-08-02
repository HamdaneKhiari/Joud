/**
 * Tests — useReadingState (état d'un exercice de lecture)
 */

import { renderHook, act } from '@testing-library/react-native';
import { useReadingState } from '@/screens/ReadingScreen/hooks/useReadingState';

const INITIAL_STATE = {
  selectedOption: undefined,
  isValidated: false,
  isCorrect: false,
  attemptCount: 0,
  isPlaying: false,
};

describe('useReadingState', () => {
  it('état initial correct', () => {
    const { result } = renderHook(() => useReadingState());
    expect(result.current.state).toEqual(INITIAL_STATE);
  });

  it('setState met à jour l\'état', () => {
    const { result } = renderHook(() => useReadingState());

    act(() => {
      result.current.setState((prev) => ({ ...prev, selectedOption: 'A', isValidated: true, isCorrect: true }));
    });

    expect(result.current.state).toEqual({
      ...INITIAL_STATE, selectedOption: 'A', isValidated: true, isCorrect: true,
    });
  });

  it('resetState ramène à l\'état initial après modification', () => {
    const { result } = renderHook(() => useReadingState());

    act(() => {
      result.current.setState({
        selectedOption: 'B', isValidated: true, isCorrect: false, attemptCount: 2, isPlaying: true,
      });
    });
    expect(result.current.state.attemptCount).toBe(2);

    act(() => { result.current.resetState(); });

    expect(result.current.state).toEqual(INITIAL_STATE);
  });
});
