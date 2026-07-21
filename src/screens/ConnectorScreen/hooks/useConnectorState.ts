import { useState, useCallback } from 'react';

/**
 * État unifié : un seul exercice actif à la fois (logic OU fusion OU rephrasing),
 * donc un seul état suffit plutôt que trois états séparés par type.
 */
export interface UnifiedConnectorState {
  selectedOption?: string; // Logic Links (choix multiple)
  userAnswer?: string; // Fusion & Rephrasing (input texte)
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
}

const INITIAL_STATE: UnifiedConnectorState = {
  selectedOption: undefined,
  userAnswer: undefined,
  isValidated: false,
  isCorrect: false,
  attemptCount: 0,
};

export const useConnectorState = (_exerciseType: 'logic' | 'fusion' | 'rephrasing') => {
  const [state, setState] = useState<UnifiedConnectorState>(INITIAL_STATE);

  const setLogicState = useCallback((updater: (prev: UnifiedConnectorState) => UnifiedConnectorState) => {
    setState((prev) => updater(prev));
  }, []);

  const setFusionState = useCallback((updater: (prev: UnifiedConnectorState) => UnifiedConnectorState) => {
    setState((prev) => updater(prev));
  }, []);

  const setRephrasingState = useCallback((updater: (prev: UnifiedConnectorState) => UnifiedConnectorState) => {
    setState((prev) => updater(prev));
  }, []);

  const resetAllStates = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // logicState/fusionState/rephrasingState pointent tous vers le même objet :
  // ConnectorCardRenderer attend ce format à 3 clés, mais un seul exercice est actif à la fois.
  return {
    logicState: state,
    fusionState: state,
    rephrasingState: state,
    setLogicState,
    setFusionState,
    setRephrasingState,
    resetAllStates,
  };
};