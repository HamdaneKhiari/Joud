/**
 * Tests de hooks — useAIConfigCheck
 * Gate avant l'envoi d'un message : config requise, puis quota quotidien.
 */

import { renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { useAIConfigCheck } from '@/screens/AITutor/hooks/useAIConfigCheck';

const SETTINGS = {
  provider: 'openai' as const,
  apiKey: 'sk-key',
  model: 'gpt-4',
  maxTokens: 500,
  temperature: 0.7,
  maxMessagesPerDay: 50,
  currentUsageCount: 0,
  lastResetDate: Date.now(),
  isConfigured: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

describe('useAIConfigCheck', () => {
  it('non configuré → alerte "Configuration requise", retourne false', () => {
    const canSend = jest.fn().mockReturnValue(true);
    const { result } = renderHook(() => useAIConfigCheck({ ...SETTINGS, isConfigured: false }, canSend));

    expect(result.current()).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Configuration requise',
      expect.any(String),
      expect.any(Array)
    );
    expect(canSend).not.toHaveBeenCalled();
  });

  it('"Configurer maintenant" navigue vers /settings/ai', () => {
    const canSend = jest.fn().mockReturnValue(true);
    const { result } = renderHook(() => useAIConfigCheck({ ...SETTINGS, isConfigured: false }, canSend));
    result.current();

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    buttons.find((b: { text: string }) => b.text === 'Configurer maintenant').onPress();

    expect(mockPush).toHaveBeenCalledWith('/settings/ai');
  });

  it('configuré mais quota atteint → alerte "Limite atteinte", retourne false', () => {
    const canSend = jest.fn().mockReturnValue(false);
    const { result } = renderHook(() => useAIConfigCheck(SETTINGS, canSend));

    expect(result.current()).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Limite atteinte',
      expect.stringContaining(String(SETTINGS.maxMessagesPerDay)),
      expect.any(Array)
    );
  });

  it('configuré et quota disponible → retourne true, aucune alerte', () => {
    const canSend = jest.fn().mockReturnValue(true);
    const { result } = renderHook(() => useAIConfigCheck(SETTINGS, canSend));

    expect(result.current()).toBe(true);
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
