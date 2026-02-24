/**
 * ============================================
 * HOOK: useUserMetrics
 * Récupère les métriques utilisateur (stats)
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getUserMetrics, calculateUserMetrics } from '@/database/queries';
import type { UserMetrics } from '@/database/schema';

interface UseUserMetricsReturn {
  wordsLearned: number;
  exercisesCompleted: number;
  streak: number;
  badges: number;
  isLoading: boolean;
  refresh: () => void;
}

/**
 * Récupère les métriques utilisateur depuis la DB
 *
 * @example
 * ```tsx
 * const { wordsLearned, streak, badges } = useUserMetrics();
 * return <MetricsSection metrics={{ wordsLearned, badges, streak }} />;
 * ```
 */
export const useUserMetrics = (): UseUserMetricsReturn => {
  const { db, user } = useUser();
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [badges, setBadges] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    if (!db || typeof db === 'number' || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Calculer les métriques depuis les données réelles
      const calculatedMetrics = await calculateUserMetrics(db, user.id);
      setMetrics(calculatedMetrics);

      // Récupérer le nombre de badges
      const badgesResult = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM user_badges WHERE user_id = ?`,
        [user.id]
      );
      setBadges(badgesResult?.count || 0);
    } catch (err) {
      console.error('[useUserMetrics] Error:', err);
      setMetrics({
        user_id: user.id,
        words_learned: 0,
        exercises_completed: 0,
        current_streak: 0,
        longest_streak: 0,
        total_time_minutes: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [db, user]);

  const refresh = () => {
    fetchMetrics();
  };

  return {
    wordsLearned: metrics?.words_learned || 0,
    exercisesCompleted: metrics?.exercises_completed || 0,
    streak: metrics?.current_streak || 0,
    badges,
    isLoading,
    refresh,
  };
};
