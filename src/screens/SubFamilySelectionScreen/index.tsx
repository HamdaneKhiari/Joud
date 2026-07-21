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
import useSubfamilies from '@/hooks/subFamilySelection/useSubfamilies';
import type { SubFamily } from '@/services/subfamilyService';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { createStyles } from './style';

const SubfamilySelectionScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { identity } = useTheme();

  const moduleId = params.moduleId as string;
  // L'ID peut venir de 'familyId' (query) ou 'subfamilyId' (route param)
  const familyId = Number(params.familyId || params.subfamilyId);
  const familyName = params.familyName as string;
  const dashboardLevelId = Number(params.levelId || '1');
  const { db } = useUser();
  const [displayTitle, setDisplayTitle] = useState(familyName);
  const [resolvedModuleId, setResolvedModuleId] = useState(moduleId);

  // Récupère le titre si manquant (ex: refresh ou navigation directe)
  useEffect(() => {
    if ((displayTitle && resolvedModuleId) || !db || !familyId || Number.isNaN(familyId)) return;
    
    const loadData = async () => {
      try {
        const res = await db.getFirstAsync<{ name: string; slug: string; module_slug: string }>(
          'SELECT name, slug, module_slug FROM families WHERE id = ?', 
          [familyId]
        );
        if (res && !displayTitle) setDisplayTitle(res.name || res.slug);
        if (res && !resolvedModuleId) setResolvedModuleId(res.module_slug);
      } catch (e) {
        log.error('Error loading family data', e);
      }
    };
    loadData();
  }, [db, familyId, displayTitle, resolvedModuleId]);

  const { subfamilies, isLoading } = useSubfamilies(familyId);
  const styles = useMemo(() => createStyles(identity), [identity]);

  const safeGoBack = useSafeNavigation(() => {
    router.back();
  });

  const isSingleCard = subfamilies.length === 1;

  const renderItem = ({ item, index }: { item: SubFamily; index: number }) => {
    const card = (
      <FamilyCard
        icon={item.icon}
        title={item.title}
        subtitle=""
        color={identity.palette.primary}
        progress={item.progress || null}
        onPress={() => {
          const targetExerciseId = resolvedModuleId || moduleId;
          // On ne navigue que si on a l'ID du module (évite le chargement infini)
          if (targetExerciseId) {
            router.push({
              pathname: '/exercise/[exerciseId]',
              params: {
                exerciseId: targetExerciseId,
                familyId: familyId.toString(),
                subfamilyId: item.subfamily_id.toString(),
                levelId: dashboardLevelId.toString()
              }
            });
          }
        }}
        animationDelay={index * 50}
      />
    );

    return <View style={isSingleCard ? styles.singleCardWrapper : styles.gridCardWrapper}>{card}</View>;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={identity.themeMode === 'dark' ? 'light-content' : 'dark-content'} />

        <ExerciseHeader
          variant="simple"
          onBack={() => safeGoBack.navigate()}
          exerciseTitle={displayTitle || "Sous-catégories"}
          rightIcon={<DynamicIcon name="layers" size={24} color={identity.header.accent} />}
        />

        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.gridSkeleton}>
              {[1, 2, 3, 4].map((i) => <SkeletonLoader key={i} variant="grid-item" />)}
            </View>
          </View>
        ) : (
          <FlatList
            key={isSingleCard ? 'single' : 'grid'}
            data={subfamilies}
            renderItem={renderItem}
            keyExtractor={(item) => `subfam-${item.subfamily_id}`}
            numColumns={isSingleCard ? 1 : 2}
            contentContainerStyle={[
              styles.listContent,
              isSingleCard && styles.singleCardContainer
            ]}
            columnWrapperStyle={isSingleCard ? undefined : styles.columnWrapper}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Bientôt disponible</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SubfamilySelectionScreen;