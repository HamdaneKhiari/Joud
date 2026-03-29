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

interface SafeNavigation {
  navigate: () => void;
}

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

export interface UseGameHandlersParams {
  question: GameQuestion;
  isLastQuestion: boolean;
  safeGoBack: SafeNavigation;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  states: UseGameStateReturn;
  progress: ProgressData;
}

interface OptionGameHandlers {
  onAnswer: (option: string) => void;
  onValidate: () => void;
  onRetry: () => void;
  onNext: () => void;
}

interface SentenceGameHandlers {
  onOrder: (orderedWords: string[]) => void;
  onValidate: () => void;
  onRetry: () => void;
  onNext: () => void;
}

interface DetectiveGameHandlers {
  onAnswer: (wordIndex: number) => void;
  onValidate: () => void;
  onRetry: () => void;
  onNext: () => void;
}

interface TimedGameHandlers {
  onComplete: () => void;
}

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
// TYPES INTERNES
// ============================================

type OptionState = {
  selectedOption: string | null;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
};

// ============================================
// CONSTANTS
// ============================================

const MAX_ATTEMPTS = 2;
const MODULE_ID = 'word_games';
const identity = (s: string) => s;
const lowerTrim = (s: string) => s.toLowerCase().trim();

// ============================================
// HOOK
// ============================================

export const useGameHandlers = ({
  question: currentQuestion,
  isLastQuestion,
  safeGoBack,
  setCurrentQuestionIndex,
  states,
  progress,
}: UseGameHandlersParams): UseGameHandlersReturn => {
  const {
    builderState, setBuilderState,
    definitionState, setDefinitionState,
    blanksState, setBlanksState,
    sentenceState, setSentenceState,
    detectiveState, setDetectiveState,
    replyState, setReplyState,
    transformerState, setTransformerState,
    resetAllStates,
  } = states;

  const { trackItemCompletion, numLevelId, familyId, totalQuestions, currentQuestionIndex } = progress;

  // =========================================================
  // NAVIGATION CENTRALISÉE
  // =========================================================

  const handleNavigationNext = useCallback(() => {
    if (isLastQuestion) {
      safeGoBack.navigate();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      resetAllStates();
    }
  }, [isLastQuestion, safeGoBack, setCurrentQuestionIndex, resetAllStates]);

  // =========================================================
  // FACTORY QCM (definition, blanks, reply, transformer, builder)
  // Tous ces types partagent le même pattern : selectedOption + compare + track
  // =========================================================

  const makeOptionHandlers = (
    state: Pick<OptionState, 'selectedOption' | 'attemptCount'>,
    setState: React.Dispatch<React.SetStateAction<OptionState>>,
    questionType: string,
    normalize: (s: string) => string = identity,
  ): OptionGameHandlers => ({
    onAnswer: (option: string) => setState(prev => ({ ...prev, selectedOption: option })),
    onValidate: () => {
      if (!state.selectedOption || currentQuestion.type !== questionType) return;
      const correct = normalize(state.selectedOption) === normalize((currentQuestion as { correctAnswer: string }).correctAnswer);
      setState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));
      if (correct || state.attemptCount + 1 >= MAX_ATTEMPTS) {
        trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
      }
    },
    onRetry: () => setState(prev => ({ ...prev, selectedOption: null, isValidated: false, isCorrect: false })),
    onNext: handleNavigationNext,
  });

  // =========================================================
  // HANDLERS: SENTENCE BUILDER (ordre de mots — logique spécifique)
  // =========================================================

  const sentence: SentenceGameHandlers = {
    onOrder: (orderedWords: string[]) => setSentenceState(prev => ({ ...prev, selectedOrder: orderedWords })),
    onValidate: () => {
      if (sentenceState.selectedOrder.length === 0 || currentQuestion.type !== 'sentence') return;
      const correct = JSON.stringify(sentenceState.selectedOrder) === JSON.stringify(currentQuestion.correctOrder);
      setSentenceState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));
      if (correct || sentenceState.attemptCount + 1 >= MAX_ATTEMPTS) {
        trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
      }
    },
    onRetry: () => setSentenceState(prev => ({ ...prev, selectedOrder: [], isValidated: false, isCorrect: false })),
    onNext: handleNavigationNext,
  };

  // =========================================================
  // HANDLERS: DETECTIVE (wordIndex — logique spécifique)
  // =========================================================

  const detective: DetectiveGameHandlers = {
    onAnswer: (wordIndex: number) => setDetectiveState(prev => ({ ...prev, selectedWord: wordIndex })),
    onValidate: () => {
      if (detectiveState.selectedWord === null || detectiveState.selectedWord === undefined || currentQuestion.type !== 'detective') return;
      const correct = detectiveState.selectedWord === currentQuestion.errorWordIndex;
      setDetectiveState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));
      if (correct || detectiveState.attemptCount + 1 >= MAX_ATTEMPTS) {
        trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
      }
    },
    onRetry: () => setDetectiveState(prev => ({ ...prev, selectedWord: null, isValidated: false, isCorrect: false })),
    onNext: handleNavigationNext,
  };

  // =========================================================
  // HANDLERS: SPEED MATCH / AUDIO MATCH (timer interne)
  // =========================================================

  const handleTimedComplete = () => {
    trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
    handleNavigationNext();
  };

  // =========================================================
  // RETURN
  // =========================================================

  return {
    builder:     makeOptionHandlers(builderState, setBuilderState, 'definition', lowerTrim),
    definition:  makeOptionHandlers(definitionState, setDefinitionState, 'definition'),
    blanks:      makeOptionHandlers(blanksState, setBlanksState, 'blanks'),
    reply:       makeOptionHandlers(replyState, setReplyState, 'reply'),
    transformer: makeOptionHandlers(transformerState, setTransformerState, 'transformer'),
    sentence,
    detective,
    speed:       { onComplete: handleTimedComplete },
    audio_match: { onComplete: handleTimedComplete },
  };
};
