import { useState, useCallback } from 'react';
import { ReadingState } from '../../../components/pedagogy/reading/types';

export const useReadingState = () => {
  const [state, setState] = useState<ReadingState>({
    selectedOption: undefined,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
    isPlaying: false,
  });

  const resetState = useCallback(() => {
    setState({
      selectedOption: undefined,
      isValidated: false,
      isCorrect: false,
      attemptCount: 0,
      isPlaying: false,
    });
  }, []);

  return {
    state,
    setState,
    resetState
  };
};