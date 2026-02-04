import { useCallback } from 'react';

interface UseReadingHandlersProps {
  question: any;
  isLastQuestion: boolean;
  onFinish: () => void; // ✅ Ajouté pour corriger l'erreur TS
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  state: any;
  setState: any;
  resetState: () => void;
  onError?: (params: { question: string; userAnswer: string; correctAnswer: string }) => void;
  maxAttempts?: number;
}

export const useReadingHandlers = ({
  question,
  isLastQuestion,
  onFinish,
  setCurrentQuestionIndex,
  state,
  setState,
  resetState,
  onError,
  maxAttempts,
}: UseReadingHandlersProps) => {

  const handleAnswer = useCallback((option: string) => {
    if (state.isValidated) return;
    setState((prev: any) => ({ ...prev, selectedOption: option }));
  }, [state.isValidated, setState]);

  const handleValidate = useCallback(() => {
    if (!state.selectedOption) return;

    // On compare la lettre choisie (A, B, C...) avec la bonne réponse
    const isCorrect = state.selectedOption === question.correct_answer;
    const newAttemptCount = state.attemptCount + 1;

    setState((prev: any) => ({
      ...prev,
      isValidated: true,
      isCorrect,
      attemptCount: newAttemptCount
    }));

    // ✅ Enregistrer l'erreur si dernier essai échoué → Coach IA
    if (!isCorrect && maxAttempts && newAttemptCount >= maxAttempts && onError) {
      onError({
        question: question.question_text || '',
        userAnswer: state.selectedOption,
        correctAnswer: question.correct_answer || '',
      });
    }
  }, [state.selectedOption, state.attemptCount, question, setState, onError, maxAttempts]);

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