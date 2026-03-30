/**
 * useConnectorContent — charge les exercices Connector depuis SQLite
 * Extrait de ConnectorExerciseScreen pour séparer data et UI
 */

import { useState, useEffect } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { log } from '@/utils/logUtils';

export interface ConnectorQuestion {
  id: number;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

interface UseConnectorContentResult {
  questions: ConnectorQuestion[];
  loading: boolean;
}

export const useConnectorContent = (
  db: SQLiteDatabase | number | null | undefined,
  familyId: number | undefined,
  subfamilyId: number
): UseConnectorContentResult => {
  const [questions, setQuestions] = useState<ConnectorQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      if (!db || typeof db === 'number' || !familyId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const result = await db.getAllAsync<{ id: number; data: string; content_type: string }>(
          `SELECT id, data, content_type FROM content WHERE family_id = ? AND subfamily_id = ?`,
          [familyId, subfamilyId]
        );

        if (result && result.length > 0) {
          const parsed: ConnectorQuestion[] = result.map(item => ({
            id: item.id,
            type: item.content_type,
            data: typeof item.data === 'string' ? JSON.parse(item.data) : item.data,
          }));
          setQuestions(parsed);
        }
      } catch (error) {
        log.error('[useConnectorContent] Load failed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [db, familyId, subfamilyId]);

  return { questions, loading };
};
