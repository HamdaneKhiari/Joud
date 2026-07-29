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
  levelId: number,
  userId?: string
): Promise<SubFamily[]> => {

  // La jointure sur `progress` doit filtrer par `level` (niveau de dashboard) en plus de
  // family_id/subfamily_id : une sous-famille peut avoir du contenu réparti sur plusieurs
  // niveaux (1-4), donc sans ce filtre plusieurs lignes `progress` matchent la même
  // sous-famille et GROUP BY choisit une ligne arbitraire (progression fausse/instable).
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
      ON p.family_id = ? AND p.subfamily_id = ll.level_number AND p.level = ?
      ${userId ? 'AND p.user_id = ?' : ''}
    WHERE ll.family_id = ? AND (ll.identity_id = ? OR ll.identity_id = 'adult')
    GROUP BY ll.level_number
    ORDER BY ll.level_number ASC
  `;

  const params = userId
    ? [familyId, levelId, userId, familyId, identityId]
    : [familyId, levelId, familyId, identityId];

  return await db.getAllAsync<SubFamily>(query, params);
};