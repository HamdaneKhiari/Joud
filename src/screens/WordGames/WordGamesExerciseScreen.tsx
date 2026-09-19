import React, {useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import GameCardRenderer from '@/components/pedagogy/wordgames/GameCardRendered';
import CompletionModal from '@/components/common/CompletionModal';
import ExerciseLoadingState from '@/components/common/ExerciseLoadingState';
import ExerciseEmptyState from '@/components/common/ExerciseEmptyState';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { useTheme } from '@/themes/ThemeContext';
import { useProgress } from '@/contexts/ProgressContext';
import useExerciseBackNavigation from '@/hooks/exercises/useExerciseBackNavigation';
import useResumeIndex from '@/hooks/exercises/useResumeIndex';
import useExerciseCompletion from '@/hooks/exercises/useExerciseCompletion';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import { useExerciseContent } from '@/hooks/exercises/useExerciseContent';
import { useLevelLabel } from '@/utils/labelMapper';
import type { GameQuestion } from './schema';
import { useGameState } from './hooks/useGameState';
import { useGameHandlers } from './hooks/useGameHandlers';

const EXERCISE_TYPE = 'word_games';

interface WordGamesExerciseParams {
  familyId: string;
  levelId?: string;
}

const WordGamesExerciseScreen: React.FC = () => {
  const { familyId, levelId = '1' } = useLocalSearchParams() as unknown as WordGamesExerciseParams;
  const numLevelId = Number.parseInt(levelId, 10);
  const { identity } = useTheme();

  const { trackItemCompletion, getFamilyProgress } = useProgress();
  const safeGoBack = useExerciseBackNavigation();
  const { showCompletion, complete } = useExerciseCompletion();

  // word_games n'a pas de sous-familles → subfamilyId = 0
  const familyIdNum = Number(familyId);
  const { module, family, contentItems, isLoading } = useExerciseContent<GameQuestion>(
    familyIdNum,
    0
  );

  const levelLabel = useLevelLabel(numLevelId);

  const totalQuestions = contentItems.length;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useResumeIndex(
    numLevelId,
    EXERCISE_TYPE,
    familyId,
    totalQuestions
  );

  const currentQuestion = contentItems?.[currentQuestionIndex]?.data || null;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const realProgress = getFamilyProgress(numLevelId, EXERCISE_TYPE, familyId);

  const gameType = currentQuestion?.type || 'definition';

  const gameStates = useGameState(gameType);


  const handleComplete = useCallback(() => {
    trackItemCompletion(numLevelId, EXERCISE_TYPE, familyId, currentQuestionIndex, totalQuestions);
    complete();
  }, [trackItemCompletion, numLevelId, familyId, currentQuestionIndex, totalQuestions, complete]);

  const handlers = useGameHandlers({
    question: currentQuestion as GameQuestion, // NOSONAR — generic inference limitation
    isLastQuestion,
    safeGoBack,
    setCurrentQuestionIndex,
    states: gameStates,
    progress: {
      trackItemCompletion,
      numLevelId,
      familyId,
      totalQuestions,
      currentQuestionIndex,
    },
    onComplete: handleComplete,
  });

  useExerciseActivity({
    levelId: numLevelId,
    familyId,
    familyName: family?.name || 'Word Games',
    moduleSlug: module?.slug || EXERCISE_TYPE,
    icon: family?.icon || 'gamepad-variant',
    currentIndex: currentQuestionIndex,
    totalItems: totalQuestions,
    enabled: !isLoading && !!family && !!currentQuestion,
  });

  useExerciseSaveOnUnmount();


  if (isLoading) {
    return <ExerciseLoadingState onBack={() => { safeGoBack.navigate(); }} />;
  }

  if (!family || !currentQuestion) {
    return (
      <ExerciseEmptyState onBack={() => { safeGoBack.navigate(); }} headerTitle={family?.name || 'Word Games'} />
    );
  }

  return (
    <>
      <CompletionModal
        visible={showCompletion}
        title="Series complete!"
        subtitle="Bien joué, tu as terminé tous les jeux de cette série."
        onDone={() => safeGoBack.navigate()}
      />
      <ExerciseLayout
        headerProps={{
          variant: 'exercise',
          onBack: () => {
            safeGoBack.navigate();
          },
          rightIcon: (
            <DynamicIcon
              name={module?.icon || 'gamepad-variant'}
              size={28}
              color={identity.header.accent}
              fallback="gamepad-variant"
            />
          ),
          showLevelBadge: true,
          levelTitle: levelLabel.badge,
          exerciseTitle: family.name,
        }}
        progressProps={{
          progressPercent: realProgress,
          progressText: `${realProgress}% • Question ${currentQuestionIndex + 1}/${totalQuestions}`,
        }}
      >
        <GameCardRenderer
          gameType={gameType}
          currentQuestion={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          isLastQuestion={isLastQuestion}
          gameFamily={family}
          states={gameStates}
          handlers={handlers}
        />
      </ExerciseLayout>
    </>
  );
};

export default WordGamesExerciseScreen;
