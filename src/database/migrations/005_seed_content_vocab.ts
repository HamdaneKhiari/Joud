import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  4,
  'seed_content_vocab',
  async (db: SQLite.SQLiteDatabase) => {
    const contentSeed = [
      // Format : [family_id, level, content_type, data_json, difficulty, tags, target_audience]
      
      // --- BASICS (ID 1) ---
      [1, 1, 'word', JSON.stringify({ word: 'Be', translation: 'Être', example: 'I want to be happy.', image: '👤' }), 'easy', 'core', 'all'],
      [1, 1, 'word', JSON.stringify({ word: 'Have', translation: 'Avoir', example: 'I have a car.', image: '👜' }), 'easy', 'core', 'all'],
      [1, 1, 'word', JSON.stringify({ word: 'I', translation: 'Je', example: 'I am Joud.', image: '🙋' }), 'easy', 'core', 'all'],
      [1, 1, 'word', JSON.stringify({ word: 'You', translation: 'Tu / Vous', example: 'You are kind.', image: '👉' }), 'easy', 'core', 'all'],
      [1, 1, 'word', JSON.stringify({ word: 'Do', translation: 'Faire', example: 'I do my best.', image: '⚙️' }), 'easy', 'core', 'all'],
      [1, 1, 'word', JSON.stringify({ word: 'Say', translation: 'Dire', example: 'Say hello.', image: '🗣️' }), 'easy', 'core', 'all'],
      [1, 1, 'word', JSON.stringify({ word: 'Go', translation: 'Aller', example: 'I go home.', image: '🚶' }), 'easy', 'core', 'all'],
      [1, 1, 'word', JSON.stringify({ word: 'Want', translation: 'Vouloir', example: 'I want water.', image: '✋' }), 'easy', 'core', 'all'],
      [1, 1, 'word', JSON.stringify({ word: 'This', translation: 'Ceci', example: 'This is a book.', image: '📍' }), 'easy', 'core', 'all'],
      [1, 1, 'word', JSON.stringify({ word: 'And', translation: 'Et', example: 'Black and white.', image: '➕' }), 'easy', 'core', 'all'],

      // --- FOOD & DRINKS (ID 4) ---
      [4, 1, 'word', JSON.stringify({ word: 'Water', translation: 'Eau', example: 'A glass of water.', image: '💧' }), 'easy', 'core', 'all'],
      [4, 1, 'word', JSON.stringify({ word: 'Food', translation: 'Nourriture', example: 'The food is good.', image: '🍎' }), 'easy', 'core', 'all'],
      [4, 1, 'word', JSON.stringify({ word: 'Drink', translation: 'Boire', example: 'Drink some water.', image: '🥤' }), 'easy', 'core', 'all'],
      [4, 1, 'word', JSON.stringify({ word: 'Eat', translation: 'Manger', example: 'Eat your apple.', image: '🍽️' }), 'easy', 'core', 'all'],
      [4, 1, 'word', JSON.stringify({ word: 'Coffee', translation: 'Café', example: 'I love coffee.', image: '☕' }), 'easy', 'core', 'all'],
      [4, 1, 'word', JSON.stringify({ word: 'Bread', translation: 'Pain', example: 'Fresh bread.', image: '🍞' }), 'easy', 'core', 'all'],
      [4, 1, 'word', JSON.stringify({ word: 'Milk', translation: 'Lait', example: 'Milk for cereal.', image: '🥛' }), 'easy', 'core', 'all'],
      [4, 1, 'word', JSON.stringify({ word: 'Sugar', translation: 'Sucre', example: 'No sugar, please.', image: '🍬' }), 'easy', 'core', 'all'],
      [4, 1, 'word', JSON.stringify({ word: 'Fruit', translation: 'Fruit', example: 'An apple is a fruit.', image: '🍓' }), 'easy', 'core', 'all'],
      [4, 1, 'word', JSON.stringify({ word: 'Tea', translation: 'Thé', example: 'Hot tea.', image: '🍵' }), 'easy', 'core', 'all'],
    ];

    // Nettoyage avant insertion
    await db.runAsync('DELETE FROM content WHERE content_type = "word"');

    for (const item of contentSeed) {
      await db.runAsync(
        // On utilise les 7 colonnes pour correspondre à ton schéma actuel
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log('[Migration 004] ✓ Pareto Vocabulary seeded (20 core items)');
  },
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync('DELETE FROM content WHERE tags = "core"');
  }
);