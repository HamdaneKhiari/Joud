// src/database/init.ts
import * as SQLite from 'expo-sqlite';

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync('janacore.db');

    // Activation des contraintes d'intégrité
    await db.execAsync(`PRAGMA foreign_keys = ON;`);

    // 1. CRÉATION DES TABLES (Structure propre sans 'difficulty')
    await db.execAsync(`
      DROP TABLE IF EXISTS levels; -- On drop pour être sûr de repartir sur 7 colonnes
      
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        is_core INTEGER DEFAULT 1,
        target_audience TEXT DEFAULT 'all',
        icon TEXT, 
        order_index INTEGER, 
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY,
        level INTEGER NOT NULL,
        title TEXT NOT NULL,
        icon TEXT NOT NULL,
        description TEXT NOT NULL,
        badge TEXT NOT NULL,
        target_audience TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        icon TEXT, 
        emoji TEXT, 
        description TEXT, 
        order_index INTEGER,
        FOREIGN KEY (module_id) REFERENCES modules(id)
      );

      CREATE TABLE IF NOT EXISTS content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_id INTEGER NOT NULL,
        level INTEGER NOT NULL,
        content_type TEXT NOT NULL,
        data TEXT NOT NULL,
        difficulty TEXT,
        tags TEXT,
        FOREIGN KEY (family_id) REFERENCES families(id)
      );
    `);

    // 2. SEED DES MODULES (8 colonnes : id, name, slug, is_core, target_audience, icon, order_index, description)
    const modulesSeed = [
      [1, 'Vocabulary', 'vocab', 1, 'all', 'book', 1, 'Enrichis ton vocabulaire'],
      [2, 'Grammar', 'grammar', 1, 'all', 'lightbulb', 2, 'Maîtrise les règles'],
      [3, 'Sentences', 'phrases', 1, 'all', 'message-square', 3, 'Structure et syntaxe'],
      [4, 'Reading', 'reading', 1, 'all', 'file-text', 4, 'Analyse de textes'],
      [5, 'Conversation', 'conversation', 1, 'all', 'message-circle', 5, 'Pratique dialogues'],
      [6, 'Games', 'games', 1, 'all', 'gamepad', 6, 'Exercices ludiques'],
      [8, 'FastVocab', 'fastvocab', 0, 'adult', 'zap', 8, '500 mots essentiels'],
      [9, 'Connector', 'connector', 0, 'lycee', 'link', 9, 'Mots de liaison']
    ];

    for (const mod of modulesSeed) {
      await db.runAsync(`INSERT OR IGNORE INTO modules VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, mod);
    }

    // 3. SEED DES NIVEAUX (7 colonnes exactement)
    const levelsSeed = [
      // [ID, LEVEL, TITLE, ICON, DESCRIPTION, BADGE, AUDIENCE]
      [101, 1, 'Découverte', '🎨', 'Mes premiers pas', 'LVL 1', 'primary'],
      [102, 2, 'Apprentissage', '🚀', 'Je commence à parler', 'LVL 2', 'primary'],
      [103, 3, 'Exploration', '🔍', 'Je découvre le monde', 'LVL 3', 'primary'],
      [104, 4, 'Maîtrise', '🌟', 'Je parle comme un grand', 'LVL 4', 'primary'],

      [201, 1, 'Les Bases', '🌱', 'Démarre ton apprentissage', 'LVL 1', 'college'],
      [202, 2, "L'Essentiel", '🎯', 'Développe tes compétences', 'LVL 2', 'college'],
      [203, 3, "L'Avancé", '⚡', 'Renforce ton niveau', 'LVL 3', 'college'],
      [204, 4, "L'Expert", '🏆', "Maîtrise l'anglais", 'LVL 4', 'college'],

      [301, 1, 'Foundations', '📚', 'Core grammar and vocab', 'LVL 1', 'lycee'],
      [302, 2, 'Skills', '🛠️', 'Practical application', 'LVL 2', 'lycee'],
      [303, 3, 'Expertise', '🧪', 'Advanced structures', 'LVL 3', 'lycee'],
      [304, 4, 'Mastery', '🎓', 'Academic excellence', 'LVL 4', 'lycee'],

      [401, 1, 'Niveau 1', '🌱', 'Les bases essentielles', 'NIVEAU 1', 'adult'],
      [402, 2, 'Niveau 2', '🎯', 'Pratique et quotidien', 'NIVEAU 2', 'adult'],
      [403, 3, 'Niveau 3', '⚡', 'Approfondissement', 'NIVEAU 3', 'adult'],
      [404, 4, 'Niveau 4', '🏆', 'Maîtrise complète', 'NIVEAU 4', 'adult'],
      [405, 5, 'Slang', '🔥', 'Anglais familier et films', 'SPECIAL', 'adult']
    ];

    for (const lvl of levelsSeed) {
      await db.runAsync(`INSERT OR IGNORE INTO levels VALUES (?, ?, ?, ?, ?, ?, ?)`, lvl);
    }

    // 4. DONNÉE DE TEST DANS CONTENT
    // Récupérer la première famille de Vocabulaire (module_id = 1)
    const firstVocabFamily = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM families WHERE module_id = 1 ORDER BY id LIMIT 1`
    );

    // Si une famille existe, ajouter une donnée de test pour le niveau 1
    if (firstVocabFamily) {
      const testContent = {
        family_id: firstVocabFamily.id,
        level: 1,
        content_type: 'word',
        data: JSON.stringify({ word: 'hello', translation: 'bonjour', example: 'Hello, how are you?' }),
        difficulty: 'easy',
        tags: 'test,greeting'
      };

      await db.runAsync(
        `INSERT OR IGNORE INTO content (family_id, level, content_type, data, difficulty, tags) VALUES (?, ?, ?, ?, ?, ?)`,
        [testContent.family_id, testContent.level, testContent.content_type, testContent.data, testContent.difficulty, testContent.tags]
      );
    }

    console.log('✅ JanaCore Engine Initialized');
    return db;
  } catch (error) {
    console.error('❌ Init Database Error:', error);
    throw error;
  }
};