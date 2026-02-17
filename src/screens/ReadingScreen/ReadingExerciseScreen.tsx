import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';

// Composants
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import ReadingCard from '../../components/pedagogy/reading/ReadingCard';

// Hooks
import { useReadingState } from './hooks/useReadingState';
import { useReadingHandlers } from './hooks/useReadingHandlers';
import { useRecordError } from '@/hooks/exercises/useRecordError';
import { useProgress } from '@/contexts/ProgressContext';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import useSafeNavigation from '@/hooks/useSafeNavigation';

// Types
import type { ValidationState } from '@/components/common/ExerciseValidation/types';

interface ReadingExerciseParams {
  familyId:     number;
  subfamilyId?: number;
  title?:       string;
  levelId?:     number;
}

const MAX_ATTEMPTS = 2;

const ReadingExerciseScreen: React.FC = () => {
  const { identity } = useTheme();
  const { db } = useUser();
  const route = useRoute();
  const safeGoBack = useSafeNavigation();

  const params            = route.params as ReadingExerciseParams;
  const familyId          = params?.familyId;
  const subfamilyId       = params?.subfamilyId ?? 0;
  const title             = params?.title || 'Reading';
  const dashboardLevelId  = params?.levelId || 1;
  const compositeFamilyId = `${familyId}-${subfamilyId}`;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { state, setState, resetState } = useReadingState();
  const { recordError } = useRecordError();
  const { trackItemCompletion, getFamilyProgress, saveProgressNow } = useProgress();

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

  // Chargement du contenu
  useEffect(() => {
    const loadContent = async () => {
      if (!db || !familyId) return;
      try {
        setLoading(true);
        const result = await db.getAllAsync<{ data: string }>(
          `SELECT data FROM content WHERE family_id = ? AND subfamily_id = ?`,
          [familyId, subfamilyId]
        );

        if (result && result.length > 0) {
          const parsed = result.map(item => {
            const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
            return (data.passage && data.question_text) ? data : null;
          }).filter(Boolean);
          setQuestions(parsed);
        }
      } catch (error) {
        console.error('Reading load error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [db, familyId, subfamilyId]);

  const trackAndAdvance = useCallback((updater: React.SetStateAction<number>) => {
    trackItemCompletion(dashboardLevelId, 'reading', compositeFamilyId, currentIndex, questions.length);
    setCurrentIndex(updater);
  }, [trackItemCompletion, dashboardLevelId, compositeFamilyId, currentIndex, questions.length]);

  const handleFinish = useCallback(async () => {
    trackItemCompletion(dashboardLevelId, 'reading', compositeFamilyId, currentIndex, questions.length);
    await saveProgressNow();
    safeGoBack.navigate();
  }, [trackItemCompletion, dashboardLevelId, compositeFamilyId, currentIndex, questions.length, saveProgressNow, safeGoBack]);

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
    onFinish: handleFinish,
    setCurrentQuestionIndex: trackAndAdvance,
    state,
    setState,
    resetState,
    onError: handleRecordError,
    maxAttempts: MAX_ATTEMPTS,
  });

  // Calcul de l'état de validation (même pattern que Grammar)
  let validationStatus: ValidationState;
  if (!state.isValidated) {
    validationStatus = 'initial';
  } else if (state.isCorrect) {
    validationStatus = 'correct';
  } else if (state.attemptCount >= MAX_ATTEMPTS) {
    validationStatus = 'skip';
  } else {
    validationStatus = 'incorrect';
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={identity.palette.primary} />
        <Text style={{ marginTop: 10, color: identity.text.secondary }}>
          Chargement...
        </Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const isLastQuestion = currentIndex === questions.length - 1;
  const readingProgress = getFamilyProgress(dashboardLevelId, 'reading', compositeFamilyId);

  return (
    <ExerciseLayout
      headerProps={{
        variant: 'exercise',
        onBack: safeGoBack.navigate,
        rightIcon: <DynamicIcon name="book-open-variant" size={28} color={identity.header.accent} fallback="book-open-variant" />,
        showLevelBadge: true,
        levelTitle: `Niveau ${dashboardLevelId}`,
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
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ReadingExerciseScreen;
