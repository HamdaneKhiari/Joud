// ============================================
// FICHIER: src/screens/exercises/Connector/hooks/useConnectorState.js
// Gestion des états pour les exercices Connector
// ============================================

import { useState, useCallback, useMemo } from 'react';

export const useConnectorState = (exerciseType) => {
  // État pour Logic Links (comme blanks, avec options)
  const [logicState, setLogicState] = useState({
    selectedOption: null,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  // État pour Sentence Fusion (input texte)
  const [fusionState, setFusionState] = useState({
    userAnswer: '',
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  // État pour Rephrasing (input texte avec instruction)
  const [rephrasingState, setRephrasingState] = useState({
    userAnswer: '',
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  // Reset tout quand on change de question
  const resetAllStates = useCallback(() => {
    setLogicState({ selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 });
    setFusionState({ userAnswer: '', isValidated: false, isCorrect: false, attemptCount: 0 });
    setRephrasingState({ userAnswer: '', isValidated: false, isCorrect: false, attemptCount: 0 });
  }, []);

  // Objet regroupant tous les états
  const allStates = useMemo(() => ({
    logic: logicState,
    fusion: fusionState,
    rephrasing: rephrasingState,
  }), [logicState, fusionState, rephrasingState]);

  // Retourne l'état actif selon le type d'exercice
  const getCurrentState = useCallback(() => {
    return allStates[exerciseType] || null;
  }, [exerciseType, allStates]);

  return {
    logicState,
    setLogicState,
    fusionState,
    setFusionState,
    rephrasingState,
    setRephrasingState,
    resetAllStates,
    getCurrentState,
  };
};
