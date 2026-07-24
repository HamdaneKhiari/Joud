import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import { useTheme } from '@/themes/ThemeContext';
import { useExerciseValidationState } from '@/hooks/exercises/useExerciceValidationState';
import useWordGameFeedback from '@/screens/WordGames/hooks/useWordGameFeedback';
import { tokens } from '@/themes/tokens';
import { createWordGameStyles } from '../shared/commonWordGameStyles';
import type { ReplyQuestion } from '@/screens/WordGames/schema';

export interface ReplyCardProps {
  question: ReplyQuestion;
  selectedOption: string | null;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
  maxAttempts: number;
  onAnswer: (option: string) => void;
  onValidate: () => void;
  onRetry: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

const ReplyCard: React.FC<ReplyCardProps> = ({
  question,
  selectedOption,
  isValidated,
  isCorrect,
  attemptCount,
  maxAttempts,
  onAnswer,
  onValidate,
  onRetry,
  onNext,
  isLastQuestion,
}) => {
  const { identity } = useTheme();
  const baseStyles = useMemo(() => createWordGameStyles(identity), [identity]);

  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!selectedOption
  );

  const feedbackMessage = useWordGameFeedback(isValidated, isCorrect, attemptCount, maxAttempts);

  const showFeedback = isValidated && (isCorrect || canSkip);
  const isPlayful = identity.ui.mood === 'playful';

  const styles = StyleSheet.create({
    situationBox: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: identity.palette.background,
    },
    situationText: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.tertiary,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    promptBox: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
      paddingHorizontal: tokens.spacing.xl,
      paddingVertical: tokens.spacing.lg,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
      borderWidth: 2,
      borderColor: identity.palette.primary,
      backgroundColor: identity.palette.background,
    },
    promptText: {
      fontSize: isPlayful ? tokens.fontSize.xl : tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.black,
      color: identity.palette.primary,
      textAlign: 'center',
    },
    promptQuote: {
      fontSize: tokens.fontSize.xxl,
      fontWeight: tokens.fontWeight.black,
      color: identity.palette.accent,
      textAlign: 'center',
      marginBottom: tokens.spacing.xs,
    },
    instructionText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.secondary,
      textAlign: 'center',
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.md,
    },
    explanationBox: {
      marginHorizontal: tokens.spacing.xl,
      marginTop: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
      borderWidth: 1,
      borderColor: identity.palette.accent,
      backgroundColor: identity.palette.background,
    },
    explanationText: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.secondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  return (
    <ScrollView style={baseStyles.container} contentContainerStyle={baseStyles.content}>
      <View style={baseStyles.card}>
        <View style={baseStyles.colorBar} />

        <View style={baseStyles.titleSection}>
          <Text style={baseStyles.titleIcon}>💬</Text>
          <Text style={baseStyles.titleText}>Best Reply</Text>
        </View>

        {!!question.situation && (
          <View style={styles.situationBox}>
            <Text style={styles.situationText}>📍 {question.situation}</Text>
          </View>
        )}

        <View style={styles.promptBox}>
          <Text style={styles.promptQuote}>"</Text>
          <Text style={styles.promptText}>{question.prompt}</Text>
        </View>

        <Text style={styles.instructionText}>Choose the most natural reply:</Text>

        <View style={baseStyles.optionsContainer}>
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === question.correctAnswer;

            const buttonStyle = [
              baseStyles.optionButton,
              showFeedback && isCorrectOption && baseStyles.optionButtonCorrect,
              showFeedback && isSelected && !isCorrect && baseStyles.optionButtonIncorrect,
              !showFeedback && isSelected && baseStyles.optionButtonSelected,
            ];

            const textStyle = [
              baseStyles.optionText,
              (showFeedback && (isCorrectOption || (isSelected && !isCorrect))) &&
                baseStyles.optionTextWhite,
            ];

            return (
              <TouchableOpacity
                key={option}
                style={buttonStyle}
                onPress={() => !isValidated && onAnswer(option)}
                disabled={isValidated}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityLabel={option}
                accessibilityState={{ selected: isSelected, disabled: isValidated }}
              >
                <Text style={textStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showFeedback && !!question.explanation && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>💡 {question.explanation}</Text>
          </View>
        )}
      </View>

      <ExerciseValidation
        state={validationState}
        attemptCount={attemptCount}
        maxAttempts={maxAttempts}
        correctAnswer={question.correctAnswer}
        onValidate={onValidate}
        onNext={onNext}
        onRetry={onRetry}
        onSkip={onNext}
        disabled={buttonDisabled}
        isLastQuestion={isLastQuestion}
        feedbackMessage={feedbackMessage}
      />
    </ScrollView>
  );
};

export default ReplyCard;
