import { useMemo } from 'react';
import { useExerciseValidationState } from '../../../../hooks/exercises/useExerciceValidationState';
import { generateFeedbackMessage } from '../../../../utils/feedback';

export const useConnectorFeedback = (
  isValidated: boolean,
  isCorrect: boolean,
  attemptCount: number,
  maxAttempts: number,
  hasAnswer: boolean,
  correctAnswer: string
) => {
  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    hasAnswer
  );

  const feedbackData = useMemo(() => {
    const feedback = generateFeedbackMessage(
      isValidated,
      isCorrect,
      canSkip,
      correctAnswer,
      attemptCount,
      maxAttempts
    );
    return feedback ? { title: feedback.title, message: feedback.message } : undefined;
  }, [isValidated, isCorrect, canSkip, correctAnswer, attemptCount, maxAttempts]);

  return { canSkip, validationState, buttonDisabled, feedbackData };
};

export default useConnectorFeedback;
