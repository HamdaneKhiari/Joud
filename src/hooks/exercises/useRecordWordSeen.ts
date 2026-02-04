/**
 * ============================================
 * HOOK: useRecordWordSeen
 * Loguait chaque mot vu dans les exercices vocab
 * Utilisé par le Coach IA pour suggérer une pratique
 * sur les mots récents (derniers 10 distincts)
 * ============================================
 */

import { useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';

interface RecordWordSeenParams {
  word:        string;
  translation: string;
  familyId:    string;
}

export const useRecordWordSeen = () => {
  const { db } = useUser();

  const recordWordSeen = useCallback(async ({
    word,
    translation,
    familyId,
  }: RecordWordSeenParams) => {
    if (!db) return;

    try {
      await db.runAsync(
        `INSERT INTO vocabulary_seen (word, translation, family_id, seen_at)
         VALUES (?, ?, ?, ?)`,
        [word, translation, familyId, Date.now()]
      );
    } catch (e) {
      console.error('[useRecordWordSeen] Failed:', e);
    }
  }, [db]);

  return { recordWordSeen };
};
