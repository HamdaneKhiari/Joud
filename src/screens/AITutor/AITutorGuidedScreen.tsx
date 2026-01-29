/**
 * ============================================
 * AI TUTOR GUIDED SCREEN (TypeScript + White Label + SQL Analysis)
 * Mode guidé avec analyse de progression et suggestions IA
 * ============================================
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { useStudentAnalysis } from './hooks/useStudentAnalysis';
import { useCurrentLevel } from '@/contexts/CurrentLevelContext';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';

// ============================================
// TYPES
// ============================================

type RootStackParamList = {
  AITutorGuided: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'AITutorGuided'>;

// ============================================
// COMPOSANT
// ============================================

const AITutorGuidedScreen: React.FC<Props> = ({ navigation }) => {
  const { identity } = useTheme();
  const { currentLevel } = useCurrentLevel();
  const { analysis, isLoading, error, hasWeakAreas, hasStrengthAreas } =
    useStudentAnalysis('default_user', currentLevel);

  const [selectedWeakArea, setSelectedWeakArea] = useState<number | null>(null);
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
          paddingHorizontal: tokens.spacing.xl,
          paddingVertical: tokens.spacing.lg,
          gap: tokens.spacing.lg,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: tokens.spacing.xxxl,
        },
        loadingText: {
          marginTop: tokens.spacing.md,
          fontSize: tokens.fontSize.base,
          fontWeight: tokens.fontWeight.medium,
          color: identity.text.secondary,
        },
        sectionTitle: {
          fontSize: tokens.fontSize.xl,
          fontWeight: tokens.fontWeight.black,
          color: identity.text.primary,
          marginBottom: tokens.spacing.md,
          textAlign: isPlayful ? 'center' : 'left',
        },
        statsCard: {
          padding: tokens.spacing.lg,
          borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
          backgroundColor: identity.palette.surface,
          borderWidth: 2,
          borderColor: identity.palette.accent,
          gap: tokens.spacing.sm,
        },
        statsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        statsLabel: {
          fontSize: tokens.fontSize.base,
          fontWeight: tokens.fontWeight.medium,
          color: identity.text.secondary,
        },
        statsValue: {
          fontSize: tokens.fontSize.lg,
          fontWeight: tokens.fontWeight.bold,
          color: identity.palette.primary,
        },
        weakAreaCard: {
          padding: tokens.spacing.md,
          borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
          backgroundColor: baseColors.red50,
          borderWidth: 2,
          borderColor: baseColors.red300,
          marginBottom: tokens.spacing.sm,
        },
        weakAreaHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: tokens.spacing.xs,
        },
        weakAreaTitle: {
          fontSize: tokens.fontSize.lg,
          fontWeight: tokens.fontWeight.bold,
          color: baseColors.red900,
          flex: 1,
        },
        weakAreaBadge: {
          paddingHorizontal: tokens.spacing.sm,
          paddingVertical: tokens.spacing.xs,
          borderRadius: tokens.borderRadius.round,
          backgroundColor: baseColors.red200,
        },
        weakAreaBadgeText: {
          fontSize: tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.bold,
          color: baseColors.red800,
        },
        weakAreaDetails: {
          fontSize: tokens.fontSize.sm,
          fontWeight: tokens.fontWeight.medium,
          color: baseColors.red700,
        },
        strengthAreaCard: {
          padding: tokens.spacing.md,
          borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
          backgroundColor: baseColors.green50,
          borderWidth: 2,
          borderColor: baseColors.green300,
          marginBottom: tokens.spacing.sm,
        },
        strengthAreaTitle: {
          fontSize: tokens.fontSize.base,
          fontWeight: tokens.fontWeight.bold,
          color: baseColors.green900,
          marginBottom: tokens.spacing.xs,
        },
        strengthAreaDetails: {
          fontSize: tokens.fontSize.sm,
          fontWeight: tokens.fontWeight.medium,
          color: baseColors.green700,
        },
        suggestionCard: {
          padding: tokens.spacing.lg,
          borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
          backgroundColor: baseColors.blue50,
          borderWidth: 2,
          borderColor: baseColors.blue300,
        },
        suggestionIcon: {
          fontSize: tokens.emojiSize.huge,
          textAlign: isPlayful ? 'center' : 'left',
          marginBottom: tokens.spacing.md,
        },
        suggestionTitle: {
          fontSize: tokens.fontSize.xl,
          fontWeight: tokens.fontWeight.black,
          color: baseColors.blue900,
          marginBottom: tokens.spacing.sm,
          textAlign: isPlayful ? 'center' : 'left',
        },
        suggestionText: {
          fontSize: tokens.fontSize.base,
          fontWeight: tokens.fontWeight.medium,
          color: baseColors.blue800,
          lineHeight: tokens.fontSize.base * 1.5,
          textAlign: isPlayful ? 'center' : 'left',
        },
        emptyStateText: {
          fontSize: tokens.fontSize.base,
          fontWeight: tokens.fontWeight.medium,
          color: identity.text.tertiary,
          textAlign: 'center',
          fontStyle: 'italic',
        },
      }),
    [identity, isPlayful]
  );

  // =================== HANDLERS ===================

  const handleGoBack = () => {
    navigation.goBack();
  };

  // =================== RENDER ===================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={identity.palette.primary} />
          <Text style={styles.loadingText}>Analyzing your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !analysis) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Error loading analysis</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Guided Mode</Text>
        <Text style={styles.headerSubtitle}>AI-powered progress analysis</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Stats */}
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Completed Exercises</Text>
            <Text style={styles.statsValue}>
              {analysis.progressStats.totalCompleted} / {analysis.progressStats.totalModules}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Average Score</Text>
            <Text style={styles.statsValue}>{analysis.progressStats.averageScore}%</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Current Level</Text>
            <Text style={styles.statsValue}>Level {analysis.progressStats.currentLevel}</Text>
          </View>
        </View>

        {/* Weak Areas */}
        <Text style={styles.sectionTitle}>Areas to Improve</Text>
        {hasWeakAreas ? (
          analysis.weakAreas.map((area, index) => (
            <View key={index} style={styles.weakAreaCard}>
              <View style={styles.weakAreaHeader}>
                <Text style={styles.weakAreaTitle}>{area.familyName}</Text>
                <View style={styles.weakAreaBadge}>
                  <Text style={styles.weakAreaBadgeText}>
                    {Math.round(area.errorRate * 100)}% errors
                  </Text>
                </View>
              </View>
              <Text style={styles.weakAreaDetails}>
                {area.errorCount} mistakes in {area.totalAttempts} attempts • Focus on{' '}
                {area.theme}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyStateText}>
            No weak areas detected. Keep up the great work!
          </Text>
        )}

        {/* AI Suggestions */}
        {hasWeakAreas && (
          <>
            <Text style={styles.sectionTitle}>AI Suggestions</Text>
            <View style={styles.suggestionCard}>
              <Text style={styles.suggestionIcon}>💡</Text>
              <Text style={styles.suggestionTitle}>Personalized Recommendation</Text>
              <Text style={styles.suggestionText}>
                Based on your progress, I recommend focusing on{' '}
                <Text style={{ fontWeight: tokens.fontWeight.bold }}>
                  {analysis.weakAreas[0]?.familyName}
                </Text>
                . This area shows the most improvement potential. Try practicing 10-15 minutes
                daily for best results!
              </Text>
            </View>
          </>
        )}

        {/* Strength Areas */}
        {hasStrengthAreas && (
          <>
            <Text style={styles.sectionTitle}>Your Strengths</Text>
            {analysis.strengthAreas.map((area, index) => (
              <View key={index} style={styles.strengthAreaCard}>
                <Text style={styles.strengthAreaTitle}>
                  {area.familyName} • {Math.round(area.successRate * 100)}% success
                </Text>
                <Text style={styles.strengthAreaDetails}>
                  {area.successCount} successes • Excellent work in {area.theme}!
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AITutorGuidedScreen;
