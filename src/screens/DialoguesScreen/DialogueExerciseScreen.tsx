/**
 * DialogueExerciseScreen - Écran d'exercice dialogue WHITE LABEL
 * Migration TypeScript depuis JS
 * Support : Identity, Mood, Tracking moderne
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Composants
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import DialogueCard, { Dialogue, Question } from '@/components/pedagogy/dialogues/DialogueCard';
// TODO: Créer ExerciseValidation en TypeScript
// import ExerciseValidation from '@/components/exercise-common/ExerciseValidation';

// Hooks & Contexts
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';

// Utils
import { getModuleLabel, getLevelLabel } from '@/utils/labelMapper';

// TODO: Migrer getFamilyById vers queries DB
// TODO: Implémenter useErrorTracking ou le remplacer par un système de tracking moderne

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
}

interface NavigationProp {
  navigate?: (screen: string, params: any) => void;
  goBack?: () => void;
}

interface DialogueExerciseScreenProps {
  navigation?: NavigationProp;
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

  // =================== PARAMS & DATA ===================
  const rawFamilyId = route?.params?.familyId || expoParams.familyId || '';
  const familyId = Array.isArray(rawFamilyId) ? rawFamilyId[0] : rawFamilyId;

  const rawModuleId = route?.params?.moduleId || expoParams.moduleId || '';
  const moduleId = Array.isArray(rawModuleId) ? rawModuleId[0] : rawModuleId;

  const rawLevelId = route?.params?.levelId || expoParams.levelId || '1';
  const levelId = Array.isArray(rawLevelId) ? rawLevelId[0] : rawLevelId;
  const numLevelId = Number.parseInt(levelId.toString(), 10);

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

  // TODO: Charger dialogueFamily depuis la base de données
  // const dialogueFamily = useMemo(() => getFamilyById(moduleId, numLevelId, familyId), [moduleId, numLevelId, familyId]);
  const [dialogueFamily, setDialogueFamily] = useState<Dialogue | null>(null); // TEMPORAIRE: À remplacer par une requête DB

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

  const realProgress = getFamilyProgress(numLevelId, EXERCISE_TYPE, familyId);

  // =================== HOOKS UTILITAIRES ===================
  useExerciseActivity({
    moduleSlug: EXERCISE_TYPE, // 'dialogues'
    levelId: numLevelId,
    familyId,
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

    // Convertir l'index correctAnswer en lettre (A=0, B=1, C=2, D=3)
    const correctLetter = String.fromCharCode(65 + currentQuestion.correctAnswer);
    const isCorrect = exerciseState.selectedOption === correctLetter;

    // TODO: Implémenter tracking d'erreur pour mode voltage
    // if (!isCorrect) {
    //   const correctAnswerText = currentQuestion.options?.[currentQuestion.correctAnswer] || correctLetter;
    //   trackErrorAuto(EXERCISE_TYPE, {
    //     question: currentQuestion.question || currentQuestion.text,
    //     userAnswer: exerciseState.selectedOption,
    //     correctAnswer: correctAnswerText,
    //     ruleId: familyId,
    //   });
    // }

    setExerciseState(prev => ({
      ...prev,
      isValidated: true,
      isCorrect,
      attemptCount: prev.attemptCount + 1,
    }));
  };

  const handleNextQuestion = () => {
    trackItemCompletion(numLevelId, EXERCISE_TYPE, familyId, currentQuestionIndex, totalQuestions);

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
      return { icon: '✓', title: 'Correct', message: 'Ta réponse est juste.' };
    }
    const canSkip = exerciseState.attemptCount >= MAX_ATTEMPTS - 1;
    if (canSkip) {
      const correctAnswer = currentQuestion?.options?.[currentQuestion?.correctAnswer];
      return { icon: 'ℹ', title: 'Réponse', message: `La réponse était : ${correctAnswer}` };
    }
    return {
      icon: '✗',
      title: 'Incorrect',
      message: 'Relis le dialogue et réessaie.',
    };
  }, [
    exerciseState.isValidated,
    exerciseState.isCorrect,
    exerciseState.attemptCount,
    currentQuestion,
  ]);

  // =================== RENDER ===================

  return (
    <ExerciseLayout
      headerProps={{
        variant: 'exercise',
        onBack: safeGoBack.navigate,
        rightIcon: moduleLabel.icon || 'chatbubbles',
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
          // TODO: Remplacer par ExerciseValidation quand le composant sera migré en TypeScript
          null
          // <ExerciseValidation
          //   isValidated={exerciseState.isValidated}
          //   isCorrect={exerciseState.isCorrect}
          //   onValidate={handleValidate}
          //   onNext={handleNextQuestion}
          //   onRetry={() =>
          //     setExerciseState(prev => ({
          //       ...prev,
          //       selectedOption: null,
          //       isValidated: false,
          //     }))
          //   }
          //   onSkip={handleNextQuestion}
          //   disabled={!exerciseState.isValidated && !exerciseState.selectedOption}
          //   isLastQuestion={isLastQuestion}
          //   feedbackMessage={feedbackMessage}
          //   attemptCount={exerciseState.attemptCount}
          //   maxAttempts={MAX_ATTEMPTS}
          // />
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
