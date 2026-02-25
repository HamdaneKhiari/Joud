/**
 * ExerciceSelectionScreen - Sélection des exercices d'un niveau (Version Premium)
 * Harmonisation : Grille Uniforme avec badges (Option A)
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, StatusBar, FlatList } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

// Composants
import ExerciseHeader from '@/components/layout/ExerciseHeader';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import ModuleCard from '@/components/modules/ModuleCard';
// ✅ Import supprimé : RecentModuleCard n'est plus utilisé
import SkeletonLoader from '@/components/ui/SkeletonLoader';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeAction from '@/hooks/useSafeAction';
import useGetFamiliesByModule from '@/hooks/useGetFamiliesByModule';

// Utils
import { getModuleLabel, getLevelLabel, getAvailableModules } from '@/utils/labelMapper';
import { getModuleColor } from '@/utils/moduleHelper';
import { navigateToExercise } from '@/utils/navigationHelper';

// Styles
import { createStyles } from './style';

// ============================================
// COMPOSANT HELPER : UNE CARTE DE MODULE (MISE À JOUR)
// ============================================

interface ModuleItemProps {
  exercise: any;
  levelId: number;
  identity: any;
  index: number;
  onPress: () => void;
}

const ModuleItem: React.FC<ModuleItemProps> = ({
  exercise,
  levelId,
  identity,
  index,
  onPress
}) => {
  const { getExerciseProgress } = useProgress();
  const { familyIds, isLoading: loadingFamilies } = useGetFamiliesByModule(exercise.id, levelId);

  // ✅ Calcul de la progression pour l'affichage en badge
  const progress = useMemo(() => {
    if (loadingFamilies) return 0;
    // Si la progression est déjà fournie par le parent (pour le recommandé)
    if (exercise.progress !== undefined) return exercise.progress;
    return getExerciseProgress(levelId, exercise.id, familyIds) || 0;
  }, [loadingFamilies, familyIds, levelId, exercise.id, exercise.progress, getExerciseProgress]);

  return (
    <ModuleCard
      icon={exercise.icon}
      title={exercise.title}
      subtitle=""
      color={exercise.color || identity.palette.primary}
      badge={exercise.badge || null} // ✨ Affiche "EN COURS" si présent
      progress={progress > 0 ? progress : null} // ✨ Affiche le % dans le badge
      onPress={onPress}
      animationDelay={index * 50}
    />
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ExerciseSelectionScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ levelId: string }>();
  const { identity } = useTheme();
  const { db } = useUser();
  const { isLoading, getRecommendedModule, refreshProgress } = useProgress();
  const safeNavigate = useSafeAction();

  const numLevelId = Number.parseInt(params.levelId || '1', 10);
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Rafraîchir la progression depuis SQLite quand l'écran redevient visible
  useFocusEffect(
    useCallback(() => {
      refreshProgress();
    }, [refreshProgress])
  );

  const [levelLabel, setLevelLabel] = useState({ title: '', badge: '', description: '' });
  const [exercises, setExercises] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // ✅ 1. TRI INTELLIGENT : Module en cours en premier
  const sortedExercises = useMemo(() => {
    const recommended = getRecommendedModule(numLevelId);
    if (!recommended || !exercises.length) return exercises;

    const recommendedItem = exercises.find(ex => ex.id === recommended.exerciseType);
    if (!recommendedItem) return exercises;

    const others = exercises.filter(ex => ex.id !== recommended.exerciseType);
    
    return [
      { ...recommendedItem, progress: recommended.progress, badge: 'EN COURS' }, // ✨ Marqué comme récent
      ...others
    ];
  }, [numLevelId, exercises, getRecommendedModule]);

  useEffect(() => {
    const loadData = async () => {
      if (!db || typeof db === 'number') return;
      try {
        setLoadingData(true);
        // ✅ FIX: On passe undefined explicitement pour familyId afin de cibler le label GLOBAL du niveau
        // et éviter de récupérer par erreur une sous-famille (ex: "Le Salé")
        // ✅ FIX (SonarLint): L'argument `undefined` est redondant car `familyId` est optionnel.
        const labelData = await getLevelLabel(db, numLevelId, identity.id);
        setLevelLabel(labelData);

        const moduleSlugs = await getAvailableModules(db, identity.id, numLevelId);
        const exercisesData = await Promise.all(
          moduleSlugs.map(async (slug: string) => {
            const mLabel = await getModuleLabel(db, slug, identity.id);
            const color = await getModuleColor(slug, identity.id, db, moduleSlugs);

            return {
              id: slug,
              icon: mLabel.icon,
              title: mLabel.title,
              description: mLabel.description,
              color,
            };
          })
        );
        setExercises(exercisesData);
      } catch (error) {
        console.error('[ExerciseSelection] Erreur :', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [db, numLevelId, identity.id]);

  const handleExercisePress = (exercise: any) => {
    safeNavigate.execute(() => {
      navigateToExercise(router, { type: exercise.id, levelId: numLevelId });
    });
  };

  // ✅ renderHeader vidé : Plus de section "Continuer" !
  const renderHeader = () => <View style={{ height: 20 }} />;

  // ✅ Détecter si card unique pour layout adaptatif
  const isSingleCard = sortedExercises.length === 1;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const card = (
      <ModuleItem
        exercise={item}
        levelId={numLevelId}
        identity={identity}
        index={index}
        onPress={() => handleExercisePress(item)}
      />
    );

    // ✅ En mode grid, wrapper chaque card pour éviter l'étirement des cards orphelines
    return <View style={isSingleCard ? styles.singleCardWrapper : styles.gridCardWrapper}>{card}</View>;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={identity.themeMode === 'dark' ? 'light-content' : 'dark-content'} />
        <ExerciseHeader
          variant="simple"
          onBack={() => router.back()}
          rightIcon={<DynamicIcon name="book-open" size={28} color={identity.header.accent} />}
          showLevelBadge
          levelTitle={levelLabel.badge}
          exerciseTitle={levelLabel.title}
        />
        {(isLoading || loadingData) ? (
          <View style={styles.skeletonContainer}>
             <View style={styles.gridSkeleton}>
               {[1,2,3,4].map(i => <SkeletonLoader key={i} variant="grid-item" />)}
             </View>
          </View>
        ) : (
          <FlatList
            key={isSingleCard ? 'single' : 'grid'} // ✅ Force re-render selon layout
            data={sortedExercises}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={isSingleCard ? 1 : 2} // ✅ 1 colonne si card unique
            ListHeaderComponent={renderHeader}
            contentContainerStyle={[
              styles.listContent,
              isSingleCard && styles.singleCardContainer // ✅ Centre la card unique
            ]}
            columnWrapperStyle={!isSingleCard ? styles.columnWrapper : undefined}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ExerciseSelectionScreen;