/* eslint-disable no-console */
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MigrationRunner } from './migrations/runner';
import { log } from '@/utils/logUtils';

import migration001 from './migrations/001_schema';
import migration002 from './migrations/002_seed_config';
import migration003 from './migrations/003_seed_subfamily_labels';
import migration004 from './migrations/004_remove_grammar_module';
import migration005 from './migrations/005_remove_assessment_module';
import migration006 from './migrations/006_fix_contrast_and_adult_language';
import migration007 from './migrations/007_seed_real_content';
import migration008 from './migrations/008_add_course_column';
import migration009 from './migrations/009_add_user_id_to_activity_log';
import migration010 from './migrations/010_backfill_vocab_example_translation';
import migration011 from './migrations/011_add_missing_wordgame_feedbacks';
import migration012 from './migrations/012_add_consecutive_correct';

// Une seule initialisation simultanée : évite la double-invocation de React 18 Strict Mode
let _initPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let _retryCount = 0;

export const initDatabase = (): Promise<SQLite.SQLiteDatabase> => {
  _initPromise ??= _doInit().catch((err) => {
    _initPromise = null; // Permet une nouvelle tentative après échec
    throw err;
  });
  return _initPromise;
};

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
      migration001, // Schéma complet
      migration002, // Config : branding, palettes, modules, levels, families, availability, feedback, daily_words
      migration003, // Subfamily labels : vocab core, dialogues, reading
      migration004, // Suppression du module grammar (données résiduelles)
      migration005, // Suppression du module assessment (données résiduelles)
      migration006, // Fix contraste header (primary, lycee) + feedback adult en français
      migration007, // Premier import de contenu réel (primaire + collège, tous modules)
      migration008, // Colonne course (fondation multi-langue), backfill fr-en
      migration009, // user_id sur activity_log (jours actifs/dernière activité scopés par profil)
      migration010, // Backfill exampleTranslation vocab (perdu à l'import 007, retrouvé dans le fichier source)
      migration011, // Ajout des feedbacks manquants wordgames / incorrect_attempt_2 pour toutes les identités
      migration012, // consecutive_correct sur spaced_repetition (corrige le calcul d'intervalle)
    ];

    console.log('[JanaCore] 🚀 Running migrations...');
    await runner.runMigrations(migrations);
    console.log('[JanaCore] ✅ Ready — synchronized');

    _retryCount = 0;
    return db;

  } catch (error) {
    log.error('❌ Init Error:', error);

    if (__DEV__ && _retryCount < 1) {
      _retryCount++;
      console.log('🔄 Attempting clean reset...');

      if (db) {
        try { await db.closeAsync(); } catch { /* already invalid */ }
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        await SQLite.deleteDatabaseAsync('janacore.db');
        await AsyncStorage.removeItem('JOUDPRIMARY_PROGRESS');
        console.log('🗑️ Database + stale progress deleted');
      } catch (e) {
        if (!String(e).includes('does not exist')) {
          log.warn('⚠️ Deletion error:', e);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      return await _doInit();
    }
    throw error;
  }
};
