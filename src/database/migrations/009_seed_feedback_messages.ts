/**
 * ============================================
 * MIGRATION 008: Feedback Messages White Label
 * Ajoute une table pour les messages de feedback personnalisés
 * selon l'identité (primary, college, lycee, adult)
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  9,
  'seed_feedback_messages',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      -- ============================================
      -- TABLE: feedback_messages
      -- ============================================
      CREATE TABLE IF NOT EXISTS feedback_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identity_id TEXT NOT NULL,
        context TEXT NOT NULL,
        state TEXT NOT NULL,
        icon TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        UNIQUE(identity_id, context, state)
      );

      -- ============================================
      -- SEED: Messages de feedback pour PRIMARY
      -- ============================================
      INSERT OR REPLACE INTO feedback_messages (identity_id, context, state, icon, title, message) VALUES
      -- Correct
      ('primary', 'exercise', 'correct', '🌟', 'Bravo !', 'Tu as trouvé la bonne réponse !'),
      ('primary', 'wordgames', 'correct', '⭐', 'Super !', 'Bonne réponse, continue comme ça !'),
      ('primary', 'vocabulary', 'correct', '✨', 'Excellent !', 'Tu connais bien ce mot !'),

      -- Incorrect (première tentative)
      ('primary', 'exercise', 'incorrect_attempt_1', '💪', 'Pas encore...', 'Essaie encore, tu peux le faire !'),
      ('primary', 'wordgames', 'incorrect_attempt_1', '🤔', 'Oups !', 'Réfléchis bien et réessaie !'),

      -- Incorrect (dernière tentative)
      ('primary', 'exercise', 'incorrect_attempt_2', '🎯', 'Dernière chance !', 'Prends ton temps pour répondre.'),

      -- Skip
      ('primary', 'exercise', 'skip', '📖', 'Réponse', 'Voici la bonne réponse pour t''aider.'),
      ('primary', 'wordgames', 'skip', '💡', 'La réponse', 'Ne t''inquiète pas, tu feras mieux la prochaine fois !'),

      -- ============================================
      -- SEED: Messages de feedback pour COLLEGE
      -- ============================================
      ('college', 'exercise', 'correct', '✓', 'Correct !', 'Bonne réponse, bien joué !'),
      ('college', 'wordgames', 'correct', '✓', 'Exact !', 'Tu maîtrises bien, continue !'),
      ('college', 'vocabulary', 'correct', '✓', 'Parfait !', 'Excellente réponse !'),

      ('college', 'exercise', 'incorrect_attempt_1', '→', 'Pas tout à fait', 'Essaie à nouveau, tu y es presque.'),
      ('college', 'wordgames', 'incorrect_attempt_1', '?', 'Incorrect', 'Réfléchis bien et réessaie.'),

      ('college', 'exercise', 'incorrect_attempt_2', '!', 'Dernière tentative', 'Concentre-toi bien.'),

      ('college', 'exercise', 'skip', 'ℹ', 'Réponse', 'Voici la bonne réponse.'),
      ('college', 'wordgames', 'skip', 'ℹ', 'Solution', 'Pas de problème, tu progresseras !'),

      -- ============================================
      -- SEED: Messages de feedback pour LYCEE
      -- ============================================
      ('lycee', 'exercise', 'correct', '✓', 'Correct', 'Réponse exacte, bon travail.'),
      ('lycee', 'wordgames', 'correct', '✓', 'Juste', 'Bonne maîtrise du concept.'),
      ('lycee', 'vocabulary', 'correct', '✓', 'Excellent', 'Vocabulaire bien assimilé.'),

      ('lycee', 'exercise', 'incorrect_attempt_1', '×', 'Incorrect', 'Revois ta réponse.'),
      ('lycee', 'wordgames', 'incorrect_attempt_1', '×', 'Faux', 'Réessaie avec attention.'),

      ('lycee', 'exercise', 'incorrect_attempt_2', '!', 'Dernière chance', 'Analyse bien la question.'),

      ('lycee', 'exercise', 'skip', 'ℹ', 'Réponse correcte', 'Étudie cette solution.'),
      ('lycee', 'wordgames', 'skip', 'ℹ', 'Solution', 'Retiens bien pour la prochaine fois.'),

      -- ============================================
      -- SEED: Messages de feedback pour ADULT
      -- ============================================
      ('adult', 'exercise', 'correct', '✓', 'Correct', 'Exact, bien joué.'),
      ('adult', 'wordgames', 'correct', '✓', 'Right', 'Good answer.'),
      ('adult', 'vocabulary', 'correct', '✓', 'Perfect', 'Well done.'),

      ('adult', 'exercise', 'incorrect_attempt_1', '×', 'Incorrect', 'Try again.'),
      ('adult', 'wordgames', 'incorrect_attempt_1', '×', 'Wrong', 'Think it over.'),

      ('adult', 'exercise', 'incorrect_attempt_2', '!', 'Last attempt', 'Focus carefully.'),

      ('adult', 'exercise', 'skip', 'ℹ', 'Answer', 'Here''s the correct answer.'),
      ('adult', 'wordgames', 'skip', 'ℹ', 'Solution', 'Review this for next time.');
    `);

    console.log('✅ Migration 008: Feedback messages créés');
  }
);
