// ============================================
// FICHIER: src/screens/exercises/Connector/hooks/useConnectorHandlers.js
// Gestion des handlers pour les exercices Connector
// ============================================

import { useCallback } from 'react';

const MAX_ATTEMPTS = 2;

// Fonction pour normaliser les réponses (enlever les espaces, majuscules, etc.)
const normalizeAnswer = (text) => {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
};

export const useConnectorHandlers = ({
  question: currentQuestion,
  isLastQuestion,
  safeGoBack,
  setCurrentQuestionIndex,
  states,
  progress,
}) => {
  const {
    logicState, setLogicState,
    fusionState, setFusionState,
    rephrasingState, setRephrasingState,
    resetAllStates,
  } = states;

  const { trackItemCompletion, numLevelId, familyId, totalQuestions, currentQuestionIndex } = progress;

  // Navigation centralisée
  const handleNavigationNext = useCallback(() => {
    if (isLastQuestion) {
      safeGoBack.navigate();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      resetAllStates();
    }
  }, [isLastQuestion, safeGoBack, setCurrentQuestionIndex, resetAllStates]);

  // ===== LOGIC LINKS (comme Blanks) =====
  const handleLogicAnswer = useCallback((option) => {
    setLogicState(prev => ({ ...prev, selectedOption: option }));
  }, [setLogicState]);

  const handleLogicValidate = useCallback(() => {
    if (!logicState.selectedOption) return;
    const correct = logicState.selectedOption === currentQuestion.correctAnswer;
    setLogicState(prev => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1
    }));
  }, [logicState.selectedOption, currentQuestion, setLogicState]);

  const handleLogicRetry = useCallback(() => {
    setLogicState(prev => ({ ...prev, selectedOption: null, isValidated: false, isCorrect: false }));
  }, [setLogicState]);

  const handleLogicNext = handleNavigationNext;

  // ===== SENTENCE FUSION (input texte) =====
  const handleFusionAnswer = useCallback((text) => {
    setFusionState(prev => ({ ...prev, userAnswer: text }));
  }, [setFusionState]);

  const handleFusionValidate = useCallback(() => {
    if (!fusionState.userAnswer || !fusionState.userAnswer.trim()) return;
    const userNormalized = normalizeAnswer(fusionState.userAnswer);
    const correctNormalized = normalizeAnswer(currentQuestion.correctAnswer);
    const correct = userNormalized === correctNormalized;
    setFusionState(prev => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1
    }));
  }, [fusionState.userAnswer, currentQuestion, setFusionState]);

  const handleFusionRetry = useCallback(() => {
    setFusionState(prev => ({ ...prev, userAnswer: '', isValidated: false, isCorrect: false }));
  }, [setFusionState]);

  const handleFusionNext = handleNavigationNext;

  // ===== REPHRASING (input texte avec instruction) =====
  const handleRephrasingAnswer = useCallback((text) => {
    setRephrasingState(prev => ({ ...prev, userAnswer: text }));
  }, [setRephrasingState]);

  const handleRephrasingValidate = useCallback(() => {
    if (!rephrasingState.userAnswer || !rephrasingState.userAnswer.trim()) return;
    const userNormalized = normalizeAnswer(rephrasingState.userAnswer);
    const correctNormalized = normalizeAnswer(currentQuestion.correctAnswer);
    const correct = userNormalized === correctNormalized;
    setRephrasingState(prev => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1
    }));
  }, [rephrasingState.userAnswer, currentQuestion, setRephrasingState]);

  const handleRephrasingRetry = useCallback(() => {
    setRephrasingState(prev => ({ ...prev, userAnswer: '', isValidated: false, isCorrect: false }));
  }, [setRephrasingState]);

  const handleRephrasingNext = handleNavigationNext;

  return {
    logic: {
      onAnswer: handleLogicAnswer,
      onValidate: handleLogicValidate,
      onRetry: handleLogicRetry,
      onNext: handleLogicNext,
    },
    fusion: {
      onAnswer: handleFusionAnswer,
      onValidate: handleFusionValidate,
      onRetry: handleFusionRetry,
      onNext: handleFusionNext,
    },
    rephrasing: {
      onAnswer: handleRephrasingAnswer,
      onValidate: handleRephrasingValidate,
      onRetry: handleRephrasingRetry,
      onNext: handleRephrasingNext,
    },
  };
};
