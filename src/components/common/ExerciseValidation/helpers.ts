/**
 * ============================================
 * EXERCISE VALIDATION - HELPERS (TypeScript)
 * Version TypeScript avec types stricts - No-Media Edition
 * ============================================
 */

import { ValidationState, FeedbackData, ButtonConfig } from './types';

/**
 * Configure les propriétés visuelles et comportementales du bouton
 * en fonction de l'état actuel.
 */
export const getButtonConfig = (
  state: ValidationState,
  isLastQuestion: boolean,
  canSkip: boolean,
  styles: Record<string, any>
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

/**
 * Fournit les messages de feedback par défaut en fonction de l'état.
 * ✅ NO-MEDIA: Pas d'emoji, typographie forte
 */
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
  if (customFeedback) return customFeedback;

  switch (state) {
    case 'correct': {
      // ✅ NO-MEDIA: Pas d'emoji, typographie forte
      return {
        title: 'CORRECT',
        message: 'Bonne réponse, continue comme ça',
      };
    }

    case 'skip': {
      // État skip : afficher la bonne réponse
      return {
        title: 'RÉPONSE',
        message: correctAnswer
          ? `La bonne réponse était "${correctAnswer}"`
          : 'Passe à la suite',
      };
    }

    case 'incorrect': {
      // Première erreur
      if (attemptCount === 0) {
        return {
          title: 'ESSAIE ENCORE',
          message: 'Réfléchis bien et réessaie',
        };
      }

      // Deuxième erreur (dernière chance)
      return {
        title: 'DERNIÈRE CHANCE',
        message: 'Prends ton temps',
      };
    }

    default:
      return null;
  }
};

/**
 * BONUS : Fonction pour randomiser les messages
 * (à utiliser si tu veux varier les feedbacks)
 */
export const getRandomFeedback = (messages: FeedbackData[]): FeedbackData => {
  // Non-cryptographic randomness - Safe for UI feedback variation
  // NOSONAR: Math.random() is intentionally used for non-security purposes
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};
