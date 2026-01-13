import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './styles/dashboardStyle';

import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import DashboardCard from './components/DashboardCard';
import AIDiagnosticCard from './components/DashboardAiDiagnostic/AidiagnosticCard';
import MetricsSection from './components/DashboardMetricsSession/metricsSession';
import LevelCard from './components/DashboardLevel/levelCard';

import { getLevelsByAudience } from '@/database/queries';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import { Level } from '@/database/schema';
import { getLevelLabel } from '@/utils/labelMapper';
import { navigateToExerciseSelection } from '@/utils/navigationHelper';

export default function Dashboard() {
  const { user, db, loading: userLoading } = useUser();
  const { identity } = useTheme();
  const router = useRouter();
  const { getLevelProgress } = useProgress();
  const styles = useMemo(() => createStyles(identity), [identity]);

  const [levels, setLevels] = useState<Level[]>([]);
  const [levelLabels, setLevelLabels] = useState<Record<number, { title: string; badge: string; description: string }>>({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (db && user) {
        try {
          const data = await getLevelsByAudience(db, user.audience);
          setLevels(data);

          // Charger les labels pour chaque niveau
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

  if (userLoading || dataLoading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={identity.branding.main} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* FIX 1 : On passe firstName dans la propriété name attendue */}
      <DashboardHeader user={{ name: user.firstName }} />

      <View style={styles.section}>
        <DashboardCard title="Le mot du jour" icon="📖" variant="daily-word">
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#1F2937', marginTop: 8 }}>Resilience</Text>
          <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 4, fontStyle: 'italic' }}>Résilience</Text>
        </DashboardCard>
      </View>

      <View style={styles.section}>
        <DashboardCard title="Reprendre le cours" icon="▶️" variant="continue">
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginTop: 8 }}>Module 3 - Leçon 5</Text>
        </DashboardCard>
      </View>

      {user.audience !== 'primary' && (
        <View style={styles.section}>
          <AIDiagnosticCard
             errorPatterns={{ verb_conjugation: { count: 8, severity: 2 } }}
             challenge={{ userMessage: "Concentre-toi sur les verbes" }}
             onTakeChallenge={() => console.log('Challenge accepted')}
          />
        </View>
      )}

      <MetricsSection metrics={{ wordsLearned: 127, badges: 3, streak: 7 }} theme="light" />

      <View style={styles.sectionHeader}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 12 }}>Parcours</Text>
        <View style={styles.levelsGrid}>
          {levels.map((level) => {
            // Récupération du label depuis le state
            const levelLabel = levelLabels[level.level] || {
              title: `Niveau ${level.level}`,
              badge: `N${level.level}`,
              description: 'Niveau'
            };

            // Calcul du status selon la progression
            const progress = getLevelProgress(level.level);
            const status = progress === 100 ? 'completed' : 'in_progress';

            return (
              <LevelCard
                key={level.id}
                data={{
                  id: level.id || 0,
                  level: level.level,
                  title: levelLabel.title,
                  status
                }}
                onPress={() => navigateToExerciseSelection(router, level.level)}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}