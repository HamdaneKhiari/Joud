/**
 * Tests — useRevisionQuestions
 *
 * Couvre : startSession (daily + spaced), selectAnswer, validateAnswer,
 *          nextQuestion, retryQuestion, resetSession, computed values,
 *          generateDistractors, wordsToQuestions.
 */

import { renderHook, act } from '@testing-library/react-native';

// ============================================
// Mocks
// ============================================

jest.mock('@/contexts/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('@/contexts/CurrentLevelContext', () => ({ useCurrentLevel: jest.fn() }));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

jest.mock('@/database/queries', () => ({
  getDailyReviewWords: jest.fn(),
  getSpacedReviewWords: jest.fn(),
  updateSpacedRepetitionResult: jest.fn(),
  addWordToSRS: jest.fn(),
}));

// ============================================
// Imports — après tous les jest.mock()
// ============================================

import { useRevisionQuestions } from '@/hooks/revision/useRevisionQuestions';

// ============================================
// Helpers
// ============================================

const makeDb = () => ({
  getFirstAsync: jest.fn().mockResolvedValue(null),
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
  getAllAsync: jest.fn().mockResolvedValue([]),
  execAsync: jest.fn().mockResolvedValue(undefined),
});

const makeWord = (id: number, english: string, french: string) => ({
  id,
  module_slug: 'vocab',
  family_id: 1,
  level: 1,
  target_audience: 'college',
  data: JSON.stringify({ english, french, emoji: '📚' }),
});

const SAMPLE_WORDS = [
  makeWord(1, 'apple', 'pomme'),
  makeWord(2, 'banana', 'banane'),
  makeWord(3, 'cat', 'chat'),
  makeWord(4, 'dog', 'chien'),
  makeWord(5, 'book', 'livre'),
];

function setupMocks(db = makeDb(), user = { id: 'u1', audience: 'college' as const }) {
  const { useUser } = require('@/contexts/UserContext');
  const { useCurrentLevel } = require('@/contexts/CurrentLevelContext');
  useUser.mockReturnValue({ db, user });
  useCurrentLevel.mockReturnValue({ currentLevel: 1 });

  const queries = require('@/database/queries');
  queries.getDailyReviewWords.mockResolvedValue(SAMPLE_WORDS);
  queries.getSpacedReviewWords.mockResolvedValue(SAMPLE_WORDS);
  queries.updateSpacedRepetitionResult.mockResolvedValue(undefined);
  queries.addWordToSRS.mockResolvedValue(undefined);
}

// ============================================
// État initial
// ============================================

describe('useRevisionQuestions — état initial', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('retourne les valeurs initiales correctes', () => {
    const { result } = renderHook(() => useRevisionQuestions());

    expect(result.current.mode).toBeNull();
    expect(result.current.questions).toEqual([]);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentQuestion).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.selectedAnswer).toBeNull();
    expect(result.current.isValidated).toBe(false);
    expect(result.current.isCorrect).toBe(false);
    expect(result.current.attemptCount).toBe(0);
    expect(result.current.correctCount).toBe(0);
    expect(result.current.incorrectCount).toBe(0);
    expect(result.current.isSessionCompleted).toBe(false);
  });

  it('progress = 0 quand pas de questions', () => {
    const { result } = renderHook(() => useRevisionQuestions());
    expect(result.current.progress).toBe(0);
  });
});

// ============================================
// startSession
// ============================================

