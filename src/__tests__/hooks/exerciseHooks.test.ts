/**
 * Tests: useFirstIncompleteIndex + useRecordWordSeen
 * Deux hooks d'exercice avec logique claire à valider.
 */

import { renderHook, act } from '@testing-library/react-native';

// ──────────────────────────────────────────────
// MOCKS
// ──────────────────────────────────────────────

jest.mock('@/contexts/ProgressContext', () => ({
  useProgress: jest.fn(),
}));
jest.mock('@/hooks/useLastActivity', () => ({
  useLastActivity: jest.fn(),
}));

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('@/database/queries', () => ({
  addWordToSRS: jest.fn(),
}));

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

// ──────────────────────────────────────────────
// useFirstIncompleteIndex
// ──────────────────────────────────────────────

describe('useFirstIncompleteIndex', () => {
  const { useProgress } = require('@/contexts/ProgressContext');

  const makeProgress = (completed: number, total: number) => ({
    level1: { vocab: { fam1: { completed, total } } },
  });

  beforeEach(() => jest.clearAllMocks());

  it('retourne 0 si totalItems=0', () => {
    useProgress.mockReturnValue({ progress: makeProgress(3, 5) });
    const { useFirstIncompleteIndex } = require('@/hooks/exercises/useFirstIncompleteIndex');
    const { result } = renderHook(() => useFirstIncompleteIndex(1, 'vocab', 'fam1', 0));
    expect(result.current()).toBe(0);
  });

  it('retourne 0 si aucune donnée de progression', () => {
    useProgress.mockReturnValue({ progress: {} });
    const { useFirstIncompleteIndex } = require('@/hooks/exercises/useFirstIncompleteIndex');
    const { result } = renderHook(() => useFirstIncompleteIndex(1, 'vocab', 'fam1', 10));
    expect(result.current()).toBe(0);
  });

  it('retourne completed quand exercice en cours (completed < total)', () => {
    useProgress.mockReturnValue({ progress: makeProgress(3, 10) });
    const { useFirstIncompleteIndex } = require('@/hooks/exercises/useFirstIncompleteIndex');
    const { result } = renderHook(() => useFirstIncompleteIndex(1, 'vocab', 'fam1', 10));
    expect(result.current()).toBe(3);
  });

  it('retourne 0 quand tout est complété (revision)', () => {
    useProgress.mockReturnValue({ progress: makeProgress(10, 10) });
    const { useFirstIncompleteIndex } = require('@/hooks/exercises/useFirstIncompleteIndex');
    const { result } = renderHook(() => useFirstIncompleteIndex(1, 'vocab', 'fam1', 10));
    expect(result.current()).toBe(0);
  });

  it('construit la bonne clé de niveau (level2)', () => {
    useProgress.mockReturnValue({
      progress: { level2: { grammar: { famG: { completed: 5, total: 8 } } } },
    });
    const { useFirstIncompleteIndex } = require('@/hooks/exercises/useFirstIncompleteIndex');
    const { result } = renderHook(() => useFirstIncompleteIndex(2, 'grammar', 'famG', 8));
    expect(result.current()).toBe(5);
  });
});

// ──────────────────────────────────────────────
// useRecordWordSeen
// ──────────────────────────────────────────────

describe('useRecordWordSeen', () => {
  const { useUser } = require('@/contexts/UserContext');
  const { addWordToSRS } = require('@/database/queries');

  const mockDb = {
    runAsync: jest.fn().mockResolvedValue(undefined),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('ne fait rien si db=null', async () => {
    useUser.mockReturnValue({ db: null, user: { id: 1 } });
    const { useRecordWordSeen } = require('@/hooks/exercises/useRecordWordSeen');
    const { result } = renderHook(() => useRecordWordSeen());
    await act(async () => {
      await result.current.recordWordSeen({ word: 'hello', translation: 'bonjour', familyId: 'f1' });
    });
    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });

  it('insère dans vocabulary_seen', async () => {
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    const { useRecordWordSeen } = require('@/hooks/exercises/useRecordWordSeen');
    const { result } = renderHook(() => useRecordWordSeen());
    await act(async () => {
      await result.current.recordWordSeen({ word: 'apple', translation: 'pomme', familyId: 'fam1' });
    });
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO vocabulary_seen'),
      expect.arrayContaining(['apple', 'pomme', 'fam1'])
    );
  });

  it('appelle addWordToSRS si contentId fourni', async () => {
    useUser.mockReturnValue({ db: mockDb, user: { id: 42 } });
    const { useRecordWordSeen } = require('@/hooks/exercises/useRecordWordSeen');
    const { result } = renderHook(() => useRecordWordSeen());
    await act(async () => {
      await result.current.recordWordSeen({ word: 'run', translation: 'courir', familyId: 'f2', contentId: 99 });
    });
    expect(addWordToSRS).toHaveBeenCalledWith(mockDb, 42, 99);
  });

  it("n'appelle pas addWordToSRS sans contentId", async () => {
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    const { useRecordWordSeen } = require('@/hooks/exercises/useRecordWordSeen');
    const { result } = renderHook(() => useRecordWordSeen());
    await act(async () => {
      await result.current.recordWordSeen({ word: 'go', translation: 'aller', familyId: 'f3' });
    });
    expect(addWordToSRS).not.toHaveBeenCalled();
  });

  it('swallowe les erreurs DB sans crasher', async () => {
    mockDb.runAsync.mockRejectedValueOnce(new Error('DB error'));
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    const { useRecordWordSeen } = require('@/hooks/exercises/useRecordWordSeen');
    const { result } = renderHook(() => useRecordWordSeen());
    await expect(
      act(async () => {
        await result.current.recordWordSeen({ word: 'fail', translation: 'échec', familyId: 'f4' });
      })
    ).resolves.not.toThrow();
  });
});

