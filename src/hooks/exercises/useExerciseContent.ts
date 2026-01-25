/**
 * ============================================
 * HOOK: useExerciseContent
 * Récupère le contenu complet d'un exercice (module, famille, items) depuis la DB.
 * ✅ Gère n'importe quel type de donnée (Vocab, Sentences, etc.) via Generics.
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { Family, Module } from '@/database/schema';

// ============================================
// TYPES DE CONTENU (EXTENSIBLES)
// ============================================

/** Structure pour le module Vocabulaire */
export interface VocabularyData {
  word: string;
  translation: string;
  example?: string;
  image?: string;
  audio?: string;
}

/** Structure pour le module Sentences (ton nouvel objectif) */
export interface SentenceData {
  phrase_fr: string;
  phrase_en: string;
  concretement: string;
  build: string;
  audio?: string;
}

/** * Interface générique pour un item de contenu 
 * T représente le type de données stocké dans le JSON 'data'
 */
export interface ContentItem<T> {
  id: number;
  data: T;
}

interface UseExerciseContentReturn<T> {
  module: Module | null;
  family: Family | null;
  contentItems: ContentItem<T>[];
  isLoading: boolean;
  error: Error | null;
}

// ============================================
// HOOK
// ============================================

export const useExerciseContent = <T = any>(
  familyId: string,
  levelId: number
): UseExerciseContentReturn<T> => {
  const { db } = useUser();
  const [module, setModule] = useState<Module | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem<T>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      // Sécurité : on attend que la DB soit prête et que les IDs soient valides
      if (!db || !familyId || isNaN(parseInt(familyId))) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 1. Récupérer la Famille (ex: "Les salutations", "Present Simple")
        const familyResult = await db.getFirstAsync<Family>(
          `SELECT * FROM families WHERE id = ?`, 
          [parseInt(familyId, 10)]
        );
        
        if (!familyResult) throw new Error(`Famille ID "${familyId}" introuvable.`);
        setFamily(familyResult);

        // 2. Récupérer le Module parent (ex: Vocabulaire, Grammaire)
        const moduleResult = await db.getFirstAsync<Module>(
          `SELECT * FROM modules WHERE id = ?`, 
          [familyResult.module_id]
        );
        setModule(moduleResult || null);

        // 3. Récupérer tous les items de contenu pour ce niveau
        const contentResult = await db.getAllAsync<{ id: number; data: string }>(
          `SELECT id, data FROM content WHERE family_id = ? AND level = ?`, 
          [familyResult.id, levelId]
        );
        
        // 4. Parsing sécurisé du JSON 'data'
        const parsedContent = contentResult.map(item => {
          try {
            return { 
              id: item.id, 
              data: JSON.parse(item.data) as T // ✅ Cast vers le type générique T
            };
          } catch (e) {
            console.error(`[useExerciseContent] Erreur parsing JSON (ID: ${item.id}):`, e);
            return null;
          }
        }).filter((item): item is ContentItem<T> => item !== null);

        setContentItems(parsedContent);

      } catch (err) {
        console.error('[useExerciseContent] Global Error:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [db, familyId, levelId]);

  return { module, family, contentItems, isLoading, error };
};