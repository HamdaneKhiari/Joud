import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ScrollView, View, ActivityIndicator, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './styles/dashboardStyle';

// Composants spécialisés
import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import DailyWordCard from './components/DashboardDailyWordCard/DailyWordCard'; // ✅ Nouveau composant
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
import { useDailyWord } from '@/hooks/dashboard/useDailyWord';
import { useRevisions } from '@/hooks/dashboard/useRevisions';
import { useUserMetrics } from '@/hooks/dashboard/useUserMetrics';

export default function Dashboard() {
  const { user, db, loading: userLoading } = useUser();
  const { identity } = useTheme();
  const router = useRouter();
  const { getLevelProgress } = useProgress();
  const styles = useMemo(() => createStyles(identity), [identity]);
  const { lastActivity, fetchLastActivity } = useLastActivity();

  // ✅ Hooks Dashboard - Données réelles depuis DB
  const { dailyWord } = useDailyWord();
  const { wordsToReview } = useRevisions();
  const { wordsLearned, badges, streak } = useUserMetrics();

  const [levels, setLevels] = useState<Level[]>([]);
  const [levelLabels, setLevelLabels] = useState<Record<number, { title: string; badge: string; description: string }>>({});
  const [dataLoading, setDataLoading] = useState(true);

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
          // ✅ CORRIGÉ : db en premier argument (db, levelNumber, identityId)
          const label = await getLevelLabel(db, level.level, identity.id);
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
      style={[styles.container, { backgroundColor: identity.palette.background }]}
      contentContainerStyle={styles.scrollContent}
    >

      <DashboardHeader
        user={{ name: user.firstName }}
      />

      {/* 1. DÉCOUVRIR : Mot du jour (RECODÉ EN FULL WHITE LABEL) */}
      {dailyWord && (
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.section}>
          <DailyWordCard word={dailyWord} />
        </Animated.View>
      )}

      {/* 2. REPRENDRE : Activité récente / Commencer l'aventure */}
      <View style={styles.section}>
        <ContinueLearningCard
          activity={lastActivity}
          onPress={lastActivity ? () => {
            if (lastActivity.moduleSlug === 'revision') {
              router.push('/revision' as any);
            } else {
              // Décomposer le familyId composite "12-1" en familyId + subfamilyId
              const parts = lastActivity.familyId.split('-');
              const fId = parts[0];
              const subId = parts.length > 1 ? parts[1] : undefined;
              router.push({
                pathname: '/exercise/[exerciseId]',
                params: {
                  exerciseId: lastActivity.moduleSlug,
                  familyId: fId,
                  levelId: lastActivity.level.toString(),
                  ...(subId ? { subfamilyId: subId } : {}),
                },
              } as any);
            }
          } : undefined}
          onStartPress={() => navigateToExerciseSelection(router, 1)}
        />
      </View>

      {/* 3. ENTRETENIR : Révisions */}
      <View style={styles.section}>
        <RevisionCard
          wordsToReview={wordsToReview}
          onPress={() => router.push('/revision' as any)}
        />
      </View>

      {/* 4. ANALYSER & AGIR : Tuteur IA */}
      {user.audience !== 'primary' && (
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <AITutorCard />
        </Animated.View>
      )}

      {/* 5. BILAN : Metrics */}
      <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
        <MetricsSection
          metrics={{
            wordsLearned,
            badges,
            streak
          }}
          theme={identity.themeMode}
        />
      </Animated.View>

      {/* 6. PARCOURS : La timeline */}
      <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: identity.text.primary }]}>Parcours</Text>
        <View style={styles.levelsGrid}>
          {levels.length > 1 && <View style={[styles.timelineLine, { backgroundColor: identity.palette.primary + '40' }]} />}
          {levels.map((level, index) => {
            // ✅ Récupération du titre depuis la DB (ex: "Les Bases", "L'Essentiel", etc.)
            // Fallback uniquement si le chargement a échoué
            const levelLabel = levelLabels[level.level] || {
              title: `Niveau ${level.level}`,
              badge: `${level.level}`,
              description: 'Niveau'
            };
            const progress = getLevelProgress(level.level);
            const status = progress === 100 ? 'completed' : 'in_progress';

            return (
              <LevelCard
                key={level.id}
                data={{
                  id: level.id || 0,
                  level: level.level, // ✅ Badge rond : 1, 2, 3, 4
                  title: levelLabel.title, // ✅ Titre complet : "Les Bases", "L'Essentiel"
                  status
                }}
                onPress={() => navigateToExerciseSelection(router, level.level)}
                isLast={index === levels.length - 1}
                animationDelay={index * 100}
              />
            );
          })}
        </View>
      </Animated.View>
    </ScrollView>
  );
}