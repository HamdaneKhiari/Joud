/**
 * ============================================
 * HOOK: useGameState
 * Gestion des états pour tous les types de jeux WordGames
 * ============================================
 */

import { useState, useCallback, useMemo, Dispatch, SetStateAction } from 'react';
import type { GameType } from '../schema';

// ============================================
// TYPES
// ============================================

/**
 * État pour jeux avec sélection d'option (Definition, Blanks, Reply, Transformer, Builder)
 */
export interface OptionGameState {
  selectedOption: string | null;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
}

/**
 * État pour jeu de construction de phrase (Sentence Builder)
 */
export interface SentenceGameState {
  selectedOrder: string[];
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
}

/**
 * État pour jeu Detective (sélection d'un mot par index)
 */
export interface DetectiveGameState {
  selectedWord: number | null;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
}

/**
 * Union type pour tous les états possibles
 */
export type GameState = OptionGameState | SentenceGameState | DetectiveGameState;

/**
 * Mapping des types de jeux aux états
 * Note: 'speed' et 'audio_match' n'ont pas d'état ici car ils gèrent leur état en interne
 */
export interface AllGameStates {
  builder: OptionGameState;
  definition: OptionGameState;
  blanks: OptionGameState;
  sentence: SentenceGameState;
  detective: DetectiveGameState;
  reply: OptionGameState;
  transformer: OptionGameState;
}

/**
 * Valeur de retour du hook
 */
export interface UseGameStateReturn {
  // États individuels
  builderState: OptionGameState;
  setBuilderState: Dispatch<SetStateAction<OptionGameState>>;
  definitionState: OptionGameState;
  setDefinitionState: Dispatch<SetStateAction<OptionGameState>>;
  blanksState: OptionGameState;
  setBlanksState: Dispatch<SetStateAction<OptionGameState>>;
  sentenceState: SentenceGameState;
  setSentenceState: Dispatch<SetStateAction<SentenceGameState>>;
  detectiveState: DetectiveGameState;
  setDetectiveState: Dispatch<SetStateAction<DetectiveGameState>>;
  replyState: OptionGameState;
  setReplyState: Dispatch<SetStateAction<OptionGameState>>;
  transformerState: OptionGameState;
  setTransformerState: Dispatch<SetStateAction<OptionGameState>>;

  // Utilitaires
  resetAllStates: () => void;
  getCurrentState: () => GameState | null;
}

// ============================================
// CONSTANTS
// ============================================

const INITIAL_OPTION_STATE: OptionGameState = {
  selectedOption: null,
  isValidated: false,
  isCorrect: false,
  attemptCount: 0,
};

const INITIAL_SENTENCE_STATE: SentenceGameState = {
  selectedOrder: [],
  isValidated: false,
  isCorrect: false,
  attemptCount: 0,
};

const INITIAL_DETECTIVE_STATE: DetectiveGameState = {
  selectedWord: null,
  isValidated: false,
  isCorrect: false,
  attemptCount: 0,
};

// ============================================
// HOOK
// ============================================

/**
 * Hook de gestion des états pour les jeux WordGames
 * @param gameType - Type de jeu actuel
 */
export const useGameState = (gameType: GameType): UseGameStateReturn => {
  // États pour chaque type de jeu
  const [builderState, setBuilderState] = useState<OptionGameState>(INITIAL_OPTION_STATE);
  const [definitionState, setDefinitionState] = useState<OptionGameState>(INITIAL_OPTION_STATE);
  const [blanksState, setBlanksState] = useState<OptionGameState>(INITIAL_OPTION_STATE);
  const [sentenceState, setSentenceState] = useState<SentenceGameState>(INITIAL_SENTENCE_STATE);
  const [detectiveState, setDetectiveState] = useState<DetectiveGameState>(INITIAL_DETECTIVE_STATE);
  const [replyState, setReplyState] = useState<OptionGameState>(INITIAL_OPTION_STATE);
  const [transformerState, setTransformerState] = useState<OptionGameState>(INITIAL_OPTION_STATE);

  /**
   * Reset tous les états (appelé lors du changement de question)
   */
  const resetAllStates = useCallback(() => {
    setBuilderState(INITIAL_OPTION_STATE);
    setDefinitionState(INITIAL_OPTION_STATE);
    setBlanksState(INITIAL_OPTION_STATE);
    setSentenceState(INITIAL_SENTENCE_STATE);
    setDetectiveState(INITIAL_DETECTIVE_STATE);
    setReplyState(INITIAL_OPTION_STATE);
    setTransformerState(INITIAL_OPTION_STATE);
  }, []);

  /**
   * Objet regroupant tous les états (optimisé avec useMemo)
   */
  const allStates: AllGameStates = useMemo(
    () => ({
      builder: builderState,
      definition: definitionState,
      blanks: blanksState,
      sentence: sentenceState,
      detective: detectiveState,
      reply: replyState,
      transformer: transformerState,
    }),
    [builderState, definitionState, blanksState, sentenceState, detectiveState, replyState, transformerState]
  );

  /**
   * Retourne l'état actif selon le type de jeu
   * Note: retourne null pour les jeux sans état (speed, audio_match)
   */
  const getCurrentState = useCallback((): GameState | null => {
    if (gameType === 'speed' || gameType === 'audio_match') return null;
    return (allStates[gameType as keyof AllGameStates] as GameState) || null;
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
    detectiveState,
    setDetectiveState,
    replyState,
    setReplyState,
    transformerState,
    setTransformerState,
    resetAllStates,
    getCurrentState,
  };
};
