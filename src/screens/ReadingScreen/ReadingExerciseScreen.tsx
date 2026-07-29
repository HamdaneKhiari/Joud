import React, { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import CompletionModal from '@/components/common/CompletionModal';
import ExerciseLoadingState from '@/components/common/ExerciseLoadingState';
import ExerciseEmptyState from '@/components/common/ExerciseEmptyState';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import ReadingCard from '../../components/pedagogy/reading/ReadingCard';
import { useReadingState } from './hooks/useReadingState';
import { useReadingHandlers } from './hooks/useReadingHandlers';
import { useReadingContent } from './hooks/useReadingContent';
import { useRecordError } from '@/hooks/exercises/useRecordError';
import { useProgress } from '@/contexts/ProgressContext';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import useExerciseBackNavigation from '@/hooks/exercises/useExerciseBackNavigation';
import useResumeIndex from '@/hooks/exercises/useResumeIndex';
import useExerciseCompletion from '@/hooks/exercises/useExerciseCompletion';
import { useLevelLabel } from '@/utils/labelMapper';
import { makeCompositeFamilyId } from '@/contexts/progressUtils';
import type { ValidationState } from '@/components/common/ExerciseValidation/types';

interface ReadingExerciseParams {
  familyId:     string;
  subfamilyId?: string;
  title?:       string;
  levelId?:     string;
}

const MAX_ATTEMPTS = 2;

const ReadingExerciseScreen: React.FC = () => {
  const { identity } = useTheme();
  const { db } = useUser();
  const safeGoBack = useExerciseBackNavigation();

  const params            = useLocalSearchParams() as unknown as ReadingExerciseParams;
  const familyId          = Number(params?.familyId);
  const subfamilyId       = Number(params?.subfamilyId ?? 0);
  const title             = params?.title || 'Reading';
  const dashboardLevelId  = Number(params?.levelId || 1);
  const levelLabel        = useLevelLabel(dashboardLevelId);
  const compositeFamilyId = makeCompositeFamilyId(familyId, subfamilyId);

  const { questions, loading } = useReadingContent(db, familyId, subfamilyId);

  const [currentIndex, setCurrentIndex] = useResumeIndex(dashboardLevelId, 'reading', compositeFamilyId, questions.length);
  const { showCompletion, complete } = useExerciseCompletion();

  const { state, setState, resetState } = useReadingState();
  const { recordError } = useRecordError();
  const { trackItemCompletion, getFamilyProgress } = useProgress();

  useExerciseActivity({
    moduleSlug: 'reading',
    familyId:   compositeFamilyId,
    levelId:    dashboardLevelId,
    familyName: title,
    icon:       'book-open-variant',
    currentIndex,
    totalItems: questions.length,
    enabled:    !loading && questions.length > 0,
  });

  useExerciseSaveOnUnmount();

  const trackAndAdvance = useCallback((updater: React.SetStateAction<number>) => {
    trackItemCompletion(dashboardLevelId, 'reading', compositeFamilyId, currentIndex, questions.length);
    setCurrentIndex(updater);
  }, [trackItemCompletion, dashboardLevelId, compositeFamilyId, currentIndex, questions.length, setCurrentIndex]);

  const handleFinish = useCallback(async () => {
    trackItemCompletion(dashboardLevelId, 'reading', compositeFamilyId, currentIndex, questions.length);
    await complete();
  }, [trackItemCompletion, dashboardLevelId, compositeFamilyId, currentIndex, questions.length, complete]);

  const handleRecordError = useCallback(({ question: q, userAnswer, correctAnswer }: { question: string; userAnswer: string; correctAnswer: string }) => {
    recordError({
      familyId,
      moduleSlug: 'reading',
      question: q,
      userAnswer,
      correctAnswer,
      level: dashboardLevelId,
    });
  }, [recordError, familyId, dashboardLevelId]);

  const handlers = useReadingHandlers({
    question: questions[currentIndex],
    isLastQuestion: currentIndex === questions.length - 1,
    onFinish: () => { void handleFinish(); },
    setCurrentQuestionIndex: trackAndAdvance,
    state,
    setState,
    resetState,
    onError: handleRecordError,
    maxAttempts: MAX_ATTEMPTS,
  });

  let validationStatus: ValidationState;
  if (!state.isValidated) validationStatus = 'initial';
  else if (state.isCorrect) validationStatus = 'correct';
  else if (state.attemptCount >= MAX_ATTEMPTS) validationStatus = 'skip';
  else validationStatus = 'incorrect';

  if (loading) {
    return <ExerciseLoadingState onBack={safeGoBack.navigate} headerTitle={title} />;
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return (
      <ExerciseEmptyState
        onBack={safeGoBack.navigate}
        headerTitle={title}
        emoji="📭"
        heading="Aucune question disponible"
        message="Ce texte ne contient pas encore de questions de compréhension."
      />
    );
  }

  const isLastQuestion = currentIndex === questions.length - 1;
  const readingProgress = getFamilyProgress(dashboardLevelId, 'reading', compositeFamilyId);

  return (
    <>
      <CompletionModal
        visible={showCompletion}
        title="Reading complete!"
        subtitle="Great comprehension! You've finished all the questions."
        onDone={() => safeGoBack.navigate()}
      />
      <ExerciseLayout
        headerProps={{
          variant: 'exercise',
          onBack: () => { safeGoBack.navigate(); },
          rightIcon: <DynamicIcon name="book-open-variant" size={28} color={identity.header.accent} fallback="book-open-variant" />,
          showLevelBadge: true,
          levelTitle: levelLabel.badge,
          exerciseTitle: title,
        }}
        progressProps={{
          progressPercent: readingProgress,
          progressText: `${readingProgress}% • Question ${currentIndex + 1}/${questions.length}`,
        }}
        footer={
          <ExerciseValidation
            state={validationStatus}
            attemptCount={state.attemptCount}
            maxAttempts={MAX_ATTEMPTS}
            correctAnswer={currentQuestion.correct_answer}
            onValidate={handlers.onValidate}
            onNext={handlers.onNext}
            onRetry={handlers.onRetry}
            onSkip={handlers.onNext}
            disabled={!state.selectedOption || safeGoBack.disabled}
            isLastQuestion={isLastQuestion}
          />
        }
      >
        <ReadingCard
          question={currentQuestion}
          selectedOption={state.selectedOption}
          isValidated={state.isValidated}
          isCorrect={state.isCorrect}
          onAnswer={handlers.onAnswer}
          color={identity.palette.primary}
        />
      </ExerciseLayout>
    </>
  );
};

export default ReadingExerciseScreen;
