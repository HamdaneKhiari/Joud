/**
 * ExerciceSelectionScreen - Sélection des exercices d'un niveau
 * Version TypeScript avec système dynamique
 */

import React, { useMemo } from 'react';
import { View, ScrollView, StatusBar, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Composants
import ExerciseHeader from '@/components/layout/ExerciseHeader';
import FlowCard from '@/components/flow/FlowCard';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeAction from '@/hooks/useSafeAction';

// Utils
import { getModuleLabel, getLevelLabel, getAvailableModules } from '@/utils/labelMapper';
import { getBadgeByProgress } from '@/utils/badgeHelper';
import { navigateToExercise } from '@/utils/navigationHelper';
import { getModuleColor } from '@/utils/moduleHelper';
import { createStyles } from './style';

// ============================================
// TYPES
// ============================================

interface RouteParams {
  levelId?: string;
}

// ============================================
// COMPOSANT
// ============================================

const ExerciseSelectionScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<RouteParams>();
  const { identity } = useTheme();
  const { getExerciseProgress, isLoading } = useProgress();
  const safeNavigate = useSafeAction();

  // Styles dynamiques
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Paramètres
  const levelId = Number.parseInt(params.levelId || '1', 10);

  // Labels du niveau
  const levelLabel = useMemo(() => getLevelLabel(levelId, identity), [levelId, identity]);

  // Modules disponibles pour cette identité et ce niveau
  const availableModules = useMemo(
    () => getAvailableModules(identity, levelId),
    [identity, levelId]
  );

  // Gradient pour le header
  const headerGradient = useMemo(() => {
    if (identity.ui.hasGradient && identity.ui.gradientColors) {
      return identity.ui.gradientColors;
    }
    return [identity.branding.main, identity.branding.main];
  }, [identity]);

  // =================== HANDLERS ===================

  const handleExercisePress = (moduleId: string) => {
    safeNavigate.execute(() => {
      if (moduleId === 'assessment') {
        // Évaluation (quiz)
        navigateToExercise(router, {
          type: 'quiz',
          levelId
        });
      } else {
        // Navigation vers la sélection des familles
        navigateToExercise(router, {
          type: moduleId,
          levelId
        });
      }
    });
  };

  const handleBackPress = () => {
    safeNavigate.execute(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={identity.id === 'lycee' || identity.id === 'college' ? 'light-content' : 'dark-content'}
          backgroundColor={identity.branding.main}
        />

        <ExerciseHeader
          variant="simple"
          onBack={handleBackPress}
          rightIcon={
            <MaterialCommunityIcons
              name="school"
              size={24}
              color={identity.id === 'adult' ? '#1F2937' : '#FFFFFF'}
            />
          }
          showLevelBadge
          levelTitle={levelLabel.badge}
          levelColor={identity.branding.main}
          exerciseTitle={levelLabel.title}
          subtitle={levelLabel.description}
          gradientColors={headerGradient}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={identity.branding.main} />
              <Text style={styles.loadingText}>
                {identity.id === 'lycee' ? 'Loading...' : 'Calcul de tes progrès...'}
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {availableModules.map(moduleId => {
                const moduleLabel = getModuleLabel(moduleId, identity);
                const moduleColor = getModuleColor(moduleId, identity);

                // Calcul progression (TODO: remplacer par données SQLite réelles)
                const progress = 0; // getExerciseProgress(levelId, moduleId, allFamilyIds);
                const badge = getBadgeByProgress(progress);

                return (
                  <View key={moduleId} style={styles.flowCardWrapper}>
                    <FlowCard
                      icon={
                        <MaterialCommunityIcons
                          name={moduleLabel.icon as any}
                          size={32}
                          color="#FFFFFF"
                        />
                      }
                      title={moduleLabel.title}
                      subtitle={moduleLabel.description}
                      color={moduleColor}
                      badge={badge}
                      onPress={() => handleExercisePress(moduleId)}
                    />
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ExerciseSelectionScreen;
