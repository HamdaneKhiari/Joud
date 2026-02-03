import * as SQLite from 'expo-sqlite';
import { MigrationRunner } from './migrations/runner';

// ============================================
// IMPORTS DES MIGRATIONS (Ordre Logique Corrigé)
// ============================================
import migration001 from './migrations/001_initial_schema';
import migration002 from './migrations/002_seed_whitelabel';       // 1er : Identités (adulte/enfant)
import migration003 from './migrations/003_seed_core_modules';    // 2ème : Modules
import migration004 from './migrations/004_seed_families';        // 3ème : Familles
import migration005 from './migrations/005_seed_subfamily_labels';// 4ème : Labels (Dépend de 002 et 004)
import migration006 from './migrations/006_seed_content_vocab';    // 5ème : Contenu
import migration007 from './migrations/007_seed_content_assessment';
import migration008 from './migrations/008_seed_content_wordgames';
import migration009 from './migrations/009_seed_feedback_messages';
import migration010 from './migrations/010_seed_dashboard_data';
import migration011 from './migrations/011_add_target_audience_to_content';
import migration012 from './migrations/012_seed_content_fastvocab';
import migration013 from './migrations/013_seed_content_phrases';
import migration014 from './migrations/014_seed_content_dialogues';
import migration015 from './migrations/015_seed_content_grammar';
import migration016 from './migrations/016_seed_content_reading';
import migration017 from './migrations/017_seed_content_connector';
import migration018 from './migrations/018_add_subfamily_id_to_content';
import migration019 from './migrations/019_seed_phrases_subfamilies';
import migration020 from './migrations/020_seed_grammar_subfamilies';
import migration021 from './migrations/021_seed_dialogues_subfamilies';
import migration022 from './migrations/022_seed_reading_subfamilies';
import migration023 from './migrations/023_fix_activity_log_family_id';

// ============================================
// CONFIGURATION
// ============================================
const FORCE_RESET_DB = true; // Garder à true pour appliquer les changements de structure
let retryCount = 0;
const MAX_RETRIES = 1;

const deleteDatabase = async (db?: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    if (db) {
      try {
        await db.closeAsync();
        // Petit délai pour laisser le système fermer le descripteur de fichier
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (e) {
        console.warn('⚠️ Closing error:', e);
      }
    }
    await SQLite.deleteDatabaseAsync('janacore.db');
    console.log('🗑️ Database deleted successfully');
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
    // Dans le cas d'un reset forcé (changement de schéma important)
    if (__DEV__ && FORCE_RESET_DB && retryCount === 0) {
      await deleteDatabase();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    db = await SQLite.openDatabaseAsync('janacore.db');
    if (!db) throw new Error('Failed to open database');

    // Optimisations SQLite pour Expo
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA busy_timeout = 15000;');
    await db.execAsync('PRAGMA foreign_keys = ON;'); // Réactivé car l'ordre est maintenant correct

    const runner = new MigrationRunner(db);
    await runner.initialize();

    // Tableau ordonné des migrations indexées par leur version
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
      migration018,
      migration019,
      migration020,
      migration021,
      migration022,
      migration023,
    ];

    console.log('[JanaCore] 🚀 Running migrations in sequence...');
    await runner.runMigrations(migrations);
    console.log('✅ JanaCore Ready and Synchronized');

    retryCount = 0;
    return db;

  } catch (error) {
    console.error('❌ Init Error:', error);

    // Stratégie de récupération : on supprime et on recommence une seule fois
    if (__DEV__ && retryCount < MAX_RETRIES) {
      retryCount++;
      console.log('🔄 Error detected in schema, attempting clean reset...');
      await deleteDatabase(db);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await initDatabase();
    }
    throw error;
  }
};