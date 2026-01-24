import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ExerciseValidation from '../../../exercise-common/ExerciseValidation';
import { useExerciseValidationState } from '../../../../hooks/useExerciseValidationState';
import { generateFeedbackMessage } from '../../../../utils/feedback';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';
import { LogicLinksCardProps } from '../types';

const LogicLinksCard: React.FC<LogicLinksCardProps> = ({
  question,
  selectedOption,
  isValidated,
  isCorrect,
  attemptCount = 0,
  maxAttempts = 2,
  onAnswer,
  onValidate,
  onRetry,
  onNext,
  isLastQuestion,
  color = '#3B82F6',
}) => {
  const { identity } = useTheme();

  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!selectedOption
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[
        styles.card, 
        { 
          borderTopColor: color,
          borderRadius: identity.ui.cardRadius || tokens.borderRadius.lg
        }
      ]}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>🔗</Text>
          <Text style={[styles.titleText, { color: identity.text.primary }]}>Choose the logical connector</Text>
        </View>

        <View style={[styles.sentenceBox, { borderColor: color }]}>
          <Text style={[styles.sentenceText, { color: identity.text.primary }]}>{question.sentence}</Text>
        </View>

        {question.translation && (
          <View style={styles.translationBox}>
            <Text style={[styles.translationText, { color: identity.text.secondary }]}>{question.translation}</Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === question.correctAnswer;
            const showFeedback = isValidated && (isCorrect || canSkip);

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  { borderColor: color },
                  showFeedback && isCorrectOption && styles.optionButtonCorrect,
                  showFeedback && isSelected && !isCorrect && styles.optionButtonIncorrect,
                  !showFeedback && isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => !isValidated && onAnswer(option)}
                disabled={isValidated}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: identity.text.primary },
                    (showFeedback && (isCorrectOption || (isSelected && !isCorrect))) &&
                      styles.optionTextWhite,
                  ]}
                >
                  {option}
                </Text>
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
        feedbackMessage={generateFeedbackMessage(
          isValidated,
          isCorrect,
          canSkip,
          question.correctAnswer,
          attemptCount,
          maxAttempts
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: tokens.layout.screenPadding,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: tokens.layout.cardPadding,
    ...tokens.shadows.md,
    borderTopWidth: tokens.borderWidth.thick,
    marginBottom: tokens.layout.sectionGap,
  },
  colorBar: {
    height: 4,
    width: 40,
    borderRadius: tokens.borderRadius.round,
    marginBottom: tokens.spacing.lg,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.layout.sectionGap,
  },
  titleIcon: {
    fontSize: tokens.fontSize.xl,
  },
  titleText: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.semibold,
    flex: 1,
  },
  sentenceBox: {
    padding: tokens.spacing.xl,
    borderWidth: 2,
    borderRadius: tokens.borderRadius.md,
    marginBottom: tokens.layout.sectionGap,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderStyle: 'dashed',
  },
  sentenceText: {
    fontSize: tokens.fontSize.xl,
    fontWeight: tokens.fontWeight.medium,
    textAlign: 'center',
  },
  translationBox: {
    marginTop: -tokens.spacing.md,
    marginBottom: tokens.layout.sectionGap,
    alignItems: 'center',
  },
  translationText: {
    fontSize: tokens.fontSize.sm,
    fontStyle: 'italic',
    opacity: tokens.opacity.subtle,
  },
  optionsContainer: {
    gap: tokens.spacing.md,
  },
  optionButton: {
    padding: tokens.spacing.lg,
    borderWidth: 1,
    borderRadius: tokens.borderRadius.md,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.sm,
  },
  optionButtonSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionButtonCorrect: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  optionButtonIncorrect: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  optionText: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.medium,
  },
  optionTextWhite: {
    color: '#FFFFFF',
    fontWeight: tokens.fontWeight.bold,
  },
});

export default LogicLinksCard;
