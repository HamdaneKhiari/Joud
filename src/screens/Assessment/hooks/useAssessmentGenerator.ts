/**
 * ============================================
 * USE ASSESSMENT GENERATOR (DB-Driven)
 * Hook pour générer dynamiquement un assessment depuis la base de données
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import type {
  AssessmentQuestion,
  AssessmentPool,
  AssessmentDefinitionQuestion,
  AssessmentBlanksQuestion,
  AssessmentSentenceQuestion,
} from '../schema';

/**
 * Mélange un tableau de manière aléatoire (Fisher-Yates)
 */
const shuffle = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Génère un ID unique pour le pool
 */
const generatePoolId = (level: number): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 11);
  return `assessment_L${level}_${timestamp}_${random}`;
};

/**
 * Hook pour générer un assessment depuis la DB
 * @param level - Niveau d'évaluation (1, 2, 3, 4)
 * @param maxQuestions - Nombre maximum de questions (default: 20)
 */
export const useAssessmentGenerator = (level: number, maxQuestions: number = 20) => {
  const { db } = useUser();
  const [pool, setPool] = useState<AssessmentPool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generatePool = async () => {
      if (!db) return;

      try {
        setIsLoading(true);
        setError(null);

        // 1. Récupérer la famille "assessment"
        const family = await db.getFirstAsync<{ id: number }>(
          `SELECT id FROM families WHERE module_slug = 'assessment' LIMIT 1`
        );

        if (!family) {
          throw new Error('Assessment family not found in database');
        }

        // 2. Récupérer tous les contenus assessment pour ce niveau
        const contents = await db.getAllAsync<{
          id: number;
          content_type: string;
          data: string;
        }>(
          `SELECT id, content_type, data
           FROM content
           WHERE family_id = ? AND level = ?
           AND content_type LIKE 'assessment_%'
           ORDER BY id`,
          [family.id, level]
        );

        if (contents.length === 0) {
          throw new Error(`No assessment questions found for level ${level}`);
        }

        // 3. Parser les questions
        const questions: AssessmentQuestion[] = contents.map((item, index) => {
          const parsed = JSON.parse(item.data);

          // Ajouter un ID unique à chaque question
          const uniqueId = `${parsed.type}_${item.id}_${Date.now()}_${index}`;

          return {
            ...parsed,
            id: uniqueId,
          };
        });

        // 4. Mélanger les questions
        const shuffled = shuffle(questions);

        // 5. Limiter au nombre max
        const selectedQuestions = shuffled.slice(0, maxQuestions);

        // 6. Calculer les statistiques par thème
        const byTheme = {
          vocabulary: selectedQuestions.filter((q) => q.theme === 'vocabulary').length,
          grammar: selectedQuestions.filter((q) => q.theme === 'grammar').length,
          phrases: selectedQuestions.filter((q) => q.theme === 'phrases').length,
          conversations: selectedQuestions.filter((q) => q.theme === 'conversations').length,
          reading: selectedQuestions.filter((q) => q.theme === 'reading').length,
        };

        // 7. Créer le pool
        const generatedPool: AssessmentPool = {
          id: generatePoolId(level),
          levelId: level,
          questions: selectedQuestions,
          totalQuestions: selectedQuestions.length,
          byTheme,
        };

        setPool(generatedPool);
      } catch (err) {
        console.error('[useAssessmentGenerator] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    generatePool();
  }, [level, maxQuestions, db]);

  return {
    pool,
    isLoading,
    error,
    questions: pool?.questions || [],
    totalQuestions: pool?.totalQuestions || 0,
    byTheme: pool?.byTheme || {
      vocabulary: 0,
      grammar: 0,
      phrases: 0,
      conversations: 0,
      reading: 0,
    },
  };
};
