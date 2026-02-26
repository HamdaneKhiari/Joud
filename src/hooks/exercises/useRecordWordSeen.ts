/**
 * ============================================
 * HOOK: useRecordWordSeen
 * Logue chaque mot vu dans les exercices vocab
 * + ajoute automatiquement au SRS si contentId fourni
 * Utilisé par le Coach IA pour suggérer une pratique
 * sur les mots récents (derniers 10 distincts)
 * ============================================
 */

import { log } from '@/utils/logUtils';
import { useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { addWordToSRS } from '@/database/queries';

interface RecordWordSeenParams {
  word:        string;
  translation: string;
  familyId:    string;
  contentId?:  number;
}

export const useRecordWordSeen = () => {
  const { db, user } = useUser();

  const recordWordSeen = useCallback(async ({
    word,
    translation,
    familyId,
    contentId,
  }: RecordWordSeenParams) => {
    if (!db || typeof db === 'number') return;

    try {
      await db.runAsync(
        `INSERT INTO vocabulary_seen (word, translation, family_id, seen_at)
         VALUES (?, ?, ?, ?)`,
        [word, translation, familyId, Date.now()]
      );

      // Ajouter au SRS pour les futures révisions espacées
      if (contentId && user) {
        await addWordToSRS(db, user.id, contentId);
      }
    } catch (e) {
      log.error('[useRecordWordSeen] Failed:', e);
    }
  }, [db, user]);

  return { recordWordSeen };
};
