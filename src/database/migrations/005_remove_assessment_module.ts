/**
 * Migration 005 : supprime toutes les traces du module assessment
 * (données résiduelles des anciennes migrations) et la famille
 * assessment_pool.
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  5,
  'remove_assessment_module',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      DELETE FROM content
      WHERE family_id IN (SELECT id FROM families WHERE module_slug = 'assessment');

      DELETE FROM progress
      WHERE family_id IN (SELECT id FROM families WHERE module_slug = 'assessment');

      DELETE FROM exercise_errors WHERE module_slug = 'assessment';
      DELETE FROM activity_log WHERE module_slug = 'assessment';

      DELETE FROM level_labels
      WHERE family_id IN (SELECT id FROM families WHERE module_slug = 'assessment');

      DELETE FROM families WHERE module_slug = 'assessment';
      DELETE FROM module_availability WHERE module_slug = 'assessment';
      DELETE FROM module_labels WHERE module_slug = 'assessment';
      DELETE FROM modules WHERE slug = 'assessment';
    `);

    // eslint-disable-next-line no-console
    console.log('[Migration 005] ✓ Module assessment + famille assessment_pool supprimés de la base');
  }
);