describe('startSession', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('mode "daily" → charge getDailyReviewWords et génère des questions', async () => {
    const { result } = renderHook(() => useRevisionQuestions());

    await act(async () => {
      result.current.startSession('daily');
    });

    expect(result.current.mode).toBe('daily');
    expect(result.current.questions.length).toBe(SAMPLE_WORDS.length);
    expect(result.current.questions[0].questionText).toContain('apple');
    expect(result.current.questions[0].correctAnswer).toBe('pomme');
  });

  it('mode "spaced" → charge getSpacedReviewWords', async () => {
    const { result } = renderHook(() => useRevisionQuestions());

    await act(async () => {
      result.current.startSession('spaced');
    });

    expect(result.current.mode).toBe('spaced');
    const { getSpacedReviewWords } = require('@/database/queries');
    expect(getSpacedReviewWords).toHaveBeenCalled();
  });

  it('chaque question a 4 options (correcte + 3 distractors)', async () => {
    const { result } = renderHook(() => useRevisionQuestions());

    await act(async () => {
      result.current.startSession('daily');
    });

    result.current.questions.forEach(q => {
      expect(q.options.length).toBe(4);
      expect(q.options).toContain(q.correctAnswer);
    });
  });

  it('db=null → ne charge pas de questions', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: null, user: { id: 'u1', audience: 'college' } });

    const { result } = renderHook(() => useRevisionQuestions());

    await act(async () => {
      result.current.startSession('daily');
    });

    expect(result.current.questions).toEqual([]);
  });

  it('reset l\'index et l\'état quand on relance une session', async () => {
    const { result } = renderHook(() => useRevisionQuestions());

    // 1ère session
    await act(async () => { result.current.startSession('daily'); });

    // Avancer d'une question
    act(() => { result.current.selectAnswer('pomme'); });
    await act(async () => { await result.current.validateAnswer(); });
    act(() => { result.current.nextQuestion(); });

    expect(result.current.currentIndex).toBe(1);

    // Relancer la session
    await act(async () => { result.current.startSession('daily'); });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.selectedAnswer).toBeNull();
  });
});

// ============================================
// selectAnswer
// ============================================

describe('selectAnswer', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('définit selectedAnswer', async () => {
    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    act(() => { result.current.selectAnswer('pomme'); });

    expect(result.current.selectedAnswer).toBe('pomme');
  });

  it('ne change pas selectedAnswer si validé', async () => {
    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    act(() => { result.current.selectAnswer('pomme'); });
    await act(async () => { await result.current.validateAnswer(); });

    // Tentative de changement après validation
    act(() => { result.current.selectAnswer('banane'); });
    expect(result.current.selectedAnswer).toBe('pomme'); // Inchangé
  });
});

// ============================================
// validateAnswer
// ============================================

describe('validateAnswer', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('réponse correcte → isCorrect=true, isValidated=true, résultat enregistré', async () => {
    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    const correct = result.current.questions[0].correctAnswer;
    act(() => { result.current.selectAnswer(correct); });
    await act(async () => { await result.current.validateAnswer(); });

    expect(result.current.isCorrect).toBe(true);
    expect(result.current.isValidated).toBe(true);
    expect(result.current.correctCount).toBe(1);
  });

  it('réponse incorrecte → isCorrect=false, incorrectCount incrémenté', async () => {
    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    const wrong = 'mauvaisereponse';
    act(() => { result.current.selectAnswer(wrong); });
    await act(async () => { await result.current.validateAnswer(); });

    expect(result.current.isCorrect).toBe(false);
    expect(result.current.incorrectCount).toBe(1);
  });

  it('ne fait rien si selectedAnswer=null', async () => {
    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    await act(async () => { await result.current.validateAnswer(); });

    expect(result.current.isValidated).toBe(false);
  });

  it('mode daily → appelle addWordToSRS', async () => {
    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    act(() => { result.current.selectAnswer(result.current.questions[0].correctAnswer); });
    await act(async () => { await result.current.validateAnswer(); });

    const { addWordToSRS } = require('@/database/queries');
    expect(addWordToSRS).toHaveBeenCalled();
  });
});

// ============================================
// nextQuestion / retryQuestion
// ============================================

