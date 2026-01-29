/**
 * ============================================
 * MIGRATION 002: Seed Core Modules & Levels
 * Insère les modules et niveaux de base
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  2,
  'seed_core_modules',
  async (db: SQLite.SQLiteDatabase) => {
    // ========== MODULES ==========
    const modulesSeed = [
      // [slug, name, icon_name, description, order_index, is_core, target_audience]
      ['vocab', 'Vocabulaire', 'book-alphabet', 'Enrichis ton vocabulaire', 1, 1, 'all'],
      [
        'phrase_types',
        'Phrases',
        'format-quote-close',
        'Structure et syntaxe',
        2,
        1,
        'all',
      ],
      [
        'grammar',
        'Grammaire',
        'format-list-bulleted',
        'Maîtrise les règles',
        3,
        1,
        'all',
      ],
      ['reading', 'Lecture', 'text-box', 'Analyse de textes', 4, 1, 'all'],
      ['dialogues', 'Conversation', 'chat', 'Pratique dialogues', 5, 1, 'all'],
      ['word_games', 'Jeux', 'gamepad-variant', 'Exercices ludiques', 6, 1, 'all'],
      [
        'assessment',
        'Évaluation',
        'clipboard-check',
        'Teste tes connaissances',
        7,
        1,
        'all',
      ],
      ['connector', 'The Connector', 'connection', 'Syntax & articulation', 8, 0, 'lycee'],
      ['fastvocab', 'Fast Vocab', 'flash', '500 mots essentiels', 9, 0, 'adult'],
    ];

    for (const mod of modulesSeed) {
      await db.runAsync(
        `INSERT OR IGNORE INTO modules (slug, name, icon_name, description, order_index, is_core, target_audience)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        mod
      );
    }

    // ========== LEVELS ==========
    const levelsSeed = [
      // PRIMARY
      [
        101,
        1,
        'Foundations',
        '🌉',
        'Démarre ton apprentissage',
        'Niveau 1',
        'primary',
        'Foundations',
        'Démarre ton apprentissage',
        'bridge',
      ],
      [
        102,
        2,
        'Skills',
        '🔑',
        'Développe tes compétences',
        'Niveau 2',
        'primary',
        'Skills',
        'Développe tes compétences',
        'key',
      ],
      [
        103,
        3,
        'Expertise',
        '🔬',
        'Renforce ton niveau',
        'Niveau 3',
        'primary',
        'Expertise',
        'Renforce ton niveau',
        'microscope',
      ],
      [
        104,
        4,
        'Mastery',
        '🖋️',
        "Maîtrise l'anglais",
        'Niveau 4',
        'primary',
        'Mastery',
        "Maîtrise l'anglais",
        'pen',
      ],

      // COLLEGE
      [
        201,
        1,
        'Foundations',
        '🌉',
        'Démarre ton apprentissage',
        'Niveau 1',
        'college',
        'Foundations',
        'Démarre ton apprentissage',
        'bridge',
      ],
      [
        202,
        2,
        'Skills',
        '🔑',
        'Développe tes compétences',
        'Niveau 2',
        'college',
        'Skills',
        'Développe tes compétences',
        'key',
      ],
      [
        203,
        3,
        'Expertise',
        '🔬',
        'Renforce ton niveau',
        'Niveau 3',
        'college',
        'Expertise',
        'Renforce ton niveau',
        'microscope',
      ],
      [
        204,
        4,
        'Mastery',
        '🖋️',
        "Maîtrise l'anglais",
        'Niveau 4',
        'college',
        'Mastery',
        "Maîtrise l'anglais",
        'pen',
      ],

      // LYCEE
      [
        301,
        1,
        'Foundations',
        '🌉',
        'Démarre ton apprentissage',
        'Niveau 1',
        'lycee',
        'Foundations',
        'Démarre ton apprentissage',
        'bridge',
      ],
      [
        302,
        2,
        'Skills',
        '🔑',
        'Développe tes compétences',
        'Niveau 2',
        'lycee',
        'Skills',
        'Développe tes compétences',
        'key',
      ],
      [
        303,
        3,
        'Expertise',
        '🔬',
        'Renforce ton niveau',
        'Niveau 3',
        'lycee',
        'Expertise',
        'Renforce ton niveau',
        'microscope',
      ],
      [
        304,
        4,
        'Mastery',
        '🖋️',
        "Maîtrise l'anglais",
        'Niveau 4',
        'lycee',
        'Mastery',
        "Maîtrise l'anglais",
        'pen',
      ],

      // ADULT (7 niveaux spécifiques)
      [
        401,
        1,
        'Foundations',
        '🌉',
        'Les bases essentielles',
        'Niveau 1',
        'adult',
        'Foundations',
        'Les bases essentielles',
        'bridge',
      ],
      [
        402,
        2,
        'Skills',
        '🔑',
        'Pratique et quotidien',
        'Niveau 2',
        'adult',
        'Skills',
        'Pratique et quotidien',
        'key',
      ],
      [
        403,
        3,
        'Expertise',
        '🔬',
        'Approfondissement',
        'Niveau 3',
        'adult',
        'Expertise',
        'Approfondissement',
        'microscope',
      ],
      [
        404,
        4,
        'Mastery',
        '🖋️',
        'Maîtrise complète',
        'Niveau 4',
        'adult',
        'Mastery',
        'Maîtrise complète',
        'pen',
      ],
      [405, 5, 'Niveau 5', '🔥', 'Avancé', 'Niveau 5', 'adult', 'Niveau 5', 'Avancé', 'fire'],
      [
        406,
        6,
        'Niveau 6',
        '💎',
        'Expert',
        'Niveau 6',
        'adult',
        'Niveau 6',
        'Expert',
        'diamond',
      ],
      [
        407,
        7,
        'Real Life',
        '🔥',
        'Anglais réel & Slang',
        'SPECIAL',
        'adult',
        'Real Life',
        'Langage courant et argot',
        'rocket',
      ],
    ];

    for (const lvl of levelsSeed) {
      await db.runAsync(`INSERT OR IGNORE INTO levels VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, lvl);
    }

    console.log('[Migration 002] ✓ Modules and levels seeded');
  },
  // Rollback
  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync('DELETE FROM levels');
    await db.runAsync('DELETE FROM modules');
    console.log('[Migration 002] ✓ Modules and levels cleared');
  }
);
