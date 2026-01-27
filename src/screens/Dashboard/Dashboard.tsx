import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './styles/dashboardStyle';

// Composants spécialisés
import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import DailyWordCard from './components/DashboardDailyWordCard/DailyWordCard'; // ✅ Nouveau composant
import AIDiagnosticCard from './components/DashboardAiDiagnostic/AidiagnosticCard';
import AITutorCard from './components/DashboardAiTutorCard/AiTutorCard';
import MetricsSection from './components/DashboardMetricsSession/metricsSession';
import LevelCard from './components/DashboardLevel/levelCard';
import ContinueLearningCard from './components/ContinueLearningCard';
import RevisionCard from './components/RevisionCard';

// Hooks et Logique
import { getLevelsByAudience } from '@/database/queries';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import { Level } from '@/database/schema';
import { getLevelLabel } from '@/utils/labelMapper';
import { navigateToExerciseSelection } from '@/utils/navigationHelper';
import { useLastActivity } from '../../hooks/useLastActivity';

export default function Dashboard() {
  const { user, db, loading: userLoading } = useUser();
  const { identity } = useTheme();
  const router = useRouter();
  const { getLevelProgress } = useProgress();
  const styles = useMemo(() => createStyles(identity), [identity]);
  const { lastActivity, fetchLastActivity } = useLastActivity();

  const [levels, setLevels] = useState<Level[]>([]);
  const [levelLabels, setLevelLabels] = useState<Record<number, { title: string; badge: string; description: string }>>({});
  const [dataLoading, setDataLoading] = useState(true);

  // TODO: Récupérer le mot du jour depuis la DB ou API
  const [dailyWord] = useState({
    english: "Resilience",
    french: "Résilience",
    emoji: "🌱"
  });

  useEffect(() => {
    async function loadDashboardData() {
      if (!db || !user) {
        setDataLoading(false);
        return;
      }

      try {
        const data = await getLevelsByAudience(db, user.audience);
        setLevels(data);

        const labels: Record<number, { title: string; badge: string; description: string }> = {};
        for (const level of data) {
          const label = await getLevelLabel(level.level, identity.id, db);
          labels[level.level] = label;
        }
        setLevelLabels(labels);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setDataLoading(false);
      }
    }
    loadDashboardData();
  }, [db, user, identity.id]);

  useFocusEffect(
    useCallback(() => {
      fetchLastActivity();
    }, [fetchLastActivity])
  );

  if (userLoading || dataLoading || !user || !db) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: identity.palette.surface }}>
        <ActivityIndicator size="large" color={identity.palette.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: identity.palette.surface }]} 
      contentContainerStyle={styles.scrollContent}
    >
      
      <DashboardHeader
        user={{ name: user.firstName }}
      />

      {/* 1. DÉCOUVRIR : Mot du jour (RECODÉ EN FULL WHITE LABEL) */}
      <View style={styles.section}>
        <DailyWordCard word={dailyWord} />
      </View>

      {/* 2. REPRENDRE : Activité récente / Commencer l'aventure */}
      <View style={styles.section}>
        <ContinueLearningCard
          activity={lastActivity}
          onPress={lastActivity ? () => navigateToExerciseSelection(router, lastActivity.level) : undefined}
          onStartPress={() => navigateToExerciseSelection(router, 1)}
        />
      </View>

      {/* 3. ENTRETENIR : Révisions */}
      <View style={styles.section}>
        <RevisionCard
          wordsToReview={12} // TODO: Calculer depuis le système de révisions
          onPress={() => router.push('/revision' as any)}
        />
      </View>

      {/* 4. ANALYSER & AGIR : Pôle IA */}
      {user.audience !== 'primary' && (
        <View style={styles.section}>
          <AIDiagnosticCard
            errorPatterns={{ verb_conjugation: { count: 8, severity: 2 } }} // TODO: Analyser les erreurs réelles de l'utilisateur
            challenge={{ userMessage: identity.aiTutor.subtitle }}
            onTakeChallenge={() => console.log('Challenge accepted')}
          />
          <AITutorCard />
        </View>
      )}

      {/* 5. BILAN : Metrics */}
      <View style={styles.section}>
        <MetricsSection
          metrics={{
            wordsLearned: 127, // TODO: Depuis ProgressContext
            badges: 3,         // TODO: Depuis BadgeSystem
            streak: 7          // TODO: Depuis ProgressContext
          }}
          theme={identity.themeMode}
        />
      </View>

      {/* 6. PARCOURS : La timeline */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: identity.text.primary }]}>Parcours</Text>
        <View style={styles.levelsGrid}>
          {levels.length > 1 && <View style={[styles.timelineLine, { backgroundColor: identity.palette.primary + '40' }]} />}
          {levels.map((level) => {
            const levelLabel = levelLabels[level.level] || { title: `Niveau ${level.level}`, badge: `N${level.level}`, description: 'Niveau' };
            const progress = getLevelProgress(level.level);
            const status = progress === 100 ? 'completed' : 'in_progress';

            return (
              <LevelCard
                key={level.id}
                data={{ id: level.id || 0, level: level.level, title: levelLabel.title, status }}
                onPress={() => navigateToExerciseSelection(router, level.level)}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}