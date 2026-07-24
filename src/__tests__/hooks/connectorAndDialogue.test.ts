/**
 * Tests: useConnectorHandlers + useDialogueContent
 */

import { renderHook, act } from '@testing-library/react-native';
import type { useConnectorHandlers as UseConnectorHandlersType } from '@/screens/ConnectorScreen/hooks/useConnectorHandlers';

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0));

// ──────────────────────────────────────────────
// useConnectorHandlers
// ──────────────────────────────────────────────

describe('useConnectorHandlers', () => {
  const { useConnectorState } = require('@/screens/ConnectorScreen/hooks/useConnectorState');
  const { useConnectorHandlers } = require('@/screens/ConnectorScreen/hooks/useConnectorHandlers');

  const makeLogicQ = (correctAnswer = 'because') => ({
    type: 'logic',
    sentence: 'She studies ___ she wants to pass.',
    options: ['because', 'although', 'however'],
    correctAnswer,
  });

  const makeFusionQ = (correctAnswer = 'I like coffee because it is hot.') => ({
    type: 'fusion',
    sentence1: 'I like coffee.',
    sentence2: 'It is hot.',
    correctAnswer,
  });

  function useSetup(question: object | undefined, isLast = false) {
    const states = useConnectorState('logic');
    const onNavigateBack = jest.fn();
    const setCurrentQuestionIndex = jest.fn();
    const onValidationSuccess = jest.fn();
    const recordError = jest.fn();
    const handlers = useConnectorHandlers({
      question: question as unknown as Parameters<typeof UseConnectorHandlersType>[0]['question'],
      isLastQuestion: isLast,
      onNavigateBack,
      setCurrentQuestionIndex,
      states,
      onValidationSuccess,
      recordError,
    });
    return { states, handlers, onNavigateBack, setCurrentQuestionIndex, onValidationSuccess, recordError };
  }

  it('logic.onAnswer sélectionne une option', () => {
    const { result } = renderHook(() => useSetup(makeLogicQ()));
    act(() => { result.current.handlers.logic.onAnswer('because'); });
    expect(result.current.states.logicState.selectedOption).toBe('because');
  });

  it('logic.onValidate avec bonne réponse → isCorrect=true', () => {
    const { result } = renderHook(() => useSetup(makeLogicQ('because')));
    act(() => { result.current.handlers.logic.onAnswer('because'); });
    act(() => { result.current.handlers.logic.onValidate(); });
    expect(result.current.states.logicState.isCorrect).toBe(true);
    expect(result.current.states.logicState.isValidated).toBe(true);
  });

  it('logic.onValidate avec mauvaise réponse → isCorrect=false', () => {
    const { result } = renderHook(() => useSetup(makeLogicQ('because')));
    act(() => { result.current.handlers.logic.onAnswer('however'); });
    act(() => { result.current.handlers.logic.onValidate(); });
    expect(result.current.states.logicState.isCorrect).toBe(false);
    expect(result.current.states.logicState.isValidated).toBe(true);
  });

  it('logic.onValidate sans option → rien ne se passe', () => {
    const { result } = renderHook(() => useSetup(makeLogicQ()));
    act(() => { result.current.handlers.logic.onValidate(); });
    expect(result.current.states.logicState.isValidated).toBe(false);
  });

  it('logic.onRetry remet l\'état à zéro', () => {
    const { result } = renderHook(() => useSetup(makeLogicQ()));
    act(() => { result.current.handlers.logic.onAnswer('because'); });
    act(() => { result.current.handlers.logic.onValidate(); });
    act(() => { result.current.handlers.logic.onRetry(); });
    expect(result.current.states.logicState.selectedOption).toBeUndefined();
    expect(result.current.states.logicState.isValidated).toBe(false);
  });

  it('onNext sur dernière question → onNavigateBack()', () => {
    const { result } = renderHook(() => useSetup(makeLogicQ(), true));
    act(() => { result.current.handlers.logic.onNext(); });
    expect(result.current.onNavigateBack).toHaveBeenCalled();
    expect(result.current.setCurrentQuestionIndex).not.toHaveBeenCalled();
  });

  it('onNext pas dernière question → avance l\'index', () => {
    const { result } = renderHook(() => useSetup(makeLogicQ(), false));
    act(() => { result.current.handlers.logic.onNext(); });
    expect(result.current.setCurrentQuestionIndex).toHaveBeenCalled();
    expect(result.current.onNavigateBack).not.toHaveBeenCalled();
  });

  it('fusion.onAnswer met à jour userAnswer', () => {
    const { result } = renderHook(() => useSetup(makeFusionQ()));
    act(() => { result.current.handlers.fusion.onAnswer('I like coffee because it is hot.'); });
    expect(result.current.states.fusionState.userAnswer).toBe('I like coffee because it is hot.');
  });

  it('fusion.onValidate — normalisation (casse + espaces)', () => {
    const { result } = renderHook(() => useSetup(makeFusionQ('I like coffee because it is hot.')));
    act(() => { result.current.handlers.fusion.onAnswer('  I LIKE COFFEE BECAUSE IT IS HOT.  '); });
    act(() => { result.current.handlers.fusion.onValidate(); });
    expect(result.current.states.fusionState.isCorrect).toBe(true);
  });

  it('fusion.onRetry remet à zéro', () => {
    const { result } = renderHook(() => useSetup(makeFusionQ()));
    act(() => { result.current.handlers.fusion.onAnswer('wrong'); });
    act(() => { result.current.handlers.fusion.onRetry(); });
    expect(result.current.states.fusionState.userAnswer).toBeUndefined();
    expect(result.current.states.fusionState.isValidated).toBe(false);
  });
});

