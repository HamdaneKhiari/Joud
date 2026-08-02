/**
 * Tests de hooks — useGuidedDomainSummaries
 * Agrégation SQL par domaine (vocab, dialogues, reading, phrase_types) — seuls les domaines
 * avec activité réelle sont retournés.
 */

import { renderHook, waitFor } from '@testing-library/react-native';

const mockDb = {
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
};

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn().mockReturnValue({ db: mockDb }),
}));

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

import { useGuidedDomainSummaries } from '@/screens/AITutor/hooks/useGuidedDomainSummaries';

// Ordre des requêtes dans le hook :
// 1. vocab: vocabulary_seen (mots)  2. vocab: COUNT semaine  3. vocab: erreurs
// puis pour chacun de dialogues/reading/phrase_types (dans cet ordre) :
//   familiesWorked (getFirstAsync), completed (getFirstAsync), erreurs (getAllAsync), errorCount (getFirstAsync)
const NO_VOCAB = () => {
  mockDb.getAllAsync.mockResolvedValueOnce([]);       // vocabWords
  mockDb.getFirstAsync.mockResolvedValueOnce({ count: 0 }); // vocabWeekCount
  mockDb.getAllAsync.mockResolvedValueOnce([]);       // vocabErrors
};

const EMPTY_MODULE_DOMAIN = () => {
  mockDb.getFirstAsync.mockResolvedValueOnce({ count: 0 }); // familiesWorked
  mockDb.getFirstAsync.mockResolvedValueOnce({ total: 0 });  // completed
  mockDb.getAllAsync.mockResolvedValueOnce([]);              // errors
  mockDb.getFirstAsync.mockResolvedValueOnce({ count: 0 });  // errorCount
};

const resetMocks = () => {
  jest.clearAllMocks();
  mockDb.getAllAsync.mockReset();
  mockDb.getFirstAsync.mockReset();
  const { useUser } = require('@/contexts/UserContext');
  useUser.mockReturnValue({ db: mockDb });
};

// ============================================
// Sans DB
// ============================================

describe('useGuidedDomainSummaries — sans DB', () => {
  it('isLoading passe à false, domains reste vide', async () => {
    resetMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: null });

    const { result } = renderHook(() => useGuidedDomainSummaries());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.domains).toEqual([]);
  });
});

// ============================================
// Aucune activité nulle part
// ============================================

describe('useGuidedDomainSummaries — aucune activité', () => {
  it('retourne un tableau vide si aucun domaine n\'a d\'activité', async () => {
    resetMocks();
    NO_VOCAB();
    EMPTY_MODULE_DOMAIN(); // dialogues
    EMPTY_MODULE_DOMAIN(); // reading
    EMPTY_MODULE_DOMAIN(); // phrase_types

    const { result } = renderHook(() => useGuidedDomainSummaries());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.domains).toEqual([]);
  });
});

// ============================================
// Vocabulaire actif
// ============================================

describe('useGuidedDomainSummaries — vocab actif', () => {
  it('inclut le domaine vocab avec le compte de mots de la semaine et les erreurs', async () => {
    resetMocks();
    mockDb.getAllAsync.mockResolvedValueOnce([
      { word: 'house', translation: 'maison', last_seen: Date.now() },
    ]);
    mockDb.getFirstAsync.mockResolvedValueOnce({ count: 4 }); // vocabWeekCount
    mockDb.getAllAsync.mockResolvedValueOnce([
      { question: 'Q', user_answer: 'A', correct_answer: 'B', family_name: 'Food' },
    ]); // vocabErrors
    EMPTY_MODULE_DOMAIN(); // dialogues
    EMPTY_MODULE_DOMAIN(); // reading
    EMPTY_MODULE_DOMAIN(); // phrase_types

    const { result } = renderHook(() => useGuidedDomainSummaries());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const vocab = result.current.domains.find(d => d.domain === 'vocab');
    expect(vocab).toBeDefined();
    expect(vocab!.hasActivity).toBe(true);
    expect(vocab!.subtitle).toContain('4 mots vus cette semaine');
    expect(vocab!.subtitle).toContain('1 erreur');
    expect(vocab!.stats.recentWords).toEqual([{ word: 'house', translation: 'maison' }]);
  });
});

// ============================================
// Domaine module (dialogues/reading/phrase_types) actif
// ============================================

describe('useGuidedDomainSummaries — domaine module actif', () => {
  it('inclut dialogues si des familles ont été travaillées', async () => {
    resetMocks();
    NO_VOCAB();
    mockDb.getFirstAsync.mockResolvedValueOnce({ count: 2 }); // familiesWorked dialogues
    mockDb.getFirstAsync.mockResolvedValueOnce({ total: 2 });  // completed
    mockDb.getAllAsync.mockResolvedValueOnce([]);              // errors
    mockDb.getFirstAsync.mockResolvedValueOnce({ count: 0 });  // errorCount
    EMPTY_MODULE_DOMAIN(); // reading
    EMPTY_MODULE_DOMAIN(); // phrase_types

    const { result } = renderHook(() => useGuidedDomainSummaries());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const dialogues = result.current.domains.find(d => d.domain === 'dialogues');
    expect(dialogues).toBeDefined();
    expect(dialogues!.subtitle).toBe('2 dialogues termines');
  });

  it('inclut un domaine avec 0 famille mais des erreurs récentes', async () => {
    resetMocks();
    NO_VOCAB();
    EMPTY_MODULE_DOMAIN(); // dialogues
    mockDb.getFirstAsync.mockResolvedValueOnce({ count: 0 }); // familiesWorked reading
    mockDb.getFirstAsync.mockResolvedValueOnce({ total: 0 });  // completed
    mockDb.getAllAsync.mockResolvedValueOnce([
      { question: 'Q', user_answer: 'A', correct_answer: 'B', family_name: 'Texte 1' },
    ]); // errors
    mockDb.getFirstAsync.mockResolvedValueOnce({ count: 1 }); // errorCount
    EMPTY_MODULE_DOMAIN(); // phrase_types

    const { result } = renderHook(() => useGuidedDomainSummaries());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const reading = result.current.domains.find(d => d.domain === 'reading');
    expect(reading).toBeDefined();
    expect(reading!.stats.errorCount).toBe(1);
    expect(reading!.stats.errorExamples[0].familyName).toBe('Texte 1');
  });

  it('phrase_types actif → subtitle basé sur completedCount', async () => {
    resetMocks();
    NO_VOCAB();
    EMPTY_MODULE_DOMAIN(); // dialogues
    EMPTY_MODULE_DOMAIN(); // reading
    mockDb.getFirstAsync.mockResolvedValueOnce({ count: 1 }); // familiesWorked phrase_types
    mockDb.getFirstAsync.mockResolvedValueOnce({ total: 7 });  // completed
    mockDb.getAllAsync.mockResolvedValueOnce([]);              // errors
    mockDb.getFirstAsync.mockResolvedValueOnce({ count: 0 });  // errorCount

    const { result } = renderHook(() => useGuidedDomainSummaries());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const phrases = result.current.domains.find(d => d.domain === 'phrase_types');
    expect(phrases).toBeDefined();
    expect(phrases!.subtitle).toBe('7 phrases construites');
  });
});

// ============================================
// Erreur SQL
// ============================================

describe('useGuidedDomainSummaries — erreur DB', () => {
  it('erreur pendant les requêtes → isLoading passe quand même à false, domains vide', async () => {
    resetMocks();
    mockDb.getAllAsync.mockRejectedValueOnce(new Error('SQL error'));

    const { result } = renderHook(() => useGuidedDomainSummaries());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.domains).toEqual([]);
  });
});
