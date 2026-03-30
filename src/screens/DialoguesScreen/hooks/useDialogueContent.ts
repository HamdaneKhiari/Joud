/**
 * useDialogueContent — charge et mappe un dialogue depuis SQLite
 * Extrait du DialogueExerciseScreen pour séparer data et UI
 */

import { useState, useEffect } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Dialogue, Question } from '@/components/pedagogy/dialogues/DialogueCard';
import { log } from '@/utils/logUtils';

const SPEAKER_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63'];

interface RawQuestion {
  correctAnswer?: number | string;
  correct_answer?: number | string;
  options?: string[];
  question?: string;
  text?: string;
  hint?: string;
}

/** Mappe une question brute (formats variés selon la migration) vers le type Question */
function mapQuestion(q: RawQuestion): Question {
  let correctIndex = 0;

  if (typeof q.correctAnswer === 'number') {
    correctIndex = q.correctAnswer;
  } else if (typeof q.correct_answer === 'number') {
    correctIndex = q.correct_answer;
  } else if (typeof q.correct_answer === 'string' && q.options) {
    const idx = q.options.indexOf(q.correct_answer);
    if (idx >= 0) {
      correctIndex = idx;
    } else {
      log.warn('[useDialogueContent] correct_answer string not found in options, defaulting to 0:', q.correct_answer);
    }
  }

  return {
    question: q.question || q.text || '',
    options: q.options || [],
    correctAnswer: correctIndex,
    hint: q.hint,
  };
}

interface UseDialogueContentResult {
  dialogue: Dialogue | null;
  isLoading: boolean;
}

export const useDialogueContent = (
  db: SQLiteDatabase | number | null | undefined,
  familyId: string,
  subfamilyId: number
): UseDialogueContentResult => {
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!db || typeof db === 'number' || !familyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const numFamilyId = Number.parseInt(String(familyId), 10);

        log.debug('[useDialogueContent] Loading:', { familyId: numFamilyId, subfamilyId });

        const rows = await db.getAllAsync<{ id: number; data: string }>(
          `SELECT id, data FROM content
           WHERE family_id = ? AND subfamily_id = ? AND content_type = 'dialogue'
           ORDER BY id`,
          [numFamilyId, subfamilyId]
        );

        log.debug('[useDialogueContent] Rows found:', rows.length);

        if (rows.length === 0) return;

        const rawData = JSON.parse(rows[0].data);

        const family = await db.getFirstAsync<{ name: string; icon: string }>(
          `SELECT name, icon FROM families WHERE id = ?`,
          [numFamilyId]
        );

        // Compatibilité : migration 036 utilise "dialogue", interface attend "messages"
        const rawMessages = rawData.messages || rawData.dialogue || [];

        // Construire les personnages depuis les speakers si non fournis
        const uniqueSpeakers: string[] = [];
        for (const msg of rawMessages) {
          if (msg.speaker && !uniqueSpeakers.includes(msg.speaker)) {
            uniqueSpeakers.push(msg.speaker);
          }
        }
        const characters = rawData.characters || uniqueSpeakers.map((name: string, i: number) => ({
          name,
          color: SPEAKER_COLORS[i % SPEAKER_COLORS.length],
        }));

        const questions: Question[] = (rawData.questions || []).map(mapQuestion);

        setDialogue({
          name: rawData.name || rawData.title || family?.name || 'Dialogue',
          title: rawData.title,
          icon: rawData.icon || family?.icon || '💬',
          color: rawData.color,
          characters,
          messages: rawMessages,
          questions,
        });
      } catch (e) {
        log.error('[useDialogueContent] Load error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [db, familyId, subfamilyId]);

  return { dialogue, isLoading };
};
