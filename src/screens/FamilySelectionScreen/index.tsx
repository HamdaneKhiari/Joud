/**
 * FamilySelectionScreen - Sélection des familles d'un module
 * Migration TypeScript FIDÈLE au code JS original
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, ScrollView, StatusBar, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Composants
import ExerciseHeader from '@/components/layout/ExerciseHeader';
import FlowCard from '@/components/flow/FlowCard';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import useFamiliesWithProgress from '@/hooks/familySelection/useFamiliesWithProgress';

// Utils (nouveaux remplacements des constants)
import { getModuleLabel, getLevelLabel, getAvailableModules } from '@/utils/labelMapper';
import { navigateToExercise } from '@/utils/navigationHelper';
import { getModuleColor } from '@/utils/moduleHelper';

// Styles
import { createStyles } from './style';

// ============================================
// TYPES
// ============================================

interface RouteParams {
  moduleId?: string;
  levelId?: string;
  familyId?: string;
}

interface NavigationProp {
  navigate?: (screen: string, params: any) => void;
  goBack?: () => void;
}

interface FamilySelectionScreenProps {
  navigation?: NavigationProp;
  route?: {
    params?: {
      moduleId?: string;
      levelId?: string | number;
    };
  };
}

// ============================================
// COMPOSANT
// ============================================

const FamilySelectionScreen: React.FC<FamilySelectionScreenProps> = ({
  navigation,
  route
}) => {
  const router = useRouter();
  const expoParams = useLocalSearchParams<RouteParams>();
  const { identity } = useTheme();
  const { db } = useUser();

  // =================== PARAMÈTRES ===================
  // Support React Navigation ET Expo Router
  const moduleId = route?.params?.moduleId || expoParams.moduleId || expoParams.familyId || '';
  const levelId = route?.params?.levelId || expoParams.levelId || '1';
  const numLevelId = Number.parseInt(levelId.toString(), 10);

  // =================== HOOKS & DATA ===================
  const { families, isLoading, refresh } = useFamiliesWithProgress(moduleId, numLevelId);

  const styles = useMemo(() => createStyles(identity), [identity]);

  // Rafraîchir les badges quand on revient sur l'écran (logique originale)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Navigation sécurisée pour le retour (logique originale)
  const safeGoBack = useSafeNavigation(
    useCallback(() => {
      if (navigation?.goBack) {
        navigation.goBack();
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }, [navigation, router])
  );

  // Labels (remplace getLevelData, getExerciseData, getModuleMetadata)
  const [levelLabel, setLevelLabel] = useState({ badge: '', title: '', description: '' });
  const [moduleLabel, setModuleLabel] = useState({ title: '', icon: '', description: '' });
  const [moduleColor, setModuleColor] = useState(identity.branding.main || '#000000');

  useEffect(() => {
    const loadLabels = async () => {
      if (db && moduleId) {
        const lLabel = await getLevelLabel(numLevelId, identity.id, db);
        setLevelLabel(lLabel);
        
        const mLabel = await getModuleLabel(moduleId, identity.id, db);
        setModuleLabel(mLabel);

        // Récupération des modules pour calculer l'index de couleur (évite le crash indexOf undefined)
        const availableModules = await getAvailableModules(identity.id, numLevelId, db);
        const slugs = Array.isArray(availableModules) 
          ? availableModules.map((m: any) => (typeof m === 'string' ? m : m.slug)) 
          : [];
          
        const mColor = await getModuleColor(moduleId, identity.id, db, slugs);
        if (mColor) setModuleColor(mColor);
      }
    };
    loadLabels();
  }, [db, moduleId, numLevelId, identity.id]);

  // Couleurs (remplace getLevelColor, getLevelGradient)
  const levelColor = identity.branding.main;
  const levelGradient = useMemo(() => {
    if (identity.ui.hasGradient && identity.ui.gradientColors) {
      return identity.ui.gradientColors;
    }
    return [levelColor, levelColor];
  }, [identity, levelColor]);

  // =================== VALIDATION ===================
  if (!moduleId) return null;

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
          onBack={() => safeGoBack.navigate()}
          rightIcon={
            moduleLabel.icon ? (
              <MaterialCommunityIcons name={moduleLabel.icon as any} size={28} color={identity.branding.headerAccent} />
            ) : null
          }
          showLevelBadge
          levelTitle={levelLabel.badge}
          levelColor={levelColor}
          exerciseTitle={moduleLabel.title}
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
                {identity.id === 'lycee' ? 'Loading...' : 'Chargement...'}
              </Text>
            </View>
          ) : families && families.length > 0 ? (
            families.map(family => (
              <FlowCard
                key={family.id}
                icon={family.icon} // Délégué à FlowCard (emoji, string, element)
                title={family.name || family.title || family.id}
                subtitle={family.subtitle || ''}
                color={family.color || moduleColor}
                badge={family.badge || null}
                onPress={() =>
                  navigateToExercise(router, {
                    type: moduleId,
                    levelId: numLevelId,
                    familyId: family.id,
                    moduleId: moduleId
                  })
                }
              />
            ))
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {identity.id === 'lycee'
                  ? 'No content available yet.'
                  : identity.id === 'adult'
                  ? 'Aucun contenu disponible.'
                  : 'Aucun contenu disponible pour le moment.'}
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default FamilySelectionScreen;
