/**
 * ============================================
 * TRANSFORMER CARD (White Label)
 * Jeu : Choisir la bonne déclinaison d'un mot racine pour compléter une phrase
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
import type { TransformerQuestion } from '@/screens/WordGames/schema';

// ============================================
// TYPES
// ============================================

export interface TransformerCardProps {
  question: TransformerQuestion;
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

const TransformerCard: React.FC<TransformerCardProps> = ({
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

  const { getFeedback } = useFeedbackMessages();
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackData | null>(null);

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

  // Construit la phrase en remplaçant ___ par la réponse choisie ou un placeholder
  const buildSentenceDisplay = (): { before: string; blank: string; after: string } => {
    const parts = question.sentence.split('___');
    if (parts.length < 2) return { before: question.sentence, blank: '', after: '' };

    let blankDisplay = '___';
    if (selectedOption) blankDisplay = selectedOption;

    return { before: parts[0], blank: blankDisplay, after: parts[1] || '' };
  };

  const { before, blank, after } = buildSentenceDisplay();
  const hasSelection = !!selectedOption;

  // =================== STYLES DYNAMIQUES ===================

  const styles = StyleSheet.create({
    rootWordBox: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
      paddingHorizontal: tokens.spacing.xl,
      paddingVertical: tokens.spacing.lg,
      borderRadius: isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
      borderWidth: 3,
      borderColor: identity.palette.primary,
      backgroundColor: identity.palette.primary,
      alignItems: 'center',
    },
    rootWordLabel: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.onPrimary,
      opacity: 0.8,
      marginBottom: tokens.spacing.xs,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    rootWordText: {
      fontSize: tokens.fontSize.xxxl,
      fontWeight: tokens.fontWeight.black,
      color: identity.text.onPrimary,
      letterSpacing: 2,
    },
    sentenceBox: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.lg,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.lg,
      borderRadius: tokens.borderRadius.lg,
      backgroundColor: identity.palette.background,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing.xs,
    },
    sentenceText: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.primary,
    },
    blankText: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.black,
      color: hasSelection
        ? (showFeedback ? (isCorrect ? '#22c55e' : '#ef4444') : identity.palette.accent)
        : identity.palette.primary,
      borderBottomWidth: hasSelection ? 0 : 2,
      borderBottomColor: identity.palette.primary,
      paddingHorizontal: tokens.spacing.xs,
      minWidth: 60,
      textAlign: 'center',
    },
    hintBox: {
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: identity.palette.background,
    },
    hintText: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.tertiary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    translationText: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.tertiary,
      textAlign: 'center',
      marginHorizontal: tokens.spacing.xl,
      marginBottom: tokens.spacing.md,
      fontStyle: 'italic',
    },
  });

  // =================== RENDU ===================

  return (
    <ScrollView style={baseStyles.container} contentContainerStyle={baseStyles.content}>
      <View style={baseStyles.card}>
        <View style={baseStyles.colorBar} />

        {/* Titre */}
        <View style={baseStyles.titleSection}>
          <Text style={baseStyles.titleIcon}>🔄</Text>
          <Text style={baseStyles.titleText}>Word Transformer</Text>
        </View>

        {/* Mot racine en gros */}
        <View style={styles.rootWordBox}>
          <Text style={styles.rootWordLabel}>Root word</Text>
          <Text style={styles.rootWordText}>{question.rootWord.toUpperCase()}</Text>
        </View>

        {/* Phrase avec le trou dynamique */}
        <View style={styles.sentenceBox}>
          {!!before && <Text style={styles.sentenceText}>{before}</Text>}
          <Text style={styles.blankText}>{blank}</Text>
          {!!after && <Text style={styles.sentenceText}>{after}</Text>}
        </View>

        {/* Indice grammatical */}
        {!!question.hint && (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>💡 {question.hint}</Text>
          </View>
        )}

        {/* Traduction */}
        {!!question.translation && showFeedback && (
          <Text style={styles.translationText}>🇫🇷 {question.translation}</Text>
        )}

        {/* Options */}
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

export default TransformerCard;
