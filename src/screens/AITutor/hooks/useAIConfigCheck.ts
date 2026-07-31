import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import type { AISettings } from '@/hooks/useAISettings';

/** Vérifie config + quota avant l'envoi d'un message chat (Free et Guided). */
export function useAIConfigCheck(settings: AISettings, canSendMessage: () => boolean) {
  const router = useRouter();

  return useCallback(() => {
    if (!settings.isConfigured) {
      Alert.alert(
        'Configuration requise',
        "Tu dois d'abord configurer ton IA pour utiliser le chat.",
        [
          { text: 'Configurer maintenant', onPress: () => router.push('/settings/ai') },
          { text: 'Plus tard', style: 'cancel' },
        ]
      );
      return false;
    }
    if (!canSendMessage()) {
      Alert.alert(
        'Limite atteinte',
        `Tu as atteint ta limite quotidienne de ${settings.maxMessagesPerDay} messages. Reviens demain !`,
        [{ text: 'OK', style: 'cancel' }]
      );
      return false;
    }
    return true;
  }, [settings, canSendMessage, router]);
}
