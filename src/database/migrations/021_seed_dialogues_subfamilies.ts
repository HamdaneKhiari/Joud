/**
 * ============================================
 * MIGRATION 021: Seed Dialogues Subfamilies
 * Insère les sous-familles pour le module Dialogues
 * Note: Les familles dialogues doivent être créées d'abord dans 004_seed_families.ts
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  21,
  'seed_dialogues_subfamilies',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. DÉFINITION DES SOUS-FAMILLES DIALOGUES
    // Format: [slug_famille, id_sous_famille, identity, titre, icone, description]
    const dialoguesSubfamilySeeds = [
      // --- At Restaurant Family Subfamilies ---
      ['at_restaurant', 1, 'adult', 'Ordering', 'silverware', 'Commander un repas'],
      ['at_restaurant', 2, 'adult', 'Complaining', 'alert-circle', 'Faire une réclamation'],
      ['at_restaurant', 3, 'adult', 'Paying', 'cash', 'Demander et payer l\'addition'],

      ['at_restaurant', 1, 'lycee', 'Ordering', 'silverware', 'Commander'],
      ['at_restaurant', 2, 'lycee', 'Issues', 'alert-circle', 'Problèmes'],
      ['at_restaurant', 3, 'lycee', 'Paying', 'cash', 'Payer'],

      ['at_restaurant', 1, 'college', 'Ordering', 'silverware', 'Commander'],
      ['at_restaurant', 2, 'college', 'Talking', 'chat', 'Discuter'],
      ['at_restaurant', 3, 'college', 'Paying', 'cash', 'Payer'],

      ['at_restaurant', 1, 'primary', 'Food', 'food', 'La nourriture'],
      ['at_restaurant', 2, 'primary', 'Drinks', 'cup', 'Les boissons'],
      ['at_restaurant', 3, 'primary', 'Thank You', 'heart', 'Dire merci'],

      // --- Shopping Family Subfamilies ---
      ['shopping', 1, 'adult', 'Asking for Help', 'help-circle', 'Demander de l\'aide'],
      ['shopping', 2, 'adult', 'Trying On', 'hanger', 'Essayer des vêtements'],
      ['shopping', 3, 'adult', 'Paying', 'credit-card', 'Payer ses achats'],

      ['shopping', 1, 'lycee', 'Looking Around', 'eye', 'Regarder'],
      ['shopping', 2, 'lycee', 'Asking', 'help-circle', 'Demander'],
      ['shopping', 3, 'lycee', 'Buying', 'credit-card', 'Acheter'],

      ['shopping', 1, 'college', 'Looking', 'eye', 'Regarder'],
      ['shopping', 2, 'college', 'Choosing', 'hand-pointing-up', 'Choisir'],
      ['shopping', 3, 'college', 'Buying', 'cart', 'Acheter'],

      ['shopping', 1, 'primary', 'In the Store', 'store', 'Au magasin'],
      ['shopping', 2, 'primary', 'I Want', 'hand-pointing-right', 'Je veux'],
      ['shopping', 3, 'primary', 'Paying', 'cash-multiple', 'Payer'],

      // --- Social Conversations Family Subfamilies ---
      ['social_conversations', 1, 'adult', 'Meeting People', 'account-multiple', 'Faire connaissance'],
      ['social_conversations', 2, 'adult', 'Small Talk', 'chat', 'Discussion informelle'],
      ['social_conversations', 3, 'adult', 'Making Plans', 'calendar', 'Organiser une sortie'],

      ['social_conversations', 1, 'lycee', 'Meeting People', 'account-multiple', 'Rencontrer'],
      ['social_conversations', 2, 'lycee', 'Chatting', 'chat', 'Discuter'],
      ['social_conversations', 3, 'lycee', 'Plans', 'calendar', 'Faire des plans'],

      ['social_conversations', 1, 'college', 'New Friends', 'account-multiple', 'Nouveaux amis'],
      ['social_conversations', 2, 'college', 'Talking', 'chat-processing', 'Parler'],
      ['social_conversations', 3, 'college', 'Activities', 'basketball', 'Activités'],

      ['social_conversations', 1, 'primary', 'Hello!', 'hand-wave', 'Dire bonjour'],
      ['social_conversations', 2, 'primary', 'Playing', 'gamepad-variant', 'Jouer ensemble'],
      ['social_conversations', 3, 'primary', 'Friends', 'account-heart', 'Les amis'],
    ];

    // 2. INSERTION
    for (const [famSlug, subId, identity, title, icon, desc] of dialoguesSubfamilySeeds) {
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
        console.warn(`[Migration 021] Family '${famSlug}' not found, skipping subfamilies`);
      }
    }

    console.log('[Migration 021] ✓ Dialogues subfamilies seeded');
  },

  async (db: SQLite.SQLiteDatabase) => {
    // Rollback: Supprimer les sous-familles de dialogues
    const dialogueFamilies = ['at_restaurant', 'shopping', 'social_conversations'];

    for (const famSlug of dialogueFamilies) {
      const family = await db.getFirstAsync<{id: number}>(
        'SELECT id FROM families WHERE slug = ?',
        [famSlug]
      );

      if (family) {
        await db.runAsync(
          'DELETE FROM level_labels WHERE family_id = ?',
          [family.id]
        );
      }
    }

    console.log('[Migration 021] ✓ Dialogues subfamilies cleared');
  }
);
