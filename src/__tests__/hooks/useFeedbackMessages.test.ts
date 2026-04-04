/**
 * Tests de hooks — useFeedbackMessages
 * Couvre : getFeedbackState (pur), getFeedback avec mock DB
 */

import { renderHook, act } from '@testing-library/react-native';
import { getFeedbackState } from '@/hooks/exercises/useFeedbackMessages';

// ============================================
// getFeedbackState — fonction pure
// ============================================

describe('getFeedbackState — function pure', () => {
  it('retourne null si pas encore validé', () => {
    expect(getFeedbackState(false, false, 0)).toBeNull();
  });

  it('retourne "correct" si validé et correct', () => {
    expect(getFeedbackState(true, true, 0)).toBe('correct');
    expect(getFeedbackState(true, true, 2)).toBe('correct');
  });

  it('retourne "incorrect_attempt_1" au premier essai raté', () => {
    expect(getFeedbackState(true, false, 0)).toBe('incorrect_attempt_1');
  });

  it('retourne "incorrect_attempt_2" au deuxième essai raté', () => {
    expect(getFeedbackState(true, false, 1)).toBe('incorrect_attempt_2');
  });

  it('retourne "skip" quand attemptCount atteint maxAttempts', () => {
    expect(getFeedbackState(true, false, 2)).toBe('skip');
    expect(getFeedbackState(true, false, 3)).toBe('skip');
  });

  it('utilise maxAttempts personnalisé', () => {
    // maxAttempts = 3 → skip seulement à partir de 3
    expect(getFeedbackState(true, false, 2, 3)).toBe('incorrect_attempt_2');
    expect(getFeedbackState(true, false, 3, 3)).toBe('skip');
  });
});

// ============================================
// useFeedbackMessages — avec mock DB
// ============================================

const mockDb = {
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn().mockResolvedValue([]),
  runAsync: jest.fn(),
};

const mockGetFeedbackMessage = jest.fn();

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn().mockReturnValue({ db: mockDb }),
}));

jest.mock('@/themes/ThemeContext', () => ({
  useTheme: jest.fn().mockReturnValue({ identity: { id: 'jana' } }),
}));

jest.mock('@/database/queries', () => ({
  getFeedbackMessage: (...args: unknown[]) => mockGetFeedbackMessage(...args),
}));

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

import { useFeedbackMessages } from '@/hooks/exercises/useFeedbackMessages';

describe('useFeedbackMessages — getFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb });
    mockGetFeedbackMessage.mockResolvedValue({
      icon: '✅',
      title: 'Bravo!',
      message: 'Bonne réponse',
    });
  });

  it('retourne le feedback de la DB', async () => {
    const { result } = renderHook(() => useFeedbackMessages());

    let feedback: ReturnType<typeof result.current.getFeedback> extends Promise<infer T> ? T : never = null;
    await act(async () => {
      feedback = await result.current.getFeedback('exercise', 'correct');
    });

    expect(feedback).toEqual({ icon: '✅', title: 'Bravo!', message: 'Bonne réponse' });
  });

  it('getFeedbackMessage est appelé avec les bons arguments', async () => {
    const { result } = renderHook(() => useFeedbackMessages());

    await act(async () => {
      await result.current.getFeedback('wordgames', 'incorrect_attempt_1');
    });

    expect(mockGetFeedbackMessage).toHaveBeenCalledWith(mockDb, 'jana', 'wordgames', 'incorrect_attempt_1');
  });

  it('retourne null si aucun message trouvé', async () => {
    mockGetFeedbackMessage.mockResolvedValue(null);
    const { result } = renderHook(() => useFeedbackMessages());

    let feedback: unknown;
    await act(async () => {
      feedback = await result.current.getFeedback('vocabulary', 'skip');
    });

    expect(feedback).toBeNull();
  });

  it('retourne null si DB est indisponible', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: null });

    const { result } = renderHook(() => useFeedbackMessages());

    let feedback: unknown;
    await act(async () => {
      feedback = await result.current.getFeedback('exercise', 'correct');
    });

    expect(feedback).toBeNull();
    expect(mockGetFeedbackMessage).not.toHaveBeenCalled();
  });

  it('retourne null et ne plante pas si DB lance une erreur', async () => {
    mockGetFeedbackMessage.mockRejectedValue(new Error('DB error'));
    const { result } = renderHook(() => useFeedbackMessages());

    let feedback: unknown;
    await act(async () => {
      feedback = await result.current.getFeedback('exercise', 'correct');
    });

    expect(feedback).toBeNull();
  });
});
