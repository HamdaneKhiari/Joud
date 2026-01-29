/**
 * ============================================
 * MIGRATION 004: Seed Vocabulary Content
 * Insère le contenu vocabulaire basique
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  4,
  'seed_content_vocab',
  async (db: SQLite.SQLiteDatabase) => {
    const contentSeed = [
      // Vocabulaire - Food & Drinks (family_id = 4)
      [
        4,
        1,
        'word',
        JSON.stringify({
          word: 'Croissant',
          translation: 'Croissant',
          example: 'I love eating a fresh croissant for breakfast.',
          image: '🥐',
          audio: null,
        }),
        'easy',
        'food,breakfast',
      ],
      [
        4,
        1,
        'word',
        JSON.stringify({
          word: 'Book',
          translation: 'Livre',
          example: 'She is reading a fascinating book about history.',
          image: '📚',
          audio: null,
        }),
        'easy',
        'objects,learning',
      ],
      [
        4,
        1,
        'word',
        JSON.stringify({
          word: 'Cat',
          translation: 'Chat',
          example: 'The cat is sleeping on the sofa.',
          image: '🐱',
          audio: null,
        }),
        'easy',
        'animals,pets',
      ],
      // Grammar - Présent (family_id = 5)
      [
        5,
        1,
        'logic',
        JSON.stringify({
          sentence: 'He _____ football every Sunday.',
          translation: 'Il joue au football tous les dimanches.',
          options: ['play', 'plays', 'playing', 'played'],
          correctAnswer: 'plays',
        }),
        'easy',
        'grammar,present_simple',
      ],
      // Phrases - Au Restaurant (family_id = 7)
      [
        7,
        1,
        'sentence',
        JSON.stringify({
          phrase_fr: "Je voudrais un café, s'il vous plaît.",
          phrase_en: 'I would like a coffee, please.',
          concretement: "Formule standard pour commander poliment n'importe où.",
          build: 'I would like (Je voudrais) + [objet] + please',
        }),
        'easy',
        'restaurant,politeness',
      ],
      // Connector - Logical Links (family_id = 8)
      [
        8,
        1,
        'logic',
        JSON.stringify({
          sentence: 'I wanted to go for a walk, _____ it started raining.',
          translation: 'Je voulais aller me promener, mais il a commencé à pleuvoir.',
          options: ['and', 'but', 'so', 'because'],
          correctAnswer: 'but',
        }),
        'medium',
        'grammar,connectors',
      ],
      // Connector - Sentence Fusion (family_id = 9)
      [
        9,
        1,
        'fusion',
        JSON.stringify({
          phrase1: 'It was raining.',
          phrase2: 'We stayed inside.',
          hint: "Use 'so'",
          correctAnswer: 'It was raining so we stayed inside.',
          translation: "Il pleuvait donc nous sommes restés à l'intérieur.",
        }),
        'hard',
        'grammar,fusion',
      ],
      // Connector - Rephrasing (family_id = 10)
      [
        10,
        1,
        'rephrasing',
        JSON.stringify({
          original: 'The movie was boring.',
          hint: "Use 'not interesting'",
          correctAnswer: 'The movie was not interesting.',
          translation: "Le film n'était pas intéressant.",
        }),
        'medium',
        'grammar,rephrasing',
      ],
    ];

    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags) VALUES (?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log('[Migration 004] ✓ Vocabulary content seeded');
  },
  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync(
      `DELETE FROM content WHERE content_type IN ('word', 'logic', 'sentence', 'fusion', 'rephrasing')`
    );
    console.log('[Migration 004] ✓ Vocabulary content cleared');
  }
);
