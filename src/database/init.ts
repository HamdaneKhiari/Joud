import * as SQLite from 'expo-sqlite';
import { MigrationRunner } from './migrations/runner';

// ============================================
// IMPORTS DES MIGRATIONS (Ordre Chronologique)
// ============================================
import migration001 from './migrations/001_initial_schema';
import migration002 from './migrations/002_seed_core_modules';
import migration003 from './migrations/003_seed_families';
import migration004 from './migrations/004_seed_subfamily_labels'; // Nouveau : Labels Sous-familles
import migration005 from './migrations/005_seed_content_vocab';    // Vocabulaire décalé en 005
import migration006 from './migrations/006_seed_content_assessment';
import migration007 from './migrations/007_seed_content_wordgames';
import migration008 from './migrations/008_seed_feedback_messages';
import migration009 from './migrations/009_seed_dashboard_data';
import migration010 from './migrations/010_add_target_audience_to_content';
import migration011 from './migrations/011_seed_content_fastvocab';
import migration012 from './migrations/012_seed_content_phrases';
import migration013 from './migrations/013_seed_content_dialogues';
import migration014 from './migrations/014_seed_content_grammar';
import migration015 from './migrations/015_seed_content_reading';
import migration016 from './migrations/016_seed_content_connector';
import migration017 from './migrations/017_seed_whitelabel';

// ============================================
// CONFIGURATION
// ============================================
const FORCE_RESET_DB = true; 
let retryCount = 0;
const MAX_RETRIES = 1;

const deleteDatabase = async (db?: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    if (db) {
      try {
        await db.closeAsync();
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.warn('⚠️ Closing error:', e);
      }
    }
    await SQLite.deleteDatabaseAsync('janacore.db');
    console.log('🗑️ Database deleted');
  } catch (error) {
    if (!String(error).includes('does not exist')) {
      console.warn('⚠️ Deletion error:', error);
    }
  }
};

// ============================================
// INITIALISATION
// ============================================
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  let db: SQLite.SQLiteDatabase | undefined = undefined;

  try {
    if (__DEV__ && FORCE_RESET_DB) {
      await deleteDatabase();
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    db = await SQLite.openDatabaseAsync('janacore.db');
    if (!db) throw new Error('Failed to open database');

    // Optimisations SQLite
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA busy_timeout = 10000;');
    await db.execAsync('PRAGMA foreign_keys = ON;');

    const runner = new MigrationRunner(db);
    await runner.initialize();

    // Tableau ordonné des migrations (001 à 017)
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
      migration010,
      migration011,
      migration012,
      migration013,
      migration014,
      migration015,
      migration016,
      migration017,
    ];

    console.log('[JanaCore] 🚀 Running migrations...');
    await runner.runMigrations(migrations);
    console.log('✅ JanaCore Ready');

    retryCount = 0;
    return db;

  } catch (error) {
    console.error('❌ Init Error:', error);

    if (__DEV__ && retryCount < MAX_RETRIES) {
      retryCount++;
      console.log('🔄 Error detected, attempting auto-reset...');
      await deleteDatabase(db);
      await new Promise(resolve => setTimeout(resolve, 500));
      return await initDatabase();
    }
    throw error;
  }
};