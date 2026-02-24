/**
 * ============================================
 * HOOK: useGameHandlers
 * Gestionnaires d'événements pour tous les types de jeux WordGames
 * ============================================
 */

import { useCallback } from 'react';
import type { GameQuestion } from '../schema';
import type { UseGameStateReturn } from './useGameState';

// ============================================
// TYPES
// ============================================

/**
 * Interface pour la navigation sécurisée (useSafeNavigation)
 */
interface SafeNavigation {
  navigate: () => void;
}

/**
 * Données de progression (depuis ProgressContext)
 */
interface ProgressData {
  trackItemCompletion: (
    levelId: number,
    moduleId: string,
    familyId: string,
    itemIndex: number,
    totalItems: number
  ) => void;
  numLevelId: number;
  familyId: string;
  totalQuestions: number;
  currentQuestionIndex: number;
}

/**
 * Paramètres du hook
 */
export interface UseGameHandlersParams {
  question: GameQuestion;
  isLastQuestion: boolean;
  safeGoBack: SafeNavigation;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  states: UseGameStateReturn;
  progress: ProgressData;
}

/**
 * Handlers pour jeux avec options (Definition, Blanks, Reply, Transformer, Builder)
 */
interface OptionGameHandlers {
  onAnswer: (option: string) => void;
  onValidate: () => void;
  onRetry: () => void;
  onNext: () => void;
}

/**
 * Handlers pour jeu Sentence Builder
 */
interface SentenceGameHandlers {
  onOrder: (orderedWords: string[]) => void;
  onValidate: () => void;
  onRetry: () => void;
  onNext: () => void;
}

/**
 * Handlers pour jeu Detective
 */
interface DetectiveGameHandlers {
  onAnswer: (wordIndex: number) => void;
  onValidate: () => void;
  onRetry: () => void;
  onNext: () => void;
}

/**
 * Handlers pour jeux avec timer interne (Speed Match, Audio Match)
 */
interface TimedGameHandlers {
  onComplete: () => void;
}

/**
 * Valeur de retour du hook (tous les handlers par type de jeu)
 */
export interface UseGameHandlersReturn {
  builder: OptionGameHandlers;
  definition: OptionGameHandlers;
  blanks: OptionGameHandlers;
  sentence: SentenceGameHandlers;
  detective: DetectiveGameHandlers;
  speed: TimedGameHandlers;
  audio_match: TimedGameHandlers;
  reply: OptionGameHandlers;
  transformer: OptionGameHandlers;
}

// ============================================
// CONSTANTS
// ============================================

const MAX_ATTEMPTS = 2;
const MODULE_ID = 'word_games';

// ============================================
// HOOK
// ============================================

/**
 * Hook de gestion des handlers pour les jeux WordGames
 * Gère les événements onAnswer, onValidate, onRetry, onNext pour chaque type de jeu
 */
