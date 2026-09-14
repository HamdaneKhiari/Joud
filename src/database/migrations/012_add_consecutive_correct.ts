/**
 * Migration 012 : ajoute `consecutive_correct` à `spaced_repetition`.
 *
 * `updateSpacedRepetitionResult` calculait l'intervalle de révision (au-delà des 2 premiers
 * paliers) avec `review_count * ease_factor` — sauf que `review_count` s'incrémente à CHAQUE
 * tentative, juste ou fausse. Un mot raté 8 fois puis enfin retrouvé 3 fois de suite se
 * retrouvait donc programmé sur la base de 11 révisions, alors que sa vraie maîtrise ne date
 * que de 3 bonnes réponses consécutives — l'inverse de ce qu'un système de répétition espacée
 * doit faire (un mot fragile doit revenir plus souvent, pas moins).
 *
 * `correct_count` existait déjà mais n'était lu nulle part : c'est un total cumulé depuis le
 * début, pas une série en cours, donc pas directement réutilisable ici (une bonne réponse après
 * une longue série de ratés ferait quand même repartir sur un total qui ne reflète pas la série
 * en cours). D'où une vraie nouvelle colonne, remise à 0 à la moindre mauvaise réponse.
 *
 * Backfill : `review_count` pour les lignes existantes, faute de mieux — sur-estime la série en
 * cours pour les mots qui ont connu des ratés, mais reste strictement moins faux que l'ancien
 * calcul (qui utilisait déjà cette même valeur), et se corrige de lui-même dès la prochaine
 * mauvaise réponse sur ce mot.
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  12,
  'add_consecutive_correct_to_spaced_repetition',
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      ALTER TABLE spaced_repetition ADD COLUMN consecutive_correct INTEGER NOT NULL DEFAULT 0;
      UPDATE spaced_repetition SET consecutive_correct = review_count;
    `);

    // eslint-disable-next-line no-console
    console.log('[Migration 012] ✓ consecutive_correct ajouté à spaced_repetition (backfill = review_count)');
  }
);
