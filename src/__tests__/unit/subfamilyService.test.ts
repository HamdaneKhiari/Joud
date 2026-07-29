/**
 * Tests: subfamilyService.getSubFamiliesByFamily
 */

import { getSubFamiliesByFamily } from '@/services/subfamilyService';
import type { SQLiteDatabase } from 'expo-sqlite';

const mockDb = {
  getAllAsync: jest.fn(),
};
const db = mockDb as unknown as SQLiteDatabase;

describe('getSubFamiliesByFamily', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne les sous-familles depuis la DB', async () => {
    const mockData = [
      { subfamily_id: 1, title: 'Nourriture', icon: 'food', description: 'Food vocab', progress: 50 },
    ];
    mockDb.getAllAsync.mockResolvedValueOnce(mockData);

    const result = await getSubFamiliesByFamily(db, 1, 'college', 2, 'user1');
    expect(result).toEqual(mockData);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.arrayContaining([1, 2, 'user1', 1, 'college'])
    );
  });

  it('fonctionne sans userId (params sans user_id)', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([]);
    const result = await getSubFamiliesByFamily(db, 2, 'lycee', 1);
    expect(result).toEqual([]);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.arrayContaining([2, 1, 2, 'lycee'])
    );
  });

  it('filtre bien par level (une sous-famille avec du contenu à plusieurs niveaux)', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([]);
    await getSubFamiliesByFamily(db, 5, 'primary', 3, 'user2');
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('p.level = ?'),
      expect.arrayContaining([5, 3, 'user2', 5, 'primary'])
    );
  });

  it('propage les erreurs DB', async () => {
    mockDb.getAllAsync.mockRejectedValueOnce(new Error('DB error'));
    await expect(getSubFamiliesByFamily(db, 1, 'college', 1)).rejects.toThrow('DB error');
  });
});
