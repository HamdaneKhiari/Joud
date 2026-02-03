/**
 * ============================================
 * MIGRATION 019: Seed Phrases Subfamilies
 * Insère les sous-familles pour le module Phrases
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  19,
  'seed_phrases_subfamilies',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. DÉFINITION DES SOUS-FAMILLES PHRASES
    // Format: [slug_famille, id_sous_famille, identity, titre, icone, description]
    const phrasesSubfamilySeeds = [
      // --- Daily Life Family Subfamilies ---
      ['daily_life', 1, 'adult', 'Morning Routine', 'weather-sunny', 'Se réveiller, petit-déjeuner, se préparer'],
      ['daily_life', 2, 'adult', 'At Work', 'briefcase', 'Réunions, pause déjeuner, tâches'],
      ['daily_life', 3, 'adult', 'Shopping', 'cart', 'Au supermarché, achats'],
      ['daily_life', 4, 'adult', 'Transportation', 'bus', 'Transports en commun, voiture'],
      ['daily_life', 5, 'adult', 'Evening', 'weather-night', 'Dîner, télévision, coucher'],

      ['daily_life', 1, 'lycee', 'Morning Routine', 'weather-sunny', 'Routine matinale'],
      ['daily_life', 2, 'lycee', 'At School', 'school', 'À l\'école, cours'],
      ['daily_life', 3, 'lycee', 'Shopping', 'cart', 'Faire les courses'],
      ['daily_life', 4, 'lycee', 'Transportation', 'bus', 'Se déplacer'],
      ['daily_life', 5, 'lycee', 'Evening', 'weather-night', 'Soirée à la maison'],

      ['daily_life', 1, 'college', 'Morning Routine', 'weather-sunny', 'Le matin'],
      ['daily_life', 2, 'college', 'At School', 'school', 'Au collège'],
      ['daily_life', 3, 'college', 'Free Time', 'gamepad-variant', 'Temps libre'],
      ['daily_life', 4, 'college', 'With Friends', 'account-multiple', 'Avec les amis'],
      ['daily_life', 5, 'college', 'Evening', 'weather-night', 'Le soir'],

      ['daily_life', 1, 'primary', 'Morning', 'weather-sunny', 'Le matin'],
      ['daily_life', 2, 'primary', 'At School', 'school', 'À l\'école'],
      ['daily_life', 3, 'primary', 'Playing', 'basketball', 'Jouer'],
      ['daily_life', 4, 'primary', 'Eating', 'food', 'Manger'],
      ['daily_life', 5, 'primary', 'Bedtime', 'sleep', 'Se coucher'],
    ];

    // 2. INSERTION
    for (const [famSlug, subId, identity, title, icon, desc] of phrasesSubfamilySeeds) {
      const family = await db.getFirstAsync<{id: number}>(
        'SELECT id FROM families WHERE slug = ?',
        [famSlug]
      );

      if (family) {
        await db.runAsync(
          `INSERT INTO level_labels (
            family_id,
            level_number,
            identity_id,
            display_title,
            icon_name,
            display_description,
            badge_text
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [family.id, subId, identity, title, icon, desc, '']
        );
      } else {
        console.warn(`[Migration 019] Family '${famSlug}' not found, skipping subfamilies`);
      }
    }

    console.log('[Migration 019] ✓ Phrases subfamilies seeded');
  },

  async (db: SQLite.SQLiteDatabase) => {
    // Rollback: Supprimer les sous-familles de phrases
    const dailyLifeFamily = await db.getFirstAsync<{id: number}>(
      'SELECT id FROM families WHERE slug = ?',
      ['daily_life']
    );

    if (dailyLifeFamily) {
      await db.runAsync(
        'DELETE FROM level_labels WHERE family_id = ?',
        [dailyLifeFamily.id]
      );
    }

    console.log('[Migration 019] ✓ Phrases subfamilies cleared');
  }
);
