/**
 * ============================================
 * HOOK: useExerciseContent
 * Récupère le contenu complet d'un exercice (module, famille, items) depuis la DB.
 * C'est le coeur du moteur d'exercices data-driven.
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { Family, Module } from '@/database/schema';

// ============================================
// TYPES
// ============================================

/**
 * Structure d'un item de vocabulaire, parsé depuis la colonne `data` (JSON) de la table `content`.
 */
export interface VocabularyItem {
  word: string;
  translation: string;
  example?: string;
  image?: string;
  audio?: string;
}

/**
 * Représente une ligne de la table `content`, avec sa donnée `data` déjà parsée.
 */
export interface ContentItem {
  id: number; // ID de la ligne dans la table `content`
  data: VocabularyItem;
}

/**
 * Objet de retour du hook, contenant toutes les données nécessaires pour afficher un exercice.
 */
interface UseExerciseContentReturn {
  module: Module | null;
  family: Family | null;
  contentItems: ContentItem[];
  isLoading: boolean;
  error: Error | null;
}

// ============================================
// HOOK
// ============================================

export const useExerciseContent = (
  familyId: string,
  levelId: number
): UseExerciseContentReturn => {
  const { db } = useUser();
  const [module, setModule] = useState<Module | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!db || !familyId || !levelId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const familyResult = await db.getFirstAsync<Family>(`SELECT * FROM families WHERE id = ?`, [parseInt(familyId, 10)]);
        if (!familyResult) throw new Error(`Famille avec id "${familyId}" non trouvée.`);
        setFamily(familyResult);

        const moduleResult = await db.getFirstAsync<Module>(`SELECT * FROM modules WHERE id = ?`, [familyResult.module_id]);
        setModule(moduleResult);

        const contentResult = await db.getAllAsync<{ id: number; data: string }>(`SELECT id, data FROM content WHERE family_id = ? AND level = ?`, [familyResult.id, levelId]);
        
        const parsedContent = contentResult.map(item => {
          try {
            return { id: item.id, data: JSON.parse(item.data) as VocabularyItem };
          } catch (e) {
            console.error(`Erreur de parsing JSON pour le contenu ID ${item.id}:`, e);
            return null;
          }
        }).filter((item): item is ContentItem => item !== null);
        setContentItems(parsedContent);

      } catch (err) {
        console.error('Erreur dans useExerciseContent:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [db, familyId, levelId]);

  return { module, family, contentItems, isLoading, error };
};