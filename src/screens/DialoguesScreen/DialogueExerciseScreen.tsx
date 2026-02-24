/**
 * DialogueExerciseScreen - Écran d'exercice dialogue WHITE LABEL
 * TypeScript complet avec ExerciseValidation + chargement DB
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Composants
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import DialogueCard, { Dialogue, Question } from '@/components/pedagogy/dialogues/DialogueCard';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import type { ValidationState } from '@/components/common/ExerciseValidation/types';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import { useRecordError } from '@/hooks/exercises/useRecordError';

// Utils
import { getModuleLabel, getLevelLabel } from '@/utils/labelMapper';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { log } from '@/utils/logUtils';

// ============================================
// CONSTANTS
// ============================================

const EXERCISE_TYPE = 'dialogues';
const MAX_ATTEMPTS = 2;

// ============================================
// TYPES
// ============================================

interface RouteParams {
  familyId?: string;
  moduleId?: string;
  levelId?: string;
  subfamilyId?: string;
}

interface DialogueExerciseScreenProps {
  navigation?: {
    navigate?: (screen: string, params: any) => void;
    goBack?: () => void;
  };
  route?: {
    params?: RouteParams;
  };
}

interface ExerciseState {
  selectedOption: string | null;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
}

// ============================================
// COMPOSANT
// ============================================

const DialogueExerciseScreen: React.FC<DialogueExerciseScreenProps> = ({
  navigation,
  route
}) => {
  const router = useRouter();
  const expoParams = useLocalSearchParams() as unknown as RouteParams;
  const { identity } = useTheme();
  const { db } = useUser();
  const { recordError } = useRecordError();

  // =================== PARAMS ===================
  const rawFamilyId = route?.params?.familyId || expoParams.familyId || '';
  const familyId = Array.isArray(rawFamilyId) ? rawFamilyId[0] : rawFamilyId;

  const rawLevelId = route?.params?.levelId || expoParams.levelId || '1';
  const levelId = Array.isArray(rawLevelId) ? rawLevelId[0] : rawLevelId;
  const numLevelId = Number.parseInt(levelId.toString(), 10);

  const rawSubfamilyId = route?.params?.subfamilyId || expoParams.subfamilyId || '1';
  const subfamilyId = Array.isArray(rawSubfamilyId) ? rawSubfamilyId[0] : rawSubfamilyId;
  const numSubfamilyId = Number.parseInt(subfamilyId.toString(), 10);
  const compositeFamilyId = `${familyId}-${numSubfamilyId}`;

  // Hooks
  const { trackItemCompletion, getFamilyProgress } = useProgress();

  const safeGoBack = useSafeNavigation(
    useCallback(() => {
      if (navigation?.goBack) {
        navigation.goBack();
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }, [navigation, router])
  );

  // =================== CHARGEMENT DIALOGUE DEPUIS DB ===================
  const [dialogueFamily, setDialogueFamily] = useState<Dialogue | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    const loadDialogue = async () => {
      if (!db || typeof db === 'number' || !familyId) {
        setIsLoadingContent(false);
        return;
      }

      try {
        setIsLoadingContent(true);
        const numFamilyId = Number.parseInt(String(familyId), 10);

        log.debug('[DialogueExercise] Loading:', { familyId, numFamilyId, numSubfamilyId, db: !!db });

        // Charger les contenus dialogue depuis la DB
        const rows = await db.getAllAsync<{ id: number; data: string }>(
          `SELECT id, data FROM content
           WHERE family_id = ? AND subfamily_id = ? AND content_type = 'dialogue'
           ORDER BY id`,
          [numFamilyId, numSubfamilyId]
        );

        log.debug('[DialogueExercise] Rows found:', rows.length);

        if (rows.length > 0) {
          // Chaque row.data contient un dialogue JSON
          const rawData = JSON.parse(rows[0].data);

          // Charger le nom de la famille
          const family = await db.getFirstAsync<{ name: string; icon: string }>(
            `SELECT name, icon FROM families WHERE id = ?`,
            [numFamilyId]
          );

          // === DATA MAPPING ===
          // Migration 036 uses "dialogue" array, interface expects "messages"
          const rawMessages = rawData.messages || rawData.dialogue || [];

          // Extract unique speakers to build characters with colors
          const speakerColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63'];
          const uniqueSpeakers: string[] = [];
          rawMessages.forEach((msg: any) => {
            if (msg.speaker && !uniqueSpeakers.includes(msg.speaker)) {
              uniqueSpeakers.push(msg.speaker);
            }
          });
          const characters = rawData.characters || uniqueSpeakers.map((name: string, i: number) => ({
            name,
            color: speakerColors[i % speakerColors.length],
          }));

          // Map questions: correct_answer can be a string (value) or number (index)
          const rawQuestions = rawData.questions || [];
          const mappedQuestions: Question[] = rawQuestions.map((q: any) => {
            let correctIndex = 0;
            if (typeof q.correctAnswer === 'number') {
              correctIndex = q.correctAnswer;
            } else if (typeof q.correct_answer === 'number') {
              correctIndex = q.correct_answer;
            } else if (typeof q.correct_answer === 'string' && q.options) {
              const idx = q.options.indexOf(q.correct_answer);
              correctIndex = idx >= 0 ? idx : 0;
            }
            return {
              question: q.question || q.text || '',
              options: q.options || [],
              correctAnswer: correctIndex,
              hint: q.hint,
            };
          });

          setDialogueFamily({
            name: rawData.name || rawData.title || family?.name || 'Dialogue',
            title: rawData.title,
            icon: rawData.icon || family?.icon || '💬',
            color: rawData.color,
            characters,
            messages: rawMessages,
            questions: mappedQuestions,
          });
        }
      } catch (e) {
        console.error('[DialogueExercise] Load error:', e);
      } finally {
        setIsLoadingContent(false);
      }
    };

    loadDialogue();
  }, [db, familyId, numSubfamilyId]);

  // Labels depuis DB
  const [levelLabel, setLevelLabel] = useState({ badge: '', title: '', description: '' });
  const [moduleLabel, setModuleLabel] = useState({ title: '', icon: '', description: '' });

  useEffect(() => {
    const loadLabels = async () => {
      if (db) {
        const lLabel = await getLevelLabel(db, numLevelId, identity.id);
        setLevelLabel(lLabel);

        const mLabel = await getModuleLabel(db, EXERCISE_TYPE, identity.id);
        setModuleLabel(mLabel);
      }
    };
    loadLabels();
  }, [db, numLevelId, identity.id]);

  // =================== STATE ===================
  const [phase, setPhase] = useState<'dialogue' | 'questions'>('dialogue');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    selectedOption: null,
    isValidated: false,
    isCorrect: false,
    attemptCount: 0,
  });

  // =================== LOGIQUE MÉTIER ===================
  const questions = dialogueFamily?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  const messages = dialogueFamily?.messages || [];
  const totalMessages = messages.length;
  const isLastMessage = currentMessageIndex === totalMessages - 1;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const realProgress = getFamilyProgress(numLevelId, EXERCISE_TYPE, compositeFamilyId);

  // =================== VALIDATION STATE pour ExerciseValidation ===================
  const validationState: ValidationState = useMemo(() => {
    if (!exerciseState.isValidated) return 'initial';
    if (exerciseState.isCorrect) return 'correct';
    if (exerciseState.attemptCount >= MAX_ATTEMPTS) return 'skip';
    return 'incorrect';
  }, [exerciseState.isValidated, exerciseState.isCorrect, exerciseState.attemptCount]);

  // =================== HOOKS UTILITAIRES ===================
  useExerciseActivity({
    moduleSlug: EXERCISE_TYPE,
    levelId: numLevelId,
    familyId: compositeFamilyId,
    familyName: dialogueFamily?.name || dialogueFamily?.title || 'Dialogue',
    icon: dialogueFamily?.icon || '💬',
    currentIndex: phase === 'dialogue' ? currentMessageIndex : currentQuestionIndex,
    totalItems: phase === 'dialogue' ? totalMessages : totalQuestions,
    enabled: !!dialogueFamily,
  });

  useExerciseSaveOnUnmount();

  // =================== HANDLERS ===================

  const handleAnswer = (option: string) => {
    if (exerciseState.isValidated) return;
    setExerciseState(prev => ({ ...prev, selectedOption: option }));
  };

  const handleValidate = () => {
    if (!exerciseState.selectedOption || !currentQuestion) return;

    const correctLetter = String.fromCharCode(65 + currentQuestion.correctAnswer);
    const isCorrect = exerciseState.selectedOption === correctLetter;

    if (!isCorrect) {
      const correctAnswerText = currentQuestion.options?.[currentQuestion.correctAnswer] || correctLetter;
      recordError({
        familyId,
        moduleSlug: EXERCISE_TYPE,
        question: currentQuestion.question || currentQuestion.text || '',
        userAnswer: exerciseState.selectedOption,
        correctAnswer: correctAnswerText,
        level: numLevelId,
      });
    }

    setExerciseState(prev => ({
      ...prev,
      isValidated: true,
      isCorrect,
      attemptCount: prev.attemptCount + 1,
    }));
  };

  const handleRetry = () => {
    setExerciseState(prev => ({
      ...prev,
      selectedOption: null,
      isValidated: false,
    }));
  };

  const handleNextQuestion = () => {
    trackItemCompletion(numLevelId, EXERCISE_TYPE, compositeFamilyId, currentQuestionIndex, totalQuestions);

    if (isLastQuestion) {
      safeGoBack.navigate();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setExerciseState({
        selectedOption: null,
        isValidated: false,
        isCorrect: false,
        attemptCount: 0,
      });
    }
  };

  // =================== FEEDBACK ===================

  const feedbackMessage = useMemo(() => {
    if (!exerciseState.isValidated) return null;
    if (exerciseState.isCorrect) {
      return { title: 'Correct', message: 'Ta réponse est juste.' };
    }
    if (exerciseState.attemptCount >= MAX_ATTEMPTS) {
      const correctAnswer = currentQuestion?.options?.[currentQuestion?.correctAnswer];
      return { title: 'Réponse', message: `La réponse était : ${correctAnswer}` };
    }
    return { title: 'Incorrect', message: 'Relis le dialogue et réessaie.' };
  }, [exerciseState.isValidated, exerciseState.isCorrect, exerciseState.attemptCount, currentQuestion]);

  // =================== RENDER ===================

  return (
    <ExerciseLayout
      headerProps={{
        variant: 'exercise',
        onBack: safeGoBack.navigate,
        rightIcon: <DynamicIcon name={moduleLabel.icon || 'chatbubbles'} size={28} color={identity.header?.accent || identity.palette.primary} fallback="chatbubbles" />,
        showLevelBadge: true,
        levelTitle: levelLabel.badge,
        exerciseTitle: dialogueFamily?.name || dialogueFamily?.title || 'Dialogue',
      }}
      progressProps={{
        progressPercent: realProgress,
        progressText:
          phase === 'dialogue'
            ? `Lecture • ${currentMessageIndex + 1}/${totalMessages}`
            : `Questions • ${currentQuestionIndex + 1}/${totalQuestions}`,
      }}
      footer={
        phase === 'questions' ? (
          <ExerciseValidation
            state={validationState}
            onValidate={handleValidate}
            onNext={handleNextQuestion}
            onRetry={handleRetry}
            onSkip={handleNextQuestion}
            disabled={!exerciseState.isValidated && !exerciseState.selectedOption}
            isLastQuestion={isLastQuestion}
            feedbackMessage={feedbackMessage}
            attemptCount={exerciseState.attemptCount}
            maxAttempts={MAX_ATTEMPTS}
            correctAnswer={currentQuestion?.options?.[currentQuestion?.correctAnswer] || null}
          />
        ) : null
      }
    >
      {phase === 'dialogue' ? (
        <DialogueCard
          key="dialogue_mode"
          dialogue={dialogueFamily || undefined}
          currentMessageIndex={currentMessageIndex}
          onPreviousMessage={() =>
            currentMessageIndex > 0 && setCurrentMessageIndex(prev => prev - 1)
          }
          onNextMessage={() =>
            isLastMessage ? setPhase('questions') : setCurrentMessageIndex(prev => prev + 1)
          }
          isLastMessage={isLastMessage}
          totalMessages={totalMessages}
        />
      ) : (
        <DialogueCard
          key="question_mode"
          question={currentQuestion}
          selectedOption={exerciseState.selectedOption || undefined}
          isValidated={exerciseState.isValidated}
          isCorrect={exerciseState.isCorrect}
          onAnswer={handleAnswer}
          color={dialogueFamily?.color || identity.palette.primary}
        />
      )}
    </ExerciseLayout>
  );
};

export default DialogueExerciseScreen;
