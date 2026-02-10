/**
 * ============================================
 * RevisionScreen - Écran de révision (QCM)
 * 3 Phases : Sélection → Session → Résumé
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';

import SelectionPhase from './components/SelectionPhase';
import SessionPhase from './components/SessionPhase';
import SummaryPhase from './components/SummaryPhase';

import { useRevisionQuestions } from '@/hooks/revision/useRevisionQuestions';
import { useExerciseValidationState } from '@/hooks/exercises/useExerciceValidationState';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import { useCurrentLevel } from '@/contexts/CurrentLevelContext';
import { getSpacedReviewCount } from '@/database/queries';

type Phase = 'selection' | 'session' | 'summary';

const RevisionScreen = () => {
  const router = useRouter();
  const { identity } = useTheme();
  const { db, user } = useUser();
  const { currentLevel } = useCurrentLevel();
  const [phase, setPhase] = useState<Phase>('selection');
  const [spacedCount, setSpacedCount] = useState(0);

  const {
    mode,
    currentQuestion,
    isLoading,
    selectedAnswer,
    isValidated,
    isCorrect,
    attemptCount,
    currentIndex,
    totalQuestions,
    isLastQuestion,
    correctCount,
    incorrectCount,
    progress,
    isSessionCompleted,
    startSession,
    selectAnswer,
    validateAnswer,
    nextQuestion,
    retryQuestion,
    resetSession,
  } = useRevisionQuestions();

  const maxAttempts = 2;

  const { validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!selectedAnswer
  );

  // Enregistrer l'activité de révision dans activity_log
  useExerciseActivity({
    moduleSlug: 'revision',
    familyId: mode === 'spaced' ? 'spaced' : 'daily',
    levelId: currentLevel,
    familyName: mode === 'spaced' ? 'Révision espacée' : 'Révision quotidienne',
    icon: 'refresh',
    currentIndex,
    totalItems: totalQuestions,
    enabled: phase === 'session' && !isLoading && totalQuestions > 0,
  });

  useExerciseSaveOnUnmount();

  // Charger nombre révisions espacées
  useEffect(() => {
    const load = async () => {
      if (db && user) {
        const count = await getSpacedReviewCount(db, user.id);
        setSpacedCount(count);
      }
    };
    load();
  }, [db, user]);

  // Détection fin session
  useEffect(() => {
    if (isSessionCompleted && phase === 'session') {
      setPhase('summary');
    }
  }, [isSessionCompleted, phase]);

  // Handlers
  const handleModeSelection = (selectedMode: 'daily' | 'spaced') => {
    startSession(selectedMode);
    setPhase('session');
  };

  const handleBackToSelection = () => {
    resetSession();
    setPhase('selection');
  };

  const dailyCount = { primary: 5, college: 10, lycee: 15, adult: 15 }[user?.audience || 'primary'];

  // Rendu selon phase
  if (phase === 'selection') {
    return (
      <SelectionPhase
        identity={identity}
        dailyCount={dailyCount}
        spacedCount={spacedCount}
        onBack={() => router.back()}
        onSelectMode={handleModeSelection}
      />
    );
  }

  if (phase === 'session') {
    return (
      <SessionPhase
        identity={identity}
        mode={mode}
        isLoading={isLoading}
        currentQuestion={currentQuestion}
        selectedAnswer={selectedAnswer}
        isValidated={isValidated}
        isCorrect={isCorrect}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        progress={progress}
        isLastQuestion={isLastQuestion}
        validationState={validationState}
        buttonDisabled={buttonDisabled}
        onBack={handleBackToSelection}
        onSelectAnswer={selectAnswer}
        onValidate={validateAnswer}
        onNext={nextQuestion}
        onRetry={retryQuestion}
      />
    );
  }

  if (phase === 'summary') {
    return (
      <SummaryPhase
        identity={identity}
        totalQuestions={totalQuestions}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        onBack={() => router.back()}
        onRestart={handleBackToSelection}
      />
    );
  }

  return null;
};

export default RevisionScreen;
