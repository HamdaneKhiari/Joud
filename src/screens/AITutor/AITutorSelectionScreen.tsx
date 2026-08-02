import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { useAISettings } from '@/hooks/useAISettings';
import { useBlockPrimaryAudience } from '@/hooks/useBlockPrimaryAudience';
import { MODES } from './AITutorSelectionScreen.config';
import { createStyles } from './AITutorSelectionScreen.styles';
import { ModeCard } from './components';

const AITutorSelectionScreen: React.FC = () => {
  const router = useRouter();
  const { identity } = useTheme();
  const { settings, isLoading } = useAISettings();
  const isPlayful = identity.ui.mood === 'playful';
  const blocked = useBlockPrimaryAudience();

  const styles = useMemo(() => createStyles(identity, isPlayful), [identity, isPlayful]);

  if (blocked) return null;

  const isConfigured = !isLoading && settings?.isConfigured && !!settings?.apiKey;

  const handleModePress = (route: string) => {
    if (isConfigured) {
      router.push(route as Href);
    } else {
      Alert.alert(
        'Clé API requise',
        'Configure ta clé API pour discuter avec le coach IA.',
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Configurer', onPress: () => router.push('/settings-ai' as Href) },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <Ionicons name="arrow-back" size={24} color={identity.text.onPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tuteur IA</Text>
          <Text style={styles.headerEmoji}>🤖</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {isConfigured
            ? `Choisis ton mode \u2022 Connect\u00e9 (${settings?.provider || 'OpenAI'})`
            : 'Choisis ton mode'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!isConfigured && (
          <TouchableOpacity
            style={styles.configBanner}
            onPress={() => router.push('/settings-ai' as Href)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Configure ta clé API pour activer le coach IA"
          >
            <Ionicons name="key-outline" size={18} color={identity.palette.accent} />
            <Text style={styles.configBannerText}>
              Configure ta clé API pour activer le coach IA
            </Text>
            <Ionicons name="chevron-forward" size={16} color={identity.text.secondary} />
          </TouchableOpacity>
        )}

        {MODES.map((mode) => (
          <ModeCard
            key={mode.key}
            emoji={mode.emoji}
            title={mode.title}
            subtitle={`Mode ${mode.key === 'free' ? 'libre' : 'guidé'}`}
            description={mode.description}
            features={mode.features}
            onPress={() => handleModePress(mode.route)}
            styles={styles}
            identity={identity}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AITutorSelectionScreen;
