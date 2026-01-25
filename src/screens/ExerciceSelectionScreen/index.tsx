/**
 * ExerciceSelectionScreen - Sélection des exercices d'un niveau
 * Version finale : Nettoyée, typée et sécurisée
 */

import React, { useMemo, useState, useEffect } from 'react';
import { View, ScrollView, StatusBar, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Composants
import ExerciseHeader from '@/components/layout/ExerciseHeader';
import FlowCard from '@/components/flow/FlowCard';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

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
// COMPOSANT HELPER : UNE CARTE D'EXERCICE
// ============================================

interface ExerciseItemProps {
  exercise: {
    id: string; // Slug (ex: 'vocab')
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
  const { db } = useUser();
  const [moduleColor, setModuleColor] = useState<string>(identity.branding.main);

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
        // ✅ Correction SonarLint : On gère l'exception explicitement
        console.warn(`[ExerciseItem] Impossible de charger la couleur pour : ${exercise.id}`, error);
        setModuleColor(identity.branding.main);
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
    <FlowCard
      icon={exercise.icon}
      title={exercise.title}
      subtitle={exercise.description}
      color={moduleColor}
      badge={badge}
      onPress={onPress}
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
  const { isLoading } = useProgress();
  const safeNavigate = useSafeAction();

  const numLevelId = Number.parseInt(params.levelId || '1', 10);
  const styles = useMemo(() => createStyles(identity), [identity]);

  const [levelLabel, setLevelLabel] = useState({ title: '', badge: '', description: '' });
  const [exercises, setExercises] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
            return {
              id: slug, // On utilise le SLUG comme identifiant
              icon: mLabel.icon,
              title: mLabel.title,
              description: mLabel.description
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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={identity.id === 'lycee' || identity.id === 'college' ? 'light-content' : 'dark-content'}
          backgroundColor={identity.branding.main}
        />

        <ExerciseHeader
          variant="simple"
          onBack={() => router.back()}
          rightIcon={
            <DynamicIcon 
              name="book-open" 
              size={28} 
              color={identity.branding.headerAccent} 
            />
          }
          showLevelBadge
          levelTitle={numLevelId.toString()}
          exerciseTitle={levelLabel.title}
          // levelColor a été retiré car non présent dans les types de ExerciseHeader
        />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {(isLoading || loadingData) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={identity.branding.main} />
              <Text style={styles.loadingText}>Chargement des modules...</Text>
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