import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { Family, Module } from '@/database/schema';

export interface ContentItem<T> {
  id: number;
  data: T;
}

/** Data shape for phrase_types exercises (sentence translation) */
export interface SentenceData {
  // Mode blanks (primary/college)
  sentence?: string;
  options?: string[];
  correct_answer?: string;
  correctAnswer?: string;
  // Mode free (lycee/adult)
  phrase_fr?: string;
  phrase_en?: string;
  build?: string;
  // Shared
  translation?: string;
  explanation?: string;
  sentence_with_blank?: string;
}

interface UseExerciseContentReturn<T> {
  module: Module | null;
  family: Family | null;
  contentItems: ContentItem<T>[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * ✅ CLARIFICATION :
 * - familyId = ID de la famille (ex: food_drinks)
 * - subfamilyId = ID de la sous-famille (ex: 1 = Le Salé, 2 = Le Sucré)
 *
 * ⚠️ Ancien nom "levelId" était trompeur car on confondait avec les "vrais levels" (Primary/Collège)
 */
export const useExerciseContent = <T = any>(
  familyId: number,
  subfamilyId: number
): UseExerciseContentReturn<T> => {
  const { db } = useUser();
  const [module, setModule] = useState<Module | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem<T>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!db || typeof db === 'number' || familyId <= 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const familyResult = await db.getFirstAsync<Family>(
          `SELECT * FROM families WHERE id = ?`, 
          [familyId]
        );
        
        if (familyResult?.id == null) {
          throw new Error(`Famille ID "${familyId}" introuvable.`);
        }
        
        const validatedFamilyId = familyResult.id;
        setFamily(familyResult);

        const moduleResult = await db.getFirstAsync<Module>(
          `SELECT * FROM modules WHERE slug = ?`,
          [familyResult.module_slug]
        );
        setModule(moduleResult || null);

        // ✅ FIX : Utilise subfamily_id au lieu de level
        // subfamilyId=0 means "no subfamily" → match both NULL and 0
        const contentResult = subfamilyId === 0
          ? await db.getAllAsync<{ id: number; data: string }>(
              `SELECT id, data FROM content WHERE family_id = ? AND (subfamily_id IS NULL OR subfamily_id = 0)`,
              [validatedFamilyId]
            )
          : await db.getAllAsync<{ id: number; data: string }>(
              `SELECT id, data FROM content WHERE family_id = ? AND subfamily_id = ?`,
              [validatedFamilyId, subfamilyId]
            );
        
        const parsedContent = contentResult.map(item => {
          try {
            return { 
              id: item.id, 
              data: JSON.parse(item.data) as T 
            };
          } catch (e) {
            // ✅ S2486 Fixed: Exception is now handled with a log
            console.error(`[useExerciseContent] JSON Parse Error (ID: ${item.id}):`, e);
            return null;
          }
        }).filter((item): item is ContentItem<T> => item !== null);

        setContentItems(parsedContent);

      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [db, familyId, subfamilyId]);

  return { module, family, contentItems, isLoading, error };
};

export default useExerciseContent;