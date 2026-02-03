/**
 * ============================================
 * MIGRATION 020: Seed Grammar Subfamilies
 * Insère les sous-familles pour le module Grammar
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  20,
  'seed_grammar_subfamilies',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. DÉFINITION DES SOUS-FAMILLES GRAMMAR
    // Format: [slug_famille, id_sous_famille, identity, titre, icone, description]
    const grammarSubfamilySeeds = [
      // --- Present Tense Family Subfamilies ---
      ['present', 1, 'adult', 'Simple Present', 'clock', 'Actions habituelles et vérités générales'],
      ['present', 2, 'adult', 'Present Continuous', 'clock-fast', 'Actions en cours maintenant'],
      ['present', 3, 'adult', 'Present Perfect', 'clock-check', 'Actions du passé liées au présent'],

      ['present', 1, 'lycee', 'Simple Present', 'clock', 'Le présent simple'],
      ['present', 2, 'lycee', 'Present Continuous', 'clock-fast', 'Le présent continu'],
      ['present', 3, 'lycee', 'Present Perfect', 'clock-check', 'Le present perfect'],

      ['present', 1, 'college', 'Simple Present', 'clock', 'Présent simple'],
      ['present', 2, 'college', 'Present Continuous', 'clock-fast', 'En train de faire'],
      ['present', 3, 'college', 'Present Perfect', 'clock-check', 'Présent parfait'],

      ['present', 1, 'primary', 'I am / I do', 'account', 'Être et faire'],
      ['present', 2, 'primary', 'I am doing', 'run', 'En train de faire'],
      ['present', 3, 'primary', 'I have done', 'check', 'J\'ai fait'],
    ];

    // 2. INSERTION
    for (const [famSlug, subId, identity, title, icon, desc] of grammarSubfamilySeeds) {
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
        console.warn(`[Migration 020] Family '${famSlug}' not found, skipping subfamilies`);
      }
    }

    console.log('[Migration 020] ✓ Grammar subfamilies seeded');
  },

  async (db: SQLite.SQLiteDatabase) => {
    // Rollback: Supprimer les sous-familles de grammaire
    const presentFamily = await db.getFirstAsync<{id: number}>(
      'SELECT id FROM families WHERE slug = ?',
      ['present']
    );

    if (presentFamily) {
      await db.runAsync(
        'DELETE FROM level_labels WHERE family_id = ?',
        [presentFamily.id]
      );
    }

    console.log('[Migration 020] ✓ Grammar subfamilies cleared');
  }
);
