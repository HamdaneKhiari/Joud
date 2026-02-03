import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  5,
  'seed_subfamily_labels',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. DÉFINITION DES SOUS-FAMILLES (Pure Subfamily, pas de Levels)
    const subfamilySeeds = [
      // Format: [slug_famille, id_sous_famille, identity, titre, icone, description]
      ['food_drinks', 1, 'adult', 'Le Salé', 'silverware-fork-knife', 'Pain, Eau, Sel...'],
      ['food_drinks', 2, 'adult', 'Le Sucré', 'cup-water', 'Café, Sucre, Thé...'],
      
      ['food_drinks', 1, 'lycee', 'Le Salé', 'silverware-fork-knife', 'Vocabulaire salé'],
      ['food_drinks', 2, 'lycee', 'Le Sucré', 'cup-water', 'Vocabulaire sucré'],
    ];

    // 2. NETTOYAGE (On ne touche qu'aux labels rattachés à une famille)
    await db.runAsync('DELETE FROM level_labels WHERE family_id IS NOT NULL');

    // 3. INSERTION
    for (const [famSlug, subId, identity, title, icon, desc] of subfamilySeeds) {
      const family = await db.getFirstAsync<{id: number}>('SELECT id FROM families WHERE slug = ?', [famSlug]);
      
      if (family) {
        await db.runAsync(
          `INSERT INTO level_labels (
            family_id, 
            level_number, -- On utilise la colonne technique pour stocker l'ID de sous-famille
            identity_id, 
            display_title, 
            icon_name, 
            display_description, 
            badge_text -- On met une chaîne vide pour respecter le NOT NULL
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [family.id, subId, identity, title, icon, desc, '']
        );
      }
    }
  },
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync('DELETE FROM level_labels WHERE family_id IS NOT NULL');
  }
);