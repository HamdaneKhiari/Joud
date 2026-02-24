import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Composants
import ExerciseLayout from '../../components/layout/ExerciceLayout/ExerciseLayout';
import WordCard from '../../components/pedagogy/Vocabulary/WordCard/WordCard';
import NavigationButtons from '../../components/common/NavigationButtons';
import CompletionModal from '@/components/common/CompletionModal';
import { DynamicIcon } from '../../components/ui/DynamicIcon';

// Helpers & Hooks
import { useTheme } from '../../themes/ThemeContext';
import { useProgress } from '../../contexts/ProgressContext';
import useSafeNavigation from '../../hooks/useSafeNavigation';
import useFirstIncompleteIndex from '../../hooks/exercises/useFirstIncompleteIndex';
import { useExerciseActivity } from '../../hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '../../hooks/exercises/useExerciseSaveOnUnmount';
import { useExerciseContent } from '../../hooks/exercises/useExerciseContent';
import { useLevelLabel } from '../../utils/labelMapper';
import { useRecordWordSeen } from '../../hooks/exercises/useRecordWordSeen';

interface VocabData {
  word: string;
  translation: string;
  example: string;
  exampleTranslation?: string;
  audio?: string;
}

type VocabularyStackParamList = {
  VocabularyExercise: {
    familyId: string | number;
    levelId?: string | number;
    level?: string | number;
  };
};

type Props = {
  navigation: StackNavigationProp<VocabularyStackParamList, 'VocabularyExercise'>;
  route: RouteProp<VocabularyStackParamList, 'VocabularyExercise'>;
};

