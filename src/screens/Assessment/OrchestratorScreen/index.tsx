import React, { useMemo, useCallback } from 'react';
import { View, StatusBar, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

import ExerciseHeader from '@/components/layout/ExerciseHeader';
import FlowCard from '@/components/flow/FlowCard';

import { useTheme } from '@/themes/ThemeContext';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { styles } from './style';

interface OrchestratorParams {
  level?: number;
}

const OrchestratorScreen: React.FC = () => {
  const { identity } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params ?? {}) as OrchestratorParams;

  const { level = 1 } = params;
  const numLevel = Number(level);

  const { progress, getExerciseProgress } = useProgress();

  const safeGoBack = useSafeNavigation(
    useCallback(() => (navigation as any).goBack(), [navigation])
  );

  const safeNavigateToAssessment = useSafeNavigation(
    useCallback(() => (navigation as any).navigate('Assessment', { level: numLevel }), [navigation, numLevel])
  );

  const levelColor = identity.palette.primary;

  const userStats = useMemo(() => {
    const vocabProgress   = getExerciseProgress(numLevel, 'vocab');
    const grammarProgress = getExerciseProgress(numLevel, 'grammar');
    const readingProgress = getExerciseProgress(numLevel, 'reading');
    const gamesProgress   = getExerciseProgress(numLevel, 'word_games');

    const average = Math.round((vocabProgress + grammarProgress + readingProgress + gamesProgress) / 4);

    return {
      masteryScore: average,
      totalAssessments: (progress as Record<string, any>)?.[`level${numLevel}`]?.assessment?.current_assessment?.completedCount ?? 0,
      skills: [
        { id: 'vocab',      label: 'Vocabulaire',  icon: '📚', progress: vocabProgress },
        { id: 'grammar',    label: 'Grammaire',    icon: '✏️',  progress: grammarProgress },
        { id: 'reading',    label: 'Lecture',      icon: '📖', progress: readingProgress },
        { id: 'word_games', label: 'Jeux de mots', icon: '🎮', progress: gamesProgress },
      ]
    };
  }, [numLevel, progress, getExerciseProgress]);

  const handleStartAssessment = () => {
    safeNavigateToAssessment.navigate();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={identity.themeMode === 'dark' ? 'light-content' : 'dark-content'} />

        <ExerciseHeader
          variant="simple"
          onBack={safeGoBack.navigate}
          exerciseTitle="Évaluation Dynamique"
          showLevelBadge
          levelTitle={numLevel.toString()}
        />

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.masteryCard}>
            <Text style={styles.masteryLabel}>Niveau de Maîtrise Global</Text>
            <View style={styles.scoreContainer}>
              <Text style={[styles.masteryPercentage, { color: levelColor }]}>
                {userStats.masteryScore}%
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${userStats.masteryScore}%`,
                      backgroundColor: levelColor
                    }
                  ]}
                />
              </View>
            </View>
            <Text style={styles.statsSummary}>
              {userStats.totalAssessments} évaluation(s) terminée(s)
            </Text>
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: levelColor }]}
              onPress={handleStartAssessment}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[levelColor, levelColor + 'CC']}
                style={styles.gradientButton}
              >
                <Text style={styles.startButtonEmoji}>🎯</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.startButtonText}>Lancer une Évaluation</Text>
                  <Text style={styles.startButtonSubtext}>Basée sur tes points faibles</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Tes Compétences au Niveau {numLevel}</Text>
            <View style={styles.skillsGrid}>
              {userStats.skills.map((skill) => (
                <FlowCard
                  key={skill.id}
                  icon={skill.icon}
                  title={skill.label}
                  progress={skill.progress}
                  color={levelColor}
                  subtitle={`${skill.progress}% acquis`}
                />
              ))}
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default OrchestratorScreen;
