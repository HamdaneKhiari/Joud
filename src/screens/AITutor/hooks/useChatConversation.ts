/**
 * ============================================
 * HOOK: useChatConversation
 * Gestion de l'historique des conversations (max 3)
 * Persistance dans SQLite via chat_conversations + chat_messages
 * ============================================
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';

// ============================================
// TYPES
// ============================================

export interface ChatMessage {
  id: number;
  role: 'user' | 'ai' | 'error';
  content: string;
  source?: string;   // 'ai' | 'joud_academy' | 'ai_api'
  provider?: string; // 'openai' | 'mistral' | 'claude' | 'mock'
  created_at: number;
}

export interface ChatConversation {
  id: number;
  title: string | null;
  created_at: number;
  updated_at: number;
}

// ============================================
// CONSTANTES
// ============================================

const MAX_CONVERSATIONS = 3;

// ============================================
// HOOK
// ============================================

export const useChatConversation = (mode: 'free' | 'guided' = 'free') => {
  const { db } = useUser();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Référence pour éviter les double-chargements en Strict Mode
  const loadedRef = useRef(false);

  // =================== CHARGER LA LISTE ===================
  const loadConversations = useCallback(async () => {
    if (!db || typeof db === 'number') return;

    const rows = await db.getAllAsync<ChatConversation>(
      `SELECT id, title, created_at, updated_at
       FROM chat_conversations
       WHERE mode = ?
       ORDER BY updated_at DESC
       LIMIT ?`,
      [mode, MAX_CONVERSATIONS]
    );

    setConversations(rows);
    return rows;
  }, [db, mode]);

  // =================== CHARGER LES MESSAGES ===================
  const loadMessages = useCallback(async (conversationId: number) => {
    if (!db || typeof db === 'number') return;

    const rows = await db.getAllAsync<ChatMessage>(
      `SELECT id, role, content, source, provider, created_at
       FROM chat_messages
       WHERE conversation_id = ?
       ORDER BY created_at ASC`,
      [conversationId]
    );

    setMessages(rows);
  }, [db]);

  // =================== INIT : ouvre la dernière conversation ou en crée une ===================
  useEffect(() => {
    if (!db || typeof db === 'number' || loadedRef.current) return;
    loadedRef.current = true;

    const init = async () => {
      setIsLoading(true);
      try {
        const rows = await loadConversations();
        if (rows && rows.length > 0) {
          // Reprendre la dernière conversation
          setCurrentConversationId(rows[0].id);
          await loadMessages(rows[0].id);
        } else {
          // Aucune conversation : on en crée une
          const id = await createConversation();
          if (id) {
            setCurrentConversationId(id);
            setMessages([]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [db, loadConversations, loadMessages]);

  // =================== CRÉER une nouvelle conversation ===================
  const createConversation = useCallback(async (): Promise<number | null> => {
    if (!db || typeof db === 'number') return null;

    const now = Date.now();

    // Si déjà MAX_CONVERSATIONS, supprimer la plus ancienne
    const existing = await db.getAllAsync<{ id: number }>(
      `SELECT id FROM chat_conversations WHERE mode = ? ORDER BY updated_at DESC`,
      [mode]
    );

    if (existing.length >= MAX_CONVERSATIONS) {
      const oldest = existing[existing.length - 1];
      await db.runAsync('DELETE FROM chat_conversations WHERE id = ?', [oldest.id]);
    }

    const result = await db.runAsync(
      `INSERT INTO chat_conversations (mode, title, created_at, updated_at) VALUES (?, NULL, ?, ?)`,
      [mode, now, now]
    );

    return result.lastInsertRowId as number;
  }, [db, mode]);

  // =================== Nouvelle conversation (publique) ===================
  const newConversation = useCallback(async (): Promise<number | null> => {
    const id = await createConversation();
    if (id) {
      setCurrentConversationId(id);
      setMessages([]);
      await loadConversations();
    }
    return id;
  }, [createConversation, loadConversations]);

  // =================== Changer de conversation ===================
  const switchConversation = useCallback(async (id: number) => {
    setCurrentConversationId(id);
    await loadMessages(id);
  }, [loadMessages]);

  // =================== Sauvegarder un message ===================
  const saveMessage = useCallback(async (
    role: 'user' | 'ai' | 'error',
    content: string,
    source?: string,
    provider?: string
  ) => {
    if (!db || typeof db === 'number' || !currentConversationId) return;

    const now = Date.now();

    await db.runAsync(
      `INSERT INTO chat_messages (conversation_id, role, content, source, provider, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [currentConversationId, role, content, source ?? null, provider ?? null, now]
    );

    // Met à jour updated_at + title (premier message utilisateur = titre)
    if (role === 'user') {
      const conv = await db.getFirstAsync<{ title: string | null }>(
        'SELECT title FROM chat_conversations WHERE id = ?',
        [currentConversationId]
      );

      if (!conv?.title) {
        // Premier message → devient le titre (tronqué à 40 chars)
        const title = content.length > 40 ? content.slice(0, 37) + '...' : content;
        await db.runAsync(
          'UPDATE chat_conversations SET title = ?, updated_at = ? WHERE id = ?',
          [title, now, currentConversationId]
        );
      } else {
        await db.runAsync(
          'UPDATE chat_conversations SET updated_at = ? WHERE id = ?',
          [now, currentConversationId]
        );
      }
    }

    // Rafraîchir les messages locaux
    await loadMessages(currentConversationId);
  }, [db, currentConversationId, loadMessages]);

  // =================== RETOUR ===================
  return {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    saveMessage,
    newConversation,
    switchConversation,
  };
};
