/**
 * ============================================
 * MIGRATION 024: Create exercise_errors table
 * Log des erreurs par exercice pour le Coach IA
 * Utilisé par : Grammar, Phrases (college+), Reading
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  24,
  'create_exercise_errors',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercise_errors (
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

      CREATE INDEX IF NOT EXISTS idx_exercise_errors_module
        ON exercise_errors(module_slug, timestamp DESC);

      CREATE INDEX IF NOT EXISTS idx_exercise_errors_family
        ON exercise_errors(family_id, timestamp DESC);
    `);

    console.log('[Migration 024] ✓ exercise_errors table created');
  },

  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`DROP TABLE IF EXISTS exercise_errors;`);
    console.log('[Migration 024] ✓ Rollback: exercise_errors dropped');
  }
);
