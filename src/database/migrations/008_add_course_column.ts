/**
 * Migration 008 : ajoute la colonne `course` (paire de langues, ex: 'fr-en') à `content`.
 *
 * Fondation pour un futur modèle multi-langue (ex: 'fr-ar') sur le même modèle white-label
 * que l'audience (primary/college/lycee/adult) : `families`/`modules`/`levels` restent
 * neutres vis-à-vis de la langue, seule `content` (le mot/phrase/dialogue lui-même) porte
 * la langue. Aucun contenu non-anglais n'existe à ce jour — cette migration ne fait que
 * poser la colonne avant que davantage de contenu anglais s'accumule sans elle.
 *
 * `ADD COLUMN ... NOT NULL DEFAULT 'fr-en'` fait à la fois l'ajout de colonne et le backfill
 * des lignes existantes en un seul statement (comportement standard SQLite).
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  8,
  'add_course_column',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      ALTER TABLE content ADD COLUMN course TEXT NOT NULL DEFAULT 'fr-en';
    `);

    // eslint-disable-next-line no-console
    console.log('[Migration 008] ✓ Colonne course ajoutée à content (backfill fr-en)');
  }
);
