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

interface AIContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
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

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <AIContext.Provider
      value={{
        messages,
        addMessage,
        clearMessages,
        isTyping,
        setIsTyping,
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
