/**
 * ============================================
 * AI TUTOR SELECTION SCREEN (TypeScript + White Label + Moods)
 * Screen pour choisir entre Free Chat et Guided Mode
 * ============================================
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

// ============================================
// TYPES
// ============================================

type RootStackParamList = {
  AITutorSelection: undefined;
  AITutorFree: undefined;
  AITutorGuided: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'AITutorSelection'>;

// ============================================
// COMPOSANT
// ============================================

const AITutorSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';

  // =================== STYLES ===================

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: identity.palette.background,
        },
        header: {
          paddingHorizontal: tokens.spacing.xl,
          paddingVertical: tokens.spacing.lg,
          backgroundColor: identity.palette.surface,
          borderBottomWidth: 2,
          borderBottomColor: identity.palette.primary,
        },
        backButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.spacing.sm,
          marginBottom: tokens.spacing.md,
        },
        backText: {
          fontSize: tokens.fontSize.base,
          fontWeight: tokens.fontWeight.semibold,
          color: identity.palette.primary,
        },
        headerTitle: {
          fontSize: tokens.fontSize.xxxl,
          fontWeight: tokens.fontWeight.black,
          color: identity.text.primary,
          marginBottom: tokens.spacing.xs,
          textAlign: isPlayful ? 'center' : 'left',
        },
        headerSubtitle: {
          fontSize: tokens.fontSize.base,
          fontWeight: tokens.fontWeight.medium,
          color: identity.text.secondary,
          textAlign: isPlayful ? 'center' : 'left',
        },
        content: {
          flex: 1,
          paddingHorizontal: tokens.spacing.xl,
          paddingTop: tokens.spacing.xxxl,
          gap: tokens.spacing.lg,
        },
        modeCard: {
          padding: tokens.spacing.xl,
          borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
          borderWidth: 2,
          borderColor: identity.palette.primary,
          backgroundColor: identity.palette.surface,
        },
        modeCardActive: {
          transform: [{ scale: 1.02 }],
        },
        modeIcon: {
          fontSize: tokens.emojiSize.huge,
          textAlign: isPlayful ? 'center' : 'left',
          marginBottom: tokens.spacing.md,
        },
        modeTitle: {
          fontSize: tokens.fontSize.xxl,
          fontWeight: tokens.fontWeight.black,
          color: identity.text.primary,
          marginBottom: tokens.spacing.sm,
          textAlign: isPlayful ? 'center' : 'left',
        },
        modeDescription: {
          fontSize: tokens.fontSize.base,
          fontWeight: tokens.fontWeight.medium,
          color: identity.text.secondary,
          lineHeight: tokens.fontSize.base * 1.5,
          marginBottom: tokens.spacing.md,
          textAlign: isPlayful ? 'center' : 'left',
        },
        modeFeaturesContainer: {
          gap: tokens.spacing.sm,
          marginBottom: tokens.spacing.lg,
        },
        modeFeature: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: tokens.spacing.sm,
        },
        modeFeatureIcon: {
          fontSize: tokens.fontSize.lg,
        },
        modeFeatureText: {
          flex: 1,
          fontSize: tokens.fontSize.sm,
          fontWeight: tokens.fontWeight.medium,
          color: identity.text.primary,
          lineHeight: tokens.fontSize.sm * 1.5,
        },
        modeButton: {
          paddingVertical: tokens.spacing.md,
          borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
          backgroundColor: identity.palette.primary,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: tokens.spacing.sm,
        },
        modeButtonText: {
          fontSize: tokens.fontSize.lg,
          fontWeight: tokens.fontWeight.bold,
          color: identity.text.onPrimary,
        },
      }),
    [identity, isPlayful]
  );

  // =================== HANDLERS ===================

  const handleSelectFree = () => {
    navigation.navigate('AITutorFree');
  };

  const handleSelectGuided = () => {
    navigation.navigate('AITutorGuided');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // =================== RENDER ===================

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={identity.palette.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Tutor</Text>
        <Text style={styles.headerSubtitle}>Choose your learning mode</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Free Chat Mode */}
        <TouchableOpacity
          style={styles.modeCard}
          onPress={handleSelectFree}
          activeOpacity={0.8}
        >
          <Text style={styles.modeIcon}>💬</Text>
          <Text style={styles.modeTitle}>Free Chat</Text>
          <Text style={styles.modeDescription}>
            Ask any question about English, get instant answers from AI
          </Text>
          <View style={styles.modeFeaturesContainer}>
            <View style={styles.modeFeature}>
              <Text style={styles.modeFeatureIcon}>✓</Text>
              <Text style={styles.modeFeatureText}>Ask anything in French or English</Text>
            </View>
            <View style={styles.modeFeature}>
              <Text style={styles.modeFeatureIcon}>✓</Text>
              <Text style={styles.modeFeatureText}>
                Get explanations adapted to your level
              </Text>
            </View>
            <View style={styles.modeFeature}>
              <Text style={styles.modeFeatureIcon}>✓</Text>
              <Text style={styles.modeFeatureText}>Access to Joud Academy content</Text>
            </View>
          </View>
          <View style={styles.modeButton}>
            <Text style={styles.modeButtonText}>Start Free Chat</Text>
            <Ionicons name="arrow-forward" size={20} color={identity.text.onPrimary} />
          </View>
        </TouchableOpacity>

        {/* Guided Mode */}
        <TouchableOpacity
          style={styles.modeCard}
          onPress={handleSelectGuided}
          activeOpacity={0.8}
        >
          <Text style={styles.modeIcon}>🎯</Text>
          <Text style={styles.modeTitle}>Guided Mode</Text>
          <Text style={styles.modeDescription}>
            AI analyzes your progress and suggests personalized exercises
          </Text>
          <View style={styles.modeFeaturesContainer}>
            <View style={styles.modeFeature}>
              <Text style={styles.modeFeatureIcon}>✓</Text>
              <Text style={styles.modeFeatureText}>
                AI analyzes your weak areas (SQL-based)
              </Text>
            </View>
            <View style={styles.modeFeature}>
              <Text style={styles.modeFeatureIcon}>✓</Text>
              <Text style={styles.modeFeatureText}>
                Personalized suggestions to improve
              </Text>
            </View>
            <View style={styles.modeFeature}>
              <Text style={styles.modeFeatureIcon}>✓</Text>
              <Text style={styles.modeFeatureText}>
                Track your progress and celebrate wins
              </Text>
            </View>
          </View>
          <View style={styles.modeButton}>
            <Text style={styles.modeButtonText}>Start Guided Mode</Text>
            <Ionicons name="arrow-forward" size={20} color={identity.text.onPrimary} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AITutorSelectionScreen;
