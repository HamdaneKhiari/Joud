/**
 * ============================================
 * DETECTIVE CARD (White Label)
 * Jeu : Trouver l'erreur dans une phrase
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
import { baseColors } from '@/themes/colors';

// Styles
import { createWordGameStyles } from '../shared/commonWordGameStyles';

// Types
import type { DetectiveQuestion } from '@/screens/WordGames/schema';

// ============================================
// TYPES
// ============================================

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

// ============================================
// COMPOSANT
// ============================================

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

  // Hook de validation
  const { canSkip, validationState, buttonDisabled } = useExerciseValidationState(
    isValidated,
    isCorrect,
    attemptCount,
    maxAttempts,
    selectedWord !== null && selectedWord !== undefined
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

  const words = question.sentence.split(' ');
  const errorIndex = question.errorWordIndex;

  // =================== HANDLERS ===================

  const handleWordPress = (wordIndex: number) => {
    if (!isValidated) {
      onAnswer(wordIndex);
    }
  };

  // =================== STYLES DYNAMIQUES ===================

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

  // =================== RENDU ===================

  return (
    <ScrollView style={baseStyles.container} contentContainerStyle={baseStyles.content}>
      {/* Card principale */}
      <View style={baseStyles.card}>
        {/* Barre couleur (white label) */}
        <View style={baseStyles.colorBar} />

        {/* Titre */}
        <View style={baseStyles.titleSection}>
          <Text style={baseStyles.titleIcon}>🔍</Text>
          <Text style={baseStyles.titleText}>Error Detective</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>Tap the word with an error:</Text>
        </View>

        {/* Mots cliquables */}
        <View style={styles.wordsContainer}>
          {words.map((word, index) => {
            const isSelected = selectedWord === index;
            const isError = index === errorIndex;

            // Style dynamique selon l'état
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
              >
                <Text style={textStyle}>{word}</Text>
                {showFeedback && isError && !!question.correctWord && (
                  <Text style={styles.correctionText}>→ {question.correctWord}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explication (après validation finale) */}
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

      {/* ExerciseValidation */}
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
