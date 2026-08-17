/**
 * Migration 011 : ajoute les messages de feedback manquants pour `wordgames` / `incorrect_attempt_2`
 * pour toutes les identités (`primary`, `college`, `lycee`, `adult`).
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  11,
  'add_missing_wordgame_feedbacks',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      INSERT OR REPLACE INTO feedback_messages (identity_id, context, state, icon, title, message) VALUES
      ('primary', 'wordgames', 'incorrect_attempt_2', '🎯', 'Dernier essai !', 'Concentre-toi bien !'),
      ('college', 'wordgames', 'incorrect_attempt_2', '!', 'Dernier essai',  'Concentre-toi bien et réessaie.'),
      ('lycee',   'wordgames', 'incorrect_attempt_2', '!', 'Dernier essai',  'Concentre-toi bien.'),
      ('adult',   'wordgames', 'incorrect_attempt_2', '!', 'Dernier essai',  'Prenez le temps de bien vérifier.');
    `);

    // eslint-disable-next-line no-console
    console.log('[Migration 011] ✓ Messages wordgames/incorrect_attempt_2 ajoutés pour toutes les identités');
  }
);
