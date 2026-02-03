/**
 * ============================================
 * MIGRATION 022: Seed Reading Subfamilies
 * Insère les sous-familles pour le module Reading
 * Note: Les familles reading doivent être créées d'abord dans 004_seed_families.ts
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  22,
  'seed_reading_subfamilies',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. DÉFINITION DES SOUS-FAMILLES READING
    // Format: [slug_famille, id_sous_famille, identity, titre, icone, description]
    const readingSubfamilySeeds = [
      // --- Short Stories Family Subfamilies ---
      ['short_stories', 1, 'adult', 'Adventure', 'compass', 'Histoires d\'aventure'],
      ['short_stories', 2, 'adult', 'Family', 'home-heart', 'Histoires de famille'],
      ['short_stories', 3, 'adult', 'Friendship', 'account-heart', 'Histoires d\'amitié'],

      ['short_stories', 1, 'lycee', 'Adventure', 'compass', 'Aventures'],
      ['short_stories', 2, 'lycee', 'Daily Life', 'home', 'Vie quotidienne'],
      ['short_stories', 3, 'lycee', 'Emotions', 'emoticon', 'Émotions'],

      ['short_stories', 1, 'college', 'Adventure', 'treasure-chest', 'Aventure'],
      ['short_stories', 2, 'college', 'School', 'school', 'École'],
      ['short_stories', 3, 'college', 'Friends', 'account-group', 'Amis'],

      ['short_stories', 1, 'primary', 'Animals', 'paw', 'Les animaux'],
      ['short_stories', 2, 'primary', 'Family', 'home', 'La famille'],
      ['short_stories', 3, 'primary', 'Fun', 'star', 'Histoires drôles'],

      // --- Articles Family Subfamilies ---
      ['articles', 1, 'adult', 'News', 'newspaper', 'Actualités du monde'],
      ['articles', 2, 'adult', 'Science', 'flask', 'Découvertes scientifiques'],
      ['articles', 3, 'adult', 'Culture', 'theater', 'Arts et culture'],

      ['articles', 1, 'lycee', 'Current Events', 'newspaper', 'Actualité'],
      ['articles', 2, 'lycee', 'Technology', 'cellphone', 'Technologie'],
      ['articles', 3, 'lycee', 'Sports', 'soccer', 'Sports'],

      ['articles', 1, 'college', 'News', 'earth', 'Les nouvelles'],
      ['articles', 2, 'college', 'Nature', 'tree', 'La nature'],
      ['articles', 3, 'college', 'Technology', 'robot', 'Technologie'],

      ['articles', 1, 'primary', 'Nature', 'flower', 'La nature'],
      ['articles', 2, 'primary', 'Animals', 'dog', 'Les animaux'],
      ['articles', 3, 'primary', 'Space', 'rocket', 'L\'espace'],

      // --- Professional Family Subfamilies ---
      ['professional', 1, 'adult', 'Emails', 'email', 'Emails professionnels'],
      ['professional', 2, 'adult', 'Reports', 'file-document', 'Rapports d\'activité'],
      ['professional', 3, 'adult', 'Letters', 'text-box', 'Courriers formels'],

      ['professional', 1, 'lycee', 'Emails', 'email', 'Emails'],
      ['professional', 2, 'lycee', 'Letters', 'text-box', 'Lettres'],
      ['professional', 3, 'lycee', 'CV', 'file-account', 'CV et lettres de motivation'],

      ['professional', 1, 'college', 'Simple Emails', 'email', 'Emails simples'],
      ['professional', 2, 'college', 'Messages', 'message', 'Messages'],
      ['professional', 3, 'college', 'Notes', 'note', 'Notes'],

      ['professional', 1, 'primary', 'Messages', 'message-text', 'Messages'],
      ['professional', 2, 'primary', 'Cards', 'card-text', 'Cartes'],
      ['professional', 3, 'primary', 'Notes', 'pencil', 'Petites notes'],
    ];

    // 2. INSERTION
    for (const [famSlug, subId, identity, title, icon, desc] of readingSubfamilySeeds) {
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
        console.warn(`[Migration 022] Family '${famSlug}' not found, skipping subfamilies`);
      }
    }

    console.log('[Migration 022] ✓ Reading subfamilies seeded');
  },

  async (db: SQLite.SQLiteDatabase) => {
    // Rollback: Supprimer les sous-familles de reading
    const readingFamilies = ['short_stories', 'articles', 'professional'];

    for (const famSlug of readingFamilies) {
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

    console.log('[Migration 022] ✓ Reading subfamilies cleared');
  }
);
