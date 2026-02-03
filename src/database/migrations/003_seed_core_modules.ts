import type * as SQLite from 'expo-sqlite';
import { createMigration } from './runner';

export default createMigration(
  3,
  'seed_core_modules',
  async (db: SQLite.SQLiteDatabase) => {
    // 1. NETTOYAGE DES TABLES
    await db.runAsync('DELETE FROM module_availability');
    await db.runAsync('DELETE FROM levels');
    await db.runAsync('DELETE FROM modules');

    // 2. SEED DES MODULES
    const modulesSeed = [
      ['vocab', 'Vocabulaire', 'book-alphabet', 'Enrichis ton vocabulaire', 1, 1, 'all'],
      ['phrase_types', 'Phrases', 'format-quote-close', 'Structure et syntaxe', 2, 1, 'all'],
      ['grammar', 'Grammaire', 'format-list-bulleted', 'Maîtrise les règles', 3, 1, 'all'],
      ['reading', 'Lecture', 'text-box', 'Analyse de textes', 4, 1, 'all'],
      ['dialogues', 'Conversation', 'chat', 'Pratique dialogues', 5, 1, 'all'],
      ['word_games', 'Jeux', 'gamepad-variant', 'Exercices ludiques', 6, 1, 'all'],
      ['assessment', 'Évaluation', 'clipboard-check', 'Teste ton niveau', 7, 1, 'all'],
      ['connector', 'The Connector', 'connection', 'Syntax & articulation', 8, 0, 'lycee'],
      ['fastvocab', 'Fast Vocab', 'flash', '500 mots essentiels', 9, 0, 'adult']
    ];

    for (const mod of modulesSeed) {
      await db.runAsync(
        `INSERT INTO modules (slug, name, icon_name, description, order_index, is_core, target_audience) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        mod
      );
    }

    // 3. SEED DES NIVEAUX
    const audiences = ['primary', 'college', 'lycee', 'adult'];

    // ✅ Définition des noms de niveaux significatifs
    const levelNames = [
      { title: 'Les Bases', description: 'Fondamentaux essentiels', badge: '1' },
      { title: "L'Essentiel", description: 'Connaissances intermédiaires', badge: '2' },
      { title: 'Avancé', description: 'Maîtrise approfondie', badge: '3' },
      { title: 'Expert', description: 'Niveau supérieur', badge: '4' },
    ];

    // ✅ CORRECTION : Ajout du type any[][] pour que TS accepte le push
    const levelsSeed: any[][] = [];

    // On génère 4 niveaux pour chaque audience avec des noms significatifs
    audiences.forEach((aud, index) => {
      const baseId = (index + 1) * 100;
      for (let l = 1; l <= 4; l++) {
        const levelInfo = levelNames[l - 1];
        levelsSeed.push([
          baseId + l,
          l,
          levelInfo.title,
          'bridge',
          levelInfo.description,
          levelInfo.badge,
          aud
        ]);
      }
    });

    for (const lvl of levelsSeed) {
      await db.runAsync(
        `INSERT INTO levels (id, level, title, icon, description, badge, target_audience) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        lvl
      );
    }

    // 4. ✅ MODULE AVAILABILITY
    const coreModules = ['vocab', 'phrase_types', 'grammar', 'reading', 'dialogues', 'word_games', 'assessment'];
    
    for (const aud of audiences) {
      for (let l = 1; l <= 4; l++) {
        for (const slug of coreModules) {
          await db.runAsync(
            `INSERT INTO module_availability (module_slug, identity_id, level_number, is_available) 
             VALUES (?, ?, ?, 1)`,
            [slug, aud, l]
          );
        }
      }
    }

    // Autorisation spécifique pour le module Lycée
    await db.runAsync(
      `INSERT INTO module_availability (module_slug, identity_id, level_number, is_available) 
       VALUES (?, ?, ?, 1)`,
      ['connector', 'lycee', 1]
    );

    console.log('[Migration 003] ✓ Modules, Levels & Availability Synchronized');
  },

  async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync('DELETE FROM module_availability');
    await db.runAsync('DELETE FROM levels');
    await db.runAsync('DELETE FROM modules');
  }
);