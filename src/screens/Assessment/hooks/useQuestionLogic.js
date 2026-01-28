// ============================================
// FICHIER: src/screens/exercises/Assessment/hooks/useQuestionLogic.js
// 🎯 Hook centralisé pour la logique des questions
// ============================================

import { useCallback } from 'react';

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
}) => {
  // Handler pour les choix multiples (Definition/Sentence)
  const handleSelectOption = useCallback((option) => {
    if (isValidated) return;
    onAnswer(option);
  }, [isValidated, onAnswer]);

  // Handler pour les inputs (Blanks)
  const handleInputChange = useCallback((text) => {
    if (isValidated) return;
    onAnswer(text);
  }, [isValidated, onAnswer]);

  // Déterminer l'état d'une option (pour choix multiples)
  const getOptionState = useCallback((option) => {
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
  }, [userAnswer, question.correctAnswer, isValidated, isCorrect]);

  return {
    handleSelectOption,
    handleInputChange,
    getOptionState,
  };
};