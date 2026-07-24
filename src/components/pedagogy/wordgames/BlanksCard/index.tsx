import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import { useTheme } from '@/themes/ThemeContext';
import { useExerciseValidationState } from '@/hooks/exercises/useExerciceValidationState';
import useWordGameFeedback from '@/screens/WordGames/hooks/useWordGameFeedback';
import { createWordGameStyles } from '../shared/commonWordGameStyles';
import type { BlanksQuestion } from '@/screens/WordGames/schema';

export interface BlanksCardProps {
  question: BlanksQuestion;
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

const BlanksCard: React.FC<BlanksCardProps> = ({
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
  const styles = useMemo(() => createWordGameStyles(identity), [identity]);

  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!selectedOption
  );

  const feedbackMessage = useWordGameFeedback(isValidated, isCorrect, attemptCount, maxAttempts);

  const showFeedback = isValidated && (isCorrect || canSkip);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.colorBar} />

        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>✏️</Text>
          <Text style={styles.titleText}>Complete the sentence</Text>
        </View>

        <View style={styles.contentBox}>
          <Text style={styles.contentText}>{question.sentence}</Text>
          {question.hint && (
            <Text style={[styles.contentText, { marginTop: 8, fontStyle: 'italic' }]}>
              💡 {question.hint}
            </Text>
          )}
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === question.correctAnswer;

            const buttonStyle = [
              styles.optionButton,
              showFeedback && isCorrectOption && styles.optionButtonCorrect,
              showFeedback && isSelected && !isCorrect && styles.optionButtonIncorrect,
              !showFeedback && isSelected && styles.optionButtonSelected,
            ];

            const textStyle = [
              styles.optionText,
              (showFeedback && (isCorrectOption || (isSelected && !isCorrect))) &&
                styles.optionTextWhite,
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

export default BlanksCard;
