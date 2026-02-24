import { useCallback } from 'react';
import { 
  LogicQuestion, 
  FusionQuestion, 
  RephrasingQuestion 
} from '../../../components/pedagogy/Connector/types';

/**
 * Normalise les entrées utilisateur pour la comparaison textuelle.
 * CORRECTION SONAR: Utilisation d'une regex globale avec replace ou replaceAll
 */
const normalizeAnswer = (text: string) => {
  // .replace(/\s+/g, ' ') est déjà global grâce au flag 'g'
  // Mais Sonar préfère souvent l'intention explicite de replaceAll pour les chaînes
  // Ici, pour une regex de nettoyage, on garde le replace avec le flag global 
  // ou on utilise la syntaxe moderne :
  return text.toLowerCase().trim().replaceAll(/\s+/g, ' ');
};

interface UseConnectorHandlersProps {
  question: LogicQuestion | FusionQuestion | RephrasingQuestion | undefined;
  isLastQuestion: boolean;
  onNavigateBack: () => void;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  states: any;
  onValidationSuccess: () => void;
  recordError?: (userAnswer: string) => void;
}

export const useConnectorHandlers = ({
  question: currentQuestion,
  isLastQuestion,
  onNavigateBack,
  setCurrentQuestionIndex,
  states,
  onValidationSuccess,
  recordError,
}: UseConnectorHandlersProps) => {
  const {
    logicState, setLogicState,
    fusionState, setFusionState,
    rephrasingState, setRephrasingState,
    resetAllStates,
  } = states;

  const handleNavigationNext = useCallback(() => {
    if (isLastQuestion) {
      onNavigateBack();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetAllStates();
    }
  }, [isLastQuestion, onNavigateBack, setCurrentQuestionIndex, resetAllStates]);

  // --- LOGIQUE DE VALIDATION (Extraite pour la clarté) ---
  
  const validateInputExercise = useCallback((
    userAnswer: string | undefined,
    correctAnswer: string,
    setState: any
  ) => {
    if (!userAnswer?.trim()) return;

    const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);

    setState((prev: any) => ({
      ...prev,
      isValidated: true,
      isCorrect,
      attemptCount: prev.attemptCount + 1
    }));

    if (isCorrect) {
      onValidationSuccess();
    } else {
      recordError?.(userAnswer);
    }
  }, [onValidationSuccess, recordError]);

  // --- HANDLERS PUBLICS ---

  return {
    logic: {
      onAnswer: (option: string) => setLogicState((prev: any) => ({ ...prev, selectedOption: option })),
      onValidate: () => {
        if (!logicState.selectedOption || !currentQuestion) return;
        const q = currentQuestion as LogicQuestion;
        const isCorrect = normalizeAnswer(logicState.selectedOption) === normalizeAnswer(q.correctAnswer);
        setLogicState((prev: any) => ({ ...prev, isValidated: true, isCorrect, attemptCount: prev.attemptCount + 1 }));
        if (isCorrect) {
          onValidationSuccess();
        } else {
          recordError?.(logicState.selectedOption);
        }
      },
      onRetry: () => setLogicState((prev: any) => ({ ...prev, selectedOption: undefined, isValidated: false, isCorrect: false })),
      onNext: handleNavigationNext,
    },
    fusion: {
      onAnswer: (text: string) => setFusionState((prev: any) => ({ ...prev, userAnswer: text })),
      onValidate: () => currentQuestion && validateInputExercise(fusionState.userAnswer, (currentQuestion as FusionQuestion).correctAnswer, setFusionState),
      onRetry: () => setFusionState((prev: any) => ({ ...prev, userAnswer: undefined, isValidated: false, isCorrect: false })),
      onNext: handleNavigationNext,
    },
    rephrasing: {
      onAnswer: (text: string) => setRephrasingState((prev: any) => ({ ...prev, userAnswer: text })),
      onValidate: () => currentQuestion && validateInputExercise(rephrasingState.userAnswer, (currentQuestion as RephrasingQuestion).correctAnswer, setRephrasingState),
      onRetry: () => setRephrasingState((prev: any) => ({ ...prev, userAnswer: undefined, isValidated: false, isCorrect: false })),
      onNext: handleNavigationNext,
    },
  };
};