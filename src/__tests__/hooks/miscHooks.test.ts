/**
 * Tests: useSafeNavigation + useReadingContent + useSubfamilies
 */

import { renderHook, act } from '@testing-library/react-native';

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));
jest.mock('@/contexts/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('@/contexts/ProgressContext', () => ({ useProgress: jest.fn() }));
jest.mock('@/themes/ThemeContext', () => ({ useTheme: jest.fn() }));
jest.mock('@/services/subfamilyService', () => ({ getSubFamiliesByFamily: jest.fn() }));
jest.mock('@react-navigation/native', () => ({ useNavigation: jest.fn() }));
jest.mock('@/hooks/useSafeAction', () => ({
  __esModule: true,
  default: jest.fn(),
}));
// useFocusEffect : appelle le callback une fois (React.useCallback pattern)
jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn((cb) => {
    // cb est déjà un useCallback — on l'appelle une fois au mount
    cb();
  }),
}));

const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0));

// ──────────────────────────────────────────────
// useSafeNavigation
// ──────────────────────────────────────────────

describe('useSafeNavigation', () => {
  const mockExecute = jest.fn().mockResolvedValue('ok');
  const mockSafeAction = {
    execute: mockExecute,
    loading: false,
    disabled: false,
    lastExecuted: 0,
    cleanup: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useNavigation } = require('@react-navigation/native');
    useNavigation.mockReturnValue({ canGoBack: jest.fn().mockReturnValue(true), goBack: jest.fn() });
    require('@/hooks/useSafeAction').default.mockReturnValue(mockSafeAction);
  });

  it('retourne les propriétés attendues', () => {
    const useSafeNavigation = require('@/hooks/useSafeNavigation').default;
    const { result } = renderHook(() => useSafeNavigation());
    expect(result.current.navigate).toBeDefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.canNavigate).toBe(true);
  });

  it('navigate appelle safeAction.execute', async () => {
    const useSafeNavigation = require('@/hooks/useSafeNavigation').default;
    const { result } = renderHook(() => useSafeNavigation());
    await act(async () => { await result.current.navigate(); });
    expect(mockExecute).toHaveBeenCalled();
  });

  it('navigate retourne un objet error si execute lance', async () => {
    mockExecute.mockRejectedValueOnce(new Error('nav error'));
    const useSafeNavigation = require('@/hooks/useSafeNavigation').default;
    const { result } = renderHook(() => useSafeNavigation());
    let returnVal: unknown;
    await act(async () => { returnVal = await result.current.navigate(); });
    expect((returnVal as { error: boolean }).error).toBe(true);
  });

  it('utilise l\'action fournie plutôt que goBack par défaut', () => {
    const customAction = jest.fn().mockResolvedValue(undefined);
    const useSafeNavigation = require('@/hooks/useSafeNavigation').default;
    renderHook(() => useSafeNavigation(customAction));
    // safeAction a été créé avec l'action fournie
    const useSafeAction = require('@/hooks/useSafeAction').default;
    const [actionArg] = useSafeAction.mock.calls[0];
    expect(actionArg).toBe(customAction);
  });
});

// ──────────────────────────────────────────────
// useExerciseBackNavigation
// ──────────────────────────────────────────────

