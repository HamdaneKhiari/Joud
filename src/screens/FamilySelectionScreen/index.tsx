/**
 * FamilySelectionScreen - Sélection des familles d'un module
 * Version TypeScript avec système dynamique
 */

import React, { useCallback, useMemo } from 'react';
import { View, ScrollView, StatusBar, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Composants
import ExerciseHeader from '@/components/layout/ExerciseHeader';
import FlowCard from '@/components/flow/FlowCard';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import useFamiliesWithProgress from '@/hooks/familySelection/useFamiliesWithProgress';

// Utils
import { getModuleLabel, getLevelLabel } from '@/utils/labelMapper';
import { navigateToExercise } from '@/utils/navigationHelper';
import { getModuleColor } from '@/utils/moduleHelper';
import { createStyles } from './style';

// ============================================
// TYPES
// ============================================

interface RouteParams {
  moduleId?: string;
  levelId?: string;
  familyId?: string;
}

// ============================================
// COMPOSANT
// ============================================

const FamilySelectionScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<RouteParams>();
  const { identity } = useTheme();

  // Paramètres
  const moduleId = params.moduleId || params.familyId || '';
  const levelId = Number.parseInt(params.levelId || '1', 10);

  // Hook pour charger les familles avec progression
  const { families, isLoading, refresh } = useFamiliesWithProgress(moduleId, levelId);

  // Styles dynamiques
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Labels
  const levelLabel = useMemo(() => getLevelLabel(levelId, identity), [levelId, identity]);
  const moduleLabel = useMemo(() => getModuleLabel(moduleId, identity), [moduleId, identity]);
  const moduleColor = useMemo(() => getModuleColor(moduleId, identity), [moduleId, identity]);

  // Gradient pour le header
  const headerGradient = useMemo(() => {
    if (identity.ui.hasGradient && identity.ui.gradientColors) {
      return identity.ui.gradientColors;
    }
    return [identity.branding.main, identity.branding.main];
  }, [identity]);

  // Rafraîchir les badges quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Navigation sécurisée
  const safeGoBack = useSafeNavigation(
    useCallback(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }, [router])
  );

  // Handler
  const handleFamilyPress = (familyId: string) => {
    navigateToExercise(router, {
      type: moduleId,
      levelId,
      familyId,
      moduleId
    });
  };

  if (!moduleId) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={identity.id === 'lycee' || identity.id === 'college' ? 'light-content' : 'dark-content'}
          backgroundColor={identity.branding.main}
        />

        <ExerciseHeader
          variant="simple"
          onBack={() => safeGoBack.navigate()}
          rightIcon={
            <MaterialCommunityIcons
              name={moduleLabel.icon as any}
              size={24}
              color={identity.id === 'adult' ? '#1F2937' : '#FFFFFF'}
            />
          }
          showLevelBadge
          levelTitle={levelLabel.badge}
          levelColor={identity.branding.main}
          exerciseTitle={moduleLabel.title}
          subtitle={moduleLabel.description}
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
                {identity.id === 'lycee' ? 'Loading...' : 'Chargement...'}
              </Text>
            </View>
          ) : families.length === 0 ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {identity.id === 'lycee'
                  ? 'No content available yet.'
                  : 'Aucun contenu disponible pour le moment.'}
              </Text>
            </View>
          ) : (
            families.map(family => (
              <View key={family.id} style={styles.flowCardWrapper}>
                <FlowCard
                  icon={
                    family.icon ? (
                      <MaterialCommunityIcons
                        name={family.icon as any}
                        size={32}
                        color="#FFFFFF"
                      />
                    ) : (
                      <MaterialCommunityIcons name="folder" size={32} color="#FFFFFF" />
                    )
                  }
                  title={family.name || family.title || family.id}
                  subtitle={family.subtitle || ''}
                  color={family.color || moduleColor}
                  badge={family.badge}
                  onPress={() => handleFamilyPress(family.id)}
                />
              </View>
            ))
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default FamilySelectionScreen;
