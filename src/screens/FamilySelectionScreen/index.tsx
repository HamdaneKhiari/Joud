/**
 * FamilySelectionScreen - Sélection des familles d'un module
 * Migration TypeScript FIDÈLE au code JS original
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, ScrollView, StatusBar, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

// Composants
import ExerciseHeader from '@/components/layout/ExerciseHeader';
import FlowCard from '@/components/flow/FlowCard';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import useFamiliesWithProgress from '@/hooks/familySelection/useFamiliesWithProgress';

// Utils (nouveaux remplacements des constants)
import { getModuleLabel, getLevelLabel, getAvailableModules } from '@/utils/labelMapper';
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
  const expoParams = useLocalSearchParams() as unknown as RouteParams;
  const { identity } = useTheme();
  const { db } = useUser();

  // Cast local pour les propriétés manquantes dans l'interface actuelle
  const branding = identity.branding as typeof identity.branding & { 
    themeMode?: 'light' | 'dark'; 
    headerAccent?: string; 
  };

  // =================== PARAMÈTRES ===================
  // Support React Navigation ET Expo Router
  const rawModuleId = route?.params?.moduleId || expoParams.moduleId || expoParams.familyId || '';
  const moduleId = Array.isArray(rawModuleId) ? rawModuleId[0] : rawModuleId.toString();
  const levelId = route?.params?.levelId || expoParams.levelId || '1';
  const numLevelId = Number.parseInt(levelId.toString(), 10);

  // =================== HOOKS & DATA ===================
  // Le hook gère maintenant la résolution ID/Slug en interne via SQL
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

  // =================== CONTENU (Helper pour éviter les ternaires imbriqués) ===================
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={levelColor} />
          <Text style={styles.loadingText}>
            Chargement...
          </Text>
        </View>
      );
    }

    if (families && families.length > 0) {
      return families.map((family: any) => (
        <FlowCard
          key={family.id}
          icon={family.icon} // Délégué à FlowCard (emoji, string, element)
          title={family.name || family.id.toString()}
          subtitle={family.description || ''}
          color={family.color || moduleColor}
          badge={family.badge || null}
          onPress={() =>
            router.push({
              pathname: '/exercise/[exerciseId]',
              params: { exerciseId: moduleId, familyId: family.id, levelId: numLevelId }
            })
          }
        />
      ));
    }

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Aucun contenu disponible pour le moment.
        </Text>
      </View>
    );
  };

  // =================== RENDER ===================

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          // Utilise la config de la DB (theme_mode) au lieu de vérifier les IDs
          barStyle={branding.themeMode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={levelColor}
        />

        <ExerciseHeader
          variant="simple"
          onBack={() => safeGoBack.navigate()}
          rightIcon={
            <DynamicIcon name={moduleLabel.icon} size={28} color={branding.headerAccent} fallback="book" />
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
          {renderContent()}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default FamilySelectionScreen;
