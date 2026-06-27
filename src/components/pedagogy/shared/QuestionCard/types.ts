// ============================================
// types.ts - Types mis à jour
// ============================================

export type ModuleType = 'reading' | 'vocab' | 'phrase_types' | 'dialogue' | 'dialogues';

// 🆕 Interface i18n pour les textes
export interface QuestionCardI18n {
  hintShow: string;
  hintHide: string;
}

export interface QuestionCardProps {
  questionIndex?: number;
  question: string;
  options: string[];
  correctAnswer: string;
  moduleType?: ModuleType;
  moduleColor?: string;

  // Contrôle parent
  externalSelectedOption?: string | null;
  externalIsAnswered?: boolean;
  externalShowFeedback?: boolean;
  externalIsCorrect?: boolean;
  onAnswer: (option: string) => void;

  // Options
  hint?: string;
  hintUsed?: boolean;
  onToggleHint?: () => void;
  feedbackMessage?: string;

  // 🆕 i18n optionnel (override de identity.i18n si besoin)
  i18n?: QuestionCardI18n;
}