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
