/**
 * useGetFamiliesByModule - Hook pour récupérer les familles d'un module depuis SQLite
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

// ============================================
// TYPES
// ============================================

interface Family {
  id: string;
  name: string;
  module_id: string;
  level_id: number;
}

interface UseGetFamiliesByModuleReturn {
  familyIds: string[];
  families: Family[];
  isLoading: boolean;
  error: Error | null;
}

// ============================================
// HOOK
// ============================================

/**
 * Récupère les familles d'un module pour un niveau depuis SQLite
 */
export const useGetFamiliesByModule = (
  moduleId: string,
  levelId: number
): UseGetFamiliesByModuleReturn => {
  const { db } = useUser();
  const [familyIds, setFamilyIds] = useState<string[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFamilies = async () => {
      if (!db || !moduleId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Requête SQL pour récupérer les familles d'un module pour un niveau
        // Ajuste la requête selon ta structure de DB
        const result = await db.getAllAsync<Family>(
          `SELECT id, name, module_id, level_id
           FROM families
           WHERE module_id = ? AND (level_id = ? OR level_id IS NULL)
           ORDER BY id`,
          [moduleId, levelId]
        );

        setFamilies(result || []);
        setFamilyIds((result || []).map(f => f.id));
      } catch (err) {
        console.error('Erreur useGetFamiliesByModule:', err);
        setError(err as Error);
        setFamilies([]);
        setFamilyIds([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilies();
  }, [db, moduleId, levelId]);

  return {
    familyIds,
    families,
    isLoading,
    error
  };
};

export default useGetFamiliesByModule;
