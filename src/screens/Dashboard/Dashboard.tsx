import React, { useEffect, useState } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { styles } from './styles/dashboardStyle';

// 1. Tes briques visuelles
import DashboardHeader from './components/dashboardHeader';
import ContinueLearningCard from './components/continueLearning';
import RevisionCard from './components/revisionCard';
import AITutorCard from './components/aiTutorCard';
import MetricsSection from './components/metricsSession';
import LevelCard from './components/levelCard';

// 2. Ton moteur SQL (tes fichiers queries.ts)
import { getModulesByAudience } from '../../database/queries';
import { useUser } from '../../contexts/UserContext'; 

export default function Dashboard() {
  const { user, db } = useUser(); // On récupère l'utilisateur et la base
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // RÉCEPTEUR : On va chercher la vraie DATA
  useEffect(() => {
    async function loadDashboardData() {
      if (db && user) {
        // On interroge ton SQL selon l'audience (College, etc.)
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
      
      {/* 1. Header alimenté par le context User */}
      <DashboardHeader user={user} />

      {/* 2. Hero Section (Logique de reprise) */}
      <View style={styles.section}>
        <ContinueLearningCard activity={user.lastActivity} />
      </View>

      {/* 3. Révision (Porte vers l'écran révision) */}
      <View style={styles.section}>
        <RevisionCard onPress={() => router.push('/revision')} />
      </View>

      {/* 4. AI Tutor (Conditionnel selon ton schéma audience) */}
      {user.audience !== 'primary' && (
        <View style={styles.section}>
          <AITutorCard />
        </View>
      )}

      {/* 5. Metrics (Récupérées de tes hooks de stats) */}
      <View style={styles.section}>
        <MetricsSection />
      </View>

      {/* 6. Grille des Niveaux (Dynamique via SQL) */}
      <View style={styles.sectionHeader}>
        <View style={styles.levelsGrid}>
          {modules.map((module) => (
            <LevelCard key={module.id} level={module} />
          ))}
        </View>
      </View>

    </ScrollView>
  );
}