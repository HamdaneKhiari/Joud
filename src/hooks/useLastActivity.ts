// Enregistrement + récupération de la dernière activité, partagé entre le Dashboard (lecture) et les exercices (écriture)

import { log } from '@/utils/logUtils';
import { useState, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { parseCompositeKey } from '../contexts/progressUtils';

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

  const recordActivity = useCallback(async (activity: ActivityData) => {
    if (!db || typeof db === 'number') return;

    try {
      const timestamp = Date.now();
      const { familyId: familyIdNum, subfamilyId: subfamilyIdNum } = parseCompositeKey(String(activity.familyId));

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
      log.error('[useLastActivity] recordActivity error:', error);
    }
  }, [db]);

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
      log.error('❌ Erreur fetchLastActivity:', error);
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