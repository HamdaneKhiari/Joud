/**
 * ============================================
 * HOOK: useLastActivity
 * Gère l'enregistrement et la récupération de la dernière activité.
 * Partagé entre le Dashboard (Lecture) et les Exercices (Écriture).
 * ============================================
 */

import { useState, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';

export interface ActivityData {
  moduleSlug: string;
  familyId: string;
  level: number;
  familyName: string;
  icon: string;
  progress: number;
  timestamp?: number;
}

export const useLastActivity = () => {
  const { db } = useUser();
  const [lastActivity, setLastActivity] = useState<ActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Enregistre une activité (UPSERT).
   * Optimisé pour ne pas bloquer l'UI.
   */
  const recordActivity = useCallback(async (activity: ActivityData) => {
    if (!db || typeof db === 'number') return;

    try {
      const timestamp = Date.now();

      // Décomposer le familyId composite "1-2" en family_id + subfamily_id
      let familyIdNum = 0;
      let subfamilyIdNum = 0;
      const raw = String(activity.familyId);
      if (raw.includes('-')) {
        const [fam, sub] = raw.split('-');
        familyIdNum = Number(fam) || 0;
        subfamilyIdNum = Number(sub) || 0;
      } else {
        familyIdNum = Number(raw) || 0;
      }

      await db.runAsync(`
        INSERT OR REPLACE INTO activity_log (
          module_slug, family_id, subfamily_id, level, family_name, icon, progress, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        activity.moduleSlug,
        familyIdNum,
        subfamilyIdNum,
        activity.level,
        activity.familyName,
        activity.icon,
        activity.progress,
        timestamp
      ]);
    } catch (error) {
      console.error('[useLastActivity] recordActivity error:', error);
    }
  }, [db]);

  /**
   * Récupère la dernière activité pour le Dashboard.
   */
  const fetchLastActivity = useCallback(async () => {
    if (!db || typeof db === 'number') return;

    try {
      setIsLoading(true);
      const row = await db.getFirstAsync<{
        moduleSlug: string;
        familyId: number;
        subfamilyId: number;
        level: number;
        familyName: string;
        icon: string;
        progress: number;
      }>(`
        SELECT
          module_slug as moduleSlug,
          family_id as familyId,
          subfamily_id as subfamilyId,
          level,
          family_name as familyName,
          icon,
          progress
        FROM activity_log
        ORDER BY timestamp DESC
        LIMIT 1
      `);

      // Reconstruire le familyId composite si subfamily existe
      const result = row ? {
        ...row,
        familyId: row.subfamilyId ? `${row.familyId}-${row.subfamilyId}` : String(row.familyId),
      } : null;
      
      setLastActivity(result);
    } catch (error) {
      console.error('❌ Erreur fetchLastActivity:', error);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  return { 
    lastActivity, 
    recordActivity, 
    fetchLastActivity,
    isLoading 
  };
};