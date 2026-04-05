/**
 * Tests — useGameState + useGameHandlers
 *
 * useGameState : state machine pour tous les types de jeux WordGames
 * useGameHandlers : event handlers (onAnswer, onValidate, onRetry, onNext)
 */

import { renderHook, act } from '@testing-library/react-native';

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

import { useGameState } from '@/screens/WordGames/hooks/useGameState';
import { useGameHandlers } from '@/screens/WordGames/hooks/useGameHandlers';
import type { UseGameHandlersParams } from '@/screens/WordGames/hooks/useGameHandlers';

// ============================================
// useGameState
// ============================================

describe('useGameState — état initial', () => {
  it('définitionState est à zéro', () => {
    const { result } = renderHook(() => useGameState('definition'));
    expect(result.current.definitionState).toEqual({
      selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0,
    });
  });

  it('detectiveState.selectedWord est null', () => {
    const { result } = renderHook(() => useGameState('detective'));
    expect(result.current.detectiveState.selectedWord).toBeNull();
  });

  it('sentenceState.selectedOrder est vide', () => {
    const { result } = renderHook(() => useGameState('sentence'));
    expect(result.current.sentenceState.selectedOrder).toEqual([]);
  });
});

describe('useGameState — getCurrentState', () => {
  it('retourne le bon état pour "definition"', () => {
    const { result } = renderHook(() => useGameState('definition'));
    expect(result.current.getCurrentState()).toEqual(result.current.definitionState);
  });

  it('retourne le bon état pour "sentence"', () => {
    const { result } = renderHook(() => useGameState('sentence'));
    expect(result.current.getCurrentState()).toEqual(result.current.sentenceState);
  });

  it('retourne null pour "speed" (pas d\'état géré)', () => {
    const { result } = renderHook(() => useGameState('speed'));
    expect(result.current.getCurrentState()).toBeNull();
  });

  it('retourne null pour "audio_match"', () => {
    const { result } = renderHook(() => useGameState('audio_match'));
    expect(result.current.getCurrentState()).toBeNull();
  });
});

describe('useGameState — resetAllStates', () => {
  it('remet tous les états à zéro', () => {
    const { result } = renderHook(() => useGameState('definition'));

    act(() => {
      result.current.setDefinitionState(prev => ({ ...prev, selectedOption: 'A', isValidated: true }));
      result.current.setDetectiveState(prev => ({ ...prev, selectedWord: 2, isValidated: true }));
    });

    act(() => { result.current.resetAllStates(); });

    expect(result.current.definitionState.selectedOption).toBeNull();
    expect(result.current.definitionState.isValidated).toBe(false);
    expect(result.current.detectiveState.selectedWord).toBeNull();
  });
});

// ============================================
// useGameHandlers
// ============================================

const makeStates = () => {
  const { result } = renderHook(() => useGameState('definition'));
  return result;
};

const mockTrackItemCompletion = jest.fn();
const mockSafeGoBack = { navigate: jest.fn() };
const mockSetCurrentIndex = jest.fn();

function makeParams(question: unknown, states: ReturnType<typeof makeStates>['current'], isLastQuestion = false): UseGameHandlersParams {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    question: question as any,
    isLastQuestion,
    safeGoBack: mockSafeGoBack,
    setCurrentQuestionIndex: mockSetCurrentIndex,
    states,
    progress: {
      trackItemCompletion: mockTrackItemCompletion,
      numLevelId: 1,
      familyId: 'fam_1',
      totalQuestions: 5,
      currentQuestionIndex: 0,
    },
  };
}

// Helper: combined renderHook (fixes stale closure issue when handlers depend on state)
function useGameHook(question: unknown, isLast = false) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const states = useGameState((question as any).type);
  const handlers = useGameHandlers(makeParams(question, states, isLast));
  return { states, handlers };
}

describe('useGameHandlers — definition (option QCM)', () => {
  const definitionQuestion = {
    type: 'definition' as const,
    difficulty: 'easy' as const,
    word: 'apple', definition: 'A fruit',
    options: ['A fruit', 'A vegetable', 'A drink', 'A snack'],
    correctAnswer: 'A fruit',
  };

  beforeEach(() => jest.clearAllMocks());

  it('onAnswer → met à jour definitionState.selectedOption', () => {
    const { result } = renderHook(() => useGameHook(definitionQuestion));

    act(() => { result.current.handlers.definition.onAnswer('A fruit'); });

    expect(result.current.states.definitionState.selectedOption).toBe('A fruit');
  });

  it('onValidate avec bonne réponse → isCorrect=true, trackItemCompletion appelé', () => {
    const { result } = renderHook(() => useGameHook(definitionQuestion));

    act(() => { result.current.handlers.definition.onAnswer('A fruit'); });
    act(() => { result.current.handlers.definition.onValidate(); });

    expect(result.current.states.definitionState.isCorrect).toBe(true);
    expect(result.current.states.definitionState.isValidated).toBe(true);
    expect(mockTrackItemCompletion).toHaveBeenCalled();
  });

  it('onValidate avec mauvaise réponse → isCorrect=false', () => {
    const { result } = renderHook(() => useGameHook(definitionQuestion));

    act(() => { result.current.handlers.definition.onAnswer('A vegetable'); });
    act(() => { result.current.handlers.definition.onValidate(); });

    expect(result.current.states.definitionState.isCorrect).toBe(false);
    expect(result.current.states.definitionState.isValidated).toBe(true);
  });

  it('onRetry → reset selectedOption et isValidated', () => {
    const { result } = renderHook(() => useGameHook(definitionQuestion));

    act(() => { result.current.handlers.definition.onAnswer('A vegetable'); });
    act(() => { result.current.handlers.definition.onValidate(); });
    act(() => { result.current.handlers.definition.onRetry(); });

    expect(result.current.states.definitionState.selectedOption).toBeNull();
    expect(result.current.states.definitionState.isValidated).toBe(false);
  });

  it('onNext (dernière question) → appelle safeGoBack.navigate()', () => {
    const { result } = renderHook(() => useGameHook(definitionQuestion, true));

    act(() => { result.current.handlers.definition.onNext(); });

    expect(mockSafeGoBack.navigate).toHaveBeenCalled();
    expect(mockSetCurrentIndex).not.toHaveBeenCalled();
  });

  it('onNext (pas dernière question) → avance l\'index', () => {
    const { result } = renderHook(() => useGameHook(definitionQuestion, false));

    act(() => { result.current.handlers.definition.onNext(); });

    expect(mockSetCurrentIndex).toHaveBeenCalled();
    expect(mockSafeGoBack.navigate).not.toHaveBeenCalled();
  });
});

