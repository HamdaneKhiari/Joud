// LEGACY : préférer le hook useFeedbackMessages pour du feedback White Label

export interface FeedbackMessage {
  icon?: string;
  title: string;
  message: string;
}

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