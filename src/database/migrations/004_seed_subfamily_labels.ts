import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  4,
  'seed_subfamily_labels',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. Gestion propre de l'ajout de colonne
    try {
      // On vérifie d'abord si la colonne existe pour éviter de throw inutilement
      const tableInfo = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(level_labels)`);
      const hasFamilyId = tableInfo.some(col => col.name === 'family_id');

      if (!hasFamilyId) {
        await db.execAsync(`ALTER TABLE level_labels ADD COLUMN family_id INTEGER;`);
        console.log('[Migration 004] Column family_id added to level_labels');
      }
    } catch (error) {
      // On log l'erreur au cas où ce serait autre chose qu'un "duplicate column"
      console.warn('[Migration 004] Schema update notice:', error);
    }

    // 2. Données de Seed pour les sous-familles
    const subfamilySeeds = [
      ['salutations', 1, 'enfant', 'Les premiers mots', 'hand-wave', 'Dire bonjour et au revoir'],
      ['salutations', 1, 'adulte', 'Social Basics', 'chat-outline', 'Common greetings and courtesy'],
      ['family', 1, 'enfant', 'Ma Maison', 'home', 'Les parents et frères/sœurs'],
      ['family', 1, 'adulte', 'Close Relatives', 'account-group', 'Immediate family members'],
      ['family', 2, 'enfant', 'Mes Cousins', 'account-multiple', 'La famille élargie'],
      ['family', 2, 'adulte', 'Extended Family', 'account-multiple-plus', 'Grandparents, cousins, etc.'],
      ['colors', 1, 'enfant', 'Arc-en-ciel', 'palette', 'Les couleurs de base'],
      ['colors', 1, 'adulte', 'Primary Colors', 'format-color-fill', 'Essential color vocabulary'],
      ['human', 1, 'enfant', 'Mon Visage', 'face-man', 'Yeux, nez, bouche...'],
      ['human', 1, 'adulte', 'The Face', 'face-recognition', 'Facial features and parts'],
      ['human', 2, 'enfant', 'Mon Corps', 'human-male-height', 'Bras, jambes, mains...'],
      ['human', 2, 'adulte', 'The Body', 'body-sculpting', 'Limbs and body structure']
    ];

    // Nettoyage avant insertion pour éviter les doublons si on relance
    await db.runAsync('DELETE FROM level_labels');

    for (const seed of subfamilySeeds) {
      const [famSlug, level, identity, title, icon, desc] = seed;
      
      const family = await db.getFirstAsync<{id: number}>(
        'SELECT id FROM families WHERE slug = ?', 
        [famSlug]
      );

      if (family) {
        await db.runAsync(
          `INSERT INTO level_labels (family_id, level_number, identity_id, display_title, icon_name, display_description) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [family.id, level, identity, title, icon, desc]
        );
      }
    }

    console.log('[Migration 004] ✓ Subfamily labels seeded successfully');
  },
  async (db: SQLite.SQLiteDatabase) => {
    // Le rollback ne supprime pas la colonne (SQLite ne supporte pas DROP COLUMN facilement avant v3.35+)
    // mais on nettoie les données insérées.
    await db.runAsync('DELETE FROM level_labels');
  }
);