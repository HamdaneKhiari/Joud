/**
 * ============================================
 * MIGRATION 003: Seed Core Modules & Levels
 * Recodage complet pour alignement Schéma 001
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  3,
  'seed_core_modules',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. NETTOYAGE DES TABLES (Évite les conflits d'IDs)
    await db.runAsync('DELETE FROM levels');
    await db.runAsync('DELETE FROM modules');

    // 2. SEED DES MODULES
    // Format: [slug, name, icon_name, description, order_index, is_core, target_audience]
    const modulesSeed = [
      ['vocab', 'Vocabulaire', 'book-alphabet', 'Enrichis ton vocabulaire', 1, 1, 'all'],
      ['phrase_types', 'Phrases', 'format-quote-close', 'Structure et syntaxe', 2, 1, 'all'],
      ['grammar', 'Grammaire', 'format-list-bulleted', 'Maîtrise les règles', 3, 1, 'all'],
      ['reading', 'Lecture', 'text-box', 'Analyse de textes', 4, 1, 'all'],
      ['dialogues', 'Conversation', 'chat', 'Pratique dialogues', 5, 1, 'all'],
      ['word_games', 'Jeux', 'gamepad-variant', 'Exercices ludiques', 6, 1, 'all'],
      ['assessment', 'Évaluation', 'clipboard-check', 'Teste ton niveau', 7, 1, 'all'],
      ['connector', 'The Connector', 'connection', 'Syntax & articulation', 8, 0, 'lycee'],
      ['fastvocab', 'Fast Vocab', 'flash', '500 mots essentiels', 9, 0, 'adult']
    ];

    for (const mod of modulesSeed) {
      await db.runAsync(
        `INSERT INTO modules (
          slug, name, icon_name, description, order_index, is_core, target_audience
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        mod
      );
    }

    // 3. SEED DES NIVEAUX (Table structurelle 'levels')
    // Note: Les labels spécifiques (Salé/Sucré) vont dans 'level_labels' (Migration 005)
    // Format: [id, level, title, icon, description, badge, target_audience]
    const levelsSeed = [
      // PRIMARY
      [101, 1, 'Foundations', 'bridge', 'Démarre ton apprentissage', 'Niveau 1', 'primary'],
      [102, 2, 'Skills', 'key', 'Développe tes compétences', 'Niveau 2', 'primary'],
      [103, 3, 'Expertise', 'microscope', 'Renforce ton niveau', 'Niveau 3', 'primary'],
      [104, 4, 'Mastery', 'pen', "Maîtrise l'anglais", 'Niveau 4', 'primary'],

      // COLLEGE
      [201, 1, 'Foundations', 'bridge', 'Démarre ton apprentissage', 'Niveau 1', 'college'],
      [202, 2, 'Skills', 'key', 'Développe tes compétences', 'Niveau 2', 'college'],
      [203, 3, 'Expertise', 'microscope', 'Renforce ton niveau', 'Niveau 3', 'college'],
      [204, 4, 'Mastery', 'pen', "Maîtrise l'anglais", 'Niveau 4', 'college'],

      // LYCEE
      [301, 1, 'Foundations', 'bridge', 'Démarre ton apprentissage', 'Niveau 1', 'lycee'],
      [302, 2, 'Skills', 'key', 'Développe tes compétences', 'Niveau 2', 'lycee'],
      [303, 3, 'Expertise', 'microscope', 'Renforce ton niveau', 'Niveau 3', 'lycee'],
      [304, 4, 'Mastery', 'pen', "Maîtrise l'anglais", 'Niveau 4', 'lycee'],

      // ADULT
      [401, 1, 'Foundations', 'bridge', 'Les bases essentielles', 'Niveau 1', 'adult'],
      [402, 2, 'Skills', 'key', 'Pratique et quotidien', 'Niveau 2', 'adult'],
      [403, 3, 'Expertise', 'microscope', 'Approfondissement', 'Niveau 3', 'adult'],
      [404, 4, 'Mastery', 'pen', 'Maîtrise complète', 'Niveau 4', 'adult'],
      [405, 5, 'Advanced', 'fire', 'Avancé', 'Niveau 5', 'adult'],
      [406, 6, 'Expert', 'diamond', 'Expert', 'Niveau 6', 'adult'],
      [407, 7, 'Real Life', 'rocket', 'Anglais réel & Slang', 'SPECIAL', 'adult']
    ];

    for (const lvl of levelsSeed) {
      await db.runAsync(
        `INSERT INTO levels (
          id, level, title, icon, description, badge, target_audience
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        lvl
      );
    }

    console.log('[Migration 003] ✓ Modules and Levels fully seeded and aligned');
  },

  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync('DELETE FROM levels');
    await db.runAsync('DELETE FROM modules');
    console.log('[Migration 003] ✓ Rollback: Data cleared');
  }
);