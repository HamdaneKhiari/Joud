/**
 * ============================================
 * MIGRATION 023: Fix activity_log.family_id
 * Change family_id de INTEGER vers TEXT pour supporter les compositeFamilyId ("1-1", "1-2"...)
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  23,
  'fix_activity_log_family_id',
  async (db: SQLite.SQLiteDatabase) => {
    // SQLite ne supporte pas ALTER COLUMN, donc on doit recréer la table

    // 1. Créer une table temporaire avec le nouveau schéma
    await db.execAsync(`
      CREATE TABLE activity_log_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_slug TEXT NOT NULL,
        family_id TEXT NOT NULL,
        level INTEGER NOT NULL,
        family_name TEXT NOT NULL,
        icon TEXT,
        progress REAL DEFAULT 0,
        timestamp INTEGER NOT NULL,
        UNIQUE(module_slug, family_id)
      );
    `);

    // 2. Copier les données existantes (family_id INTEGER → TEXT)
    await db.execAsync(`
      INSERT INTO activity_log_new (id, module_slug, family_id, level, family_name, icon, progress, timestamp)
      SELECT id, module_slug, CAST(family_id AS TEXT), level, family_name, icon, progress, timestamp
      FROM activity_log;
    `);

    // 3. Supprimer l'ancienne table
    await db.execAsync(`DROP TABLE activity_log;`);

    // 4. Renommer la nouvelle table
    await db.execAsync(`ALTER TABLE activity_log_new RENAME TO activity_log;`);

    console.log('[Migration 023] ✓ activity_log.family_id changed to TEXT');
  },

  async (db: SQLite.SQLiteDatabase) => {
    // Rollback: Recréer avec INTEGER (perte possible de données compositeFamilyId)
    await db.execAsync(`
      CREATE TABLE activity_log_rollback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_slug TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        family_name TEXT NOT NULL,
        icon TEXT,
        progress REAL DEFAULT 0,
        timestamp INTEGER NOT NULL,
        UNIQUE(module_slug, family_id)
      );
    `);

    // Copier seulement les family_id qui sont des nombres
    await db.execAsync(`
      INSERT INTO activity_log_rollback (id, module_slug, family_id, level, family_name, icon, progress, timestamp)
      SELECT id, module_slug, CAST(family_id AS INTEGER), level, family_name, icon, progress, timestamp
      FROM activity_log
      WHERE family_id NOT LIKE '%-%';
    `);

    await db.execAsync(`DROP TABLE activity_log;`);
    await db.execAsync(`ALTER TABLE activity_log_rollback RENAME TO activity_log;`);

    console.log('[Migration 023] ✓ Rollback: activity_log.family_id restored to INTEGER');
  }
);
