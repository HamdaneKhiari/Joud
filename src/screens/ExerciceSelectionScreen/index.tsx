/**
 * ExerciceSelectionScreen - Sélection des exercices d'un niveau (Version Premium)
 * Hiérarchie : Section "Continuer" + Grille 2 colonnes
 * Support Mood : Playful (rounded, centered) vs Clean (sharp, left-aligned)
 */

import React, { useMemo, useState, useEffect } from 'react';
import { View, StatusBar, Text, FlatList } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Composants
import ExerciseHeader from '@/components/layout/ExerciseHeader';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import ModuleCard from '@/components/modules/ModuleCard';
import RecentModuleCard from '@/components/modules/RecentModuleCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeAction from '@/hooks/useSafeAction';
import useGetFamiliesByModule from '@/hooks/useGetFamiliesByModule';

// Utils
import { getModuleLabel, getLevelLabel, getAvailableModules } from '@/utils/labelMapper';
import { getBadgeByProgress, getBadgeLabel } from '@/utils/badgeHelper';
import { navigateToExercise } from '@/utils/navigationHelper';
import { getModuleColor } from '@/utils/moduleHelper';

// Styles
import { createStyles } from './style';

// ============================================
// COMPOSANT HELPER : UNE CARTE DE MODULE
// ============================================

interface ModuleItemProps {
  exercise: {
    id: string; // Slug (ex: 'vocab')
    icon: string;
    title: string;
    description: string;
  };
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
  const { db } = useUser();
  const [moduleColor, setModuleColor] = useState<string>(identity.palette.primary);

  // Récupération des familles via le Slug technique (ex: 'phrase_types')
  const { familyIds, isLoading: loadingFamilies } = useGetFamiliesByModule(
    exercise.id,
    levelId
  );

  useEffect(() => {
    const loadColor = async () => {
      if (!db) return;
      try {
        const availableModules = await getAvailableModules(identity.id, levelId, db);
        const color = await getModuleColor(exercise.id, identity.id, db, availableModules);
        setModuleColor(color);
      } catch (error) {
        console.warn(`[ModuleItem] Impossible de charger la couleur pour : ${exercise.id}`, error);
        setModuleColor(identity.palette.primary);
      }
    };
    loadColor();
  }, [db, exercise.id, identity.id, levelId]);

  const progress = useMemo(() => {
    if (loadingFamilies) return 0;
    return getExerciseProgress(levelId, exercise.id, familyIds) || 0;
  }, [loadingFamilies, familyIds, levelId, exercise.id, getExerciseProgress]);

  const badgeType = getBadgeByProgress(progress);
  const badge = getBadgeLabel(badgeType, identity);

  return (
    <ModuleCard
      icon={exercise.icon}
      title={exercise.title}
      subtitle={exercise.description}
      color={moduleColor}
      badge={badge}
      onPress={onPress}
      animationDelay={index * 50} // Staggered animation
    />
  );
};

// ============================================
// COMPOSANT PRINCIPAL : ECRAN DE SELECTION
// ============================================

const ExerciseSelectionScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ levelId: string }>();
  const { identity } = useTheme();
  const { db } = useUser();
  const { isLoading, getRecommendedModule, getExerciseProgress } = useProgress();
  const safeNavigate = useSafeAction();

  const numLevelId = Number.parseInt(params.levelId || '1', 10);
  const styles = useMemo(() => createStyles(identity), [identity]);

  const [levelLabel, setLevelLabel] = useState({ title: '', badge: '', description: '' });
  const [exercises, setExercises] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Module recommandé (dernière activité)
  const recommendedModule = useMemo(() => {
    const recommended = getRecommendedModule(numLevelId);
    if (!recommended || !exercises.length) return null;

    const exercise = exercises.find(ex => ex.id === recommended.exerciseType);
    if (!exercise) return null;

    return {
      ...exercise,
      progress: recommended.progress,
    };
  }, [numLevelId, exercises, getRecommendedModule]);

  useEffect(() => {
    const loadData = async () => {
      if (!db) return;
      try {
        setLoadingData(true);

        // 1. Charger le nom du niveau (ex: Mastery)
        const labelData = await getLevelLabel(numLevelId, identity.id, db);
        setLevelLabel(labelData);

        // 2. Modules Autorisés (Filtrage Identity + Level)
        const moduleSlugs = await getAvailableModules(identity.id, numLevelId, db);

        // 3. Charger les détails visuels de chaque module
        const exercisesData = await Promise.all(
          moduleSlugs.map(async (slug: string) => {
            const mLabel = await getModuleLabel(slug, identity.id, db);
            const availableModules = await getAvailableModules(identity.id, numLevelId, db);
            const color = await getModuleColor(slug, identity.id, db, availableModules);

            return {
              id: slug, // On utilise le SLUG comme identifiant
              icon: mLabel.icon,
              title: mLabel.title,
              description: mLabel.description,
              color,
            };
          })
        );

        setExercises(exercisesData);
      } catch (error) {
        console.error('[ExerciseSelection] Erreur fatale de chargement :', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [db, numLevelId, identity.id]);

  const handleExercisePress = (exercise: any) => {
    safeNavigate.execute(() => {
      // Redirection vers FamilySelection avec le SLUG technique
      navigateToExercise(router, {
        type: exercise.id, // Envoie 'vocab', 'phrase_types', etc.
        levelId: numLevelId
      });
    });
  };

  // =================== RENDER FUNCTIONS ===================
  const renderHeader = () => {
    if (isLoading || loadingData) return null;

    return (
      <View style={styles.headerSection}>
        {recommendedModule && (
          <>
            <Text style={styles.sectionTitle}>Continuer</Text>
            <RecentModuleCard
              icon={recommendedModule.icon}
              title={recommendedModule.title}
              subtitle={recommendedModule.description}
              color={recommendedModule.color || identity.palette.primary}
              progress={recommendedModule.progress}
              onPress={() => handleExercisePress(recommendedModule)}
            />
            <Text style={styles.sectionTitle}>Tous les modules</Text>
          </>
        )}
      </View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <SkeletonLoader variant="recent-activity" />
      <View style={styles.gridSkeleton}>
        <SkeletonLoader variant="grid-item" />
        <SkeletonLoader variant="grid-item" />
        <SkeletonLoader variant="grid-item" />
        <SkeletonLoader variant="grid-item" />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📚</Text>
      <Text style={styles.emptyTitle}>Aucun module disponible</Text>
      <Text style={styles.emptyText}>
        Revenez plus tard pour découvrir de nouveaux modules d'apprentissage.
      </Text>
    </View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Ne pas afficher le module dans la grille s'il est dans "Continuer"
    if (recommendedModule && item.id === recommendedModule.id) {
      return null;
    }

    return (
      <ModuleItem
        exercise={item}
        levelId={numLevelId}
        identity={identity}
        index={index}
        onPress={() => handleExercisePress(item)}
      />
    );
  };

  // =================== RENDER ===================
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={identity.themeMode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={Array.isArray(identity.header.background) ? identity.header.background[0] : identity.header.background}
        />

        <ExerciseHeader
          variant="simple"
          onBack={() => router.back()}
          rightIcon={
            <DynamicIcon
              name="book-open"
              size={28}
              color={identity.header.accent}
            />
          }
          showLevelBadge
          levelTitle={numLevelId.toString()}
          exerciseTitle={levelLabel.title}
        />

        {(isLoading || loadingData) ? (
          renderSkeleton()
        ) : (
          <FlatList
            data={exercises}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ExerciseSelectionScreen;
