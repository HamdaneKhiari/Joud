import { log } from '@/utils/logUtils';
import React, { useMemo, useState, useEffect } from 'react';
import { View, StatusBar, Text, FlatList } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ExerciseHeader from '@/components/layout/ExerciseHeader';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import FamilyCard from '@/components/family/FamilyCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import useFamiliesWithProgress, { FamilyWithProgress } from '@/hooks/familySelection/useFamiliesWithProgress';
import { getModuleLabel, getLevelLabel, getAvailableModules } from '@/utils/labelMapper';
import { getModuleColor } from '@/utils/moduleHelper';
import { moduleHasSubfamilies } from '@/config/moduleConfig';
import { createStyles } from './style';

interface RouteParams {
  moduleId?: string;
  levelId?: string;
  familyId?: string;
}

interface LegacyNavigation {
  goBack?: () => void;
}

interface LegacyRoute {
  params?: RouteParams;
}

interface FamilySelectionScreenProps {
  navigation?: LegacyNavigation;
  route?: LegacyRoute;
}

const FamilySelectionScreen: React.FC<FamilySelectionScreenProps> = ({
  navigation,
  route
}) => {
  const router = useRouter();
  const expoParams = useLocalSearchParams() as unknown as RouteParams;
  const { identity } = useTheme();
  const { db } = useUser();
  const { getLastActivity } = useProgress();

  const rawModuleId = route?.params?.moduleId || expoParams.moduleId || expoParams.familyId || '';
  const moduleId = Array.isArray(rawModuleId) ? rawModuleId[0] : rawModuleId.toString();
  const levelId = route?.params?.levelId || expoParams.levelId || '1';
  const numLevelId = Number.parseInt(levelId.toString(), 10);

  // useFamiliesWithProgress gère déjà son propre focusEffect pour le rafraîchissement
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
          const lLabel = await getLevelLabel(db, numLevelId, identity.id);
          setLevelLabel(lLabel);

          const mLabel = await getModuleLabel(db, moduleId, identity.id);
          setModuleLabel(mLabel);

          const availableModules = await getAvailableModules(db, identity.id, numLevelId);
          const slugs = Array.isArray(availableModules)
            ? availableModules.map((m: string | { slug: string }) => (typeof m === 'string' ? m : m.slug))
            : [];

          const mColor = await getModuleColor(moduleId, identity.id, db, slugs);
          if (mColor) setModuleColor(mColor);
        } catch (error) {
          log.error('[FamilySelection] Label load error:', error);
        }
      }
    };
    loadLabels();
  }, [db, moduleId, numLevelId, identity.id]);

  const recentActivity = useMemo(() => {
    if (!families || families.length === 0) return null;
    const lastActivity = getLastActivity(numLevelId, moduleId);
    if (!lastActivity) return null;

    const family = families.find((f) => f.id === Number(lastActivity.familyId));
    if (!family) return null;

    return { ...family, progress: lastActivity.progress || 0 };
  }, [families, numLevelId, moduleId, getLastActivity]);

  // Trier les familles : recentActivity en premier
  const sortedFamilies = useMemo(() => {
    if (!families) return [];
    if (!recentActivity) return families;

    const others = families.filter((f) => f.id !== recentActivity.id);

    return [
      { ...recentActivity, badge: 'EN COURS', isRecent: true },
      ...others
    ];
  }, [families, recentActivity]);

  if (!moduleId) return null;

 const handleFamilyPress = (familyId: string | number) => {
  const hasSubfamilies = moduleHasSubfamilies(moduleId);

  if (hasSubfamilies) {
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

  const isSingleCard = sortedFamilies.length === 1;

  const renderItem = ({ item, index }: { item: FamilyWithProgress & { badge?: string; isRecent?: boolean; locked?: boolean }; index: number }) => {
    const card = (
      <FamilyCard
        icon={item.icon}
        title={item.name || item.id.toString()}
        subtitle=""
        color={item.color || moduleColor}
        badge={item.badge || null}
        progress={item.progress || null}
        locked={item.locked || false}
        onPress={() => handleFamilyPress(item.id)}
        animationDelay={index * 50}
      />
    );

    // En mode grid, wrapper chaque card pour éviter l'étirement des cards orphelines (nombre impair)
    return <View style={isSingleCard ? styles.singleCardWrapper : styles.gridCardWrapper}>{card}</View>;
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
            key={isSingleCard ? 'single' : 'grid'}
            data={sortedFamilies}
            renderItem={renderItem}
            keyExtractor={(item) => `family-${item.id}`}
            numColumns={isSingleCard ? 1 : 2}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={[
              styles.listContent,
              isSingleCard && styles.singleCardContainer
            ]}
            columnWrapperStyle={!isSingleCard ? styles.columnWrapper : undefined}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default FamilySelectionScreen;