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
      // [slug, module_slug, name, icon, emoji, description, order_index]

      // ===== VOCABULAIRE =====
      ['salutations', 'vocab', 'Salutations', 'hand-wave', '👋', 'Apprends à dire bonjour', 1],
      ['family', 'vocab', 'Famille', 'account-group', '👨‍👩‍👧‍👦', 'Les membres de la famille', 2],
      ['colors', 'vocab', 'Couleurs', 'palette', '🎨', 'Toutes les couleurs', 3],
      ['food_drinks', 'vocab', 'Food & Drinks', 'food', '🍽️', 'Nourriture et boissons', 4],

      // ===== FAST VOCABULARY (adulte) =====
      ['business_essentials', 'fastvocab', 'Business Essentials', 'briefcase', '💼', '50 mots business', 1],
      ['travel_essentials', 'fastvocab', 'Travel Essentials', 'airplane', '✈️', '50 mots voyage', 2],
      ['tech_essentials', 'fastvocab', 'Tech Essentials', 'laptop', '💻', '50 mots tech', 3],

      // ===== GRAMMAIRE =====
      ['present', 'grammar', 'Présent', 'clock-outline', '⏰', 'Le temps présent', 1],
      ['future', 'grammar', 'Futur', 'rocket', '🚀', "Parler de l'avenir", 2],
      ['past', 'grammar', 'Passé', 'history', '🕰️', 'Le temps passé', 3],

      // ===== PHRASES =====
      ['restaurant', 'phrase_types', 'Au Restaurant', 'silverware-fork-knife', '🍽️', 'Commander et payer', 1],
      ['shopping', 'phrase_types', 'Shopping', 'cart', '🛒', 'Faire les courses', 2],
      ['daily_life', 'phrase_types', 'Vie quotidienne', 'home', '🏠', 'Phrases du quotidien', 3],

      // ===== DIALOGUES =====
      ['at_airport', 'dialogues', 'At the Airport', 'airplane', '✈️', 'Dialogue à l\'aéroport', 1],
      ['job_interview', 'dialogues', 'Job Interview', 'account-tie', '💼', 'Entretien d\'embauche', 2],
      ['meeting_friends', 'dialogues', 'Meeting Friends', 'account-multiple', '👥', 'Rencontrer des amis', 3],

      // ===== LECTURE =====
      ['short_stories', 'reading', 'Short Stories', 'book-open-page-variant', '📖', 'Histoires courtes', 1],
      ['articles', 'reading', 'Articles', 'newspaper', '📰', 'Articles de presse', 2],
      ['emails', 'reading', 'Emails', 'email', '📧', 'Emails professionnels', 3],

      // ===== CONNECTOR (lycée) =====
      ['logical_links', 'connector', 'Logical Links', 'link-variant', '🔗', 'Connecteurs logiques', 1],
      ['sentence_fusion', 'connector', 'Sentence Fusion', 'merge', '🔀', 'Fusionner des phrases', 2],
      ['rephrasing', 'connector', 'Rephrasing', 'refresh', '♻️', 'Reformulation', 3],

      // ===== WORDGAMES =====
      ['quick_match', 'word_games', 'Quick Match', 'lightning-bolt', '⚡', 'Associe rapidement les mots', 1],
      ['grammar_detective', 'word_games', 'Grammar Detective', 'magnify', '🔍', 'Trouve les erreurs', 2],
      ['definition_master', 'word_games', 'Definition Master', 'book-open-variant', '📖', 'Maîtrise les définitions', 3],

      // ===== ASSESSMENT =====
      ['assessment_pool', 'assessment', 'Assessment Pool', 'chart-box', '🎯', 'Pool de questions pour évaluation', 1],
    ];

    // Nettoyage préventif pour éviter les doublons en dev
    await db.runAsync('DELETE FROM families');

    for (const fam of familiesSeed) {
      await db.runAsync(
        `INSERT OR IGNORE INTO families (slug, module_slug, name, icon, emoji, description, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
