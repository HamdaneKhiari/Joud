/**
 * ============================================
 * HOOK: useGuidedDomainSummaries
 * Queries SQLite for each coaching domain and returns
 * structured summaries with display-ready French strings.
 * Only domains with student activity are returned.
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

// ============================================
// TYPES
// ============================================

export type GuidedDomain = 'vocab' | 'grammar' | 'dialogues' | 'reading' | 'phrase_types';

export interface ErrorExample {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  familyName: string;
}

export interface DomainStats {
  errorCount: number;
  errorExamples: ErrorExample[];
  familiesWorked: number;
  completedCount: number;
  recentWords?: Array<{ word: string; translation: string }>;
  wordsSeenThisWeek?: number;
}

export interface DomainSummary {
  domain: GuidedDomain;
  label: string;
  emoji: string;
  subtitle: string;
  hasActivity: boolean;
  stats: DomainStats;
}

// ============================================
// CONFIG
// ============================================

const DOMAIN_META: Record<GuidedDomain, { label: string; emoji: string }> = {
  vocab:        { label: 'Vocabulaire',  emoji: '📝' },
  grammar:      { label: 'Grammaire',    emoji: '📐' },
  dialogues:    { label: 'Dialogues',    emoji: '💬' },
  reading:      { label: 'Lecture',       emoji: '📖' },
  phrase_types:  { label: 'Phrases',      emoji: '✍️' },
};

const ANALYSIS_PERIOD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// ============================================
// HOOK
// ============================================

export const useGuidedDomainSummaries = () => {
  const { db } = useUser();
  const [domains, setDomains] = useState<DomainSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!db || typeof db === 'number') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const now = Date.now();
        const periodStart = now - ANALYSIS_PERIOD_MS;
        const weekStart = now - WEEK_MS;
        const results: DomainSummary[] = [];

        // =================== VOCABULAIRE ===================
        const vocabWords = await db.getAllAsync<{ word: string; translation: string; last_seen: number }>(
          `SELECT word, translation, MAX(seen_at) as last_seen
           FROM vocabulary_seen
           GROUP BY word
           ORDER BY last_seen DESC
           LIMIT 10`
        );

        const vocabWeekCount = await db.getFirstAsync<{ count: number }>(
          `SELECT COUNT(DISTINCT word) as count FROM vocabulary_seen WHERE seen_at > ?`,
          [weekStart]
        );

        const vocabErrors = await db.getAllAsync<{ question: string; user_answer: string; correct_answer: string; family_name: string }>(
          `SELECT e.question, e.user_answer, e.correct_answer, COALESCE(f.name, 'Vocabulaire') as family_name
           FROM exercise_errors e
           LEFT JOIN families f ON e.family_id = f.id
           WHERE e.module_slug IN ('vocab', 'fastvocab') AND e.timestamp > ?
           ORDER BY e.timestamp DESC LIMIT 3`,
          [periodStart]
        );

        const vocabStats: DomainStats = {
          errorCount: vocabErrors.length,
          errorExamples: vocabErrors.map(e => ({ question: e.question, userAnswer: e.user_answer, correctAnswer: e.correct_answer, familyName: e.family_name })),
          familiesWorked: 0,
          completedCount: 0,
          recentWords: vocabWords.map(w => ({ word: w.word, translation: w.translation })),
          wordsSeenThisWeek: vocabWeekCount?.count || 0,
        };

        if (vocabWords.length > 0 || vocabErrors.length > 0) {
          const weekCount = vocabStats.wordsSeenThisWeek || 0;
          const errPart = vocabStats.errorCount > 0 ? `, ${vocabStats.errorCount} erreur${vocabStats.errorCount > 1 ? 's' : ''}` : '';
          results.push({
            domain: 'vocab',
            ...DOMAIN_META.vocab,
            subtitle: `${weekCount} mot${weekCount > 1 ? 's' : ''} vu${weekCount > 1 ? 's' : ''} cette semaine${errPart}`,
            hasActivity: true,
            stats: vocabStats,
          });
        }

        // =================== HELPER: module domain query ===================
        const loadModuleDomain = async (
          domain: GuidedDomain,
          moduleSlugs: string[],
        ): Promise<DomainSummary | null> => {
          const slugPlaceholders = moduleSlugs.map(() => '?').join(',');

          // Families worked (with progress)
          const familiesWorked = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(DISTINCT p.family_id) as count
             FROM progress p
             JOIN families f ON p.family_id = f.id
             WHERE f.module_slug IN (${slugPlaceholders}) AND p.completed > 0`,
            moduleSlugs
          );

          // Completed items
          const completed = await db.getFirstAsync<{ total: number }>(
            `SELECT COALESCE(SUM(p.completed), 0) as total
             FROM progress p
             JOIN families f ON p.family_id = f.id
             WHERE f.module_slug IN (${slugPlaceholders}) AND p.completed > 0`,
            moduleSlugs
          );

          // Errors
          const errors = await db.getAllAsync<{ question: string; user_answer: string; correct_answer: string; family_name: string }>(
            `SELECT e.question, e.user_answer, e.correct_answer, COALESCE(f.name, '?') as family_name
             FROM exercise_errors e
             LEFT JOIN families f ON e.family_id = f.id
             WHERE e.module_slug IN (${slugPlaceholders}) AND e.timestamp > ?
             ORDER BY e.timestamp DESC LIMIT 3`,
            [...moduleSlugs, periodStart]
          );

          const errorCount = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM exercise_errors
             WHERE module_slug IN (${slugPlaceholders}) AND timestamp > ?`,
            [...moduleSlugs, periodStart]
          );

          const numFamilies = familiesWorked?.count || 0;
          const numCompleted = completed?.total || 0;
          const numErrors = errorCount?.count || 0;

          if (numFamilies === 0 && numErrors === 0) return null;

          const stats: DomainStats = {
            errorCount: numErrors,
            errorExamples: errors.map(e => ({ question: e.question, userAnswer: e.user_answer, correctAnswer: e.correct_answer, familyName: e.family_name })),
            familiesWorked: numFamilies,
            completedCount: numCompleted,
          };

          // Build subtitle per domain
          let subtitle = '';
          const meta = DOMAIN_META[domain];

          switch (domain) {
            case 'grammar': {
              const errPart = numErrors > 0 ? `, ${numErrors} erreur${numErrors > 1 ? 's' : ''}` : '';
              subtitle = `${numFamilies} regle${numFamilies > 1 ? 's' : ''} travaillee${numFamilies > 1 ? 's' : ''}${errPart}`;
              break;
            }
            case 'dialogues':
              subtitle = `${numFamilies} dialogue${numFamilies > 1 ? 's' : ''} termine${numFamilies > 1 ? 's' : ''}`;
              break;
            case 'reading':
              subtitle = `${numFamilies} texte${numFamilies > 1 ? 's' : ''} lu${numFamilies > 1 ? 's' : ''}`;
              break;
            case 'phrase_types':
              subtitle = `${numCompleted} phrase${numCompleted > 1 ? 's' : ''} construite${numCompleted > 1 ? 's' : ''}`;
              break;
          }

          return {
            domain,
            label: meta.label,
            emoji: meta.emoji,
            subtitle,
            hasActivity: true,
            stats,
          };
        };

        // =================== GRAMMAIRE ===================
        const grammar = await loadModuleDomain('grammar', ['grammar']);
        if (grammar) results.push(grammar);

        // =================== DIALOGUES ===================
        const dialogues = await loadModuleDomain('dialogues', ['dialogues']);
        if (dialogues) results.push(dialogues);

        // =================== LECTURE ===================
        const reading = await loadModuleDomain('reading', ['reading']);
        if (reading) results.push(reading);

        // =================== PHRASES ===================
        const phrases = await loadModuleDomain('phrase_types', ['phrase_types', 'phrases']);
        if (phrases) results.push(phrases);

        setDomains(results);
      } catch (error) {
        console.error('[useGuidedDomainSummaries] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [db]);

  return { domains, isLoading };
};
