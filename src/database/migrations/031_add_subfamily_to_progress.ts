/**
 * ============================================
 * MIGRATION 031: Ajouter subfamily_id à progress et activity_log
 * ============================================
 *
 * La table `progress` n'avait que (user_id, family_id, level).
 * On ajoute `subfamily_id` pour tracker la progression par sous-famille.
 *
 * Convention :
 * - subfamily_id = 0  → module sans sous-familles (word_games, connector, etc.)
 * - subfamily_id > 0  → sous-famille réelle (vocab, grammar, etc.)
 *
 * On ajoute aussi `total` pour stocker le nombre total d'items.
 * On met à jour la contrainte UNIQUE pour inclure subfamily_id.
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  31,
  'add_subfamily_to_progress',
  async (db: SQLite.SQLiteDatabase) => {
    console.log('[Migration 031] 🔧 Ajout subfamily_id à progress et activity_log...');

    // SQLite ne permet pas ALTER TABLE ... ADD CONSTRAINT.
    // On doit recréer la table pour changer le UNIQUE.

    // ──────────── PROGRESS ────────────

    // 1. Sauvegarder les données existantes
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS progress_backup AS
      SELECT * FROM progress;
    `);

    // 2. Supprimer l'ancienne table
    await db.execAsync(`DROP TABLE IF EXISTS progress;`);

    // 3. Recréer avec subfamily_id + total
    await db.execAsync(`
      CREATE TABLE progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        subfamily_id INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        last_accessed TEXT,
        UNIQUE(user_id, family_id, subfamily_id, level),
        FOREIGN KEY (family_id) REFERENCES families(id)
      );
    `);

    // 4. Restaurer les données (subfamily_id = 0 pour l'existant)
    await db.execAsync(`
      INSERT INTO progress (id, user_id, family_id, subfamily_id, level, completed, score, last_accessed)
      SELECT id, user_id, family_id, 0, level, completed, score, last_accessed
      FROM progress_backup;
    `);

    await db.execAsync(`DROP TABLE IF EXISTS progress_backup;`);

    // 5. Index pour les requêtes fréquentes
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_progress_user_family
      ON progress(user_id, family_id, subfamily_id);
    `);

    // ──────────── ACTIVITY_LOG ────────────

    // Ajouter subfamily_id à activity_log (simple ALTER suffit ici)
    // On vérifie d'abord si la colonne existe déjà
    try {
      await db.execAsync(`
        ALTER TABLE activity_log
        ADD COLUMN subfamily_id INTEGER NOT NULL DEFAULT 0;
      `);
    } catch (e) {
      // Colonne existe déjà
      console.log('[Migration 031] activity_log.subfamily_id already exists, skipping');
    }

    // Mettre à jour la contrainte UNIQUE de activity_log
    // (module_slug, family_id) → (module_slug, family_id, subfamily_id)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS activity_log_backup AS
      SELECT * FROM activity_log;
    `);

    await db.execAsync(`DROP TABLE IF EXISTS activity_log;`);

    await db.execAsync(`
      CREATE TABLE activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_slug TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        subfamily_id INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL,
        family_name TEXT NOT NULL,
        icon TEXT,
        progress REAL DEFAULT 0,
        timestamp INTEGER NOT NULL,
        UNIQUE(module_slug, family_id, subfamily_id)
      );
    `);

    // Restaurer avec subfamily_id = 0
    await db.execAsync(`
      INSERT OR IGNORE INTO activity_log (id, module_slug, family_id, subfamily_id, level, family_name, icon, progress, timestamp)
      SELECT id, module_slug, family_id, 0, level, family_name, icon, progress, timestamp
      FROM activity_log_backup;
    `);

    await db.execAsync(`DROP TABLE IF EXISTS activity_log_backup;`);

    console.log('[Migration 031] ✅ subfamily_id ajouté à progress et activity_log');
  },
  async (db: SQLite.SQLiteDatabase) => {
    // Rollback : recréer sans subfamily_id
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS progress_backup AS SELECT * FROM progress;
      DROP TABLE progress;
      CREATE TABLE progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        last_accessed TEXT,
        UNIQUE(user_id, family_id, level),
        FOREIGN KEY (family_id) REFERENCES families(id)
      );
      INSERT INTO progress (id, user_id, family_id, level, completed, score, last_accessed)
      SELECT id, user_id, family_id, level, completed, score, last_accessed FROM progress_backup;
      DROP TABLE progress_backup;
    `);
    console.log('[Migration 031] ◀ Rollback completed');
  }
);
