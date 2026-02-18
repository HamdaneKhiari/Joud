/**
 * ============================================
 * MIGRATION 027: Create ai_settings table
 * Stockage des configurations IA (SANS clé API)
 *
 * SÉCURITÉ :
 * - La clé API est stockée dans expo-secure-store (chiffrée)
 * - Seuls les paramètres non-sensibles sont dans SQLite
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  27,
  'create_ai_settings',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ai_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        provider TEXT NOT NULL DEFAULT 'openai',
        model TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
        max_tokens INTEGER NOT NULL DEFAULT 500,
        temperature REAL NOT NULL DEFAULT 0.7,
        max_messages_per_day INTEGER NOT NULL DEFAULT 50,
        current_usage_count INTEGER NOT NULL DEFAULT 0,
        last_reset_date INTEGER NOT NULL DEFAULT 0,
        is_configured INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    await db.runAsync(
      `INSERT OR IGNORE INTO ai_settings (
        id, provider, model, max_tokens, temperature,
        max_messages_per_day, is_configured, created_at, updated_at
      ) VALUES (1, 'openai', 'gpt-3.5-turbo', 500, 0.7, 50, 0, ?, ?)`,
      [Date.now(), Date.now()]
    );

    console.log('[Migration 027] ✅ ai_settings table created (API key stored in SecureStore)');
  },

  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`DROP TABLE IF EXISTS ai_settings;`);
    console.log('[Migration 027] ✓ Rollback: ai_settings dropped');
  }
);
