/**
 * ============================================
 * SETTINGS AI SCREEN
 * Configuration des clés API et paramètres IA
 * ============================================
 */

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

// Config & Styles
import { PROVIDERS, INFO_BOXES } from './SettingsAIScreen.config';
import { createStyles } from './SettingsAIScreen.styles';

// Components
import {
  InfoBox,
  ProviderSelector,
  APIKeyInput,
} from './components';

type Provider = AISettings['provider'];

// ============================================
// COMPOSANT
// ============================================

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
  const [apiKey, setApiKey] = useState(settings?.apiKey || '');
  const [isSaving, setIsSaving] = useState(false);

  const isPlayful = identity.ui.mood === 'playful';

  const styles = useMemo(() => createStyles(identity, isPlayful), [identity, isPlayful]);

  // =================== HANDLERS ===================

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
    if (!apiKey.trim()) {
      Alert.alert('Erreur', 'La clé API est obligatoire');
      return;
    }

    // Valider le format de la clé
    if (!secureStorage.validateAPIKeyFormat(apiKey.trim(), provider)) {
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
        apiKey: apiKey.trim(),
        isConfigured: true,
      });

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

  // =================== LOADING ===================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={identity.palette.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // =================== RENDER ===================

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={identity.text.onPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configuration IA</Text>
        </View>
        <Text style={styles.headerSubtitle}>Fonctionnalité optionnelle • Tu gardes le contrôle</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Box - Optionnel */}
        <InfoBox
          icon={INFO_BOXES.optional.icon}
          iconColor={identity.palette.accent}
          backgroundColor={withOpacity(identity.palette.accent, 0.1)}
          borderColor={withOpacity(identity.palette.accent, 0.3)}
          text={INFO_BOXES.optional.text}
          textColor={identity.text.secondary}
          containerStyle={{ marginBottom: tokens.spacing.xl }}
        />

        {/* Provider Selector */}
        <ProviderSelector
          providers={PROVIDERS}
          selectedProvider={provider}
          onSelectProvider={handleProviderChange}
          styles={styles}
        />

        {/* API Key Input */}
        <APIKeyInput
          provider={provider}
          providerName={PROVIDERS.find((p) => p.id === provider)?.name || ''}
          apiKey={apiKey}
          onChangeApiKey={setApiKey}
          styles={styles}
          identity={identity}
        />

        {/* Save Button */}
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

        {/* Delete Button (si clé existante) */}
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
