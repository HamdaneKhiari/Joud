// ============================================
// FICHIER: src/screens/OrchestratorScreen/index.js
// ✅ CORRECTIF : Connexion au progrès & Navigation stable
// ============================================

import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { View, StatusBar, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Composants
import ExerciseHeader from '../../../../components/layout/ExerciseHeader';
import FlowCard from '../../../../components/flow/FlowCard';

// Utils & Themes
import { getLevelData } from '../../../../utils/constants';
import { getLevelColor, getLevelGradient } from '@themes/colors';
import { useProgress } from '../../../../contexts/ProgressContext'; // ✅ Ajouté
import useSafeNavigation from '../../../../hooks/useSafeNavigation';
import { styles } from './style';

const OrchestratorScreen = ({ navigation, route }) => {
  const { level = 1 } = route.params || {};
  const numLevel = Number.parseInt(level, 10);
  
  // ✅ Récupération du progrès réel
  const { progress, getFamilyProgress } = useProgress();

  // Navigation sécurisée
  const safeGoBack = useSafeNavigation(
    useCallback(() => navigation.goBack(), [navigation])
  );

  const safeNavigateToAssessment = useSafeNavigation(
    useCallback((lvl) => navigation.navigate('Assessment', { level: lvl }), [navigation])
  );

  const levelColor = useMemo(() => getLevelColor(numLevel), [numLevel]);
  const levelGradient = useMemo(() => getLevelGradient(numLevel), [numLevel]);

  // =================== CALCUL DES STATS RÉELLES ===================
  const userStats = useMemo(() => {
    // On récupère les progrès par module pour ce niveau
    const vocabProgress = getFamilyProgress(numLevel, 'vocab');
    const grammarProgress = getFamilyProgress(numLevel, 'grammar');
    const readingProgress = getFamilyProgress(numLevel, 'reading');
    const gamesProgress = getFamilyProgress(numLevel, 'word_games');

    // Score de maîtrise global (moyenne simple)
    const average = Math.round((vocabProgress + grammarProgress + readingProgress + gamesProgress) / 4);

    return {
      masteryScore: average,
      totalAssessments: progress[`level${numLevel}`]?.assessment?.current_assessment?.completedCount || 0,
      skills: [
        { id: 'vocab', label: 'Vocabulaire', icon: '📚', progress: vocabProgress },
        { id: 'grammar', label: 'Grammaire', icon: '✏️', progress: grammarProgress },
        { id: 'reading', label: 'Lecture', icon: '📖', progress: readingProgress },
        { id: 'word_games', label: 'Jeux de mots', icon: '🎮', progress: gamesProgress },
      ]
    };
  }, [numLevel, progress, getFamilyProgress]);

  const handleStartAssessment = () => {
    safeNavigateToAssessment.navigate(numLevel);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        <ExerciseHeader
          variant="menu"
          onBack={safeGoBack.navigate}
          exerciseTitle="Évaluation Dynamique"
          showLevelBadge
          levelTitle={getLevelData(numLevel)?.badge}
          levelColor={levelColor}
          gradientColors={levelGradient}
        />

        <ScrollView 
          contentContainerStyle={styles.contentContainer} 
          showsVerticalScrollIndicator={false}
        >
          
          {/* 🏆 JAUGE DE MAÎTRISE */}
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

          {/* 🚀 BOUTON D'ACTION PRINCIPAL */}
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

          {/* 📊 ANALYSE PAR COMPÉTENCE */}
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

OrchestratorScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export default OrchestratorScreen;