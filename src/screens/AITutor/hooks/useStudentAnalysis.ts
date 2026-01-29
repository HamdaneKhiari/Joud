/**
 * ============================================
 * USE STUDENT ANALYSIS (SQL-based)
 * Hook pour analyser la progression de l'étudiant via requêtes SQL
 * ============================================
 */

import { useState, useEffect } from 'react';
import { getDatabase } from '@/database/db';

// ============================================
// TYPES
// ============================================

export interface WeakArea {
  theme: string;
  moduleName: string;
  familyName: string;
  errorCount: number;
  totalAttempts: number;
  errorRate: number;
}

export interface StrengthArea {
  theme: string;
  moduleName: string;
  familyName: string;
  successCount: number;
  totalAttempts: number;
  successRate: number;
}

export interface ProgressStats {
  totalCompleted: number;
  totalModules: number;
  averageScore: number;
  currentLevel: number;
}

export interface StudentAnalysisData {
  weakAreas: WeakArea[];
  strengthAreas: StrengthArea[];
  progressStats: ProgressStats;
  recentActivity: {
    moduleName: string;
    familyName: string;
    progress: number;
    timestamp: number;
  }[];
}

// ============================================
// HOOK
// ============================================

/**
 * Hook pour analyser la progression de l'étudiant
 * Utilise des requêtes SQL pour identifier:
 * - Les zones faibles (erreurs récurrentes)
 * - Les points forts (succès répétés)
 * - Les statistiques globales
 */
export const useStudentAnalysis = (userId: string = 'default_user', level: number = 1) => {
  const [analysis, setAnalysis] = useState<StudentAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const db = await getDatabase();

        // =================== 1. WEAK AREAS (Requête SQL) ===================
        // Identifier les familles où l'élève a échoué plusieurs fois
        // Note: Cette requête est conceptuelle - il faudrait une table d'historique des tentatives
        // Pour l'instant, on utilise la table progress comme proxy
        const weakAreasData = await db.getAllAsync<{
          family_name: string;
          module_slug: string;
          score: number;
          completed: number;
        }>(
          `SELECT
             f.name as family_name,
             f.module_slug,
             p.score,
             p.completed
           FROM progress p
           JOIN families f ON f.id = p.family_id
           WHERE p.user_id = ?
             AND p.level = ?
             AND p.score < 70
           ORDER BY p.score ASC
           LIMIT 5`,
          [userId, level]
        );

        const weakAreas: WeakArea[] = weakAreasData.map((item) => ({
          theme: item.module_slug,
          moduleName: item.module_slug,
          familyName: item.family_name,
          errorCount: 100 - item.score,
          totalAttempts: item.completed,
          errorRate: (100 - item.score) / 100,
        }));

        // =================== 2. STRENGTH AREAS (Requête SQL) ===================
        const strengthAreasData = await db.getAllAsync<{
          family_name: string;
          module_slug: string;
          score: number;
          completed: number;
        }>(
          `SELECT
             f.name as family_name,
             f.module_slug,
             p.score,
             p.completed
           FROM progress p
           JOIN families f ON f.id = p.family_id
           WHERE p.user_id = ?
             AND p.level = ?
             AND p.score >= 80
           ORDER BY p.score DESC
           LIMIT 5`,
          [userId, level]
        );

        const strengthAreas: StrengthArea[] = strengthAreasData.map((item) => ({
          theme: item.module_slug,
          moduleName: item.module_slug,
          familyName: item.family_name,
          successCount: item.score,
          totalAttempts: item.completed,
          successRate: item.score / 100,
        }));

        // =================== 3. PROGRESS STATS (Requête SQL) ===================
        const stats = await db.getFirstAsync<{
          total_completed: number;
          avg_score: number;
        }>(
          `SELECT
             COUNT(*) as total_completed,
             AVG(score) as avg_score
           FROM progress
           WHERE user_id = ? AND level = ?`,
          [userId, level]
        );

        const totalModulesResult = await db.getFirstAsync<{ total: number }>(
          `SELECT COUNT(DISTINCT f.id) as total
           FROM families f
           JOIN modules m ON m.slug = f.module_slug
           WHERE m.is_core = 1`
        );

        const progressStats: ProgressStats = {
          totalCompleted: stats?.total_completed || 0,
          totalModules: totalModulesResult?.total || 0,
          averageScore: Math.round(stats?.avg_score || 0),
          currentLevel: level,
        };

        // =================== 4. RECENT ACTIVITY (Requête SQL) ===================
        const recentActivity = await db.getAllAsync<{
          module_slug: string;
          family_name: string;
          progress: number;
          timestamp: number;
        }>(
          `SELECT
             a.module_slug,
             a.family_name,
             a.progress,
             a.timestamp
           FROM activity_log a
           ORDER BY a.timestamp DESC
           LIMIT 10`
        );

        // =================== 5. ASSEMBLY ===================
        setAnalysis({
          weakAreas,
          strengthAreas,
          progressStats,
          recentActivity: recentActivity.map((item) => ({
            moduleName: item.module_slug,
            familyName: item.family_name,
            progress: item.progress,
            timestamp: item.timestamp,
          })),
        });
      } catch (err) {
        console.error('[useStudentAnalysis] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    analyzeProgress();
  }, [userId, level]);

  return {
    analysis,
    isLoading,
    error,
    hasWeakAreas: (analysis?.weakAreas.length || 0) > 0,
    hasStrengthAreas: (analysis?.strengthAreas.length || 0) > 0,
  };
};
