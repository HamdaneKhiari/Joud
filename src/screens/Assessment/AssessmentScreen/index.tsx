/**
 * ============================================
 * ASSESSMENT SCREEN (TypeScript + White Label + DB-Driven)
 * Screen d'évaluation avec génération dynamique depuis la base de données
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Layout & UI
import ExerciseLayout from '@/components/layout/ExerciseLayout';
import ExerciseValidation from '@/components/exercise-common/ExerciseValidation';

// Composants questions
import QuestionDefinition from '../components/QuestionDefinition';
import QuestionBlanks from '../components/QuestionBlanks';
import QuestionSentence from '../components/QuestionSentence';

// Hooks & Logique
import { useAssessmentGenerator } from '../hooks/useAssessmentGenerator';
import { useTheme } from '@/themes/ThemeContext';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import type { AssessmentQuestion } from '../schema';
import {
  isAssessmentDefinitionQuestion,
  isAssessmentBlanksQuestion,
  isAssessmentSentenceQuestion,
} from '../schema';

// ============================================
// TYPES
// ============================================

type RootStackParamList = {
  Assessment: { level: number };
  AssessmentResults: {
    level: number;
    userAnswers: Record<string, UserAnswerRecord>;
    totalQuestions: number;
    score: number;
    allQuestions: AssessmentQuestion[];
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Assessment'>;

interface UserAnswerRecord {
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  theme: string;
}

interface ExerciseState {
  userAnswer: string | null;
  isValidated: boolean;
  isCorrect: boolean;
}

const AUTO_NEXT_DELAY = 3000;

// ============================================
// COMPOSANT
// ============================================

const AssessmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { level = 1 } = route.params || {};
  const numLevel = Number(level);

  // =================== HOOKS ===================

  const { identity } = useTheme();
  const { trackItemCompletion } = useProgress();
  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Génération des questions depuis la DB
  const { pool, questions, isLoading, error } = useAssessmentGenerator(numLevel, 20);

  // Navigation sécurisée
  const safeGoBack = useSafeNavigation(useCallback(() => navigation.goBack(), [navigation]));

  const safeNavigateToResults = useSafeNavigation(
    useCallback(
      (params: RootStackParamList['AssessmentResults']) =>
        navigation.navigate('AssessmentResults', params),
      [navigation]
    )
  );

  // =================== STATE ===================

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswerRecord>>({});
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    userAnswer: null,
    isValidated: false,
    isCorrect: false,
  });

  // =================== DATA LOGIC ===================

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Progression visuelle
  const realProgress =
    totalQuestions > 0 ? Math.round((currentQuestionIndex / totalQuestions) * 100) : 0;

  const validationState = useMemo(() => {
    if (!exerciseState.isValidated) return 'initial';
    return exerciseState.isCorrect ? 'correct' : 'incorrect';
  }, [exerciseState.isValidated, exerciseState.isCorrect]);

  // =================== HANDLERS ===================

  const handleNext = useCallback(() => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);

    if (isLastQuestion) {
      // Calcul du score final
      const correctCount = Object.values(userAnswers).filter((r) => r.isCorrect).length;
      safeNavigateToResults.navigate({
        level: numLevel,
        userAnswers,
        totalQuestions,
        score: correctCount,
        allQuestions: questions,
      });
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setExerciseState({ userAnswer: null, isValidated: false, isCorrect: false });
    }
  }, [
    isLastQuestion,
    userAnswers,
    numLevel,
    totalQuestions,
    questions,
    safeNavigateToResults,
  ]);

  // Passage automatique si incorrect (pour ne pas bloquer)
  useEffect(() => {
    if (exerciseState.isValidated && !exerciseState.isCorrect) {
      autoNextTimeoutRef.current = setTimeout(() => handleNext(), AUTO_NEXT_DELAY);
    }
    return () => {
      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    };
  }, [exerciseState.isValidated, exerciseState.isCorrect, handleNext]);

  const handleAnswer = (answer: string) => {
    if (!exerciseState.isValidated) {
      setExerciseState((prev) => ({ ...prev, userAnswer: answer }));
    }
  };

  const handleValidate = () => {
    if (!exerciseState.userAnswer || exerciseState.isValidated || !currentQuestion) return;

    const cleanedAnswer = exerciseState.userAnswer.trim();
    const isCorrect =
      cleanedAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id || currentQuestionIndex]: {
        userAnswer: cleanedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        theme: currentQuestion.theme,
      },
    }));

    setExerciseState((prev) => ({ ...prev, isValidated: true, isCorrect }));

    // Track la progression
    trackItemCompletion(
      numLevel,
      'assessment',
      'current_assessment',
      currentQuestionIndex,
      totalQuestions
    );
  };

  // =================== STYLES ===================

  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: identity.palette.background,
    },
    questionContainer: {
      flex: 1,
    },
  });

  // =================== RENDER ===================

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={identity.palette.primary} />
      </View>
    );
  }

  // Error state
  if (error || !pool || !currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={identity.palette.primary} />
      </View>
    );
  }

  return (
    <ExerciseLayout
      gradientColors={identity.ui.hasGradient ? identity.ui.gradientColors : undefined}
      headerProps={{
        variant: 'exercise',
        onBack: safeGoBack.navigate,
        rightIcon: '🎯',
        showLevelBadge: true,
        levelTitle: `Level ${numLevel}`,
        levelColor: identity.palette.primary,
        exerciseTitle: 'Assessment',
        gradientColors: identity.ui.hasGradient ? identity.ui.gradientColors : undefined,
      }}
      progressProps={{
        progressPercent: realProgress,
        progressText: `Question ${currentQuestionIndex + 1} / ${totalQuestions}`,
      }}
      footer={
        <ExerciseValidation
          state={validationState}
          onValidate={handleValidate}
          onNext={handleNext}
          disabled={!exerciseState.userAnswer && !exerciseState.isValidated}
          isLastQuestion={isLastQuestion}
          feedbackMessage={
            exerciseState.isValidated
              ? {
                  icon: exerciseState.isCorrect ? '✓' : '✗',
                  title: exerciseState.isCorrect ? 'Correct' : 'Incorrect',
                  message: exerciseState.isCorrect
                    ? 'Your answer is correct.'
                    : `The correct answer was: ${currentQuestion.correctAnswer}`,
                }
              : null
          }
        />
      }
    >
      <View style={styles.questionContainer}>
        {isAssessmentDefinitionQuestion(currentQuestion) && (
          <QuestionDefinition
            question={currentQuestion}
            onAnswer={handleAnswer}
            userAnswer={exerciseState.userAnswer}
            isValidated={exerciseState.isValidated}
            isCorrect={exerciseState.isCorrect}
          />
        )}
        {isAssessmentBlanksQuestion(currentQuestion) && (
          <QuestionBlanks
            question={currentQuestion}
            onAnswer={handleAnswer}
            userAnswer={exerciseState.userAnswer}
            isValidated={exerciseState.isValidated}
            isCorrect={exerciseState.isCorrect}
          />
        )}
        {isAssessmentSentenceQuestion(currentQuestion) && (
          <QuestionSentence
            question={currentQuestion}
            onAnswer={handleAnswer}
            userAnswer={exerciseState.userAnswer}
            isValidated={exerciseState.isValidated}
            isCorrect={exerciseState.isCorrect}
          />
        )}
      </View>
    </ExerciseLayout>
  );
};

export default AssessmentScreen;
