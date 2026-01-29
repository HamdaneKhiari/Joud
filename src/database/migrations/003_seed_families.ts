/**
 * ============================================
 * MIGRATION 003: Seed Families
 * Insère les familles d'exercices
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  3,
  'seed_families',
  async (db: SQLite.SQLiteDatabase) => {
    const familiesSeed = [
      // [module_slug, name, icon, emoji, description, order_index]
      ['vocab', 'Salutations', 'hand-wave', '👋', 'Apprends à dire bonjour', 1],
      ['vocab', 'Famille', 'account-group', '👨‍👩‍👧‍👦', 'Les membres de la famille', 2],
      ['vocab', 'Couleurs', 'palette', '🎨', 'Toutes les couleurs', 3],
      ['vocab', 'Food & Drinks', 'food', '🍽️', 'Nourriture et boissons', 4],
      ['grammar', 'Présent', 'clock-outline', '⏰', 'Le temps présent', 1],
      ['grammar', 'Futur', 'rocket', '🚀', "Parler de l'avenir", 2],
      [
        'phrase_types',
        'Au Restaurant',
        'silverware-fork-knife',
        '🍽️',
        'Commander et payer',
        1,
      ],
      ['connector', 'Logical Links', 'link-variant', '🔗', 'Connecteurs logiques', 1],
      ['connector', 'Sentence Fusion', 'merge', '🔀', 'Fusionner des phrases', 2],
      ['connector', 'Rephrasing', 'refresh', '♻️', 'Reformulation', 3],
      // WordGames families
      ['word_games', 'Quick Match', 'lightning-bolt', '⚡', 'Associe rapidement les mots', 1],
      ['word_games', 'Grammar Detective', 'magnify', '🔍', 'Trouve les erreurs', 2],
      [
        'word_games',
        'Definition Master',
        'book-open-variant',
        '📖',
        'Maîtrise les définitions',
        3,
      ],
      // Assessment family
      [
        'assessment',
        'Assessment Pool',
        'chart-box',
        '🎯',
        'Pool de questions pour évaluation',
        1,
      ],
    ];

    for (const fam of familiesSeed) {
      await db.runAsync(
        `INSERT INTO families (module_slug, name, icon, emoji, description, order_index) VALUES (?, ?, ?, ?, ?, ?)`,
        fam
      );
    }

    console.log('[Migration 003] ✓ Families seeded');
  },
  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync('DELETE FROM families');
    console.log('[Migration 003] ✓ Families cleared');
  }
);
