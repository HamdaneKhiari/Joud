// src/services/subfamilyService.ts
import * as SQLite from 'expo-sqlite';

export interface SubFamily {
  subfamily_id: number;
  title: string;
  icon: string;
  description: string;
  progress: number | null;
}

export const getSubFamiliesByFamily = async (
  db: SQLite.SQLiteDatabase,
  familyId: number,
  identityId: string,
  userId?: string
): Promise<SubFamily[]> => {

  const query = `
    SELECT
      ll.level_number as subfamily_id,
      ll.display_title as title,
      ll.icon_name as icon,
      ll.display_description as description,
      CASE WHEN p.total > 0
        THEN ROUND((p.completed * 100.0) / p.total)
        ELSE NULL
      END as progress
    FROM level_labels ll
    LEFT JOIN progress p
      ON p.family_id = ? AND p.subfamily_id = ll.level_number
      ${userId ? 'AND p.user_id = ?' : ''}
    WHERE ll.family_id = ? AND (ll.identity_id = ? OR ll.identity_id = 'adult')
    GROUP BY ll.level_number
    ORDER BY ll.level_number ASC
  `;

  const params = userId
    ? [familyId, userId, familyId, identityId]
    : [familyId, familyId, identityId];

  return await db.getAllAsync<SubFamily>(query, params);
};