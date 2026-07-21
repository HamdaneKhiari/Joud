export interface ReadingQuestionData {
  text: string;
  audio?: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index de la bonne réponse, pas la valeur
  hint?: string;
}

export interface ReadingState {
  selectedOption?: string; // Stocke la lettre (A, B, C...), pas le texte de l'option
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
  isPlaying: boolean;
}