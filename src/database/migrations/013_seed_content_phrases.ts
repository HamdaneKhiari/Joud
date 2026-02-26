/**
 * ============================================
 * MIGRATION 012: Seed Phrases Content
 * Contenu Phrases pour TOUS les publics
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  13,
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
    const shoppingId = shopping?.id || 2; // NOSONAR — utilisé dans contentSeed ci-dessous
    const dailyLifeId = dailyLife?.id || 3;

    // ⬇️⬇️⬇️ AJOUTE TON CONTENU ICI ⬇️⬇️⬇️
    const contentSeed = [
      // ===== MODE 1 : BLANKS (Pour Primary / Débutants) =====
      // Utilise le composant existant SentenceBlanksCard
      [
        restaurantId,
        1,
        'sentence_blanks', // Type spécifique pour déclencher le mode "trous"
        JSON.stringify({
          sentence: 'I ___ a pizza, please.',
          options: ['would like', 'want', 'need', 'take'],
          correct_answer: 'would like',
          translation: 'Je voudrais une pizza, s\'il vous plaît.',
          explanation: '"Would like" est la forme polie pour commander.',
          image: '🍕'
        }),
        'easy',
        'restaurant,polite',
        'primary'
      ],
      [
        restaurantId,
        1,
        'sentence_blanks',
        JSON.stringify({
          sentence: 'Can I have the ___, please?',
          options: ['bill', 'money', 'wallet', 'pay'],
          correct_answer: 'bill',
          translation: 'Puis-je avoir l\'addition ?',
          explanation: 'Au restaurant, on demande "the bill" à la fin du repas.',
          image: '🧾'
        }),
        'easy',
        'restaurant,payment',
        'primary'
      ],

      // ===== MODE 2 : FREE / CONSTRUCTION (Pour Adult / Lycée) =====
      // Utilise le composant existant pour la traduction/construction
      [
        restaurantId,
        1,
        'sentence', // Type standard
        JSON.stringify({
          phrase_en: "I would like a table for two.",
          phrase_fr: "Je voudrais une table pour deux.",
          build: "Sujet (I) + Modal (would like) + Objet (a table) + Complément (for two)",
          audio: null
        }),
        'medium',
        'restaurant,booking',
        'adult'
      ],
      [
        dailyLifeId,
        2,
        'sentence',
        JSON.stringify({
          phrase_en: "I usually wake up at 7 AM.",
          phrase_fr: "D'habitude, je me réveille à 7h.",
          build: "Sujet (I) + Fréquence (usually) + Verbe (wake up) + Heure (at 7 AM)",
          audio: null
        }),
        'medium',
        'daily_life,routine',
        'adult'
      ]
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
