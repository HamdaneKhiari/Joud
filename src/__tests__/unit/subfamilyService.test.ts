/**
 * Tests: subfamilyService.getSubFamiliesByFamily
 */

import { getSubFamiliesByFamily } from '@/services/subfamilyService';

const mockDb = {
  getAllAsync: jest.fn(),
};

describe('getSubFamiliesByFamily', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne les sous-familles depuis la DB', async () => {
    const mockData = [
      { subfamily_id: 1, title: 'Nourriture', icon: 'food', description: 'Food vocab', progress: 50 },
    ];
    mockDb.getAllAsync.mockResolvedValueOnce(mockData);

    const result = await getSubFamiliesByFamily(mockDb as any, 1, 'college', 'user1');
    expect(result).toEqual(mockData);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.arrayContaining([1, 'user1', 1, 'college'])
    );
  });

  it('fonctionne sans userId (params sans user_id)', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([]);
    const result = await getSubFamiliesByFamily(mockDb as any, 2, 'lycee');
    expect(result).toEqual([]);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      expect.arrayContaining([2, 2, 'lycee'])
    );
  });

  it('propage les erreurs DB', async () => {
    mockDb.getAllAsync.mockRejectedValueOnce(new Error('DB error'));
    await expect(getSubFamiliesByFamily(mockDb as any, 1, 'college')).rejects.toThrow('DB error');
  });
});
