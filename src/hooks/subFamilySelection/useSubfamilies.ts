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
    if (!db || !familyId) return;

    try {
      setIsLoading(true);

      // 1. Source de vérité : La table CONTENT
      // On ne veut afficher que les niveaux qui ont réellement du contenu
      const contentLevels = await db.getAllAsync<{ level: number; count: number }>(
        `SELECT level, COUNT(*) as count 
         FROM content 
         WHERE family_id = ? 
         GROUP BY level 
         ORDER BY level ASC`,
        [familyId]
      );

      // 2. Décoration : La table LEVEL_LABELS
      // Pour chaque niveau trouvé, on va chercher son "habit" (titre, icône)
      const items = await Promise.all(
        contentLevels.map(async (row) => {
          const label = await db.getFirstAsync<{ display_title: string; icon_name: string; display_description: string }>(
            `SELECT display_title, icon_name, display_description 
             FROM level_labels 
             WHERE family_id = ? AND level_number = ? AND identity_id = ?`,
            [familyId, row.level, identity.id]
          );

          return {
            id: row.level,
            title: label?.display_title || `Partie ${row.level}`, // Fallback
            icon: label?.icon_name || 'layers',
            description: label?.display_description || `${row.count} exercices`,
            contentCount: row.count,
          };
        })
      );

      setSubfamilies(items);
    } catch (error) {
      console.error('[useSubfamilies] Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [db, familyId, identity.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return { subfamilies, isLoading };
};

export default useSubfamilies;