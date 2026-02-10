/**
 * ============================================
 * MIGRATION 034: Add ui_card_mood to branding
 * - 4 distinct card styles: bubbly, playful, minimal, executive
 * - Replaces the binary playful/clean mood for FlowCards
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  34,
  'add_card_mood',
  async (db: SQLite.SQLiteDatabase) => {
    // Add ui_card_mood column with default 'playful'
    await db.runAsync(
      `ALTER TABLE branding ADD COLUMN ui_card_mood TEXT NOT NULL DEFAULT 'playful'`
    );

    // Set per-audience card mood
    await db.runAsync(`UPDATE branding SET ui_card_mood = 'bubbly' WHERE id = 'primary'`);
    await db.runAsync(`UPDATE branding SET ui_card_mood = 'playful' WHERE id = 'college'`);
    await db.runAsync(`UPDATE branding SET ui_card_mood = 'minimal' WHERE id = 'lycee'`);
    await db.runAsync(`UPDATE branding SET ui_card_mood = 'executive' WHERE id = 'adult'`);

    console.log('[Migration 034] ✓ ui_card_mood added (bubbly/playful/minimal/executive)');
  }
);
