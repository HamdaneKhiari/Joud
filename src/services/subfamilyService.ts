// src/services/subfamilyService.ts
import * as SQLite from 'expo-sqlite';

export interface SubFamily {
  subfamily_id: number;
  title: string;
  icon: string;
  description: string;
}

export const getSubFamiliesByFamily = async (
  db: SQLite.SQLiteDatabase, 
  familyId: number, 
  identityId: string
): Promise<SubFamily[]> => {
  
  // Requête propre qui récupère les labels de sous-familles
  // ✅ FIX: GROUP BY pour éviter les doublons si identity_id = 'lycee' ET 'adult' existent
  const query = `
    SELECT
      level_number as subfamily_id,
      display_title as title,
      icon_name as icon,
      display_description as description
    FROM level_labels
    WHERE family_id = ? AND (identity_id = ? OR identity_id = 'adult')
    GROUP BY level_number
    ORDER BY level_number ASC
  `;

  return await db.getAllAsync<SubFamily>(query, [familyId, identityId]);
};