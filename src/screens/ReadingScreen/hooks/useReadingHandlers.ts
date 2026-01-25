import { useCallback } from 'react';

interface UseReadingHandlersProps {
  question: any;
  isLastQuestion: boolean;
  onFinish: () => void; // ✅ Ajouté pour corriger l'erreur TS
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  state: any;
  setState: any;
  resetState: () => void;
}

export const useReadingHandlers = ({
  question,
  isLastQuestion,
  onFinish,
  setCurrentQuestionIndex,
  state,
  setState,
  resetState,
}: UseReadingHandlersProps) => {

  const handleAnswer = useCallback((option: string) => {
    if (state.isValidated) return;
    setState((prev: any) => ({ ...prev, selectedOption: option }));
  }, [state.isValidated, setState]);

  const handleValidate = useCallback(() => {
    if (!state.selectedOption) return;
    
    // On compare la lettre choisie (A, B, C...) avec la bonne réponse
    const isCorrect = state.selectedOption === question.correct_answer;

    setState((prev: any) => ({
      ...prev,
      isValidated: true,
      isCorrect,
      attemptCount: prev.attemptCount + 1
    }));
  }, [state.selectedOption, question, setState]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      onFinish(); // ✅ On appelle la fin de l'exercice
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetState();
    }
  }, [isLastQuestion, onFinish, setCurrentQuestionIndex, resetState]);

  const handleRetry = useCallback(() => {
    setState((prev: any) => ({
      ...prev,
      selectedOption: undefined,
      isValidated: false,
      isCorrect: false
    }));
  }, [setState]);

  return {
    onAnswer: handleAnswer,
    onValidate: handleValidate,
    onNext: handleNext,
    onRetry: handleRetry
  };
};