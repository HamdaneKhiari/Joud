/**
 * ============================================
 * AI CONTEXT
 * Gestion globale de l'état de l'IA Tuteur
 * Connecté aux vrais settings (useAISettings)
 * ============================================
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { useAISettings, type AISettings } from '@/hooks/useAISettings';

// ============================================
// TYPES
// ============================================

interface Message {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
}

interface AIContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  addChatMessage: (content: string, type: 'user' | 'ai') => void;
  clearMessages: () => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  settings: AISettings;
  isLoadingSettings: boolean;
  canSendMessage: () => boolean;
  incrementUsage: () => void;
  updateSettings: (partial: Partial<AISettings>) => Promise<void>;
  deleteAPIKey: () => Promise<void>;
  getAvailableModels: () => string[];
  refreshSettings: () => Promise<void>;
}

// ============================================
// DEFAULT SETTINGS (quand pas encore configuré)
// ============================================

const DEFAULT_SETTINGS: AISettings = {
  provider: 'openai',
  apiKey: null,
  model: 'gpt-3.5-turbo',
  maxTokens: 500,
  temperature: 0.7,
  maxMessagesPerDay: 50,
  currentUsageCount: 0,
  lastResetDate: 0,
  isConfigured: false,
};

// ============================================
// CONTEXT
// ============================================

const AIContext = createContext<AIContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Charger les vrais settings depuis SQLite + SecureStore
  const {
    settings: realSettings,
    isLoading: isLoadingSettings,
    updateSettings: realUpdateSettings,
    incrementUsage: realIncrementUsage,
    canSendMessage: realCanSendMessage,
    getAvailableModels: realGetAvailableModels,
    deleteAPIKey: realDeleteAPIKey,
    refreshSettings: realRefreshSettings,
  } = useAISettings();

  // Utiliser les vrais settings ou le default
  const settings = realSettings || DEFAULT_SETTINGS;

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const addChatMessage = useCallback((content: string, type: 'user' | 'ai') => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const canSendMessage = useCallback(() => {
    return realCanSendMessage();
  }, [realCanSendMessage]);

  const incrementUsage = useCallback(() => {
    realIncrementUsage();
  }, [realIncrementUsage]);

  const value = useMemo<AIContextType>(() => ({
    messages,
    addMessage,
    addChatMessage,
    clearMessages,
    isTyping,
    setIsTyping,
    settings,
    isLoadingSettings,
    canSendMessage,
    incrementUsage,
    updateSettings: realUpdateSettings,
    deleteAPIKey: realDeleteAPIKey,
    getAvailableModels: realGetAvailableModels,
    refreshSettings: realRefreshSettings,
  }), [
    messages, addMessage, addChatMessage, clearMessages,
    isTyping, settings, isLoadingSettings,
    canSendMessage, incrementUsage,
    realUpdateSettings, realDeleteAPIKey, realGetAvailableModels, realRefreshSettings,
  ]);

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
};

export type { AISettings };
