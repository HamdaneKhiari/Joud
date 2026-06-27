/**
 * ============================================
 * MIGRATION V2 - 004: Remove Grammar Module
 * Supprime toutes les traces du module grammar
 * (données résiduelles des anciennes migrations)
 * + Suppression de la famille grammar_detective (word_games)
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from '../migrations/runner';

export default createMigration(
  4,
  'remove_grammar_module',
  async (db: SQLite.SQLiteDatabase) => {
    // Suppression du module grammar
    await db.execAsync(`
      DELETE FROM content
      WHERE family_id IN (SELECT id FROM families WHERE module_slug = 'grammar');

      DELETE FROM progress
      WHERE family_id IN (SELECT id FROM families WHERE module_slug = 'grammar');

      DELETE FROM exercise_errors WHERE module_slug = 'grammar';
      DELETE FROM activity_log WHERE module_slug = 'grammar';

      DELETE FROM level_labels
      WHERE family_id IN (SELECT id FROM families WHERE module_slug = 'grammar');

      DELETE FROM families WHERE module_slug = 'grammar';
      DELETE FROM module_availability WHERE module_slug = 'grammar';
      DELETE FROM module_labels WHERE module_slug = 'grammar';
      DELETE FROM modules WHERE slug = 'grammar';
    `);

    // Suppression de la famille grammar_detective (word_games — famille vide)
    await db.execAsync(`
      DELETE FROM content
      WHERE family_id IN (SELECT id FROM families WHERE slug = 'grammar_detective');

      DELETE FROM progress
      WHERE family_id IN (SELECT id FROM families WHERE slug = 'grammar_detective');

      DELETE FROM families WHERE slug = 'grammar_detective';
    `);

    // eslint-disable-next-line no-console
    console.log('[Migration V2-004] ✓ Module grammar + famille grammar_detective supprimés de la base');
  }
);