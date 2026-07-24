import React, { useState, useMemo, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import DialogueReaderCard from '@/components/pedagogy/dialogues/DialogueReaderCard';
import DialogueQuestionCard from '@/components/pedagogy/dialogues/DialogueQuestionCard';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import CompletionModal from '@/components/common/CompletionModal';
import ExerciseLoadingState from '@/components/common/ExerciseLoadingState';
import ExerciseEmptyState from '@/components/common/ExerciseEmptyState';
import type { ValidationState } from '@/components/common/ExerciseValidation/types';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import useFirstIncompleteIndex from '@/hooks/exercises/useFirstIncompleteIndex';
import useExerciseCompletion from '@/hooks/exercises/useExerciseCompletion';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import { useRecordError } from '@/hooks/exercises/useRecordError';
import { useDialogueContent } from './hooks/useDialogueContent';
import { getModuleLabel, getLevelLabel } from '@/utils/labelMapper';
import { makeCompositeFamilyId } from '@/contexts/progressUtils';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

const EXERCISE_TYPE = 'dialogues';
const MAX_ATTEMPTS = 2;

interface DialogueExerciseParams {
  familyId?: string;
  levelId?: string;
  subfamilyId?: string;
}

interface ExerciseState {
  selectedOption: string | null;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
}

const DialogueExerciseScreen: React.FC = () => {
  const params = useLocalSearchParams() as unknown as DialogueExerciseParams;
  const { identity } = useTheme();
  const { db } = useUser();
  const { recordError } = useRecordError();

  const familyId = params.familyId || '';
  const numLevelId = Number.parseInt(params.levelId || '1', 10);
  const numSubfamilyId = Number.parseInt(params.subfamilyId || '1', 10);
  const compositeFamilyId = makeCompositeFamilyId(familyId, numSubfamilyId);

  const { trackItemCompletion, getFamilyProgress } = useProgress();
  const { showCompletion, complete } = useExerciseCompletion();

  const safeGoBack = useSafeNavigation();

  const { dialogue: dialogueFamily, isLoading: isDialogueLoading } = useDialogueContent(db, familyId, numSubfamilyId);

  const [levelLabel, setLevelLabel] = useState({ badge: '', title: '', description: '' });
  const [moduleLabel, setModuleLabel] = useState({ title: '', icon: '', description: '' });

  useEffect(() => {
    const loadLabels = async () => {
      if (db) {
        setLevelLabel(await getLevelLabel(db, numLevelId, identity.id));
        setModuleLabel(await getModuleLabel(db, EXERCISE_TYPE, identity.id));
      }
    };
    loadLabels();
  }, [db, numLevelId, identity.id]);

  const [phase, setPhase] = useState<'dialogue' | 'questions'>('dialogue');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0,
  });

  const questions = dialogueFamily?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  const messages = dialogueFamily?.messages || [];
  const totalMessages = messages.length;
  const isLastMessage = currentMessageIndex === totalMessages - 1;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const realProgress = getFamilyProgress(numLevelId, EXERCISE_TYPE, compositeFamilyId);

  // Reprise : si des questions ont déjà été complétées, on saute directement en phase questions
  const getInitialQuestionIndex = useFirstIncompleteIndex(numLevelId, EXERCISE_TYPE, compositeFamilyId, totalQuestions);
  useEffect(() => {
    if (totalQuestions > 0) {
      const idx = getInitialQuestionIndex();
      if (idx > 0) {
        setCurrentQuestionIndex(idx);
        setPhase('questions');
      }
    }
  }, [totalQuestions, getInitialQuestionIndex]);

  const validationState: ValidationState = useMemo(() => {
    if (!exerciseState.isValidated) return 'initial';
    if (exerciseState.isCorrect) return 'correct';
    if (exerciseState.attemptCount >= MAX_ATTEMPTS) return 'skip';
    return 'incorrect';
  }, [exerciseState.isValidated, exerciseState.isCorrect, exerciseState.attemptCount]);

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

  const handleAnswer = (option: string) => {
    if (exerciseState.isValidated) return;
    setExerciseState(prev => ({ ...prev, selectedOption: option }));
  };

  const handleValidate = () => {
    if (!exerciseState.selectedOption || !currentQuestion) return;
    const correctLetter = String.fromCodePoint(65 + currentQuestion.correctAnswer);
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
      ...prev, isValidated: true, isCorrect, attemptCount: prev.attemptCount + 1,
    }));
  };

  const handleRetry = () => {
    setExerciseState(prev => ({ ...prev, selectedOption: null, isValidated: false }));
  };

  const handleNextQuestion = () => {
    trackItemCompletion(numLevelId, EXERCISE_TYPE, compositeFamilyId, currentQuestionIndex, totalQuestions);
    if (isLastQuestion) {
      complete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setExerciseState({ selectedOption: null, isValidated: false, isCorrect: false, attemptCount: 0 });
    }
  };

  const feedbackMessage = useMemo(() => {
    if (!exerciseState.isValidated) return null;
    if (exerciseState.isCorrect) return { title: 'Correct', message: 'Ta réponse est juste.' };
    if (exerciseState.attemptCount >= MAX_ATTEMPTS) {
      const correctAnswer = currentQuestion?.options?.[currentQuestion?.correctAnswer];
      return { title: 'Réponse', message: `La réponse était : ${correctAnswer}` };
    }
    return { title: 'Incorrect', message: 'Relis le dialogue et réessaie.' };
  }, [exerciseState.isValidated, exerciseState.isCorrect, exerciseState.attemptCount, currentQuestion]);

  if (isDialogueLoading) {
    return <ExerciseLoadingState onBack={() => { safeGoBack.navigate(); }} />;
  }

  if (!dialogueFamily) {
    return (
      <ExerciseEmptyState onBack={() => { safeGoBack.navigate(); }} headerTitle="Dialogue" />
    );
  }

  return (
    <>
      <CompletionModal
        visible={showCompletion}
        title="Dialogue complete!"
        subtitle="Bien joué, tu as terminé toutes les questions."
        onDone={() => safeGoBack.navigate()}
      />
      <ExerciseLayout
      headerProps={{
        variant: 'exercise',
        onBack: () => { safeGoBack.navigate(); },
        rightIcon: <DynamicIcon name={moduleLabel.icon || 'message-text'} size={28} color={identity.header?.accent || identity.palette.primary} fallback="message-text" />,
        showLevelBadge: true,
        levelTitle: levelLabel.badge,
        exerciseTitle: dialogueFamily?.name || dialogueFamily?.title || 'Dialogue',
      }}
      progressProps={{
        progressPercent: realProgress,
        progressText: phase === 'dialogue'
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
        <DialogueReaderCard
          key="dialogue_mode"
          dialogue={dialogueFamily}
          currentMessageIndex={currentMessageIndex}
          onPreviousMessage={() => currentMessageIndex > 0 && setCurrentMessageIndex(prev => prev - 1)}
          onNextMessage={() => isLastMessage ? setPhase('questions') : setCurrentMessageIndex(prev => prev + 1)}
          isLastMessage={isLastMessage}
          totalMessages={totalMessages}
        />
      ) : (
        <>
          <TouchableOpacity
            onPress={() => { setPhase('dialogue'); setCurrentMessageIndex(0); }}
            style={styles.relireButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Relire le dialogue"
          >
            <Text style={[styles.relireText, { color: identity.palette.primary }]}>
              ↩ Relire le dialogue
            </Text>
          </TouchableOpacity>
          <DialogueQuestionCard
            key="question_mode"
            question={currentQuestion}
            selectedOption={exerciseState.selectedOption || undefined}
            isValidated={exerciseState.isValidated}
            isCorrect={exerciseState.isCorrect}
            onAnswer={handleAnswer}
            color={dialogueFamily?.color || identity.palette.primary}
          />
        </>
      )}
      </ExerciseLayout>
    </>
  );
};

const styles = StyleSheet.create({
  relireButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  relireText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default DialogueExerciseScreen;