const VocabularyExerciseScreen = ({ navigation, route }: Props) => {
  const { identity } = useTheme();
  const { trackItemCompletion, getFamilyProgress, saveProgressNow } = useProgress();
  const { recordWordSeen } = useRecordWordSeen();

  // 1. 🛡️ Normalisation des entrées
  const params = route.params || {};

  // exerciseType dynamique : 'vocab' ou 'fastvocab' selon le module lancé
  const EXERCISE_TYPE = (params as any).exerciseType || 'vocab';

  // On récupère les valeurs de base
  const rawFamilyId = params.familyId || (params as any).subfamilyId || '';
  const familyIdRaw = String(rawFamilyId);
  const familyIdNum = Number(familyIdRaw);

  // ✅ Le VRAI levelId du Dashboard ("Les Bases", "L'Essentiel"...)
  const rawDashboardLevelId = Number(params.levelId || '1');
  const dashboardLevelId = Number.isNaN(rawDashboardLevelId) ? 1 : rawDashboardLevelId;

  // ✅ Protection anti-NaN : Si la conversion échoue, on force à 1
  // ⚠️ CLARIFICATION : params.subfamilyId contient l'ID de sous-famille (ex: 1 = Le Salé, 2 = Le Sucré)
  const rawSubfamilyId = Number((params as any).subfamilyId || params.level || '1');
  const subfamilyId = Number.isNaN(rawSubfamilyId) ? 1 : rawSubfamilyId;

  // 🎯 CORRECTION : Les sous-familles sont stockées avec un familyId composite : "familyId-subfamilyId"
  const compositeFamilyId = `${familyIdRaw}-${subfamilyId}`; // Ex: "1-1" = food_drinks + Le Salé

  // =================== DATA LOADING ===================

  const { module, family, contentItems, isLoading } = useExerciseContent<VocabData>(familyIdNum, subfamilyId);
  const levelLabel = useLevelLabel(subfamilyId);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const totalWords = contentItems?.length || 0;

  // ✅ FIX TS2345 & Sonar S4325 :
  // On utilise dashboardLevelId (le vrai level du Dashboard) et compositeFamilyId ("1-1")
  const getInitialIndex = useFirstIncompleteIndex(
    dashboardLevelId,
    EXERCISE_TYPE,
    compositeFamilyId,
    totalWords
  );

  useEffect(() => {
    if (totalWords > 0) {
      setCurrentWordIndex(getInitialIndex());
    }
  }, [totalWords, getInitialIndex]);

  // =================== NAVIGATION & ACTIVITY ===================

  const safeGoBack = useSafeNavigation(useCallback(() => navigation.goBack(), [navigation]));

  useExerciseActivity({
    moduleSlug: module?.slug || 'vocabulary',
    familyId: compositeFamilyId,
    levelId: dashboardLevelId,
    familyName: family?.name || 'Vocabulaire',
    icon: family?.icon || 'book',
    currentIndex: currentWordIndex,
    totalItems: totalWords,
    enabled: !isLoading && totalWords > 0
  });

  useExerciseSaveOnUnmount();

  // =================== HANDLERS ===================

  const handleNext = useCallback(() => {
    trackItemCompletion(dashboardLevelId, EXERCISE_TYPE, compositeFamilyId, currentWordIndex, totalWords);
    if (contentItems?.[currentWordIndex]) {
      recordWordSeen({
        word:        contentItems[currentWordIndex].data.word,
        translation: contentItems[currentWordIndex].data.translation,
        familyId:    compositeFamilyId,
        contentId:   contentItems[currentWordIndex].id,
      });
    }
    if (currentWordIndex < totalWords - 1) {
      setCurrentWordIndex(prev => prev + 1);
    }
  }, [dashboardLevelId, compositeFamilyId, currentWordIndex, totalWords, contentItems, trackItemCompletion, recordWordSeen]);

  const handleFinish = useCallback(() => {
    const executeFinish = async () => {
      trackItemCompletion(dashboardLevelId, EXERCISE_TYPE, compositeFamilyId, currentWordIndex, totalWords);
      if (contentItems?.[currentWordIndex]) {
        recordWordSeen({
          word:        contentItems[currentWordIndex].data.word,
          translation: contentItems[currentWordIndex].data.translation,
          familyId:    compositeFamilyId,
          contentId:   contentItems[currentWordIndex].id,
        });
      }
      await saveProgressNow();
      setShowCompletion(true);
    };
    executeFinish().catch(err => console.error("Finish error:", err));
  }, [dashboardLevelId, compositeFamilyId, currentWordIndex, totalWords, contentItems, trackItemCompletion, recordWordSeen, saveProgressNow]);

  const handleBack = useCallback(() => {
    safeGoBack.navigate();
  }, [safeGoBack]);

  // =================== RENDU ===================

  if (isLoading) {
    return (
      <ExerciseLayout headerProps={{ variant: "exercise", onBack: handleBack, exerciseTitle: "Chargement..." }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={identity.palette.accent} />
        </View>
      </ExerciseLayout>
    );
  }

  const currentContentItem = contentItems?.[currentWordIndex];

  if (!family || totalWords === 0 || !currentContentItem) {
    return (
      <ExerciseLayout headerProps={{ variant: "exercise", onBack: handleBack, exerciseTitle: family?.name || "Vocabulaire" }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ color: identity.text.primary, textAlign: 'center', fontSize: 16 }}>
            Aucun contenu disponible pour ce niveau.
          </Text>
        </View>
      </ExerciseLayout>
    );
  }

  const realProgress = getFamilyProgress(dashboardLevelId, EXERCISE_TYPE, compositeFamilyId);

  return (
    <>
      <CompletionModal
        visible={showCompletion}
        title="Well done!"
        subtitle="You've reviewed all the words in this series."
        onDone={() => safeGoBack.navigate()}
      />
      <ExerciseLayout
        headerProps={{
          variant: "exercise",
          onBack: handleBack,
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
          isFirst={currentWordIndex === 0}
          isLast={currentWordIndex === totalWords - 1}
          onPrevious={() => setCurrentWordIndex(prev => Math.max(0, prev - 1))}
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
        exampleTranslation={currentContentItem.data.exampleTranslation}
        highlightWord={currentContentItem.data.word}
        audio={currentContentItem.data.audio}
        moduleSlug={module?.slug}
      />
      </ExerciseLayout>
    </>
  );
};

export default VocabularyExerciseScreen;