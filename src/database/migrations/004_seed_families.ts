/**
 * ============================================
 * MIGRATION 004: Seed Families
 * Insère les catégories (familles) de contenu
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  4,
  'seed_families',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. DÉFINITION DES DONNÉES
    // Format: [slug, module_slug, name, icon, emoji, description, order_index]
    const familiesSeed = [
      
      // --- MODULE: VOCABULAIRE (vocab) ---
      ['salutations', 'vocab', 'Basics', 'hand-wave', '👋', 'Les mots essentiels pour démarrer', 1],
      ['family', 'vocab', 'Family', 'account-group', '👨‍👩‍👧‍👦', 'Membres de la famille', 2],
      ['colors', 'vocab', 'Colors', 'palette', '🎨', 'Apprendre les couleurs', 3],
      ['food_drinks', 'vocab', 'Food & Drinks', 'food', '🍽️', 'Nourriture et boissons', 4],
      ['logical_links', 'vocab', 'Connectors', 'link-variant', '🔗', 'Mots de liaison', 5],

      // --- MODULE: GRAMMAIRE (grammar) ---
      ['present', 'grammar', 'Present Tense', 'clock-outline', '⏰', 'Le présent simple', 6],
      
      // --- MODULE: PHRASES (phrase_types) ---
      ['daily_life', 'phrase_types', 'Daily Life', 'home', '🏠', 'Phrases du quotidien', 7],

      // --- MODULE: JEUX (word_games) ---
      ['definition_master', 'word_games', 'Definition Master', 'book-open-variant', '📖', 'Maîtrisez les définitions', 8],
      ['grammar_detective', 'word_games', 'Grammar Detective', 'magnify', '🕵️', 'Analyse grammaticale', 9],
      ['quick_match', 'word_games', 'Quick Match', 'lightning-bolt', '⚡', 'Reliez les mots vite', 10],

      // --- MODULE: ÉVALUATION (assessment) ---
      ['assessment_pool', 'assessment', 'Assessment Pool', 'clipboard-check', '📝', 'Évaluation globale', 11]
    ];

    // 2. NETTOYAGE (Évite les erreurs de contrainte UNIQUE)
    await db.runAsync('DELETE FROM families');

    // 3. INSERTION SÉCURISÉE
    for (const fam of familiesSeed) {
      try {
        await db.runAsync(
          `INSERT INTO families (slug, module_slug, name, icon, emoji, description, order_index) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          fam
        );
      } catch (error) {
        console.error(`[Migration 004] Erreur sur la famille ${fam[0]}:`, error);
        throw error; // On stoppe tout si une famille critique manque
      }
    }
    
    console.log('[Migration 004] ✓ All families seeded (Vocab + Grammar + Games)');
  },

  async (db: SQLite.SQLiteDatabase) => {
    // Rollback : Nettoyage de la table
    await db.runAsync('DELETE FROM families');
    console.log('[Migration 004] ✓ Families cleared');
  }
);