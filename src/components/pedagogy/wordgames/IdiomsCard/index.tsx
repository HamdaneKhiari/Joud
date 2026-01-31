/**
 * ============================================
 * IDIOMS CARD (White Label)
 * Jeu : Comprendre le sens d'expressions idiomatiques
 * ============================================
 */

import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

// Composants
import ExerciseValidation from '@/components/common/ExerciseValidation';

// Hooks & Utils
import { useTheme } from '@/themes/ThemeContext';
import { useExerciseValidationState } from '@/hooks/exercises/useExerciceValidationState';
import { useFeedbackMessages, getFeedbackState } from '@/hooks/exercises/useFeedbackMessages';
import type { FeedbackData } from '@/hooks/exercises/useFeedbackMessages';
import { tokens } from '@/themes/tokens';

// Styles
import { createWordGameStyles } from '../shared/commonWordGameStyles';

// Types
import type { IdiomsQuestion } from '@/screens/WordGames/schema';

// ============================================
// TYPES
// ============================================

export interface IdiomsCardProps {
  question: IdiomsQuestion;
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

// ============================================
// COMPOSANT
// ============================================

const IdiomsCard: React.FC<IdiomsCardProps> = ({
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

  // Hook de validation
  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    !!selectedOption
  );

  // Hook White Label Feedback
  const { getFeedback } = useFeedbackMessages();
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackData | null>(null);

  // Charger le feedback depuis la DB selon l'état
  useEffect(() => {
    const loadFeedback = async () => {
      const feedbackState = getFeedbackState(isValidated, isCorrect, attemptCount, maxAttempts);
      if (feedbackState) {
        const feedback = await getFeedback('wordgames', feedbackState);
        setFeedbackMessage(feedback);
      } else {
        setFeedbackMessage(null);
      }
    };

    loadFeedback();
  }, [isValidated, isCorrect, attemptCount, maxAttempts, getFeedback]);

  const showFeedback = isValidated && (isCorrect || canSkip);
  const isPlayful = identity.ui.mood === 'playful';

  // =================== STYLES DYNAMIQUES ===================

  const styles = StyleSheet.create({
    idiomBox: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.lg,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
      borderWidth: 2,
      borderColor: identity.palette.primary,
      backgroundColor: identity.palette.background,
    },

    idiomText: {
      fontSize: isPlayful ? tokens.fontSize.xl : tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.black,
      color: identity.palette.primary,
      textAlign: 'center',
      marginBottom: tokens.spacing.sm,
    },

    contextText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.secondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },

    instructionBox: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      borderRadius: tokens.borderRadius.md,
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
  });

  return (
    <ScrollView style={baseStyles.container} contentContainerStyle={baseStyles.content}>
      {/* Card principale */}
      <View style={baseStyles.card}>
        {/* Barre couleur (white label) */}
        <View style={baseStyles.colorBar} />

        {/* Titre */}
        <View style={baseStyles.titleSection}>
          <Text style={baseStyles.titleIcon}>💬</Text>
          <Text style={baseStyles.titleText}>Idiom Master</Text>
        </View>

        {/* Idiome et contexte */}
        <View style={styles.idiomBox}>
          <Text style={styles.idiomText}>"{question.idiom}"</Text>
          <Text style={styles.contextText}>{question.example}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>What does it mean?</Text>
        </View>

        {/* Options */}
        <View style={baseStyles.optionsContainer}>
          {question.options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === question.correctAnswer;

            // Style dynamique selon l'état
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
              >
                <Text style={textStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ExerciseValidation */}
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

export default IdiomsCard;
