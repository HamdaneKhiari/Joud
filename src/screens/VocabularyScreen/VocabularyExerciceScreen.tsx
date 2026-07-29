import { log } from '@/utils/logUtils';
import React, { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import ExerciseLayout from '../../components/layout/ExerciceLayout/ExerciseLayout';
import WordCard from '../../components/pedagogy/Vocabulary/WordCard/WordCard';
import NavigationButtons from '../../components/common/NavigationButtons';
import CompletionModal from '@/components/common/CompletionModal';
import ExerciseLoadingState from '@/components/common/ExerciseLoadingState';
import ExerciseEmptyState from '@/components/common/ExerciseEmptyState';
import { DynamicIcon } from '../../components/ui/DynamicIcon';
import { useTheme } from '../../themes/ThemeContext';
import { useProgress } from '../../contexts/ProgressContext';
import useExerciseBackNavigation from '../../hooks/exercises/useExerciseBackNavigation';
import useResumeIndex from '../../hooks/exercises/useResumeIndex';
import useExerciseCompletion from '../../hooks/exercises/useExerciseCompletion';
import { useExerciseActivity } from '../../hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '../../hooks/exercises/useExerciseSaveOnUnmount';
import { useExerciseContent } from '../../hooks/exercises/useExerciseContent';
import { useLevelLabel } from '../../utils/labelMapper';
import { useRecordWordSeen } from '../../hooks/exercises/useRecordWordSeen';
import { makeCompositeFamilyId } from '../../contexts/progressUtils';

interface VocabData {
  word: string;
  translation: string;
  example: string;
  exampleTranslation?: string;
  audio?: string;
}

interface VocabularyExerciseParams {
  familyId?: string;
  levelId?: string;
  subfamilyId?: string;
}

const EXERCISE_TYPE = 'vocab';

const VocabularyExerciseScreen: React.FC = () => {
  const { identity } = useTheme();
  const { trackItemCompletion, getFamilyProgress } = useProgress();
  const { recordWordSeen } = useRecordWordSeen();

  const params = useLocalSearchParams() as unknown as VocabularyExerciseParams;

  const familyIdRaw = params.familyId ?? '';
  const familyIdNum = Number(familyIdRaw);

  // Le levelId du Dashboard ("Les Bases", "L'Essentiel"...), distinct du subfamilyId ci-dessous
  const rawDashboardLevelId = Number(params.levelId || '1');
  const dashboardLevelId = Number.isNaN(rawDashboardLevelId) ? 1 : rawDashboardLevelId;

  // params.subfamilyId = ID de sous-famille (ex: 1 = Le Salé, 2 = Le Sucré)
  const rawSubfamilyId = Number(params.subfamilyId || '1');
  const subfamilyId = Number.isNaN(rawSubfamilyId) ? 1 : rawSubfamilyId;

  // Les sous-familles sont stockées avec un familyId composite : "familyId-subfamilyId" (ex: "1-1" = food_drinks + Le Salé)
  const compositeFamilyId = makeCompositeFamilyId(familyIdRaw, subfamilyId);

  const { module, family, contentItems, isLoading } = useExerciseContent<VocabData>(familyIdNum, subfamilyId);
  const levelLabel = useLevelLabel(subfamilyId);

  const totalWords = contentItems?.length || 0;
  const [currentWordIndex, setCurrentWordIndex] = useResumeIndex(dashboardLevelId, EXERCISE_TYPE, compositeFamilyId, totalWords);
  const { showCompletion, complete } = useExerciseCompletion();

  const safeGoBack = useExerciseBackNavigation();

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

  const recordCurrentWordSeen = useCallback(() => {
    trackItemCompletion(dashboardLevelId, EXERCISE_TYPE, compositeFamilyId, currentWordIndex, totalWords);
    if (contentItems?.[currentWordIndex]) {
      recordWordSeen({
        word:        contentItems[currentWordIndex].data.word,
        translation: contentItems[currentWordIndex].data.translation,
        familyId:    compositeFamilyId,
        contentId:   contentItems[currentWordIndex].id,
      });
    }
  }, [dashboardLevelId, compositeFamilyId, currentWordIndex, totalWords, contentItems, trackItemCompletion, recordWordSeen]);

  const handleNext = useCallback(() => {
    recordCurrentWordSeen();
    if (currentWordIndex < totalWords - 1) {
      setCurrentWordIndex(prev => prev + 1);
    }
  }, [recordCurrentWordSeen, currentWordIndex, totalWords, setCurrentWordIndex]);

  const handleFinish = useCallback(() => {
    const executeFinish = async () => {
      recordCurrentWordSeen();
      await complete();
    };
    executeFinish().catch(err => log.error("Finish error:", err));
  }, [recordCurrentWordSeen, complete]);

  const handleBack = useCallback(() => {
    safeGoBack.navigate();
  }, [safeGoBack]);

  if (isLoading) {
    return <ExerciseLoadingState onBack={handleBack} />;
  }

  const currentContentItem = contentItems?.[currentWordIndex];

  if (!family || totalWords === 0 || !currentContentItem) {
    return <ExerciseEmptyState onBack={handleBack} headerTitle={family?.name || "Vocabulaire"} />;
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