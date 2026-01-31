/**
 * ============================================
 * MIGRATION 014: Seed Grammar Content
 * Contenu Grammaire pour TOUS les publics
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  14,
  'seed_content_grammar',
  async (db: SQLite.SQLiteDatabase) => {
    // Récupérer les IDs des familles Grammar
    const present = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'present'`
    );
    const future = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'future'`
    );
    const past = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'past'`
    );

    const presentId = present?.id || 1;
    const futureId = future?.id || 2;
    const pastId = past?.id || 3;

    // ⬇️⬇️⬇️ AJOUTE TON CONTENU ICI ⬇️⬇️⬇️
    const contentSeed = [
      // Structure : [family_id, level, content_type, JSON.stringify({...}), difficulty, tags, target_audience]

      // ===== EXEMPLE PRESENT - PRIMARY NIVEAU 1 =====
      // [
      //   presentId,
      //   1,
      //   'grammar_rule',
      //   JSON.stringify({
      //     rule_title: 'Present Simple',
      //     explanation: 'Le présent simple exprime une habitude ou une vérité générale.',
      //     examples: [
      //       'I eat breakfast every day.',
      //       'She works at a hospital.',
      //       'They don\'t like pizza.'
      //     ],
      //     exercises: [
      //       {
      //         question: 'He ___ to work by bus.',
      //         options: ['go', 'goes', 'going', 'gone'],
      //         correct_answer: 'goes',
      //         explanation: 'Avec he/she/it, on ajoute -s ou -es'
      //       },
      //       {
      //         question: 'They ___ football every Sunday.',
      //         options: ['play', 'plays', 'playing', 'played'],
      //         correct_answer: 'play',
      //         explanation: 'Avec they/we/you/I, pas de -s'
      //       }
      //     ]
      //   }),
      //   'easy',
      //   'present,verbs,basics',
      //   'primary'  // PUBLIC : primary, college, lycee, adult, ou 'all'
      // ],

      // ===== PRESENT =====
      // Primary niveau 1-4 : Présent simple basique
      // College niveau 1-4 : Présent + continuous
      // Lycee niveau 1-4 : Présent avancé
      // Adult niveau 1-7 : Présent professionnel

      // ===== FUTURE =====
      // Primary niveau 2-4 : Will simple
      // College niveau 1-4 : Going to + will
      // Lycee niveau 1-4 : Future perfect
      // Adult niveau 1-7 : Tous les futurs

      // ===== PAST =====
      // Primary niveau 2-4 : Passé simple
      // College niveau 1-4 : Passé composé
      // Lycee niveau 1-4 : Past perfect
      // Adult niveau 1-7 : Tous les passés
    ];

    // Nettoyage avant insertion
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "grammar")'
    );

    // Insertion du contenu
    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log(`[Migration 014] ✓ Grammar content seeded (${contentSeed.length} items)`);
  },
  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "grammar")'
    );
    console.log('[Migration 014] ✓ Grammar content cleared');
  }
);
