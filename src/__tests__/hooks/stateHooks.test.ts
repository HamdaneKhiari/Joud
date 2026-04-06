/**
 * Tests: useExerciceValidationState + useConnectorState + useReadingHandlers
 * Hooks d'état purs (pas de DB, pas de contexte externe).
 */

import { renderHook, act } from '@testing-library/react-native';

// ──────────────────────────────────────────────
// useExerciceValidationState — pure useMemo logic
// ──────────────────────────────────────────────

describe('useExerciceValidationState', () => {
  const { useExerciseValidationState } = require('@/hooks/exercises/useExerciceValidationState');

  it('état initial : validationState=initial, buttonDisabled si pas de réponse', () => {
    const { result } = renderHook(() =>
      useExerciseValidationState(false, false, 0, 3, false)
    );
    expect(result.current.validationState).toBe('initial');
    expect(result.current.buttonDisabled).toBe(true);
    expect(result.current.canSkip).toBe(false);
  });

  it('hasAnswer=true → bouton actif même si pas encore validé', () => {
    const { result } = renderHook(() =>
      useExerciseValidationState(false, false, 0, 3, true)
    );
    expect(result.current.buttonDisabled).toBe(false);
  });

  it('isValidated + isCorrect → validationState=correct, bouton actif, canSkip=true', () => {
    const { result } = renderHook(() =>
      useExerciseValidationState(true, true, 1, 3, true)
    );
    expect(result.current.validationState).toBe('correct');
    expect(result.current.buttonDisabled).toBe(false);
    expect(result.current.canSkip).toBe(true);
  });

  it('isValidated + incorrect + essais restants → validationState=incorrect', () => {
    const { result } = renderHook(() =>
      useExerciseValidationState(true, false, 1, 3, true)
    );
    expect(result.current.validationState).toBe('incorrect');
    expect(result.current.canSkip).toBe(false);
  });

  it('isValidated + incorrect + épuisé → validationState=skip, canSkip=true', () => {
    const { result } = renderHook(() =>
      useExerciseValidationState(true, false, 3, 3, true)
    );
    expect(result.current.validationState).toBe('skip');
    expect(result.current.canSkip).toBe(true);
    expect(result.current.buttonDisabled).toBe(false);
  });

  it('attemptCount >= maxAttempts mais pas validé → canSkip=true, état=initial', () => {
    const { result } = renderHook(() =>
      useExerciseValidationState(false, false, 5, 3, true)
    );
    expect(result.current.canSkip).toBe(true);
    expect(result.current.validationState).toBe('initial');
  });
});

// ──────────────────────────────────────────────
// useConnectorState — state machine unifiée
// ──────────────────────────────────────────────

describe('useConnectorState', () => {
  const { useConnectorState } = require('@/screens/ConnectorScreen/hooks/useConnectorState');

  it('état initial à zéro', () => {
    const { result } = renderHook(() => useConnectorState('logic'));
    const { logicState } = result.current;
    expect(logicState.isValidated).toBe(false);
    expect(logicState.isCorrect).toBe(false);
    expect(logicState.attemptCount).toBe(0);
    expect(logicState.selectedOption).toBeUndefined();
  });

  it('les 3 états (logic, fusion, rephrasing) pointent vers le même objet', () => {
    const { result } = renderHook(() => useConnectorState('logic'));
    expect(result.current.logicState).toBe(result.current.fusionState);
    expect(result.current.fusionState).toBe(result.current.rephrasingState);
  });

  it('setLogicState met à jour l\'état', () => {
    const { result } = renderHook(() => useConnectorState('logic'));
    act(() => {
      result.current.setLogicState(prev => ({ ...prev, selectedOption: 'because', isValidated: true, isCorrect: true, attemptCount: 1 }));
    });
    expect(result.current.logicState.selectedOption).toBe('because');
    expect(result.current.logicState.isValidated).toBe(true);
  });

  it('resetAllStates remet tout à zéro', () => {
    const { result } = renderHook(() => useConnectorState('fusion'));
    act(() => {
      result.current.setFusionState(prev => ({ ...prev, userAnswer: 'hello', isValidated: true, isCorrect: true, attemptCount: 2 }));
    });
    act(() => { result.current.resetAllStates(); });
    expect(result.current.fusionState.userAnswer).toBeUndefined();
    expect(result.current.fusionState.isValidated).toBe(false);
    expect(result.current.fusionState.attemptCount).toBe(0);
  });
});

// ──────────────────────────────────────────────
// useReadingHandlers — handlers purs
// ──────────────────────────────────────────────

