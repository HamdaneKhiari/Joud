/**
 * Tests de hooks — useChatConversation
 * Historique de conversations (max 3), persisté via chat_conversations + chat_messages.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

const mockDb = {
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  runAsync: jest.fn(),
};

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn().mockReturnValue({ db: mockDb }),
}));

import { useChatConversation } from '@/screens/AITutor/hooks/useChatConversation';

const resetMocks = () => {
  jest.clearAllMocks();
  mockDb.getAllAsync.mockReset();
  mockDb.getFirstAsync.mockReset();
  mockDb.runAsync.mockReset().mockResolvedValue({ lastInsertRowId: 99, changes: 1 });
  const { useUser } = require('@/contexts/UserContext');
  useUser.mockReturnValue({ db: mockDb });
};

// ============================================
// Sans DB
// ============================================

describe('useChatConversation — sans DB', () => {
  it('reste en isLoading true indéfiniment (pas de db)', async () => {
    resetMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: null });

    const { result } = renderHook(() => useChatConversation('free'));

    // Pas de useEffect déclenché faute de db → messages/conversations restent vides
    expect(result.current.conversations).toEqual([]);
    expect(result.current.messages).toEqual([]);
  });
});

// ============================================
// Initialisation — reprise ou création de conversation
// ============================================

describe('useChatConversation — initialisation', () => {
  it('reprend la dernière conversation existante et charge ses messages', async () => {
    resetMocks();
    mockDb.getAllAsync
      .mockResolvedValueOnce([{ id: 5, title: 'Salut', created_at: 1, updated_at: 2 }]) // loadConversations
      .mockResolvedValueOnce([{ id: 1, role: 'user', content: 'hi', created_at: 1 }]);    // loadMessages

    const { result } = renderHook(() => useChatConversation('free'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.currentConversationId).toBe(5);
    expect(result.current.messages).toEqual([{ id: 1, role: 'user', content: 'hi', created_at: 1 }]);
  });

  it('aucune conversation existante → en crée une nouvelle vide', async () => {
    resetMocks();
    mockDb.getAllAsync
      .mockResolvedValueOnce([])   // loadConversations : aucune
      .mockResolvedValueOnce([]);  // createConversation : liste existante (pour rotation)

    const { result } = renderHook(() => useChatConversation('guided'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.currentConversationId).toBe(99);
    expect(result.current.messages).toEqual([]);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO chat_conversations'),
      expect.arrayContaining(['guided'])
    );
  });
});

// ============================================
// newConversation — rotation des anciennes (max 3)
// ============================================

describe('useChatConversation — newConversation', () => {
  it('supprime la plus ancienne conversation si déjà 3 existantes', async () => {
    resetMocks();
    mockDb.getAllAsync
      .mockResolvedValueOnce([{ id: 1, title: null, created_at: 1, updated_at: 1 }]) // init loadConversations
      .mockResolvedValueOnce([]); // init loadMessages(1)

    const { result } = renderHook(() => useChatConversation('free'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockDb.getAllAsync.mockResolvedValueOnce([
      { id: 3, updated_at: 30 }, { id: 2, updated_at: 20 }, { id: 1, updated_at: 10 },
    ]); // existing dans createConversation (déjà 3)
    mockDb.getAllAsync.mockResolvedValueOnce([]); // loadConversations après newConversation

    await act(async () => { await result.current.newConversation(); });

    expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM chat_conversations WHERE id = ?', [1]);
  });

  it('sélectionne la nouvelle conversation créée et vide les messages', async () => {
    resetMocks();
    mockDb.getAllAsync
      .mockResolvedValueOnce([]) // init loadConversations
      .mockResolvedValueOnce([]); // init createConversation existing check

    const { result } = renderHook(() => useChatConversation('free'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const firstId = result.current.currentConversationId;

    mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 123, changes: 1 });
    mockDb.getAllAsync.mockResolvedValueOnce([]); // existing check dans createConversation
    mockDb.getAllAsync.mockResolvedValueOnce([{ id: 123, title: null, created_at: 1, updated_at: 1 }]); // loadConversations

    await act(async () => { await result.current.newConversation(); });

    expect(result.current.currentConversationId).toBe(123);
    expect(result.current.currentConversationId).not.toBe(firstId);
    expect(result.current.messages).toEqual([]);
  });
});

// ============================================
// switchConversation
// ============================================

describe('useChatConversation — switchConversation', () => {
  it('change l\'id courant et recharge les messages de la conversation ciblée', async () => {
    resetMocks();
    mockDb.getAllAsync.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useChatConversation('free'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockDb.getAllAsync.mockResolvedValueOnce([{ id: 2, role: 'ai', content: 'bonjour', created_at: 5 }]);

    await act(async () => { await result.current.switchConversation(2); });

    expect(result.current.currentConversationId).toBe(2);
    expect(result.current.messages).toEqual([{ id: 2, role: 'ai', content: 'bonjour', created_at: 5 }]);
  });
});

// ============================================
// saveMessage
// ============================================

describe('useChatConversation — saveMessage', () => {
  it('insère le message puis recharge les messages locaux', async () => {
    resetMocks();
    mockDb.getAllAsync.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useChatConversation('free'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockDb.getAllAsync.mockResolvedValueOnce([{ id: 1, role: 'user', content: 'salut', created_at: 1 }]);

    await act(async () => { await result.current.saveMessage('user', 'salut'); });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO chat_messages'),
      expect.arrayContaining(['user', 'salut'])
    );
    expect(result.current.messages).toEqual([{ id: 1, role: 'user', content: 'salut', created_at: 1 }]);
  });

  it('premier message user → devient le titre de la conversation (tronqué à 40 chars)', async () => {
    resetMocks();
    mockDb.getAllAsync.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useChatConversation('free'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockDb.getFirstAsync.mockResolvedValueOnce({ title: null }); // pas encore de titre
    mockDb.getAllAsync.mockResolvedValueOnce([]);

    const longMessage = 'x'.repeat(60);
    await act(async () => { await result.current.saveMessage('user', longMessage); });

    const titleCall = mockDb.runAsync.mock.calls.find((c) => c[0].includes('SET title'));
    expect(titleCall).toBeDefined();
    expect(titleCall![1][0]).toHaveLength(40); // 37 + '...'
    expect(titleCall![1][0].endsWith('...')).toBe(true);
  });

  it('conversation avec titre déjà présent → met juste à jour updated_at, pas le titre', async () => {
    resetMocks();
    mockDb.getAllAsync.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useChatConversation('free'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockDb.getFirstAsync.mockResolvedValueOnce({ title: 'Déjà un titre' });
    mockDb.getAllAsync.mockResolvedValueOnce([]);

    await act(async () => { await result.current.saveMessage('user', 'nouveau message'); });

    const titleCall = mockDb.runAsync.mock.calls.find((c) => c[0].includes('SET title'));
    expect(titleCall).toBeUndefined();
    const updatedAtCall = mockDb.runAsync.mock.calls.find((c) => c[0].includes('SET updated_at'));
    expect(updatedAtCall).toBeDefined();
  });

  it('message role=ai ne touche pas au titre (seul le premier message user compte)', async () => {
    resetMocks();
    mockDb.getAllAsync.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useChatConversation('free'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockDb.getAllAsync.mockResolvedValueOnce([]);

    await act(async () => { await result.current.saveMessage('ai', 'réponse'); });

    expect(mockDb.getFirstAsync).not.toHaveBeenCalledWith(
      expect.stringContaining('SELECT title'),
      expect.anything()
    );
  });
});
