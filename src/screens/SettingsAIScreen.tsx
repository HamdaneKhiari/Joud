import { log } from '@/utils/logUtils';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/themes/ThemeContext';
import { withOpacity, tokens } from '@/themes/tokens';
import { useAISettings, AISettings } from '@/hooks/useAISettings';
import { PROVIDERS, INFO_BOXES } from './SettingsAIScreen.config';
import { createStyles } from './SettingsAIScreen.styles';
import {
  InfoBox,
  ProviderSelector,
  APIKeyInput,
} from './components';

type Provider = AISettings['provider'];

export default function SettingsAIScreen() {
  const router = useRouter();
  const { identity } = useTheme();
  const {
    settings,
    isLoading,
    updateSettings,
    deleteAPIKey,
    secureStorage,
  } = useAISettings();

  const [provider, setProvider] = useState<Provider>(settings?.provider || 'openai');
  // Ne jamais préremplir avec la clé déchiffrée : ce champ ne reçoit que ce que
  // l'utilisateur tape pour créer/remplacer sa clé. La clé existante n'est jamais
  // dupliquée dans l'état de cet écran, seul son aperçu masqué est affiché.
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const existingMaskedKey = settings?.apiKey ? secureStorage.maskAPIKey(settings.apiKey) : null;

  const isPlayful = identity.ui.mood === 'playful';

  const styles = useMemo(() => createStyles(identity, isPlayful), [identity, isPlayful]);

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
  };

  const handleDeleteKey = () => {
    Alert.alert(
      '🔐 Supprimer la clé API ?',
      'Ta clé API sera définitivement supprimée du stockage sécurisé. Tu devras la ressaisir pour utiliser l\'IA.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteAPIKey()
              .then(() => {
                setApiKey('');
                Alert.alert('✅ Clé supprimée', 'Ta clé API a été effacée du stockage sécurisé.');
              })
              .catch((error: unknown) => {
                log.error('[SettingsAI] Delete error:', error);
                Alert.alert('Erreur', 'Impossible de supprimer la clé API');
              });
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    const trimmedKey = apiKey.trim();
    const keepingExistingKey = !trimmedKey && !!settings?.isConfigured;

    if (!trimmedKey && !keepingExistingKey) {
      Alert.alert('Erreur', 'La clé API est obligatoire');
      return;
    }

    // Valider le format uniquement si une nouvelle clé est saisie
    if (trimmedKey && !secureStorage.validateAPIKeyFormat(trimmedKey, provider)) {
      Alert.alert(
        '⚠️ Format invalide',
        `Le format de la clé API ne correspond pas au provider ${PROVIDERS.find((p) => p.id === provider)?.name}.\n\nFormats attendus:\n- OpenAI: sk-...\n- Claude: sk-ant-...\n- Mistral: (variable)`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsSaving(true);
      await updateSettings({
        provider,
        // Si le champ est vide et qu'une clé existe déjà, on ne la touche pas
        // (apiKey: undefined => updateSettings ne réécrit pas le SecureStore)
        ...(trimmedKey ? { apiKey: trimmedKey } : {}),
        isConfigured: true,
      });

      // La clé tapée ne reste jamais en mémoire plus longtemps que nécessaire
      setApiKey('');

      Alert.alert(
        '✅ Clé API sécurisée',
        'Ta clé a été chiffrée (AES-256) et stockée dans le Keychain. Tes paramètres sont prêts !',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: unknown) {
      Alert.alert('Erreur', error instanceof Error ? error.message : "Impossible d'enregistrer les paramètres");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={identity.palette.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={identity.text.onPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configuration IA</Text>
        </View>
        <Text style={styles.headerSubtitle}>Fonctionnalité optionnelle • Tu gardes le contrôle</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <InfoBox
          icon={INFO_BOXES.optional.icon}
          iconColor={identity.palette.accent}
          backgroundColor={withOpacity(identity.palette.accent, 0.1)}
          borderColor={withOpacity(identity.palette.accent, 0.3)}
          text={INFO_BOXES.optional.text}
          textColor={identity.text.secondary}
          containerStyle={{ marginBottom: tokens.spacing.xl }}
        />

        <ProviderSelector
          providers={PROVIDERS}
          selectedProvider={provider}
          onSelectProvider={handleProviderChange}
          styles={styles}
        />

        <APIKeyInput
          provider={provider}
          providerName={PROVIDERS.find((p) => p.id === provider)?.name || ''}
          apiKey={apiKey}
          onChangeApiKey={setApiKey}
          existingMaskedKey={existingMaskedKey}
          styles={styles}
          identity={identity}
        />

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={identity.text.onPrimary} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={identity.text.onPrimary} />
              <Text style={styles.saveButtonText}>Enregistrer (Chiffré)</Text>
            </>
          )}
        </TouchableOpacity>

        {settings?.apiKey && (
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#EF4444',
                marginTop: tokens.spacing.md,
              },
            ]}
            onPress={handleDeleteKey}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={20} color="#EF4444" />
            <Text style={[styles.saveButtonText, { color: '#EF4444' }]}>Supprimer la clé API</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