// ──────────────────────────────────────────────
// useDialogueContent
// ──────────────────────────────────────────────

describe('useDialogueContent', () => {
  const { useDialogueContent } = require('@/screens/DialoguesScreen/hooks/useDialogueContent');

  const makeDb = (rows: object[], family: object | null = { name: 'At the café', icon: '☕' }) => ({
    getAllAsync: jest.fn().mockResolvedValue(rows),
    getFirstAsync: jest.fn().mockResolvedValue(family),
  });

  const makeRawDialogue = (overrides = {}) => ({
    name: 'At the café',
    messages: [
      { speaker: 'Alice', text: 'Hello!' },
      { speaker: 'Bob', text: 'Hi there!' },
    ],
    questions: [
      { question: 'Where are they?', options: ['café', 'park', 'home'], correctAnswer: 0 },
    ],
    ...overrides,
  });

  it('db=null → isLoading=false, dialogue=null', async () => {
    const { result } = renderHook(() => useDialogueContent(null, 'f1', 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.dialogue).toBeNull();
  });

  it('familyId vide → isLoading=false', async () => {
    const db = makeDb([]);
    const { result } = renderHook(() => useDialogueContent(db, '', 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.isLoading).toBe(false);
  });

  it('rows vides → dialogue reste null', async () => {
    const db = makeDb([]);
    const { result } = renderHook(() => useDialogueContent(db, '1', 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.dialogue).toBeNull();
  });

  it('charge un dialogue avec messages et questions', async () => {
    const db = makeDb([{ id: 1, data: JSON.stringify(makeRawDialogue()) }]);
    const { result } = renderHook(() => useDialogueContent(db, '1', 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.dialogue?.name).toBe('At the café');
    expect(result.current.dialogue?.messages).toHaveLength(2);
    expect(result.current.dialogue?.questions).toHaveLength(1);
  });

  it('construit les characters depuis speakers si absent du JSON', async () => {
    const rawData = makeRawDialogue();
    delete (rawData as Record<string, unknown>).characters;
    const db = makeDb([{ id: 1, data: JSON.stringify(rawData) }]);
    const { result } = renderHook(() => useDialogueContent(db, '1', 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.dialogue?.characters).toHaveLength(2);
    expect(result.current.dialogue?.characters[0].name).toBe('Alice');
  });

  it('mapQuestion: correct_answer string → trouve l\'index dans options', async () => {
    const raw = makeRawDialogue({
      questions: [{ question: 'Pick one', options: ['a', 'b', 'c'], correct_answer: 'b' }],
    });
    const db = makeDb([{ id: 1, data: JSON.stringify(raw) }]);
    const { result } = renderHook(() => useDialogueContent(db, '1', 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.dialogue?.questions[0].correctAnswer).toBe(1);
  });

  it('mapQuestion: correct_answer string non trouvé → défaut 0', async () => {
    const raw = makeRawDialogue({
      questions: [{ question: 'Pick', options: ['a', 'b'], correct_answer: 'z' }],
    });
    const db = makeDb([{ id: 1, data: JSON.stringify(raw) }]);
    const { result } = renderHook(() => useDialogueContent(db, '1', 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.dialogue?.questions[0].correctAnswer).toBe(0);
  });

  it('compatibilité: utilise rawData.dialogue si messages absent', async () => {
    const raw = {
      name: 'Test',
      dialogue: [{ speaker: 'Ana', text: 'Hello' }],
      questions: [],
    };
    const db = makeDb([{ id: 1, data: JSON.stringify(raw) }]);
    const { result } = renderHook(() => useDialogueContent(db, '1', 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.dialogue?.messages).toHaveLength(1);
  });

  it('erreur DB → isLoading=false', async () => {
    const db = { getAllAsync: jest.fn().mockRejectedValue(new Error('crash')), getFirstAsync: jest.fn() };
    const { result } = renderHook(() => useDialogueContent(db, '1', 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.isLoading).toBe(false);
  });
});
