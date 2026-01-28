// ============================================
// FICHIER: src/screens/AssessmentScreen/index.js
// ✅ CORRECTIF : Navigation stable & Optimisation des performances
// ============================================

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, View } from 'react-native';

// Layout & UI
import ExerciseLayout from '../../../../components/layout/ExerciseLayout';
import ExerciseValidation from '../../../../components/exercise-common/ExerciseValidation';

// Composants questions
import QuestionDefinition from '../components/QuestionDefinition';
import QuestionBlanks from '../components/QuestionBlanks';
import QuestionSentence from '../components/QuestionSentence';

// Logique & Data
import { generateAssessment } from '../components/generateAssessment';
import { getLevelData } from '../../../../utils/constants';
import { getLevelColor, getLevelGradient } from '@themes/colors';
import { useProgress } from '../../../../contexts/ProgressContext';
import useExerciseBackground from '../../../../hooks/useExerciseBackground';
import useSafeNavigation from '../../../../hooks/useSafeNavigation'; // ✅ Changé pour useSafeNavigation

const AUTO_NEXT_DELAY = 3000;

const AssessmentScreen = ({ navigation, route }) => {
  const { level = 1 } = route.params || {};
  const numLevel = parseInt(level, 10);

  // =================== HOOKS DYNAMIQUES ===================
  // ✅ On mémorise les couleurs pour éviter les lags lors de la saisie au clavier
  const levelColor = useMemo(() => getLevelColor(numLevel), [numLevel]);
  const levelGradient = useMemo(() => getLevelGradient(numLevel), [numLevel]);
  const levelData = useMemo(() => getLevelData(numLevel), [numLevel]);
  
  const { gradientColors } = useExerciseBackground('assessment', levelColor);
  const { trackItemCompletion } = useProgress();
  const autoNextTimeoutRef = useRef(null);

  // ✅ CORRECTION NAVIGATION : Utilisation du hook dédié stable
  const safeGoBack = useSafeNavigation(
    useCallback(() => navigation.goBack(), [navigation])
  );

  const safeNavigateToResults = useSafeNavigation(
    useCallback((params) => navigation.navigate('AssessmentResults', params), [navigation])
  );

  // =================== STATE ===================
  const [generatedAssessment, setGeneratedAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [exerciseState, setExerciseState] = useState({
    userAnswer: null,
    isValidated: false,
    isCorrect: false,
  });

  // Génération initiale
  useEffect(() => {
    setGeneratedAssessment(generateAssessment(numLevel));
  }, [numLevel]);

  // =================== DATA LOGIC ===================
  const questions = generatedAssessment?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  
  // Progression visuelle : on montre l'avancement réel
  const realProgress = totalQuestions > 0 
    ? Math.round((currentQuestionIndex / totalQuestions) * 100) 
    : 0;

  const validationState = useMemo(() => {
    if (!exerciseState.isValidated) return 'initial';
    return exerciseState.isCorrect ? 'correct' : 'incorrect';
  }, [exerciseState.isValidated, exerciseState.isCorrect]);

  // =================== HANDLERS ===================
  
  const handleNext = useCallback(() => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);

    if (isLastQuestion) {
      // Calcul du score final
      const correctCount = Object.values(userAnswers).filter(r => r.isCorrect).length;
      safeNavigateToResults.navigate({
        level: numLevel,
        userAnswers,
        totalQuestions,
        score: correctCount,
        allQuestions: questions,
      });
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setExerciseState({ userAnswer: null, isValidated: false, isCorrect: false });
    }
  }, [isLastQuestion, userAnswers, numLevel, totalQuestions, questions, safeNavigateToResults]);

  // Passage automatique si incorrect (pour ne pas bloquer l'utilisateur sur une erreur)
  useEffect(() => {
    if (exerciseState.isValidated && !exerciseState.isCorrect) {
      autoNextTimeoutRef.current = setTimeout(() => handleNext(), AUTO_NEXT_DELAY);
    }
    return () => clearTimeout(autoNextTimeoutRef.current);
  }, [exerciseState.isValidated, exerciseState.isCorrect, handleNext]);

  const handleAnswer = (answer) => {
    if (!exerciseState.isValidated) {
      setExerciseState(prev => ({ ...prev, userAnswer: answer }));
    }
  };

  const handleValidate = () => {
    if (!exerciseState.userAnswer || exerciseState.isValidated) return;

    const cleanedAnswer = exerciseState.userAnswer.trim();
    const isCorrect = cleanedAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        userAnswer: cleanedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        theme: currentQuestion.theme,
      },
    }));

    setExerciseState(prev => ({ ...prev, isValidated: true, isCorrect }));
    
    // Track la progression
    trackItemCompletion(numLevel, 'assessment', 'current_assessment', currentQuestionIndex, totalQuestions);
  };

  // =================== RENDER ===================

  if (!generatedAssessment || !currentQuestion) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={levelColor} />
      </View>
    );
  }

  return (
    <ExerciseLayout
      gradientColors={gradientColors}
      headerProps={{
        variant: "exercise",
        onBack: safeGoBack.navigate,
        rightIcon: "🎯",
        showLevelBadge: true,
        levelTitle: levelData?.badge,
        levelColor: levelColor,
        exerciseTitle: "Mon Bilan",
        gradientColors: levelGradient,
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
          feedbackMessage={exerciseState.isValidated ? {
            icon: exerciseState.isCorrect ? '✓' : '✗',
            title: exerciseState.isCorrect ? 'Correct' : 'Incorrect',
            message: exerciseState.isCorrect
              ? 'Ta réponse est juste.'
              : `La réponse était : ${currentQuestion.correctAnswer}`
          } : null}
        />
      }
    >
      <View style={{ flex: 1 }}>
        {currentQuestion.type === 'definition' && (
          <QuestionDefinition 
            question={currentQuestion}
            onAnswer={handleAnswer}
            userAnswer={exerciseState.userAnswer}
            isValidated={exerciseState.isValidated}
            isCorrect={exerciseState.isCorrect}
            color={levelColor}
          />
        )}
        {currentQuestion.type === 'blanks' && (
          <QuestionBlanks 
            question={currentQuestion}
            onAnswer={handleAnswer}
            userAnswer={exerciseState.userAnswer}
            isValidated={exerciseState.isValidated}
            isCorrect={exerciseState.isCorrect}
            color={levelColor}
          />
        )}
        {currentQuestion.type === 'sentence' && (
          <QuestionSentence 
            question={currentQuestion}
            onAnswer={handleAnswer}
            userAnswer={exerciseState.userAnswer}
            isValidated={exerciseState.isValidated}
            isCorrect={exerciseState.isCorrect}
            color={levelColor}
          />
        )}
      </View>
    </ExerciseLayout>
  );
};

AssessmentScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export default AssessmentScreen;