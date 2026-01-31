// src/database/init.ts
import * as SQLite from 'expo-sqlite';
import { MigrationRunner } from './migrations/runner';
import migration001 from './migrations/001_initial_schema';
import migration002 from './migrations/002_seed_core_modules';
import migration003 from './migrations/003_seed_families';
import migration004 from './migrations/004_seed_content_vocab';
import migration005 from './migrations/005_seed_content_wordgames';
import migration006 from './migrations/006_seed_content_assessment';
import migration007 from './migrations/007_seed_whitelabel';
import migration008 from './migrations/008_seed_feedback_messages';
import migration009 from './migrations/009_seed_dashboard_data';
import migration010 from './migrations/010_add_target_audience_to_content';
import migration011 from './migrations/011_seed_content_fastvocab';
import migration012 from './migrations/012_seed_content_phrases';
import migration013 from './migrations/013_seed_content_dialogues';
import migration014 from './migrations/014_seed_content_grammar';
import migration015 from './migrations/015_seed_content_reading';
import migration016 from './migrations/016_seed_content_connector';

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync('janacore.db');

    // ============================================
    // CONFIGURATION SQLITE
    // ============================================
    
    // Mode WAL pour la gestion des accès concurrents (IA + UI)
    await db.execAsync('PRAGMA journal_mode = WAL;');
    
    // Timeout pour éviter les erreurs "database is locked"
    await db.execAsync('PRAGMA busy_timeout = 10000;');
    
    // Sécurité pour les relations entre tables
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Petit délai de sécurité pour stabiliser la connexion
    await new Promise(resolve => setTimeout(resolve, 200));

    // ============================================
    // SYSTÈME DE MIGRATIONS
    // ============================================
    
    const runner = new MigrationRunner(db);

    // 1. Initialisation (CRITIQUE : Crée la table de tracking si elle n'existe pas)
    await runner.initialize();

    // 2. Liste ordonnée des migrations
    const migrations = [
      migration001,
      migration002,
      migration003,
      migration004,
      migration005,
      migration006,
      migration007,
      migration008,
      migration009,
      migration010, // Ajout colonne target_audience
      migration011, // Fast Vocabulary
      migration012, // Phrases
      migration013, // Dialogues
      migration014, // Grammar
      migration015, // Reading
      migration016, // Connector
    ];

    // 3. Exécution automatique de toutes les migrations
    console.log('[JanaCore] 🚀 Starting database migrations...');
    await runner.runMigrations(migrations);

    console.log('✅ JanaCore Engine Initialized - All systems go');
    return db;
    
  } catch (error) {
    console.error('❌ Init Database Error:', error);
    throw error;
  }
};