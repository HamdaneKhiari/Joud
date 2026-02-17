/**
 * ============================================
 * HOOK: useDailyWord
 * Récupère le mot du jour depuis la DB
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/themes/ThemeContext';
import { getDailyWord } from '@/database/queries';

interface UseDailyWordReturn {
  dailyWord: { english: string; french: string; emoji: string } | null;
  isLoading: boolean;
  error: string | null;
}

export const useDailyWord = (): UseDailyWordReturn => {
  const { db } = useUser();
  const { identity } = useTheme();
  const [dailyWord, setDailyWord] = useState<{ english: string; french: string; emoji: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyWord = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const word = await getDailyWord(db, identity.id);

        if (word) {
          setDailyWord({
            english: word.english,
            french: word.french,
            emoji: '📖',
          });
        } else {
          setDailyWord({
            english: 'Learn',
            french: 'Apprendre',
            emoji: '🎓',
          });
        }
      } catch (err) {
        console.error('[useDailyWord] Error:', err);
        setError('Failed to load daily word');
        setDailyWord({
          english: 'Learn',
          french: 'Apprendre',
          emoji: '🎓',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyWord();
  }, [db, identity.id]);

  return { dailyWord, isLoading, error };
};
