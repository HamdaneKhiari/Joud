/**
 * ============================================
 * AI CONTEXT
 * Gestion globale de l'état de l'IA Tuteur
 * ============================================
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

// ============================================
// TYPES
// ============================================

interface Message {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
}

export interface AISettings {
  isConfigured: boolean;
  provider: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  maxMessagesPerDay: number;
}

interface AIContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  addChatMessage: (content: string, type: 'user' | 'ai') => void;
  clearMessages: () => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  settings: AISettings;
  canSendMessage: () => boolean;
  incrementUsage: () => void;
}

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
  const [usageCount, setUsageCount] = useState(0);

  const settings: AISettings = {
    isConfigured: true,
    provider: 'mock',
    apiKey: '',
    model: 'mock-model',
    maxTokens: 1000,
    temperature: 0.7,
    maxMessagesPerDay: 50,
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const addChatMessage = (content: string, type: 'user' | 'ai') => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    addMessage(message);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const canSendMessage = () => {
    return usageCount < settings.maxMessagesPerDay;
  };

  const incrementUsage = () => {
    setUsageCount((prev) => prev + 1);
  };

  return (
    <AIContext.Provider
      value={{
        messages,
        addMessage,
        addChatMessage,
        clearMessages,
        isTyping,
        setIsTyping,
        settings,
        canSendMessage,
        incrementUsage,
      }}
    >
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
