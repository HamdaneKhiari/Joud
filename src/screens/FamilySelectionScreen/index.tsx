/**
 * FamilySelectionScreen - Sélection des familles d'un module (Version Premium)
 * Hiérarchie : Section "Dernière activité" + Grille 2 colonnes
 * Support Mood : Playful (rounded, centered) vs Clean (sharp, left-aligned)
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, StatusBar, Text, FlatList } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

// Composants
import ExerciseHeader from '@/components/layout/ExerciseHeader';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import FamilyCard from '@/components/family/FamilyCard';
import RecentActivityCard from '@/components/family/RecentActivityCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import useFamiliesWithProgress from '@/hooks/familySelection/useFamiliesWithProgress';

// Utils
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
  const { getLastActivity } = useProgress();

  // =================== PARAMÈTRES ===================
  const rawModuleId = route?.params?.moduleId || expoParams.moduleId || expoParams.familyId || '';
  const moduleId = Array.isArray(rawModuleId) ? rawModuleId[0] : rawModuleId.toString();
  const levelId = route?.params?.levelId || expoParams.levelId || '1';
  const numLevelId = Number.parseInt(levelId.toString(), 10);

  // =================== HOOKS & DATA ===================
  const { families, isLoading, refresh } = useFamiliesWithProgress(moduleId, numLevelId);
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Rafraîchir les badges quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Navigation sécurisée pour le retour
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

  // Labels
  const [levelLabel, setLevelLabel] = useState({ badge: '', title: '', description: '' });
  const [moduleLabel, setModuleLabel] = useState({ title: '', icon: '', description: '' });
  const [moduleColor, setModuleColor] = useState(identity.palette.primary || '#000000');

  useEffect(() => {
    const loadLabels = async () => {
      if (db && moduleId) {
        const lLabel = await getLevelLabel(numLevelId, identity.id, db);
        setLevelLabel(lLabel);

        const mLabel = await getModuleLabel(moduleId, identity.id, db);
        setModuleLabel(mLabel);

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

  // Dernière activité
  const recentActivity = useMemo(() => {
    if (!families || families.length === 0) return null;

    const lastActivity = getLastActivity(numLevelId, moduleId);
    if (!lastActivity) return null;

    const family = families.find((f: any) => f.id === lastActivity.familyId);
    if (!family) return null;

    return {
      ...family,
      progress: lastActivity.progress || 0,
    };
  }, [families, numLevelId, moduleId, getLastActivity]);

  // =================== VALIDATION ===================
  if (!moduleId) return null;

  // =================== HANDLERS ===================
  const handleFamilyPress = (familyId: string | number) => {
    router.push({
      pathname: '/exercise/[exerciseId]',
      params: { exerciseId: moduleId, familyId, levelId: numLevelId }
    });
  };

  // =================== RENDER FUNCTIONS ===================
  const renderHeader = () => {
    if (isLoading) return null;

    return (
      <View style={styles.headerSection}>
        {recentActivity && (
          <>
            <Text style={styles.sectionTitle}>Dernière activité</Text>
            <RecentActivityCard
              icon={recentActivity.icon}
              title={recentActivity.name || recentActivity.id.toString()}
              subtitle={recentActivity.description || ''}
              color={recentActivity.color || moduleColor}
              progress={recentActivity.progress}
              badge={recentActivity.badge}
              onPress={() => handleFamilyPress(recentActivity.id)}
            />
            <Text style={styles.sectionTitle}>Toutes les familles</Text>
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
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={styles.emptyTitle}>Aucun contenu disponible</Text>
      <Text style={styles.emptyText}>
        Revenez plus tard pour découvrir de nouvelles familles d'exercices.
      </Text>
    </View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Ne pas afficher la famille dans la grille si elle est dans "Dernière activité"
    if (recentActivity && item.id === recentActivity.id) {
      return null;
    }

    return (
      <FamilyCard
        icon={item.icon}
        title={item.name || item.id.toString()}
        subtitle={item.description || ''}
        color={item.color || moduleColor}
        badge={item.badge || null}
        locked={item.locked || false}
        onPress={() => handleFamilyPress(item.id)}
        animationDelay={index * 50} // Staggered animation
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
          onBack={() => safeGoBack.navigate()}
          rightIcon={
            <DynamicIcon name={moduleLabel.icon} size={28} color={identity.header.accent} fallback="book" />
          }
          showLevelBadge
          levelTitle={levelLabel.badge}
          exerciseTitle={moduleLabel.title}
        />

        {isLoading ? (
          renderSkeleton()
        ) : (
          <FlatList
            data={families}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
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

export default FamilySelectionScreen;
