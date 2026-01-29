/**
 * ============================================
 * ASSESSMENT SCHEMA (TypeScript + Type Guards)
 * Types pour les questions d'évaluation
 * ============================================
 */

// ============================================
// TYPES DE BASE
// ============================================

export type AssessmentType = 'assessment_definition' | 'assessment_blanks' | 'assessment_sentence';

export type AssessmentTheme =
  | 'vocabulary'
  | 'grammar'
  | 'phrases'
  | 'conversations'
  | 'reading';

/**
 * Interface de base pour toutes les questions Assessment
 */
export interface BaseAssessmentQuestion {
  id?: string; // Généré à la volée lors de la génération
  type: AssessmentType;
  theme: AssessmentTheme;
  question: string;
  questionFr: string;
  correctAnswer: string;
  explanation: string;
  explanationFr: string;
}

/**
 * Question avec choix multiples (definition)
 * Ex: "What does 'chat' mean?" avec 4 options
 */
export interface AssessmentDefinitionQuestion extends BaseAssessmentQuestion {
  type: 'assessment_definition';
  options: string[]; // 4 options dont 1 correcte
}

/**
 * Question avec input texte (blanks)
 * Ex: "Complete: I ___ a student" → am
 */
export interface AssessmentBlanksQuestion extends BaseAssessmentQuestion {
  type: 'assessment_blanks';
  options?: string[]; // Optionnel : suggestions
}

/**
 * Question avec passage de texte (sentence)
 * Ex: Dialogue + question sur le contexte
 */
export interface AssessmentSentenceQuestion extends BaseAssessmentQuestion {
  type: 'assessment_sentence';
  passage: string; // Texte/dialogue EN
  passageFr: string; // Texte/dialogue FR
  options: string[]; // 4 options
}

/**
 * Union de tous les types de questions Assessment
 */
export type AssessmentQuestion =
  | AssessmentDefinitionQuestion
  | AssessmentBlanksQuestion
  | AssessmentSentenceQuestion;

// ============================================
// TYPE GUARDS
// ============================================

export const isAssessmentDefinitionQuestion = (
  q: AssessmentQuestion
): q is AssessmentDefinitionQuestion => q.type === 'assessment_definition';

export const isAssessmentBlanksQuestion = (
  q: AssessmentQuestion
): q is AssessmentBlanksQuestion => q.type === 'assessment_blanks';

export const isAssessmentSentenceQuestion = (
  q: AssessmentQuestion
): q is AssessmentSentenceQuestion => q.type === 'assessment_sentence';

// ============================================
// INTERFACE POOL (pour le générateur)
// ============================================

/**
 * Structure du pool de questions généré dynamiquement
 */
export interface AssessmentPool {
  id: string;
  levelId: number;
  questions: AssessmentQuestion[];
  totalQuestions: number;
  byTheme: {
    vocabulary: number;
    grammar: number;
    phrases: number;
    conversations: number;
    reading: number;
  };
}
