/**
 * ============================================
 * WORD GAMES - SCHEMA TYPESCRIPT
 * Types pour tous les jeux de mots (White Label)
 * ============================================
 */

// ============================================
// TYPES DE BASE
// ============================================

/**
 * Types de jeux disponibles
 */
export type GameType =
  | 'definition'  // Trouver la définition d'un mot
  | 'blanks'      // Compléter une phrase à trous
  | 'sentence'    // Remettre des mots dans l'ordre
  | 'speed'       // Associer rapidement anglais-français
  | 'detective'   // Trouver l'erreur dans une phrase
  | 'idioms';     // Comprendre des expressions idiomatiques

/**
 * Niveaux de difficulté
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Question de base (propriétés communes)
 */
interface BaseGameQuestion {
  type: GameType;
  difficulty: Difficulty;
}

// ============================================
// TYPES SPÉCIFIQUES PAR JEU
// ============================================

/**
 * DEFINITION GAME
 * L'utilisateur doit choisir la bonne définition d'un mot
 */
export interface DefinitionQuestion extends BaseGameQuestion {
  type: 'definition';
  word: string;                    // Mot à définir (ex: "Croissant")
  definition: string;              // Définition correcte
  options: string[];               // 4 options de réponse
  correctAnswer: string;           // La bonne réponse (doit être dans options)
  image?: string;                  // Emoji ou URL d'image (ex: "🥐")
  context?: string;                // Phrase d'exemple (optionnel)
}

/**
 * BLANKS GAME
 * L'utilisateur doit compléter une phrase à trous
 */
export interface BlanksQuestion extends BaseGameQuestion {
  type: 'blanks';
  sentence: string;                // Phrase avec un trou marqué par ___
  options: string[];               // 4 mots proposés
  correctAnswer: string;           // Le bon mot
  hint?: string;                   // Indice optionnel (ex: "verbe au présent")
  translation?: string;            // Traduction FR (optionnel)
}

/**
 * SENTENCE BUILDER GAME (Syntax Master)
 * L'utilisateur doit remettre des mots dans le bon ordre
 */
export interface SentenceQuestion extends BaseGameQuestion {
  type: 'sentence';
  words: string[];                 // Mots dans le désordre
  correctOrder: string[];          // Ordre correct
  translation: string;             // Traduction FR pour vérification
  hint?: string;                   // Indice (ex: "Commence par 'I'")
}

/**
 * SPEED MATCH GAME
 * L'utilisateur doit associer rapidement des mots anglais-français
 */
export interface SpeedMatchQuestion extends BaseGameQuestion {
  type: 'speed';
  pairs: Array<{
    english: string;
    french: string;
  }>;
  timeLimit: number;               // Temps limite en secondes (ex: 30)
}

/**
 * DETECTIVE GAME
 * L'utilisateur doit trouver l'erreur dans une phrase
 */
export interface DetectiveQuestion extends BaseGameQuestion {
  type: 'detective';
  sentence: string;                // Phrase avec une erreur
  errorWordIndex: number;          // Index du mot incorrect (dans sentence.split(' '))
  correctWord: string;             // Le mot correct
  explanation: string;             // Explication de l'erreur
}

/**
 * IDIOMS GAME
 * L'utilisateur doit comprendre le sens d'une expression idiomatique
 */
export interface IdiomsQuestion extends BaseGameQuestion {
  type: 'idioms';
  idiom: string;                   // Expression (ex: "Break a leg")
  options: string[];               // 4 significations possibles
  correctAnswer: string;           // La bonne signification
  example: string;                 // Phrase d'exemple utilisant l'idiome
  literalTranslation?: string;     // Traduction littérale (pour humour)
}

// ============================================
// UNION TYPE
// ============================================

/**
 * Type union pour toutes les questions possibles
 * Utilisé par useExerciseContent<GameQuestion>
 */
export type GameQuestion =
  | DefinitionQuestion
  | BlanksQuestion
  | SentenceQuestion
  | SpeedMatchQuestion
  | DetectiveQuestion
  | IdiomsQuestion;

// ============================================
// TYPE GUARDS (pour vérification de type)
// ============================================

export const isDefinitionQuestion = (q: GameQuestion): q is DefinitionQuestion =>
  q.type === 'definition';

export const isBlanksQuestion = (q: GameQuestion): q is BlanksQuestion =>
  q.type === 'blanks';

export const isSentenceQuestion = (q: GameQuestion): q is SentenceQuestion =>
  q.type === 'sentence';

export const isSpeedMatchQuestion = (q: GameQuestion): q is SpeedMatchQuestion =>
  q.type === 'speed';

export const isDetectiveQuestion = (q: GameQuestion): q is DetectiveQuestion =>
  q.type === 'detective';

export const isIdiomsQuestion = (q: GameQuestion): q is IdiomsQuestion =>
  q.type === 'idioms';
