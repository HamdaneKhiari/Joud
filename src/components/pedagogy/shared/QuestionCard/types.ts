/**
 * ============================================
 * QUESTION CARD - TYPES
 * Types TypeScript pour QuestionCard universel
 * ============================================
 */

export type ModuleType = 'grammar' | 'reading' | 'vocab';
export type Theme = 'light' | 'dark';

export interface QuestionCardProps {
  // Props de base
  questionIndex: number;
  question: string;
  options: string[];
  correctAnswer: string;
  moduleType?: ModuleType;

  // Props de contrôle (du parent)
  externalSelectedOption?: string | null;
  externalIsAnswered?: boolean;
  externalShowFeedback?: boolean;
  externalIsCorrect?: boolean;
  onAnswer: (letter: string) => void;

  // Props optionnels
  stars?: number;
  showStars?: boolean;
  hint?: string;
  hintUsed?: boolean;
  onToggleHint?: () => void;
  feedbackMessage?: string;
  theme?: Theme;
}
