/**
 * useGetFamiliesByModule - Hook pour récupérer les familles d'un module depuis SQLite
 * Utilise le slug du module et filtre par niveau via INNER JOIN avec content
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getModuleBySlug, getFamiliesByModuleAndLevel } from '@/database/queries';
import type { Family } from '@/database/schema';

// ============================================
// TYPES
// ============================================

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
 * @param moduleSlug - Slug du module (ex: 'vocab', 'grammar')
 * @param level - Numéro du niveau (ex: 1, 2, 3, 4)
 */
export const useGetFamiliesByModule = (
  moduleSlug: string,
  level: number
): UseGetFamiliesByModuleReturn => {
  const { db } = useUser();
  const [familyIds, setFamilyIds] = useState<string[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFamilies = async () => {
      if (!db || typeof db === 'number' || !moduleSlug) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 1. Récupérer le module par son slug
        const module = await getModuleBySlug(db, moduleSlug);
        
        if (!module) {
          console.warn(`Module avec slug "${moduleSlug}" non trouvé`);
          setFamilies([]);
          setFamilyIds([]);
          return;
        }

        // 2. Récupérer les familles qui ont du contenu pour ce niveau
        const result = await getFamiliesByModuleAndLevel(db, module.slug, level);

        setFamilies(result || []);
        setFamilyIds((result || []).map(f => f.id?.toString() || ''));
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
  }, [db, moduleSlug, level]);

  return {
    familyIds,
    families,
    isLoading,
    error
  };
};

export default useGetFamiliesByModule;
