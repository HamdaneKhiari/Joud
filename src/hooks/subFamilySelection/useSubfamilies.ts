import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/themes/ThemeContext';

export interface SubFamilyItem {
  id: number; // Le level_number
  title: string;
  icon: string;
  description: string;
  contentCount: number;
}

const useSubfamilies = (familyId: number) => {
  const { db } = useUser();
  const { identity } = useTheme();
  const [subfamilies, setSubfamilies] = useState<SubFamilyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    // ✅ PROTECTION CRITIQUE : Si identity.id est null, SQLite Android crashe (NullPointer)
    // On attend que le contexte soit prêt avant de lancer la requête.
    if (!db || !familyId || !identity?.id) {
      console.log('[useSubfamilies] En attente des paramètres...', { familyId, identityId: identity?.id });
      return;
    }

    try {
      setIsLoading(true);

      // 1. Source de vérité : La table CONTENT
      // On récupère tous les niveaux qui possèdent du contenu pour cette famille
      const contentLevels = await db.getAllAsync<{ level: number; count: number }>(
        `SELECT level, COUNT(*) as count 
         FROM content 
         WHERE family_id = ? 
         GROUP BY level 
         ORDER BY level ASC`,
        [familyId]
      );

      // 2. Décoration : La table LEVEL_LABELS
      // On cherche le label correspondant à l'identité (Lycée/Adult)
      const items = await Promise.all(
        contentLevels.map(async (row) => {
          // ✅ LOGIQUE DE FALLBACK : 
          // On cherche le label pour l'identité actuelle (ex: lycee)
          // OU pour 'adult' par défaut. On trie pour avoir l'identité actuelle en premier.
          const label = await db.getFirstAsync<{ display_title: string; icon_name: string; display_description: string }>(
            `SELECT display_title, icon_name, display_description 
             FROM level_labels 
             WHERE family_id = ? AND level_number = ? 
             AND (identity_id = ? OR identity_id = 'adult')
             ORDER BY CASE WHEN identity_id = ? THEN 0 ELSE 1 END
             LIMIT 1`,
            [familyId, row.level, identity.id, identity.id]
          );

          return {
            id: row.level,
            title: label?.display_title || `Partie ${row.level}`, 
            icon: label?.icon_name || 'layers',
            description: label?.display_description || `${row.count} exercices`,
            contentCount: row.count,
          };
        })
      );

      setSubfamilies(items);
    } catch (error) {
      console.error('[useSubfamilies] Erreur SQL fatale:', error);
    } finally {
      setIsLoading(false);
    }
  }, [db, familyId, identity?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return { subfamilies, isLoading };
};

export default useSubfamilies;