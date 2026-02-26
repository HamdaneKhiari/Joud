import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';

// Composants
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import CompletionModal from '@/components/common/CompletionModal';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import ReadingCard from '../../components/pedagogy/reading/ReadingCard';

// Hooks
import { useReadingState } from './hooks/useReadingState';
import { useReadingHandlers } from './hooks/useReadingHandlers';
import { useReadingContent } from './hooks/useReadingContent';
import { useRecordError } from '@/hooks/exercises/useRecordError';
import { useProgress } from '@/contexts/ProgressContext';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { useLevelLabel } from '@/utils/labelMapper';

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
  const levelLabel        = useLevelLabel(dashboardLevelId);
  const compositeFamilyId = `${familyId}-${subfamilyId}`;

  // =================== CHARGEMENT ===================
  const { questions, loading } = useReadingContent(db, familyId, subfamilyId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

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

  const trackAndAdvance = useCallback((updater: React.SetStateAction<number>) => {
    trackItemCompletion(dashboardLevelId, 'reading', compositeFamilyId, currentIndex, questions.length);
    setCurrentIndex(updater);
  }, [trackItemCompletion, dashboardLevelId, compositeFamilyId, currentIndex, questions.length]);

  const handleFinish = useCallback(async () => {
    trackItemCompletion(dashboardLevelId, 'reading', compositeFamilyId, currentIndex, questions.length);
    await saveProgressNow();
    setShowCompletion(true);
  }, [trackItemCompletion, dashboardLevelId, compositeFamilyId, currentIndex, questions.length, saveProgressNow]);

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

  // Calcul de l'état de validation
  let validationStatus: ValidationState;
  if (!state.isValidated) validationStatus = 'initial';
  else if (state.isCorrect) validationStatus = 'correct';
  else if (state.attemptCount >= MAX_ATTEMPTS) validationStatus = 'skip';
  else validationStatus = 'incorrect';

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={identity.palette.primary} />
        <Text style={[styles.loadingText, { color: identity.text.secondary }]}>Chargement...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return (
      <View style={[styles.centered, styles.emptyPadding]}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={[styles.emptyTitle, { color: identity.text.primary }]}>Aucune question disponible</Text>
        <Text style={[styles.emptyText, { color: identity.text.secondary }]}>
          Ce texte ne contient pas encore de questions de compréhension.
        </Text>
        <TouchableOpacity
          onPress={safeGoBack.navigate}
          style={[styles.backButton, { backgroundColor: identity.palette.primary }]}
        >
          <Text style={[styles.backButtonText, { color: identity.text.onPrimary }]}>Retour</Text>
        </TouchableOpacity>
      </View>
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

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10 },
  emptyPadding: { padding: 32 },
  emptyEmoji: { fontSize: 32, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  backButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backButtonText: { fontWeight: '700' },
});

export default ReadingExerciseScreen;
