import { useState, useCallback, useMemo } from 'react';
import { LogicState, FusionState, RephrasingState } from '../../../components/pedagogy/Connector/types';

export const useConnectorState = (exerciseType: 'logic' | 'fusion' | 'rephrasing') => {
  // État pour Logic Links
  const [logicState, setLogicState] = useState<LogicState>({
    selectedOption: undefined,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  // État pour Sentence Fusion
  const [fusionState, setFusionState] = useState<FusionState>({
    userAnswer: undefined,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  // État pour Rephrasing
  const [rephrasingState, setRephrasingState] = useState<RephrasingState>({
    userAnswer: undefined,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  // Reset tout quand on change de question
  const resetAllStates = useCallback(() => {
    setLogicState({ selectedOption: undefined, isValidated: false, isCorrect: false, attemptCount: 0 });
    setFusionState({ userAnswer: undefined, isValidated: false, isCorrect: false, attemptCount: 0 });
    setRephrasingState({ userAnswer: undefined, isValidated: false, isCorrect: false, attemptCount: 0 });
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