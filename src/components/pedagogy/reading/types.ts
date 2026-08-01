export interface ReadingState {
  selectedOption?: string; // Stocke la lettre (A, B, C...), pas le texte de l'option
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
  isPlaying: boolean;
}