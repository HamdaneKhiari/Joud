/**
 * ============================================
 * WORD GAMES EXERCISE SCREEN
 * Écran unifié pour tous les jeux de mots (White Label)
 * ============================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Composants
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import GameCardRenderer from '@/components/pedagogy/wordgames/GameCardRendered';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

// Helpers & Hooks
import { useTheme } from '@/themes/ThemeContext';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { useFirstIncompleteIndex } from '@/hooks/exercises/useFirstIncompleteIndex';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import { useExerciseContent } from '@/hooks/exercises/useExerciseContent';
import { useLevelLabel } from '@/utils/labelMapper';

// WordGames specific
import type { GameQuestion } from './schema';
import { useGameState } from './hooks/useGameState';
import { useGameHandlers } from './hooks/useGameHandlers';

const EXERCISE_TYPE = 'word_games';
const MAX_ATTEMPTS = 2;

// ============================================
// TYPES
// ============================================

type WordGamesStackParamList = {
  WordGamesExercise: {
    familyId: string;
    levelId?: string;
  };
};

type WordGamesExerciseRouteProp = RouteProp<WordGamesStackParamList, 'WordGamesExercise'>;
type WordGamesExerciseNavigationProp = StackNavigationProp<
  WordGamesStackParamList,
  'WordGamesExercise'
>;

interface Props {
  navigation: WordGamesExerciseNavigationProp;
  route: WordGamesExerciseRouteProp;
}

// ============================================
// COMPOSANT
// ============================================

const WordGamesExerciseScreen = ({ navigation, route }: Props) => {
  // =================== PARAMS & THEME ===================
  const { familyId, levelId = '1' } = route.params || {};
  const numLevelId = Number.parseInt(levelId, 10);
  const { identity } = useTheme();

  // =================== PROGRESSION & NAVIGATION ===================
  const { trackItemCompletion, getFamilyProgress, saveProgressNow } = useProgress();
  const safeGoBack = useSafeNavigation(
    useCallback(() => navigation.goBack(), [navigation])
  );

  // =================== CHARGEMENT DONNÉES DB ===================
  const { module, family, contentItems, isLoading } = useExerciseContent<GameQuestion>(
    familyId,
    numLevelId
  );

  const levelLabel = useLevelLabel(numLevelId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const totalQuestions = contentItems.length;
  const getFirstIncompleteIndex = useFirstIncompleteIndex(
    numLevelId,
    EXERCISE_TYPE,
    familyId,
    totalQuestions
  );

  // Initialisation de l'index de départ
  useEffect(() => {
    if (totalQuestions > 0) {
      setCurrentQuestionIndex(getFirstIncompleteIndex());
    }
  }, [totalQuestions, getFirstIncompleteIndex]);

  const currentQuestion = contentItems?.[currentQuestionIndex]?.data || null;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const realProgress = getFamilyProgress(numLevelId, EXERCISE_TYPE, familyId);

  // Détecter le type de jeu depuis la première question
  const gameType = currentQuestion?.type || 'definition';

  // =================== GAME STATE & HANDLERS ===================
  const gameStates = useGameState(gameType);
  const { getCurrentState } = gameStates;

  const handlers = useGameHandlers({
    question: currentQuestion as GameQuestion,
    isLastQuestion,
    safeGoBack,
    setCurrentQuestionIndex,
    states: gameStates,
    progress: {
      trackItemCompletion,
      numLevelId,
      familyId,
      totalQuestions,
      currentQuestionIndex,
    },
  });

  // =================== ACTIVITÉ & AUTO-SAVE ===================
  useExerciseActivity({
    levelId: numLevelId,
    familyId,
    familyName: family?.name || 'Word Games',
    moduleSlug: module?.slug || EXERCISE_TYPE,
    icon: family?.icon || 'gamepad-variant',
    currentIndex: currentQuestionIndex,
    totalItems: totalQuestions,
    enabled: !isLoading && !!family && !!currentQuestion,
  });

  useExerciseSaveOnUnmount();

  // Suivi automatique de progression après validation
  useEffect(() => {
    if (!family || currentQuestionIndex < 0) return;
    const currentState = getCurrentState();
    if (!currentState) return;

    const canSkip = currentState.attemptCount >= MAX_ATTEMPTS && !currentState.isCorrect;
    if (currentState.isValidated && (currentState.isCorrect || canSkip)) {
      trackItemCompletion(numLevelId, EXERCISE_TYPE, familyId, currentQuestionIndex, totalQuestions);
    }
  }, [
    gameStates.definitionState,
    gameStates.blanksState,
    gameStates.sentenceState,
    gameStates.idiomsState,
    gameStates.detectiveState,
    currentQuestionIndex,
    family,
    numLevelId,
    familyId,
    totalQuestions,
    trackItemCompletion,
    getCurrentState,
  ]);

  // =================== HANDLERS NAVIGATION ===================
  // Note: Navigation gérée entièrement par ExerciseValidation dans les cards
  // Plus besoin de handlers Précédent/Suivant manuels

  // =================== RENDU ===================
  if (isLoading || !family || !currentQuestion) {
    return (
      <ExerciseLayout
        headerProps={{
          variant: 'exercise',
          onBack: () => {
            safeGoBack.navigate();
          },
          exerciseTitle: 'Chargement...',
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={identity.palette.accent} />
        </View>
      </ExerciseLayout>
    );
  }

  return (
    <ExerciseLayout
      headerProps={{
        variant: 'exercise',
        onBack: () => {
          safeGoBack.navigate();
        },
        rightIcon: (
          <DynamicIcon
            name={module?.icon || 'gamepad-variant'}
            size={28}
            color={identity.header.accent}
            fallback="gamepad-variant"
          />
        ),
        showLevelBadge: true,
        levelTitle: levelLabel.badge,
        exerciseTitle: family.name,
      }}
      progressProps={{
        progressPercent: realProgress,
        progressText: `${realProgress}% • Question ${currentQuestionIndex + 1}/${totalQuestions}`,
      }}
    >
      <GameCardRenderer
        gameType={gameType}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        isLastQuestion={isLastQuestion}
        gameFamily={family}
        states={gameStates}
        handlers={handlers}
      />
    </ExerciseLayout>
  );
};

export default WordGamesExerciseScreen;
