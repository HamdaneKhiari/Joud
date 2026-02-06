/**
 * ============================================
 * MIGRATION 029: Core Vocabulary Subfamilies
 * Crée les sous-familles pour organiser les 800 mots Core
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  29,
  'create_core_vocab_subfamilies',
  async (db: SQLite.SQLiteDatabase) => {
    // Récupérer l'ID de la famille "salutations" (Basics)
    const basicsFam = await db.getFirstAsync<{id: number}>('SELECT id FROM families WHERE slug = "salutations"');
    if (!basicsFam) {
      console.error('[Migration 029] Famille "salutations" introuvable !');
      return;
    }

    const familyId = basicsFam.id;

    // ============================================
    // DÉFINITION DES SOUS-FAMILLES (Subfamilies)
    // ============================================

    // Format: [subfamily_id, title, icon, description]
    const subfamiliesBase = [
      [1, 'Pronouns', 'account-circle', 'Personal pronouns and possessives'],
      [2, 'Essential Verbs', 'run-fast', 'The most common action verbs'],
      [3, 'Prepositions', 'map-marker', 'Words showing position and direction'],
      [4, 'Questions', 'help-circle', 'Who, what, where, when, why, how'],
      [5, 'Adjectives', 'palette', 'Describing people and things'],
      [6, 'Time Words', 'clock', 'Now, today, always, never...'],
      [7, 'Connectors', 'link-variant', 'And, but, or, because, so...'],
      [8, 'People & Places', 'home', 'Man, woman, child, school, house...'],
      [9, 'Articles', 'text-box', 'A, an, the, this, that'],
      [10, 'Responses', 'comment-check', 'Yes, no, please, thanks...'],
    ];

    // Identités valides (doivent exister dans la table branding)
    const identities = ['primary', 'college', 'lycee', 'adult'];

    // Supprimer les anciennes subfamilies pour "salutations"
    await db.runAsync('DELETE FROM level_labels WHERE family_id = ?', [familyId]);

    // Insérer les subfamilies pour chaque identité
    for (const identity of identities) {
      for (const [subId, title, icon, desc] of subfamiliesBase) {
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
          [familyId, subId, identity, title, icon, desc, '']
        );
      }
    }

    console.log('✅ Migration 029: 10 sous-familles créées pour Core Vocabulary');

    // ============================================
    // RÉORGANISATION DES 100 MOTS PAR SUBFAMILY
    // ============================================

    // Mapping: word -> subfamily_id
    const wordToSubfamily: Record<string, number> = {
      // Subfamily 1: Pronouns & Determiners (20 mots)
      'I': 1, 'YOU': 1, 'HE': 1, 'SHE': 1, 'IT': 1, 'WE': 1, 'THEY': 1,
      'MY': 1, 'YOUR': 1, 'HIS': 1, 'HER': 1, 'OUR': 1, 'THEIR': 1,

      // Subfamily 2: Essential Verbs (27 mots)
      'BE': 2, 'HAVE': 2, 'DO': 2, 'GO': 2, 'COME': 2, 'GET': 2, 'MAKE': 2,
      'TAKE': 2, 'PUT': 2, 'USE': 2, 'WANT': 2, 'LIKE': 2, 'CAN': 2,
      'EAT': 2, 'DRINK': 2, 'SLEEP': 2, 'SAY': 2, 'TELL': 2, 'KNOW': 2,
      'THINK': 2, 'LOOK': 2, 'SEE': 2, 'LISTEN': 2, 'HEAR': 2, 'WORK': 2,

      // Subfamily 3: Prepositions (8 mots)
      'IN': 3, 'ON': 3, 'AT': 3, 'UNDER': 3, 'TO': 3, 'FROM': 3,
      'WITH': 3, 'WITHOUT': 3, 'FOR': 3,

      // Subfamily 4: Question Words (6 mots)
      'WHO': 4, 'WHAT': 4, 'WHERE': 4, 'WHEN': 4, 'WHY': 4, 'HOW': 4,

      // Subfamily 5: Adjectives (10 mots)
      'BIG': 5, 'SMALL': 5, 'GOOD': 5, 'BAD': 5, 'HAPPY': 5, 'SAD': 5,
      'HOT': 5, 'COLD': 5, 'HUNGRY': 5, 'THIRSTY': 5,

      // Subfamily 6: Time & Frequency (10 mots)
      'NOW': 6, 'TODAY': 6, 'TOMORROW': 6, 'YESTERDAY': 6,
      'ALWAYS': 6, 'NEVER': 6, 'SOMETIMES': 6,
      'HERE': 6, 'THERE': 6,

      // Subfamily 7: Conjunctions (5 mots)
      'AND': 7, 'BUT': 7, 'OR': 7, 'BECAUSE': 7, 'SO': 7,

      // Subfamily 8: Common Nouns (10 mots)
      'MAN': 8, 'WOMAN': 8, 'CHILD': 8, 'FRIEND': 8, 'SCHOOL': 8,
      'HOUSE': 8, 'WATER': 8, 'FOOD': 8, 'TIME': 8, 'NAME': 8,

      // Subfamily 9: Articles & Demonstratives (4 mots)
      'A / AN': 9, 'THE': 9, 'THIS': 9, 'THAT': 9,

      // Subfamily 10: Basic Responses (7 mots)
      'YES': 10, 'NO': 10, 'NOT': 10, 'ALL': 10, 'SOME': 10, 'EVERY': 10,
      'HELLO': 10, 'THANKS': 10, 'PLEASE': 10,
    };

    // Mettre à jour le level (subfamily_id) de chaque mot
    for (const [word, subfamilyId] of Object.entries(wordToSubfamily)) {
      await db.runAsync(
        `UPDATE content
         SET level = ?
         WHERE family_id = ?
         AND tags = 'core100'
         AND json_extract(data, '$.word') = ?`,
        [subfamilyId, familyId, word]
      );
    }

    console.log('✅ Migration 029: 100 mots réorganisés par sous-famille');
  },

  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    const basicsFam = await db.getFirstAsync<{id: number}>('SELECT id FROM families WHERE slug = "salutations"');
    if (basicsFam) {
      // Remettre tous les mots à level = 1
      await db.runAsync(
        `UPDATE content SET level = 1 WHERE family_id = ? AND tags = 'core100'`,
        [basicsFam.id]
      );

      // Supprimer les subfamilies
      await db.runAsync('DELETE FROM level_labels WHERE family_id = ?', [basicsFam.id]);

      console.log('✅ Migration 029 rollback: Subfamilies supprimées, mots remis à level 1');
    }
  }
);