describe('nextQuestion', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('avance à la question suivante et reset l\'état', async () => {
    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    const correct = result.current.questions[0].correctAnswer;
    act(() => { result.current.selectAnswer(correct); });
    await act(async () => { await result.current.validateAnswer(); });

    act(() => { result.current.nextQuestion(); });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.selectedAnswer).toBeNull();
    expect(result.current.isValidated).toBe(false);
  });

  it('isLastQuestion = true sur la dernière question', async () => {
    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    const total = result.current.totalQuestions;
    for (let i = 0; i < total - 1; i++) {
      act(() => { result.current.nextQuestion(); });
    }

    expect(result.current.isLastQuestion).toBe(true);
  });
});

describe('retryQuestion', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('reset l\'état de la question sans avancer', async () => {
    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    act(() => { result.current.selectAnswer('pomme'); });
    await act(async () => { await result.current.validateAnswer(); });

    act(() => { result.current.retryQuestion(); });

    expect(result.current.currentIndex).toBe(0); // Même question
    expect(result.current.isValidated).toBe(false);
    expect(result.current.selectedAnswer).toBeNull();
  });
});

// ============================================
// resetSession
// ============================================

describe('resetSession', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('réinitialise complètement la session', async () => {
    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    act(() => { result.current.selectAnswer('pomme'); });
    act(() => { result.current.resetSession(); });

    expect(result.current.mode).toBeNull();
    expect(result.current.questions).toEqual([]);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.selectedAnswer).toBeNull();
    expect(result.current.isValidated).toBe(false);
  });
});

// ============================================
// Valeurs calculées
// ============================================

describe('valeurs calculées', () => {
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  it('progress = 20% sur la 1ère question de 5', async () => {
    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    // index=0, total=5 → (0+1)/5 * 100 = 20%
    expect(result.current.progress).toBe(20);
  });

  it('isSessionCompleted = true quand currentIndex >= totalQuestions', async () => {
    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    const total = result.current.totalQuestions;
    for (let i = 0; i < total; i++) {
      act(() => { result.current.nextQuestion(); });
    }

    expect(result.current.isSessionCompleted).toBe(true);
  });
});

// ============================================
// Gestion d'erreurs
// ============================================

describe('gestion d\'erreurs', () => {
  beforeEach(() => jest.clearAllMocks());

  it('DB lance une erreur lors du chargement → reste sur []', async () => {
    const db = makeDb();
    const { useUser } = require('@/contexts/UserContext');
    const { useCurrentLevel } = require('@/contexts/CurrentLevelContext');
    useUser.mockReturnValue({ db, user: { id: 'u1', audience: 'college' } });
    useCurrentLevel.mockReturnValue({ currentLevel: 1 });

    const { getDailyReviewWords } = require('@/database/queries');
    getDailyReviewWords.mockRejectedValue(new Error('DB crash'));

    const { result } = renderHook(() => useRevisionQuestions());

    await act(async () => { result.current.startSession('daily'); });

    expect(result.current.questions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('mot avec data malformée → skippé (filter null)', async () => {
    const { useUser } = require('@/contexts/UserContext');
    const { useCurrentLevel } = require('@/contexts/CurrentLevelContext');
    const db = makeDb();
    useUser.mockReturnValue({ db, user: { id: 'u1', audience: 'college' } });
    useCurrentLevel.mockReturnValue({ currentLevel: 1 });

    const { getDailyReviewWords } = require('@/database/queries');
    getDailyReviewWords.mockResolvedValue([
      makeWord(1, 'apple', 'pomme'),
      { id: 2, data: 'INVALID_JSON{' }, // Malformé
      makeWord(3, 'cat', 'chat'),
      makeWord(4, 'dog', 'chien'),
      makeWord(5, 'fish', 'poisson'),
    ]);
    const { updateSpacedRepetitionResult, addWordToSRS } = require('@/database/queries');
    updateSpacedRepetitionResult.mockResolvedValue(undefined);
    addWordToSRS.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRevisionQuestions());
    await act(async () => { result.current.startSession('daily'); });

    // Le mot malformé est skippé
    expect(result.current.questions.length).toBeLessThan(5);
    expect(result.current.questions.every(q => q !== null)).toBe(true);
  });
});
