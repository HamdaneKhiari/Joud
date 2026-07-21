import { useCallback } from 'react';
import {
  LogicQuestion,
  FusionQuestion,
  RephrasingQuestion
} from '../../../components/pedagogy/Connector/types';
import type { useConnectorState, UnifiedConnectorState } from './useConnectorState';

type ConnectorStates = ReturnType<typeof useConnectorState>;
type StateSetter = (updater: (prev: UnifiedConnectorState) => UnifiedConnectorState) => void;

const normalizeAnswer = (text: string) => {
  return text.toLowerCase().trim().replaceAll(/\s+/g, ' ');
};

interface UseConnectorHandlersProps {
  question: LogicQuestion | FusionQuestion | RephrasingQuestion | undefined;
  isLastQuestion: boolean;
  onNavigateBack: () => void;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  states: ConnectorStates;
  onValidationSuccess: () => void;
  recordError?: (userAnswer: string) => void;
  maxAttempts?: number;
}

const DEFAULT_MAX_ATTEMPTS = 2;

export const useConnectorHandlers = ({
  question: currentQuestion,
  isLastQuestion,
  onNavigateBack,
  setCurrentQuestionIndex,
  states,
  onValidationSuccess,
  recordError,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
}: UseConnectorHandlersProps) => {
  const {
    logicState, setLogicState,
    fusionState, setFusionState,
    rephrasingState, setRephrasingState,
    resetAllStates,
  } = states;

  const handleNavigationNext = useCallback(() => {
    if (isLastQuestion) {
      onNavigateBack();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetAllStates();
    }
  }, [isLastQuestion, onNavigateBack, setCurrentQuestionIndex, resetAllStates]);

  const validateInputExercise = useCallback((
    userAnswer: string | undefined,
    correctAnswer: string,
    attemptCount: number,
    setState: StateSetter
  ) => {
    if (!userAnswer?.trim()) return;

    const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);

    setState((prev) => ({
      ...prev,
      isValidated: true,
      isCorrect,
      attemptCount: prev.attemptCount + 1
    }));

    if (isCorrect) {
      onValidationSuccess();
    } else if (attemptCount + 1 >= maxAttempts) {
      // Ne remonte au Coach IA qu'à la tentative finale (évite le bruit des retries)
      recordError?.(userAnswer);
    }
  }, [onValidationSuccess, recordError, maxAttempts]);

  return {
    logic: {
      onAnswer: (option: string) => setLogicState((prev) => ({ ...prev, selectedOption: option })),
      onValidate: () => {
        if (!logicState.selectedOption || !currentQuestion) return;
        const q = currentQuestion as LogicQuestion;
        const isCorrect = normalizeAnswer(logicState.selectedOption) === normalizeAnswer(q.correctAnswer);
        setLogicState((prev) => ({ ...prev, isValidated: true, isCorrect, attemptCount: prev.attemptCount + 1 }));
        if (isCorrect) {
          onValidationSuccess();
        } else if (logicState.attemptCount + 1 >= maxAttempts) {
          recordError?.(logicState.selectedOption);
        }
      },
      onRetry: () => setLogicState((prev) => ({ ...prev, selectedOption: undefined, isValidated: false, isCorrect: false })),
      onNext: handleNavigationNext,
    },
    fusion: {
      onAnswer: (text: string) => setFusionState((prev) => ({ ...prev, userAnswer: text })),
      onValidate: () => currentQuestion && validateInputExercise(fusionState.userAnswer, (currentQuestion as FusionQuestion).correctAnswer, fusionState.attemptCount, setFusionState),
      onRetry: () => setFusionState((prev) => ({ ...prev, userAnswer: undefined, isValidated: false, isCorrect: false })),
      onNext: handleNavigationNext,
    },
    rephrasing: {
      onAnswer: (text: string) => setRephrasingState((prev) => ({ ...prev, userAnswer: text })),
      onValidate: () => currentQuestion && validateInputExercise(rephrasingState.userAnswer, (currentQuestion as RephrasingQuestion).correctAnswer, rephrasingState.attemptCount, setRephrasingState),
      onRetry: () => setRephrasingState((prev) => ({ ...prev, userAnswer: undefined, isValidated: false, isCorrect: false })),
      onNext: handleNavigationNext,
    },
  };
};