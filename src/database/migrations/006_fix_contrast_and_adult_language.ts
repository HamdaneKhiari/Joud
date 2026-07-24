/**
 * Migration 006 : corrige 2 failles repérées lors de la revue de design :
 * - Contraste insuffisant de header_accent_color (icônes/sous-titre de header)
 *   pour primary (#FFCE00 sur #FF5722, 2.1:1) et lycee (#FF6B35 sur #5C35E8, 2.4:1)
 *   → passés en blanc (contraste ≥ 3:1). accent_color (palette) n'est pas touché,
 *   seul header_accent_color change.
 * - Feedback "adult" mélangeait français et anglais sans logique → tout repassé en français.
 *
 * Nécessaire en plus de la mise à jour de migration 002 : les appareils ayant déjà
 * exécuté la migration 002 avec les anciennes valeurs ne la rejouent pas.
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  6,
  'fix_contrast_and_adult_language',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      UPDATE branding SET header_accent_color = '#FFFFFF' WHERE id = 'primary';
      UPDATE branding SET header_accent_color = '#FFFFFF' WHERE id = 'lycee';
    `);

    await db.execAsync(`
      INSERT OR REPLACE INTO feedback_messages (identity_id, context, state, icon, title, message) VALUES
      ('adult', 'exercise',   'correct',            '✓', 'Correct',            'Exact, bien joué.'),
      ('adult', 'wordgames',  'correct',            '✓', 'Exact',              'Bonne réponse.'),
      ('adult', 'vocabulary', 'correct',            '✓', 'Parfait',            'Bien joué.'),
      ('adult', 'exercise',   'incorrect_attempt_1','×', 'Incorrect',          'Réessaie.'),
      ('adult', 'wordgames',  'incorrect_attempt_1','×', 'Faux',               'Prends le temps de réfléchir.'),
      ('adult', 'exercise',   'incorrect_attempt_2','!', 'Dernière tentative', 'Concentre-toi.'),
      ('adult', 'exercise',   'skip',               'ℹ', 'Réponse',            'Voici la réponse correcte.'),
      ('adult', 'wordgames',  'skip',               'ℹ', 'Solution',           'À revoir pour la prochaine fois.');
    `);

    // eslint-disable-next-line no-console
    console.log('[Migration 006] ✓ Contraste header corrigé (primary, lycee) + feedback adult en français');
  }
);
