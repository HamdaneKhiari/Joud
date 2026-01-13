/**
 * ExerciceSelectionScreen - Sélection des exercices d'un niveau
 * Migration TypeScript FIDÈLE au code JS original
 */

import React, { useMemo } from 'react';
import { View, ScrollView, StatusBar, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Composants
import ExerciseHeader from '@/components/layout/ExerciseHeader';
import FlowCard from '@/components/flow/FlowCard';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeAction from '@/hooks/useSafeAction';
import useGetFamiliesByModule from '@/hooks/useGetFamiliesByModule';

// Utils (nouveaux remplacements des constants)
import { getModuleLabel, getLevelLabel, getAvailableModules } from '@/utils/labelMapper';
import { getBadgeByProgress, getBadgeLabel } from '@/utils/badgeHelper';
import { navigateToExercise } from '@/utils/navigationHelper';
import { getModuleColor } from '@/utils/moduleHelper';

// Styles
import { createStyles } from './style';

// ============================================
// TYPES
// ============================================

interface RouteParams {
  levelId?: string;
}

interface NavigationProp {
  navigate: (screen: string, params: any) => void;
  goBack: () => void;
}

// Props pour compatibilité React Navigation (si utilisé)
interface ExerciseSelectionScreenProps {
  navigation?: NavigationProp;
  route?: {
    params?: {
      levelId?: string | number;
    };
  };
}

// ============================================
// COMPOSANT HELPER POUR CHAQUE EXERCICE
// ============================================

interface ExerciseItemProps {
  exercise: {
    id: string;
    icon: string;
    title: string;
    description: string;
  };
  levelId: number;
  identity: any;
  onPress: () => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  levelId,
  identity,
  onPress
}) => {
  const { getExerciseProgress } = useProgress();

  // Récupération des familles pour ce module (SQLite)
  const { familyIds, isLoading: loadingFamilies } = useGetFamiliesByModule(
    exercise.id,
    levelId
  );

  // Calcul RÉEL de la progression
  const progress = useMemo(() => {
    if (loadingFamilies) return 0;
    return getExerciseProgress(levelId, exercise.id, familyIds) || 0;
  }, [loadingFamilies, familyIds, levelId, exercise.id, getExerciseProgress]);

  const badgeType = getBadgeByProgress(progress);
  const badge = getBadgeLabel(badgeType, identity);

  return (
    <FlowCard
      icon={exercise.icon} // Délégué à FlowCard (emoji, string, element)
      title={exercise.title}
      subtitle={exercise.description}
      color={getModuleColor(exercise.id, identity)}
      badge={badge}
      onPress={onPress}
    />
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ExerciseSelectionScreen: React.FC<ExerciseSelectionScreenProps> = ({
  navigation,
  route
}) => {
  const router = useRouter();
  const expoParams = useLocalSearchParams<RouteParams>();
  const { identity } = useTheme();
  const { isLoading } = useProgress();
  const safeNavigate = useSafeAction();

  // =================== PARAMÈTRES ===================
  // Support React Navigation ET Expo Router
  const levelId = route?.params?.levelId || expoParams.levelId || '1';
  const numLevelId = Number.parseInt(levelId.toString(), 10);

  // =================== HOOKS & DATA ===================
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Labels du niveau (remplace getLevelData)
  const levelLabel = useMemo(() => getLevelLabel(numLevelId, identity), [numLevelId, identity]);

  // Couleur du niveau (remplace getLevelColor)
  const levelColor = identity.branding.main;

  // Gradient du niveau (remplace getLevelGradient)
  const levelGradient = useMemo(() => {
    if (identity.ui.hasGradient && identity.ui.gradientColors) {
      return identity.ui.gradientColors;
    }
    return [levelColor, levelColor];
  }, [identity, levelColor]);

  // Modules disponibles (remplace EXERCISES + LEVEL_PROGRESSION_MAP)
  const exercises = useMemo(() => {
    const moduleIds = getAvailableModules(identity, numLevelId);

    return moduleIds.map(moduleId => {
      const moduleLabel = getModuleLabel(moduleId, identity);
      return {
        id: moduleId,
        icon: moduleLabel.icon, // Délégué à FlowCard
        title: moduleLabel.title,
        description: moduleLabel.description
      };
    });
  }, [numLevelId, identity]);

  // =================== HANDLERS ===================

  const handleExercisePress = (exercise: typeof exercises[0]) => {
    safeNavigate.execute(() => {
      if (exercise.id === 'assessment') {
        // Évaluation (quiz)
        navigateToExercise(router, {
          type: 'quiz',
          levelId: numLevelId
        });
      } else {
        // Navigation vers FamilySelection
        // Support React Navigation SI disponible
        if (navigation) {
          navigation.navigate('FamilySelection', {
            moduleId: exercise.id,
            levelId: numLevelId
          });
        } else {
          // Sinon Expo Router
          navigateToExercise(router, {
            type: exercise.id,
            levelId: numLevelId
          });
        }
      }
    });
  };

  const handleBackPress = () => {
    safeNavigate.execute(() => {
      if (navigation) {
        navigation.goBack();
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    });
  };

  // =================== RENDER ===================

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={identity.id === 'lycee' || identity.id === 'college' ? 'light-content' : 'dark-content'}
          backgroundColor={levelColor}
        />

        <ExerciseHeader
          variant="simple"
          onBack={handleBackPress}
          rightIcon="📚" // Icon par défaut (SCREEN_ICONS.EXERCISE_SELECTION remplacé)
          showLevelBadge
          levelTitle={numLevelId.toString()}
          levelColor={levelColor}
          exerciseTitle={levelLabel.title}
          gradientColors={levelGradient}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={levelColor} />
              <Text style={styles.loadingText}>
                {identity.id === 'lycee' ? 'Loading progress...' : 'Calcul de tes progrès...'}
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {exercises.map(exercise => (
                <ExerciseItem
                  key={exercise.id}
                  exercise={exercise}
                  levelId={numLevelId}
                  identity={identity}
                  onPress={() => handleExercisePress(exercise)}
                />
              ))}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ExerciseSelectionScreen;
