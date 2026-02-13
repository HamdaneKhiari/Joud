import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReadingCard from '../../components/pedagogy/reading/ReadingCard';
import { useReadingState } from './hooks/useReadingState';
import { useReadingHandlers } from './hooks/useReadingHandlers';
import { useRecordError } from '@/hooks/exercises/useRecordError';
import { useProgress } from '@/contexts/ProgressContext';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import ExerciseProgressBar from '@/components/common/ExerciseProgressBar';

interface ReadingExerciseParams {
  familyId:     number;
  subfamilyId?: number;
  title?:       string;
  moduleColor?: string;
  levelId?:     number;
}

const MAX_ATTEMPTS = 2;

const ReadingExerciseScreen: React.FC = () => {
  const { identity } = useTheme();
  const { db } = useUser();
  const navigation = useNavigation();
  const route = useRoute();

  const params            = route.params as ReadingExerciseParams;
  const familyId          = params?.familyId;
  const subfamilyId       = params?.subfamilyId ?? 0;
  const moduleColor       = params?.moduleColor || identity.palette.primary;
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
            // On s'assure que les clés correspondent à notre ReadingCard
            return (data.passage && data.question_text) ? data : null;
          }).filter(Boolean);
          
          setQuestions(parsed);
        } else {
          navigation.goBack();
        }
      } catch (error) {
        console.error('Reading load error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [db, familyId, subfamilyId, navigation]);

  const trackAndAdvance = useCallback((updater: React.SetStateAction<number>) => {
    trackItemCompletion(dashboardLevelId, 'reading', compositeFamilyId, currentIndex, questions.length);
    setCurrentIndex(updater);
  }, [trackItemCompletion, dashboardLevelId, compositeFamilyId, currentIndex, questions.length]);

  const handleFinish = useCallback(async () => {
    trackItemCompletion(dashboardLevelId, 'reading', compositeFamilyId, currentIndex, questions.length);
    await saveProgressNow();
    Alert.alert(
      "Terminé !",
      "Vous avez complété l'analyse de texte.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  }, [trackItemCompletion, dashboardLevelId, compositeFamilyId, currentIndex, questions.length, saveProgressNow, navigation]);

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
    onFinish: handleFinish, // ✅ Point crucial pour le White Label
    setCurrentQuestionIndex: trackAndAdvance,
    state,
    setState,
    resetState,
    onError: handleRecordError,
    maxAttempts: MAX_ATTEMPTS,
  });

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: identity.palette.surface }]}>
        <ActivityIndicator size="large" color={moduleColor} />
        <Text style={[styles.loadingText, { color: identity.text.secondary }]}>
          Chargement de l'exercice...
        </Text>
      </View>
    );
  }

  const currentQuestion  = questions[currentIndex];
  if (!currentQuestion) return null;

  const readingProgress = getFamilyProgress(dashboardLevelId, 'reading', compositeFamilyId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: identity.palette.surface }]}>
      {/* HEADER SÉMANTIQUE */}
      <View style={[styles.header, { borderBottomColor: withOpacity(identity.text.tertiary, 0.1) }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <MaterialCommunityIcons name="close" size={24} color={identity.text.primary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: identity.text.primary }]}>
          {title} 
          <Text style={[styles.counterText, { color: identity.text.secondary }]}>
            {` (${currentIndex + 1}/${questions.length})`}
          </Text>
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ExerciseProgressBar
        progressPercent={readingProgress}
        progressText={`${readingProgress}% • Question ${currentIndex + 1}/${questions.length}`}
      />

      <ReadingCard
        question={currentQuestion}
        selectedOption={state.selectedOption}
        isValidated={state.isValidated}
        isCorrect={state.isCorrect}
        attemptCount={state.attemptCount}
        maxAttempts={MAX_ATTEMPTS}
        onAnswer={handlers.onAnswer}
        onValidate={handlers.onValidate}
        onNext={handlers.onNext}
        onRetry={handlers.onRetry}
        isLastQuestion={currentIndex === questions.length - 1}
        color={moduleColor}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: tokens.spacing.sm },
  loadingText: { 
    fontSize: tokens.fontSize.sm, 
    fontWeight: tokens.fontWeight.medium,
    marginTop: tokens.spacing.md 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.layout.screenPadding,
    height: 60,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: tokens.fontSize.md, fontWeight: tokens.fontWeight.bold },
  counterText: { fontWeight: '400' },
});

export default ReadingExerciseScreen;