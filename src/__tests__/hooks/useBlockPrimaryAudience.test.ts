/**
 * Tests — useBlockPrimaryAudience
 * Le Tuteur IA (BYOK) est réservé à collège/lycée/adulte, jamais au public primaire (enfants).
 */

import { renderHook } from '@testing-library/react-native';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn(),
}));

import { useBlockPrimaryAudience } from '@/hooks/useBlockPrimaryAudience';
import { useUser } from '@/contexts/UserContext';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useBlockPrimaryAudience', () => {
  it('audience=primary → retourne true et redirige vers /', () => {
    (useUser as jest.Mock).mockReturnValue({ user: { audience: 'primary' } });
    const { result } = renderHook(() => useBlockPrimaryAudience());

    expect(result.current).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it.each(['college', 'lycee', 'adult'])('audience=%s → retourne false, ne redirige pas', (audience) => {
    (useUser as jest.Mock).mockReturnValue({ user: { audience } });
    const { result } = renderHook(() => useBlockPrimaryAudience());

    expect(result.current).toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('user=null (pas encore chargé) → retourne false, ne redirige pas', () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    const { result } = renderHook(() => useBlockPrimaryAudience());

    expect(result.current).toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