describe('useReadingHandlers', () => {
  const { useReadingHandlers } = require('@/screens/ReadingScreen/hooks/useReadingHandlers');

  const makeQuestion = (correct = 'A') => ({
    id: 1,
    question_text: 'What is the main idea?',
    correct_answer: correct,
    options: [{ letter: 'A', text: 'Option A' }, { letter: 'B', text: 'Option B' }],
  });

  const makeState = (overrides = {}) => ({
    selectedOption: undefined,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
    ...overrides,
  });

  it('handleAnswer sélectionne une option', () => {
    const setState = jest.fn();
    const { result } = renderHook(() => useReadingHandlers({
      question: makeQuestion(),
      isLastQuestion: false,
      onFinish: jest.fn(),
      setCurrentQuestionIndex: jest.fn(),
      state: makeState(),
      setState,
      resetState: jest.fn(),
    }));
    act(() => { result.current.onAnswer('A'); });
    expect(setState).toHaveBeenCalled();
  });

  it('handleAnswer ignoré si déjà validé', () => {
    const setState = jest.fn();
    const { result } = renderHook(() => useReadingHandlers({
      question: makeQuestion(),
      isLastQuestion: false,
      onFinish: jest.fn(),
      setCurrentQuestionIndex: jest.fn(),
      state: makeState({ isValidated: true }),
      setState,
      resetState: jest.fn(),
    }));
    act(() => { result.current.onAnswer('B'); });
    expect(setState).not.toHaveBeenCalled();
  });

  it('handleValidate sans option sélectionnée → rien ne se passe', () => {
    const setState = jest.fn();
    const { result } = renderHook(() => useReadingHandlers({
      question: makeQuestion(),
      isLastQuestion: false,
      onFinish: jest.fn(),
      setCurrentQuestionIndex: jest.fn(),
      state: makeState({ selectedOption: undefined }),
      setState,
      resetState: jest.fn(),
    }));
    act(() => { result.current.onValidate(); });
    expect(setState).not.toHaveBeenCalled();
  });

  it('handleValidate avec bonne réponse → setState avec isCorrect=true', () => {
    const setState = jest.fn();
    const { result } = renderHook(() => useReadingHandlers({
      question: makeQuestion('A'),
      isLastQuestion: false,
      onFinish: jest.fn(),
      setCurrentQuestionIndex: jest.fn(),
      state: makeState({ selectedOption: 'A' }),
      setState,
      resetState: jest.fn(),
    }));
    act(() => { result.current.onValidate(); });
    const updater = setState.mock.calls[0][0];
    const newState = updater(makeState({ selectedOption: 'A' }));
    expect(newState.isCorrect).toBe(true);
    expect(newState.isValidated).toBe(true);
  });

  it('handleValidate avec mauvaise réponse → onError si dernier essai', () => {
    const setState = jest.fn();
    const onError = jest.fn();
    const { result } = renderHook(() => useReadingHandlers({
      question: makeQuestion('A'),
      isLastQuestion: false,
      onFinish: jest.fn(),
      setCurrentQuestionIndex: jest.fn(),
      state: makeState({ selectedOption: 'B', attemptCount: 2 }),
      setState,
      resetState: jest.fn(),
      onError,
      maxAttempts: 3,
    }));
    act(() => { result.current.onValidate(); });
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ userAnswer: 'B', correctAnswer: 'A' }));
  });

  it('handleNext sur dernière question → onFinish', () => {
    const onFinish = jest.fn();
    const { result } = renderHook(() => useReadingHandlers({
      question: makeQuestion(),
      isLastQuestion: true,
      onFinish,
      setCurrentQuestionIndex: jest.fn(),
      state: makeState(),
      setState: jest.fn(),
      resetState: jest.fn(),
    }));
    act(() => { result.current.onNext(); });
    expect(onFinish).toHaveBeenCalled();
  });

  it('handleNext pas dernière question → avance l\'index et reset', () => {
    const setCurrentQuestionIndex = jest.fn();
    const resetState = jest.fn();
    const { result } = renderHook(() => useReadingHandlers({
      question: makeQuestion(),
      isLastQuestion: false,
      onFinish: jest.fn(),
      setCurrentQuestionIndex,
      state: makeState(),
      setState: jest.fn(),
      resetState,
    }));
    act(() => { result.current.onNext(); });
    expect(setCurrentQuestionIndex).toHaveBeenCalled();
    expect(resetState).toHaveBeenCalled();
  });

  it('handleRetry remet l\'état de sélection à zéro', () => {
    const setState = jest.fn();
    const { result } = renderHook(() => useReadingHandlers({
      question: makeQuestion(),
      isLastQuestion: false,
      onFinish: jest.fn(),
      setCurrentQuestionIndex: jest.fn(),
      state: makeState({ selectedOption: 'B', isValidated: true }),
      setState,
      resetState: jest.fn(),
    }));
    act(() => { result.current.onRetry(); });
    const updater = setState.mock.calls[0][0];
    const newState = updater(makeState({ selectedOption: 'B', isValidated: true }));
    expect(newState.selectedOption).toBeUndefined();
    expect(newState.isValidated).toBe(false);
  });
});