describe('useExerciseBackNavigation', () => {
  const mockGoBack = jest.fn();
  const mockSaveProgressNow = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveProgressNow.mockResolvedValue(undefined);
    const { useNavigation } = require('@react-navigation/native');
    useNavigation.mockReturnValue({ canGoBack: jest.fn().mockReturnValue(true), goBack: mockGoBack });
    require('@/contexts/ProgressContext').useProgress.mockReturnValue({ saveProgressNow: mockSaveProgressNow });
    // useSafeAction ne rappelle pas vraiment l'action fournie — on la récupère et on
    // l'invoque nous-mêmes pour vérifier l'ordre attendre-sauvegarde-puis-naviguer.
    require('@/hooks/useSafeAction').default.mockImplementation((action: () => Promise<void>) => ({
      execute: action, loading: false, disabled: false, lastExecuted: 0, cleanup: jest.fn(),
    }));
  });

  it('attend saveProgressNow avant d\'appeler goBack (évite de lire une progression périmée)', async () => {
    const order: string[] = [];
    mockSaveProgressNow.mockImplementation(async () => { order.push('save'); });
    mockGoBack.mockImplementation(() => { order.push('goBack'); });

    const useExerciseBackNavigation = require('@/hooks/exercises/useExerciseBackNavigation').default;
    const { result } = renderHook(() => useExerciseBackNavigation());
    await act(async () => { await result.current.navigate(); });

    expect(order).toEqual(['save', 'goBack']);
  });

  it('n\'appelle pas goBack si canGoBack() est false', async () => {
    const { useNavigation } = require('@react-navigation/native');
    useNavigation.mockReturnValue({ canGoBack: jest.fn().mockReturnValue(false), goBack: mockGoBack });

    const useExerciseBackNavigation = require('@/hooks/exercises/useExerciseBackNavigation').default;
    const { result } = renderHook(() => useExerciseBackNavigation());
    await act(async () => { await result.current.navigate(); });

    expect(mockSaveProgressNow).toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────
// useReadingContent
// ──────────────────────────────────────────────

describe('useReadingContent', () => {
  const { useReadingContent } = require('@/screens/ReadingScreen/hooks/useReadingContent');

  it('db=null → loading=false, questions=[]', async () => {
    const { result } = renderHook(() => useReadingContent(null, 1, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.loading).toBe(false);
    expect(result.current.questions).toEqual([]);
  });

  it('familyId undefined → loading=false', async () => {
    const db = { getAllAsync: jest.fn() };
    const { result } = renderHook(() => useReadingContent(db, undefined, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.loading).toBe(false);
    expect(db.getAllAsync).not.toHaveBeenCalled();
  });

  it('charge et parse les questions de lecture', async () => {
    const rawQuestion = {
      passage: 'The quick brown fox...',
      question_text: 'What color is the fox?',
      options: ['A', 'B', 'C'],
      correct_answer: 'A',
    };
    const db = { getAllAsync: jest.fn().mockResolvedValue([{ data: JSON.stringify(rawQuestion) }]) };
    const { result } = renderHook(() => useReadingContent(db, 1, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.questions).toHaveLength(1);
    expect(result.current.questions[0].passage).toBe('The quick brown fox...');
  });

  it('filtre les lignes sans passage ou question_text', async () => {
    const db = { getAllAsync: jest.fn().mockResolvedValue([
      { data: JSON.stringify({ passage: 'foo', question_text: 'bar', options: [], correct_answer: 'A' }) },
      { data: JSON.stringify({ title: 'no passage here' }) },
    ]) };
    const { result } = renderHook(() => useReadingContent(db, 1, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.questions).toHaveLength(1);
  });

  it('erreur DB → loading=false, questions=[]', async () => {
    const db = { getAllAsync: jest.fn().mockRejectedValue(new Error('fail')) };
    const { result } = renderHook(() => useReadingContent(db, 1, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.loading).toBe(false);
    expect(result.current.questions).toEqual([]);
  });

  it('filtre une ligne réelle sans options (ne plante pas) au lieu de la laisser passer', async () => {
    const db = { getAllAsync: jest.fn().mockResolvedValue([
      { data: JSON.stringify({ passage: 'foo', question_text: 'bar', correct_answer: 'A' }) },
    ]) };
    const { result } = renderHook(() => useReadingContent(db, 1, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.questions).toEqual([]);
  });

  it('filtre une ligne réelle sans correct_answer (ne plante pas)', async () => {
    const db = { getAllAsync: jest.fn().mockResolvedValue([
      { data: JSON.stringify({ passage: 'foo', question_text: 'bar', options: ['A', 'B'] }) },
    ]) };
    const { result } = renderHook(() => useReadingContent(db, 1, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.questions).toEqual([]);
  });
});

