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
import migration024 from './migrations/024_create_exercise_errors';
import migration025 from './migrations/025_create_chat_conversations';

// ============================================
// SINGLETON — une seule initialisation simultanée
// Empêche la double-invocation de React 18 Strict Mode
// ============================================
let _initPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let _retryCount = 0;

export const initDatabase = (): Promise<SQLite.SQLiteDatabase> => {
  if (!_initPromise) {
    _initPromise = _doInit().catch((err) => {
      _initPromise = null; // Permet une nouvelle tentative après échec
      throw err;
    });
  }
  return _initPromise;
};

// ============================================
// LOGIQUE D'INITIALISATION
// ============================================
const _doInit = async (): Promise<SQLite.SQLiteDatabase> => {
  let db: SQLite.SQLiteDatabase | undefined = undefined;

  try {
    db = await SQLite.openDatabaseAsync('janacore.db');
    if (!db) throw new Error('Failed to open database');

    // Optimisations SQLite pour Expo
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA busy_timeout = 15000;');
    await db.execAsync('PRAGMA foreign_keys = ON;');

    const runner = new MigrationRunner(db);
    await runner.initialize();

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
      migration024,
      migration025,
    ];

    console.log('[JanaCore] 🚀 Running migrations in sequence...');
    await runner.runMigrations(migrations);
    console.log('✅ JanaCore Ready and Synchronized');

    _retryCount = 0;
    return db;

  } catch (error) {
    console.error('❌ Init Error:', error);

    // Stratégie de récupération : supprime le fichier et réessaie une seule fois
    if (__DEV__ && _retryCount < 1) {
      _retryCount++;
      console.log('🔄 Attempting clean reset...');

      // Fermer proprement avant de supprimer
      if (db) {
        try { await db.closeAsync(); } catch { /* handle déjà invalide */ }
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        await SQLite.deleteDatabaseAsync('janacore.db');
        console.log('🗑️ Database deleted successfully');
      } catch (e) {
        if (!String(e).includes('does not exist')) {
          console.warn('⚠️ Deletion error:', e);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      return await _doInit();
    }
    throw error;
  }
};