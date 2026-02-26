/**
 * useGrammarContent — charge et mappe les règles de grammaire depuis SQLite
 * Extrait de GrammarExerciseScreen pour séparer data et UI
 */

import { useState, useEffect } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { log } from '@/utils/logUtils';

export interface GrammarRuleData {
  id: number;
  title: string;
  content: string;
  simplified: string;
  examples: string[];
  exercise: {
    question: string;
    correctAnswer: string;
    options: string[];
  };
}

export interface GrammarFamilyData {
  title: string;
  icon?: string;
  rules: GrammarRuleData[];
}

interface UseGrammarContentResult {
  grammarFamily: GrammarFamilyData | null;
  loading: boolean;
}

export const useGrammarContent = (
  db: SQLiteDatabase | number | null | undefined,
  familyId: string,
  subfamilyId: number
): UseGrammarContentResult => {
  const [grammarFamily, setGrammarFamily] = useState<GrammarFamilyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!db || typeof db === 'number' || !familyId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        const family = await db.getFirstAsync<{ name: string; icon: string }>(
          'SELECT name, icon FROM families WHERE id = ?',
          [familyId]
        );

        const contentRows = await db.getAllAsync<{ data: string; id: number }>(
          'SELECT id, data FROM content WHERE family_id = ? AND subfamily_id = ?',
          [familyId, subfamilyId]
        );

        const rules: GrammarRuleData[] = contentRows.map(row => {
          const data = JSON.parse(row.data);
          const firstExercise = data.exercises?.[0];
          return {
            id: row.id,
            title: data.rule_title || '',
            content: data.explanation || data.rule_title || data.rule || '',
            simplified: data.simplified || '',
            examples: data.examples || [],
            exercise: {
              question: firstExercise?.question || data.sentence || '',
              correctAnswer: firstExercise?.correct_answer || firstExercise?.correctAnswer || data.correctAnswer || '',
              options: firstExercise?.options || data.options || [],
            },
          };
        });

        setGrammarFamily({ title: family?.name ?? '', icon: family?.icon, rules });
      } catch (e) {
        log.error('[useGrammarContent] Load failed:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [db, familyId, subfamilyId]);

  return { grammarFamily, loading };
};
