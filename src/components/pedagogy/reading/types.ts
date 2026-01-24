export interface ReadingQuestionData {
  text: string;           // Le texte à lire
  audio?: string;         // URL ou path de l'audio (optionnel)
  question: string;       // La question posée
  options: string[];      // Les choix [A, B, C, D]
  correctAnswer: number;  // Index de la bonne réponse (0-3)
  hint?: string;          // Indice optionnel
}

export interface ReadingState {
  selectedOption?: string; // Stocke la lettre (A, B, C...)
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
  isPlaying: boolean;
}