import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  3,
  'seed_families',
  async (db: SQLite.SQLiteDatabase) => {
    const familiesSeed = [
      // Format: [slug, module_slug, name, icon, emoji, description, order_index]
      
      // --- FAMILLES VOCABULAIRE ---
      ['salutations', 'vocab', 'Basics', 'hand-wave', '👋', 'Les mots essentiels pour démarrer', 1],
      ['family', 'vocab', 'Family', 'account-group', '👨‍👩‍👧‍👦', 'Membres de la famille', 2],
      ['colors', 'vocab', 'Colors', 'palette', '🎨', 'Apprendre les couleurs', 3],
      ['food_drinks', 'vocab', 'Food & Drinks', 'food', '🍽️', 'Nourriture et boissons', 4],

      // --- FAMILLES GRAMMAIRE / PHRASES / CONNECTEURS ---
      ['present', 'grammar', 'Present Tense', 'clock-outline', '⏰', 'Le présent simple', 5],
      ['daily_life', 'phrase_types', 'Daily Life', 'home', '🏠', 'Phrases du quotidien', 6],
      ['logical_links', 'connector', 'Logical Links', 'link-variant', '🔗', 'Mots de liaison', 7],

      // --- FAMILLES WORDGAMES (REQUIS POUR MIGRATION 005) ---
      // Attention: Les noms (3ème colonne) doivent être EXACTEMENT ceux-ci
      ['definition_master', 'word_games', 'Definition Master', 'book-open-variant', '📖', 'Maîtrisez les définitions', 8],
      ['grammar_detective', 'word_games', 'Grammar Detective', 'magnify', '🕵️', 'Devenez un détective de la grammaire', 9],
      ['quick_match', 'word_games', 'Quick Match', 'lightning-bolt', '⚡', 'Reliez les mots le plus vite possible', 10],

      // --- FAMILLES ASSESSMENT (REQUIS POUR MIGRATION 006) ---
      ['assessment_pool', 'assessment', 'Assessment Pool', 'clipboard-check', '📝', 'Évaluation globale', 11]
    ];

    // Nettoyage avant insertion
    await db.runAsync('DELETE FROM families');

    for (const fam of familiesSeed) {
      await db.runAsync(
        `INSERT INTO families (slug, module_slug, name, icon, emoji, description, order_index) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        fam
      );
    }
    
    console.log('[Migration 003] ✓ All families seeded (Vocab + WordGames)');
  },
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync('DELETE FROM families');
  }
);