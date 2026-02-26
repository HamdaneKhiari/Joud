/**
 * useReadingContent — charge les questions de lecture depuis SQLite
 * Extrait de ReadingExerciseScreen pour séparer data et UI
 */

import { useState, useEffect } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { log } from '@/utils/logUtils';

interface UseReadingContentResult {
  questions: Record<string, any>[];
  loading: boolean;
}

export const useReadingContent = (
  db: SQLiteDatabase | number | null | undefined,
  familyId: number | undefined,
  subfamilyId: number
): UseReadingContentResult => {
  const [questions, setQuestions] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      if (!db || typeof db === 'number' || !familyId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const result = await db.getAllAsync<{ data: string }>(
          `SELECT data FROM content WHERE family_id = ? AND subfamily_id = ?`,
          [familyId, subfamilyId]
        );

        if (result && result.length > 0) {
          const parsed = result.map(item => {
            const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
            return (data.passage && data.question_text) ? data : null;
          }).filter(Boolean) as Record<string, any>[];
          setQuestions(parsed);
        }
      } catch (error) {
        log.error('[useReadingContent] Load failed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [db, familyId, subfamilyId]);

  return { questions, loading };
};
