/**
 * ============================================
 * HOOK: useAdvancedErrorAnalysis
 * Analyses SQL optimisées pour ÉCONOMISER LES TOKENS
 *
 * Stratégie : Faire toutes les analyses en local avec SQLite,
 * n'envoyer à l'IA que des résumés structurés.
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

// ============================================
// TYPES
// ============================================

/**
 * Pattern d'erreur identifié (ex: "confond present perfect et preterit")
 */
export interface ErrorPattern {
  pattern: string;          // Description du pattern
  count: number;            // Nombre d'occurrences
  examples: string[];       // 2-3 exemples représentatifs
  familyNames: string[];    // Familles concernées
}

/**
 * Analyse agrégée par module (résumé compact pour l'IA)
 */
export interface ModuleAnalysis {
  moduleSlug: string;
  moduleName: string;
  totalErrors: number;
  distinctFamilies: number;
  errorRate: number;        // % d'erreurs sur total exercices
  patterns: ErrorPattern[]; // Top 3-5 patterns identifiés
  weakestFamilies: Array<{  // Top 3 familles les plus problématiques
    familyId: number;
    familyName: string;
    errorCount: number;
  }>;
  recentTrend: 'improving' | 'stable' | 'declining'; // Tendance sur 7 derniers jours
  lastErrorDate: number;
}

/**
 * Analyse globale (tous modules confondus)
 */
export interface GlobalAnalysis {
  totalErrors: number;
  totalModules: number;
  averageErrorRate: number;
  mostProblematicModule: string;
  overallTrend: 'improving' | 'stable' | 'declining';
  moduleAnalyses: ModuleAnalysis[];
}

// ============================================
// CONFIG
// ============================================

const ANALYSIS_PERIOD_DAYS = 30;
const TREND_COMPARISON_DAYS = 7;

// ============================================
// HOOK
// ============================================

