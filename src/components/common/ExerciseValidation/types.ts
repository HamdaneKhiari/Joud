/**
 * ============================================
 * EXERCISE VALIDATION - TYPES
 * Types TypeScript stricts pour ExerciseValidation
 * ============================================
 */

export type ValidationState = 'initial' | 'correct' | 'incorrect' | 'skip';

export interface FeedbackData {
  title: string;
  message: string;
}

export interface ExerciseValidationProps {
  state?: ValidationState;
  onValidate?: () => void;
  onNext?: () => void;
  onRetry?: () => void;
  onSkip?: () => void;
  disabled?: boolean;
  showFeedback?: boolean;
  feedbackMessage?: FeedbackData;
  isLastQuestion?: boolean;
  attemptCount?: number;
  maxAttempts?: number;
  correctAnswer?: string | null;
}

export interface FeedbackBannerProps {
  feedback: FeedbackData | null;
  state: ValidationState;
}

export interface ButtonConfig {
  icon: string;
  label: string;
  style: any; // StyleSheet style object
}
