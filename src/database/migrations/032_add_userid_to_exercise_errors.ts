/**
 * ============================================
 * MIGRATION 032: Add user_id to exercise_errors
 * Permet le filtrage des erreurs par utilisateur
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  32,
  'add_userid_to_exercise_errors',
  async (db: SQLite.SQLiteDatabase) => {
    // Recréer la table avec user_id (SQLite ne supporte pas ALTER ADD avec DEFAULT sur NOT NULL)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercise_errors_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL DEFAULT '',
        family_id INTEGER NOT NULL,
        module_slug TEXT NOT NULL,
        question TEXT NOT NULL,
        user_answer TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        level INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      INSERT INTO exercise_errors_new (user_id, family_id, module_slug, question, user_answer, correct_answer, level, timestamp)
        SELECT '', family_id, module_slug, question, user_answer, correct_answer, level, timestamp
        FROM exercise_errors;

      DROP TABLE exercise_errors;
      ALTER TABLE exercise_errors_new RENAME TO exercise_errors;

      CREATE INDEX IF NOT EXISTS idx_exercise_errors_user
        ON exercise_errors(user_id, module_slug, timestamp DESC);

      CREATE INDEX IF NOT EXISTS idx_exercise_errors_family
        ON exercise_errors(family_id, timestamp DESC);
    `);

    console.log('[Migration 032] ✓ user_id added to exercise_errors');
  },

  async (db: SQLite.SQLiteDatabase) => {
    // Rollback: recréer sans user_id
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercise_errors_old (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_id INTEGER NOT NULL,
        module_slug TEXT NOT NULL,
        question TEXT NOT NULL,
        user_answer TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        level INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      INSERT INTO exercise_errors_old (family_id, module_slug, question, user_answer, correct_answer, level, timestamp)
        SELECT family_id, module_slug, question, user_answer, correct_answer, level, timestamp
        FROM exercise_errors;

      DROP TABLE exercise_errors;
      ALTER TABLE exercise_errors_old RENAME TO exercise_errors;
    `);

    console.log('[Migration 032] ✓ Rollback: user_id removed from exercise_errors');
  }
);
