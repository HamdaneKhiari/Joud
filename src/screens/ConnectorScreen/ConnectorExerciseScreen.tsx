import React, { useCallback, useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import { useExerciseValidationState } from '@/hooks/exercises/useExerciceValidationState';
import { useRecordError } from '@/hooks/exercises/useRecordError';
import { generateFeedbackMessage } from '@/utils/feedback';
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import CompletionModal from '@/components/common/CompletionModal';
import ExerciseLoadingState from '@/components/common/ExerciseLoadingState';
import ExerciseEmptyState from '@/components/common/ExerciseEmptyState';
import ConnectorCardRenderer from '../../components/pedagogy/Connector/ConnectorCardRenderer';
import type { LogicQuestion, FusionQuestion, RephrasingQuestion } from '../../components/pedagogy/Connector/types';
import { useConnectorState } from './hooks/useConnectorState';
import { useConnectorHandlers } from './hooks/useConnectorHandlers';
import { useConnectorContent } from './hooks/useConnectorContent';
import useExerciseBackNavigation from '@/hooks/exercises/useExerciseBackNavigation';
import useResumeIndex from '@/hooks/exercises/useResumeIndex';
import useExerciseCompletion from '@/hooks/exercises/useExerciseCompletion';
import { useLevelLabel } from '@/utils/labelMapper';

interface ConnectorExerciseParams {
  familyId: string;
  subfamilyId?: string;
  title?: string;
  moduleColor?: string;
  levelId?: string;
}

const MAX_ATTEMPTS = 2;

const ConnectorExerciseScreen: React.FC = () => {
  const { identity } = useTheme();
  const { db } = useUser();
  const { trackItemCompletion, getFamilyProgress, saveProgressNow } = useProgress();
  const safeGoBack = useExerciseBackNavigation();
  const { recordError } = useRecordError();

  const params = useLocalSearchParams() as unknown as ConnectorExerciseParams;
  const familyId = Number(params?.familyId);
  const subfamilyId = Number(params?.subfamilyId ?? 0);
  const safeFamilyId = String(familyId || '');
  const moduleColor = params?.moduleColor || identity.palette.primary;
  const title = params?.title || 'Exercise';
  const levelId = Number(params?.levelId || 1);
  const levelLabel = useLevelLabel(levelId);
  const realProgress = getFamilyProgress(levelId, 'connector', safeFamilyId);

  const { questions, loading } = useConnectorContent(db, familyId, subfamilyId);

  const [currentIndex, setCurrentIndex] = useResumeIndex(levelId, 'connector', safeFamilyId, questions.length);
  const { showCompletion, complete } = useExerciseCompletion();

  const currentItem = questions[currentIndex];
  const exerciseType = (currentItem?.type || 'logic') as 'logic' | 'fusion' | 'rephrasing';

  const connectorStates = useConnectorState(exerciseType);
  const currentState = connectorStates.logicState;
  const hasAnswer = exerciseType === 'logic'
    ? !!currentState.selectedOption
    : !!(currentState.userAnswer?.trim());

  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    currentState.isValidated,
    currentState.isCorrect,
    currentState.attemptCount,
    MAX_ATTEMPTS,
    hasAnswer,
  );

  const feedbackData = useMemo(() => {
    const feedback = generateFeedbackMessage(
      currentState.isValidated,
      currentState.isCorrect,
      canSkip,
      currentItem?.data?.correctAnswer,
      currentState.attemptCount,
      MAX_ATTEMPTS,
    );
    return feedback ? { title: feedback.title, message: feedback.message } : undefined;
  }, [currentState.isValidated, currentState.isCorrect, canSkip, currentItem?.data?.correctAnswer, currentState.attemptCount]);

  useExerciseActivity({
    moduleSlug: 'connector',
    familyId: safeFamilyId,
    levelId,
    familyName: title,
    icon: 'puzzle',
    currentIndex,
    totalItems: questions.length,
    enabled: !loading && questions.length > 0,
  });

  useExerciseSaveOnUnmount();

  const handleBackPress = useCallback(async () => {
    // Ne track que si l'utilisateur a réellement avancé (sinon ça marque à tort 1 item comme complété)
    if (currentIndex > 0) {
      trackItemCompletion(levelId, 'connector', safeFamilyId, currentIndex - 1, questions.length);
      await saveProgressNow();
    }
    safeGoBack.navigate();
  }, [currentIndex, levelId, safeFamilyId, questions.length, trackItemCompletion, saveProgressNow, safeGoBack]);

  const handleNavigateBack = useCallback(async () => {
    trackItemCompletion(levelId, 'connector', safeFamilyId, questions.length - 1, questions.length);
    await complete();
  }, [trackItemCompletion, levelId, safeFamilyId, questions.length, complete]);

  const handlers = useConnectorHandlers({
    question: currentItem?.data as LogicQuestion | FusionQuestion | RephrasingQuestion | undefined,
    isLastQuestion: currentIndex === questions.length - 1,
    onNavigateBack: () => { handleNavigateBack(); },
    setCurrentQuestionIndex: setCurrentIndex,
    states: connectorStates,
    onValidationSuccess: () => {},
    maxAttempts: MAX_ATTEMPTS,
    recordError: (userAnswer: string) => {
      if (!currentItem?.data) return;
      recordError({
        familyId,
        moduleSlug: 'connector',
        question: currentItem.data.sentence || currentItem.data.phrase1 || currentItem.data.baseSentence || '',
        userAnswer,
        correctAnswer: currentItem.data.correctAnswer || '',
        level: levelId,
      });
    },
  });

  const handlerMap = { logic: handlers.logic, fusion: handlers.fusion, rephrasing: handlers.rephrasing };
  const currentHandlers = handlerMap[exerciseType as keyof typeof handlerMap] ?? handlers.rephrasing;

  if (loading) {
    return (
      <ExerciseLoadingState
        onBack={() => { safeGoBack.navigate(); }}
        headerTitle={title}
        message="Preparing your session..."
      />
    );
  }

  if (!currentItem) {
    return <ExerciseEmptyState onBack={() => { safeGoBack.navigate(); }} headerTitle={title} />;
  }

  return (
    <>
      <CompletionModal
        visible={showCompletion}
        title="Series complete!"
        subtitle="You've finished all exercises in this series."
        onDone={() => safeGoBack.navigate()}
      />
      <ExerciseLayout
        headerProps={{
          variant: 'exercise',
          onBack: () => { void handleBackPress(); },
          rightIcon: <DynamicIcon name="puzzle" size={28} color={identity.header.accent} />,
          showLevelBadge: true,
          levelTitle: levelLabel.badge,
          exerciseTitle: title,
        }}
        progressProps={{
          progressPercent: realProgress,
          progressText: `${realProgress}% • Question ${currentIndex + 1}/${questions.length}`,
        }}
        footer={
          <ExerciseValidation
            state={validationState}
            attemptCount={currentState.attemptCount}
            maxAttempts={MAX_ATTEMPTS}
            correctAnswer={currentItem?.data?.correctAnswer}
            onValidate={currentHandlers.onValidate}
            onNext={currentHandlers.onNext}
            onRetry={currentHandlers.onRetry}
            onSkip={currentHandlers.onNext}
            disabled={buttonDisabled}
            isLastQuestion={currentIndex === questions.length - 1}
            feedbackMessage={feedbackData}
          />
        }
      >
        <ConnectorCardRenderer
          exerciseType={exerciseType}
          currentQuestion={currentItem.data as LogicQuestion | FusionQuestion | RephrasingQuestion}
          currentQuestionIndex={currentIndex}
          isLastQuestion={currentIndex === questions.length - 1}
          exerciseFamily={{ color: moduleColor }}
          states={connectorStates}
          handlers={handlers}
          hideValidation
        />
      </ExerciseLayout>
    </>
  );
};

export default ConnectorExerciseScreen;
