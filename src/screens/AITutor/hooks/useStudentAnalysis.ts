/**
 * ============================================
 * HOOK: useErrorAnalysis
 * Analyse les erreurs depuis exercise_errors
 * Utilisé par le Coach IA (mode guidé)
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

// ============================================
// TYPES
// ============================================

export interface ExerciseError {
  question:      string;
  userAnswer:    string;
  correctAnswer: string;
  familyId:      number;
  timestamp:     number;
}

export interface ErrorsByModule {
  moduleSlug:    string;
  errorCount:    number;
  lastErrorDate: number;
  errors:        ExerciseError[];
}

// ============================================
// CONFIG
// ============================================

export const MODULE_LABELS: Record<string, { label: string; emoji: string }> = {
  grammar:   { label: 'Grammaire', emoji: '📚' },
  sentences:  { label: 'Phrases', emoji: '💬' },
  reading:   { label: 'Lecture',   emoji: '📖' },
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// ============================================
// HOOK
// ============================================

export const useErrorAnalysis = () => {
  const { db } = useUser();
  const [errorsByModule, setErrorsByModule] = useState<ErrorsByModule[]>([]);
  const [totalErrors,    setTotalErrors]    = useState(0);
  const [isLoading,      setIsLoading]      = useState(true);

  useEffect(() => {
    const loadErrors = async () => {
      if (!db || typeof db === 'number') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const thirtyDaysAgo = Date.now() - THIRTY_DAYS_MS;

        // 1. Résumé par module (30 derniers jours)
        const moduleSummary = await db.getAllAsync<{
          module_slug: string;
          error_count: number;
          last_error:  number;
        }>(
          `SELECT module_slug,
                  COUNT(*) as error_count,
                  MAX(timestamp) as last_error
           FROM exercise_errors
           WHERE timestamp > ?
           GROUP BY module_slug
           ORDER BY error_count DESC`,
          [thirtyDaysAgo]
        );

        // 2. Pour chaque module : les 5 dernières erreurs
        const result: ErrorsByModule[] = [];
        let total = 0;

        for (const summary of moduleSummary) {
          const errors = await db.getAllAsync<{
            question:       string;
            user_answer:    string;
            correct_answer: string;
            family_id:      number;
            timestamp:      number;
          }>(
            `SELECT question, user_answer, correct_answer, family_id, timestamp
             FROM exercise_errors
             WHERE module_slug = ? AND timestamp > ?
             ORDER BY timestamp DESC
             LIMIT 5`,
            [summary.module_slug, thirtyDaysAgo]
          );

          result.push({
            moduleSlug:    summary.module_slug,
            errorCount:    summary.error_count,
            lastErrorDate: summary.last_error,
            errors: errors.map(e => ({
              question:      e.question,
              userAnswer:    e.user_answer,
              correctAnswer: e.correct_answer,
              familyId:      e.family_id,
              timestamp:     e.timestamp,
            })),
          });

          total += summary.error_count;
        }

        setErrorsByModule(result);
        setTotalErrors(total);
      } catch (e) {
        console.error('[useErrorAnalysis] Erreur:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadErrors();
  }, [db]);

  return { errorsByModule, totalErrors, isLoading };
};
