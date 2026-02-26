import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import { useExerciseValidationState } from '@/hooks/exercises/useExerciceValidationState';
import { useRecordError } from '@/hooks/exercises/useRecordError';
import { generateFeedbackMessage } from '@/utils/feedback';
import { tokens } from '@/themes/tokens';
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import CompletionModal from '@/components/common/CompletionModal';
import ConnectorCardRenderer from '../../components/pedagogy/Connector/ConnectorCardRenderer';
import { useConnectorState } from './hooks/useConnectorState';
import { useConnectorHandlers } from './hooks/useConnectorHandlers';
import { useConnectorContent } from './hooks/useConnectorContent';
import { useLevelLabel } from '@/utils/labelMapper';

interface ConnectorExerciseParams {
  familyId: number;
  subfamilyId?: number;
  title?: string;
  moduleColor?: string;
  levelId?: number;
}

const MAX_ATTEMPTS = 2;

const ConnectorExerciseScreen: React.FC = () => {
  const { identity } = useTheme();
  const { db } = useUser();
  const { trackItemCompletion, saveProgressNow, getFamilyProgress } = useProgress();
  const navigation = useNavigation();
  const route = useRoute();
  const { recordError } = useRecordError();

  const params = route.params as ConnectorExerciseParams;
  const familyId = params?.familyId;
  const subfamilyId = params?.subfamilyId ?? 0;
  const safeFamilyId = String(familyId || '');
  const moduleColor = params?.moduleColor || identity.palette.primary;
  const title = params?.title || 'Exercise';
  const levelId = params?.levelId || 1;
  const levelLabel = useLevelLabel(levelId);
  const realProgress = getFamilyProgress(levelId, 'connector', safeFamilyId);

  // =================== CHARGEMENT ===================
  const { questions, loading } = useConnectorContent(db, familyId, subfamilyId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const currentItem = questions[currentIndex];
  const exerciseType = currentItem?.type || 'logic';

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
    levelId: Number(levelId),
    familyName: title,
    icon: 'puzzle',
    currentIndex,
    totalItems: questions.length,
    enabled: !loading && questions.length > 0,
  });

  useExerciseSaveOnUnmount();

  const handleBackPress = useCallback(async () => {
    trackItemCompletion(Number(levelId), 'connector', safeFamilyId, Math.max(currentIndex - 1, 0), questions.length);
    await saveProgressNow();
    navigation.goBack();
  }, [currentIndex, levelId, safeFamilyId, questions.length, trackItemCompletion, saveProgressNow, navigation]);

  const handleNavigateBack = useCallback(async () => {
    trackItemCompletion(Number(levelId), 'connector', safeFamilyId, questions.length - 1, questions.length);
    await saveProgressNow();
    setShowCompletion(true);
  }, [trackItemCompletion, levelId, safeFamilyId, questions.length, saveProgressNow]);

  const handlers = useConnectorHandlers({
    question: currentItem?.data,
    isLastQuestion: currentIndex === questions.length - 1,
    onNavigateBack: () => { handleNavigateBack(); },
    setCurrentQuestionIndex: setCurrentIndex,
    states: connectorStates,
    onValidationSuccess: () => {},
    recordError: (userAnswer: string) => {
      if (!currentItem?.data) return;
      recordError({
        familyId,
        moduleSlug: 'connector',
        question: currentItem.data.sentence || currentItem.data.phrase1 || currentItem.data.baseSentence || '',
        userAnswer,
        correctAnswer: currentItem.data.correctAnswer || '',
        level: Number(levelId),
      });
    },
  });

  const handlerMap = { logic: handlers.logic, fusion: handlers.fusion, rephrasing: handlers.rephrasing };
  const currentHandlers = handlerMap[exerciseType as keyof typeof handlerMap] ?? handlers.rephrasing;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: identity.palette.background }]}>
        <ActivityIndicator size="large" color={moduleColor} />
        <Text style={[styles.loadingText, { color: identity.text.secondary }]}>Preparing your session...</Text>
      </View>
    );
  }

  if (!currentItem) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: identity.palette.background }]}>
        <Text style={[styles.errorText, { color: identity.text.primary }]}>Question not found</Text>
      </View>
    );
  }

  return (
    <>
      <CompletionModal
        visible={showCompletion}
        title="Series complete!"
        subtitle="You've finished all exercises in this series."
        onDone={() => navigation.goBack()}
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
          currentQuestion={currentItem.data}
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

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: tokens.spacing.md },
  loadingText: { fontSize: tokens.fontSize.md, fontWeight: tokens.fontWeight.medium },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: tokens.fontSize.lg, fontWeight: tokens.fontWeight.bold },
});

export default ConnectorExerciseScreen;
