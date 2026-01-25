import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Composants
import ExerciseLayout from '../../components/layout/ExerciceLayout/ExerciseLayout';
import WordCard from '../../components/pedagogy/Vocabulary/WordCard/WordCard';
import NavigationButtons from '../../components/common/NavigationButtons';
import { DynamicIcon } from '../../components/ui/DynamicIcon';

// Helpers & Hooks
import { useTheme } from '../../themes/ThemeContext';
import { useProgress } from '../../contexts/ProgressContext';
import useSafeNavigation from '../../hooks/useSafeNavigation';
import { useFirstIncompleteIndex } from '../../hooks/exercises/useFirstIncompleteIndex';
import { useExerciseActivity } from '../../hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '../../hooks/exercises/useExerciseSaveOnUnmount';
import { useExerciseContent, ContentItem } from '../../hooks/exercises/useExerciseContent';
import { useLevelLabel } from '../../utils/labelMapper';

const EXERCISE_TYPE = 'vocab';

// =================== TYPES ===================

/** Interface pour les données spécifiques au vocabulaire (ContentItem.data) */
interface VocabData {
  word: string;
  translation: string;
  example: string;
  audio?: string;
}

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
  // =================== PARAMS & THEME ===================
  const { familyId, levelId = '1' } = route.params || {};
  const numLevelId = Number.parseInt(levelId, 10);
  const { identity } = useTheme();

  // =================== PROGRESSION & NAVIGATION ===================
  const { trackItemCompletion, getFamilyProgress, saveProgressNow } = useProgress();
  const safeGoBack = useSafeNavigation(
    useCallback(() => navigation.goBack(), [navigation])
  );

  // ✅ Correction TS : Type générique <VocabData> et suppression de 'error' (S1854)
  const { module, family, contentItems, isLoading } = useExerciseContent<VocabData>(familyId, numLevelId);

  const levelLabel = useLevelLabel(numLevelId);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);

  const totalWords = contentItems.length;
  const getFirstIncompleteIndex = useFirstIncompleteIndex(
    numLevelId,
    EXERCISE_TYPE,
    familyId,
    totalWords
  );

  // Initialisation de l'index de départ
  useEffect(() => {
    if (totalWords > 0) {
      setCurrentWordIndex(getFirstIncompleteIndex());
    }
  }, [totalWords, getFirstIncompleteIndex]);

  // ✅ Correction TS : Type explicite ContentItem<VocabData>
  const currentContentItem: ContentItem<VocabData> | null = contentItems?.[currentWordIndex] || null;
  const isLastWord = currentWordIndex === totalWords - 1;
  const isFirstWord = currentWordIndex === 0;
  const realProgress = getFamilyProgress(numLevelId, EXERCISE_TYPE, familyId);

  // =================== ACTIVITÉ & AUTO-SAVE ===================
  
  // ✅ Correction TS : Ajout du moduleSlug requis
  useExerciseActivity({
    levelId: numLevelId,
    familyId,
    familyName: family?.name || 'Vocabulaire',
    moduleSlug: module?.slug || 'vocabulary',
    icon: family?.icon || 'book',
    currentIndex: currentWordIndex,
    totalItems: totalWords,
    enabled: !isLoading && !!family && !!currentContentItem,
  });

  useExerciseSaveOnUnmount();

  // =================== HANDLERS (S6544 Fixes) ===================

  const handleNext = useCallback(() => {
    // Cette opération est synchrone dans le ProgressContext
    trackItemCompletion(numLevelId, EXERCISE_TYPE, familyId, currentWordIndex, totalWords);
    if (!isLastWord) {
      setCurrentWordIndex((prev) => prev + 1);
    }
  }, [numLevelId, familyId, currentWordIndex, totalWords, isLastWord, trackItemCompletion]);

  const handleFinish = useCallback(() => {
    // ✅ Correction Sonar S6544 : Wrapper synchrone pour la logique asynchrone
    const performFinish = async () => {
      trackItemCompletion(numLevelId, EXERCISE_TYPE, familyId, currentWordIndex, totalWords);
      await saveProgressNow();
      safeGoBack.navigate();
    };

    performFinish().catch((err) => {
      console.error("[VocabularyScreen] Erreur lors de la sauvegarde finale:", err);
    });
  }, [numLevelId, familyId, currentWordIndex, totalWords, trackItemCompletion, saveProgressNow, safeGoBack]);

  // =================== RENDU ===================

  // ✅ Correction TS : headerProps obligatoire même pendant le chargement
  if (isLoading || !family || !currentContentItem) {
    const loaderBg = Array.isArray(identity.header.background) ? identity.header.background : [identity.palette.primary, identity.palette.primary];
    return (
      <ExerciseLayout 
        gradientColors={loaderBg}
        headerProps={{
          variant: "exercise",
          onBack: () => { safeGoBack.navigate(); },
          exerciseTitle: "Chargement...",
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={identity.palette.accent} />
        </View>
      </ExerciseLayout>
    );
  }

  return (
    <ExerciseLayout
      gradientColors={Array.isArray(identity.header.background) ? identity.header.background : [identity.palette.primary, identity.palette.primary]}
      headerProps={{
        variant: "exercise",
        onBack: () => { safeGoBack.navigate(); },
        rightIcon: <DynamicIcon name={module?.icon} size={28} color={identity.header.accent} fallback="book" />,
        showLevelBadge: true,
        levelTitle: levelLabel.badge,
        exerciseTitle: family.name,
      }}
      progressProps={{
        progressPercent: realProgress,
        progressText: `${realProgress}% • Mot ${currentWordIndex + 1}/${totalWords}`,
      }}
      footer={
        <NavigationButtons
          isFirst={isFirstWord}
          isLast={isLastWord}
          onPrevious={() => currentWordIndex > 0 && setCurrentWordIndex((prev) => prev - 1)}
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
        audio={currentContentItem.data.audio}
      />
    </ExerciseLayout>
  );
};

export default VocabularyExerciseScreen;