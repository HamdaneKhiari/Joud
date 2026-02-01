/**
 * ============================================
 * MIGRATION 010: Add target_audience to content
 * ⚠️ OBSOLÈTE : La colonne target_audience est maintenant
 * créée directement dans la migration 001
 * Cette migration est conservée pour la numérotation
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  11,
  'add_target_audience_to_content',
  async (db: SQLite.SQLiteDatabase) => {
    // Migration obsolète - La colonne et l'index sont créés dans migration 001
    // Cette migration est conservée uniquement pour la numérotation
    console.log('[Migration 010] ✓ Skipped (target_audience already exists from migration 001)');
  },
  // Rollback - Supprimer la colonne (impossible avec SQLite, on recrée la table)
  async (db: SQLite.SQLiteDatabase) => {
    // SQLite ne supporte pas DROP COLUMN, on doit recréer la table
    await db.execAsync(`
      -- Créer table temporaire sans target_audience
      CREATE TABLE content_backup (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        content_type TEXT NOT NULL,
        data TEXT NOT NULL,
        difficulty TEXT,
        tags TEXT,
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      -- Copier les données
      INSERT INTO content_backup (id, family_id, level, content_type, data, difficulty, tags)
      SELECT id, family_id, level, content_type, data, difficulty, tags FROM content;

      -- Supprimer ancienne table
      DROP TABLE content;

      -- Renommer backup
      ALTER TABLE content_backup RENAME TO content;

      -- Recréer les index
      CREATE INDEX IF NOT EXISTS idx_content_family_level ON content(family_id, level);
    `);

    console.log('[Migration 010] ✓ Column target_audience removed from content table');
  }
);
