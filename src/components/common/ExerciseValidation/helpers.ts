import { ValidationState, FeedbackData, ButtonConfig } from './types';

export const getButtonConfig = (
  state: ValidationState,
  isLastQuestion: boolean,
  canSkip: boolean,
  styles: Record<string, object>
): ButtonConfig => {
  const configs: Record<ValidationState, ButtonConfig> = {
    initial: {
      icon: 'checkmark-circle',
      label: 'Valider',
      style: styles.buttonInitial,
    },
    correct: {
      icon: isLastQuestion ? 'checkmark-done-circle' : 'arrow-forward-circle',
      label: isLastQuestion ? 'Terminer' : 'Continuer',
      style: styles.buttonCorrect,
    },
    incorrect: {
      icon: 'refresh-circle',
      label: 'Réessayer',
      style: styles.buttonIncorrect,
    },
    skip: {
      icon: 'arrow-forward-circle',
      label: 'Continuer',
      style: styles.buttonSkip,
    },
  };

  return configs[state] || configs.initial;
};

export const getDefaultFeedback = (
  state: ValidationState,
  showFeedback: boolean,
  customFeedback: FeedbackData | null | undefined,
  canSkip: boolean,
  correctAnswer: string | null | undefined,
  attemptCount: number
): FeedbackData | null => {
  if (!showFeedback) return null;

  // Si un message personnalisé est fourni, on le priorise
  if (customFeedback) {
    if (state === 'skip' && correctAnswer && !customFeedback.message.includes(correctAnswer)) {
      return {
        ...customFeedback,
        message: `La bonne réponse était "${correctAnswer}". ${customFeedback.message}`,
      };
    }
    return customFeedback;
  }

  switch (state) {
    case 'correct': {
      return {
        title: 'CORRECT',
        message: 'Bonne réponse, continue comme ça',
      };
    }

    case 'skip': {
      return {
        title: 'SOLUTION',
        message: correctAnswer
          ? `La bonne réponse était "${correctAnswer}".`
          : 'Passe à la suite',
      };
    }

    case 'incorrect': {
      if (attemptCount === 0) {
        return {
          title: 'ESSAIE ENCORE',
          message: 'Réfléchis bien et réessaie',
        };
      }

      return {
        title: 'DERNIER ESSAI',
        message: 'Concentre-toi bien',
      };
    }

    default:
      return null;
  }
};

export const getRandomFeedback = (messages: FeedbackData[]): FeedbackData => {
  // NOSONAR: Math.random() intentionnel, non-cryptographique — variation de feedback UI uniquement
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};
