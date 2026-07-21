// Enregistre les erreurs d'exercice dans SQLite, utilisé par le Coach IA pour analyser les points faibles

import { log } from '@/utils/logUtils';
import { useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';

interface RecordErrorParams {
  familyId: string | number;
  moduleSlug: string;
  question: string;     // La question posée (ou la phrase à reproduire)
  userAnswer: string;
  correctAnswer: string;
  level: number;
}

export const useRecordError = () => {
  const { db, user } = useUser();

  const recordError = useCallback(async ({
    familyId,
    moduleSlug,
    question,
    userAnswer,
    correctAnswer,
    level,
  }: RecordErrorParams) => {
    if (!db || typeof db === 'number') return;

    try {
      await db.runAsync(
        `INSERT INTO exercise_errors (user_id, family_id, module_slug, question, user_answer, correct_answer, level, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user?.id || '',
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
      log.error('[useRecordError] Failed to record error:', e);
    }
  }, [db, user]);

  return { recordError };
};
