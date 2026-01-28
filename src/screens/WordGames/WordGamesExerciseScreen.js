// ============================================
// FICHIER: src/screens/WordGamesExerciseScreen/index.js
// ✅ CORRECTIF : Niveau dynamique & Performance optimisée
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// Composants
import ExerciseLayout from '../../../components/layout/ExerciseLayout';
import GameCardRenderer from '../../../components/pedagogy/wordgames/GameCardRendered';

// Helpers & Hooks
import { getFamilyById } from '../../../data';
import { getLevelData, getExerciseData } from '../../../utils/constants';
import { getLevelColor, getLevelGradient } from '@themes/colors';
import { useProgress } from '../../../contexts/ProgressContext';
import useExerciseBackground from '../../../hooks/useExerciseBackground';
import useSafeNavigation from '../../../hooks/useSafeNavigation';
import { log } from '../../../utils/logUtils';
import { useGameState } from '../WordGames/hooks/useGameState';
import { useGameHandlers } from '../WordGames/hooks/useGameHandlers';

const CURRENT_MODULE_ID = 'word_games';
const MAX_ATTEMPTS = 2;

const WordGamesExerciseScreen = ({ navigation, route }) => {
  // =================== PARAMS & DYNAMISME ===================
  const { familyId, moduleId, levelId = 1 } = route.params || {};
  const numLevelId = parseInt(levelId, 10);

  // ✅ Calcul dynamique des styles selon le niveau
  const currentLevelColor = useMemo(() => getLevelColor(numLevelId), [numLevelId]);
  const currentLevelGradient = useMemo(() => getLevelGradient(numLevelId), [numLevelId]);
  const currentLevelData = useMemo(() => getLevelData(numLevelId), [numLevelId]);
  const moduleData = useMemo(() => getExerciseData(CURRENT_MODULE_ID), []);

  // ✅ CORRECTION : Utilisation de la couleur dynamique du niveau pour le background
  const { gradientColors } = useExerciseBackground(CURRENT_MODULE_ID, currentLevelColor);
  
  const { trackItemCompletion, saveProgressNow, progress, getFamilyProgress } = useProgress();

  // Navigation sécurisée
  const safeGoBack = useSafeNavigation(
    useCallback(() => navigation.goBack(), [navigation])
  );

  // Données du jeu
  const gameFamily = useMemo(() => 
    getFamilyById(moduleId, numLevelId, familyId), 
    [moduleId, numLevelId, familyId]
  );

  const questions = useMemo(() => 
    gameFamily?.exercises || gameFamily?.questions || [], 
    [gameFamily]
  );

  const gameType = useMemo(() => 
    gameFamily?.id?.split('_')[0], 
    [gameFamily]
  );

  // =================== PROGRESSION LOGIC ===================
  const getFirstIncompleteIndex = useCallback(() => {
    if (!questions?.length) return 0;
    const items = progress[`level${numLevelId}`]?.[CURRENT_MODULE_ID]?.[familyId]?.items;
    
    if (!items) return 0;
    
    for (let i = 0; i < questions.length; i++) {
      if (!items[i]) return i;
    }
    return Math.max(0, questions.length - 1);
  }, [progress, numLevelId, familyId, questions]);

  // =================== STATE & GAME HOOKS ===================
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shouldGoBack, setShouldGoBack] = useState(false);

  // Initialisation de l'index au montage
  useEffect(() => {
    setCurrentQuestionIndex(getFirstIncompleteIndex());
  }, []);

  const gameStates = useGameState(gameType);
  const {
    builderState,
    definitionState,
    blanksState,
    sentenceState,
    getCurrentState,
  } = gameStates;

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Handlers de jeu
  const handlers = useGameHandlers({
    question: currentQuestion,
    isLastQuestion,
    safeGoBack,
    setCurrentQuestionIndex,
    states: gameStates,
    progress: { trackItemCompletion, numLevelId, familyId, totalQuestions, currentQuestionIndex },
  });

  // =================== EFFECTS ===================
  useEffect(() => {
    if (!gameFamily || questions.length === 0) {
      setShouldGoBack(true);
    }
  }, [gameFamily, questions]);

  useEffect(() => {
    if (shouldGoBack) {
      const timer = setTimeout(() => safeGoBack.navigate(), 100);
      return () => clearTimeout(timer);
    }
  }, [shouldGoBack, safeGoBack]);

  // Suivi de progression automatique lors de la validation d'un état de jeu
  useEffect(() => {
    if (!gameFamily || currentQuestionIndex < 0) return;
    const currentState = getCurrentState();
    if (!currentState) return;

    const canSkip = currentState.attemptCount >= MAX_ATTEMPTS && !currentState.isCorrect;
    if (currentState.isValidated && (currentState.isCorrect || canSkip)) {
      trackItemCompletion(numLevelId, CURRENT_MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
    }
  }, [
    builderState, definitionState, blanksState, sentenceState,
    currentQuestionIndex, gameFamily, numLevelId, familyId, totalQuestions, trackItemCompletion, getCurrentState
  ]);

  useEffect(() => () => saveProgressNow(), [saveProgressNow]);

  // Rendu de sécurité
  if (!gameFamily || questions.length === 0 || shouldGoBack || !currentQuestion) return null;

  const realProgress = getFamilyProgress(numLevelId, CURRENT_MODULE_ID, familyId);

  return (
    <ExerciseLayout
      gradientColors={gradientColors}
      headerProps={{
        variant: "exercise",
        onBack: safeGoBack.navigate,
        rightIcon: moduleData?.icon || 'game-controller',
        onRightIconPress: () => log.debug('Info icon pressed'),
        showLevelBadge: true,
        levelTitle: currentLevelData?.badge, // ✅ Dynamique
        levelColor: currentLevelColor,       // ✅ Dynamique
        exerciseTitle: gameFamily.title || 'Jeux de mots',
        gradientColors: currentLevelGradient, // ✅ Dynamique
      }}
      progressProps={{
        progressPercent: realProgress,
        progressText: `${realProgress}% • Jeu ${currentQuestionIndex + 1}/${totalQuestions}`,
      }}
    >
      <GameCardRenderer
        gameType={gameType}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        isLastQuestion={isLastQuestion}
        gameFamily={gameFamily}
        states={gameStates}
        handlers={handlers}
      />
    </ExerciseLayout>
  );
};

WordGamesExerciseScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export default WordGamesExerciseScreen;