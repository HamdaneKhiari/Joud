/**
 * ============================================
 * MIGRATION RUNNER
 * Système de versioning et exécution des migrations
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';

// ============================================
// TYPES
// ============================================

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  down?: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

interface MigrationRecord {
  version: number;
  name: string;
  executed_at: number;
}

// ============================================
// MIGRATION RUNNER
// ============================================

export class MigrationRunner {
  private db: SQLite.SQLiteDatabase;

  constructor(db: SQLite.SQLiteDatabase) {
    this.db = db;
  }

  /**
   * Initialise la table de tracking des migrations
   */
  async initialize(): Promise<void> {
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        executed_at INTEGER NOT NULL
      );
    `);
  }

  /**
   * Récupère la version actuelle de la DB
   */
  async getCurrentVersion(): Promise<number> {
    const result = await this.db.getFirstAsync<{ max_version: number | null }>(
      'SELECT MAX(version) as max_version FROM schema_migrations'
    );
    return result?.max_version || 0;
  }

  /**
   * Vérifie si une migration a déjà été exécutée
   */
  async isMigrationExecuted(version: number): Promise<boolean> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM schema_migrations WHERE version = ?',
      [version]
    );
    return (result?.count || 0) > 0;
  }

  /**
   * Enregistre l'exécution d'une migration
   */
  private async recordMigration(migration: Migration): Promise<void> {
    await this.db.runAsync(
      'INSERT OR REPLACE INTO schema_migrations (version, name, executed_at) VALUES (?, ?, ?)',
      [migration.version, migration.name, Date.now()]
    );
  }

  /**
   * Supprime l'enregistrement d'une migration (pour rollback)
   */
  private async removeMigrationRecord(version: number): Promise<void> {
    await this.db.runAsync('DELETE FROM schema_migrations WHERE version = ?', [version]);
  }

  /**
   * Exécute une migration UP
   */
  async runMigration(migration: Migration): Promise<void> {
    const isExecuted = await this.isMigrationExecuted(migration.version);

    if (isExecuted) {
      console.log(
        `[Migration] ✓ ${migration.version}_${migration.name} already executed, skipping`
      );
      return;
    }

    console.log(`[Migration] ▶ Running ${migration.version}_${migration.name}...`);

    try {
      await migration.up(this.db);
      await this.recordMigration(migration);
      console.log(`[Migration] ✓ ${migration.version}_${migration.name} completed`);
    } catch (error) {
      console.error(`[Migration] ✗ ${migration.version}_${migration.name} failed:`, error);
      throw error;
    }
  }

  /**
   * Exécute plusieurs migrations dans l'ordre
   */
  async runMigrations(migrations: Migration[]): Promise<void> {
    // Trier par version (au cas où)
    const sorted = migrations.sort((a, b) => a.version - b.version);

    for (const migration of sorted) {
      await this.runMigration(migration);
    }
  }

  /**
   * Rollback d'une migration (si la fonction down existe)
   */
  async rollback(migration: Migration): Promise<void> {
    if (!migration.down) {
      throw new Error(
        `Migration ${migration.version}_${migration.name} has no down() function`
      );
    }

    const isExecuted = await this.isMigrationExecuted(migration.version);

    if (!isExecuted) {
      console.log(
        `[Migration] ⚠ ${migration.version}_${migration.name} not executed, nothing to rollback`
      );
      return;
    }

    console.log(`[Migration] ◀ Rolling back ${migration.version}_${migration.name}...`);

    try {
      await migration.down(this.db);
      await this.removeMigrationRecord(migration.version);
      console.log(`[Migration] ✓ ${migration.version}_${migration.name} rolled back`);
    } catch (error) {
      console.error(
        `[Migration] ✗ Rollback of ${migration.version}_${migration.name} failed:`,
        error
      );
      throw error;
    }
  }

  /**
   * Affiche le statut des migrations
   */
  async getStatus(allMigrations: Migration[]): Promise<MigrationRecord[]> {
    const executed = await this.db.getAllAsync<MigrationRecord>(
      'SELECT version, name, executed_at FROM schema_migrations ORDER BY version ASC'
    );

    console.log('\n=== Migration Status ===');
    console.log(`Current version: ${await this.getCurrentVersion()}`);
    console.log(`\nExecuted migrations:`);

    executed.forEach((record) => {
      const date = new Date(record.executed_at).toISOString();
      console.log(`  ✓ ${record.version}_${record.name} (${date})`);
    });

    const pending = allMigrations.filter(
      (m) => !executed.find((e) => e.version === m.version)
    );

    if (pending.length > 0) {
      console.log(`\nPending migrations:`);
      pending.forEach((m) => {
        console.log(`  ⏸ ${m.version}_${m.name}`);
      });
    } else {
      console.log(`\n✓ All migrations are up to date`);
    }

    console.log('========================\n');

    return executed;
  }
}

/**
 * Helper pour créer une migration
 */
export function createMigration(
  version: number,
  name: string,
  up: (db: SQLite.SQLiteDatabase) => Promise<void>,
  down?: (db: SQLite.SQLiteDatabase) => Promise<void>
): Migration {
  return {
    version,
    name,
    up,
    down,
  };
}
