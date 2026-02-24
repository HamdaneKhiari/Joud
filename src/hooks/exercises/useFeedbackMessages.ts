/**
 * ============================================
 * HOOK: useFeedbackMessages
 * Récupère les messages de feedback depuis la DB
 * selon l'identité et le contexte (White Label)
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/themes/ThemeContext';
import { getFeedbackMessage } from '@/database/queries';
import type { FeedbackMessage } from '@/database/schema';
import { log } from '@/utils/logUtils';

/**
 * Type pour le feedback adapté au composant ExerciseValidation
 */
export interface FeedbackData {
  icon?: string;
  title: string;
  message: string;
}

interface UseFeedbackMessagesReturn {
  getFeedback: (
    context: 'exercise' | 'wordgames' | 'vocabulary',
    state: 'correct' | 'incorrect_attempt_1' | 'incorrect_attempt_2' | 'skip'
  ) => Promise<FeedbackData | null>;
  isLoading: boolean;
}

/**
 * Hook pour récupérer les messages de feedback depuis la DB
 *
 * @example
 * ```tsx
 * const { getFeedback } = useFeedbackMessages();
 * const feedback = await getFeedback('wordgames', 'correct');
 * ```
 */
export const useFeedbackMessages = (): UseFeedbackMessagesReturn => {
  const { db } = useUser();
  const { identity } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const getFeedback = async (
    context: 'exercise' | 'wordgames' | 'vocabulary',
    state: 'correct' | 'incorrect_attempt_1' | 'incorrect_attempt_2' | 'skip'
  ): Promise<FeedbackData | null> => {
    if (!db || typeof db === 'number') return null;

    try {
      setIsLoading(true);
      const message = await getFeedbackMessage(db, identity.id, context, state);

      if (!message) {
        // Fallback si aucun message trouvé
        log.warn(`No feedback found for ${identity.id}/${context}/${state}`);
        return null;
      }

      return {
        icon: message.icon,
        title: message.title,
        message: message.message,
      };
    } catch (error) {
      console.error('[useFeedbackMessages] Error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getFeedback, isLoading };
};

/**
 * Helper : Génère le state du feedback selon le nombre de tentatives
 */
export const getFeedbackState = (
  isValidated: boolean,
  isCorrect: boolean,
  attemptCount: number,
  maxAttempts: number = 2
): 'correct' | 'incorrect_attempt_1' | 'incorrect_attempt_2' | 'skip' | null => {
  if (!isValidated) return null;

  if (isCorrect) return 'correct';

  const canSkip = attemptCount >= maxAttempts;
  if (canSkip) return 'skip';

  // Première ou deuxième erreur
  return attemptCount === 0 ? 'incorrect_attempt_1' : 'incorrect_attempt_2';
};
