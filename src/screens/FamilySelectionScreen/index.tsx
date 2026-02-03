/**
 * FamilySelectionScreen - Sélection des familles d'un module (Version Premium)
 * Nettoyage : Suppression des doublons de rafraîchissement
 */

import React, { useMemo, useState, useEffect } from 'react';
import { View, StatusBar, Text, FlatList } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Composants
import ExerciseHeader from '@/components/layout/ExerciseHeader';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import FamilyCard from '@/components/family/FamilyCard';
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
import { moduleHasSubfamilies } from '@/config/moduleConfig';

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

interface FamilySelectionScreenProps {
  navigation?: any;
  route?: any;
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
  // ✅ Le hook useFamiliesWithProgress gère déjà son propre focusEffect pour le rafraîchissement
  const { families, isLoading } = useFamiliesWithProgress(moduleId, numLevelId);
  const styles = useMemo(() => createStyles(identity), [identity]);

  const safeGoBack = useSafeNavigation(() => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  });

  // Labels & UI State
  const [levelLabel, setLevelLabel] = useState({ badge: '', title: '', description: '' });
  const [moduleLabel, setModuleLabel] = useState({ title: '', icon: '', description: '' });
  const [moduleColor, setModuleColor] = useState(identity.palette.primary || '#000000');

  useEffect(() => {
    const loadLabels = async () => {
      if (db && typeof db !== 'number' && moduleId) {
        try {
          // Utilisation de db en premier argument comme défini dans labelMapper
          const lLabel = await getLevelLabel(db, numLevelId, identity.id);
          setLevelLabel(lLabel);

          const mLabel = await getModuleLabel(db, moduleId, identity.id);
          setModuleLabel(mLabel);

          const availableModules = await getAvailableModules(db, identity.id, numLevelId);
          const slugs = Array.isArray(availableModules)
            ? availableModules.map((m: any) => (typeof m === 'string' ? m : m.slug))
            : [];

          const mColor = await getModuleColor(moduleId, identity.id, db, slugs);
          if (mColor) setModuleColor(mColor);
        } catch (error) {
          console.error('[FamilySelection] Label load error:', error);
        }
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

    return { ...family, progress: lastActivity.progress || 0 };
  }, [families, numLevelId, moduleId, getLastActivity]);

  // ✅ Trier les familles : recentActivity en premier
  const sortedFamilies = useMemo(() => {
    if (!families) return [];
    if (!recentActivity) return families;

    // Séparer recentActivity des autres
    const others = families.filter((f: any) => f.id !== recentActivity.id);

    // Mettre recentActivity en premier avec son badge "EN COURS"
    return [
      { ...recentActivity, badge: 'EN COURS', isRecent: true },
      ...others
    ];
  }, [families, recentActivity]);

  if (!moduleId) return null;

 const handleFamilyPress = (familyId: string | number) => {
  // ✅ Vérifier si ce module a des sous-familles
  const hasSubfamilies = moduleHasSubfamilies(moduleId);

  if (hasSubfamilies) {
    // Route vers SubFamilySelectionScreen
    router.push({
      pathname: '/subfamily/[subfamilyId]',
      params: {
        subfamilyId: familyId.toString(),
        familyId: familyId.toString(), // Aussi en familyId pour compatibilité
        moduleId: moduleId,
        levelId: numLevelId.toString()
      }
    });
  } else {
    // Route directement vers l'exercice (pas de subfamilies)
    router.push({
      pathname: '/exercise/[exerciseId]',
      params: {
        exerciseId: moduleId,
        familyId: familyId.toString(),
        levelId: numLevelId.toString(),
        moduleId: moduleId
      }
    });
  }
};

  // =================== RENDER FUNCTIONS ===================
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <SkeletonLoader variant="recent-activity" />
      <View style={styles.gridSkeleton}>
        {[1, 2, 3, 4].map((i) => <SkeletonLoader key={i} variant="grid-item" />)}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={styles.emptyTitle}>Aucun contenu disponible</Text>
      <Text style={styles.emptyText}>Revenez plus tard pour découvrir de nouvelles familles.</Text>
    </View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <FamilyCard
        icon={item.icon}
        title={item.name || item.id.toString()}
        subtitle={item.description || ''}
        color={item.color || moduleColor}
        badge={item.badge || null}
        progress={item.progress || null}
        locked={item.locked || false}
        onPress={() => handleFamilyPress(item.id)}
        animationDelay={index * 50}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={identity.themeMode === 'dark' ? 'light-content' : 'dark-content'} />

        <ExerciseHeader
          variant="simple"
          onBack={() => safeGoBack.navigate()}
          rightIcon={<DynamicIcon name={moduleLabel.icon} size={28} color={identity.header.accent} fallback="book" />}
          showLevelBadge
          levelTitle={levelLabel.badge}
          exerciseTitle={moduleLabel.title}
        />

        {isLoading ? renderSkeleton() : (
          <FlatList
            data={sortedFamilies}
            renderItem={renderItem}
            keyExtractor={(item) => `family-${item.id}`}
            numColumns={2}
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