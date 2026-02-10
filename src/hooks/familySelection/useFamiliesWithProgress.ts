// c:\Users\khi_h\Desktop\Projets\JanaArchitect\Joud\src\hooks\familySelection\useFamiliesWithProgress.ts

import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

export interface FamilyWithProgress {
  id: number;
  module_slug: string;
  name: string;
  icon: string;
  emoji: string;
  description: string;
  order_index: number;
  completed: number | null;
  total: number | null;
  progress: number | null; // Pourcentage 0-100
  // Champs UI optionnels
  color?: string;
  badge?: string;
}

export default function useFamiliesWithProgress(moduleId: string | number, levelId: number) {
  const { db, user } = useUser();
  const [families, setFamilies] = useState<FamilyWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFamilies = useCallback(async () => {
    if (!db || !moduleId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Récupère les familles avec progression agrégée (somme des sous-familles)
      const query = `
        SELECT
          f.*,
          agg.total_completed as completed,
          agg.total_items as total,
          CASE WHEN agg.total_items > 0
            THEN ROUND((agg.total_completed * 100.0) / agg.total_items)
            ELSE NULL
          END as progress
        FROM families f
        LEFT JOIN (
          SELECT family_id,
            SUM(completed) as total_completed,
            SUM(total) as total_items
          FROM progress
          WHERE level = ? ${user ? 'AND user_id = ?' : ''}
          GROUP BY family_id
        ) agg ON f.id = agg.family_id
        WHERE f.module_slug = (
          SELECT slug FROM modules WHERE CAST(id AS TEXT) = ? OR slug = ? LIMIT 1
        )
        ORDER BY f.order_index ASC;
      `;

      const params = user
        ? [levelId, user.id, moduleId.toString(), moduleId.toString()]
        : [levelId, moduleId.toString(), moduleId.toString()];

      const results = await db.getAllAsync<FamilyWithProgress>(query, params);
      setFamilies(results);
    } catch (error) {
      console.error('[useFamiliesWithProgress] Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [db, user, moduleId, levelId]);

  useFocusEffect(
    useCallback(() => {
      fetchFamilies();
    }, [fetchFamilies])
  );

  return {
    families,
    isLoading,
    refresh: fetchFamilies
  };
}
