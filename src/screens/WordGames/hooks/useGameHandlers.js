// src/hooks/useGameHandlers.js
import { useCallback } from 'react';

const MAX_ATTEMPTS = 2;

/**
 * Hook optimisé pour gérer les actions des différents jeux
 * ✅ REFACTORISÉ : Handlers standardisés pour idioms et detective
 */
export const useGameHandlers = ({
  question: currentQuestion,
  isLastQuestion,
  safeGoBack,
  setCurrentQuestionIndex,
  states,
  progress,
}) => {
  // Déstructuration des états
  const {
    builderState, setBuilderState,
    definitionState, setDefinitionState,
    blanksState, setBlanksState,
    sentenceState, setSentenceState,
    idiomsState, setIdiomsState,
    detectiveState, setDetectiveState,
    resetAllStates,
  } = states;

  // Déstructuration progression
  const { trackItemCompletion, numLevelId, familyId, totalQuestions, currentQuestionIndex } = progress;

  // =========================================================
  // ✅ CORRECTION SONAR: Centralisation de la navigation
  // On sépare la logique de "Fin" et de "Suivant" pour éviter
  // d'utiliser isLastQuestion partout dans le code (Clean Design).
  // =========================================================

  const handleNavigationNext = useCallback(() => {
    if (isLastQuestion) {
      safeGoBack.navigate();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      resetAllStates();
    }
  }, [isLastQuestion, safeGoBack, setCurrentQuestionIndex, resetAllStates]);

  // ===== BUILDER =====
  const handleBuilderAnswer = useCallback((text) => {
    setBuilderState(prev => ({ ...prev, selectedOption: text }));
  }, [setBuilderState]);

  const handleBuilderValidate = useCallback(() => {
    if (!builderState.selectedOption) return;
    const correct = builderState.selectedOption.toLowerCase().trim() === currentQuestion.correct.toLowerCase();
    setBuilderState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));
  }, [builderState.selectedOption, currentQuestion, setBuilderState]);

  const handleBuilderRetry = useCallback(() => {
    setBuilderState(prev => ({ ...prev, selectedOption: null, isValidated: false, isCorrect: false }));
  }, [setBuilderState]);

  const handleBuilderNext = handleNavigationNext;

  // ===== DEFINITION =====
  const handleDefinitionAnswer = useCallback((option) => {
    setDefinitionState(prev => ({ ...prev, selectedOption: option }));
  }, [setDefinitionState]);

  const handleDefinitionValidate = useCallback(() => {
    if (!definitionState.selectedOption) return;
    const correct = definitionState.selectedOption === currentQuestion.correctAnswer;
    setDefinitionState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));

    // Track completion si correct ou dernière tentative
    if (correct || definitionState.attemptCount + 1 >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, 'word_games', familyId, currentQuestionIndex, totalQuestions);
    }
  }, [definitionState.selectedOption, definitionState.attemptCount, currentQuestion, setDefinitionState, trackItemCompletion, numLevelId, familyId, currentQuestionIndex, totalQuestions]);

  const handleDefinitionRetry = useCallback(() => {
    setDefinitionState(prev => ({ ...prev, selectedOption: null, isValidated: false, isCorrect: false }));
  }, [setDefinitionState]);

  const handleDefinitionNext = handleNavigationNext;

  // ===== BLANKS =====
  const handleBlanksAnswer = useCallback((option) => {
    setBlanksState(prev => ({ ...prev, selectedOption: option }));
  }, [setBlanksState]);

  const handleBlanksValidate = useCallback(() => {
    if (!blanksState.selectedOption) return;
    const correct = blanksState.selectedOption === currentQuestion.correctAnswer;
    setBlanksState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));

    // Track completion si correct ou dernière tentative
    if (correct || blanksState.attemptCount + 1 >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, 'word_games', familyId, currentQuestionIndex, totalQuestions);
    }
  }, [blanksState.selectedOption, blanksState.attemptCount, currentQuestion, setBlanksState, trackItemCompletion, numLevelId, familyId, currentQuestionIndex, totalQuestions]);

  const handleBlanksRetry = useCallback(() => {
    setBlanksState(prev => ({ ...prev, selectedOption: null, isValidated: false, isCorrect: false }));
  }, [setBlanksState]);

  const handleBlanksNext = handleNavigationNext;

  // ===== SENTENCE =====
  const handleSentenceOrder = useCallback((orderedWords) => {
    setSentenceState(prev => ({ ...prev, selectedOrder: orderedWords }));
  }, [setSentenceState]);

  const handleSentenceValidate = useCallback(() => {
    if (sentenceState.selectedOrder.length === 0) return;
    const correct = JSON.stringify(sentenceState.selectedOrder) === JSON.stringify(currentQuestion.correct);
    setSentenceState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));

    // Track completion si correct ou dernière tentative
    if (correct || sentenceState.attemptCount + 1 >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, 'word_games', familyId, currentQuestionIndex, totalQuestions);
    }
  }, [sentenceState.selectedOrder, sentenceState.attemptCount, currentQuestion, setSentenceState, trackItemCompletion, numLevelId, familyId, currentQuestionIndex, totalQuestions]);

  const handleSentenceRetry = useCallback(() => {
    setSentenceState(prev => ({ ...prev, selectedOrder: [], isValidated: false, isCorrect: false }));
  }, [setSentenceState]);

  const handleSentenceNext = handleNavigationNext;

  // ===== IDIOMS (✅ REFACTORISÉ) =====
  const handleIdiomsAnswer = useCallback((option) => {
    setIdiomsState(prev => ({ ...prev, selectedOption: option }));
  }, [setIdiomsState]);

  const handleIdiomsValidate = useCallback(() => {
    if (!idiomsState.selectedOption) return;
    const correct = idiomsState.selectedOption === currentQuestion.correctMeaning;
    setIdiomsState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));

    // Track completion si correct ou dernière tentative
    if (correct || idiomsState.attemptCount + 1 >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, 'word_games', familyId, currentQuestionIndex, totalQuestions);
    }
  }, [idiomsState.selectedOption, idiomsState.attemptCount, currentQuestion, setIdiomsState, trackItemCompletion, numLevelId, familyId, currentQuestionIndex, totalQuestions]);

  const handleIdiomsRetry = useCallback(() => {
    setIdiomsState(prev => ({ ...prev, selectedOption: null, isValidated: false, isCorrect: false }));
  }, [setIdiomsState]);

  const handleIdiomsNext = handleNavigationNext;

  // ===== DETECTIVE (✅ REFACTORISÉ - Register Switcher) =====
  const handleDetectiveAnswer = useCallback((wordIndex) => {
    setDetectiveState(prev => ({ ...prev, selectedWord: wordIndex }));
  }, [setDetectiveState]);

  const handleDetectiveValidate = useCallback(() => {
    if (detectiveState.selectedWord === null || detectiveState.selectedWord === undefined) return;

    const words = currentQuestion.sentence.split(' ');
    const errorIndex = words.indexOf(currentQuestion.errorWord);
    const correct = detectiveState.selectedWord === errorIndex;

    setDetectiveState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));

    // Track completion si correct ou dernière tentative
    if (correct || detectiveState.attemptCount + 1 >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, 'word_games', familyId, currentQuestionIndex, totalQuestions);
    }
  }, [detectiveState.selectedWord, detectiveState.attemptCount, currentQuestion, setDetectiveState, trackItemCompletion, numLevelId, familyId, currentQuestionIndex, totalQuestions]);

  const handleDetectiveRetry = useCallback(() => {
    setDetectiveState(prev => ({ ...prev, selectedWord: null, isValidated: false, isCorrect: false }));
  }, [setDetectiveState]);

  const handleDetectiveNext = handleNavigationNext;

  // ===== SPEED =====
  const handleSpeedComplete = useCallback(() => {
    trackItemCompletion(numLevelId, 'word_games', familyId, currentQuestionIndex, totalQuestions);
    handleNavigationNext();
  }, [trackItemCompletion, numLevelId, familyId, currentQuestionIndex, totalQuestions, handleNavigationNext]);

  return {
    builder: { onAnswer: handleBuilderAnswer, onValidate: handleBuilderValidate, onRetry: handleBuilderRetry, onNext: handleBuilderNext },
    definition: { onAnswer: handleDefinitionAnswer, onValidate: handleDefinitionValidate, onRetry: handleDefinitionRetry, onNext: handleDefinitionNext },
    blanks: { onAnswer: handleBlanksAnswer, onValidate: handleBlanksValidate, onRetry: handleBlanksRetry, onNext: handleBlanksNext },
    sentence: { onOrder: handleSentenceOrder, onValidate: handleSentenceValidate, onRetry: handleSentenceRetry, onNext: handleSentenceNext },
    idioms: { onAnswer: handleIdiomsAnswer, onValidate: handleIdiomsValidate, onRetry: handleIdiomsRetry, onNext: handleIdiomsNext },
    detective: { onAnswer: handleDetectiveAnswer, onValidate: handleDetectiveValidate, onRetry: handleDetectiveRetry, onNext: handleDetectiveNext },
    speed: { onComplete: handleSpeedComplete },
  };
};
