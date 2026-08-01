export type ModuleType = 'reading' | 'vocab' | 'phrase_types' | 'dialogue' | 'dialogues';

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
  feedbackMessage?: string;
}