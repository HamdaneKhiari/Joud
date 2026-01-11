import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './styles/dashboardStyle';

// Composants Dashboard thématisés (TSX)
import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import DashboardCard from './components/DashboardCard';
import AIDiagnosticCard from './components/DashboardAiDiagnostic/AidiagnosticCard';
import MetricsSection from './components/DashboardMetricsSession/metricsSession';
import LevelCard from './components/DashboardLevel/levelCard';

// Database & Context
import { getModulesByAudience } from '@/database/queries';
import { useUser } from '@/contexts/UserContext';

export default function Dashboard() {
  const { user, db } = useUser();
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chargement des données Dashboard
  useEffect(() => {
    async function loadDashboardData() {
      if (db && user) {
        const data = await getModulesByAudience(db, user.audience);
        setModules(data);
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [db, user]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* 1. Header personnalisé */}
      <DashboardHeader user={user} />

      {/* 2. Mot du jour */}
      <View style={styles.section}>
        <DashboardCard
          title="Le mot du jour"
          icon="📖"
          subtitle="Nouveau vocabulaire"
          variant="daily-word"
        >
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#1F2937', marginTop: 8 }}>
            Resilience
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            La capacité à surmonter les difficultés
          </Text>
        </DashboardCard>
      </View>

      {/* 3. Reprendre le cours */}
      <View style={styles.section}>
        <DashboardCard
          title="Reprendre le cours"
          icon="▶️"
          subtitle="Tu y étais presque !"
          variant="continue"
          onPress={() => console.log('Continue learning')}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginTop: 8 }}>
            Module 3 - Leçon 5
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            Progression : 78%
          </Text>
        </DashboardCard>
      </View>

      {/* 4. Révisions */}
      <View style={styles.section}>
        <DashboardCard
          title="Révisions"
          icon="🔄"
          subtitle="12 mots à revoir"
          variant="revision"
          onPress={() => console.log('Go to revision')}
        >
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>
            Renforce ta mémoire avec une session rapide
          </Text>
        </DashboardCard>
      </View>

      {/* 5. AI Diagnostic (Conditionnel selon audience) */}
      {user.audience !== 'primary' && (
        <View style={styles.section}>
          <AIDiagnosticCard
            errorPatterns={{
              verb_conjugation: { count: 8, severity: 2 },
              adjective_agreement: { count: 5, severity: 1 },
            }}
            challenge={{
              userMessage: "Concentre-toi sur les verbes irréguliers avec 10 exercices ciblés"
            }}
            onTakeChallenge={() => console.log('Challenge accepted')}
          />
        </View>
      )}

      {/* 6. Metrics Section */}
      <MetricsSection
        metrics={{
          wordsLearned: 127,
          badges: 3,
          streak: 7
        }}
        theme="light"
      />

      {/* 7. Grille des Niveaux */}
      <View style={styles.sectionHeader}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 12 }}>
          Parcours
        </Text>
        <View style={styles.levelsGrid}>
          {modules.map((module) => (
            <LevelCard
              key={module.id}
              level={module}
              onPress={() => console.log('Navigate to level', module.id)}
            />
          ))}
        </View>
      </View>

    </ScrollView>
  );
}
