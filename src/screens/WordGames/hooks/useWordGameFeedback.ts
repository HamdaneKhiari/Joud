import { useState, useEffect } from 'react';
import { useFeedbackMessages, getFeedbackState } from '@/hooks/exercises/useFeedbackMessages';
import type { FeedbackData } from '@/hooks/exercises/useFeedbackMessages';

export const useWordGameFeedback = (
  isValidated: boolean,
  isCorrect: boolean,
  attemptCount: number,
  maxAttempts: number
): FeedbackData | null => {
  const { getFeedback } = useFeedbackMessages();
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackData | null>(null);

  useEffect(() => {
    const loadFeedback = async () => {
      const feedbackState = getFeedbackState(isValidated, isCorrect, attemptCount, maxAttempts);
      if (feedbackState) {
        const feedback = await getFeedback('wordgames', feedbackState);
        setFeedbackMessage(feedback);
      } else {
        setFeedbackMessage(null);
      }
    };

    loadFeedback();
  }, [isValidated, isCorrect, attemptCount, maxAttempts, getFeedback]);

  return feedbackMessage;
};

export default useWordGameFeedback;
