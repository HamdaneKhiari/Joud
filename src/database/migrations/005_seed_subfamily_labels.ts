/**
 * ============================================
 * MIGRATION 005: Seed Subfamily Labels
 * Gère le split "Salé/Sucré" et autres sous-catégories
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  5,
  'seed_subfamily_labels',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. DÉFINITION DES SOUS-FAMILLES
    // Format: [slug_famille, niveau, identity, titre, icone, description]
    const subfamilySeeds = [
      // Basics
      ['salutations', 1, 'adult', 'Social Basics', 'chat-outline', 'Greetings & Socializing'],
      
      // FOOD & DRINKS - C'est ici que tes deux boutons apparaissent
      ['food_drinks', 1, 'adult', 'Le Salé', 'silverware-fork-knife', 'Pain, Eau, Sel, etc.'],
      ['food_drinks', 2, 'adult', 'Le Sucré', 'cup-water', 'Café, Sucre, Thé, etc.'],
      
      // Family
      ['family', 1, 'adult', 'Close Relatives', 'account-group', 'Parents & Siblings'],
      ['family', 2, 'adult', 'Extended Family', 'account-multiple-plus', 'Cousins, Aunts, Uncles'],
    ];

    // 2. NETTOYAGE CIBLÉ
    // On ne supprime que les labels liés à des familles pour ne pas casser le Whitelabel du 002
    await db.runAsync('DELETE FROM level_labels WHERE family_id IS NOT NULL');

    // 3. INSERTION DYNAMIQUE
    for (const [famSlug, level, identity, title, icon, desc] of subfamilySeeds) {
      // On récupère l'ID de la famille par son slug pour garantir le lien
      const family = await db.getFirstAsync<{id: number}>('SELECT id FROM families WHERE slug = ?', [famSlug]);
      
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
          [
            family.id, 
            level, 
            identity, 
            title, 
            icon, 
            desc, 
            `NIVEAU ${level}` // Badge auto-généré
          ]
        );
      } else {
        console.warn(`[Migration 005] Attention: Famille introuvable pour le slug "${famSlug}"`);
      }
    }

    console.log('[Migration 005] ✓ Subfamily labels (Salé/Sucré) seeded successfully');
  },

  async (db: SQLite.SQLiteDatabase) => {
    // Rollback: On nettoie uniquement ce qu'on a inséré
    await db.runAsync('DELETE FROM level_labels WHERE family_id IS NOT NULL');
    console.log('[Migration 005] ✓ Subfamily labels cleared');
  }
);