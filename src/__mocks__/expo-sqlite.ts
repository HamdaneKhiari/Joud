/**
 * Mock expo-sqlite for Jest tests
 * Provides in-memory stub of SQLiteDatabase
 */

const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  closeAsync: jest.fn().mockResolvedValue(undefined),
  withTransactionAsync: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
};

export const openDatabaseAsync = jest.fn().mockResolvedValue(mockDb);
export const SQLiteDatabase = jest.fn();

export default { openDatabaseAsync, SQLiteDatabase };
