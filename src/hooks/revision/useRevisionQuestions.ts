import { useState, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useCurrentLevel } from '@/contexts/CurrentLevelContext';
import { log } from '@/utils/logUtils';
import {
  getDailyReviewWords,
  getSpacedReviewWords,
  updateSpacedRepetitionResult,
  addWordToSRS,
} from '@/database/queries';
import { Content } from '@/database/schema';

export type RevisionMode = 'daily' | 'spaced';

export interface RevisionQuestion {
  id: number;
  questionText: string;
  correctAnswer: string;
  options: string[];
  word: string;
  emoji?: string;
}

interface UseRevisionQuestionsReturn {
  mode: RevisionMode | null;
  questions: RevisionQuestion[];
  currentIndex: number;
  currentQuestion: RevisionQuestion | null;
  isLoading: boolean;
  selectedAnswer: string | null;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;

  // Actions
  startSession: (mode: RevisionMode) => void;
  selectAnswer: (answer: string) => void;
  validateAnswer: () => Promise<void>;
  nextQuestion: () => void;
  retryQuestion: () => void;
  resetSession: () => void;

  // Navigation
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  totalQuestions: number;
  progress: number;

  // Résultats
  correctCount: number;
  incorrectCount: number;
  isSessionCompleted: boolean;
}

export const useRevisionQuestions = (): UseRevisionQuestionsReturn => {
  const { db, user } = useUser();
  const { currentLevel } = useCurrentLevel();
  const [mode, setMode] = useState<RevisionMode | null>(null);
  const [questions, setQuestions] = useState<RevisionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // État de la question actuelle
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  const currentQuestion = questions[currentIndex] || null;
  const totalQuestions = questions.length;
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progress = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;
  const correctCount = results.filter(r => r === true).length;
  const incorrectCount = results.filter(r => r === false).length;
  const isSessionCompleted = currentIndex >= totalQuestions && totalQuestions > 0;

  const generateDistractors = useCallback((words: Content[], correctAnswer: string, count: number = 3): string[] => {
    const distractors: string[] = [];
    const allTranslations = words
      .map(w => {
        try {
          const data = typeof w.data === 'string' ? JSON.parse(w.data) : w.data;
          return data.french || data.translation || '';
        } catch {
          return '';
        }
      })
      .filter(t => t && t !== correctAnswer);

    while (distractors.length < count && allTranslations.length > 0) {
      const randomIndex = Math.floor(Math.random() * allTranslations.length);
      const distractor = allTranslations.splice(randomIndex, 1)[0];
      if (!distractors.includes(distractor)) {
        distractors.push(distractor);
      }
    }

    // Si pas assez de mots, ajouter des distractors génériques
    const genericDistractors = ['Maison', 'Voiture', 'Livre', 'Ordinateur', 'Téléphone', 'Chat', 'Chien'];
    while (distractors.length < count) {
      const random = genericDistractors[Math.floor(Math.random() * genericDistractors.length)];
      if (!distractors.includes(random) && random !== correctAnswer) {
        distractors.push(random);
      }
    }

    return distractors.slice(0, count);
  }, []);

  // Fisher-Yates
  const shuffle = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const wordsToQuestions = useCallback((words: Content[]): RevisionQuestion[] => {
    return words.map(word => {
      try {
        const data = typeof word.data === 'string' ? JSON.parse(word.data) : word.data;
        const english = data.english || data.word || '';
        const french = data.french || data.translation || '';
        const emoji = data.emoji || '📚';

        const distractors = generateDistractors(words, french, 3);
        const options = shuffle([french, ...distractors]);

        return {
          id: word.id!,
          questionText: `Que signifie "${english}" ?`,
          correctAnswer: french,
          options,
          word: english,
          emoji,
        };
      } catch (err) {
        log.error('[useRevisionQuestions] Error parsing word:', err);
        return null;
      }
    }).filter(q => q !== null) as RevisionQuestion[];
  }, [generateDistractors]);

  const loadQuestions = useCallback(async (selectedMode: RevisionMode) => {
    if (!db || typeof db === 'number' || !user) return;

    try {
      setIsLoading(true);
      let words: Content[] = [];

      if (selectedMode === 'daily') {
        words = await getDailyReviewWords(db, user.id, user.audience, currentLevel, user.course);
      } else {
        words = await getSpacedReviewWords(db, user.id, user.course);
      }

      const generatedQuestions = wordsToQuestions(words);
      setQuestions(generatedQuestions);
      setCurrentIndex(0);
      setResults([]);
      resetQuestionState();
    } catch (err) {
      log.error('[useRevisionQuestions] Error loading questions:', err);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- resetQuestionState has stable empty deps, safe to omit
  }, [db, user, currentLevel, wordsToQuestions]);

  const resetQuestionState = useCallback(() => {
    setSelectedAnswer(null);
    setIsValidated(false);
    setIsCorrect(false);
    setAttemptCount(0);
  }, []);

  const startSession = useCallback((selectedMode: RevisionMode) => {
    setMode(selectedMode);
    loadQuestions(selectedMode);
  }, [loadQuestions]);

  const selectAnswer = useCallback((answer: string) => {
    if (!isValidated) {
      setSelectedAnswer(answer);
    }
  }, [isValidated]);

  // Ne stocke le résultat qu'une seule fois par question (1er essai)
  const validateAnswer = useCallback(async () => {
    if (!selectedAnswer || !currentQuestion || !db || !user) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setIsValidated(true);
    setAttemptCount(prev => prev + 1);

    // Ne stocker le résultat que lors du 1er essai pour éviter les doublons
    if (attemptCount === 0) {
      setResults(prev => [...prev, correct]);

      // Enregistrer l'erreur pour le Coach IA
      if (!correct) {
        try {
          await db.runAsync(
            `INSERT INTO exercise_errors (user_id, family_id, module_slug, question, user_answer, correct_answer, level, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user.id, 0, 'revision', currentQuestion.questionText, selectedAnswer, currentQuestion.correctAnswer, currentLevel, Date.now()]
          );
        } catch (e) {
          log.error('[useRevisionQuestions] Error recording:', e);
        }
      }
    }

    // Mettre à jour le système SRS
    if (mode === 'daily') {
      await addWordToSRS(db, user.id, currentQuestion.id);
    }
    await updateSpacedRepetitionResult(db, user.id, currentQuestion.id, correct);
  }, [selectedAnswer, currentQuestion, db, user, mode, attemptCount, currentLevel]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < totalQuestions) {
      setCurrentIndex(prev => prev + 1);
      resetQuestionState();
    }
  }, [currentIndex, totalQuestions, resetQuestionState]);

  const retryQuestion = useCallback(() => {
    resetQuestionState();
  }, [resetQuestionState]);

  const resetSession = useCallback(() => {
    setMode(null);
    setQuestions([]);
    setCurrentIndex(0);
    setResults([]);
    resetQuestionState();
  }, [resetQuestionState]);

  return {
    mode,
    questions,
    currentIndex,
    currentQuestion,
    isLoading,
    selectedAnswer,
    isValidated,
    isCorrect,
    attemptCount,

    startSession,
    selectAnswer,
    validateAnswer,
    nextQuestion,
    retryQuestion,
    resetSession,

    isFirstQuestion,
    isLastQuestion,
    totalQuestions,
    progress,

    correctCount,
    incorrectCount,
    isSessionCompleted,
  };
};
