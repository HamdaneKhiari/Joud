import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import ExerciseValidation from '@/components/common/ExerciseValidation';
import { useTheme } from '@/themes/ThemeContext';
import { useExerciseValidationState } from '@/hooks/exercises/useExerciceValidationState';
import useWordGameFeedback from '@/screens/WordGames/hooks/useWordGameFeedback';

import { createWordGameStyles } from '../shared/commonWordGameStyles';
import type { DefinitionQuestion } from '@/screens/WordGames/schema';

export interface DefinitionCardProps {
  question: DefinitionQuestion;
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

const DefinitionCard: React.FC<DefinitionCardProps> = ({
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

  // Feedback affiché seulement si correct ou dernière tentative
  const showFeedback = isValidated && (isCorrect || canSkip);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.colorBar} />

        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>📖</Text>
          <Text style={styles.titleText}>What is this?</Text>
        </View>

        <View style={styles.contentBox}>
          <Text style={styles.contentText}>{question.definition}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === question.correctAnswer;
            const resultSuffix = showFeedback && isSelected ? (isCorrect ? ', bonne réponse' : ', mauvaise réponse') : '';

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
                accessibilityLabel={`${option}${resultSuffix}`}
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

export default DefinitionCard;
