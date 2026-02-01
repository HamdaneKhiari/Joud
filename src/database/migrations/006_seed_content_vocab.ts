/**
 * ============================================
 * MIGRATION 006: Seed Content Vocab
 * Remplit les mots pour le split Salé/Sucré
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  6,
  'seed_content_vocab',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. RÉCUPÉRATION DYNAMIQUE DE L'ID FAMILLE
    const foodFam = await db.getFirstAsync<{id: number}>(
      'SELECT id FROM families WHERE slug = "food_drinks"'
    );

    if (!foodFam) {
      console.error('[Migration 006] Erreur: Famille food_drinks introuvable !');
      return;
    }

    const familyId = foodFam.id;

    // 2. PRÉPARATION DES DONNÉES
    // Format : [family_id, level, content_type, data_json, difficulty, tags, target_audience]
    const contentSeed = [
      // --- NIVEAU 1 : LE SALÉ ---
      [familyId, 1, 'word', JSON.stringify({ word: 'Water', translation: 'Eau', image: '💧' }), 'easy', 'core', 'all'],
      [familyId, 1, 'word', JSON.stringify({ word: 'Bread', translation: 'Pain', image: '🍞' }), 'easy', 'core', 'all'],
      [familyId, 1, 'word', JSON.stringify({ word: 'Salt', translation: 'Sel', image: '🧂' }), 'easy', 'core', 'all'],
      [familyId, 1, 'word', JSON.stringify({ word: 'Food', translation: 'Nourriture', image: '🍎' }), 'easy', 'core', 'all'],

      // --- NIVEAU 2 : LE SUCRÉ ---
      [familyId, 2, 'word', JSON.stringify({ word: 'Coffee', translation: 'Café', image: '☕' }), 'easy', 'core', 'all'],
      [familyId, 2, 'word', JSON.stringify({ word: 'Tea', translation: 'Thé', image: '🍵' }), 'easy', 'core', 'all'],
      [familyId, 2, 'word', JSON.stringify({ word: 'Sugar', translation: 'Sucre', image: '🍬' }), 'easy', 'core', 'all'],
      [familyId, 2, 'word', JSON.stringify({ word: 'Milk', translation: 'Lait', image: '🥛' }), 'easy', 'core', 'all'],
    ];

    // 3. NETTOYAGE DU CONTENU EXISTANT POUR CETTE FAMILLE
    await db.runAsync('DELETE FROM content WHERE family_id = ?', [familyId]);

    // 4. INSERTION
    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log(`[Migration 006] ✓ Vocabulaire injecté pour la famille ID ${familyId} (Salé/Sucré)`);
  },

  async (db: SQLite.SQLiteDatabase) => {
    const foodFam = await db.getFirstAsync<{id: number}>('SELECT id FROM families WHERE slug = "food_drinks"');
    if (foodFam) {
      await db.runAsync('DELETE FROM content WHERE family_id = ?', [foodFam.id]);
    }
  }
);