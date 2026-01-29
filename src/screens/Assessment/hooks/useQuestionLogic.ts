/**
 * ============================================
 * USE QUESTION LOGIC (TypeScript)
 * Hook centralisé pour la logique des questions
 * ============================================
 */

import { useCallback } from 'react';

// ============================================
// TYPES
// ============================================

interface UseQuestionLogicParams {
  question: {
    correctAnswer: string;
    [key: string]: any;
  };
  onAnswer: (answer: string) => void;
  userAnswer: string | null;
  isValidated: boolean;
  isCorrect: boolean;
}

interface OptionState {
  isSelected: boolean;
  isCorrectOption: boolean;
  showCorrect: boolean;
  showIncorrect: boolean;
}

// ============================================
// HOOK
// ============================================

/**
 * Hook partagé pour gérer la logique commune de toutes les questions
 * Élimine la duplication entre QuestionDefinition, QuestionBlanks, QuestionSentence
 */
export const useQuestionLogic = ({
  question,
  onAnswer,
  userAnswer,
  isValidated,
  isCorrect,
}: UseQuestionLogicParams) => {
  // Handler pour les choix multiples (Definition/Sentence)
  const handleSelectOption = useCallback(
    (option: string) => {
      if (isValidated) return;
      onAnswer(option);
    },
    [isValidated, onAnswer]
  );

  // Handler pour les inputs (Blanks)
  const handleInputChange = useCallback(
    (text: string) => {
      if (isValidated) return;
      onAnswer(text);
    },
    [isValidated, onAnswer]
  );

  // Déterminer l'état d'une option (pour choix multiples)
  const getOptionState = useCallback(
    (option: string): OptionState => {
      const isSelected = userAnswer === option;
      const isCorrectOption = option === question.correctAnswer;
      const showCorrect = isValidated && isCorrectOption;
      const showIncorrect = isValidated && isSelected && !isCorrect;

      return {
        isSelected,
        isCorrectOption,
        showCorrect,
        showIncorrect,
      };
    },
    [userAnswer, question.correctAnswer, isValidated, isCorrect]
  );

  return {
    handleSelectOption,
    handleInputChange,
    getOptionState,
  };
};
