import { useState, useEffect } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { log } from '@/utils/logUtils';

export interface ReadingQuestion {
  passage: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  hint?: string;
}

interface UseReadingContentResult {
  questions: ReadingQuestion[];
  loading: boolean;
}

export const useReadingContent = (
  db: SQLiteDatabase | number | null | undefined,
  familyId: number | undefined,
  subfamilyId: number
): UseReadingContentResult => {
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadContent = async () => {
      if (!db || typeof db === 'number' || !familyId) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        if (!cancelled) setLoading(true);
        const result = await db.getAllAsync<{ data: string }>(
          `SELECT data FROM content WHERE family_id = ? AND subfamily_id = ?`,
          [familyId, subfamilyId]
        );

        if (result && result.length > 0) {
          const parsed = result.map(item => {
            const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
            const isValid = data.passage && data.question_text
              && Array.isArray(data.options) && data.correct_answer;
            return isValid ? data as ReadingQuestion : null;
          }).filter((q): q is ReadingQuestion => q !== null);
          if (!cancelled) setQuestions(parsed);
        }
      } catch (error) {
        log.error('[useReadingContent] Load failed:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadContent();
    return () => { cancelled = true; };
  }, [db, familyId, subfamilyId]);

  return { questions, loading };
};
