import { useState, useCallback } from 'react';

/**
 * Hook de gestion d'état pour les exercices Connector
 * 
 * ✅ CORRECTION POINT 5 APPLIQUÉE :
 * - Au lieu de 3 états séparés (logicState, fusionState, rephrasingState)
 * - On utilise UN SEUL état dynamique qui s'adapte au type d'exercice
 * - Plus efficace en mémoire et plus simple à gérer
 */

/**
 * État unifié pour tous les types d'exercices
 * Peut contenir soit selectedOption (logic) soit userAnswer (fusion/rephrasing)
 */
interface UnifiedConnectorState {
  // Pour Logic Links (choix multiple)
  selectedOption?: string;
  
  // Pour Fusion & Rephrasing (input texte)
  userAnswer?: string;
  
  // Commun à tous
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
}

/**
 * État initial par défaut
 */
const INITIAL_STATE: UnifiedConnectorState = {
  selectedOption: undefined,
  userAnswer: undefined,
  isValidated: false,
  isCorrect: false,
  attemptCount: 0,
};

export const useConnectorState = (exerciseType: 'logic' | 'fusion' | 'rephrasing') => {
  // ============================================
  // UN SEUL ÉTAT UNIFIÉ (au lieu de 3 séparés)
  // ============================================
  
  const [state, setState] = useState<UnifiedConnectorState>(INITIAL_STATE);

  // ============================================
  // SETTERS SPÉCIFIQUES PAR TYPE
  // ============================================

  /**
   * Setter pour Logic Links
   */
  const setLogicState = useCallback((updater: (prev: any) => any) => {
    setState((prev) => updater(prev));
  }, []);

  /**
   * Setter pour Sentence Fusion
   */
  const setFusionState = useCallback((updater: (prev: any) => any) => {
    setState((prev) => updater(prev));
  }, []);

  /**
   * Setter pour Rephrasing
   */
  const setRephrasingState = useCallback((updater: (prev: any) => any) => {
    setState((prev) => updater(prev));
  }, []);

  // ============================================
  // RESET FUNCTION
  // ============================================

  /**
   * Reset l'état lors du passage à la question suivante
   * Réinitialise TOUT d'un coup (plus simple qu'avant)
   */
  const resetAllStates = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // ============================================
  // RETURN - Format compatible avec l'ancien code
  // ============================================

  /**
   * On retourne le même format qu'avant pour garder la compatibilité
   * avec ConnectorCardRenderer qui attend { logicState, fusionState, rephrasingState }
   * 
   * MAIS en interne, c'est le MÊME objet (plus efficace !)
   */
  return {
    // Les 3 "états" pointent vers le même objet unifié
    logicState: state,
    fusionState: state,
    rephrasingState: state,

    // Setters (tous modifient le même état)
    setLogicState,
    setFusionState,
    setRephrasingState,

    // Reset simplifié
    resetAllStates,
  };
};