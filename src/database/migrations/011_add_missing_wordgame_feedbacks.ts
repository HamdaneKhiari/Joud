/**
 * Migration 011 : ajoute les messages de feedback manquants pour `wordgames` / `incorrect_attempt_2`
 * et met à jour les messages de `skip` (échec) avec des formulations adaptées à chaque identité.
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  11,
  'add_missing_wordgame_feedbacks',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      INSERT OR REPLACE INTO feedback_messages (identity_id, context, state, icon, title, message) VALUES
      -- INCORRECT ATTEMPT 2
      ('primary', 'wordgames', 'incorrect_attempt_2', '🎯', 'Dernier essai !', 'Concentre-toi bien !'),
      ('college', 'wordgames', 'incorrect_attempt_2', '!', 'Dernier essai',  'Concentre-toi bien et réessaie.'),
      ('lycee',   'wordgames', 'incorrect_attempt_2', '!', 'Dernier essai',  'Concentre-toi bien.'),
      ('adult',   'wordgames', 'incorrect_attempt_2', '!', 'Dernier essai',  'Prenez le temps de bien vérifier.'),

      -- SKIP (FORMULATIONS PÉDAGOGIQUES)
      ('primary', 'wordgames', 'skip', '💡', 'La réponse', 'Ne t''inquiète pas, c''est en se trompant qu''on apprend !'),
      ('college', 'wordgames', 'skip', 'ℹ',  'Solution',   'C''est en faisant des erreurs qu''on progresse.'),
      ('lycee',   'wordgames', 'skip', 'ℹ',  'Solution',   'C''est en faisant des erreurs qu''on progresse.'),
      ('adult',   'wordgames', 'skip', 'ℹ',  'Solution',   'Ne vous inquiétez pas, l''erreur fait partie de l''apprentissage.');
    `);

    // eslint-disable-next-line no-console
    console.log('[Migration 011] ✓ Messages wordgames (incorrect_attempt_2 & skip) mis à jour pour toutes les identités');
  }
);
