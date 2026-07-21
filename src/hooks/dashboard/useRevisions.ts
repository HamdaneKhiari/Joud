import { log } from '@/utils/logUtils';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getWordsToReview } from '@/database/queries';

interface UseRevisionsReturn {
  wordsToReview: number;
  isLoading: boolean;
  refresh: () => void;
}

export const useRevisions = (): UseRevisionsReturn => {
  const { db, user } = useUser();
  const [wordsToReview, setWordsToReview] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWordsToReview = useCallback(async () => {
    if (!db || typeof db === 'number' || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const count = await getWordsToReview(db, user.id);
      setWordsToReview(count);
    } catch (err) {
      log.error('[useRevisions] Error:', err);
      setWordsToReview(0);
    } finally {
      setIsLoading(false);
    }
  }, [db, user]);

  useEffect(() => {
    fetchWordsToReview();
  }, [fetchWordsToReview]);

  const refresh = () => {
    fetchWordsToReview();
  };

  return { wordsToReview, isLoading, refresh };
};
