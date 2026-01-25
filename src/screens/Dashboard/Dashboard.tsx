import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './styles/dashboardStyle';

import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import DashboardCard from './components/DashboardCard';
import AIDiagnosticCard from './components/DashboardAiDiagnostic/AidiagnosticCard';
import AITutorCard from './components/DashboardAiTutorCard/AiTutorCard';
import MetricsSection from './components/DashboardMetricsSession/metricsSession';
import LevelCard from './components/DashboardLevel/levelCard';

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

  useEffect(() => {
    async function loadDashboardData() {
      if (db && user) {
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
    }
    loadDashboardData();
  }, [db, user, identity.id]);

  useFocusEffect(
    useCallback(() => {
      fetchLastActivity();
    }, [fetchLastActivity])
  );

  if (userLoading || dataLoading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={identity.branding.main} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      <DashboardHeader user={{ name: user.firstName }} />

      {/* 1. DÉCOUVRIR : Mot du jour */}
      <View style={styles.section}>
        <DashboardCard title="Le mot du jour" variant="daily-word">
          <Text style={styles.dailyWordTitle}>Resilience</Text>
          <Text style={styles.dailyWordSubtitle}>Résilience</Text>
        </DashboardCard>
      </View>

      {/* 2. ENTRETENIR : Révisions (remontées ici) */}
      <View style={styles.section}>
        <DashboardCard
          title="Révisions"
          variant="revision"
          onPress={() => router.push('/revision' as any)}
        >
          <Text style={styles.revisionTitle}>12 mots à réviser</Text>
          <Text style={styles.revisionSubtitle}>Renforce ta mémoire par la répétition</Text>
        </DashboardCard>
      </View>

      {/* 3. ANALYSER & AGIR : Pôle IA */}
      {user.audience !== 'primary' && (
        <View style={styles.section}>
          <AIDiagnosticCard
            errorPatterns={{ verb_conjugation: { count: 8, severity: 2 } }}
            challenge={{ userMessage: "Concentre-toi sur les verbes" }}
            onTakeChallenge={() => console.log('Challenge accepted')}
          />
          <AITutorCard />
        </View>
      )}

      {/* 4. BILAN : Metrics */}
      <View style={styles.section}>
        <MetricsSection metrics={{ wordsLearned: 127, badges: 3, streak: 7 }} theme="light" />
      </View>

      {/* 5. REPRENDRE : Activité récente */}
      {lastActivity && (
        <View style={styles.section}>
          <DashboardCard title="Reprendre le cours" variant="continue">
            <View style={styles.resumeContainer}>
              <Text style={styles.resumeFamilyName}>{lastActivity.familyName}</Text>
              <Text style={styles.resumeLevelText}>Niveau {lastActivity.level}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${lastActivity.progress}%` }]} />
            </View>
          </DashboardCard>
        </View>
      )}

      {/* 6. PARCOURS : La timeline */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Parcours</Text>
        <View style={styles.levelsGrid}>
          {levels.length > 1 && <View style={styles.timelineLine} />}
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