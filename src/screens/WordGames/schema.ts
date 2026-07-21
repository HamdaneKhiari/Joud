export type GameType =
  | 'definition'    // Trouver la définition d'un mot
  | 'blanks'        // Compléter une phrase à trous
  | 'sentence'      // Remettre des mots dans l'ordre
  | 'speed'         // Associer rapidement anglais-français
  | 'detective'     // Trouver l'erreur dans une phrase
  | 'audio_match'   // Associer le son (TTS) à l'image/mot
  | 'reply'         // Choisir la réponse la plus naturelle à une phrase
  | 'transformer';  // Choisir la bonne déclinaison d'un mot racine

export type Difficulty = 'easy' | 'medium' | 'hard';

interface BaseGameQuestion {
  type: GameType;
  difficulty: Difficulty;
}

/**
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
 * Syntax Master : l'utilisateur doit remettre des mots dans le bon ordre
 */
export interface SentenceQuestion extends BaseGameQuestion {
  type: 'sentence';
  words: string[];                 // Mots dans le désordre
  correctOrder: string[];          // Ordre correct
  translation: string;             // Traduction FR pour vérification
  hint?: string;                   // Indice (ex: "Commence par 'I'")
}

/**
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
 * L'utilisateur entend un mot (TTS) et l'associe à son image/label.
 * Variante du Speed Match : colonne gauche = boutons Play, colonne droite = images mélangées.
 */
export interface AudioMatchQuestion extends BaseGameQuestion {
  type: 'audio_match';
  pairs: Array<{
    word: string;                  // Mot prononcé via TTS
    image: string;                 // Emoji ou label visuel à associer
  }>;
  timeLimit: number;               // Temps limite en secondes (ex: 30)
}

/**
 * Une phrase de contexte est donnée, l'utilisateur choisit la réponse la plus naturelle parmi 4.
 */
export interface ReplyQuestion extends BaseGameQuestion {
  type: 'reply';
  situation?: string;              // Contexte optionnel (ex: "You're meeting someone for the first time")
  prompt: string;                  // La phrase à laquelle répondre (ex: "How are you?")
  options: string[];               // 4 réponses possibles
  correctAnswer: string;           // La réponse la plus naturelle (doit être dans options)
  explanation?: string;            // Explication du choix (optionnel)
}

/**
 * Un mot racine est affiché, l'utilisateur choisit la bonne déclinaison pour compléter une phrase.
 * Variante du Blanks : met l'accent sur la morphologie du mot.
 */
export interface TransformerQuestion extends BaseGameQuestion {
  type: 'transformer';
  rootWord: string;                // Mot racine affiché en gros (ex: "WORK")
  sentence: string;                // Phrase avec un trou ___ (ex: "He is ____ now")
  options: string[];               // 4 formes possibles (working, works, worked, work)
  correctAnswer: string;           // La bonne forme
  hint?: string;                   // Indice grammatical (ex: "Present continuous")
  translation?: string;            // Traduction FR de la phrase complète
}

export type GameQuestion =
  | DefinitionQuestion
  | BlanksQuestion
  | SentenceQuestion
  | SpeedMatchQuestion
  | DetectiveQuestion
  | AudioMatchQuestion
  | ReplyQuestion
  | TransformerQuestion;

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

export const isAudioMatchQuestion = (q: GameQuestion): q is AudioMatchQuestion =>
  q.type === 'audio_match';

export const isReplyQuestion = (q: GameQuestion): q is ReplyQuestion =>
  q.type === 'reply';

export const isTransformerQuestion = (q: GameQuestion): q is TransformerQuestion =>
  q.type === 'transformer';
