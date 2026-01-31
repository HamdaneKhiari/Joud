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

// ============================================
// CONFIGURATION DEV
// ============================================

// ⚠️ Mettre à true pour FORCER le reset de la DB (supprime tout et recrée)
const FORCE_RESET_DB = true; // ✅ Désactivé après application des nouveaux styles

// Compteur de retry pour éviter les boucles infinies
let retryCount = 0;
const MAX_RETRIES = 1;

// ============================================
// FONCTION DE RESET DB (DEV ONLY)
// ============================================

const deleteDatabase = async (db?: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    // Si une connexion DB existe, la fermer d'abord
    if (db) {
      try {
        await db.closeAsync();
        console.log('🔒 Database connection closed');
        // Attendre que la fermeture soit effective
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (closeError) {
        console.warn('⚠️  Could not close database connection:', closeError);
      }
    }

    // Supprimer la DB
    await SQLite.deleteDatabaseAsync('janacore.db');
    console.log('🗑️  Database deleted successfully');
  } catch (error) {
    const errorMsg = String(error);
    // Ignorer l'erreur si la DB n'existe pas
    if (!errorMsg.includes('does not exist')) {
      console.warn('⚠️  Could not delete database:', error);
    }
  }
};

// ============================================
// INITIALISATION DB
// ============================================

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  let db: SQLite.SQLiteDatabase | undefined = undefined;

  try {
    // Reset forcé en DEV si demandé
    if (__DEV__ && FORCE_RESET_DB) {
      console.log('🔄 FORCE_RESET_DB = true, deleting database...');
      await deleteDatabase();
      // Attendre que le système de fichiers se stabilise
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    db = await SQLite.openDatabaseAsync('janacore.db');

    if (!db) {
      throw new Error('Failed to open database');
    }

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

    // Réinitialiser le compteur de retry après un succès
    retryCount = 0;

    return db;

  } catch (error) {
    console.error('❌ Init Database Error:', error);

    // ============================================
    // AUTO-RESET EN DEV SI ERREUR DE MIGRATION
    // ============================================
    if (__DEV__) {
      const errorMessage = String(error);

      // Détection d'erreurs de schéma (colonne manquante, table manquante, etc.)
      const isSchemaError =
        errorMessage.includes('no such column') ||
        errorMessage.includes('has no column named') ||
        errorMessage.includes('no such table') ||
        errorMessage.includes('UNIQUE constraint failed') ||
        errorMessage.includes('NOT NULL constraint failed') ||
        errorMessage.includes('duplicate column name') || 
        errorMessage.includes('WordGames families not found') || // ✅ Best Practice : Détecte l'erreur de seed manquante
        errorMessage.includes('NullPointerException'); // Erreur Java SQLite

      if (isSchemaError && retryCount < MAX_RETRIES) {
        retryCount++;
        console.log('');
        console.log('🔄 ========================================');
        console.log('🔄 SCHEMA ERROR DETECTED');
        console.log(`🔄 Auto-resetting database (attempt ${retryCount}/${MAX_RETRIES})...`);
        console.log('🔄 ========================================');
        console.log('');

        // Fermer et supprimer la DB
        await deleteDatabase(db);

        // Attendre un peu pour stabiliser
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('🔄 Retrying database initialization...');
        return await initDatabase(); // Récursion : on réessaie
      }

      // Si on a dépassé les retries ou ce n'est pas une erreur de schéma
      if (retryCount >= MAX_RETRIES) {
        console.error('❌ Max retries reached. Please check your migrations or reset manually.');
        console.error('💡 Try: Set FORCE_RESET_DB = true and restart the app');
      }
    }

    // Si ce n'est pas une erreur de schéma, on throw
    throw error;
  }
};