describe('useGameHandlers — detective', () => {
  const detectiveQuestion = {
    type: 'detective' as const,
    difficulty: 'medium' as const,
    sentence: 'He don\'t like it.',
    errorWordIndex: 1,
    correctWord: 'doesn\'t',
    explanation: 'Use doesn\'t for he/she/it.',
  };

  beforeEach(() => jest.clearAllMocks());

  it('onAnswer → sélectionne le bon index de mot', () => {
    const { result } = renderHook(() => useGameHook(detectiveQuestion));

    act(() => { result.current.handlers.detective.onAnswer(1); });

    expect(result.current.states.detectiveState.selectedWord).toBe(1);
  });

  it('onValidate avec bonne sélection → isCorrect=true', () => {
    const { result } = renderHook(() => useGameHook(detectiveQuestion));

    act(() => { result.current.handlers.detective.onAnswer(1); });
    act(() => { result.current.handlers.detective.onValidate(); });

    expect(result.current.states.detectiveState.isCorrect).toBe(true);
    expect(mockTrackItemCompletion).toHaveBeenCalled();
  });

  it('onValidate sans sélection → rien ne se passe', () => {
    const { result } = renderHook(() => useGameHook(detectiveQuestion));

    act(() => { result.current.handlers.detective.onValidate(); });

    expect(result.current.states.detectiveState.isValidated).toBe(false);
    expect(mockTrackItemCompletion).not.toHaveBeenCalled();
  });
});

describe('useGameHandlers — sentence builder', () => {
  const sentenceQuestion = {
    type: 'sentence' as const,
    difficulty: 'medium' as const,
    words: ['is', 'She', 'student', 'a'],
    correctOrder: ['She', 'is', 'a', 'student'],
    translation: 'Elle est une étudiante.',
  };

  beforeEach(() => jest.clearAllMocks());

  it('onOrder → met à jour l\'ordre sélectionné', () => {
    const { result } = renderHook(() => useGameHook(sentenceQuestion));

    act(() => { result.current.handlers.sentence.onOrder(['She', 'is', 'a', 'student']); });

    expect(result.current.states.sentenceState.selectedOrder).toEqual(['She', 'is', 'a', 'student']);
  });

  it('onValidate avec bon ordre → isCorrect=true', () => {
    const { result } = renderHook(() => useGameHook(sentenceQuestion));

    act(() => { result.current.handlers.sentence.onOrder(['She', 'is', 'a', 'student']); });
    act(() => { result.current.handlers.sentence.onValidate(); });

    expect(result.current.states.sentenceState.isCorrect).toBe(true);
    expect(mockTrackItemCompletion).toHaveBeenCalled();
  });

  it('onRetry → remet l\'ordre à vide', () => {
    const { result } = renderHook(() => useGameHook(sentenceQuestion));

    act(() => { result.current.handlers.sentence.onOrder(['is', 'She']); });
    act(() => { result.current.handlers.sentence.onValidate(); });
    act(() => { result.current.handlers.sentence.onRetry(); });

    expect(result.current.states.sentenceState.selectedOrder).toEqual([]);
    expect(result.current.states.sentenceState.isValidated).toBe(false);
  });
});

describe('useGameHandlers — speed / audio_match (timed)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('speed.onComplete → trackItemCompletion + navigation', () => {
    const speedQuestion = { type: 'speed' as const, difficulty: 'easy' as const, pairs: [], timeLimit: 30 };
    const { result } = renderHook(() => useGameHook(speedQuestion, false));

    act(() => { result.current.handlers.speed.onComplete(); });

    expect(mockTrackItemCompletion).toHaveBeenCalled();
    expect(mockSetCurrentIndex).toHaveBeenCalled(); // not last → avance
  });

  it('audio_match.onComplete → trackItemCompletion', () => {
    const audioQuestion = { type: 'audio_match' as const, difficulty: 'easy' as const, pairs: [], timeLimit: 30 };
    const { result } = renderHook(() => useGameHook(audioQuestion, false));

    act(() => { result.current.handlers.audio_match.onComplete(); });

    expect(mockTrackItemCompletion).toHaveBeenCalled();
  });
});
