// ============================================
// FICHIER: src/screens/exercises/Vocabulary/VocabularyExerciseScreen.tsx
// ✅ VERSION MOTEUR : Données depuis DB, typage strict.
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Composants
import ExerciseLayout from '../../../components/layout/ExerciseLayout';
import WordCard from './WordCard';
import NavigationButtons from '../../../components/exercise-common/NavigationButtons';

// Helpers & Hooks
import { useTheme } from '../../../themes/ThemeContext';
import { useProgress } from '../../../contexts/ProgressContext';
import useSafeNavigation from '../../../hooks/useSafeNavigation';
import { useFirstIncompleteIndex } from '../../hooks/exercises/useFirstIncompleteIndex';
import { useExerciseActivity } from './hooks/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '../../hooks/exercises/useExerciseSaveOnUnmount';
import { useExerciseContent, ContentItem } from './useExerciseContent';
import { useLevelLabel } from '../../../utils/labelMapper';

const EXERCISE_TYPE = 'vocab';

// =================== TYPES ===================
type VocabularyStackParamList = {
  VocabularyExercise: {
    familyId: string;
    levelId?: string;
  };
};

type VocabularyExerciseRouteProp = RouteProp<VocabularyStackParamList, 'VocabularyExercise'>;
type VocabularyExerciseNavigationProp = StackNavigationProp<VocabularyStackParamList, 'VocabularyExercise'>;

interface Props {
  navigation: VocabularyExerciseNavigationProp;
  route: VocabularyExerciseRouteProp;
}

const VocabularyExerciseScreen = ({ navigation, route }: Props) => {
  // =================== PARAMS ===================
  const { familyId, levelId = '1' } = route.params || {};
  const numLevelId = Number.parseInt(levelId, 10);

  // =================== HOOKS & DATA ===================
  const { identity } = useTheme(); // ✅ Récupération de l'identité visuelle
  const { trackItemCompletion, getFamilyProgress, saveProgressNow } = useProgress();
  const safeGoBack = useSafeNavigation(
    useCallback(() => navigation.goBack(), [navigation])
  );

  // --- DATA DRIVEN (Phase 1 & 2) ---
  const { module, family, contentItems, isLoading, error } = useExerciseContent(familyId, numLevelId);
  const levelLabel = useLevelLabel(numLevelId);

  // =================== PROGRESSION LOGIC ===================
  const totalWords = contentItems.length;
  const getFirstIncompleteIndex = useFirstIncompleteIndex(
    numLevelId,
    EXERCISE_TYPE,
    familyId,
    totalWords
  );

  // =================== STATE ===================
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);

  useEffect(() => {
    if (totalWords > 0) {
      setCurrentWordIndex(getFirstIncompleteIndex());
    }
  }, [totalWords, getFirstIncompleteIndex]);

  const currentContentItem: ContentItem | null = contentItems?.[currentWordIndex] || null;
  const isLastWord = currentWordIndex === totalWords - 1;
  const isFirstWord = currentWordIndex === 0;
  const realProgress = getFamilyProgress(numLevelId, EXERCISE_TYPE, familyId);

  // =================== ⚡ HOOKS UTILITAIRES ===================
  useExerciseActivity({
    type: EXERCISE_TYPE,
    levelId: numLevelId,
    familyId,
    familyName: family?.name || 'Vocabulaire',
    icon: family?.icon || 'book',
    currentIndex: currentWordIndex,
    totalItems: totalWords,
    enabled: !isLoading && !!family && !!currentContentItem,
  });

  useExerciseSaveOnUnmount();

  // =================== VALIDATION ===================
  useEffect(() => {
    if (!isLoading && (error || !family || totalWords === 0)) {
      console.warn('Données invalides ou erreur de chargement, retour en arrière.');
      const timer = setTimeout(() => safeGoBack.navigate(), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, family, totalWords, safeGoBack]);

  if (isLoading || !family || !currentContentItem) {
    return (
      <ExerciseLayout gradientColors={identity.ui.gradientColors || [identity.branding.main, identity.branding.main]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={identity.branding.accent} />
        </View>
      </ExerciseLayout>
    );
  }

  // =================== HANDLERS ===================
  const handleNext = () => {
    trackItemCompletion(numLevelId, EXERCISE_TYPE, familyId, currentWordIndex, totalWords);
    !isLastWord && setCurrentWordIndex((prev: number) => prev + 1);
  };

  const handleFinish = async () => {
    trackItemCompletion(numLevelId, EXERCISE_TYPE, familyId, currentWordIndex, totalWords);
    await saveProgressNow();
    safeGoBack.navigate();
  };

  return (
    <ExerciseLayout
      gradientColors={identity.ui.gradientColors} // ✅ Fond dynamique selon l'identité
      headerProps={{
        variant: "exercise",
        onBack: safeGoBack.navigate,
        rightIcon: module?.icon || 'book',
        showLevelBadge: true,
        levelTitle: levelLabel.badge,
        levelColor: identity.branding.accent, // ✅ Couleur d'accent dynamique
        exerciseTitle: family.name,
        gradientColors: identity.ui.gradientColors,
      }}
      progressProps={{
        progressPercent: realProgress,
        progressText: `${realProgress}% • Mot ${currentWordIndex + 1}/${totalWords}`,
      }}
      footer={
        <NavigationButtons
          isFirst={isFirstWord}
          isLast={isLastWord}
          onPrevious={() => currentWordIndex > 0 && setCurrentWordIndex((prev: number) => prev - 1)}
          onNext={handleNext}
          onFinish={handleFinish}
        />
      }
    >
      <WordCard
        key={currentWordIndex}
        englishWord={currentContentItem.data.word}
        frenchWord={currentContentItem.data.translation}
        exampleSentence={currentContentItem.data.example}
        highlightWord={currentContentItem.data.word}
        image={currentContentItem.data.image}
        audio={currentContentItem.data.audio}
        // ✅ Plus de props de style ici, WordCard gère son propre design via useTheme
      />
    </ExerciseLayout>
  );
};

export default VocabularyExerciseScreen;