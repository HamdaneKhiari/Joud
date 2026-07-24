/**
 * Fabrique une vraie base SQLite en mémoire (sql.js, WASM — pas de compilation native)
 * exposant la même API async que `expo-sqlite` (execAsync/runAsync/getAllAsync/getFirstAsync).
 *
 * Contrairement à src/__mocks__/expo-sqlite.ts (stubs jest.fn() qui ne stockent rien),
 * cette DB exécute vraiment le SQL — utilisée pour les tests d'intégration qui font tourner
 * les migrations réelles et vérifient un comportement de bout en bout, pas juste "la bonne
 * requête a été appelée".
 */

import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import type { SQLiteDatabase } from 'expo-sqlite';
import { MigrationRunner } from '@/database/migrations/runner';

let sqlModulePromise: ReturnType<typeof initSqlJs> | null = null;

const getSQL = () => {
  if (!sqlModulePromise) {
    sqlModulePromise = initSqlJs();
  }
  return sqlModulePromise;
};

export interface RealTestDb {
  /** Instance sql.js brute, pour des assertions SQL directes si besoin */
  raw: SqlJsDatabase;
  /** Adaptateur exposant l'API expo-sqlite, à passer aux fonctions de src/database/queries.ts */
  db: SQLiteDatabase;
}

const toParams = (params: unknown[]): (string | number | null)[] =>
  params.map((p) => (p === undefined ? null : p)) as (string | number | null)[];

export const createRealDb = async (): Promise<RealTestDb> => {
  const SQL = await getSQL();
  const raw = new SQL.Database();

  const runAsync = async (sql: string, params: unknown[] = []) => {
    raw.run(sql, toParams(params));
    const stmt = raw.prepare('SELECT last_insert_rowid() as id, changes() as changes');
    stmt.step();
    const row = stmt.getAsObject() as { id: number; changes: number };
    stmt.free();
    return { lastInsertRowId: row.id, changes: row.changes };
  };

  const getAllAsync = async <T,>(sql: string, params: unknown[] = []): Promise<T[]> => {
    const stmt = raw.prepare(sql);
    stmt.bind(toParams(params));
    const rows: T[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return rows;
  };

  const getFirstAsync = async <T,>(sql: string, params: unknown[] = []): Promise<T | null> => {
    const rows = await getAllAsync<T>(sql, params);
    return rows[0] ?? null;
  };

  const execAsync = async (sql: string) => {
    raw.exec(sql);
  };

  const withTransactionAsync = async (fn: () => Promise<void>) => {
    raw.run('BEGIN');
    try {
      await fn();
      raw.run('COMMIT');
    } catch (error) {
      raw.run('ROLLBACK');
      throw error;
    }
  };

  const closeAsync = async () => {
    raw.close();
  };

  const db = {
    execAsync,
    runAsync,
    getAllAsync,
    getFirstAsync,
    withTransactionAsync,
    closeAsync,
  } as unknown as SQLiteDatabase;

  return { raw, db };
};

/**
 * Crée une DB réelle et exécute dessus toutes les migrations du projet, dans l'ordre.
 * Sert de socle aux tests d'intégration : la DB obtenue a exactement le schéma + les seeds
 * de production, générés par le vrai code de migration (pas une reconstruction manuelle).
 */
export const createMigratedRealDb = async (): Promise<RealTestDb> => {
  const testDb = await createRealDb();
  const runner = new MigrationRunner(testDb.db);
  await runner.initialize();

  const migrationModules = [
    require('@/database/migrations/001_schema').default,
    require('@/database/migrations/002_seed_config').default,
    require('@/database/migrations/003_seed_subfamily_labels').default,
    require('@/database/migrations/004_remove_grammar_module').default,
    require('@/database/migrations/005_remove_assessment_module').default,
    require('@/database/migrations/006_fix_contrast_and_adult_language').default,
  ];

  await runner.runMigrations(migrationModules);

  return testDb;
};
