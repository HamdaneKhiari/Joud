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

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync('janacore.db');

    // ✅ FIX: Activation du mode WAL pour éviter les erreurs "database is locked"
    await db.execAsync('PRAGMA journal_mode = WAL;');

    // ✅ FIX: Augmentation du timeout (10s) pour attendre si la DB est occupée par une autre requête
    await db.execAsync('PRAGMA busy_timeout = 10000;');

    // ✅ FIX: Délai pour laisser les connexions fantômes se fermer et éviter les race conditions
    await new Promise(resolve => setTimeout(resolve, 200));

    // Activation des contraintes d'intégrité
    await db.execAsync(`PRAGMA foreign_keys = ON;`);

    // ============================================
    // RUN MIGRATIONS
    // ============================================
    const runner = new MigrationRunner(db);

    await runner.runMigration(migration001);
    await runner.runMigration(migration002);
    await runner.runMigration(migration003);
    await runner.runMigration(migration004);
    await runner.runMigration(migration005);
    await runner.runMigration(migration006);
    await runner.runMigration(migration007);

    console.log('✅ JanaCore Engine Initialized - Migration System Active');
    return db;
  } catch (error) {
    console.error('❌ Init Database Error:', error);
    throw error;
  }
};