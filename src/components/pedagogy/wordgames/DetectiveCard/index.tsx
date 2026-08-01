import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import { useTheme } from '@/themes/ThemeContext';
import { useExerciseValidationState } from '@/hooks/exercises/useExerciceValidationState';
import useWordGameFeedback from '@/screens/WordGames/hooks/useWordGameFeedback';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';
import { createWordGameStyles } from '../shared/commonWordGameStyles';
import type { DetectiveQuestion } from '@/screens/WordGames/schema';

export interface DetectiveCardProps {
  question: DetectiveQuestion;
  selectedWord: number | null;
  isValidated: boolean;
  isCorrect: boolean;
  attemptCount: number;
  maxAttempts: number;
  onAnswer: (wordIndex: number) => void;
  onValidate: () => void;
  onRetry: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

const DetectiveCard: React.FC<DetectiveCardProps> = ({
  question,
  selectedWord,
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
    selectedWord !== null && selectedWord !== undefined
  );

  const feedbackMessage = useWordGameFeedback(isValidated, isCorrect, attemptCount, maxAttempts);

  const words = question.sentence.split(' ');
  const errorIndex = question.errorWordIndex;

  const handleWordPress = (wordIndex: number) => {
    if (!isValidated) {
      onAnswer(wordIndex);
    }
  };

  const isPlayful = identity.ui.mood === 'playful';
  const showFeedback = isValidated && (isCorrect || canSkip);

  const styles = StyleSheet.create({
    instructionBox: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: identity.palette.accent,
      backgroundColor: identity.palette.background,
    },

    instructionText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.primary,
      textAlign: 'center',
    },

    wordsContainer: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tokens.spacing.sm,
      justifyContent: isPlayful ? 'center' : 'flex-start',
    },

    wordButton: {
      minHeight: 44,
      minWidth: 44,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      borderWidth: 2,
      borderColor: identity.palette.primary,
      backgroundColor: identity.palette.surface,
    },

    wordButtonSelected: {
      backgroundColor: identity.palette.accent,
      borderColor: identity.palette.accent,
    },

    wordButtonCorrect: {
      backgroundColor: baseColors.green500,
      borderColor: baseColors.green600,
    },

    wordButtonIncorrect: {
      backgroundColor: baseColors.red500,
      borderColor: baseColors.red600,
    },

    wordText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.primary,
    },

    wordTextWhite: {
      color: baseColors.white,
    },

    correctionText: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.semibold,
      color: baseColors.white,
      marginTop: tokens.spacing.xs,
    },

    explanationBox: {
      marginHorizontal: tokens.spacing.xl,
      marginTop: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
      borderWidth: 2,
    },
  });

  return (
    <ScrollView style={baseStyles.container} contentContainerStyle={baseStyles.content}>
      <View style={baseStyles.card}>
        <View style={baseStyles.colorBar} />

        <View style={baseStyles.titleSection}>
          <Text style={baseStyles.titleIcon}>🔍</Text>
          <Text style={baseStyles.titleText}>Error Detective</Text>
        </View>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>Tap the word with an error:</Text>
        </View>

        <View style={styles.wordsContainer}>
          {words.map((word, index) => {
            const isSelected = selectedWord === index;
            const isError = index === errorIndex;
            const resultSuffix = showFeedback && isSelected ? (isCorrect ? ', bonne réponse' : ', mauvaise réponse') : '';

            const buttonStyle = [
              styles.wordButton,
              !showFeedback && isSelected && styles.wordButtonSelected,
              showFeedback && isError && styles.wordButtonCorrect,
              showFeedback && isSelected && !isCorrect && styles.wordButtonIncorrect,
            ];

            const textStyle = [
              styles.wordText,
              (showFeedback && (isError || (isSelected && !isCorrect))) && styles.wordTextWhite,
            ];

            return (
              <TouchableOpacity
                key={`${word}-${index}`}
                onPress={() => handleWordPress(index)}
                style={buttonStyle}
                disabled={isValidated}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityLabel={`${word}${resultSuffix}`}
                accessibilityState={{ selected: isSelected, disabled: isValidated }}
              >
                <Text style={textStyle}>{word}</Text>
                {showFeedback && isError && !!question.correctWord && (
                  <Text style={styles.correctionText}>→ {question.correctWord}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {showFeedback && (
          <View
            style={[
              styles.explanationBox,
              {
                borderColor: isCorrect ? baseColors.green500 : baseColors.orange500,
                backgroundColor: isCorrect ? baseColors.green50 : baseColors.orange50,
              },
            ]}
          >
            <Text
              style={[
                styles.instructionText,
                {
                  color: isCorrect ? baseColors.green800 : baseColors.orange800,
                },
              ]}
            >
              💡 {question.explanation}
            </Text>
          </View>
        )}
      </View>

      <ExerciseValidation
        state={validationState}
        attemptCount={attemptCount}
        maxAttempts={maxAttempts}
        correctAnswer={words[errorIndex]}
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

export default DetectiveCard;
