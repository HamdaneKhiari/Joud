/**
 * Tests: useConnectorContent + useRevisions
 * DB content loaders — même pattern : guard db + query + setLoading.
 */

import { renderHook, act } from '@testing-library/react-native';

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));
jest.mock('@/contexts/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('@/database/queries', () => ({ getWordsToReview: jest.fn() }));

const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0));

// ──────────────────────────────────────────────
// useConnectorContent
// ──────────────────────────────────────────────

describe('useConnectorContent', () => {
  it('db=null → loading=false, questions=[]', async () => {
    const { useConnectorContent } = require('@/screens/ConnectorScreen/hooks/useConnectorContent');
    const { result } = renderHook(() => useConnectorContent(null, 1, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.loading).toBe(false);
    expect(result.current.questions).toEqual([]);
  });

  it('familyId undefined → loading=false', async () => {
    const { useConnectorContent } = require('@/screens/ConnectorScreen/hooks/useConnectorContent');
    const db = { getAllAsync: jest.fn() };
    const { result } = renderHook(() => useConnectorContent(db, undefined, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.loading).toBe(false);
    expect(db.getAllAsync).not.toHaveBeenCalled();
  });

  it('charge et parse les questions', async () => {
    const { useConnectorContent } = require('@/screens/ConnectorScreen/hooks/useConnectorContent');
    const rows = [
      { id: 1, content_type: 'logic', data: JSON.stringify({ sentence: 'She studies ... she wants to pass.', connector: 'because' }) },
      { id: 2, content_type: 'fusion', data: JSON.stringify({ sentence1: 'I like coffee.', sentence2: 'It is hot.' }) },
    ];
    const db = { getAllAsync: jest.fn().mockResolvedValue(rows) };
    const { result } = renderHook(() => useConnectorContent(db, 1, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.questions).toHaveLength(2);
    expect(result.current.questions[0].type).toBe('logic');
    expect(result.current.questions[1].type).toBe('fusion');
  });

  it('résultat DB vide → questions=[]', async () => {
    const { useConnectorContent } = require('@/screens/ConnectorScreen/hooks/useConnectorContent');
    const db = { getAllAsync: jest.fn().mockResolvedValue([]) };
    const { result } = renderHook(() => useConnectorContent(db, 1, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.questions).toEqual([]);
  });

  it('erreur DB → loading=false', async () => {
    const { useConnectorContent } = require('@/screens/ConnectorScreen/hooks/useConnectorContent');
    const db = { getAllAsync: jest.fn().mockRejectedValue(new Error('fail')) };
    const { result } = renderHook(() => useConnectorContent(db, 1, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.loading).toBe(false);
  });

  it('une ligne au JSON malformé est ignorée sans faire échouer les autres', async () => {
    const { useConnectorContent } = require('@/screens/ConnectorScreen/hooks/useConnectorContent');
    const rows = [
      { id: 1, content_type: 'logic', data: 'not valid json{' },
      { id: 2, content_type: 'fusion', data: JSON.stringify({ sentence1: 'I like coffee.', sentence2: 'It is hot.' }) },
    ];
    const db = { getAllAsync: jest.fn().mockResolvedValue(rows) };
    const { result } = renderHook(() => useConnectorContent(db, 1, 1));
    await act(async () => { await flushPromises(); });
    expect(result.current.questions).toHaveLength(1);
    expect(result.current.questions[0].id).toBe(2);
  });
});

// ──────────────────────────────────────────────
// useRevisions
// ──────────────────────────────────────────────

describe('useRevisions', () => {
  const { useUser } = require('@/contexts/UserContext');
  const { getWordsToReview } = require('@/database/queries');

  const mockDb = { getAllAsync: jest.fn(), getFirstAsync: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('db=null → isLoading=false, wordsToReview=0', async () => {
    useUser.mockReturnValue({ db: null, user: null });
    const { useRevisions } = require('@/hooks/dashboard/useRevisions');
    const { result } = renderHook(() => useRevisions());
    await act(async () => { await flushPromises(); });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.wordsToReview).toBe(0);
  });

  it('charge le nombre de mots à réviser', async () => {
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    (getWordsToReview as jest.Mock).mockResolvedValue(7);
    const { useRevisions } = require('@/hooks/dashboard/useRevisions');
    const { result } = renderHook(() => useRevisions());
    await act(async () => { await flushPromises(); });
    expect(result.current.wordsToReview).toBe(7);
    expect(result.current.isLoading).toBe(false);
  });

  it('erreur DB → wordsToReview=0', async () => {
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    (getWordsToReview as jest.Mock).mockRejectedValue(new Error('DB fail'));
    const { useRevisions } = require('@/hooks/dashboard/useRevisions');
    const { result } = renderHook(() => useRevisions());
    await act(async () => { await flushPromises(); });
    expect(result.current.wordsToReview).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('refresh() re-déclenche le fetch', async () => {
    useUser.mockReturnValue({ db: mockDb, user: { id: 1 } });
    (getWordsToReview as jest.Mock).mockResolvedValueOnce(3).mockResolvedValueOnce(8);
    const { useRevisions } = require('@/hooks/dashboard/useRevisions');
    const { result } = renderHook(() => useRevisions());
    await act(async () => { await flushPromises(); });
    expect(result.current.wordsToReview).toBe(3);
    await act(async () => { result.current.refresh(); await flushPromises(); });
    expect(result.current.wordsToReview).toBe(8);
  });
});
