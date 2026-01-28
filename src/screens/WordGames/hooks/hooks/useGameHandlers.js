// src/hooks/useGameHandlers.js
import { useCallback } from 'react'; // ✅ useMemo supprimé (S7748/Unused)
import { useErrorTracking } from '../../../../hooks/useErrorTracking';

const MAX_ATTEMPTS = 2;

/**
 * Hook optimisé pour gérer les actions des différents jeux
 */
export const useGameHandlers = ({
  question: currentQuestion,
  isLastQuestion,
  safeGoBack,
  setCurrentQuestionIndex,
  states,
  progress,
}) => {
  // ✅ TRACKING D'ERREURS
  const { trackErrorAuto } = useErrorTracking();

  // Déstructuration des états
  const {
    builderState, setBuilderState,
    definitionState, setDefinitionState,
    blanksState, setBlanksState,
    sentenceState, setSentenceState,
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
    
    // ✅ TRACKING D'ERREUR
    if (!correct) {
      trackErrorAuto('word_games', {
        question: currentQuestion.question || currentQuestion.word,
        userAnswer: builderState.selectedOption,
        correctAnswer: currentQuestion.correct,
        ruleId: familyId,
      });
    }
    
    setBuilderState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));
  }, [builderState.selectedOption, currentQuestion, setBuilderState, trackErrorAuto, familyId]);

  const handleBuilderRetry = useCallback(() => {
    setBuilderState(prev => ({ ...prev, selectedOption: null, isValidated: false, isCorrect: false }));
  }, [setBuilderState]);

  // ✅ Utilise la fonction centralisée
  const handleBuilderNext = handleNavigationNext;

  // ===== DEFINITION =====
  const handleDefinitionAnswer = useCallback((option) => {
    setDefinitionState(prev => ({ ...prev, selectedOption: option }));
  }, [setDefinitionState]);

  const handleDefinitionValidate = useCallback(() => {
    if (!definitionState.selectedOption) return;
    const correct = definitionState.selectedOption === currentQuestion.correctAnswer;
    
    // ✅ TRACKING D'ERREUR
    if (!correct) {
      const correctAnswerText = currentQuestion.options?.[currentQuestion.correctAnswer] || currentQuestion.correctAnswer;
      trackErrorAuto('word_games', {
        question: currentQuestion.word || currentQuestion.question,
        userAnswer: definitionState.selectedOption,
        correctAnswer: correctAnswerText,
        ruleId: familyId,
      });
    }
    
    setDefinitionState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));
  }, [definitionState.selectedOption, currentQuestion, setDefinitionState, trackErrorAuto, familyId]);

  const handleDefinitionRetry = useCallback(() => {
    setDefinitionState(prev => ({ ...prev, selectedOption: null, isValidated: false, isCorrect: false }));
  }, [setDefinitionState]);

  // ✅ Utilise la fonction centralisée
  const handleDefinitionNext = handleNavigationNext;

  // ===== BLANKS =====
  const handleBlanksAnswer = useCallback((option) => {
    setBlanksState(prev => ({ ...prev, selectedOption: option }));
  }, [setBlanksState]);

  const handleBlanksValidate = useCallback(() => {
    if (!blanksState.selectedOption) return;
    const correct = blanksState.selectedOption === currentQuestion.correctAnswer;
    
    // ✅ TRACKING D'ERREUR
    if (!correct) {
      const correctAnswerText = currentQuestion.options?.[currentQuestion.correctAnswer] || currentQuestion.correctAnswer;
      trackErrorAuto('word_games', {
        question: currentQuestion.sentence || currentQuestion.question,
        userAnswer: blanksState.selectedOption,
        correctAnswer: correctAnswerText,
        ruleId: familyId,
      });
    }
    
    setBlanksState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));
  }, [blanksState.selectedOption, currentQuestion, setBlanksState, trackErrorAuto, familyId]);

  const handleBlanksRetry = useCallback(() => {
    setBlanksState(prev => ({ ...prev, selectedOption: null, isValidated: false, isCorrect: false }));
  }, [setBlanksState]);

  // ✅ Utilise la fonction centralisée
  const handleBlanksNext = handleNavigationNext;

  // ===== SENTENCE =====
  const handleSentenceOrder = useCallback((orderedWords) => {
    setSentenceState(prev => ({ ...prev, selectedOrder: orderedWords }));
  }, [setSentenceState]);

  const handleSentenceValidate = useCallback(() => {
    if (sentenceState.selectedOrder.length === 0) return;
    const correct = JSON.stringify(sentenceState.selectedOrder) === JSON.stringify(currentQuestion.correct);
    
    // ✅ TRACKING D'ERREUR
    if (!correct) {
      trackErrorAuto('word_games', {
        question: currentQuestion.sentence || 'Réorganise les mots',
        userAnswer: sentenceState.selectedOrder.join(' '),
        correctAnswer: currentQuestion.correct.join(' '),
        ruleId: familyId,
      });
    }
    
    setSentenceState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));
  }, [sentenceState.selectedOrder, currentQuestion, setSentenceState, trackErrorAuto, familyId]);

  const handleSentenceRetry = useCallback(() => {
    setSentenceState(prev => ({ ...prev, selectedOrder: [], isValidated: false, isCorrect: false }));
  }, [setSentenceState]);

  // ✅ Utilise la fonction centralisée
  const handleSentenceNext = handleNavigationNext;

  // ===== SPEED =====
  const handleSpeedComplete = useCallback(() => {
    trackItemCompletion(numLevelId, 'word_games', familyId, currentQuestionIndex, totalQuestions);
    // ✅ Utilise la logique de navigation partagée
    if (isLastQuestion) {
      safeGoBack.navigate();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [trackItemCompletion, numLevelId, familyId, currentQuestionIndex, totalQuestions, isLastQuestion, safeGoBack, setCurrentQuestionIndex]);

  // ===== DETECTIVE =====
  const handleDetectiveComplete = useCallback((isCorrect) => {
    trackItemCompletion(numLevelId, 'word_games', familyId, currentQuestionIndex, totalQuestions);
    if (isLastQuestion) {
      safeGoBack.navigate();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [trackItemCompletion, numLevelId, familyId, currentQuestionIndex, totalQuestions, isLastQuestion, safeGoBack, setCurrentQuestionIndex]);

  // ===== IDIOMS =====
  const handleIdiomsComplete = useCallback((isCorrect) => {
    trackItemCompletion(numLevelId, 'word_games', familyId, currentQuestionIndex, totalQuestions);
    if (isLastQuestion) {
      safeGoBack.navigate();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [trackItemCompletion, numLevelId, familyId, currentQuestionIndex, totalQuestions, isLastQuestion, safeGoBack, setCurrentQuestionIndex]);

  return {
    builder: { onAnswer: handleBuilderAnswer, onValidate: handleBuilderValidate, onRetry: handleBuilderRetry, onNext: handleBuilderNext },
    definition: { onAnswer: handleDefinitionAnswer, onValidate: handleDefinitionValidate, onRetry: handleDefinitionRetry, onNext: handleDefinitionNext },
    blanks: { onAnswer: handleBlanksAnswer, onValidate: handleBlanksValidate, onRetry: handleBlanksRetry, onNext: handleBlanksNext },
    sentence: { onOrder: handleSentenceOrder, onValidate: handleSentenceValidate, onRetry: handleSentenceRetry, onNext: handleSentenceNext },
    speed: { onComplete: handleSpeedComplete },
    detective: { onComplete: handleDetectiveComplete },
    idioms: { onComplete: handleIdiomsComplete },
  };
};