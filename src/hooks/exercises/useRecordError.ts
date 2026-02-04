/**
 * ============================================
 * HOOK: useRecordError
 * Enregistre les erreurs d'exercice dans SQLite
 * Utilisé par le Coach IA pour analyser les points faibles
 * ============================================
 */

import { useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';

interface RecordErrorParams {
  familyId: string | number;
  moduleSlug: string;   // 'grammar' | 'sentences' | 'reading'
  question: string;     // La question posée (ou la phrase à reproduire)
  userAnswer: string;   // Ce que l'utilisateur a répondu
  correctAnswer: string;// La bonne réponse
  level: number;
}

export const useRecordError = () => {
  const { db } = useUser();

  const recordError = useCallback(async ({
    familyId,
    moduleSlug,
    question,
    userAnswer,
    correctAnswer,
    level,
  }: RecordErrorParams) => {
    if (!db) return;

    try {
      await db.runAsync(
        `INSERT INTO exercise_errors (family_id, module_slug, question, user_answer, correct_answer, level, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          Number(familyId),
          moduleSlug,
          question,
          userAnswer,
          correctAnswer,
          level,
          Date.now(),
        ]
      );
    } catch (e) {
      console.error('[useRecordError] Failed to record error:', e);
    }
  }, [db]);

  return { recordError };
};