export const useAdvancedErrorAnalysis = () => {
  const { db } = useUser();
  const [analysis, setAnalysis] = useState<GlobalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performAnalysis = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const now = Date.now();
        const periodStart = now - (ANALYSIS_PERIOD_DAYS * 24 * 60 * 60 * 1000);
        const trendStart = now - (TREND_COMPARISON_DAYS * 24 * 60 * 60 * 1000);

        // =================== ANALYSE PAR MODULE ===================

        const moduleStats = await db.getAllAsync<{
          module_slug: string;
          error_count: number;
          distinct_families: number;
          last_error: number;
        }>(
          `SELECT
            module_slug,
            COUNT(*) as error_count,
            COUNT(DISTINCT family_id) as distinct_families,
            MAX(timestamp) as last_error
           FROM exercise_errors
           WHERE timestamp > ?
           GROUP BY module_slug
           ORDER BY error_count DESC`,
          [periodStart]
        );

        const moduleAnalyses: ModuleAnalysis[] = [];

        for (const stat of moduleStats) {
          // --- Top 3 familles les plus problématiques ---
          const weakestFamilies = await db.getAllAsync<{
            family_id: number;
            family_name: string;
            error_count: number;
          }>(
            `SELECT
              e.family_id,
              f.name as family_name,
              COUNT(*) as error_count
             FROM exercise_errors e
             JOIN families f ON e.family_id = f.id
             WHERE e.module_slug = ? AND e.timestamp > ?
             GROUP BY e.family_id
             ORDER BY error_count DESC
             LIMIT 3`,
            [stat.module_slug, periodStart]
          );

          // --- Tendance (compare 7 derniers jours vs 7 jours précédents) ---
          const recentErrors = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM exercise_errors
             WHERE module_slug = ? AND timestamp > ?`,
            [stat.module_slug, trendStart]
          );

          const previousErrors = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM exercise_errors
             WHERE module_slug = ?
             AND timestamp BETWEEN ? AND ?`,
            [stat.module_slug, trendStart - (TREND_COMPARISON_DAYS * 24 * 60 * 60 * 1000), trendStart]
          );

          const recentCount = recentErrors?.count || 0;
          const previousCount = previousErrors?.count || 0;

          let trend: 'improving' | 'stable' | 'declining' = 'stable';
          if (previousCount > 0) {
            const change = (recentCount - previousCount) / previousCount;
            if (change < -0.2) trend = 'improving';
            else if (change > 0.2) trend = 'declining';
          }

          // --- Patterns d'erreurs (groupement par similarité de question) ---
          const allErrors = await db.getAllAsync<{
            question: string;
            user_answer: string;
            correct_answer: string;
            family_id: number;
          }>(
            `SELECT question, user_answer, correct_answer, family_id
             FROM exercise_errors
             WHERE module_slug = ? AND timestamp > ?
             ORDER BY timestamp DESC
             LIMIT 20`,
            [stat.module_slug, periodStart]
          );

          // Groupement simple par famille (on pourrait faire plus sophistiqué avec NLP)
          const patternsByFamily = new Map<number, typeof allErrors>();
          for (const err of allErrors) {
            if (!patternsByFamily.has(err.family_id)) {
              patternsByFamily.set(err.family_id, []);
            }
            patternsByFamily.get(err.family_id)!.push(err);
          }

          const patterns: ErrorPattern[] = [];
          for (const [familyId, errors] of patternsByFamily) {
            if (errors.length < 2) continue; // Ignore les patterns isolés

            const familyName = weakestFamilies.find(f => f.family_id === familyId)?.family_name || 'Unknown';

            // Prend 2 exemples représentatifs
            const examples = errors.slice(0, 2).map(e =>
              `"${e.question.substring(0, 50)}..." → répondu "${e.user_answer}" au lieu de "${e.correct_answer}"`
            );

            patterns.push({
              pattern: `Difficulté avec ${familyName}`,
              count: errors.length,
              examples,
              familyNames: [familyName],
            });
          }

          // Sort patterns by count
          patterns.sort((a, b) => b.count - a.count);

          moduleAnalyses.push({
            moduleSlug: stat.module_slug,
            moduleName: stat.module_slug, // TODO: récupérer le vrai nom depuis module_labels
            totalErrors: stat.error_count,
            distinctFamilies: stat.distinct_families,
            errorRate: 0, // TODO: calculer en comparant avec le total d'exercices faits
            patterns: patterns.slice(0, 3), // Top 3 patterns
            weakestFamilies: weakestFamilies.map(f => ({
              familyId: f.family_id,
              familyName: f.family_name,
              errorCount: f.error_count,
            })),
            recentTrend: trend,
            lastErrorDate: stat.last_error,
          });
        }

        // =================== ANALYSE GLOBALE ===================

        const totalErrors = moduleAnalyses.reduce((sum, m) => sum + m.totalErrors, 0);
        const mostProblematic = moduleAnalyses[0]?.moduleSlug || '';

        // Tendance globale (moyenne des tendances)
        const trendCounts = { improving: 0, stable: 0, declining: 0 };
        for (const mod of moduleAnalyses) {
          trendCounts[mod.recentTrend]++;
        }
        const overallTrend: 'improving' | 'stable' | 'declining' =
          trendCounts.improving > trendCounts.declining ? 'improving' :
          trendCounts.declining > trendCounts.improving ? 'declining' : 'stable';

        setAnalysis({
          totalErrors,
          totalModules: moduleAnalyses.length,
          averageErrorRate: 0, // TODO: calculer
          mostProblematicModule: mostProblematic,
          overallTrend,
          moduleAnalyses,
        });

      } catch (error) {
        console.error('[useAdvancedErrorAnalysis] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performAnalysis();
  }, [db]);

  /**
   * Génère un résumé ultra-compact pour l'IA (optimisé tokens)
   * Au lieu de 400 tokens, on vise 80-120 tokens
   */
  const buildCompactSummary = (moduleSlug: string): string => {
    if (!analysis) return '';

    const moduleAnalysis = analysis.moduleAnalyses.find(m => m.moduleSlug === moduleSlug);
    if (!moduleAnalysis) return '';

    const trendEmoji =
      moduleAnalysis.recentTrend === 'improving' ? '📈' :
      moduleAnalysis.recentTrend === 'declining' ? '📉' : '➡️';

    const summary = [
      `Module: ${moduleAnalysis.moduleName}`,
      `Total erreurs: ${moduleAnalysis.totalErrors} (${moduleAnalysis.distinctFamilies} familles) ${trendEmoji}`,
      '',
      'Points faibles:',
      ...moduleAnalysis.weakestFamilies.map((f, i) =>
        `${i + 1}. ${f.familyName} (${f.errorCount} erreurs)`
      ),
      '',
      'Patterns identifiés:',
      ...moduleAnalysis.patterns.map((p, i) =>
        `${i + 1}. ${p.pattern} (${p.count}x) - Ex: ${p.examples[0]}`
      ),
    ];

    return summary.join('\n');
  };

  /**
   * Résumé global pour le dashboard du coach
   */
  const buildGlobalSummary = (): string => {
    if (!analysis) return '';

    const trendEmoji =
      analysis.overallTrend === 'improving' ? '📈 En progression' :
      analysis.overallTrend === 'declining' ? '📉 En difficulté' : '➡️ Stable';

    return [
      `État général: ${trendEmoji}`,
      `Total erreurs (30j): ${analysis.totalErrors} sur ${analysis.totalModules} modules`,
      `Module le plus problématique: ${analysis.mostProblematicModule}`,
    ].join('\n');
  };

  return {
    analysis,
    isLoading,
    buildCompactSummary,
    buildGlobalSummary,
  };
};
