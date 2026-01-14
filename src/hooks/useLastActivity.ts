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
    if (!db) return;

    try {
      const timestamp = Date.now();
      
      await db.runAsync(`
        INSERT OR REPLACE INTO activity_log (
          module_slug, family_id, level, family_name, icon, progress, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        activity.moduleSlug,
        activity.familyId,
        activity.level,
        activity.familyName,
        activity.icon,
        activity.progress,
        timestamp
      ]);
      
      // On log en dev uniquement pour vérifier que ça passe
      // console.log('✅ Activité sauvegardée:', activity.familyName);
    } catch (error) {
      console.error('❌ Erreur recordActivity:', error);
    }
  }, [db]);

  /**
   * Récupère la dernière activité pour le Dashboard.
   */
  const fetchLastActivity = useCallback(async () => {
    if (!db) return;

    try {
      setIsLoading(true);
      const result = await db.getFirstAsync<ActivityData>(`
        SELECT 
          module_slug as moduleSlug, 
          family_id as familyId, 
          level, 
          family_name as familyName, 
          icon, 
          progress 
        FROM activity_log 
        ORDER BY timestamp DESC 
        LIMIT 1
      `);
      
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