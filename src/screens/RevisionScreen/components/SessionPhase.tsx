import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ExerciseLayout from '@/components/layout/ExerciceLayout/ExerciseLayout';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import RevisionQuestionCard from '@/components/pedagogy/revision/RevisionQuestionCard';
import { tokens } from '@/themes/tokens';
import { Identity } from '@/themes/ThemeContext';
import type { RevisionQuestion } from '@/hooks/revision/useRevisionQuestions';
import type { ValidationState } from '@/components/common/ExerciseValidation/types';

interface SessionPhaseProps {
  identity: Identity;
  mode: 'daily' | 'spaced' | null;
  isLoading: boolean;
  currentQuestion: RevisionQuestion | null;
  selectedAnswer: string | null;
  isValidated: boolean;
  isCorrect: boolean;
  currentIndex: number;
  totalQuestions: number;
  progress: number;
  isLastQuestion: boolean;
  validationState: ValidationState;
  buttonDisabled: boolean;
  onBack: () => void;
  onSelectAnswer: (answer: string) => void;
  onValidate: () => void;
  onNext: () => void;
  onRetry: () => void;
}

const SessionPhase: React.FC<SessionPhaseProps> = ({
  identity,
  mode,
  isLoading,
  currentQuestion,
  selectedAnswer,
  isValidated,
  isCorrect,
  currentIndex,
  totalQuestions,
  progress,
  isLastQuestion,
  validationState,
  buttonDisabled,
  onBack,
  onSelectAnswer,
  onValidate,
  onNext,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: identity.palette.surface,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={identity.palette.primary} />
        <Text
          style={{
            marginTop: tokens.spacing.md,
            color: identity.text.secondary,
            fontSize: tokens.fontSize.base,
          }}
        >
          Chargement...
        </Text>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: identity.palette.surface,
          justifyContent: 'center',
          alignItems: 'center',
          padding: tokens.spacing.xl,
        }}
      >
        <Text
          style={{
            fontSize: tokens.fontSize.xl,
            fontWeight: tokens.fontWeight.bold,
            color: identity.text.primary,
            marginBottom: tokens.spacing.md,
            textAlign: 'center',
          }}
        >
          Aucun mot disponible
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: identity.palette.background }}>
      <ExerciseLayout
        headerProps={{
          variant: 'exercise',
          onBack,
          rightIcon: mode === 'daily' ? '🌅' : '🔄',
          exerciseTitle: mode === 'daily' ? 'Révision quotidienne' : 'Révision espacée',
          showLevelBadge: true,
          levelTitle: `${currentIndex + 1}/${totalQuestions}`,
        }}
        progressProps={{
          progressPercent: progress,
          progressText: `${currentIndex + 1} / ${totalQuestions}`,
        }}
        footer={
          <ExerciseValidation
            state={validationState}
            onValidate={onValidate}
            onNext={onNext}
            onRetry={onRetry}
            disabled={buttonDisabled}
            isLastQuestion={isLastQuestion}
          />
        }
      >
        <ScrollView contentContainerStyle={{ padding: tokens.spacing.xl }}>
          <Animated.View entering={FadeInDown.springify()}>
            <RevisionQuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              isValidated={isValidated}
              isCorrect={isCorrect}
              onSelectAnswer={onSelectAnswer}
            />
          </Animated.View>
        </ScrollView>
      </ExerciseLayout>
    </View>
  );
};

export default SessionPhase;
