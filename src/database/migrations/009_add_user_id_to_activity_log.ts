/**
 * Migration 009 : ajoute `user_id` à `activity_log` et re-scope sa contrainte UNIQUE par utilisateur.
 *
 * `activity_log` n'a jamais eu de colonne user_id : le calcul des jours actifs (dashboard) et la
 * "dernière activité" lisaient l'historique de TOUT profil ayant utilisé cet appareil, pas
 * seulement l'utilisateur courant. Pire, la contrainte UNIQUE(module_slug, family_id,
 * subfamily_id) combinée à INSERT OR REPLACE faisait qu'un profil écrasait la ligne d'un autre
 * profil ayant joué la même famille — pas juste une lecture mélangée, une perte de donnée.
 *
 * SQLite ne permet pas de modifier une contrainte UNIQUE via ALTER TABLE : on recrée la table
 * avec la bonne contrainte. Les lignes existantes (déjà mélangées entre profils, non
 * attribuables avec certitude) sont backfillées avec user_id = '' plutôt que supprimées —
 * cohérent avec le DEFAULT '' déjà utilisé pour ce cas ailleurs dans le schéma.
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  9,
  'add_user_id_to_activity_log',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE activity_log_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL DEFAULT '',
        module_slug TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        subfamily_id INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL,
        family_name TEXT NOT NULL,
        icon TEXT,
        progress REAL DEFAULT 0,
        timestamp INTEGER NOT NULL,
        UNIQUE(user_id, module_slug, family_id, subfamily_id)
      );

      INSERT INTO activity_log_new (
        id, user_id, module_slug, family_id, subfamily_id, level, family_name, icon, progress, timestamp
      )
      SELECT id, '', module_slug, family_id, subfamily_id, level, family_name, icon, progress, timestamp
      FROM activity_log;

      DROP TABLE activity_log;
      ALTER TABLE activity_log_new RENAME TO activity_log;
    `);

    // eslint-disable-next-line no-console
    console.log('[Migration 009] ✓ user_id ajouté à activity_log (contrainte UNIQUE re-scopée par utilisateur)');
  }
);
