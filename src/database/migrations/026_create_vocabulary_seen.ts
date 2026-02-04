/**
 * ============================================
 * MIGRATION 026: Create vocabulary_seen table
 * Log des mots vus dans les exercices vocab
 * Utilisé par le Coach IA (mode guidé) pour suggérer
 * une pratique conversationnelle sur les mots récents
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  26,
  'create_vocabulary_seen',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS vocabulary_seen (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        translation TEXT NOT NULL,
        family_id TEXT NOT NULL,
        seen_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_vocabulary_seen_date
        ON vocabulary_seen(seen_at DESC);
    `);

    console.log('[Migration 026] ✓ vocabulary_seen table created');
  },

  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`DROP TABLE IF EXISTS vocabulary_seen;`);
    console.log('[Migration 026] ✓ Rollback: vocabulary_seen dropped');
  }
);
