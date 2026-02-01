/**
 * ============================================
 * MIGRATION 005: Seed WordGames Content
 * Insère le contenu WordGames (30 questions: 10 par game type)
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  5,
  'seed_content_wordgames',
  async (db: SQLite.SQLiteDatabase) => {
    // Récupérer les family_ids dynamiquement
    const definitionFamily = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE name = 'Definition Master' LIMIT 1`
    );
    const detectiveFamily = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE name = 'Grammar Detective' LIMIT 1`
    );
    const speedFamily = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE name = 'Quick Match' LIMIT 1`
    );

    if (!definitionFamily || !detectiveFamily || !speedFamily) {
      throw new Error('WordGames families not found');
    }

    const contentSeed = [
      // ===== DEFINITION MASTER (10 questions) =====
      [definitionFamily.id, 1, 'definition', JSON.stringify({ type: 'definition', word: 'Happy', definition: 'Feeling or showing pleasure or contentment', options: ['Sad', 'Feeling pleased', 'Angry', 'Tired'], correctAnswer: 'Feeling pleased', image: '😊', difficulty: 'easy' }), 'easy', 'emotions,basic'],
      [definitionFamily.id, 1, 'definition', JSON.stringify({ type: 'definition', word: 'Library', definition: 'A building where books are kept for reading', options: ['A place to buy food', 'A building for books', 'A school', 'A hospital'], correctAnswer: 'A building for books', image: '📚', difficulty: 'easy' }), 'easy', 'places,education'],
      [definitionFamily.id, 1, 'definition', JSON.stringify({ type: 'definition', word: 'Bicycle', definition: 'A vehicle with two wheels powered by pedals', options: ['A car', 'A two-wheeled vehicle', 'A bus', 'A train'], correctAnswer: 'A two-wheeled vehicle', image: '🚲', difficulty: 'easy' }), 'easy', 'transport,sports'],
      [definitionFamily.id, 1, 'definition', JSON.stringify({ type: 'definition', word: 'Courage', definition: 'The ability to face danger or difficulty without fear', options: ['Fear', 'Bravery in danger', 'Happiness', 'Intelligence'], correctAnswer: 'Bravery in danger', image: '🦁', difficulty: 'medium' }), 'medium', 'emotions,abstract'],
      [definitionFamily.id, 1, 'definition', JSON.stringify({ type: 'definition', word: 'Ancient', definition: 'Belonging to the very distant past', options: ['Modern', 'Very old', 'New', 'Recent'], correctAnswer: 'Very old', image: '🏛️', difficulty: 'medium' }), 'medium', 'time,history'],
      [definitionFamily.id, 1, 'definition', JSON.stringify({ type: 'definition', word: 'Generous', definition: 'Willing to give more than necessary', options: ['Selfish', 'Kind and giving', 'Angry', 'Lazy'], correctAnswer: 'Kind and giving', image: '🎁', difficulty: 'medium' }), 'medium', 'personality,values'],
      [definitionFamily.id, 1, 'definition', JSON.stringify({ type: 'definition', word: 'Magnificent', definition: 'Extremely beautiful, impressive or grand', options: ['Ugly', 'Impressively beautiful', 'Small', 'Ordinary'], correctAnswer: 'Impressively beautiful', image: '✨', difficulty: 'hard' }), 'hard', 'adjectives,advanced'],
      [definitionFamily.id, 1, 'definition', JSON.stringify({ type: 'definition', word: 'Perseverance', definition: 'Continued effort despite difficulties', options: ['Giving up', 'Persistent effort', 'Laziness', 'Luck'], correctAnswer: 'Persistent effort', image: '💪', difficulty: 'hard' }), 'hard', 'values,abstract'],
      [definitionFamily.id, 1, 'definition', JSON.stringify({ type: 'definition', word: 'Diligent', definition: 'Showing care and effort in work', options: ['Lazy', 'Hardworking', 'Careless', 'Slow'], correctAnswer: 'Hardworking', image: '📝', difficulty: 'hard' }), 'hard', 'personality,work'],
      [definitionFamily.id, 1, 'definition', JSON.stringify({ type: 'definition', word: 'Harmony', definition: 'A state of peaceful agreement', options: ['Conflict', 'Peaceful agreement', 'Noise', 'Chaos'], correctAnswer: 'Peaceful agreement', image: '☮️', difficulty: 'hard' }), 'hard', 'abstract,social'],

      // ===== GRAMMAR DETECTIVE (10 questions) =====
      [detectiveFamily.id, 1, 'detective', JSON.stringify({ type: 'detective', sentence: 'She go to school every day.', errorWordIndex: 1, correctWord: 'goes', explanation: 'Avec "she", le verbe doit prendre un "s" au présent simple', difficulty: 'easy' }), 'easy', 'grammar,present_simple'],
      [detectiveFamily.id, 1, 'detective', JSON.stringify({ type: 'detective', sentence: 'I has a new book.', errorWordIndex: 1, correctWord: 'have', explanation: 'Avec "I", on utilise "have" et non "has"', difficulty: 'easy' }), 'easy', 'grammar,have'],
      [detectiveFamily.id, 1, 'detective', JSON.stringify({ type: 'detective', sentence: 'They is playing football.', errorWordIndex: 1, correctWord: 'are', explanation: 'Avec "they" (pluriel), on utilise "are" et non "is"', difficulty: 'easy' }), 'easy', 'grammar,to_be'],
      [detectiveFamily.id, 1, 'detective', JSON.stringify({ type: 'detective', sentence: 'He dont like pizza.', errorWordIndex: 1, correctWord: "doesn't", explanation: "Avec \"he\", on utilise \"doesn't\" (does not) à la forme négative", difficulty: 'medium' }), 'medium', 'grammar,negation'],
      [detectiveFamily.id, 1, 'detective', JSON.stringify({ type: 'detective', sentence: 'She have been waiting for an hour.', errorWordIndex: 1, correctWord: 'has', explanation: 'Avec "she", on utilise "has" au present perfect', difficulty: 'medium' }), 'medium', 'grammar,present_perfect'],
      [detectiveFamily.id, 1, 'detective', JSON.stringify({ type: 'detective', sentence: 'I will going to the cinema tomorrow.', errorWordIndex: 2, correctWord: 'go', explanation: 'Après "will", on utilise la base verbale (go) sans "ing"', difficulty: 'medium' }), 'medium', 'grammar,future'],
      [detectiveFamily.id, 1, 'detective', JSON.stringify({ type: 'detective', sentence: 'If I would have known, I would have come.', errorWordIndex: 2, correctWord: 'had', explanation: 'Dans une conditionnelle passée, on utilise "had" et non "would have"', difficulty: 'hard' }), 'hard', 'grammar,conditionals'],
      [detectiveFamily.id, 1, 'detective', JSON.stringify({ type: 'detective', sentence: 'She told me that she will come tomorrow.', errorWordIndex: 4, correctWord: 'would', explanation: 'En discours indirect, "will" devient "would" (concordance des temps)', difficulty: 'hard' }), 'hard', 'grammar,reported_speech'],
      [detectiveFamily.id, 1, 'detective', JSON.stringify({ type: 'detective', sentence: 'Neither of them are ready.', errorWordIndex: 3, correctWord: 'is', explanation: '"Neither" est singulier et nécessite le verbe au singulier ("is")', difficulty: 'hard' }), 'hard', 'grammar,agreement'],
      [detectiveFamily.id, 1, 'detective', JSON.stringify({ type: 'detective', sentence: 'The informations you gave me were helpful.', errorWordIndex: 1, correctWord: 'information', explanation: '"Information" est indénombrable et n\'a pas de pluriel en anglais', difficulty: 'hard' }), 'hard', 'grammar,uncountable'],

      // ===== QUICK MATCH (10 questions) =====
      [speedFamily.id, 1, 'speed', JSON.stringify({ type: 'speed', pairs: [{ english: 'Hello', french: 'Bonjour' }, { english: 'Goodbye', french: 'Au revoir' }, { english: 'Thank you', french: 'Merci' }, { english: 'Please', french: "S'il vous plaît" }, { english: 'Sorry', french: 'Désolé' }], timeLimit: 30, difficulty: 'easy' }), 'easy', 'greetings,basic'],
      [speedFamily.id, 1, 'speed', JSON.stringify({ type: 'speed', pairs: [{ english: 'Monday', french: 'Lundi' }, { english: 'Tuesday', french: 'Mardi' }, { english: 'Wednesday', french: 'Mercredi' }, { english: 'Thursday', french: 'Jeudi' }, { english: 'Friday', french: 'Vendredi' }], timeLimit: 25, difficulty: 'easy' }), 'easy', 'days,time'],
      [speedFamily.id, 1, 'speed', JSON.stringify({ type: 'speed', pairs: [{ english: 'Red', french: 'Rouge' }, { english: 'Blue', french: 'Bleu' }, { english: 'Green', french: 'Vert' }, { english: 'Yellow', french: 'Jaune' }, { english: 'Black', french: 'Noir' }], timeLimit: 20, difficulty: 'easy' }), 'easy', 'colors,basic'],
      [speedFamily.id, 1, 'speed', JSON.stringify({ type: 'speed', pairs: [{ english: 'Happy', french: 'Heureux' }, { english: 'Sad', french: 'Triste' }, { english: 'Angry', french: 'En colère' }, { english: 'Excited', french: 'Excité' }, { english: 'Tired', french: 'Fatigué' }], timeLimit: 25, difficulty: 'medium' }), 'medium', 'emotions,feelings'],
      [speedFamily.id, 1, 'speed', JSON.stringify({ type: 'speed', pairs: [{ english: 'Kitchen', french: 'Cuisine' }, { english: 'Bedroom', french: 'Chambre' }, { english: 'Bathroom', french: 'Salle de bain' }, { english: 'Living room', french: 'Salon' }, { english: 'Garden', french: 'Jardin' }], timeLimit: 30, difficulty: 'medium' }), 'medium', 'house,places'],
      [speedFamily.id, 1, 'speed', JSON.stringify({ type: 'speed', pairs: [{ english: 'Breakfast', french: 'Petit-déjeuner' }, { english: 'Lunch', french: 'Déjeuner' }, { english: 'Dinner', french: 'Dîner' }, { english: 'Snack', french: 'Goûter' }, { english: 'Dessert', french: 'Dessert' }], timeLimit: 25, difficulty: 'medium' }), 'medium', 'food,meals'],
      [speedFamily.id, 1, 'speed', JSON.stringify({ type: 'speed', pairs: [{ english: 'Achievement', french: 'Réussite' }, { english: 'Challenge', french: 'Défi' }, { english: 'Opportunity', french: 'Opportunité' }, { english: 'Perseverance', french: 'Persévérance' }, { english: 'Wisdom', french: 'Sagesse' }], timeLimit: 35, difficulty: 'hard' }), 'hard', 'abstract,values'],
      [speedFamily.id, 1, 'speed', JSON.stringify({ type: 'speed', pairs: [{ english: 'Assess', french: 'Évaluer' }, { english: 'Dedicate', french: 'Consacrer' }, { english: 'Enhance', french: 'Améliorer' }, { english: 'Implement', french: 'Mettre en œuvre' }, { english: 'Optimize', french: 'Optimiser' }], timeLimit: 40, difficulty: 'hard' }), 'hard', 'verbs,professional'],
      [speedFamily.id, 1, 'speed', JSON.stringify({ type: 'speed', pairs: [{ english: 'Conscientious', french: 'Consciencieux' }, { english: 'Diligent', french: 'Assidu' }, { english: 'Meticulous', french: 'Méticuleux' }, { english: 'Resilient', french: 'Résilient' }, { english: 'Versatile', french: 'Polyvalent' }], timeLimit: 40, difficulty: 'hard' }), 'hard', 'adjectives,personality'],
      [speedFamily.id, 1, 'speed', JSON.stringify({ type: 'speed', pairs: [{ english: 'Acknowledge', french: 'Reconnaître' }, { english: 'Anticipate', french: 'Anticiper' }, { english: 'Comprehend', french: 'Comprendre' }, { english: 'Demonstrate', french: 'Démontrer' }, { english: 'Elaborate', french: 'Élaborer' }], timeLimit: 45, difficulty: 'hard' }), 'hard', 'verbs,academic'],
    ];

    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags) VALUES (?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log('[Migration 005] ✓ WordGames content seeded (30 questions)');
  },
  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync(
      `DELETE FROM content WHERE content_type IN ('definition', 'detective', 'speed')`
    );
    console.log('[Migration 005] ✓ WordGames content cleared');
  }
);
