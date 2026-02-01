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
  // Pour les adultes
  ['food_drinks', 1, 'adult', 'Le Salé', 'silverware-fork-knife', 'Pain, Eau, Sel...'],
  ['food_drinks', 2, 'adult', 'Le Sucré', 'cup-water', 'Café, Sucre, Thé...'],
  
  // AJOUTE CECI pour le mode Lycée
  ['food_drinks', 1, 'lycee', 'Le Salé', 'silverware-fork-knife', 'Vocabulaire salé'],
  ['food_drinks', 2, 'lycee', 'Le Sucré', 'cup-water', 'Vocabulaire sucré'],
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