export const useGameHandlers = ({
  question: currentQuestion,
  isLastQuestion,
  safeGoBack,
  setCurrentQuestionIndex,
  states,
  progress,
}: UseGameHandlersParams): UseGameHandlersReturn => {
  // Déstructuration des états
  const {
    builderState,
    setBuilderState,
    definitionState,
    setDefinitionState,
    blanksState,
    setBlanksState,
    sentenceState,
    setSentenceState,
    detectiveState,
    setDetectiveState,
    replyState,
    setReplyState,
    transformerState,
    setTransformerState,
    resetAllStates,
  } = states;

  // Déstructuration progression
  const { trackItemCompletion, numLevelId, familyId, totalQuestions, currentQuestionIndex } =
    progress;

  // =========================================================
  // NAVIGATION CENTRALISÉE
  // =========================================================

  /**
   * Gère la navigation vers la question suivante ou retour au menu
   */
  const handleNavigationNext = useCallback(() => {
    if (isLastQuestion) {
      safeGoBack.navigate();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetAllStates();
    }
  }, [isLastQuestion, safeGoBack, setCurrentQuestionIndex, resetAllStates]);

  // =========================================================
  // HANDLERS: BUILDER
  // =========================================================

  const handleBuilderAnswer = useCallback(
    (text: string) => {
      setBuilderState((prev) => ({ ...prev, selectedOption: text }));
    },
    [setBuilderState]
  );

  const handleBuilderValidate = useCallback(() => {
    if (!builderState.selectedOption || currentQuestion.type !== 'definition') return;

    const correct =
      builderState.selectedOption.toLowerCase().trim() ===
      currentQuestion.correctAnswer.toLowerCase();

    setBuilderState((prev) => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1,
    }));
  }, [builderState.selectedOption, currentQuestion, setBuilderState]);

  const handleBuilderRetry = useCallback(() => {
    setBuilderState((prev) => ({
      ...prev,
      selectedOption: null,
      isValidated: false,
      isCorrect: false,
    }));
  }, [setBuilderState]);

  // =========================================================
  // HANDLERS: DEFINITION
  // =========================================================

  const handleDefinitionAnswer = useCallback(
    (option: string) => {
      setDefinitionState((prev) => ({ ...prev, selectedOption: option }));
    },
    [setDefinitionState]
  );

  const handleDefinitionValidate = useCallback(() => {
    if (!definitionState.selectedOption || currentQuestion.type !== 'definition') return;

    const correct = definitionState.selectedOption === currentQuestion.correctAnswer;

    setDefinitionState((prev) => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1,
    }));

    if (correct || definitionState.attemptCount + 1 >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
    }
  }, [
    definitionState.selectedOption,
    definitionState.attemptCount,
    currentQuestion,
    setDefinitionState,
    trackItemCompletion,
    numLevelId,
    familyId,
    currentQuestionIndex,
    totalQuestions,
  ]);

  const handleDefinitionRetry = useCallback(() => {
    setDefinitionState((prev) => ({
      ...prev,
      selectedOption: null,
      isValidated: false,
      isCorrect: false,
    }));
  }, [setDefinitionState]);

  // =========================================================
  // HANDLERS: BLANKS
  // =========================================================

  const handleBlanksAnswer = useCallback(
    (option: string) => {
      setBlanksState((prev) => ({ ...prev, selectedOption: option }));
    },
    [setBlanksState]
  );

  const handleBlanksValidate = useCallback(() => {
    if (!blanksState.selectedOption || currentQuestion.type !== 'blanks') return;

    const correct = blanksState.selectedOption === currentQuestion.correctAnswer;

    setBlanksState((prev) => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1,
    }));

    if (correct || blanksState.attemptCount + 1 >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
    }
  }, [
    blanksState.selectedOption,
    blanksState.attemptCount,
    currentQuestion,
    setBlanksState,
    trackItemCompletion,
    numLevelId,
    familyId,
    currentQuestionIndex,
    totalQuestions,
  ]);

  const handleBlanksRetry = useCallback(() => {
    setBlanksState((prev) => ({
      ...prev,
      selectedOption: null,
      isValidated: false,
      isCorrect: false,
    }));
  }, [setBlanksState]);

  // =========================================================
  // HANDLERS: SENTENCE BUILDER
  // =========================================================

  const handleSentenceOrder = useCallback(
    (orderedWords: string[]) => {
      setSentenceState((prev) => ({ ...prev, selectedOrder: orderedWords }));
    },
    [setSentenceState]
  );

  const handleSentenceValidate = useCallback(() => {
    if (sentenceState.selectedOrder.length === 0 || currentQuestion.type !== 'sentence') return;

    const correct =
      JSON.stringify(sentenceState.selectedOrder) ===
      JSON.stringify(currentQuestion.correctOrder);

    setSentenceState((prev) => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1,
    }));

    if (correct || sentenceState.attemptCount + 1 >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
    }
  }, [
    sentenceState.selectedOrder,
    sentenceState.attemptCount,
    currentQuestion,
    setSentenceState,
    trackItemCompletion,
    numLevelId,
    familyId,
    currentQuestionIndex,
    totalQuestions,
  ]);

  const handleSentenceRetry = useCallback(() => {
    setSentenceState((prev) => ({
      ...prev,
      selectedOrder: [],
      isValidated: false,
      isCorrect: false,
    }));
  }, [setSentenceState]);

  // =========================================================
  // HANDLERS: DETECTIVE
  // =========================================================

  const handleDetectiveAnswer = useCallback(
    (wordIndex: number) => {
      setDetectiveState((prev) => ({ ...prev, selectedWord: wordIndex }));
    },
    [setDetectiveState]
  );

  const handleDetectiveValidate = useCallback(() => {
    if (
      detectiveState.selectedWord === null ||
      detectiveState.selectedWord === undefined ||
      currentQuestion.type !== 'detective'
    )
      return;

    const correct = detectiveState.selectedWord === currentQuestion.errorWordIndex;

    setDetectiveState((prev) => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1,
    }));

    if (correct || detectiveState.attemptCount + 1 >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
    }
  }, [
    detectiveState.selectedWord,
    detectiveState.attemptCount,
    currentQuestion,
    setDetectiveState,
    trackItemCompletion,
    numLevelId,
    familyId,
    currentQuestionIndex,
    totalQuestions,
  ]);

  const handleDetectiveRetry = useCallback(() => {
    setDetectiveState((prev) => ({
      ...prev,
      selectedWord: null,
      isValidated: false,
      isCorrect: false,
    }));
  }, [setDetectiveState]);

  // =========================================================
  // HANDLERS: SPEED MATCH (timer interne)
  // =========================================================

  const handleSpeedComplete = useCallback(() => {
    trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
    handleNavigationNext();
  }, [
    trackItemCompletion,
    numLevelId,
    familyId,
    currentQuestionIndex,
    totalQuestions,
    handleNavigationNext,
  ]);

  // =========================================================
  // HANDLERS: AUDIO MATCH (timer interne, comme speed)
  // =========================================================

  const handleAudioMatchComplete = useCallback(() => {
    trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
    handleNavigationNext();
  }, [
    trackItemCompletion,
    numLevelId,
    familyId,
    currentQuestionIndex,
    totalQuestions,
    handleNavigationNext,
  ]);

  // =========================================================
  // HANDLERS: REPLY (QCM situationnel)
  // =========================================================

  const handleReplyAnswer = useCallback(
    (option: string) => {
      setReplyState((prev) => ({ ...prev, selectedOption: option }));
    },
    [setReplyState]
  );

  const handleReplyValidate = useCallback(() => {
    if (!replyState.selectedOption || currentQuestion.type !== 'reply') return;

    const correct = replyState.selectedOption === currentQuestion.correctAnswer;

    setReplyState((prev) => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1,
    }));

    if (correct || replyState.attemptCount + 1 >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
    }
  }, [
    replyState.selectedOption,
    replyState.attemptCount,
    currentQuestion,
    setReplyState,
    trackItemCompletion,
    numLevelId,
    familyId,
    currentQuestionIndex,
    totalQuestions,
  ]);

  const handleReplyRetry = useCallback(() => {
    setReplyState((prev) => ({
      ...prev,
      selectedOption: null,
      isValidated: false,
      isCorrect: false,
    }));
  }, [setReplyState]);

  // =========================================================
  // HANDLERS: TRANSFORMER (QCM morphologique)
  // =========================================================

  const handleTransformerAnswer = useCallback(
    (option: string) => {
      setTransformerState((prev) => ({ ...prev, selectedOption: option }));
    },
    [setTransformerState]
  );

  const handleTransformerValidate = useCallback(() => {
    if (!transformerState.selectedOption || currentQuestion.type !== 'transformer') return;

    const correct = transformerState.selectedOption === currentQuestion.correctAnswer;

    setTransformerState((prev) => ({
      ...prev,
      isValidated: true,
      isCorrect: correct,
      attemptCount: prev.attemptCount + 1,
    }));

    if (correct || transformerState.attemptCount + 1 >= MAX_ATTEMPTS) {
      trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
    }
  }, [
    transformerState.selectedOption,
    transformerState.attemptCount,
    currentQuestion,
    setTransformerState,
    trackItemCompletion,
    numLevelId,
    familyId,
    currentQuestionIndex,
    totalQuestions,
  ]);

  const handleTransformerRetry = useCallback(() => {
    setTransformerState((prev) => ({
      ...prev,
      selectedOption: null,
      isValidated: false,
      isCorrect: false,
    }));
  }, [setTransformerState]);

  // =========================================================
  // RETURN
  // =========================================================

  return {
    builder: {
      onAnswer: handleBuilderAnswer,
      onValidate: handleBuilderValidate,
      onRetry: handleBuilderRetry,
      onNext: handleNavigationNext,
    },
    definition: {
      onAnswer: handleDefinitionAnswer,
      onValidate: handleDefinitionValidate,
      onRetry: handleDefinitionRetry,
      onNext: handleNavigationNext,
    },
    blanks: {
      onAnswer: handleBlanksAnswer,
      onValidate: handleBlanksValidate,
      onRetry: handleBlanksRetry,
      onNext: handleNavigationNext,
    },
    sentence: {
      onOrder: handleSentenceOrder,
      onValidate: handleSentenceValidate,
      onRetry: handleSentenceRetry,
      onNext: handleNavigationNext,
    },
    detective: {
      onAnswer: handleDetectiveAnswer,
      onValidate: handleDetectiveValidate,
      onRetry: handleDetectiveRetry,
      onNext: handleNavigationNext,
    },
    speed: {
      onComplete: handleSpeedComplete,
    },
    audio_match: {
      onComplete: handleAudioMatchComplete,
    },
    reply: {
      onAnswer: handleReplyAnswer,
      onValidate: handleReplyValidate,
      onRetry: handleReplyRetry,
      onNext: handleNavigationNext,
    },
    transformer: {
      onAnswer: handleTransformerAnswer,
      onValidate: handleTransformerValidate,
      onRetry: handleTransformerRetry,
      onNext: handleNavigationNext,
    },
  };
};
