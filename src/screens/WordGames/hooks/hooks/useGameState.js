// src/hooks/useGameState.js
import { useState, useCallback, useMemo } from 'react';

const MAX_ATTEMPTS = 2;

export const useGameState = (gameType) => {
  const [builderState, setBuilderState] = useState({
    selectedOption: null,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  const [definitionState, setDefinitionState] = useState({
    selectedOption: null,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  const [blanksState, setBlanksState] = useState({
    selectedOption: null,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  const [sentenceState, setSentenceState] = useState({
    selectedOrder: [],
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  // Reset tout quand on change de question
  const resetAllStates = useCallback(() => {
    setBuilderState({ selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 });
    setDefinitionState({ selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 });
    setBlanksState({ selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 });
    setSentenceState({ selectedOrder: [], isValidated: false, isCorrect: false, attemptCount: 0 });
  }, []);

  // Objet regroupant tous les états (optimisé avec useMemo)
  const allStates = useMemo(() => ({
    builder: builderState,
    definition: definitionState,
    blanks: blanksState,
    sentence: sentenceState,
  }), [builderState, definitionState, blanksState, sentenceState]);

  // Retourne l'état actif selon le type de jeu (optimisé - pas de dépendances des états individuels)
  const getCurrentState = useCallback(() => {
    return allStates[gameType] || null;
  }, [gameType, allStates]);

  return {
    builderState,
    setBuilderState,
    definitionState,
    setDefinitionState,
    blanksState,
    setBlanksState,
    sentenceState,
    setSentenceState,
    resetAllStates,
    getCurrentState,
  };
};