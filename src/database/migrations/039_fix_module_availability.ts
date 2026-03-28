/**
 * ============================================
 * MIGRATION 039: Fix Module Availability
 * Corrections :
 * - connector : disponible lycee niveaux 1-4 + adult niveaux 1-4
 *   (était : lycee niveau 1 uniquement)
 * - Connector content : target_audience 'lycee' → 'all'
 *   (pour que le contenu soit accessible aux adultes aussi)
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  39,
  'fix_module_availability',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. Connector pour lycee niveaux 2, 3, 4 (niveau 1 déjà présent depuis migration 003)
    for (const level of [2, 3, 4]) {
      await db.runAsync(
        `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available)
         VALUES ('connector', 'lycee', ?, 1)`,
        [level]
      );
    }

    // 2. Connector pour adult niveaux 1, 2, 3, 4
    for (const level of [1, 2, 3, 4]) {
      await db.runAsync(
        `INSERT OR IGNORE INTO module_availability (module_slug, identity_id, level_number, is_available)
         VALUES ('connector', 'adult', ?, 1)`,
        [level]
      );
    }

    // 3. Connector content : ouvrir à 'all' pour que les adultes voient le contenu existant
    await db.runAsync(
      `UPDATE content
       SET target_audience = 'all'
       WHERE family_id IN (SELECT id FROM families WHERE module_slug = 'connector')
         AND target_audience = 'lycee'`
    );

    console.log('[Migration 039] ✓ connector (lycee 1-4 + adult 1-4) disponible');
  }
);
