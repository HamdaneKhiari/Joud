/**
 * ============================================
 * MIGRATION 012: Seed Phrases Content
 * Contenu Phrases pour TOUS les publics
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  12,
  'seed_content_phrases',
  async (db: SQLite.SQLiteDatabase) => {
    // Récupérer les IDs des familles Phrases
    const restaurant = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'restaurant'`
    );
    const shopping = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'shopping'`
    );
    const dailyLife = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'daily_life'`
    );

    const restaurantId = restaurant?.id || 1;
    const shoppingId = shopping?.id || 2;
    const dailyLifeId = dailyLife?.id || 3;

    // ⬇️⬇️⬇️ AJOUTE TON CONTENU ICI ⬇️⬇️⬇️
    const contentSeed = [
      // Structure : [family_id, level, content_type, JSON.stringify({...}), difficulty, tags, target_audience]

      // ===== EXEMPLE RESTAURANT - PRIMARY NIVEAU 1 =====
      // [
      //   restaurantId,
      //   1,  // Niveau 1
      //   'sentence_blanks',
      //   JSON.stringify({
      //     sentence: 'I ___ a pizza, please.',
      //     options: ['would like', 'want', 'need', 'take'],
      //     correct_answer: 'would like',
      //     translation: 'Je voudrais une pizza, s\'il vous plaît.',
      //     explanation: '"Would like" est plus poli que "want"',
      //     type: 'affirmative'
      //   }),
      //   'easy',
      //   'restaurant,polite',
      //   'primary'  // PUBLIC : primary, college, lycee, adult, ou 'all'
      // ],

      // ===== RESTAURANT =====
      // Primary niveau 1-4
      // College niveau 1-4
      // Lycee niveau 1-4
      // Adult niveau 1-7

      // ===== SHOPPING =====
      // Primary niveau 1-4
      // College niveau 1-4
      // Lycee niveau 1-4
      // Adult niveau 1-7

      // ===== DAILY LIFE =====
      // Primary niveau 1-4
      // College niveau 1-4
      // Lycee niveau 1-4
      // Adult niveau 1-7
    ];

    // Nettoyage avant insertion
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "phrase_types")'
    );

    // Insertion du contenu
    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log(`[Migration 012] ✓ Phrases content seeded (${contentSeed.length} items)`);
  },
  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "phrase_types")'
    );
    console.log('[Migration 012] ✓ Phrases content cleared');
  }
);
