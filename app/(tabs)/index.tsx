import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { initDatabase } from '../../src/database/init';
import { getModulesByAudience } from '../../src/database/queries';
import { Module } from '../../src/database/schema';

export default function Dashboard() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    const loadModules = async () => {
      const db = await initDatabase();
      // Par défaut, on charge tous les modules (à adapter selon le profil utilisateur)
      const allModules = await getModulesByAudience(db, 'all');
      setModules(allModules);
    };
    loadModules();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👋 Salut !</Text>
      </View>

      {/* 2. Hero Section */}
      <TouchableOpacity 
        style={styles.heroCard}
        onPress={() => router.push('/level/1')}
      >
        <Text style={styles.heroTitle}>🚀 Commencer le Niveau 1</Text>
        <Text style={styles.heroSubtitle}>Commence ton aventure !</Text>
      </TouchableOpacity>

      {/* 3. Révision Card */}
      <TouchableOpacity 
        style={styles.revisionCard}
        onPress={() => router.push('/revision')}
      >
        <Text style={styles.revisionTitle}>🔄 Espace Révision</Text>
        <Text style={styles.revisionSubtitle}>Renforce tes acquis</Text>
      </TouchableOpacity>

      {/* 4. AI Tutor */}
      <TouchableOpacity 
        style={styles.tutorCard}
        onPress={() => router.push('/ai-tutor')}
      >
        <Text style={styles.tutorTitle}>🤖 AI Tutor</Text>
        <Text style={styles.tutorSubtitle}>Pose tes questions</Text>
      </TouchableOpacity>

      {/* 5. Metrics Section */}
      <View style={styles.metricsCard}>
        <Text style={styles.metricsPlaceholder}>
          📊 Vos statistiques apparaîtront dès la première activité
        </Text>
      </View>

      {/* 6. Levels Grid */}
      <View style={styles.levelsGrid}>
        <Text style={styles.sectionTitle}>Niveaux</Text>
        {[1, 2, 3, 4].map((level) => (
          <TouchableOpacity
            key={level}
            style={styles.levelCard}
            onPress={() => router.push(`/level/${level}`)}
          >
            <Text style={styles.levelTitle}>Niveau {level}</Text>
            <Text style={styles.levelSubtitle}>Les Bases</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Debug : Modules chargés */}
      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>Modules chargés ({modules.length}) :</Text>
        {modules.map((m) => (
          <Text key={m.id} style={styles.debugText}>
            - {m.name} ({m.target_audience})
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  heroCard: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 24,
    borderRadius: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
  },
  revisionCard: {
    backgroundColor: '#FF9800',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  revisionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  revisionSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
  },
  tutorCard: {
    backgroundColor: '#9C27B0',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  tutorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tutorSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricsPlaceholder: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  levelsGrid: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  levelSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  debugSection: {
    padding: 16,
    backgroundColor: '#E0E0E0',
    margin: 16,
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#333',
  },
});