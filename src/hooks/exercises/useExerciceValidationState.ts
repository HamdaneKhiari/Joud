import { useMemo } from 'react';

// Doit rester aligné avec ExerciseValidation/types.ts
export type ValidationState = 'initial' | 'correct' | 'incorrect' | 'skip';

interface ValidationResult {
  canSkip: boolean;
  validationState: ValidationState;
  buttonDisabled: boolean;
}

export const useExerciseValidationState = (
  isValidated: boolean,
  isCorrect: boolean,
  attemptCount: number = 0,
  maxAttempts: number = 3,
  hasAnswer: boolean = false
): ValidationResult => {

  const validationData = useMemo(() => {
    // On peut passer à la suite si c'est correct OU si on a épuisé les tentatives
    const canSkip = isCorrect || attemptCount >= maxAttempts;

    let validationState: ValidationState = 'initial';
    let buttonDisabled = !hasAnswer;

    if (isValidated) {
      if (isCorrect) {
        validationState = 'correct';
        buttonDisabled = false;
      } else if (canSkip) {
        // C'est faux mais on n'a plus d'essais : on affiche la solution/bouton skip
        validationState = 'skip';
        buttonDisabled = false;
      } else {
        // C'est faux mais il reste des essais : on utilise 'incorrect' (= réessayer)
        validationState = 'incorrect';
        buttonDisabled = false;
      }
    }

    return {
      canSkip,
      validationState,
      buttonDisabled,
    };
  }, [isValidated, isCorrect, attemptCount, maxAttempts, hasAnswer]);

  return validationData;
};

export default useExerciseValidationState;