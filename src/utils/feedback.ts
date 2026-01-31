// ============================================
// UTILS: exerciseFeedback.ts
// Génère des messages de feedback standardisés pour les exercices
// ⚠️ LEGACY: Prefer using useFeedbackMessages hook for White Label feedback
// ============================================

export interface FeedbackMessage {
  icon?: string;
  title: string;
  message: string;
}

/**
 * Génère un message de feedback standardisé pour les exercices
 *
 * @param isValidated - Si la réponse a été validée
 * @param isCorrect - Si la réponse est correcte
 * @param canSkip - Si l'utilisateur peut passer la question
 * @param correctAnswer - La réponse correcte (string ou array pour phrases)
 * @param attemptCount - Nombre de tentatives effectuées
 * @param maxAttempts - Nombre maximum de tentatives
 *
 * @returns Object | null - Message de feedback avec icon, title, message
 */
export const generateFeedbackMessage = (
  isValidated: boolean,
  isCorrect: boolean,
  canSkip: boolean,
  correctAnswer: string | string[],
  attemptCount: number = 0,
  maxAttempts: number = 3
): FeedbackMessage | null => {
  if (!isValidated) {
    return null;
  }

  // Format la réponse correcte (gère string et array)
  const formattedAnswer = Array.isArray(correctAnswer)
    ? correctAnswer.join(' ')
    : correctAnswer;

  // 1. Réponse correcte
  if (isCorrect) {
    return {
      icon: '✓',
      title: 'Correct',
      message: `"${formattedAnswer}" est la bonne réponse.`,
    };
  }

  // 2. Dépassement du nombre de tentatives (skip)
  if (canSkip) {
    return {
      icon: 'ℹ',
      title: 'Réponse',
      message: `La réponse était "${formattedAnswer}".`,
    };
  }

  // 3. Réponse incorrecte (avec tentatives restantes)
  return {
    icon: '✗',
    title: `Tentative ${attemptCount + 1}/${maxAttempts}`,
    message: 'Réessaie.',
  };
};

export default generateFeedbackMessage;