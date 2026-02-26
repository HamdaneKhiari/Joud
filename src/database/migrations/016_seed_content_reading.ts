/**
 * ============================================
 * MIGRATION 015: Seed Reading Content
 * Contenu Lecture pour TOUS les publics
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  16,
  'seed_content_reading',
  async (db: SQLite.SQLiteDatabase) => {
    // Récupérer les IDs des familles Reading
    const stories = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'short_stories'`
    );
    const articles = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'articles'`
    );
    const emails = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'emails'`
    );

    const storiesId = stories?.id || 1; // NOSONAR — utilisé dans contentSeed ci-dessous
    const articlesId = articles?.id || 2; // NOSONAR — utilisé dans contentSeed ci-dessous
    const emailsId = emails?.id || 3; // NOSONAR — utilisé dans contentSeed ci-dessous

    // ⬇️⬇️⬇️ AJOUTE TON CONTENU ICI ⬇️⬇️⬇️
    const contentSeed: any[] = [
      // Structure : [family_id, level, content_type, JSON.stringify({...}), difficulty, tags, target_audience]

      // ===== EXEMPLE SHORT STORIES - PRIMARY NIVEAU 1 =====
      // [
      //   storiesId,
      //   1,
      //   'reading_passage',
      //   JSON.stringify({
      //     title: 'A Day at the Beach',
      //     passage: 'Last summer, my family and I went to the beach. The weather was perfect. The sun was shining and the water was warm. We built sandcastles and played volleyball. In the evening, we watched the beautiful sunset.',
      //     question_text: 'What did they build at the beach?',
      //     options: ['Sandcastles', 'Houses', 'Boats', 'Towers'],
      //     correct_answer: 'Sandcastles'
      //   }),
      //   'easy',
      //   'vacation,beach,summer',
      //   'primary'  // PUBLIC : primary, college, lycee, adult, ou 'all'
      // ],
      // // Ajouter 2-3 questions supplémentaires pour le même passage si besoin

      // ===== SHORT STORIES =====
      // Primary niveau 1-4 : Histoires courtes simples (50-100 mots)
      // College niveau 1-4 : Histoires moyennes (100-200 mots)
      // Lycee niveau 1-4 : Histoires complexes (200-300 mots)
      // Adult niveau 1-7 : Nouvelles (300-500 mots)

      // ===== ARTICLES =====
      // Primary niveau 3-4 : Articles simples
      // College niveau 1-4 : Articles informatifs
      // Lycee niveau 1-4 : Articles journalistiques
      // Adult niveau 1-7 : Articles professionnels

      // ===== EMAILS =====
      // College niveau 3-4 : Emails amicaux
      // Lycee niveau 1-4 : Emails formels
      // Adult niveau 1-7 : Emails professionnels
    ];

    // Nettoyage avant insertion
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "reading")'
    );

    // Insertion du contenu
    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log(`[Migration 015] ✓ Reading content seeded (${contentSeed.length} items)`);
  },
  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "reading")'
    );
    console.log('[Migration 015] ✓ Reading content cleared');
  }
);
