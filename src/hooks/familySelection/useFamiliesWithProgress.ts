// c:\Users\khi_h\Desktop\Projets\JanaArchitect\Joud\src\hooks\familySelection\useFamiliesWithProgress.ts

import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

export interface FamilyWithProgress {
  id: number;
  module_id: number;
  name: string;
  icon: string;
  emoji: string;
  description: string;
  order_index: number;
  score: number | null;
  completed: number | null;
  // Champs UI optionnels
  color?: string;
  badge?: string;
}

export default function useFamiliesWithProgress(moduleId: string | number, levelId: number) {
  const { db } = useUser();
  const [families, setFamilies] = useState<FamilyWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFamilies = useCallback(async () => {
    // Si pas de DB ou pas de module, on ne fait rien
    if (!db || !moduleId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 💡 MAGIE SQL : Cette requête fonctionne que moduleId soit "1" (ID) ou "vocab" (Slug)
      // Elle cherche d'abord l'ID du module correspondant, puis charge les familles.
      const query = `
        SELECT 
          f.*, 
          p.score, 
          p.completed 
        FROM families f
        LEFT JOIN progress p ON f.id = p.family_id AND p.level = ?
        WHERE f.module_id = (
          SELECT id FROM modules WHERE CAST(id AS TEXT) = ? OR slug = ? LIMIT 1
        )
        ORDER BY f.order_index ASC;
      `;

      // On passe moduleId.toString() deux fois : une pour comparer à l'ID, une pour le slug
      const results = await db.getAllAsync<FamilyWithProgress>(query, [
        levelId, 
        moduleId.toString(), 
        moduleId.toString()
      ]);

      console.log(`[useFamilies] Chargé ${results.length} familles pour module '${moduleId}' niveau ${levelId}`);
      setFamilies(results);
    } catch (error) {
      console.error('❌ Error fetching families:', error);
    } finally {
      setIsLoading(false);
    }
  }, [db, moduleId, levelId]);

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
