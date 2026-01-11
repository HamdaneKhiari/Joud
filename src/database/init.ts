// src/database/init.ts
import * as SQLite from 'expo-sqlite';

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync('janacore.db');

    // Activation des clés étrangères
    await db.execAsync(`PRAGMA foreign_keys = ON;`);

    // Création des tables en un seul bloc (plus rapide)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        is_core INTEGER DEFAULT 1,
        target_audience TEXT DEFAULT 'all',
        icon TEXT, order_index INTEGER, description TEXT
      );

      CREATE TABLE IF NOT EXISTS families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        icon TEXT, emoji TEXT, description TEXT, order_index INTEGER,
        FOREIGN KEY (module_id) REFERENCES modules(id)
      );

      CREATE TABLE IF NOT EXISTS content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        content_type TEXT NOT NULL,
        data TEXT NOT NULL,
        difficulty TEXT, tags TEXT,
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        last_accessed TEXT,
        FOREIGN KEY (family_id) REFERENCES families(id)
      );

      CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level INTEGER NOT NULL,
        title TEXT NOT NULL,
        icon TEXT NOT NULL,
        description TEXT NOT NULL,
        badge TEXT NOT NULL,
        target_audience TEXT DEFAULT 'all',
        difficulty TEXT
      );
    `);

    // Insertion des modules de base
    const modulesSeed = [
      [1, 'Vocabulary', 1, 'all', 'book', 1, 'Enrichis ton vocabulaire'],
      [2, 'Grammar', 1, 'all', 'lightbulb', 2, 'Maîtrise les règles'],
      [3, 'Sentences', 1, 'all', 'message-square', 3, 'Structure et syntaxe'],
      [4, 'Reading', 1, 'all', 'file-text', 4, 'Analyse de textes'],
      [5, 'Conversation', 1, 'all', 'message-circle', 5, 'Pratique dialogues'],
      [6, 'Games', 1, 'all', 'gamepad', 6, 'Exercices ludiques'],
      [7, 'Assessment', 1, 'all', 'check-circle', 7, 'Bilan'],
      [8, 'FastVocab', 0, 'adult', 'zap', 8, '500 mots essentiels'],
      [9, 'Connector', 0, 'lycee', 'link', 9, 'Mots de liaison']
    ];

    for (const mod of modulesSeed) {
      await db.runAsync(`INSERT OR IGNORE INTO modules VALUES (?, ?, ?, ?, ?, ?, ?)`, mod);
    }

    // Insertion des niveaux pour College
    const levelsSeed = [
      [1, 1, 'Les Bases', '🌱', 'Démarre ton apprentissage', 'Niveau 1', 'college', 'easy'],
      [2, 2, "L'Essentiel", '🎯', 'Développe tes compétences', 'Niveau 2', 'college', 'medium'],
      [3, 3, "L'Avancé", '⚡', 'Renforce ton niveau', 'Niveau 3', 'college', 'medium'],
      [4, 4, "L'Expert", '🏆', "Maîtrise l'anglais", 'Niveau 4', 'college', 'hard']
    ];

    for (const lvl of levelsSeed) {
      await db.runAsync(`INSERT OR IGNORE INTO levels VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, lvl);
    }

    console.log('✅ JanaCore Engine Initialized');
    return db;
  } catch (error) {
    console.error('❌ Init Database Error:', error);
    throw error;
  }
};