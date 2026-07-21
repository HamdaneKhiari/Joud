import { useCallback } from 'react';
import { useRecordError } from '@/hooks/exercises/useRecordError';
import type { GameQuestion } from '../schema';
import type { UseGameStateReturn } from './useGameState';

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
  onComplete?: () => void;
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

type OptionState = {
  selectedOption: string | null;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
};

const MAX_ATTEMPTS = 2;
const MODULE_ID = 'word_games';
const identity = (s: string) => s;
const lowerTrim = (s: string) => s.toLowerCase().trim();

// Texte de la question affiché au Coach IA quand la réponse est fausse
const getQuestionText = (q: GameQuestion): string => {
  switch (q.type) {
    case 'definition': return q.definition;
    case 'blanks': return q.sentence;
    case 'reply': return q.prompt;
    case 'transformer': return q.sentence;
    case 'sentence': return q.words.join(' / ');
    case 'detective': return q.sentence;
    default: return '';
  }
};

export const useGameHandlers = ({
  question: currentQuestion,
  isLastQuestion,
  safeGoBack,
  setCurrentQuestionIndex,
  states,
  progress,
  onComplete,
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
  const { recordError } = useRecordError();

  const handleNavigationNext = useCallback(() => {
    if (isLastQuestion) {
      if (onComplete) {
        onComplete();
      } else {
        safeGoBack.navigate();
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      resetAllStates();
    }
  }, [isLastQuestion, safeGoBack, onComplete, setCurrentQuestionIndex, resetAllStates]);

  // Factory QCM : definition, blanks, reply, transformer, builder partagent
  // le même pattern (selectedOption + compare + track)
  const makeOptionHandlers = (
    state: Pick<OptionState, 'selectedOption' | 'attemptCount'>,
    setState: React.Dispatch<React.SetStateAction<OptionState>>,
    questionType: string,
    normalize: (s: string) => string = identity,
  ): OptionGameHandlers => ({
    onAnswer: (option: string) => setState(prev => ({ ...prev, selectedOption: option })),
    onValidate: () => {
      if (!state.selectedOption || currentQuestion.type !== questionType) return;
      const correctAnswer = (currentQuestion as { correctAnswer: string }).correctAnswer;
      const correct = normalize(state.selectedOption) === normalize(correctAnswer);
      const isFinalAttempt = state.attemptCount + 1 >= MAX_ATTEMPTS;
      setState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));
      if (correct || isFinalAttempt) {
        trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
      }
      if (!correct && isFinalAttempt) {
        recordError({
          familyId,
          moduleSlug: MODULE_ID,
          question: getQuestionText(currentQuestion),
          userAnswer: state.selectedOption,
          correctAnswer,
          level: numLevelId,
        });
      }
    },
    onRetry: () => setState(prev => ({ ...prev, selectedOption: null, isValidated: false, isCorrect: false })),
    onNext: handleNavigationNext,
  });

  // Sentence builder : ordre de mots, logique spécifique (pas de factory)
  const sentence: SentenceGameHandlers = {
    onOrder: (orderedWords: string[]) => setSentenceState(prev => ({ ...prev, selectedOrder: orderedWords })),
    onValidate: () => {
      if (sentenceState.selectedOrder.length === 0 || currentQuestion.type !== 'sentence') return;
      const correct = JSON.stringify(sentenceState.selectedOrder) === JSON.stringify(currentQuestion.correctOrder);
      const isFinalAttempt = sentenceState.attemptCount + 1 >= MAX_ATTEMPTS;
      setSentenceState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));
      if (correct || isFinalAttempt) {
        trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
      }
      if (!correct && isFinalAttempt) {
        recordError({
          familyId,
          moduleSlug: MODULE_ID,
          question: currentQuestion.words.join(' / '),
          userAnswer: sentenceState.selectedOrder.join(' '),
          correctAnswer: currentQuestion.correctOrder.join(' '),
          level: numLevelId,
        });
      }
    },
    onRetry: () => setSentenceState(prev => ({ ...prev, selectedOrder: [], isValidated: false, isCorrect: false })),
    onNext: handleNavigationNext,
  };

  // Detective : sélection par wordIndex, logique spécifique (pas de factory)
  const detective: DetectiveGameHandlers = {
    onAnswer: (wordIndex: number) => setDetectiveState(prev => ({ ...prev, selectedWord: wordIndex })),
    onValidate: () => {
      if (detectiveState.selectedWord === null || detectiveState.selectedWord === undefined || currentQuestion.type !== 'detective') return;
      const correct = detectiveState.selectedWord === currentQuestion.errorWordIndex;
      const isFinalAttempt = detectiveState.attemptCount + 1 >= MAX_ATTEMPTS;
      const selectedWord = detectiveState.selectedWord;
      setDetectiveState(prev => ({ ...prev, isValidated: true, isCorrect: correct, attemptCount: prev.attemptCount + 1 }));
      if (correct || isFinalAttempt) {
        trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
      }
      if (!correct && isFinalAttempt) {
        const words = currentQuestion.sentence.split(' ');
        recordError({
          familyId,
          moduleSlug: MODULE_ID,
          question: currentQuestion.sentence,
          userAnswer: words[selectedWord] ?? '',
          correctAnswer: currentQuestion.correctWord,
          level: numLevelId,
        });
      }
    },
    onRetry: () => setDetectiveState(prev => ({ ...prev, selectedWord: null, isValidated: false, isCorrect: false })),
    onNext: handleNavigationNext,
  };

  // Speed match / audio match gèrent leur propre timer, on ne fait que tracker + avancer
  const handleTimedComplete = () => {
    trackItemCompletion(numLevelId, MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
    handleNavigationNext();
  };

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
