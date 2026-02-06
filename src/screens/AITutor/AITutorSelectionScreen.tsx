/**
 * ============================================
 * AI TUTOR SELECTION SCREEN (OPTIONNEL)
 * Choix entre Chat libre et Mode guidé
 * White Label + Moods + Gestion état non configuré
 * ============================================
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { useAISettings } from '@/hooks/useAISettings';

// Config & Styles
import { MODES } from './AITutorSelectionScreen.config';
import { createStyles } from './AITutorSelectionScreen.styles';

// Components
import { OnboardingView, ModeCard } from './components';

// ============================================
// COMPOSANT
// ============================================

const AITutorSelectionScreen: React.FC = () => {
  const router = useRouter();
  const { identity } = useTheme();
  const { settings, isLoading } = useAISettings();
  const isPlayful = identity.ui.mood === 'playful';

  const styles = useMemo(() => createStyles(identity, isPlayful), [identity, isPlayful]);

  // =================== RENDER : Non configuré ===================

  if (!isLoading && (!settings?.isConfigured || !settings?.apiKey)) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={identity.text.onPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tuteur IA</Text>
            <Text style={styles.headerEmoji}>🤖</Text>
          </View>
          <Text style={styles.headerSubtitle}>Fonctionnalité optionnelle</Text>
        </View>

        {/* Onboarding Content */}
        <OnboardingView
          styles={styles}
          identity={identity}
          onConfigure={() => router.push('/settings-ai' as any)}
          onSkip={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  // =================== RENDER : Configuré (mode normal) ===================

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={identity.text.onPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tuteur IA</Text>
          <Text style={styles.headerEmoji}>🤖</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Choisis ton mode • Connecté ({settings?.provider || 'OpenAI'})
        </Text>
      </View>

      {/* Cartes de mode */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {MODES.map((mode) => (
          <ModeCard
            key={mode.key}
            emoji={mode.emoji}
            title={mode.title}
            subtitle={`Mode ${mode.key === 'free' ? 'libre' : 'guidé'}`}
            description={mode.description}
            features={mode.features}
            onPress={() => router.push(mode.route as any)}
            styles={styles}
            identity={identity}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AITutorSelectionScreen;
