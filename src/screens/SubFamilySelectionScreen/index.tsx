import React, { useMemo } from 'react';
import { View, StatusBar, Text, FlatList } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import ExerciseHeader from '@/components/layout/ExerciseHeader';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import FamilyCard from '@/components/family/FamilyCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

import { useTheme } from '@/themes/ThemeContext';
import useSubfamilies from '@/hooks/subFamilySelection/useSubfamilies';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { createStyles } from './style';

const SubfamilySelectionScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { identity } = useTheme();
  
  const moduleId = params.moduleId as string;
  const familyId = Number(params.familyId);
  const familyName = params.familyName as string;

  // Utilisation du Hook dédié
  const { subfamilies, isLoading } = useSubfamilies(familyId);
  const styles = useMemo(() => createStyles(identity), [identity]);

  const safeGoBack = useSafeNavigation(() => {
    router.back();
  });

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <FamilyCard
      icon={item.icon}
      title={item.title}
      subtitle={item.description}
      color={identity.palette.primary}
      onPress={() => router.push({
        pathname: '/exercise/[exerciseId]',
        params: { exerciseId: moduleId, familyId, contentLevel: item.id }
      })}
      animationDelay={index * 50}
    />
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={identity.themeMode === 'dark' ? 'light-content' : 'dark-content'} />
        
        <ExerciseHeader
          variant="simple"
          onBack={() => safeGoBack.navigate()}
          exerciseTitle={familyName || "Sous-catégories"}
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
            data={subfamilies}
            renderItem={renderItem}
            keyExtractor={(item) => `subfam-${item.id}`}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
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