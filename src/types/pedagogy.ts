/**
 * ============================================
 * PEDAGOGY - TYPES CENTRAUX
 * Types TypeScript partagés pour tous les modules pédagogiques
 * (Grammar, Vocabulary, Reading, etc.)
 * ============================================
 */

// ============================================
// TYPES GÉNÉRIQUES - PARTAGÉS PAR TOUS LES MODULES
// ============================================

/**
 * Structure d'un exercice (question + options + réponse)
 * Utilisé par Grammar, Vocabulary, Reading
 */
export interface Exercise {
  question: string;
  options: string[];
  correctAnswer: string;
}

/**
 * Données d'une leçon (règle/mot + exemples + exercice)
 * Générique pour Grammar (règle), Vocabulary (mot), Reading (texte)
 */
export interface LessonData {
  title?: string;       // Titre de la règle (ex: "Present Simple")
  rule: string;         // Explication de la règle
  simplified?: string;  // Explication vulgarisée ("En bref...")
  examples: string[];   // Exemples d'utilisation
  exercise: Exercise;   // Exercice associé
}

/**
 * État d'un exercice en cours
 * Partagé par tous les types d'exercices
 */
export interface ExerciseState {
  selectedOption: string | null;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
}

// ============================================
// TYPES SPÉCIFIQUES - MODULE GRAMMAR
// ============================================

/**
 * Structure d'une règle de grammaire
 */
export interface GrammarRule {
  id?: string;
  content: string;
  examples: string[];
  exercise: {
    question: string;
    options: string[];
    correctAnswer: string;
  };
}

/**
 * Famille de règles de grammaire
 */
export interface GrammarFamily {
  title: string;
  icon?: string;
  rules: GrammarRule[];
}

// ============================================
// TYPES SPÉCIFIQUES - MODULE VOCABULARY (Futur)
// ============================================

/**
 * Structure d'un mot de vocabulaire
 * Préparé pour le module Vocabulary/NewWordCard
 */
export interface VocabularyWord {
  id?: string;
  word: string;
  translation: string;
  examples: string[];
  exercise: Exercise;
}

/**
 * Famille de mots de vocabulaire
 * Préparé pour le module Vocabulary
 */
export interface VocabularyFamily {
  title: string;
  icon?: string;
  words: VocabularyWord[];
}
