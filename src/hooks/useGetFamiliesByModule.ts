// Filtre par niveau via INNER JOIN avec content
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getModuleBySlug, getFamiliesByModuleAndLevel } from '@/database/queries';
import type { Family } from '@/database/schema';
import { log } from '@/utils/logUtils';

interface UseGetFamiliesByModuleReturn {
  familyIds: string[];
  families: Family[];
  isLoading: boolean;
  error: Error | null;
}

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

        const module = await getModuleBySlug(db, moduleSlug);

        if (!module) {
          log.warn(`Module avec slug "${moduleSlug}" non trouvé`);
          setFamilies([]);
          setFamilyIds([]);
          return;
        }

        const result = await getFamiliesByModuleAndLevel(db, module.slug, level);

        setFamilies(result || []);
        setFamilyIds((result || []).map(f => f.id?.toString() || ''));
      } catch (err) {
        log.error('Erreur useGetFamiliesByModule:', err);
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
