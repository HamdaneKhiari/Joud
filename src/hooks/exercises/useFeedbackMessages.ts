import { useCallback, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/themes/ThemeContext';
import { getFeedbackMessage } from '@/database/queries';
import { log } from '@/utils/logUtils';

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

export const useFeedbackMessages = (): UseFeedbackMessagesReturn => {
  const { db } = useUser();
  const { identity } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const getFeedback = useCallback(
    async (
      context: 'exercise' | 'wordgames' | 'vocabulary',
      state: 'correct' | 'incorrect_attempt_1' | 'incorrect_attempt_2' | 'skip'
    ): Promise<FeedbackData | null> => {
      if (!db || typeof db === 'number') return null;

      try {
        setIsLoading(true);
        const message = await getFeedbackMessage(db, identity.id, context, state);

        if (!message) {
          log.warn(`No feedback found for ${identity.id}/${context}/${state}`);
          return null;
        }

        return {
          icon: message.icon,
          title: message.title,
          message: message.message,
        };
      } catch (error) {
        log.error('[useFeedbackMessages] Error:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [db, identity.id]
  );

  return { getFeedback, isLoading };
};

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

  return attemptCount === 0 ? 'incorrect_attempt_1' : 'incorrect_attempt_2';
};
