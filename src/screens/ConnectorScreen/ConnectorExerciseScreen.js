// ============================================
// FICHIER: src/screens/exercises/Connector/ConnectorExerciseScreen.js
// ✅ Écran pour les exercices The Connector
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// Composants
import ExerciseLayout from '../../../components/layout/ExerciseLayout';
import ConnectorCardRenderer from '../../../components/pedagogy/connector/ConnectorCardRenderer';

// Helpers & Hooks
import { getFamilyById } from '../../../data';
import { getLevelData, getExerciseData } from '../../../utils/constants';
import { getLevelColor, getLevelGradient } from '@themes/colors';
import { useProgress } from '../../../contexts/ProgressContext';
import useExerciseBackground from '../../../hooks/useExerciseBackground';
import useSafeNavigation from '../../../hooks/useSafeNavigation';
import { log } from '../../../utils/logUtils';
import { useConnectorState } from './hooks/useConnectorState';
import { useConnectorHandlers } from './hooks/useConnectorHandlers';

const CURRENT_MODULE_ID = 'connector';
const MAX_ATTEMPTS = 2;

const ConnectorExerciseScreen = ({ navigation, route }) => {
  // =================== PARAMS & DYNAMISME ===================
  const { familyId, moduleId, levelId = 1 } = route.params || {};
  const numLevelId = parseInt(levelId, 10);

  // ✅ Calcul dynamique des styles selon le niveau
  const currentLevelColor = useMemo(() => getLevelColor(numLevelId), [numLevelId]);
  const currentLevelGradient = useMemo(() => getLevelGradient(numLevelId), [numLevelId]);
  const currentLevelData = useMemo(() => getLevelData(numLevelId), [numLevelId]);
  const moduleData = useMemo(() => getExerciseData(CURRENT_MODULE_ID), []);

  // ✅ Background avec couleur dynamique du niveau
  const { gradientColors } = useExerciseBackground(CURRENT_MODULE_ID, currentLevelColor);

  const { trackItemCompletion, saveProgressNow, progress, getFamilyProgress } = useProgress();

  // Navigation sécurisée
  const safeGoBack = useSafeNavigation(
    useCallback(() => navigation.goBack(), [navigation])
  );

  // Données de l'exercice
  const exerciseFamily = useMemo(() =>
    getFamilyById(moduleId, numLevelId, familyId),
    [moduleId, numLevelId, familyId]
  );

  const questions = useMemo(() =>
    exerciseFamily?.questions || [],
    [exerciseFamily]
  );

  // Déterminer le type d'exercice selon l'ID de la famille
  const exerciseType = useMemo(() => {
    if (!exerciseFamily?.id) return 'logic';
    if (exerciseFamily.id.includes('logic')) return 'logic';
    if (exerciseFamily.id.includes('fusion')) return 'fusion';
    if (exerciseFamily.id.includes('rephrasing')) return 'rephrasing';
    return 'logic';
  }, [exerciseFamily]);

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

  // =================== STATE & CONNECTOR HOOKS ===================
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shouldGoBack, setShouldGoBack] = useState(false);

  // Initialisation de l'index au montage
  useEffect(() => {
    setCurrentQuestionIndex(getFirstIncompleteIndex());
  }, []);

  const connectorStates = useConnectorState(exerciseType);
  const {
    logicState,
    fusionState,
    rephrasingState,
    getCurrentState,
  } = connectorStates;

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Handlers de l'exercice
  const handlers = useConnectorHandlers({
    question: currentQuestion,
    isLastQuestion,
    safeGoBack,
    setCurrentQuestionIndex,
    states: connectorStates,
    progress: { trackItemCompletion, numLevelId, familyId, totalQuestions, currentQuestionIndex },
  });

  // =================== EFFECTS ===================
  useEffect(() => {
    if (!exerciseFamily || questions.length === 0) {
      setShouldGoBack(true);
    }
  }, [exerciseFamily, questions]);

  useEffect(() => {
    if (shouldGoBack) {
      const timer = setTimeout(() => safeGoBack.navigate(), 100);
      return () => clearTimeout(timer);
    }
  }, [shouldGoBack, safeGoBack]);

  // Suivi de progression automatique lors de la validation d'un état
  useEffect(() => {
    if (!exerciseFamily || currentQuestionIndex < 0) return;
    const currentState = getCurrentState();
    if (!currentState) return;

    const canSkip = currentState.attemptCount >= MAX_ATTEMPTS && !currentState.isCorrect;
    if (currentState.isValidated && (currentState.isCorrect || canSkip)) {
      trackItemCompletion(numLevelId, CURRENT_MODULE_ID, familyId, currentQuestionIndex, totalQuestions);
    }
  }, [
    logicState, fusionState, rephrasingState,
    currentQuestionIndex, exerciseFamily, numLevelId, familyId, totalQuestions, trackItemCompletion, getCurrentState
  ]);

  useEffect(() => () => saveProgressNow(), [saveProgressNow]);

  // Rendu de sécurité
  if (!exerciseFamily || questions.length === 0 || shouldGoBack || !currentQuestion) return null;

  const realProgress = getFamilyProgress(numLevelId, CURRENT_MODULE_ID, familyId);

  return (
    <ExerciseLayout
      gradientColors={gradientColors}
      headerProps={{
        variant: "exercise",
        onBack: safeGoBack.navigate,
        rightIcon: moduleData?.icon || 'vector-combine',
        onRightIconPress: () => log.debug('Info icon pressed'),
        showLevelBadge: true,
        levelTitle: currentLevelData?.badge,
        levelColor: currentLevelColor,
        exerciseTitle: exerciseFamily.title || 'The Connector',
        gradientColors: currentLevelGradient,
      }}
      progressProps={{
        progressPercent: realProgress,
        progressText: `${realProgress}% • Question ${currentQuestionIndex + 1}/${totalQuestions}`,
      }}
    >
      <ConnectorCardRenderer
        exerciseType={exerciseType}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        isLastQuestion={isLastQuestion}
        exerciseFamily={exerciseFamily}
        states={connectorStates}
        handlers={handlers}
      />
    </ExerciseLayout>
  );
};

ConnectorExerciseScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export default ConnectorExerciseScreen;
