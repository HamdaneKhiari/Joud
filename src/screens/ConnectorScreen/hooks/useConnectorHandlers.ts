import { useCallback } from 'react';
import { 
  LogicQuestion, 
  FusionQuestion, 
  RephrasingQuestion 
} from '../../../components/pedagogy/Connector/types';

const normalizeAnswer = (text: string) => {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
};

interface UseConnectorHandlersProps {
  question: any; // Can be LogicQuestion | FusionQuestion | RephrasingQuestion
  isLastQuestion: boolean;
  onNavigateBack: () => void;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  states: any; // Return type of useConnectorState
  onValidationSuccess: () => void; // Callback for progress tracking
}

export const useConnectorHandlers = ({
  question: currentQuestion,
  isLastQuestion,
  onNavigateBack,
  setCurrentQuestionIndex,
  states,
  onValidationSuccess,
}: UseConnectorHandlersProps) => {
  const {
    logicState, setLogicState,
    fusionState, setFusionState,
    rephrasingState, setRephrasingState,
    resetAllStates,
  } = states;

  // Navigation centralisée
  const handleNavigationNext = useCallback(() => {
    if (isLastQuestion) {
      onNavigateBack();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetAllStates();
    }
  }, [isLastQuestion, onNavigateBack, setCurrentQuestionIndex, resetAllStates]);

  // ===== LOGIC LINKS =====
  const handleLogicAnswer = useCallback((option: string) => {
    setLogicState((prev: any) => ({ ...prev, selectedOption: option }));
  }, [setLogicState]);

  const handleLogicValidate = useCallback(() => {
    if (!logicState.selectedOption) return;
    const q = currentQuestion as LogicQuestion;
    const correct = logicState.selectedOption === q.correctAnswer;
    
    setLogicState((prev: any) => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1
    }));

    if (correct) onValidationSuccess();
  }, [logicState.selectedOption, currentQuestion, setLogicState, onValidationSuccess]);

  const handleLogicRetry = useCallback(() => {
    setLogicState((prev: any) => ({ ...prev, selectedOption: undefined, isValidated: false, isCorrect: false }));
  }, [setLogicState]);

  // ===== SENTENCE FUSION =====
  const handleFusionAnswer = useCallback((text: string) => {
    setFusionState((prev: any) => ({ ...prev, userAnswer: text }));
  }, [setFusionState]);

  const handleFusionValidate = useCallback(() => {
    if (!fusionState.userAnswer || !fusionState.userAnswer.trim()) return;
    const q = currentQuestion as FusionQuestion;
    const userNormalized = normalizeAnswer(fusionState.userAnswer);
    const correctNormalized = normalizeAnswer(q.correctAnswer);
    const correct = userNormalized === correctNormalized;
    
    setFusionState((prev: any) => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1
    }));

    if (correct) onValidationSuccess();
  }, [fusionState.userAnswer, currentQuestion, setFusionState, onValidationSuccess]);

  const handleFusionRetry = useCallback(() => {
    setFusionState((prev: any) => ({ ...prev, userAnswer: undefined, isValidated: false, isCorrect: false }));
  }, [setFusionState]);

  // ===== REPHRASING =====
  const handleRephrasingAnswer = useCallback((text: string) => {
    setRephrasingState((prev: any) => ({ ...prev, userAnswer: text }));
  }, [setRephrasingState]);

  const handleRephrasingValidate = useCallback(() => {
    if (!rephrasingState.userAnswer || !rephrasingState.userAnswer.trim()) return;
    const q = currentQuestion as RephrasingQuestion;
    const userNormalized = normalizeAnswer(rephrasingState.userAnswer);
    const correctNormalized = normalizeAnswer(q.correctAnswer);
    const correct = userNormalized === correctNormalized;
    
    setRephrasingState((prev: any) => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1
    }));

    if (correct) onValidationSuccess();
  }, [rephrasingState.userAnswer, currentQuestion, setRephrasingState, onValidationSuccess]);

  const handleRephrasingRetry = useCallback(() => {
    setRephrasingState((prev: any) => ({ ...prev, userAnswer: undefined, isValidated: false, isCorrect: false }));
  }, [setRephrasingState]);

  return {
    logic: {
      onAnswer: handleLogicAnswer,
      onValidate: handleLogicValidate,
      onRetry: handleLogicRetry,
      onNext: handleNavigationNext,
    },
    fusion: {
      onAnswer: handleFusionAnswer,
      onValidate: handleFusionValidate,
      onRetry: handleFusionRetry,
      onNext: handleNavigationNext,
    },
    rephrasing: {
      onAnswer: handleRephrasingAnswer,
      onValidate: handleRephrasingValidate,
      onRetry: handleRephrasingRetry,
      onNext: handleNavigationNext,
    },
  };
};