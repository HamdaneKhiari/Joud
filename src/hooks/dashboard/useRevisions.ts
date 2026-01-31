/**
 * ============================================
 * HOOK: useRevisions
 * Gère le système de révisions espacées (SRS)
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getWordsToReview } from '@/database/queries';

interface UseRevisionsReturn {
  wordsToReview: number;
  isLoading: boolean;
  refresh: () => void;
}

/**
 * Récupère le nombre de mots à réviser aujourd'hui
 *
 * @example
 * ```tsx
 * const { wordsToReview, refresh } = useRevisions();
 * return <RevisionCard wordsToReview={wordsToReview} />;
 * ```
 */
export const useRevisions = (): UseRevisionsReturn => {
  const { db, user } = useUser();
  const [wordsToReview, setWordsToReview] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWordsToReview = async () => {
    if (!db || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const count = await getWordsToReview(db, user.id);
      setWordsToReview(count);
    } catch (err) {
      console.error('[useRevisions] Error:', err);
      setWordsToReview(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWordsToReview();
  }, [db, user]);

  const refresh = () => {
    fetchWordsToReview();
  };

  return { wordsToReview, isLoading, refresh };
};
