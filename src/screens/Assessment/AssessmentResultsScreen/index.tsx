import React, { useMemo, useCallback } from 'react';
import { View, StatusBar, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import ExerciseHeader from '@/components/layout/ExerciseHeader';
import FlowCard from '@/components/flow/FlowCard';

import { useTheme } from '@/themes/ThemeContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { styles } from './style';

interface AssessmentResultsParams {
  level?: number;
  userAnswers?: Record<string, { theme: string; isCorrect: boolean }>;
  totalQuestions?: number;
  score?: number;
}

const AssessmentResultsScreen: React.FC = () => {
  const { identity } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params ?? {}) as AssessmentResultsParams;

  const { level = 1, userAnswers = {}, totalQuestions = 0, score = 0 } = params;
  const numLevel = Number(level);

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isPassed = percentage >= 70;

  const safeNavigateToOrchestrator = useSafeNavigation(
    useCallback(() => {
      (navigation as any).navigate('AssessmentOrchestrator', { level: numLevel });
    }, [navigation, numLevel])
  );

  const themeStats = useMemo(() => {
    const themes = [
      { id: 'vocabulary', label: 'Vocabulaire', icon: '📚' },
      { id: 'grammar', label: 'Grammaire', icon: '✏️' },
      { id: 'phrases', label: 'Phrases', icon: '💬' },
      { id: 'reading', label: 'Lecture', icon: '📖' },
    ];

    const answersArray = Object.values(userAnswers);

    return themes.map(theme => {
      const questionsOfTheme = answersArray.filter(ans => ans.theme === theme.id);
      const correctInTheme = questionsOfTheme.filter(ans => ans.isCorrect).length;
      const totalInTheme = questionsOfTheme.length;

      return {
        ...theme,
        correct: correctInTheme,
        total: totalInTheme,
        percent: totalInTheme > 0 ? Math.round((correctInTheme / totalInTheme) * 100) : 0
      };
    });
  }, [userAnswers]);

  const handleContinue = () => {
    safeNavigateToOrchestrator.navigate();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={identity.themeMode === 'dark' ? 'light-content' : 'dark-content'} />

        <ExerciseHeader
          variant="exercise"
          onBack={handleContinue}
          exerciseTitle="Résultats de l'évaluation"
          showLevelBadge
          levelTitle={numLevel.toString()}
        />

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.scoreCard}>
            <Text style={styles.emoji}>{isPassed ? '🎉' : '💪'}</Text>
            <Text style={styles.mainMessage}>
              {isPassed ? 'Évaluation Validée !' : 'Continue tes efforts !'}
            </Text>

            <View style={[styles.scoreContainer, { borderColor: isPassed ? identity.palette.accent : identity.palette.primary }]}>
              <Text style={[styles.scorePercentage, { color: isPassed ? identity.palette.accent : identity.palette.primary }]}>
                {percentage}%
              </Text>
              <Text style={styles.scoreDetails}>{score} / {totalQuestions} correctes</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Analyse par compétence</Text>
            {themeStats.map((stat) => (
              <FlowCard
                key={stat.id}
                icon={stat.icon}
                title={stat.label}
                subtitle={stat.total > 0 ? `${stat.correct} / ${stat.total} correctes` : 'Non évalué'}
                color={identity.palette.primary}
                progress={stat.percent}
              />
            ))}
          </View>

          <View style={{ padding: 20, gap: 12 }}>
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: identity.palette.primary }]}
              onPress={handleContinue}
              activeOpacity={0.7}
            >
              <Text style={styles.continueButtonText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default AssessmentResultsScreen;
