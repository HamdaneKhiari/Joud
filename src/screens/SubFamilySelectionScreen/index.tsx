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
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { createStyles } from './style';

const SubfamilySelectionScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { identity } = useTheme();

  const moduleId = params.moduleId as string;
  // ✅ FIX: Récupère l'ID depuis 'familyId' (query) OU 'subfamilyId' (route param détecté dans les logs)
  const familyId = Number(params.familyId || params.subfamilyId);
  const familyName = params.familyName as string;
  // ✅ FIX: Récupère le vrai levelId du Dashboard (1="Les Bases", 2="L'Essentiel"...)
  const dashboardLevelId = Number(params.levelId || '1');
  const { db } = useUser();
  const [displayTitle, setDisplayTitle] = useState(familyName);
  const [resolvedModuleId, setResolvedModuleId] = useState(moduleId);

  // ✅ Récupération du titre si manquant (ex: refresh ou navigation directe)
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

  // Utilisation du Hook dédié
  const { subfamilies, isLoading } = useSubfamilies(familyId);
  const styles = useMemo(() => createStyles(identity), [identity]);

  const safeGoBack = useSafeNavigation(() => {
    router.back();
  });

  // ✅ Détecter si card unique pour layout adaptatif
  const isSingleCard = subfamilies.length === 1;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const card = (
      <FamilyCard
        icon={item.icon}
        title={item.title}
        subtitle=""
        color={identity.palette.primary}
        progress={item.progress || null}
        onPress={() => {
          const targetExerciseId = resolvedModuleId || moduleId;
          // ✅ Sécurité : On ne navigue que si on a l'ID du module (évite le chargement infini)
          if (targetExerciseId) {
            router.push({
              pathname: '/exercise/[exerciseId]',
              params: {
                exerciseId: targetExerciseId,
                familyId: familyId.toString(),
                subfamilyId: item.subfamily_id.toString(),  // ✅ Nom clair : subfamilyId
                levelId: dashboardLevelId.toString()  // ✅ FIX: Passe le vrai levelId du Dashboard
              }
            });
          }
        }}
        animationDelay={index * 50}
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
            key={isSingleCard ? 'single' : 'grid'} // ✅ Force re-render selon layout
            data={subfamilies}
            renderItem={renderItem}
            keyExtractor={(item) => `subfam-${item.subfamily_id}`}
            numColumns={isSingleCard ? 1 : 2} // ✅ 1 colonne si card unique
            contentContainerStyle={[
              styles.listContent,
              isSingleCard && styles.singleCardContainer // ✅ Centre la card unique
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