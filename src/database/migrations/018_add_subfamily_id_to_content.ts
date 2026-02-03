import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

/**
 * ============================================
 * MIGRATION 018: Séparer level et subfamily_id
 * ============================================
 *
 * PROBLÈME RÉSOLU :
 * On utilisait la colonne "level" pour 2 choses différentes :
 * 1. Le "vrai level" (Primary = 1, Collège = 2, etc.)
 * 2. Les sous-familles (Le Salé = 1, Le Sucré = 2)
 *
 * SOLUTION :
 * - Ajouter une colonne `subfamily_id` (INTEGER NULL)
 * - Copier les valeurs de `level` dans `subfamily_id`
 * - Remettre `level` à 1 (par défaut = Primary)
 */

export default createMigration(
  18,
  'add_subfamily_id_to_content',
  async (db: SQLite.SQLiteDatabase) => {
    console.log('[Migration 018] 🔧 Séparation level / subfamily_id...');

    // 1. Ajouter la colonne subfamily_id (nullable car pas toutes les familles ont des sous-familles)
    await db.execAsync(`
      ALTER TABLE content
      ADD COLUMN subfamily_id INTEGER DEFAULT NULL;
    `);

    // 2. Copier les valeurs de "level" dans "subfamily_id" UNIQUEMENT pour food_drinks
    //    (Les autres familles utilisent "level" pour les vrais niveaux de difficulté)
    await db.execAsync(`
      UPDATE content
      SET subfamily_id = level
      WHERE family_id = (SELECT id FROM families WHERE slug = 'food_drinks');
    `);

    // 3. Remettre "level" à 1 UNIQUEMENT pour food_drinks (Primary par défaut)
    //    Les autres familles gardent leur niveau de difficulté actuel
    await db.execAsync(`
      UPDATE content
      SET level = 1
      WHERE family_id = (SELECT id FROM families WHERE slug = 'food_drinks');
    `);

    console.log('[Migration 018] ✅ Colonne subfamily_id créée avec succès');
  },
  async (db: SQLite.SQLiteDatabase) => {
    // Rollback : supprimer la colonne (SQLite ne supporte pas DROP COLUMN avant 3.35)
    console.log('[Migration 018] ◀ Rollback: recréation de la table content...');

    // Sauvegarder les données
    await db.execAsync(`
      CREATE TEMPORARY TABLE content_backup AS
      SELECT id, family_id, level, content_type, data, difficulty, tags, target_audience
      FROM content;
    `);

    // Supprimer et recréer la table
    await db.execAsync(`DROP TABLE content;`);
    await db.execAsync(`
      CREATE TABLE content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        content_type TEXT NOT NULL,
        data TEXT NOT NULL,
        difficulty TEXT,
        tags TEXT,
        target_audience TEXT DEFAULT 'all',
        FOREIGN KEY (family_id) REFERENCES families(id)
      );
    `);

    // Restaurer les données (sans subfamily_id)
    await db.execAsync(`
      INSERT INTO content (id, family_id, level, content_type, data, difficulty, tags, target_audience)
      SELECT id, family_id, level, content_type, data, difficulty, tags, target_audience
      FROM content_backup;
    `);

    await db.execAsync(`DROP TABLE content_backup;`);
  }
);
