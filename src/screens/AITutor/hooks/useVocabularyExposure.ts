/**
 * ============================================
 * HOOK: useVocabularyExposure
 * Récupère les 10 derniers mots distincts vus
 * depuis vocabulary_seen — utilisé par le Coach IA
 * pour suggérer une pratique conversationnelle
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

// ============================================
// TYPES
// ============================================

export interface RecentWord {
  word:        string;
  translation: string;
  lastSeen:    number;
}

// ============================================
// CONFIG
// ============================================

const MAX_WORDS = 10;

// ============================================
// HOOK
// ============================================

export const useVocabularyExposure = () => {
  const { db } = useUser();
  const [recentWords, setRecentWords] = useState<RecentWord[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const rows = await db.getAllAsync<{
          word:        string;
          translation: string;
          last_seen:   number;
        }>(
          `SELECT word, translation, MAX(seen_at) as last_seen
           FROM vocabulary_seen
           GROUP BY word
           ORDER BY last_seen DESC
           LIMIT ?`,
          [MAX_WORDS]
        );

        setRecentWords(rows.map(r => ({
          word:        r.word,
          translation: r.translation,
          lastSeen:    r.last_seen,
        })));
      } catch (e) {
        console.error('[useVocabularyExposure] Erreur:', e);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [db]);

  return { recentWords, isLoading };
};
