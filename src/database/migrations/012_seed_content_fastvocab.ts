/**
 * ============================================
 * MIGRATION 011: Seed Fast Vocabulary Content
 * Contenu Fast Vocabulary pour ADULTES uniquement
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  12,
  'seed_content_fastvocab',
  async (db: SQLite.SQLiteDatabase) => {
    // Récupérer les IDs des familles Fast Vocab
    const business = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'business_essentials'`
    );
    const travel = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'travel_essentials'`
    );
    const tech = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE slug = 'tech_essentials'`
    );

    const businessId = business?.id || 1; // NOSONAR — utilisé dans contentSeed ci-dessous
    const travelId = travel?.id || 2; // NOSONAR — utilisé dans contentSeed ci-dessous
    const techId = tech?.id || 3; // NOSONAR — utilisé dans contentSeed ci-dessous

    // ⬇️⬇️⬇️ AJOUTE TON CONTENU ICI ⬇️⬇️⬇️
    const contentSeed: any[] = [
      // Structure : [family_id, level, content_type, JSON.stringify({...}), difficulty, tags, target_audience]

      // ===== EXEMPLE BUSINESS =====
      // [
      //   businessId,
      //   5,  // Niveau 5 (adulte)
      //   'word',
      //   JSON.stringify({
      //     word: 'Meeting',
      //     translation: 'Réunion',
      //     example: null,  // Pas d'exemple en Fast Mode
      //     image: '👥',
      //     audio: null
      //   }),
      //   'easy',
      //   'business,work',
      //   'adult'  // IMPORTANT : target_audience = 'adult'
      // ],

      // ===== BUSINESS ESSENTIALS (50 mots) =====
      // Ajoute ici tes 50 mots business pour adultes niveau 5-7

      // ===== TRAVEL ESSENTIALS (50 mots) =====
      // Ajoute ici tes 50 mots voyage pour adultes niveau 5-7

      // ===== TECH ESSENTIALS (50 mots) =====
      // Ajoute ici tes 50 mots tech pour adultes niveau 5-7
    ];

    // Nettoyage avant insertion
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "fastvocab")'
    );

    // Insertion du contenu
    for (const item of contentSeed) {
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }

    console.log(`[Migration 011] ✓ Fast Vocabulary content seeded (${contentSeed.length} items)`);
  },
  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync(
      'DELETE FROM content WHERE family_id IN (SELECT id FROM families WHERE module_slug = "fastvocab")'
    );
    console.log('[Migration 011] ✓ Fast Vocabulary content cleared');
  }
);
