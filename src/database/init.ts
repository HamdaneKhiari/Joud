import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MigrationRunner } from './migrations/runner';
import { log } from '@/utils/logUtils';

// ============================================
// MIGRATIONS V2 — base consolidée
// ============================================
import migrationV2_001 from './migrations_v2/001_schema';
import migrationV2_002 from './migrations_v2/002_seed_config';
import migrationV2_003 from './migrations_v2/003_seed_subfamily_labels';

// ============================================
// SINGLETON — une seule initialisation simultanée
// Empêche la double-invocation de React 18 Strict Mode
// ============================================
let _initPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let _retryCount = 0;

export const initDatabase = (): Promise<SQLite.SQLiteDatabase> => {
  _initPromise ??= _doInit().catch((err) => {
    _initPromise = null; // Permet une nouvelle tentative après échec
    throw err;
  });
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
      migrationV2_001, // Schéma complet
      migrationV2_002, // Config : branding, palettes, modules, levels, families, availability, feedback, daily_words
      migrationV2_003, // Subfamily labels : vocab core, dialogues, reading
    ];

    console.log('[JanaCore] 🚀 Running migrations V2...');
    await runner.runMigrations(migrations);
    console.log('[JanaCore] ✅ Ready — V2 synchronized');

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
