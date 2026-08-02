/**
 * Tests — AIContext / AIProvider / useAI
 * Couvre : garde hors provider, valeurs par défaut tant que useAISettings charge,
 * messages (add/addChat/clear), isTyping, délégation vers useAISettings.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';

// ============================================
// Mocks
// ============================================

const mockUseAISettings = jest.fn();

jest.mock('@/hooks/useAISettings', () => ({
  useAISettings: () => mockUseAISettings(),
}));

import { AIProvider, useAI } from '@/contexts/AIContext';

const REAL_SETTINGS = {
  provider: 'openai' as const,
  apiKey: 'sk-real-key',
  model: 'gpt-4',
  maxTokens: 500,
  temperature: 0.7,
  maxMessagesPerDay: 50,
  currentUsageCount: 3,
  lastResetDate: Date.now(),
  isConfigured: true,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AIProvider>{children}</AIProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAISettings.mockReturnValue({
    settings: REAL_SETTINGS,
    isLoading: false,
    updateSettings: jest.fn(),
    incrementUsage: jest.fn(),
    canSendMessage: jest.fn().mockReturnValue(true),
    getAvailableModels: jest.fn().mockReturnValue(['gpt-4']),
    deleteAPIKey: jest.fn(),
    refreshSettings: jest.fn(),
  });
});

// ============================================
// Garde hors provider
// ============================================

describe('useAI — hors provider', () => {
  it('lève une erreur explicite si utilisé sans AIProvider', () => {
    // Empêche React de logger l'erreur de rendu dans la sortie de test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAI())).toThrow('useAI must be used within AIProvider');
    spy.mockRestore();
  });
});

// ============================================
// Settings — délégation à useAISettings
// ============================================

describe('AIProvider — settings', () => {
  it('expose les settings réels quand useAISettings a fini de charger', () => {
    const { result } = renderHook(() => useAI(), { wrapper });
    expect(result.current.settings).toEqual(REAL_SETTINGS);
    expect(result.current.isLoadingSettings).toBe(false);
  });

  it('retombe sur les settings par défaut tant que useAISettings charge (settings null)', () => {
    mockUseAISettings.mockReturnValue({
      settings: null,
      isLoading: true,
      updateSettings: jest.fn(),
      incrementUsage: jest.fn(),
      canSendMessage: jest.fn().mockReturnValue(false),
      getAvailableModels: jest.fn().mockReturnValue([]),
      deleteAPIKey: jest.fn(),
      refreshSettings: jest.fn(),
    });

    const { result } = renderHook(() => useAI(), { wrapper });

    expect(result.current.settings.isConfigured).toBe(false);
    expect(result.current.settings.apiKey).toBeNull();
    expect(result.current.isLoadingSettings).toBe(true);
  });

  it('updateSettings/deleteAPIKey/getAvailableModels/refreshSettings délèguent au hook réel', () => {
    const realUpdate = jest.fn();
    const realDelete = jest.fn();
    const realModels = jest.fn().mockReturnValue(['gpt-4', 'gpt-3.5-turbo']);
    const realRefresh = jest.fn();

    mockUseAISettings.mockReturnValue({
      settings: REAL_SETTINGS,
      isLoading: false,
      updateSettings: realUpdate,
      incrementUsage: jest.fn(),
      canSendMessage: jest.fn().mockReturnValue(true),
      getAvailableModels: realModels,
      deleteAPIKey: realDelete,
      refreshSettings: realRefresh,
    });

    const { result } = renderHook(() => useAI(), { wrapper });

    expect(result.current.updateSettings).toBe(realUpdate);
    expect(result.current.deleteAPIKey).toBe(realDelete);
    expect(result.current.getAvailableModels()).toEqual(['gpt-4', 'gpt-3.5-turbo']);
    expect(result.current.refreshSettings).toBe(realRefresh);
  });

  it('canSendMessage/incrementUsage délèguent au hook réel', () => {
    const realCanSend = jest.fn().mockReturnValue(false);
    const realIncrement = jest.fn();

    mockUseAISettings.mockReturnValue({
      settings: REAL_SETTINGS,
      isLoading: false,
      updateSettings: jest.fn(),
      incrementUsage: realIncrement,
      canSendMessage: realCanSend,
      getAvailableModels: jest.fn().mockReturnValue([]),
      deleteAPIKey: jest.fn(),
      refreshSettings: jest.fn(),
    });

    const { result } = renderHook(() => useAI(), { wrapper });

    expect(result.current.canSendMessage()).toBe(false);
    expect(realCanSend).toHaveBeenCalled();

    act(() => { result.current.incrementUsage(); });
    expect(realIncrement).toHaveBeenCalled();
  });
});

// ============================================
// Messages
// ============================================

describe('AIProvider — messages', () => {
  it('commence avec une liste de messages vide', () => {
    const { result } = renderHook(() => useAI(), { wrapper });
    expect(result.current.messages).toEqual([]);
  });

  it('addMessage ajoute le message tel quel', () => {
    const { result } = renderHook(() => useAI(), { wrapper });
    const msg = { id: '1', type: 'user' as const, content: 'hello', timestamp: new Date() };

    act(() => { result.current.addMessage(msg); });

    expect(result.current.messages).toEqual([msg]);
  });

  it('addChatMessage génère un id et un timestamp', () => {
    const { result } = renderHook(() => useAI(), { wrapper });

    act(() => { result.current.addChatMessage('salut', 'user'); });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({ type: 'user', content: 'salut' });
    expect(result.current.messages[0].timestamp).toBeInstanceOf(Date);
  });

  it('les messages s\'accumulent dans l\'ordre', () => {
    const { result } = renderHook(() => useAI(), { wrapper });

    act(() => {
      result.current.addChatMessage('un', 'user');
      result.current.addChatMessage('deux', 'ai');
    });

    expect(result.current.messages.map(m => m.content)).toEqual(['un', 'deux']);
  });

  it('clearMessages vide la liste', () => {
    const { result } = renderHook(() => useAI(), { wrapper });

    act(() => { result.current.addChatMessage('salut', 'user'); });
    expect(result.current.messages).toHaveLength(1);

    act(() => { result.current.clearMessages(); });
    expect(result.current.messages).toEqual([]);
  });
});

// ============================================
// isTyping
// ============================================

describe('AIProvider — isTyping', () => {
  it('commence à false et peut être activé/désactivé', () => {
    const { result } = renderHook(() => useAI(), { wrapper });
    expect(result.current.isTyping).toBe(false);

    act(() => { result.current.setIsTyping(true); });
    expect(result.current.isTyping).toBe(true);

    act(() => { result.current.setIsTyping(false); });
    expect(result.current.isTyping).toBe(false);
  });
});
