// ============================================
// FICHIER: src/screens/AssessmentResultsScreen/index.js
// ✅ CORRECTIF : Navigation stable & Calculs mémorisés
// ============================================

import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { View, StatusBar, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

// Composants
import ExerciseHeader from '../../../../components/layout/ExerciseHeader';
import FlowCard from '../../../../components/flow/FlowCard';

// Utils
import { getLevelData } from '../../../../utils/constants';
import { getLevelColor, getLevelGradient } from '@themes/colors';
import useSafeNavigation from '../../../../hooks/useSafeNavigation'; // ✅ Changé pour useSafeNavigation
import { styles } from './style';

const AssessmentResultsScreen = ({ navigation, route }) => {
  // ✅ Extraction et conversion propre du level
  const { level = 1, userAnswers = {}, totalQuestions = 0, score = 0 } = route.params || {};
  const numLevel = parseInt(level, 10);

  // ✅ Mémorisation des couleurs et data
  const levelColor = useMemo(() => getLevelColor(numLevel), [numLevel]);
  const levelGradient = useMemo(() => getLevelGradient(numLevel), [numLevel]);
  const levelBadge = useMemo(() => getLevelData(numLevel)?.badge, [numLevel]);

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isPassed = percentage >= 70;

  // ✅ CORRECTION NAVIGATION : Cohérence avec AssessmentScreen
  const safeNavigateToOrchestrator = useSafeNavigation(
    useCallback(() => {
      navigation.navigate('AssessmentOrchestrator', { level: numLevel });
    }, [navigation, numLevel])
  );

  // =================== LOGIQUE D'ANALYSE PAR THÈME ===================
  // ✅ Mémorisé pour éviter de recalculer pendant le scroll
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
        <StatusBar barStyle="dark-content" />
        
        <ExerciseHeader
          variant="exercise"
          onBack={handleContinue} // On redirige vers l'orchestrateur au clic sur retour
          exerciseTitle="Résultats de l'évaluation"
          showLevelBadge
          levelTitle={levelBadge}
          levelColor={levelColor}
          gradientColors={levelGradient}
        />

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.scoreCard}>
            <Text style={styles.emoji}>{isPassed ? '🎉' : '💪'}</Text>
            <Text style={styles.mainMessage}>
              {isPassed ? 'Évaluation Validée !' : 'Continue tes efforts !'}
            </Text>
            
            <View style={[styles.scoreContainer, { borderColor: isPassed ? '#10B981' : '#F59E0B' }]}>
              <Text style={[styles.scorePercentage, { color: isPassed ? '#10B981' : '#F59E0B' }]}>
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
                subtitle={stat.total > 0 ? `${stat.correct} / ${stat.total} correctes` : "Non évalué"}
                color={levelColor}
                progress={stat.percent}
              />
            ))}
          </View>

          <View style={{ padding: 20, gap: 12 }}>
            <TouchableOpacity 
              style={[styles.continueButton, { backgroundColor: levelColor }]} 
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

AssessmentResultsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export default AssessmentResultsScreen;