// ──────────────────────────────────────────────
// useExerciseActivity
// ──────────────────────────────────────────────

describe('useExerciseActivity', () => {
  const { useLastActivity } = require('@/hooks/useLastActivity');
  const mockRecordActivity = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useLastActivity.mockReturnValue({ recordActivity: mockRecordActivity });
  });

  const baseProps = {
    moduleSlug: 'vocab',
    familyId: 'f1',
    levelId: 1,
    familyName: 'Animals',
    currentIndex: 0,
    totalItems: 10,
    enabled: true,
  };

  it('enregistre l\'activité quand enabled=true', () => {
    const { useExerciseActivity } = require('@/hooks/exercises/useExerciseActivity');
    renderHook(() => useExerciseActivity(baseProps));
    expect(mockRecordActivity).toHaveBeenCalledWith(expect.objectContaining({
      moduleSlug: 'vocab',
      familyId: 'f1',
      progress: 10, // (0+1)/10 * 100
    }));
  });

  it('ne fait rien si enabled=false', () => {
    const { useExerciseActivity } = require('@/hooks/exercises/useExerciseActivity');
    renderHook(() => useExerciseActivity({ ...baseProps, enabled: false }));
    expect(mockRecordActivity).not.toHaveBeenCalled();
  });

  it('ne fait rien si totalItems=0', () => {
    const { useExerciseActivity } = require('@/hooks/exercises/useExerciseActivity');
    renderHook(() => useExerciseActivity({ ...baseProps, totalItems: 0 }));
    expect(mockRecordActivity).not.toHaveBeenCalled();
  });

  it('progress est plafonné à 100%', () => {
    const { useExerciseActivity } = require('@/hooks/exercises/useExerciseActivity');
    renderHook(() => useExerciseActivity({ ...baseProps, currentIndex: 20, totalItems: 5 }));
    const call = mockRecordActivity.mock.calls[0][0];
    expect(call.progress).toBe(100);
  });
});

// ──────────────────────────────────────────────
// useExerciseSaveOnUnmount
// ──────────────────────────────────────────────

describe('useExerciseSaveOnUnmount', () => {
  const { useProgress } = require('@/contexts/ProgressContext');

  beforeEach(() => jest.clearAllMocks());

  it('appelle saveProgressNow au démontage', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    useProgress.mockReturnValue({ saveProgressNow: mockSave });
    const { useExerciseSaveOnUnmount } = require('@/hooks/exercises/useExerciseSaveOnUnmount');
    const { unmount } = renderHook(() => useExerciseSaveOnUnmount());
    unmount();
    expect(mockSave).toHaveBeenCalled();
  });

  it('ne crash pas si saveProgressNow rejette', async () => {
    useProgress.mockReturnValue({
      saveProgressNow: jest.fn().mockRejectedValue(new Error('save failed')),
    });
    const { useExerciseSaveOnUnmount } = require('@/hooks/exercises/useExerciseSaveOnUnmount');
    const { unmount } = renderHook(() => useExerciseSaveOnUnmount());
    expect(() => unmount()).not.toThrow();
  });
});

// ──────────────────────────────────────────────
// useRecordError
// ──────────────────────────────────────────────

describe('useRecordError', () => {
  const { useUser } = require('@/contexts/UserContext');
  const mockDb = { runAsync: jest.fn().mockResolvedValue(undefined) };

  beforeEach(() => jest.clearAllMocks());

  it('ne fait rien si db=null', async () => {
    useUser.mockReturnValue({ db: null, user: { id: 'u1' } });
    const { useRecordError } = require('@/hooks/exercises/useRecordError');
    const { result } = renderHook(() => useRecordError());
    await act(async () => {
      await result.current.recordError({ familyId: 'f1', moduleSlug: 'grammar', question: 'q?', userAnswer: 'wrong', correctAnswer: 'right', level: 1 });
    });
    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });

  it('insère l\'erreur dans exercise_errors', async () => {
    useUser.mockReturnValue({ db: mockDb, user: { id: 'u1' } });
    const { useRecordError } = require('@/hooks/exercises/useRecordError');
    const { result } = renderHook(() => useRecordError());
    await act(async () => {
      await result.current.recordError({ familyId: 5, moduleSlug: 'grammar', question: 'Fill in:', userAnswer: 'go', correctAnswer: 'went', level: 2 });
    });
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO exercise_errors'),
      expect.arrayContaining(['u1', 5, 'grammar', 'Fill in:', 'go', 'went', 2])
    );
  });

  it('swallowe les erreurs DB', async () => {
    mockDb.runAsync.mockRejectedValueOnce(new Error('DB fail'));
    useUser.mockReturnValue({ db: mockDb, user: { id: 'u1' } });
    const { useRecordError } = require('@/hooks/exercises/useRecordError');
    const { result } = renderHook(() => useRecordError());
    await expect(act(async () => {
      await result.current.recordError({ familyId: 'f1', moduleSlug: 'vocab', question: 'q', userAnswer: 'a', correctAnswer: 'b', level: 1 });
    })).resolves.not.toThrow();
  });
});
