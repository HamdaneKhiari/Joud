/**
 * ============================================
 * MIGRATION 025: Create chat_conversations + chat_messages
 * Historique des conversations du Tuteur IA (max 3)
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  25,
  'create_chat_conversations',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mode TEXT NOT NULL CHECK(mode IN ('free', 'guided')),
        title TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'ai', 'error')),
        content TEXT NOT NULL,
        source TEXT,
        provider TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_chat_messages_conv
        ON chat_messages(conversation_id, created_at);

      CREATE INDEX IF NOT EXISTS idx_chat_conversations_mode
        ON chat_conversations(mode, updated_at DESC);
    `);

    console.log('[Migration 025] ✓ chat_conversations + chat_messages tables created');
  },

  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      DROP TABLE IF EXISTS chat_messages;
      DROP TABLE IF EXISTS chat_conversations;
    `);
    console.log('[Migration 025] ✓ Rollback: chat tables dropped');
  }
);
