// ============================================
// FICHIER: src/screens/exercises/Dialogues/DialogueExerciseScreen.js
// ✅ VERSION NETTOYÉE : Conflits Git résolus
// ============================================

import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { log } from '../../../utils/logUtils';

// Composants
import ExerciseLayout from '../../../components/layout/ExerciseLayout';
import DialogueCard from '../../../components/pedagogy/dialogues/DialogueCard';
import ExerciseValidation from '../../../components/exercise-common/ExerciseValidation';

// Helpers & Hooks
import { getFamilyById } from '../../../data';
import { getLevelData, getExerciseData } from '../../../utils/constants';
import { getLevelColor, getLevelGradient } from '@themes/colors';
import { useProgress } from '../../../contexts/ProgressContext';
import useExerciseBackground from '../../../hooks/useExerciseBackground';
import useSafeNavigation from '../../../hooks/useSafeNavigation';
import { useExerciseActivity } from '../../../hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '../../../hooks/exercises/useExerciseSaveOnUnmount';
import { useErrorTracking } from '../../../hooks/useErrorTracking';

const EXERCISE_TYPE = 'dialogues';
const MAX_ATTEMPTS = 2;

const DialogueExerciseScreen = ({ navigation, route }) => {
  // =================== PARAMS & DATA ===================
  const { familyId, moduleId, levelId = 1 } = route.params || {};
  const numLevelId = Number.parseInt(levelId, 10);

  // Hooks de base
  const { trackItemCompletion, getFamilyProgress } = useProgress();
  const { trackErrorAuto } = useErrorTracking();

  const safeGoBack = useSafeNavigation(useCallback(() => navigation.goBack(), [navigation]));

  // Données dynamiques
  const dialogueFamily = useMemo(
    () => getFamilyById(moduleId, numLevelId, familyId),
    [moduleId, numLevelId, familyId]
  );
  const currentLevelData = useMemo(() => getLevelData(numLevelId), [numLevelId]);
  const currentModuleData = useMemo(() => getExerciseData(EXERCISE_TYPE), []);
  const levelColor = getLevelColor(numLevelId);
  const levelGradient = getLevelGradient(numLevelId);
  const { gradientColors } = useExerciseBackground(EXERCISE_TYPE, levelColor);

  // =================== STATE ===================
  const [phase, setPhase] = useState('dialogue'); // 'dialogue' ou 'questions'
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [exerciseState, setExerciseState] = useState({
    selectedOption: null,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  // =================== LOGIQUE MÉTIER ===================
  const questions = dialogueFamily?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  const messages = dialogueFamily?.messages || [];
  const totalMessages = messages.length;
  const isLastMessage = currentMessageIndex === totalMessages - 1;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const realProgress = getFamilyProgress(numLevelId, EXERCISE_TYPE, familyId);

  // =================== ⚡ HOOKS UTILITAIRES ===================
  useExerciseActivity({
    type: 'dialogue',
    levelId: numLevelId,
    familyId,
    moduleId,
    familyName: dialogueFamily?.name || dialogueFamily?.title || 'Dialogue',
    icon: dialogueFamily?.icon || '💬',
    currentIndex: phase === 'dialogue' ? currentMessageIndex : currentQuestionIndex,
    totalItems: phase === 'dialogue' ? totalMessages : totalQuestions,
    enabled: !!dialogueFamily,
  });

  useExerciseSaveOnUnmount();

  // =================== HANDLERS ===================

  const handleAnswer = option => {
    if (exerciseState.isValidated) return;
    setExerciseState(prev => ({ ...prev, selectedOption: option }));
  };

  const handleValidate = () => {
    if (!exerciseState.selectedOption || !currentQuestion) return;

    // Convertir l'index correctAnswer en lettre (A=0, B=1, C=2, D=3)
    const correctLetter = String.fromCodePoint(65 + currentQuestion.correctAnswer);
    const isCorrect = exerciseState.selectedOption === correctLetter;
    
    // ✅ TRACKING D'ERREUR POUR MODE VOLTAGE
    if (!isCorrect) {
      const correctAnswerText = currentQuestion.options?.[currentQuestion.correctAnswer] || correctLetter;
      trackErrorAuto(EXERCISE_TYPE, {
        question: currentQuestion.question || currentQuestion.text,
        userAnswer: exerciseState.selectedOption,
        correctAnswer: correctAnswerText,
        ruleId: familyId,
      });
    }
    
    setExerciseState(prev => ({
      ...prev,
      isValidated: true,
      isCorrect,
      attemptCount: prev.attemptCount + 1,
    }));
  };

  const handleNextQuestion = () => {
    trackItemCompletion(numLevelId, EXERCISE_TYPE, familyId, currentQuestionIndex, totalQuestions);

    if (isLastQuestion) {
      safeGoBack.navigate();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setExerciseState({
        selectedOption: null,
        isValidated: false,
        isCorrect: false,
        attemptCount: 0,
      });
    }
  };

  // =================== FEEDBACK ===================

  const feedbackMessage = useMemo(() => {
    if (!exerciseState.isValidated) return null;
    if (exerciseState.isCorrect) {
      return { icon: '✓', title: 'Correct', message: 'Ta réponse est juste.' };
    }
    const canSkip = exerciseState.attemptCount >= MAX_ATTEMPTS - 1;
    if (canSkip) {
      const correctAnswer = currentQuestion?.options?.[currentQuestion?.correctAnswer];
      return { icon: 'ℹ', title: 'Réponse', message: `La réponse était : ${correctAnswer}` };
    }
    return {
      icon: '✗',
      title: 'Incorrect',
      message: 'Relis le dialogue et réessaie.',
    };
  }, [
    exerciseState.isValidated,
    exerciseState.isCorrect,
    exerciseState.attemptCount,
    currentQuestion,
  ]);

  return (
    <ExerciseLayout
      gradientColors={gradientColors}
      headerProps={{
        variant: 'exercise',
        onBack: safeGoBack.navigate,
        rightIcon: currentModuleData?.icon || 'chatbubbles',
        onRightIconPress: () => log.debug('Dialogue info pressed'),
        showLevelBadge: true,
        levelTitle: currentLevelData?.badge,
        levelColor: levelColor,
        exerciseTitle: dialogueFamily?.name || dialogueFamily?.title || 'Dialogue',
        gradientColors: levelGradient,
      }}
      progressProps={{
        progressPercent: realProgress,
        progressText:
          phase === 'dialogue'
            ? `Lecture • ${currentMessageIndex + 1}/${totalMessages}`
            : `Questions • ${currentQuestionIndex + 1}/${totalQuestions}`,
      }}
      footer={
        phase === 'questions' ? (
          <ExerciseValidation
            isValidated={exerciseState.isValidated}
            isCorrect={exerciseState.isCorrect}
            onValidate={handleValidate}
            onNext={handleNextQuestion}
            onRetry={() =>
              setExerciseState(prev => ({
                ...prev,
                selectedOption: null,
                isValidated: false,
              }))
            }
            onSkip={handleNextQuestion}
            disabled={!exerciseState.isValidated && !exerciseState.selectedOption}
            isLastQuestion={isLastQuestion}
            feedbackMessage={feedbackMessage}
            attemptCount={exerciseState.attemptCount}
            maxAttempts={MAX_ATTEMPTS}
          />
        ) : null
      }
    >
      {phase === 'dialogue' ? (
        <DialogueCard
          key="dialogue_mode"
          dialogue={dialogueFamily}
          currentMessageIndex={currentMessageIndex}
          onPreviousMessage={() =>
            currentMessageIndex > 0 && setCurrentMessageIndex(prev => prev - 1)
          }
          onNextMessage={() =>
            isLastMessage ? setPhase('questions') : setCurrentMessageIndex(prev => prev + 1)
          }
          isLastMessage={isLastMessage}
          totalMessages={totalMessages}
        />
      ) : (
        <DialogueCard
          key="question_mode"
          question={currentQuestion}
          selectedOption={exerciseState.selectedOption}
          isValidated={exerciseState.isValidated}
          isCorrect={exerciseState.isCorrect}
          onAnswer={handleAnswer}
          color={dialogueFamily?.color || levelColor}
        />
      )}
    </ExerciseLayout>
  );
};

DialogueExerciseScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export default DialogueExerciseScreen;